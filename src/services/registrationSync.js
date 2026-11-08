import * as Crypto from "expo-crypto";

import { supabase } from "../lib/supabase";

import {
  construirFormularioBackend,
  guardarFormularioRequest,
} from "./backend/formularioApi";

import {
  addJob,
  getJob,
  getJobs,
  updateJob,
  removeJob,
} from "./offline/queue";

import {
  persistPendingPhotos,
  attachPendingPhotos,
  discardPendingPhotos,
} from "./meliponarioPhotos";

import {
  readPendingRegistrationPhotos,
} from "./pendingRegistrationPhotos";


const inFlight = new Set();

let syncAllPromise = null;


/* ===========================================
   MENSAJES DE ERROR
=========================================== */

export function getRegistrationErrorMessage(error) {
  const message = String(
    error?.message ||
    "No se pudo guardar el borrador."
  );

  if (
    message
      .toLowerCase()
      .includes("localidad fuera de cobertura")
  ) {
    return (
      "Esta localidad no pertenece a una zona " +
      "territorial activa. Regresa al Paso 2."
    );
  }

  return message;
}


/* ===========================================
   USUARIO
=========================================== */

async function currentSessionUser() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) throw error;

  if (!data?.session?.user) {
    throw new Error(
      "Inicia sesión para guardar borradores."
    );
  }

  return data.session.user;
}


/* ===========================================
   LISTAR PENDIENTES LOCALES
=========================================== */

export async function getPendingRegistrations() {
  const { data } =
    await supabase.auth.getSession();

  const userId = data?.session?.user?.id;

  if (!userId) {
    return [];
  }

  const jobs = await getJobs();

  return jobs.filter(
    (job) =>
      job.type ===
        "meliponario-registration" &&
      job.userId === userId &&
      ![
        "synced",
        "cancelled",
        "editing",
      ].includes(job.status)
  );
}


/* ===========================================
   RECUPERAR BORRADOR LOCAL
=========================================== */

export async function getPendingRegistrationDraft(
  jobId
) {
  const user = await currentSessionUser();

  const job = await getJob(jobId);

  if (!job || job.userId !== user.id) {
    throw new Error(
      "No existe ese borrador para tu cuenta."
    );
  }

  if (
    job.serverMeliponarioId ||
    job.stage !== "not_started" ||
    ![
      "pending",
      "needs_action",
    ].includes(job.status)
  ) {
    throw new Error(
      "Este borrador inició su sincronización. Consulta su estado antes de editarlo."
    );
  }

  const imagenes =
    await readPendingRegistrationPhotos(
      jobId
    );

  return {
    ...job.draft,

    imagenes,

    localJobId: job.id,

    meliponarioId: null,
  };
}


/* ===========================================
   GUARDAR BORRADOR EN COLA
=========================================== */

export async function enqueueMeliponarioRegistration(
  draft
) {
  const user = await currentSessionUser();

  // Validación de los datos completos.
  construirFormularioBackend(draft);

  const oldJobId = draft.localJobId || null;

  let oldJob = null;

  if (oldJobId) {
    oldJob = await getJob(oldJobId);

    if (
      !oldJob ||
      oldJob.userId !== user.id ||
      inFlight.has(oldJobId) ||
      oldJob.serverMeliponarioId ||
      oldJob.stage !== "not_started" ||
      ![
        "pending",
        "needs_action",
      ].includes(oldJob.status)
    ) {
      throw new Error(
        "Este borrador local ya empezó a sincronizarse o no puedes modificarlo."
      );
    }

    await updateJob(oldJobId, {
      status: "editing",
    });
  }

  const existingId =
    draft.meliponarioId ?? null;

  if (existingId) {
    const others =
      await getPendingRegistrations();

    const alreadyQueued = others.some(
      (job) =>
        String(
          job.serverMeliponarioId ?? ""
        ) === String(existingId)
    );

    if (alreadyQueued) {
      if (oldJob) {
        await updateJob(oldJob.id, {
          status: oldJob.status,
        });
      }

      throw new Error(
        "Ya hay cambios de este meliponario pendientes de sincronizar."
      );
    }
  }

  const id = Crypto.randomUUID();

  const now = new Date().toISOString();

  try {
    const descriptors =
      await persistPendingPhotos(
        id,
        draft.imagenes ?? []
      );

    const job = {
      id,

      type: "meliponario-registration",

      intent: "save_draft",

      status: "pending",

      stage: "not_started",

      userId: user.id,

      serverMeliponarioId: existingId,

      draft: {
        ...draft,
        localJobId: null,
        imagenes: descriptors,
      },

      attempts: 0,
      lastError: null,

      createdAt: now,
      updatedAt: now,
    };

    await addJob(job);

    if (oldJob) {
      await removeJob(oldJob.id);

      await discardPendingPhotos(
        oldJob.id
      ).catch(console.warn);
    }

    return job;
  } catch (error) {
    await discardPendingPhotos(id)
      .catch(() => {});

    if (oldJob) {
      await updateJob(oldJob.id, {
        status: oldJob.status,
      }).catch(() => {});
    }

    throw error;
  }
}


/* ===========================================
   DESCARTAR BORRADOR LOCAL
=========================================== */

export async function discardRegistrationJob(
  jobId
) {
  const user = await currentSessionUser();

  if (inFlight.has(jobId)) {
    throw new Error(
      "La tarea se está sincronizando."
    );
  }

  const job = await getJob(jobId);

  if (!job || job.userId !== user.id) {
    throw new Error(
      "No se encontró el borrador de tu cuenta."
    );
  }

  if (
    job.serverMeliponarioId ||
    job.stage !== "not_started" ||
    ![
      "pending",
      "needs_action",
    ].includes(job.status)
  ) {
    throw new Error(
      "No se puede descartar: la creación ya pudo llegar al servidor."
    );
  }

  await updateJob(jobId, {
    status: "cancelled",
  });

  await removeJob(jobId);

  await discardPendingPhotos(jobId);
}


/* ===========================================
   SINCRONIZAR UN BORRADOR
=========================================== */

export async function syncRegistrationJob(
  jobId
) {
  if (inFlight.has(jobId)) {
    return {
      synced: false,
      busy: true,
    };
  }

  inFlight.add(jobId);

  try {
    let job = await getJob(jobId);

    if (!job) {
      return {
        synced: true,
        alreadyRemoved: true,
      };
    }

    // Evita sincronizar automáticamente
    // tareas de versiones anteriores.
    if (job.intent !== "save_draft") {
      await updateJob(jobId, {
        status: "needs_action",

        lastError:
          "Tarea de una versión anterior: revisar manualmente antes de continuar.",
      });

      return {
        synced: false,
        needsAction: true,
        message:
          "Tarea anterior: necesita revisión manual.",
      };
    }

    if (
      [
        "needs_action",
        "cancelled",
        "editing",
      ].includes(job.status)
    ) {
      return {
        synced: false,
        needsAction: true,
        message: job.lastError,
      };
    }

    // No repetir una creación si pudo
    // ejecutarse sin recibir respuesta.
    if (
      !job.serverMeliponarioId &&
      job.stage === "create_started"
    ) {
      await updateJob(jobId, {
        status: "needs_action",

        lastError:
          "No se confirmó la creación en Supabase. Verifica Mis registros antes de reintentar.",
      });

      return {
        synced: false,
        needsAction: true,
      };
    }

    const { data, error } =
      await supabase.auth.getUser();

    if (error) throw error;

    if (
      !data?.user ||
      data.user.id !== job.userId
    ) {
      return {
        synced: false,
        message: "Pertenece a otra cuenta.",
      };
    }

    let serverId =
      job.serverMeliponarioId;

    if (job.status !== "photos_pending") {
      job = await updateJob(jobId, {
        status: "syncing",

        stage: serverId
          ? "update_started"
          : "create_started",

        attempts:
          Number(job.attempts ?? 0) + 1,

        lastError: null,
      });

      // Solo guarda o actualiza.
      // NO envía a revisión.
      serverId = await guardarFormularioRequest(
        job.draft,
        serverId ?? null
      );

      if (
        !serverId ||
        typeof serverId !== "string"
      ) {
        throw new Error(
          "La RPC no devolvió el identificador del borrador."
        );
      }

      job = await updateJob(jobId, {
        serverMeliponarioId: serverId,

        status: "photos_pending",

        stage: "saved",
      });
    }

    if (!serverId) {
      throw new Error(
        "El borrador no tiene identificador de Supabase."
      );
    }

    await attachPendingPhotos(
      job.id,
      serverId
    );

    await removeJob(job.id);

    return {
      synced: true,
      meliponarioId: serverId,
      estado: "borrador",
    };
  } catch (error) {
    const job = await getJob(jobId);

    if (job) {
      const definiteRejection = [
        "22023",
        "42501",
      ].includes(error?.code);

      const ambiguousCreate =
        !job.serverMeliponarioId &&
        job.stage === "create_started" &&
        !definiteRejection;

      const needsAction =
        ambiguousCreate || definiteRejection;

      await updateJob(jobId, {
        status: needsAction
          ? "needs_action"
          : job.status === "photos_pending"
            ? "photos_pending"
            : "pending",

        // Ante un rechazo SQL confirmado,
        // se puede volver a corregir el borrador.
        stage:
          definiteRejection &&
          job.stage === "create_started"
            ? "not_started"
            : job.stage,

        lastError:
          getRegistrationErrorMessage(error),
      });
    }

    return {
      synced: false,

      needsAction:
        ["22023", "42501"].includes(error?.code) ||
        (
          job?.stage === "create_started" &&
          !job?.serverMeliponarioId
        ),

      error,

      message:
        getRegistrationErrorMessage(error),
    };
  } finally {
    inFlight.delete(jobId);
  }
}


/* ===========================================
   SINCRONIZAR TODOS LOS PENDIENTES
=========================================== */

export async function syncPendingRegistrations() {
  if (syncAllPromise) {
    return syncAllPromise;
  }

  syncAllPromise = (async () => {
    const jobs =
      await getPendingRegistrations();

    const pending = jobs.filter(
      (job) =>
        [
          "pending",
          "syncing",
          "saved",
          "photos_pending",
        ].includes(job.status) &&
        job.intent === "save_draft"
    );

    const results = [];

    for (const job of pending) {
      results.push({
        jobId: job.id,

        ...(await syncRegistrationJob(
          job.id
        )),
      });
    }

    return results;
  })();

  try {
    return await syncAllPromise;
  } finally {
    syncAllPromise = null;
  }
}
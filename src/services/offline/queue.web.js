import localforage from "localforage";


const KEY =
  "@kaabmap:registration-jobs:v3";

const store =
  localforage.createInstance({
    name: "KaabMap",
    storeName: "registration_jobs",
  });


export async function getJobs() {
  const data =
    await store.getItem(KEY);

  return Array.isArray(data)
    ? data
    : [];
}


export async function getJob(id) {
  const jobs = await getJobs();

  return (
    jobs.find((job) => job.id === id) ??
    null
  );
}


export async function addJob(job) {
  const jobs = await getJobs();

  if (
    jobs.some(
      (item) => item.id === job.id
    )
  ) {
    throw new Error(
      "La tarea ya existe."
    );
  }

  await store.setItem(
    KEY,
    [
      ...jobs,
      job,
    ]
  );

  return job;
}


export async function updateJob(
  id,
  patch
) {
  const jobs = await getJobs();

  const index =
    jobs.findIndex(
      (job) => job.id === id
    );

  if (index < 0) {
    throw new Error(
      "La tarea de sincronización no existe."
    );
  }

  const updated = {
    ...jobs[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  jobs[index] = updated;

  await store.setItem(
    KEY,
    jobs
  );

  return updated;
}


export async function removeJob(id) {
  const jobs = await getJobs();

  await store.setItem(
    KEY,
    jobs.filter(
      (job) => job.id !== id
    )
  );
}
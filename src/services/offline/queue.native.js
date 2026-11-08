import AsyncStorage
  from "@react-native-async-storage/async-storage";


const KEY =
  "@kaabmap:registration-jobs:v3";


export async function getJobs() {
  const raw =
    await AsyncStorage.getItem(KEY);

  if (!raw) {
    return [];
  }

  const data = JSON.parse(raw);

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

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify([
      ...jobs,
      job,
    ])
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

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(jobs)
  );

  return updated;
}


export async function removeJob(id) {
  const jobs = await getJobs();

  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(
      jobs.filter(
        (job) => job.id !== id
      )
    )
  );
}
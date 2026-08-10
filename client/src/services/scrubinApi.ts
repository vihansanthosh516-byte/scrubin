export interface Job {
  job_id: string;
  run_id: string;
  status: string;
}

export interface Worker {
  worker_id: string;
  status: string;
}

export async function getJobs(): Promise<Job[]> {
  try {
    const res = await fetch("/api/ops/jobs");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getWorkers(): Promise<Worker[]> {
  try {
    const res = await fetch("/api/ops/workers");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getQueue(): Promise<Job[]> {
  try {
    const res = await fetch("/api/ops/queue");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

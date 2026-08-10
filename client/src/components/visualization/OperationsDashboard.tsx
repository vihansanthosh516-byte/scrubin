import React, { useEffect, useState } from "react";
import { getJobs, getWorkers, getQueue } from "../../services/scrubinApi";

export default function OperationsDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  const loadAll = async () => {
    const [j, w, q] = await Promise.all([getJobs(), getWorkers(), getQueue()]);
    setJobs(j);
    setWorkers(w);
    setQueue(q);
  };

  useEffect(() => {
    loadAll();
    const iv = setInterval(loadAll, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <h1 className="text-2xl font-bold mb-4">Operations Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Queue (depth: {queue.length})</h2>
        <ul className="list-disc list-inside text-sm">
          {queue.map((j) => (
            <li key={j.job_id}>Job {j.job_id} (run {j.run_id})</li>
          ))}
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Workers</h2>
        <table className="w-full text-sm border border-[#3A342C]">
          <thead className="bg-[#26211B]">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Current Job</th>
              <th className="p-2">Completed</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.worker_id} className="border-t border-[#3A342C]">
                <td className="p-2">{w.worker_id}</td>
                <td className="p-2">{w.status}</td>
                <td className="p-2">{w.current_job_id || "-"}</td>
                <td className="p-2">{w.jobs_completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Jobs</h2>
        <table className="w-full text-sm border border-[#3A342C]">
          <thead className="bg-[#26211B]">
            <tr>
              <th className="p-2">Job ID</th>
              <th className="p-2">Run ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.job_id} className="border-t border-[#3A342C]">
                <td className="p-2">{j.job_id}</td>
                <td className="p-2">{j.run_id}</td>
                <td className="p-2">{j.status}</td>
                <td className="p-2">{new Date(j.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { listSavedSimulations, deleteSimulation } from "../lib/saveSimulation";
import { Button } from "../components/ui/button";
import { useLocation } from "wouter";

export const SaveResumeUI: React.FC = () => {
  const [sims, setSims] = useState<any[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setSims(listSavedSimulations());
  }, []);

  const handleResume = (id: string) => {
    // Load saved state from localStorage and navigate to simulation page with query param
    setLocation(`/simulation?resume=${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSimulation(id);
    setSims(listSavedSimulations());
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Saved Simulations</h2>
      {sims.length === 0 && <p>No saved simulations.</p>}
      <ul className="space-y-2">
        {sims.map((s) => (
          <li
            key={s.id}
            className="p-2 border rounded cursor-pointer hover:bg-[#26211B] flex justify-between items-center"
            onClick={() => handleResume(s.id)}
          >
            <span>{new Date(s.savedAt).toLocaleString()}</span>
            <Button
              size="sm"
              onClick={(e) => handleDelete(e, s.id)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

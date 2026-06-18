import React from "react";
import { useSimulationStore } from "../state/simulationStore";
import { Eye, Target, Map, Scissors, Layers } from "lucide-react";

export default function SurgicalFieldPanel() {
  const { currentState } = useSimulationStore();

  const anatomy = currentState?.anatomy;

  if (!anatomy) {
    return (
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col items-center justify-center text-center h-48">
        <Eye className="w-8 h-8 text-neutral-600 mb-3 animate-pulse" />
        <p className="text-neutral-500 text-sm">Waiting for surgical field...</p>
      </div>
    );
  }

  // Anatomy state mapping based on constraints.
  // We use fallback keys in case backend uses slightly different naming for these concepts.
  const region = anatomy.region || anatomy.surgical_region || "Unknown Region";
  const activeTissue = anatomy.active_tissue || anatomy.current_structure || "None";
  const operativeStep = anatomy.operative_step || anatomy.current_action || "Pending";
  const visibleStructures = anatomy.visible_structures || anatomy.structures || [];
  const activeInstruments = anatomy.active_instruments || anatomy.instruments || [];
  const highlightedTarget = anatomy.highlighted_target || anatomy.target_anatomy || "None";
  const proceduralFocus = anatomy.procedural_focus || anatomy.exposure_status || "Standard";

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-5 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Map className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Surgical Field</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-black/40 rounded-xl border border-neutral-800/50 flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Surgical Region</span>
          <span className="text-sm font-bold text-neutral-200 truncate" title={region}>{region}</span>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-neutral-800/50 flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Current Structure</span>
          <span className="text-sm font-bold text-neutral-200 truncate" title={activeTissue}>{activeTissue}</span>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-neutral-800/50 flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Current Action</span>
          <span className="text-sm font-bold text-neutral-200 truncate" title={operativeStep}>{operativeStep}</span>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-neutral-800/50 flex flex-col">
          <span className="text-[9px] text-neutral-500 uppercase mb-1">Exposure Status</span>
          <span className="text-sm font-bold text-neutral-200 truncate" title={proceduralFocus}>{proceduralFocus}</span>
        </div>
      </div>

      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex flex-col">
        <span className="text-[9px] text-indigo-400 uppercase mb-1 flex items-center gap-1">
          <Target className="w-3 h-3" /> Target Anatomy
        </span>
        <span className="text-sm font-bold text-indigo-300">{highlightedTarget}</span>
      </div>

      {visibleStructures.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3" /> Visible Structures
          </span>
          <div className="flex flex-wrap gap-1.5">
            {visibleStructures.map((structure: string, i: number) => {
              // Highlight if structure matches target or active tissue
              const isTarget = structure.toLowerCase() === highlightedTarget.toLowerCase() || structure.toLowerCase() === activeTissue.toLowerCase();
              return (
                <span key={i} className={`px-2 py-1 rounded text-xs font-medium border ${isTarget ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' : 'bg-neutral-800 border-neutral-700 text-neutral-300'}`}>
                  {structure}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {activeInstruments.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
            <Scissors className="w-3 h-3" /> Instruments In Use
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeInstruments.map((instrument: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-xs font-medium">
                {instrument}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useSimulationStore } from "../state/simulationStore";
import { Eye, Target, Map, Scissors, Layers } from "lucide-react";

export default function SurgicalFieldPanel() {
  const { currentState } = useSimulationStore();

  const anatomy = currentState?.anatomy;

  if (!anatomy) {
    return (
      <div className="p-6 glass-card rounded-sm flex flex-col items-center justify-center text-center h-48">
        <Eye className="w-8 h-8 text-[#8C827A] dark:text-[#C2BBB0] mb-3 animate-pulse" />
        <p className="text-[#8C827A] dark:text-[#C2BBB0] text-sm">Waiting for surgical field...</p>
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
    <div className="p-6 glass-card rounded-sm space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Map className="w-5 h-5 text-[#CC553D]" />
        <h3 className="text-xs font-bold text-[#8C827A] dark:text-[#C2BBB0] uppercase tracking-widest">Surgical Field</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] flex flex-col dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Surgical Region</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]" title={region}>{region}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] flex flex-col dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Current Structure</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]" title={activeTissue}>{activeTissue}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] flex flex-col dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Current Action</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]" title={operativeStep}>{operativeStep}</span>
        </div>
        <div className="p-3 bg-[#F4F0E8] rounded-sm border border-[#E2DDD1] flex flex-col dark:bg-[#26211B] dark:border-[#3A342C]">
          <span className="text-[9px] text-[#8C827A] dark:text-[#C2BBB0] uppercase mb-1">Exposure Status</span>
          <span className="text-sm font-bold text-[#191919] truncate dark:text-[#EDEAE4]" title={proceduralFocus}>{proceduralFocus}</span>
        </div>
      </div>

      <div className="p-3 bg-[#CC553D]/8 rounded-sm border border-[#CC553D]/30 flex flex-col">
        <span className="text-[9px] text-[#CC553D] uppercase mb-1 flex items-center gap-1">
          <Target className="w-3 h-3" /> Target Anatomy
        </span>
        <span className="text-sm font-bold text-[#CC553D]">{highlightedTarget}</span>
      </div>

      {visibleStructures.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-[#8C827A] dark:text-[#C2BBB0] uppercase flex items-center gap-1">
            <Layers className="w-3 h-3" /> Visible Structures
          </span>
          <div className="flex flex-wrap gap-1.5">
            {visibleStructures.map((structure: string, i: number) => {
              // Highlight if structure matches target or active tissue
              const isTarget = structure.toLowerCase() === highlightedTarget.toLowerCase() || structure.toLowerCase() === activeTissue.toLowerCase();
              return (
                <span key={i} className={`px-2 py-1 rounded-sm text-xs font-medium border ${isTarget ? 'bg-[#CC553D]/10 border-[#CC553D]/40 text-[#CC553D]' : 'bg-[#F4F0E8] border-[#E2DDD1] text-[#666059] dark:text-[#C2BBB0] dark:bg-[#26211B] dark:border-[#3A342C] dark:text-[#A89F95]'}`}>
                  {structure}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {activeInstruments.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] text-[#8C827A] dark:text-[#C2BBB0] uppercase flex items-center gap-1">
            <Scissors className="w-3 h-3" /> Instruments In Use
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeInstruments.map((instrument: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-[#2E6B4B]/8 border border-[#2E6B4B]/25 text-[#2E6B4B] rounded-sm text-xs font-medium dark:bg-[#2E6B4B]/15 dark:text-[#8FBF9A] dark:border-[#2E6B4B]/40">
                {instrument}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

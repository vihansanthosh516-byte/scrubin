import React from "react";
import CognitionGraph from "./CognitionGraph";
import { useSimulationStore } from "../state/simulationStore";

export default function CognitionPanel() {
  const { cognition } = useSimulationStore();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <details className="mb-4 rounded-sm border border-[#3A342C] bg-[#26211B]">
      <summary className="cursor-pointer px-4 py-2 font-medium text-[#191919] dark:text-[#EDEAE4] hover:bg-[#332C24]">
        {title}
      </summary>
      <div className="p-4 text-sm text-[#666059] dark:text-[#A89F95]">{children}</div>
    </details>
  );

  return (
    <div className="mt-6 space-y-4">
      {/* Executive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Executive Goal</div>
          <div className="text-lg font-semibold text-white">{cognition.executiveGoal ?? "-"}</div>
        </div>
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Selected Strategy</div>
          <div className="text-lg font-semibold text-white">{cognition.strategy ?? "-"}</div>
        </div>
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Policy Decision</div>
          <div className="text-lg font-semibold text-white">{cognition.policyDecision ?? "-"}</div>
        </div>
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Prediction Horizon</div>
          <div className="text-lg font-semibold text-white">{cognition.predictionHorizon ?? "-"}</div>
        </div>
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Adaptation Confidence</div>
          <div className="text-lg font-semibold text-white">{cognition.adaptationBias ?? "-"}</div>
        </div>
        <div className="p-4 bg-[#1E1A16] rounded-sm border border-[#3A342C]">
          <div className="text-xs text-[#666059] dark:text-[#A89F95] uppercase mb-1">Optimization Score</div>
          <div className="text-lg font-semibold text-white">{cognition.optimizationScore !== undefined ? cognition.optimizationScore : "-"}</div>
        </div>
      </div>

      <Section title="Cognition Graph">
        <CognitionGraph />
      </Section>
    </div>
  );
}

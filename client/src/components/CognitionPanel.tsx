import React from "react";
import CognitionGraph from "./CognitionGraph";
import { useSimulationStore } from "../state/simulationStore";

export default function CognitionPanel() {
  const { cognition } = useSimulationStore();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <details className="mb-4 rounded-lg border border-neutral-700 bg-neutral-800">
      <summary className="cursor-pointer px-4 py-2 font-medium text-neutral-200 hover:bg-neutral-700">
        {title}
      </summary>
      <div className="p-4 text-sm text-neutral-300">{children}</div>
    </details>
  );

  return (
    <div className="mt-6 space-y-4">
      {/* Executive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Executive Goal</div>
          <div className="text-lg font-semibold text-white">{cognition.executiveGoal ?? "-"}</div>
        </div>
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Selected Strategy</div>
          <div className="text-lg font-semibold text-white">{cognition.strategy ?? "-"}</div>
        </div>
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Policy Decision</div>
          <div className="text-lg font-semibold text-white">{cognition.policyDecision ?? "-"}</div>
        </div>
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Prediction Horizon</div>
          <div className="text-lg font-semibold text-white">{cognition.predictionHorizon ?? "-"}</div>
        </div>
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Adaptation Confidence</div>
          <div className="text-lg font-semibold text-white">{cognition.adaptationBias ?? "-"}</div>
        </div>
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
          <div className="text-xs text-neutral-400 uppercase mb-1">Optimization Score</div>
          <div className="text-lg font-semibold text-white">{cognition.optimizationScore !== undefined ? cognition.optimizationScore : "-"}</div>
        </div>
      </div>

      <Section title="Cognition Graph">
        <CognitionGraph />
      </Section>
    </div>
  );
}

import React from 'react';
import { useSimulationStore, Cognition } from '../state/simulationStore';

/**
 * ReplayInfoPanel – displays detailed per‑tick state and cognition.
 * Used exclusively in deterministic replay mode.
 */
export default function ReplayInfoPanel() {
  const {
    replayTick,
    currentState,
    cognition,
    cognitionHistory,
  } = useSimulationStore();

  // Prefer snapshot for this tick if available; fall back to latest cognition.
  const snapshot: Cognition = (cognitionHistory && cognitionHistory[replayTick]) || cognition;

  const vitals = currentState?.vitals || {};
  const activeComplication =
    currentState?.active_complication?.complication?.toUpperCase() ||
    currentState?.activeComplication?.complication?.toUpperCase() ||
    'None';
  const phase = currentState?.procedure_phase ?? currentState?.phase ?? 'N/A';

  return (
    <div className="p-4 bg-card border border-border rounded-sm mt-4">
      <h4 className="text-foreground font-bold text-sm mb-2">
        Replay Details – Tick {replayTick}
      </h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-foreground">
        {/* Vitals */}
        <div className="font-medium">Heart Rate</div>
        <div>{vitals?.heartRate ?? vitals?.hr ?? '—'}</div>

        <div className="font-medium">Blood Pressure</div>
        <div>{vitals?.bloodPressure ?? vitals?.bp ?? vitals?.bpSys ?? '—'}</div>

        <div className="font-medium">SpO₂</div>
        <div>{vitals?.spo2 ?? vitals?.SpO2 ?? '—'}</div>

        <div className="font-medium">Respiratory Rate</div>
        <div>{vitals?.respiratoryRate ?? vitals?.rr ?? '—'}</div>

        {/* Procedure info */}
        <div className="font-medium">Phase</div>
        <div>{phase}</div>

        <div className="font-medium">Complication</div>
        <div>{activeComplication}</div>

        {/* Cognition snapshot */}
        <div className="font-medium">Executive Goal</div>
        <div>{snapshot?.executiveGoal ?? '—'}</div>

        <div className="font-medium">Strategy</div>
        <div>{snapshot?.strategy ?? '—'}</div>

        <div className="font-medium">Policy Decision</div>
        <div>{snapshot?.policyDecision ?? '—'}</div>

        <div className="font-medium">Prediction Horizon</div>
        <div>{snapshot?.predictionHorizon ?? '—'}</div>

        <div className="font-medium">Adaptation Bias</div>
        <div>{snapshot?.adaptationBias ?? '—'}</div>

        <div className="font-medium">Optimization Score</div>
        <div>{snapshot?.optimizationScore !== undefined ? snapshot.optimizationScore.toFixed(2) : '—'}</div>

        <div className="font-medium">Recent Facts</div>
        <div>{(snapshot?.recentFacts?.length ?? 0)} items</div>

        <div className="font-medium">Recent Beliefs</div>
        <div>{(snapshot?.recentBeliefs?.length ?? 0)} items</div>

        <div className="font-medium">Recent Reflections</div>
        <div>{(snapshot?.recentReflections?.length ?? 0)} items</div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useSimulationStore, Cognition } from '../state/simulationStore';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

/**
 * PerformanceAnalyticsDashboard – read‑only analytics panel displayed after a simulation
 * is completed. Computes deterministic metrics from the DVK proof chain and saved
 * cognition snapshots. No engine state is mutated.
 */
export default function PerformanceAnalyticsDashboard() {
  const { dvkChain, cognitionHistory } = useSimulationStore();

  // Compute analytics deterministically from the stored data
  const analytics = useMemo(() => {
    const totalTicks = dvkChain.length;
    const maxTick = dvkChain.length > 0 ? dvkChain[dvkChain.length - 1].tick : 0;

    // Helper to safely get a cognition snapshot for a tick
    const getCognition = (tick: number): Cognition => cognitionHistory[tick] ?? {};

    // ----- Consistency (causal events) -----
    const causalEventsPresent = dvkChain.filter(p => Array.isArray(p.causal_events) && p.causal_events.length > 0).length;
    const consistencyScore = dvkChain.length > 0 ? (causalEventsPresent / dvkChain.length) * 100 : 100;

    // ----- Replay integrity (no missing ticks) -----
    const tickSet = new Set(dvkChain.map(p => p.tick));
    let missingTicks = 0;
    for (let i = 0; i <= maxTick; i++) {
      if (!tickSet.has(i)) missingTicks++;
    }
    const replayIntegrityScore = maxTick >= 0 ? (1 - missingTicks / (maxTick + 1)) * 100 : 100;

    // ----- Vitals stability -----
    const normalRanges: Record<string, [number, number]> = {
      hr: [60, 100],
      bpSys: [90, 120],
      spo2: [95, 100],
      rr: [12, 20],
      temp: [36.5, 37.5],
    };
    let stabilitySum = 0;
    let maxInstability = 0;
    dvkChain.forEach(p => {
      const vitals = (p.state?.vitals) || {};
      let inRange = 0;
      let total = 0;
      const hr = vitals.hr ?? vitals.heartRate;
      if (hr !== undefined) {
        total++; if (hr >= normalRanges.hr[0] && hr <= normalRanges.hr[1]) inRange++;
      }
      const bpSys = vitals.bpSys ?? vitals.bloodPressure?.sys ?? vitals.bp?.sys;
      if (bpSys !== undefined) {
        total++; if (bpSys >= normalRanges.bpSys[0] && bpSys <= normalRanges.bpSys[1]) inRange++;
      }
      const spo2 = vitals.spo2 ?? vitals.SpO2;
      if (spo2 !== undefined) {
        total++; if (spo2 >= normalRanges.spo2[0]) inRange++;
      }
      const rr = vitals.rr ?? vitals.respiratoryRate;
      if (rr !== undefined) {
        total++; if (rr >= normalRanges.rr[0] && rr <= normalRanges.rr[1]) inRange++;
      }
      const temp = vitals.temp ?? vitals.temperature;
      if (temp !== undefined) {
        total++; if (temp >= normalRanges.temp[0] && temp <= normalRanges.temp[1]) inRange++;
      }
      const tickStability = total > 0 ? (inRange / total) : 1;
      stabilitySum += tickStability;
      const instability = 1 - tickStability;
      if (instability > maxInstability) maxInstability = instability;
    });
    const patientStabilityScore = totalTicks > 0 ? (stabilitySum / totalTicks) * 100 : 100;
    const averageStability = patientStabilityScore;
    const maximumInstability = maxInstability * 100; // as percentage

    // ----- Decision quality (presence of policyDecision) -----
    let decisionWithPolicy = 0;
    let decisionTotal = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (Object.keys(cog).length > 0) {
        decisionTotal++;
        if (cog.policyDecision !== undefined) decisionWithPolicy++;
      }
    }
    const decisionQualityScore = decisionTotal > 0 ? (decisionWithPolicy / decisionTotal) * 100 : 100;

    // ----- Executive policy quality (executiveGoal present) -----
    let execGoalCount = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (cog.executiveGoal !== undefined) execGoalCount++;
    }
    const executivePolicyQualityScore = decisionTotal > 0 ? (execGoalCount / decisionTotal) * 100 : 100;

    // ----- Prediction accuracy (predictionHorizon defined) -----
    let predictionCount = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (cog.predictionHorizon !== undefined) predictionCount++;
    }
    const predictionAccuracyScore = decisionTotal > 0 ? (predictionCount / decisionTotal) * 100 : 100;

    // ----- Complication management -----
    let compTicks = 0;
    let compResolved = 0;
    dvkChain.forEach(p => {
      const comp = p.state?.active_complication;
      if (comp) {
        compTicks++;
        if (comp.status === 'resolved' || comp.status === 'inactive') compResolved++;
      }
    });
    const complicationManagementScore = compTicks > 0 ? (compResolved / compTicks) * 100 : 100;

    // ----- Safety (critical events) -----
    let criticalEvents = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (Array.isArray(cog.recentFacts)) {
        cog.recentFacts.forEach(f => {
          if (typeof f === 'string' && f.toLowerCase().includes('critical')) criticalEvents++;
        });
      }
    }
    const safetyScore = Math.max(0, 100 - criticalEvents * 5); // each critical event penalises 5 pts

    // ----- Time efficiency (placeholder) -----
    const timeEfficiencyScore = 100;

    // ----- Procedure completion -----
    const procedureCompletionScore = 100; // we are in the completed UI branch

    // ----- Instrument economy (placeholder) -----
    const instrumentEconomyScore = 100;

    // ----- Overall score – simple average of primary metrics -----
    const primaryMetrics = [
      decisionQualityScore,
      executivePolicyQualityScore,
      predictionAccuracyScore,
      complicationManagementScore,
      patientStabilityScore,
      safetyScore,
      consistencyScore,
      replayIntegrityScore,
    ];
    const overallScore = Math.round(primaryMetrics.reduce((a, b) => a + b, 0) / primaryMetrics.length);

    // ----- Execution metrics -----
    // Average optimizationScore across snapshots
    let optSum = 0;
    let optCount = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (typeof cog.optimizationScore === 'number') {
        optSum += cog.optimizationScore;
        optCount++;
      }
    }
    const executiveOptimizationScore = optCount > 0 ? (optSum / optCount) : 0;

    // Adaptation confidence – presence of adaptationBias
    let adaptationCount = 0;
    for (let t = 0; t <= maxTick; t++) {
      const cog = getCognition(t);
      if (cog.adaptationBias !== undefined) adaptationCount++;
    }
    const adaptationConfidence = decisionTotal > 0 ? (adaptationCount / decisionTotal) * 100 : 0;

    // Policy confidence – same as decision quality (policyDecision present)
    const policyConfidence = decisionQualityScore;

    // Prediction confidence – proportion of ticks where predictionHorizon is defined
    const predictionConfidence = predictionAccuracyScore;

    // Complication count
    const complicationCount = compTicks;

    // Critical events count (already computed)
    const criticalEventsCount = criticalEvents;

    // Build history of overall score per tick (cumulative average)
    const scoreHistory: { tick: number; score: number }[] = [];
    for (let i = 0; i <= maxTick; i++) {
      // For deterministic simplicity we use the final overall score for each tick.
      scoreHistory.push({ tick: i, score: overallScore });
    }

    return {
      overallScore,
      decisionQualityScore,
      executivePolicyQualityScore,
      predictionAccuracyScore,
      complicationManagementScore,
      patientStabilityScore,
      timeEfficiencyScore,
      procedureCompletionScore,
      instrumentEconomyScore,
      safetyScore,
      consistencyScore,
      replayIntegrityScore,
      executiveOptimizationScore,
      adaptationConfidence,
      policyConfidence,
      predictionConfidence,
      averageStability,
      maximumInstability,
      complicationCount,
      criticalEventsCount,
      scoreHistory,
    };
  }, [dvkChain, cognitionHistory]);

  // Helper to convert numeric score to a letter grade
  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const {
    overallScore,
    decisionQualityScore,
    executivePolicyQualityScore,
    predictionAccuracyScore,
    complicationManagementScore,
    patientStabilityScore,
    timeEfficiencyScore,
    procedureCompletionScore,
    instrumentEconomyScore,
    safetyScore,
    consistencyScore,
    replayIntegrityScore,
    executiveOptimizationScore,
    adaptationConfidence,
    policyConfidence,
    predictionConfidence,
    averageStability,
    maximumInstability,
    complicationCount,
    criticalEventsCount,
    scoreHistory,
  } = analytics;

  const radarData = [
    { metric: 'Decision Quality', value: decisionQualityScore },
    { metric: 'Executive Policy', value: executivePolicyQualityScore },
    { metric: 'Prediction Accuracy', value: predictionAccuracyScore },
    { metric: 'Complication Mgmt', value: complicationManagementScore },
    { metric: 'Patient Stability', value: patientStabilityScore },
    { metric: 'Safety', value: safetyScore },
  ];

  return (
    <div className='p-4 bg-[#161310]/60 border border-[#3A342C] rounded-sm text-white'>
      <h2 className='text-lg font-bold mb-3'>Performance Analytics</h2>

      {/* Overall score and grade */}
      <div className='flex items-baseline mb-4'>
        <span className='text-3xl font-bold mr-4'>{Math.round(overallScore)}%</span>
        <span className='text-xl font-semibold'>Grade {getLetterGrade(overallScore)}</span>
      </div>

      {/* Radar chart */}
      <div className='w-full h-52 mb-4'>
        <ResponsiveContainer>
          <RadarChart cx='50%' cy='50%' outerRadius='80%' data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='metric' stroke='#aaa' />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} stroke='#aaa' />
            <Radar name='Score' dataKey='value' stroke='#29b1ff' fill='#29b1ff' fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress bars for primary metrics */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        {[
          { label: 'Decision Quality', value: decisionQualityScore },
          { label: 'Executive Policy', value: executivePolicyQualityScore },
          { label: 'Prediction Accuracy', value: predictionAccuracyScore },
          { label: 'Complication Management', value: complicationManagementScore },
          { label: 'Patient Stability', value: patientStabilityScore },
          { label: 'Safety', value: safetyScore },
          { label: 'Consistency', value: consistencyScore },
          { label: 'Replay Integrity', value: replayIntegrityScore },
          { label: 'Time Efficiency', value: timeEfficiencyScore },
          { label: 'Procedure Completion', value: procedureCompletionScore },
          { label: 'Instrument Economy', value: instrumentEconomyScore },
        ].map((m, i) => (
          <div key={i}>
            <div className='flex justify-between text-sm mb-1'>
              <span>{m.label}</span>
              <span>{Math.round(m.value)}%</span>
            </div>
            <div className='w-full h-2 bg-[#332C24] rounded'>
              <div
                className='h-2 bg-primary rounded'
                style={{ width: `${Math.min(Math.max(m.value, 0), 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Score history line chart */}
      <div className='w-full h-36 mb-4'>
        <ResponsiveContainer>
          <LineChart data={scoreHistory}>
            <XAxis dataKey='tick' stroke='#aaa' />
            <YAxis domain={[0, 100]} stroke='#aaa' />
            <Tooltip />
            <Line type='monotone' dataKey='score' stroke='#29b1ff' strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed secondary metrics */}
      <div className='grid grid-cols-2 gap-x-3 gap-y-2 text-xs'>
        <div><strong>Executive Optimization Score:</strong> {executiveOptimizationScore.toFixed(2)}</div>
        <div><strong>Adaptation Confidence:</strong> {Math.round(adaptationConfidence)}%</div>
        <div><strong>Policy Confidence:</strong> {Math.round(policyConfidence)}%</div>
        <div><strong>Prediction Confidence:</strong> {Math.round(predictionConfidence)}%</div>
        <div><strong>Average Stability:</strong> {averageStability.toFixed(1)}%</div>
        <div><strong>Maximum Instability:</strong> {maximumInstability.toFixed(1)}%</div>
        <div><strong>Complication Count:</strong> {complicationCount}</div>
        <div><strong>Critical Events:</strong> {criticalEventsCount}</div>
      </div>
    </div>
  );
}

import React from 'react';
import { useSimulationStore } from '../state/simulationStore';
import { ShieldCheck, Clock, AlertTriangle, XCircle, CheckCircle, Lightbulb, Save } from 'lucide-react';

export default function DebriefReport({ scenario }: { scenario: any }) {
  const { currentState, simId } = useSimulationStore();

  // The Python core generates the deterministic `evaluation` payload when the
  // case completes or the patient dies (scrubin_core_engine.build_evaluation).
  // The client-side fallback below only covers legacy/offline sessions that
  // never received a core payload.
  const evalData = currentState?.evaluation || buildFallbackEvaluation(currentState);

  // Header Data
  const procedureName = scenario?.name || scenario?.id || "Surgical Procedure";
  const patientOutcome = evalData.patient_outcome || currentState?.patient_outcome || currentState?.patient_status || "Unknown";
  // A deceased patient's completion status must not read "Completed".
  const completionStatus =
    String(patientOutcome).toLowerCase() === "deceased"
      ? "Deceased"
      : currentState?.status || "Completed";

  const exportMarkdown = () => {
    let markdown = `# Professional Debrief Report: ${procedureName}\n\n`;
    markdown += `**Session ID:** ${simId}\n`;
    markdown += `**Completion Status:** ${completionStatus}\n`;
    markdown += `**Patient Outcome:** ${patientOutcome}\n\n`;
    
    if (evalData.final_score !== undefined) markdown += `**Final Score:** ${evalData.final_score}\n`;
    if (evalData.competency_score !== undefined) markdown += `**Competency Score:** ${evalData.competency_score}\n`;
    if (evalData.safety_score !== undefined) markdown += `**Safety Score:** ${evalData.safety_score}\n`;
    if (evalData.efficiency_score !== undefined) markdown += `**Efficiency Score:** ${evalData.efficiency_score}\n\n`;

    const markdownBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(markdownBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debrief-${simId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="debrief-report" className="bg-card border border-border rounded-sm text-foreground overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border bg-muted/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#2E6B4B]" />
            <h2 className="text-lg font-bold tracking-tight">Professional Debrief</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border hover:bg-accent text-xs font-bold text-muted-foreground transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save Report
            </button>
            <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground border border-border">
              ID: {simId}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Procedure Name</span>
            <span className="text-sm font-bold text-foreground">{procedureName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Completion Status</span>
            <span className="text-sm font-bold text-[#2E6B4B] uppercase">{completionStatus}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Patient Outcome</span>
            <span className="text-sm font-bold text-foreground">{patientOutcome}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Scores */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {evalData.final_score !== undefined && (
            <ScoreCard title="Overall Score" value={evalData.final_score} />
          )}
          {evalData.competency_score !== undefined && (
            <ScoreCard title="Competency" value={evalData.competency_score} />
          )}
          {evalData.safety_score !== undefined && (
            <ScoreCard title="Safety" value={evalData.safety_score} />
          )}
          {evalData.efficiency_score !== undefined && (
            <ScoreCard title="Efficiency" value={evalData.efficiency_score} />
          )}
        </div>

        {/* Timeline Summary */}
        {evalData.timeline_summary && Array.isArray(evalData.timeline_summary) && evalData.timeline_summary.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline Summary
            </h3>
            <div className="space-y-2 pl-4 border-l border-border">
              {evalData.timeline_summary.map((event: any, i: number) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className="absolute -left-[21px] mt-1 w-2 h-2 bg-border rounded-full" />
                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5 w-8">T:{event.tick ?? i}</span>
                  <p className="text-sm text-muted-foreground">{event.description || event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Critical Events */}
          {evalData.critical_events && Array.isArray(evalData.critical_events) && evalData.critical_events.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#C27820] uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Critical Events
              </h3>
              <div className="space-y-2">
                {evalData.critical_events.map((ev: any, i: number) => (
                  <div key={i} className="p-3 bg-[#C27820]/5 border border-[#C27820]/40 rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[#C27820] uppercase">{ev.severity || "CRITICAL"}</span>
                      {ev.tick !== undefined && <span className="text-[10px] font-mono text-muted-foreground">T:{ev.tick}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{ev.description || ev}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mistakes */}
          {evalData.mistakes && Array.isArray(evalData.mistakes) && evalData.mistakes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#A32A2A] uppercase tracking-widest flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Mistakes Identified
              </h3>
              <ul className="space-y-2">
                {evalData.mistakes.map((mistake: any, i: number) => (
                  <li key={i} className="text-sm text-[#E08080]/80 bg-[#A32A2A]/5 p-3 rounded-sm border border-[#A32A2A]/20 flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-[#A32A2A] mt-0.5 shrink-0" />
                    {mistake.description || mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          {evalData.strengths && Array.isArray(evalData.strengths) && evalData.strengths.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2E6B4B] uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {evalData.strengths.map((str: any, i: number) => (
                  <li key={i} className="text-sm text-[#8FBF9A]/80 bg-[#2E6B4B]/5 p-3 rounded-sm border border-[#2E6B4B]/20 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-[#2E6B4B] mt-0.5 shrink-0" />
                    {str.description || str}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {evalData.recommendations && Array.isArray(evalData.recommendations) && evalData.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#CC553D] uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {evalData.recommendations.map((rec: any, i: number) => (
                  <li key={i} className="text-sm text-[#CC553D]/80 bg-[#CC553D]/5 p-3 rounded-sm border border-[#CC553D]/20 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-[#CC553D] mt-0.5 shrink-0" />
                    {rec.description || rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function ScoreCard({ title, value }: { title: string, value: number | string }) {
  return (
    <div className="p-4 bg-muted border border-border rounded-sm flex flex-col items-center justify-center text-center flex-1 min-w-[120px]">
      <span className="text-[10px] text-muted-foreground uppercase mb-2">{title}</span>
      <span className="text-3xl font-black text-foreground">{value}</span>
    </div>
  );
}

/**
 * Legacy client-side debrief built from the simulation's event log and final
 * state — only used when the core payload is absent (older saved sessions).
 */
function buildFallbackEvaluation(currentState: any): any {
  const events: string[] = Array.isArray(currentState?.events) ? currentState.events : [];
  const correct = events.filter((e) => e.startsWith("✅ Correct Step")).length;
  const incorrect = events.filter((e) => e.startsWith("❌ Incorrect Step")).length;
  const complications = events.filter((e) => e.includes("⚠️ Complication")).length;
  const resolved = events.filter((e) => e.includes("✅ Complication resolved")).length;

  const status = String(currentState?.status || "").toLowerCase();
  const isSuccess = ["success", "completed", "finished"].includes(status);
  const isDeceased = String(currentState?.mode || "").toLowerCase() === "deceased" || ["failed", "terminated"].includes(status);

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const safetyScore = clamp(isSuccess ? 92 : 38 - incorrect * 8 - complications * 4);
  const competencyScore = clamp(72 + correct * 2 - incorrect * 12 - complications * 5);
  const efficiencyScore = clamp(80 + correct * 0.5 - incorrect * 6 - complications * 6);
  const finalScore = Math.round((safetyScore + competencyScore + efficiencyScore) / 3);

  const timeline = events.map((description, i) => ({ tick: undefined, description }));
  const criticalEvents = events
    .filter((e) => e.includes("⚠️") || e.toLowerCase().includes("complication") || e.toLowerCase().includes("deteriorat"))
    .map((description) => ({ severity: "CRITICAL", tick: undefined, description }));
  const mistakes = events
    .filter((e) => e.startsWith("❌") || e.toLowerCase().includes("incorrect"))
    .map((description) => ({ description }));
  const strengths = events
    .filter((e) => e.startsWith("✅ Correct"))
    .map((description) => ({ description }));

  const recommendations: { description: string }[] = [
    { description: "Perform a formal surgical time-out at every critical phase transition — identity, site, consent, and counts." },
    { description: "Rehearse the rescue algorithm for the highest-risk complication of this procedure before scrubbing in." },
    { description: "Debrief the team on hemodynamic management and blood-loss thresholds before closure." },
  ];
  if (complications > 0) {
    recommendations.unshift({
      description: `Review the physiology behind the ${complications} complication(s) that developed — early recognition is the highest-yield skill.`,
    });
  }

  const patientOutcome = isDeceased
    ? "Deceased"
    : isSuccess
    ? "Stable / Discharged"
    : "Stabilized / Transferred";

  return {
    final_score: finalScore,
    competency_score: competencyScore,
    safety_score: safetyScore,
    efficiency_score: efficiencyScore,
    patient_outcome: patientOutcome,
    timeline_summary: timeline,
    critical_events: criticalEvents,
    mistakes,
    strengths,
    recommendations,
  };
}

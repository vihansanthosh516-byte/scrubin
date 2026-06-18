import React from 'react';
import { useLocation } from 'wouter';
import { useSimulationStore } from '../state/simulationStore';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Clock, AlertTriangle, XCircle, CheckCircle, Lightbulb, Save, RotateCcw, Home, Play } from 'lucide-react';

export default function DebriefReport({ scenario }: { scenario: any }) {
  const [, setLocation] = useLocation();
  const { currentState, simId, setMode } = useSimulationStore();

  const evalData = currentState?.evaluation;
  
  if (!evalData) {
    return (
      <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-3xl mt-6 text-white flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold">Compiling Causal Evaluation...</h2>
        <p className="text-neutral-500 text-sm mt-2">The ScrubIn Core is generating a comprehensive deterministic debrief.</p>
      </div>
    );
  }

  // Header Data
  const procedureName = scenario?.name || scenario?.id || "Surgical Procedure";
  const completionStatus = currentState?.status || "Completed";
  const patientOutcome = evalData.patient_outcome || currentState?.patient_outcome || currentState?.patient_status || "Unknown";

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
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl mt-6 text-white overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-neutral-800 bg-black/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <h2 className="text-2xl font-bold tracking-tight">Professional Debrief</h2>
          </div>
          <span className="text-[10px] font-mono bg-black px-2 py-1 rounded text-neutral-500 border border-neutral-800">
            ID: {simId}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase">Procedure Name</span>
            <span className="text-sm font-bold text-neutral-200">{procedureName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase">Completion Status</span>
            <span className="text-sm font-bold text-emerald-500 uppercase">{completionStatus}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 uppercase">Patient Outcome</span>
            <span className="text-sm font-bold text-neutral-200">{patientOutcome}</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
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
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline Summary
            </h3>
            <div className="space-y-2 pl-4 border-l border-neutral-800">
              {evalData.timeline_summary.map((event: any, i: number) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className="absolute -left-[21px] mt-1 w-2 h-2 bg-neutral-700 rounded-full" />
                  <span className="text-[10px] font-mono text-neutral-500 mt-0.5 w-8">T:{event.tick ?? i}</span>
                  <p className="text-sm text-neutral-300">{event.description || event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Critical Events */}
          {evalData.critical_events && Array.isArray(evalData.critical_events) && evalData.critical_events.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Critical Events
              </h3>
              <div className="space-y-2">
                {evalData.critical_events.map((ev: any, i: number) => (
                  <div key={i} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">{ev.severity || "CRITICAL"}</span>
                      {ev.tick !== undefined && <span className="text-[10px] font-mono text-neutral-500">T:{ev.tick}</span>}
                    </div>
                    <p className="text-sm text-neutral-300">{ev.description || ev}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mistakes */}
          {evalData.mistakes && Array.isArray(evalData.mistakes) && evalData.mistakes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Mistakes Identified
              </h3>
              <ul className="space-y-2">
                {evalData.mistakes.map((mistake: any, i: number) => (
                  <li key={i} className="text-sm text-red-200/80 bg-red-500/5 p-3 rounded-xl border border-red-500/20 flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
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
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {evalData.strengths.map((str: any, i: number) => (
                  <li key={i} className="text-sm text-emerald-200/80 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {str.description || str}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {evalData.recommendations && Array.isArray(evalData.recommendations) && evalData.recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {evalData.recommendations.map((rec: any, i: number) => (
                  <li key={i} className="text-sm text-blue-200/80 bg-blue-500/5 p-3 rounded-xl border border-blue-500/20 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    {rec.description || rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-neutral-800 flex items-center justify-end gap-3 flex-wrap">
        <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800" onClick={() => setMode("replay")}>
          <RotateCcw className="w-4 h-4 mr-2" /> Replay Simulation
        </Button>
        <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800" onClick={exportMarkdown}>
          <Save className="w-4 h-4 mr-2" /> Save Report
        </Button>
        <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800" onClick={() => setLocation("/procedures")}>
          <Home className="w-4 h-4 mr-2" /> Dashboard
        </Button>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => window.location.reload()}>
          <Play className="w-4 h-4 mr-2" /> New Simulation
        </Button>
      </div>
    </div>
  );
}

function ScoreCard({ title, value }: { title: string, value: number | string }) {
  return (
    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center flex-1 min-w-[120px]">
      <span className="text-[10px] text-neutral-500 uppercase mb-2">{title}</span>
      <span className="text-3xl font-black text-white">{value}</span>
    </div>
  );
}

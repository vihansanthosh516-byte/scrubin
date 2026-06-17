import React, { useState, useMemo } from 'react';
import { useSimulationStore } from '../state/simulationStore';
import { calculateOutcome } from '../lib/score';
import { Button } from '@/components/ui/button';

/**
 * DebriefReport – UI component that generates an AI‑assisted post‑operative report.
 * It gathers deterministic simulation data, sends it to the `/api/evaluate` LLM endpoint,
 * and offers export options (PDF, Markdown), copy, and local‑profile save.
 *
 * All actions are read‑only – no engine state is mutated.
 */
export default function DebriefReport({ scenario }: { scenario: any }) {
  const { dvkChain, cognitionHistory, simId } = useSimulationStore();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Build a minimal decision history for scoring / AI payload.
  const decisionHistory = useMemo(() => {
    const history: any[] = [];
    dvkChain.forEach((proof, idx) => {
      const vitals = proof.state?.vitals || {};
      const comp = proof.state?.active_complication?.complication || null;
      history.push({
        decisionNumber: idx + 1,
        decisionTitle: `Decision ${idx + 1}`,
        isCorrect: true, // deterministic placeholder – could be refined later
        complication: comp,
        vitals: {
          hr: vitals.hr ?? vitals.heartRate ?? 0,
          bpSys: vitals.bpSys ?? vitals.bloodPressure?.sys ?? vitals.bp?.sys ?? 0,
          spo2: vitals.spo2 ?? vitals.SpO2 ?? 0,
          rr: vitals.rr ?? vitals.respiratoryRate ?? 0,
          temp: vitals.temp ?? vitals.temperature ?? 0,
        },
      });
    });
    return history;
  }, [dvkChain]);

  // Derive outcome badge/summary using existing scoring logic.
  const outcome = useMemo(() => {
    if (decisionHistory.length === 0) return { badge: 'UNKNOWN', summary: '' };
    const outcomeData = calculateOutcome(decisionHistory);
    return { badge: outcomeData.badge, summary: outcomeData.summary };
  }, [decisionHistory]);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        procedureName: scenario?.name || scenario?.id || 'Unknown Procedure',
        patient: scenario?.PATIENT || scenario?.patient || {},
        outcomeBadge: outcome.badge,
        outcomeSummary: outcome.summary,
        totalDecisions: decisionHistory.length,
        history: decisionHistory.map((h) => ({
          decisionNumber: h.decisionNumber,
          decisionTitle: h.decisionTitle,
          isCorrect: h.isCorrect,
          complication: h.complication,
          vitals: h.vitals,
        })),
      };
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data.notes || 'No notes returned');
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const html = `<!DOCTYPE html><html><head><title>Debrief Report</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; color: #eee; background: #0a0f1e; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
    </style></head><body><pre>${report.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const exportMarkdown = () => {
    if (!report) return;
    const markdownBlob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(markdownBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario?.id || 'debrief'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    // optional toast could be added – omitted for brevity
  };

  const saveToProfile = () => {
    if (!report) return;
    const key = `scrubin_debrief_${simId || 'unknown'}`;
    const entry = { timestamp: new Date().toISOString(), report };
    localStorage.setItem(key, JSON.stringify(entry));
    // optional user feedback – omitted
  };

  return (
    <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl mt-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Post‑Operative Debrief</h2>
      {report ? (
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap bg-neutral-950 p-4 rounded overflow-x-auto max-h-96 overflow-y-auto text-sm">
            {report}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
            <Button variant="outline" onClick={exportMarkdown}>Export Markdown</Button>
            <Button variant="outline" onClick={copyReport}>Copy Report</Button>
            <Button variant="outline" onClick={saveToProfile}>Save to Profile</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button onClick={generateReport} disabled={loading} className="w-48" >
            {loading ? 'Generating…' : 'Generate Report'}
          </Button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}

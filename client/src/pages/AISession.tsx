import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Clock, ActivitySquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/state/aiStore";
import { LoadingSkeleton } from "@/components/ui/enhanced-ui";

export default function AISession() {
  const { sessionId } = useParams();
  const { currentSession, uploadError, fetchSession, reset } = useAIStore();

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
    return () => reset();
  }, [sessionId, fetchSession, reset]);

  if (uploadError) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 flex items-center justify-center">
        <div className="max-w-md w-full text-center p-8 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">{uploadError}</p>
          <Link href="/ai">
            <Button variant="outline">Return to Workspace</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background p-8 pt-24 max-w-6xl mx-auto">
        <div className="flex gap-4 items-center mb-12">
          <LoadingSkeleton className="w-12 h-12 rounded-xl" />
          <LoadingSkeleton lines={2} className="w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LoadingSkeleton className="h-[400px] rounded-2xl" />
            <LoadingSkeleton className="h-[300px] rounded-2xl" />
          </div>
          <div className="space-y-6">
            <LoadingSkeleton className="h-[250px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 pt-24">
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai">
            <Button variant="ghost" size="icon" className="rounded-full bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              Case Analysis
            </h1>
            <p className="text-muted-foreground font-mono-data text-xs uppercase tracking-widest mt-1">
              Session ID: {currentSession.id}
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-emerald-500 font-bold text-lg">Analysis Complete</h3>
              <p className="text-emerald-500/70 text-sm">AI has successfully processed the case files.</p>
            </div>
          </div>
          <Link href={`/simulation?aiSession=${currentSession.id}`}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8">
              Start Simulation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Differential Diagnosis */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl glass-card-pro bg-[#0D1628]/40 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <ActivitySquare className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Differential Diagnosis</h2>
              </div>
              
              <div className="space-y-6">
                {currentSession.differential.map((diff, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">{diff.condition}</span>
                      <span className="text-primary font-mono-data">{diff.probability}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${diff.probability}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-primary"
                      />
                    </div>
                    {diff.evidence.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Evidence: {diff.evidence.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl glass-card-pro bg-[#0D1628]/40 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-white">Patient Timeline</h2>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {currentSession.timeline.map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-data text-xs text-primary">{event.time}</span>
                      </div>
                      <div className="text-sm text-white/90">{event.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Risk Assessment */}
            {currentSession.riskAssessment && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="p-8 rounded-2xl glass-card-pro bg-[#0D1628]/40 border border-white/5"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className={`w-6 h-6 ${
                    currentSession.riskAssessment.level === "High" || currentSession.riskAssessment.level === "Critical" 
                      ? "text-red-500" 
                      : "text-amber-500"
                  }`} />
                  <h2 className="text-2xl font-bold text-white">Risk Analysis</h2>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-amber-500/20 mb-4">
                    <span className="text-4xl font-bold text-amber-500">{currentSession.riskAssessment.score}</span>
                    <span className="text-amber-500/50 text-xl ml-1">/10</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{currentSession.riskAssessment.level} Risk</h3>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Key Factors</h4>
                  <ul className="space-y-2">
                    {currentSession.riskAssessment.factors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

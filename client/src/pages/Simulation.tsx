/**
* ScrubIn Simulation Page — Interactive Surgery Simulator
* Fully integrated Real-time dynamic vitals engine & 42-Decision Logic.
*/
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Activity, Heart, Wind, Thermometer, Circle, Clock, Volume2, VolumeX, ActivitySquare, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVitalsEngine, ComplicationType, PatientProfile, VitalZone } from "../lib/vitals";
import { audioEngine } from "../lib/audio";
import { VitalsGraph, DecisionHistoryItem } from "../components/VitalsGraph";
import { useAuth } from "../contexts/AuthContext";
import { appendectomyData } from "../data/appendectomy";
import { cabgData } from "../data/cabg";
import { craniotomyData } from "../data/craniotomy";
import { cholecystectomyData } from "../data/cholecystectomy";
import { aclReconstructionData } from "../data/acl_reconstruction";
import { cSectionData } from "../data/c_section";
import { spinalFusionData } from "../data/spinal_fusion";
import { totalKneeReplacementData } from "../data/total_knee_replacement";
import { exploratoryLaparotomyData } from "../data/exploratory_laparotomy";
import { calculateProcedureOutcome, ScoreData } from "../lib/score";
import { saveSession } from "../lib/leaderboard";

const REGISTRY: Record<string, any> = {
  appendectomy: appendectomyData,
  cabg: cabgData,
  craniotomy: craniotomyData,
  cholecystectomy: cholecystectomyData,
  "acl-reconstruction": aclReconstructionData,
  "c-section": cSectionData,
  "spinal-fusion": spinalFusionData,
  "total-knee-replacement": totalKneeReplacementData,
  "exploratory-laparotomy": exploratoryLaparotomyData
};

function EcgCanvas({ hr, zone }: { hr: number, zone: VitalZone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height, mid = H / 2;
    let color = "#7EC8E3";
    if (zone === "WARNING") color = "#fbbf24";
    if (zone === "CRITICAL") color = "#f87171";
    if (zone === "GAME_OVER") color = "#ef4444";

    let ecgPoints = [0, 0, 0, -12, 16, -12, 16, 0, 0, 0, -4, 4, 0, 0, 0, 0];
    if (zone === "CRITICAL") ecgPoints = [0, 2, -2, -18, 22, -20, 24, -2, 2, 0, -8, 8, 0, 0, 0, 0];
    else if (zone === "GAME_OVER") ecgPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let speed = 2;
    if (hr > 100) speed = 3;
    if (hr > 125) speed = 4;
    if (hr < 50) speed = 1.5;
    if (zone === "GAME_OVER") speed = 1;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      const step = 8;
      const patternLen = ecgPoints.length * step;
      for (let x = 0; x < W + step; x += step) {
        const idx = Math.floor(((x + offsetRef.current) % patternLen) / step) % ecgPoints.length;
        const y = mid + ecgPoints[idx];
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      offsetRef.current = (offsetRef.current + speed) % patternLen;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [hr, zone]);

  return <canvas ref={canvasRef} width={300} height={40} className="w-full h-10" style={{ imageRendering: "pixelated" }} />;
}

type GameState = "intro" | "induction" | "playing" | "rescue" | "complete" | "gameover";
type RescuePhase = 'initial' | 'stabilizing' | 'recovering';

export default function Simulation() {
  const [procId] = useState(() => new URLSearchParams(window.location.search).get("proc") || "appendectomy");
  const procData = REGISTRY[procId] || REGISTRY["appendectomy"];
  const { user } = useAuth();
  const PATIENT = procData.PATIENT;
  const PHASES: any[] = procData.PHASES;
  const DECISIONS: import("../data/appendectomy").Decision[] = procData.DECISIONS;

  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentDecisionIdx, setCurrentDecisionIdx] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [answers, setAnswers] = useState<{ decisionId: number; correct: boolean; optionId: string }[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const [activeComplications, setActiveComplications] = useState<ComplicationType[]>([]);
  const [decisionsSinceComplication, setDecisionsSinceComplication] = useState(0);
  const [history, setHistory] = useState<DecisionHistoryItem[]>([]);
  const [failedRescues, setFailedRescues] = useState(0);

  const [isAudioMuted, setIsAudioMuted] = useState(audioEngine.getMuted());
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [showComplicationOverlay, setShowComplicationOverlay] = useState<string | null>(null);
  const [complicationExplanation, setComplicationExplanation] = useState<string>("");
  const [isFlatlining, setIsFlatlining] = useState(false);
  const [rescueLoading, setRescueLoading] = useState(false);

  // Multi-step rescue system
  const [rescueStep, setRescueStep] = useState(0);
  const [rescueTotalSteps, setRescueTotalSteps] = useState(3);
  const [rescuePhase, setRescuePhase] = useState<RescuePhase>('initial');
  const [vitalsBlocked, setVitalsBlocked] = useState(false);

  const currentDecision = DECISIONS[Math.min(currentDecisionIdx, DECISIONS.length - 1)];

  // Shuffle decision options so correct answer isn't always first
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

  useEffect(() => {
    if (currentDecision) {
      const options = [...currentDecision.options];
      // Fisher-Yates shuffle
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentDecisionIdx]);

  const vitals = useVitalsEngine({
    patient: PATIENT,
    isActive: gameState === "playing" || gameState === "rescue" || gameState === "induction",
    complications: activeComplications,
    decisionsSinceComplication,
    isInductionComplete: gameState !== "induction" && gameState !== "intro"
  });

  // Complication explanations for user feedback
  const COMPLICATION_EXPLANATIONS: Record<string, { title: string; explanation: string }> = {
    HEMORRHAGE: { title: "Hemorrhage", explanation: "You've caused significant bleeding. Blood loss is occurring rapidly." },
    ANESTHESIA_OVERDOSE: { title: "Anesthesia Overdose", explanation: "Too much anesthetic. Breathing and heart rate are slowing dangerously." },
    ANESTHESIA_UNDERDOSE: { title: "Anesthesia Underdose", explanation: "Patient is waking up. They can feel pain and may move." },
    BOWEL_PERFORATION: { title: "Bowel Perforation", explanation: "You've punctured the intestine. Bacteria are spilling into the abdomen." },
    NERVE_DAMAGE: { title: "Nerve Damage", explanation: "A critical nerve has been injured causing potential permanent damage." },
    PNEUMOTHORAX: { title: "Pneumothorax", explanation: "Air entered the chest cavity, collapsing the lung." },
    CARDIAC_INJURY: { title: "Cardiac Injury", explanation: "You've injured the heart. Circulation is failing catastrophically." },
    WRONG_INCISION_SITE: { title: "Wrong Incision Site", explanation: "Incision in wrong location, risking damage to unexpected structures." },
    MALIGNANT_HYPERTHERMIA: { title: "Malignant Hyperthermia", explanation: "Muscles releasing heat uncontrollably. Temperature rising rapidly." },
    WRONG_DIAGNOSIS: { title: "Wrong Diagnosis", explanation: "Misdiagnosed. Surgery may not address the actual problem." }
  };

  // Determine rescue steps based on complication severity
  const getRescueSeverity = (complication: ComplicationType): number => {
    switch (complication) {
      case 'CARDIAC_INJURY':
      case 'PNEUMOTHORAX':
      case 'MALIGNANT_HYPERTHERMIA':
        return 4; // Catastrophic - most steps
      case 'HEMORRHAGE':
      case 'BOWEL_PERFORATION':
        return 3; // Severe
      case 'ANESTHESIA_OVERDOSE':
      case 'ANESTHESIA_UNDERDOSE':
        return 2; // Moderate
      default:
        return 2; // Default
    }
  };

  const generateScoreAndFetchAI = async (hist: DecisionHistoryItem[], failures: number, gameOverState: boolean) => {
    const data = calculateProcedureOutcome(hist);
    setScoreData(data);
    setGameState(data.badge === "FAILED" ? "gameover" : "complete");
    audioEngine.stopAll();

    if (user) {
      const historyKey = `scrubin_history_${user.id}`;
      const existing = localStorage.getItem(historyKey);
      const historyData = existing ? JSON.parse(existing) : [];

      const newEntry = {
        id: `#${Math.floor(Math.random() * 90000) + 10000}`,
        procedure: procData.PATIENT.procedureCategory === "emergency" ? "Exploratory Laparotomy" : (procId.charAt(0).toUpperCase() + procId.slice(1).replace('-', ' ')),
        outcome: data.badge === "FAILED" ? "Critical" : data.badge === "COMPLICATED" ? "Complicated" : "Successful",
        score: Math.round((data.totalXP / 200) * 100).toString() + "%",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: formatTime(elapsedTime)
      };

      localStorage.setItem(historyKey, JSON.stringify([newEntry, ...historyData].slice(0, 50)));

      try {
        await saveSession({
          userId: user.id,
          procedureId: procId,
          procedureName: procData.PATIENT.procedureCategory === "emergency" ? "Exploratory Laparotomy" : (procId.charAt(0).toUpperCase() + procId.slice(1).replace('-', ' ')),
          score: Math.round((data.totalXP / 500) * 100),
          outcome: data.badge === "FAILED" ? "Critical" : data.badge === "COMPLICATED" ? "Complicated" : "Successful",
          timeSeconds: elapsedTime,
          decisionsCorrect: hist.filter(h => h.isCorrect).length,
          decisionsTotal: hist.length,
          complicationsCount: hist.filter(h => h.complication && h.complication !== "NONE").length
        });
        console.log("Session saved to Supabase!");
      } catch (e) {
        console.error("Failed to save session to Supabase:", e);
      }
    }
  };

  // CRITICAL ZONE HANDLER - Block decisions and trigger rescue
  useEffect(() => {
    if (vitals.overallZone === "GAME_OVER" && gameState !== "gameover" && gameState !== "complete") {
      generateScoreAndFetchAI(history, failedRescues, true);
    } else if (vitals.overallZone === "CRITICAL" && gameState === "playing") {
      // BLOCK further decisions until stabilized
      setVitalsBlocked(true);
      const currC = activeComplications[activeComplications.length - 1] || "NONE";
      if (currC !== "NONE" && currentDecision.options.some(o => o.complicationType === currC && o.rescueOptions)) {
        const severity = getRescueSeverity(currC as ComplicationType);
        setRescueTotalSteps(severity);
        setRescueStep(1);
        setRescuePhase('initial');
        setGameState("rescue");
      }
    } else if (vitals.overallZone === "NORMAL") {
      setVitalsBlocked(false);
    }
  }, [vitals.overallZone, gameState, activeComplications, currentDecision, vitalsBlocked]);

  useEffect(() => {
    if (vitals.overallZone === "CRITICAL") audioEngine.startCriticalAlarm();
    else if (vitals.overallZone === "WARNING") audioEngine.startWarningAlarm();
    else if (vitals.overallZone === "GAME_OVER") audioEngine.playFlatline();
    else audioEngine.stopAll();
  }, [vitals.overallZone]);

  useEffect(() => {
    if (gameState !== "playing" && gameState !== "induction" && gameState !== "rescue") return;
    const interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (gameState === "induction") {
      const tm = setTimeout(() => setGameState("playing"), 10000);
      return () => clearTimeout(tm);
    }
  }, [gameState]);

  const snapHistory = (isCorrect: boolean, comp?: string) => {
    const snap = {
      decisionNumber: history.length + 1,
      decisionTitle: currentDecision.question,
      isCorrect,
      complication: comp,
      vitals: { hr: vitals.hr.value, bpSys: vitals.bp.sys, spo2: vitals.spo2.value, rr: vitals.rr.value, temp: vitals.temp.value }
    };
    setHistory(prev => [...prev, snap]);
    return [...history, snap];
  };

  const advancePhase = (histSnap: DecisionHistoryItem[]) => {
    if (currentDecisionIdx < DECISIONS.length - 1) {
      const nextDecision = DECISIONS[currentDecisionIdx + 1];
      setCurrentPhase(nextDecision.phase);
      setCurrentDecisionIdx(i => i + 1);
      setSelectedOption(null);
    } else {
      generateScoreAndFetchAI(histSnap, failedRescues, false);
    }
  };

  // GATEKEEPER: Block decisions when vitals are CRITICAL
  const handleChoice = useCallback((optionId: string) => {
    if (selectedOption) return;

    // BLOCK if vitals are CRITICAL or GAME_OVER - must stabilize first
    if (vitals.overallZone === "CRITICAL" || vitals.overallZone === "GAME_OVER" || vitalsBlocked) {
      setVitalsBlocked(true);
      return;
    }

    setSelectedOption(optionId);

    const option = shuffledOptions.find(o => o.id === optionId) || currentDecision.options.find(o => o.id === optionId);
    if (!option) return;

    const isCorrect = option.correct;
    setAnswers(prev => [...prev, { decisionId: currentDecision.id, correct: isCorrect, optionId }]);
    if (activeComplications.length > 0) setDecisionsSinceComplication(d => d + 1);

    const newHist = snapHistory(isCorrect, option.complicationType);

    if (isCorrect) {
      setTimeout(() => advancePhase(newHist), 800);
    } else {
      // WRONG ANSWER - SHOW COMPLICATION OVERLAY AND PAUSE
      if (option.complicationType && option.complicationType !== "NONE") {
        const compInfo = COMPLICATION_EXPLANATIONS[option.complicationType] || {
          title: option.complicationType,
          explanation: "A complication has occurred. Monitor the patient's vitals carefully."
        };
        setShowComplicationOverlay(option.complicationType);
        setComplicationExplanation(compInfo.explanation);
        setActiveComplications(prev => {
          if (["CARDIAC_INJURY", "PNEUMOTHORAX", "MALIGNANT_HYPERTHERMIA"].includes(option.complicationType!)) {
            return [option.complicationType!];
          }
          if (!prev.includes(option.complicationType!)) return [...prev, option.complicationType!];
          return prev;
        });
        setDecisionsSinceComplication(0);
      } else {
        setTimeout(() => advancePhase(newHist), 800);
      }
    }
  }, [selectedOption, currentDecision, currentDecisionIdx, activeComplications, vitals, history, vitalsBlocked]);

  const dismissComplicationOverlay = () => {
    setShowComplicationOverlay(null);
    setComplicationExplanation("");
    setSelectedOption(null);
    if (currentDecisionIdx < DECISIONS.length - 1) {
      const nextDecision = DECISIONS[currentDecisionIdx + 1];
      setCurrentPhase(nextDecision.phase);
      setCurrentDecisionIdx(i => i + 1);
    } else {
      generateScoreAndFetchAI(history, failedRescues, false);
    }
  };

  // MULTI-STEP RESCUE HANDLER
  const handleRescue = (isCorrect: boolean) => {
    setRescueLoading(true);
    setTimeout(() => {
      if (isCorrect) {
        // Progress to next rescue step
        if (rescueStep < rescueTotalSteps) {
          setRescueStep(prev => prev + 1);
          setRescuePhase(prev => {
            if (rescueStep === 1) return 'stabilizing';
            if (rescueStep === rescueTotalSteps - 1) return 'recovering';
            return prev;
          });
          // Clear some complications to show improvement on later steps
          if (rescueStep >= rescueTotalSteps - 1) {
            setActiveComplications(prev => prev.slice(0, -1));
            setDecisionsSinceComplication(3); // Boost recovery
          }
        } else {
          // All rescue steps complete - return to surgery
          setGameState("playing");
          setFailedRescues(0);
          setVitalsBlocked(false);
          setActiveComplications([]);
          setRescueStep(0);
        }
      } else {
        // Wrong rescue choice
        const fails = failedRescues + 1;
        setFailedRescues(fails);
        if (fails >= 2) {
          generateScoreAndFetchAI(history, fails, true);
        }
      }
      setRescueLoading(false);
    }, 300);
  };

  const completedPhases = Array.from(new Set(answers.map(a => DECISIONS.find(d => d.id === a.decisionId)?.phase || 0)));
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  let pageBgClass = "bg-background";
  if (gameState !== "intro" && gameState !== "complete" && gameState !== "gameover") {
    if (vitals.overallZone === "CRITICAL") pageBgClass = "bg-red-950/20";
    else if (vitals.overallZone === "WARNING") pageBgClass = "bg-amber-950/10";
  }

  if (gameState === "intro") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 font-mono-data">Patient: {PATIENT.name}</h1>
          <p className="text-muted-foreground mb-8 text-lg">{procId === 'cabg' ? 'Heart Bypass' : procId === 'craniotomy' ? 'Craniotomy' : 'Appendectomy'} - Case Simulation ({DECISIONS.length} Decisions)</p>
          <Button size="lg" onClick={() => setGameState("induction")} className="w-full">Begin Anesthesia Induction</Button>
          <Button variant="ghost" onClick={() => setIsAudioMuted(audioEngine.toggleMute())} className="mt-8">
            {isAudioMuted ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
            {isAudioMuted ? "Sound is Muted" : "Sound is Enabled"}
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === "complete" || gameState === "gameover") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="flex flex-col gap-6">
            <div className={`rounded-xl p-8 border text-center shadow-xl ${scoreData?.colorClass}`}>
              <h1 className="text-4xl font-black tracking-widest mb-2 font-mono-data opacity-90">{scoreData?.badge}</h1>
              <p className="text-lg opacity-90 font-medium">{scoreData?.summary}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ActivitySquare /> Simulation Grading</h2>
              <div className="space-y-3 font-mono-data text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Base Difficulty XP</span> <span>{scoreData?.baseXP}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Outcome Multiplier</span> <span>x{scoreData?.xpMultiplier}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Speed Bonus</span> <span>+{scoreData?.bonuses.speed}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>No Complications Bonus</span> <span>+{scoreData?.bonuses.noComplications}</span></div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t"><span>Total XP Earned</span> <span>{scoreData?.totalXP}</span></div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} className="flex-1" size="lg">Restart Simulation</Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen /> Session History</h2>
              <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px] pr-2 custom-scrollbar">
                {history.map((h, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Decision {h.decisionNumber}</span>
                      {h.isCorrect ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Correct</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">Incorrect</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-tight mb-2">{h.decisionTitle}</p>
                    {h.complication && h.complication !== "NONE" && (
                      <div className="text-[10px] bg-red-950/30 text-red-400 p-2 rounded border border-red-900/30">
                        <span className="font-bold">Complication:</span> {h.complication.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <VitalsGraph data={history} />
          </div>

        </div>
      </div>
    );
  }

  const currentComplication = activeComplications[activeComplications.length - 1];

  type RescueOption = { id: string; label: string; desc: string; correct: boolean };

  // Get rescue options based on the COMPLICATION TYPE
  const getRescueOptionsForComplication = (comp: ComplicationType): RescueOption[] => {
    switch (comp) {
      case "HEMORRHAGE":
        return [
          { id: "h1", label: "Apply direct pressure & call for transfusion", desc: "Standard bleeding protocol", correct: true },
          { id: "h2", label: "Attempt to clamp vessel blindly", desc: "Risks collateral damage", correct: false },
          { id: "h3", label: "Pack the abdomen and reassess", desc: "Damage control", correct: true }
        ];
      case "ANESTHESIA_OVERDOSE":
        return [
          { id: "ao1", label: "Reduce anesthetic agent and increase ventilation", desc: "Flush lungs", correct: true },
          { id: "ao2", label: "Administer reversal agent", desc: "Flumazenil or Naloxone", correct: true },
          { id: "ao3", label: "Increase IV fluids only", desc: "Doesn't fix respiratory depression", correct: false }
        ];
      case "ANESTHESIA_UNDERDOSE":
        return [
          { id: "au1", label: "Increase anesthetic depth", desc: "More agent/propofol", correct: true },
          { id: "au2", label: "Administer paralytic", desc: "Rocuronium", correct: true },
          { id: "au3", label: "Ignore agitation", desc: "Patient fights ventilator", correct: false }
        ];
      case "BOWEL_PERFORATION":
        return [
          { id: "bp1", label: "Over-sew the perforation", desc: "Primary repair", correct: true },
          { id: "bp2", label: "Copious irrigation and broad antibiotics", desc: "Control contamination", correct: true },
          { id: "bp3", label: "Close with a drain only", desc: "Sepsis risk remains", correct: false }
        ];
      case "PNEUMOTHORAX":
        return [
          { id: "pn1", label: "Needle decompression", desc: "Evacuate air immediately", correct: true },
          { id: "pn2", label: "High flow oxygen only", desc: "Not definitive treatment", correct: false },
          { id: "pn3", label: "Chest tube placement", desc: "Definitive airway control", correct: true }
        ];
      case "CARDIAC_INJURY":
        return [
          { id: "ci1", label: "ACLS Protocol - CPR & Defibrillate", desc: "Restore rhythm", correct: true },
          { id: "ci2", label: "Epinephrine 1mg push", desc: "Restart cardiac output", correct: true },
          { id: "ci3", label: "Wait to see if it recovers naturally", desc: "Brain death impending", correct: false }
        ];
      case "MALIGNANT_HYPERTHERMIA":
        return [
          { id: "mh1", label: "Administer Dantrolene rapidly", desc: "Only specific antidote", correct: true },
          { id: "mh2", label: "Stop volatile anesthetics & hyperventilate with 100% O2", desc: "Remove trigger", correct: true },
          { id: "mh3", label: "Give Tylenol and cool with ice", desc: "Insufficient alone", correct: false }
        ];
      case "NERVE_DAMAGE":
        return [
          { id: "nd1", label: "Assess nerve function & document deficit", desc: "Evaluate extent", correct: true },
          { id: "nd2", label: "Consult neurosurgery immediately", desc: "Specialist intervention", correct: true },
          { id: "nd3", label: "Continue surgery without addressing", desc: "Permanent damage risk", correct: false }
        ];
      case "WRONG_INCISION_SITE":
        return [
          { id: "wi1", label: "Abort primary incision, assess anatomy", desc: "Re-orient", correct: true },
          { id: "wi2", label: "Continue deeper", desc: "Will hit wrong organs", correct: false },
          { id: "wi3", label: "Call for help/supervising attending", desc: "Safe bet", correct: true }
        ];
      case "WRONG_DIAGNOSIS":
        return [
          { id: "wd1", label: "Halt procedure and consult imagery/labs", desc: "Re-evaluate", correct: true },
          { id: "wd2", label: "Proceed blindly", desc: "Exacerbates error", correct: false }
        ];
      default:
        return [
          { id: "def1", label: "Assess patient and vitals", desc: "Evaluate situation", correct: true },
          { id: "def2", label: "Call for help", desc: "Get senior surgeon", correct: true }
        ];
    }
  };

  const rescueOptions: RescueOption[] = currentComplication ? getRescueOptionsForComplication(currentComplication) : [];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${pageBgClass}`}>
      <Navbar />
      <div className={`fixed top-[88px] left-0 right-0 z-30 border-b transition-colors duration-500 backdrop-blur-md
        ${vitals.overallZone === "CRITICAL" ? "bg-red-950/80 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" :
          vitals.overallZone === "WARNING" ? "bg-amber-950/80 border-amber-500/50" : "bg-card/95 border-border"}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <div className="flex-1 min-w-[150px] max-w-[280px]">
            <EcgCanvas hr={vitals.hr.value} zone={vitals.overallZone} />
          </div>
          <div className="flex items-center gap-3 md:gap-6 text-sm font-mono-data flex-shrink-0">

            {Object.entries({ HR: vitals.hr, BP: vitals.bp, SpO2: vitals.spo2, RR: vitals.rr, TEMP: vitals.temp }).map(([key, vital]) => (
              <div key={key} className={`flex flex-col items-center px-2 py-1 rounded-md border transition-colors ${
                vital.zone === 'CRITICAL' ? 'border-red-500 bg-red-500/20 text-red-500 animate-pulse' :
                vital.zone === 'WARNING' ? 'border-amber-500 bg-amber-500/20 text-amber-500' : 'border-transparent text-foreground'
              }`}>
                <div className="text-[10px] opacity-70 flex gap-1 items-center">
                  {key === 'SpO2' && <Wind className="w-2.5 h-2.5" />} {key}
                </div>
                <div className="text-lg md:text-xl font-bold">{vital.value}</div>
              </div>
            ))}

            {vitals.fetalHr && (
              <div className={`flex flex-col items-center px-3 py-1 rounded-md border border-pink-500/50 bg-pink-500/10 text-pink-500 animate-pulse transition-colors`}>
                <div className="text-[10px] opacity-70 flex gap-1 items-center">
                  <Heart className="w-2.5 h-2.5" /> FETAL HR
                </div>
                <div className="text-lg md:text-xl font-bold">{vitals.fetalHr.value} <span className="text-[10px]">bpm</span></div>
              </div>
            )}

          </div>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setIsAudioMuted(audioEngine.toggleMute())}>
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono-data">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      </div>

      {vitals.overallZone === "CRITICAL" && (
        <div className="fixed top-[140px] left-0 right-0 bg-red-600 text-white text-center font-bold font-mono tracking-widest py-1 z-50 animate-pulse">
          CRITICAL EVENT — PATIENT DETERIORATING
        </div>
      )}

      {/* COMPLICATION OVERLAY */}
      <AnimatePresence>
        {showComplicationOverlay && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center">
            <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="bg-gradient-to-b from-red-950 to-red-900 border-2 border-red-500 rounded-2xl p-8 max-w-lg mx-4 text-center shadow-[0_0_50px_rgba(239,68,68,0.5)]">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2 tracking-widest">COMPLICATION DETECTED</h2>
              <h3 className="text-xl font-bold text-white mb-4 font-mono">{showComplicationOverlay.split("_").map((w:string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}</h3>
              <p className="text-red-200 mb-6 leading-relaxed">{complicationExplanation}</p>
              <Button onClick={dismissComplicationOverlay} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg w-full text-lg">Continue Surgery →</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLATLINE OVERLAY */}
      <AnimatePresence>
        {isFlatlining && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
            <div className="text-center">
              <motion.div initial={{scale:0.5}} animate={{scale:1}} transition={{duration:0.5,repeat:Infinity,repeatType:"reverse"}}>
                <div className="text-8xl mb-6">💔</div>
              </motion.div>
              <h2 className="text-5xl font-bold text-red-500 font-mono">FLATLINE</h2>
              <p className="text-xl text-red-400 mt-4 animate-pulse">No cardiac activity detected...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className="flex flex-1 pt-44 max-w-7xl mx-auto w-full px-4 pb-8 gap-6 relative">

        {gameState === "induction" ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-mono tracking-widest animate-pulse opacity-80 mb-8">ADMINISTERING ANESTHESIA</h2>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mb-4"><motion.div className="h-full bg-primary" initial={{width:0}} animate={{width:"100%"}} transition={{duration:10, ease:"linear"}}/></div>
            <Button onClick={() => setGameState("playing")} variant="outline" size="sm">SKIP INDUCTION</Button>
          </div>
        ) : gameState === "rescue" ? (
          // MULTI-STEP RESCUE PANEL
          <div className="flex-1 glass-card-light rounded-2xl p-8 border-2 border-red-500/80 bg-red-950/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-red-500">EMERGENCY RESCUE</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-300 font-mono">Step {rescueStep}/{rescueTotalSteps}</span>
                <div className="flex gap-1">
                  {Array.from({length: rescueTotalSteps}, (_, i) => (
                    <div key={i} className={"w-3 h-3 rounded-full " + (i < rescueStep ? "bg-emerald-500" : "bg-red-900/50 border border-red-500/50")}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESCUE PROGRESS BAR */}
            {rescueStep > 0 && (
              <div className="w-full bg-gray-700 h-2 rounded-full mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(rescueStep / rescueTotalSteps) * 100}%` }}
                ></div>
              </div>
            )}

            <div className="mb-4 px-4 py-3 bg-red-900/30 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-300 font-mono mb-1">Phase: {rescuePhase.toUpperCase()}</p>
              <p className="text-xs text-red-400">
                {rescuePhase === 'initial' ? 'Assess and diagnose the emergency' :
                 rescuePhase === 'stabilizing' ? 'Apply critical interventions' :
                 'Monitor recovery and prevent recurrence'}
              </p>
            </div>

            <p className="text-xl mb-4">Complication: <span className="font-mono text-red-400">{currentComplication}</span></p>

            <div className="space-y-3">
              {rescueLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <>
                  {rescueOptions.map(opt => (
                    <Button key={opt.id} onClick={() => handleRescue(opt.correct)} disabled={rescueLoading} variant={"destructive"} className="w-full text-left justify-start h-auto py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-lg">{opt.label}</span>
                        <span className="text-sm opacity-80">{opt.desc}</span>
                      </div>
                    </Button>
                  ))}
                  {rescueOptions.length === 0 && <Button onClick={() => handleRescue(true)} disabled={rescueLoading} variant="outline">Proceed to stabilize blindly (No rescue mapped)</Button>}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:flex flex-col w-48 flex-shrink-0 gap-2">
              <div className="label-mono text-muted-foreground mb-3 flex justify-between">Procedure Map <span>{currentDecisionIdx + 1}/{DECISIONS.length}</span></div>
              {PHASES.map((phase) => (
                <div key={phase.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  phase.id === currentPhase ? "bg-primary/15 border border-primary/40 text-primary" : completedPhases.includes(phase.id) ? "text-emerald-400 opacity-80" : "text-muted-foreground opacity-50"
                }`}>
                  <Circle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium">{phase.name}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-5">
              <motion.div className="glass-card-light rounded-2xl p-7 border border-border flex-1">
                {/* VITALS BLOCKED WARNING */}
                {vitalsBlocked && (
                  <div className="mb-4 px-4 py-3 bg-red-900/30 rounded-lg border border-red-500/50 animate-pulse">
                    <p className="text-red-400 font-bold font-mono text-sm">⚠️ VITALS CRITICAL - DECISIONS BLOCKED</p>
                    <p className="text-xs text-red-300 mt-1">Stabilize patient before continuing</p>
                  </div>
                )}
                <span className="text-xs font-mono-data text-primary mb-2 block">DECISION {currentDecision.id}</span>
                <h2 className="text-2xl font-bold text-foreground mb-4">{currentDecision.question}</h2>
                <div className="bg-muted/40 rounded-xl p-5 border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentDecision.context}</p>
                </div>
              </motion.div>
            </div>

            <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col gap-4">
              <div className="glass-card-light rounded-2xl p-5 border border-border h-full flex flex-col">
                <div className="label-mono text-primary mb-4">Select Your Approach</div>
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-2">
                  {shuffledOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleChoice(option.id)}
                      disabled={selectedOption !== null || vitalsBlocked}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        selectedOption === option.id ? (option.correct ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500" : "bg-red-500/15 border-red-500/40 text-red-500")
                        : selectedOption || vitalsBlocked ? "opacity-40 border-border bg-muted/20" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <div className="text-sm font-semibold mb-0.5">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

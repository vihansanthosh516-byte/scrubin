/**
 * Anatomy Explorer — Surgical-Grade 3D Interactive Experience
 * Layered anatomy (skin, muscle, skeleton) with slider for surgical dissection
 * Uses ScrubIn design system: glassmorphism cards, baby blue accents
 */

import { useState, useCallback, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrubinStaticPanel, ScrubinCard } from "@/components/ui/scrubin-card";
import { Play, BookOpen, Activity, Layers, Bone, ArrowLeft, ArrowRight } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE DATA
// ═══════════════════════════════════════════════════════════════════════════════

interface ProcedureStep {
  number: number;
  title: string;
  description: string;
}

interface Procedure {
  id: string;
  name: string;
  specialty: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  decisions: number;
  organId: string;
  position: [number, number, number];
  layer: "skin" | "muscle" | "skeleton";
  steps: ProcedureStep[];
}

const PROCEDURES: Procedure[] = [
  {
    id: "appendectomy",
    name: "Appendectomy",
    specialty: "General Surgery",
    difficulty: "Beginner",
    duration: "25 min",
    decisions: 42,
    organId: "appendix",
    position: [0.12, 0.2, 0.12],
    layer: "muscle",
    steps: [
      { number: 1, title: "Anesthesia and Access", description: "General anesthesia is administered. Three laparoscopic ports are inserted." },
      { number: 2, title: "Locating the Appendix", description: "The laparoscope navigates to the right lower quadrant." },
      { number: 3, title: "Ligation and Division", description: "The mesoappendix is divided using ultrasonic shears." },
      { number: 4, title: "Extraction and Closure", description: "The specimen is removed through the umbilical port." },
    ],
  },
  {
    id: "cholecystectomy",
    name: "Cholecystectomy",
    specialty: "General Surgery",
    difficulty: "Intermediate",
    duration: "30 min",
    decisions: 51,
    organId: "gallbladder",
    position: [0.15, 0.55, 0.15],
    layer: "muscle",
    steps: [
      { number: 1, title: "Port Placement", description: "Four laparoscopic ports are placed for optimal access." },
      { number: 2, title: "Calot's Triangle Dissection", description: "The gallbladder is retracted to expose Calot's triangle." },
      { number: 3, title: "Ligation and Division", description: "The cystic duct and artery are clipped and divided." },
      { number: 4, title: "Extraction and Closure", description: "The gallbladder is placed in a specimen bag and removed." },
    ],
  },
  {
    id: "c-section",
    name: "C-Section",
    specialty: "OB/GYN",
    difficulty: "Intermediate",
    duration: "28 min",
    decisions: 44,
    organId: "uterus",
    position: [0, 0.05, 0.15],
    layer: "muscle",
    steps: [
      { number: 1, title: "Preparation and Incision", description: "A Pfannenstiel skin incision is made above the pubic symphysis." },
      { number: 2, title: "Uterine Entry", description: "The peritoneum is opened and the bladder is reflected." },
      { number: 3, title: "Delivery of the Infant", description: "The surgeon delivers the infant's head." },
      { number: 4, title: "Uterine Repair and Closure", description: "The placenta is delivered and the uterus is closed in two layers." },
    ],
  },
  {
    id: "acl-reconstruction",
    name: "ACL Reconstruction",
    specialty: "Orthopedic Surgery",
    difficulty: "Intermediate",
    duration: "35 min",
    decisions: 48,
    organId: "knee",
    position: [0.08, -0.55, 0.12],
    layer: "skeleton",
    steps: [
      { number: 1, title: "Arthroscopy and Graft Harvest", description: "Diagnostic arthroscopy assesses the ACL tear." },
      { number: 2, title: "Tunnel Preparation", description: "The tibial tunnel is created at the native ACL footprint." },
      { number: 3, title: "Graft Passage and Fixation", description: "The graft is passed through the tunnels." },
      { number: 4, title: "Tensioning and Closure", description: "The graft is tensioned with the knee in extension." },
    ],
  },
  {
    id: "cabg",
    name: "Heart Bypass (CABG)",
    specialty: "Cardiothoracic Surgery",
    difficulty: "Advanced",
    duration: "55 min",
    decisions: 78,
    organId: "heart",
    position: [-0.08, 0.85, 0.18],
    layer: "skeleton",
    steps: [
      { number: 1, title: "Sternotomy and Harvest", description: "A median sternotomy is performed." },
      { number: 2, title: "Cardiopulmonary Bypass", description: "The patient is placed on cardiopulmonary bypass." },
      { number: 3, title: "Distal Anastomoses", description: "Each diseased coronary artery is bypassed using the harvested grafts." },
      { number: 4, title: "Proximal Anastomoses and Weaning", description: "Proximal anastomoses are completed." },
    ],
  },
  {
    id: "craniotomy",
    name: "Craniotomy",
    specialty: "Neurosurgery",
    difficulty: "Advanced",
    duration: "60 min",
    decisions: 85,
    organId: "brain",
    position: [0, 1.6, 0.12],
    layer: "skeleton",
    steps: [
      { number: 1, title: "Positioning and Access", description: "The patient is positioned in a Mayfield head holder." },
      { number: 2, title: "Craniotomy Flap", description: "Burr holes are drilled at strategic locations." },
      { number: 3, title: "Dural Opening and Tumor Resection", description: "The dura is opened and reflected." },
      { number: 4, title: "Closure and Reconstruction", description: "Hemostasis is achieved and the dura is closed watertight." },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3D ANATOMY MODEL
// ═══════════════════════════════════════════════════════════════════════════════

function AnatomyModel({
  layerValue,
  selectedOrgan,
  onOrganClick,
}: {
  layerValue: number;
  selectedOrgan: string | null;
  onOrganClick: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
    }
  });

  // Layer visibility calculations
  const skinOpacity = layerValue < 33 ? 1 : Math.max(0, 1 - (layerValue - 33) / 33);
  const muscleOpacity = layerValue >= 33 && layerValue < 66 ? 1 : layerValue < 33 ? Math.max(0, layerValue / 33) : Math.max(0, 1 - (layerValue - 66) / 34);
  const skeletonOpacity = layerValue >= 66 ? 1 : Math.max(0, (layerValue - 33) / 33);

  // Get visible procedures for current layer
  const visibleProcedures = PROCEDURES.filter((proc) => {
    if (layerValue < 33) return true;
    if (layerValue < 66) return proc.layer === "muscle" || proc.layer === "skeleton";
    return proc.layer === "skeleton";
  });

  return (
    <group ref={groupRef}>
      {/* SKIN LAYER */}
      <group visible={skinOpacity > 0}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.8, 16, 32]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
        <mesh position={[0, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
        <mesh position={[-0.32, 0.65, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.05, 0.5, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
        <mesh position={[0.32, 0.65, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.05, 0.5, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
        <mesh position={[-0.1, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.6, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
        <mesh position={[0.1, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.6, 8, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} transparent opacity={skinOpacity * 0.9} />
        </mesh>
      </group>

      {/* MUSCLE LAYER */}
      <group visible={muscleOpacity > 0}>
        {/* Chest */}
        <mesh position={[-0.1, 0.85, 0.08]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#c8715a" roughness={0.7} transparent opacity={muscleOpacity * 0.85} />
        </mesh>
        <mesh position={[0.1, 0.85, 0.08]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#c8715a" roughness={0.7} transparent opacity={muscleOpacity * 0.85} />
        </mesh>
        {/* Heart */}
        <mesh position={[-0.02, 0.85, 0.12]} castShadow onClick={() => onOrganClick("heart")}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#c44" roughness={0.6} emissive={selectedOrgan === "heart" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "heart" ? 0.3 : 0} transparent opacity={muscleOpacity} />
        </mesh>
        {/* Liver */}
        <mesh position={[0.08, 0.55, 0.05]} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#8b4513" roughness={0.7} transparent opacity={muscleOpacity * 0.7} />
        </mesh>
        {/* Gallbladder */}
        <mesh position={[0.15, 0.55, 0.08]} castShadow onClick={() => onOrganClick("gallbladder")}>
          <capsuleGeometry args={[0.015, 0.04, 8, 16]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.6} emissive={selectedOrgan === "gallbladder" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "gallbladder" ? 0.4 : 0} transparent opacity={muscleOpacity} />
        </mesh>
        {/* Appendix */}
        <mesh position={[0.12, 0.2, 0.08]} castShadow onClick={() => onOrganClick("appendix")}>
          <capsuleGeometry args={[0.01, 0.04, 8, 16]} />
          <meshStandardMaterial color="#e57373" roughness={0.6} emissive={selectedOrgan === "appendix" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "appendix" ? 0.5 : 0} transparent opacity={muscleOpacity} />
        </mesh>
        {/* Uterus */}
        <mesh position={[0, 0.05, 0.08]} castShadow onClick={() => onOrganClick("uterus")}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#d4a5a5" roughness={0.7} emissive={selectedOrgan === "uterus" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "uterus" ? 0.4 : 0} transparent opacity={muscleOpacity} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.1, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.55, 8, 16]} />
          <meshStandardMaterial color="#c8715a" roughness={0.7} transparent opacity={muscleOpacity * 0.85} />
        </mesh>
        <mesh position={[0.1, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.06, 0.55, 8, 16]} />
          <meshStandardMaterial color="#c8715a" roughness={0.7} transparent opacity={muscleOpacity * 0.85} />
        </mesh>
      </group>

      {/* SKELETON LAYER */}
      <group visible={skeletonOpacity > 0}>
        {/* Skull */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.14, 32, 32]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.8} transparent opacity={skeletonOpacity} />
        </mesh>
        {/* Spine */}
        {[-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4].map((y, i) => (
          <mesh key={`spine-${i}`} position={[0, 1.45 - y, -0.05]} castShadow>
            <boxGeometry args={[0.05, 0.06, 0.06]} />
            <meshStandardMaterial color="#e8dcd0" roughness={0.7} transparent opacity={skeletonOpacity} />
          </mesh>
        ))}
        {/* Ribcage */}
        {[-1, 1].map((side) =>
          [0, 0.08, 0.16, 0.24, 0.32, 0.4].map((offset, i) => (
            <mesh key={`rib-${side}-${i}`} position={[side * (0.12 + offset * 0.15), 0.85 - offset * 0.15, 0]} rotation={[0, 0, side * 0.3]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
              <meshStandardMaterial color="#e8dcd0" roughness={0.7} transparent opacity={skeletonOpacity} />
            </mesh>
          ))
        )}
        {/* Pelvis */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <torusGeometry args={[0.12, 0.04, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.7} transparent opacity={skeletonOpacity} />
        </mesh>
        {/* Femur */}
        <mesh position={[-0.1, -0.2, 0]} rotation={[0.1, 0, 0]} castShadow>
          <capsuleGeometry args={[0.025, 0.35, 8, 16]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.7} transparent opacity={skeletonOpacity} />
        </mesh>
        <mesh position={[0.1, -0.2, 0]} rotation={[0.1, 0, 0]} castShadow>
          <capsuleGeometry args={[0.025, 0.35, 8, 16]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.7} transparent opacity={skeletonOpacity} />
        </mesh>
        {/* Knee */}
        <mesh position={[-0.1, -0.45, 0.03]} castShadow onClick={() => onOrganClick("knee")}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.6} emissive={selectedOrgan === "knee" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "knee" ? 0.4 : 0} transparent opacity={skeletonOpacity} />
        </mesh>
        <mesh position={[0.1, -0.45, 0.03]} castShadow onClick={() => onOrganClick("knee")}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#e8dcd0" roughness={0.6} emissive={selectedOrgan === "knee" ? "#5DCAA5" : "#000"} emissiveIntensity={selectedOrgan === "knee" ? 0.4 : 0} transparent opacity={skeletonOpacity} />
        </mesh>
      </group>

      {/* HOTSPOTS */}
      {visibleProcedures.map((proc) => (
        <Hotspot key={proc.organId} procedure={proc} position={proc.position} isSelected={selectedOrgan === proc.organId} onClick={() => onOrganClick(proc.organId)} />
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOTSPOT
// ═══════════════════════════════════════════════════════════════════════════════

function Hotspot({ procedure, position, isSelected, onClick }: { procedure: Procedure; position: [number, number, number]; isSelected: boolean; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(isSelected ? 1.8 : scale);
    }
    if (glowRef.current && glowRef.current.material) {
      const glowScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      glowRef.current.scale.setScalar(isSelected ? 2.5 : glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.5 : 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={isSelected ? "#5DCAA5" : "#7EC8E3"} transparent opacity={0.2} />
      </mesh>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={isSelected ? "#5DCAA5" : "#7EC8E3"} />
      </mesh>
      <Html position={[0, 0.05, 0]} center style={{ transition: "all 0.2s", opacity: isSelected ? 1 : 0.8, transform: `scale(${isSelected ? 1.2 : 1})`, pointerEvents: "none", userSelect: "none" }}>
        <div className="px-2 py-1 rounded-full bg-[#0A1628]/90 backdrop-blur-sm border border-primary/30 text-xs font-semibold text-white whitespace-nowrap" style={{ fontFamily: "'Syne', sans-serif" }}>
          {procedure.name}
        </div>
      </Html>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════════════════════

function Scene({ layerValue, selectedOrgan, onOrganClick }: { layerValue: number; selectedOrgan: string | null; onOrganClick: (id: string) => void }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#7EC8E3" />
      <pointLight position={[0, 2, 3]} intensity={0.6} color="#7EC8E3" />
      <Environment preset="studio" />
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.2}>
        <AnatomyModel layerValue={layerValue} selectedOrgan={selectedOrgan} onOrganClick={onOrganClick} />
      </Float>
      <OrbitControls enablePan={false} enableZoom={true} minDistance={2} maxDistance={5} autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AnatomyExplorer() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [layerValue, setLayerValue] = useState(0);

  const selectedProcedure = selectedOrgan ? PROCEDURES.find((p) => p.organId === selectedOrgan) || null : null;

  // Layer label
  const layerLabel = layerValue < 33 ? "Skin" : layerValue < 66 ? "Muscle" : "Skeleton";
  const layerColor = layerValue < 33 ? "#d4a574" : layerValue < 66 ? "#c8715a" : "#e8dcd0";

  return (
    <div className="min-h-screen bg-[#0A1628] overflow-hidden">
      <div className="h-screen pt-20 flex flex-col lg:flex-row">
        {/* 3D Viewer */}
        <div className="w-full lg:w-[60%] h-[50%] lg:h-full relative">
          <Canvas camera={{ position: [0, 0.5, 3], fov: 50 }} shadows className="w-full h-full">
            <Suspense fallback={null}>
              <Scene layerValue={layerValue} selectedOrgan={selectedOrgan} onOrganClick={setSelectedOrgan} />
            </Suspense>
          </Canvas>

          {/* Layer Slider */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <ScrubinStaticPanel glowColor="blue" className="px-6 py-4">
              <div className="flex items-center gap-6">
                {/* Layer indicator */}
                <div className="flex items-center gap-2 min-w-[80px]">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layerColor }} />
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {layerLabel}
                  </span>
                </div>

                {/* Slider */}
                <div className="w-56">
                  <Slider value={[layerValue]} min={0} max={100} step={1} onValueChange={(vals) => setLayerValue(vals[0])} className="cursor-pointer" />
                </div>

                {/* Icons */}
                <Layers className="w-4 h-4 text-white/40" />
              </div>
            </ScrubinStaticPanel>
          </div>

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/30 text-xs font-mono-data">Drag to rotate | Scroll to zoom</p>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-[40%] h-[50%] lg:h-full border-l border-primary/10 overflow-y-auto">
          <ProcedureInfo procedure={selectedProcedure} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE INFO PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function ProcedureInfo({ procedure }: { procedure: Procedure | null }) {
  const [stepIndex, setStepIndex] = useState(0);

  if (!procedure) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-center">
          <Activity className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
          <p className="text-white/40 text-sm font-mono-data">Select a hotspot to explore</p>
        </motion.div>
      </div>
    );
  }

  const diffConfig = {
    Beginner: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    Intermediate: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    Advanced: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  };
  const diff = diffConfig[procedure.difficulty];
  const step = procedure.steps[stepIndex];

  return (
    <div className="h-full flex flex-col p-5">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {procedure.name}
          </h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${diff.color} ${diff.bg} font-mono-data shrink-0`}>
            {procedure.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50 font-mono-data">
          <span>{procedure.specialty}</span>
          <span className="text-white/20">|</span>
          <span>{procedure.duration}</span>
          <span className="text-white/20">|</span>
          <span>{procedure.decisions} decisions</span>
        </div>
      </div>

      {/* Step Navigator */}
      <ScrubinCard glowColor="blue" variant="static" className="mb-4">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>
              {step.number}
            </span>
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {step.title}
            </h3>
          </div>
          <p className="text-xs text-white/60 leading-relaxed mb-4">{step.description}</p>

          {/* Step dots */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {procedure.steps.map((_, idx) => (
                <button key={idx} onClick={() => setStepIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === stepIndex ? "bg-primary w-6" : idx < stepIndex ? "bg-primary/50" : "bg-white/20"}`} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))} disabled={stepIndex === 0} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowLeft className="w-4 h-4 text-white/70" />
              </button>
              <button onClick={() => setStepIndex((prev) => Math.min(procedure.steps.length - 1, prev + 1))} disabled={stepIndex === procedure.steps.length - 1} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ArrowRight className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </ScrubinCard>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Steps", value: procedure.steps.length },
          { label: "Decisions", value: procedure.decisions },
          { label: "Duration", value: procedure.duration },
        ].map((stat) => (
          <div key={stat.label} className="text-center py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-xs text-white/40 font-mono-data">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 space-y-2">
        <Link href={`/simulation?proc=${procedure.id}`} className="block">
          <Button className="w-full bg-primary hover:bg-primary/90 text-[#0A1628] font-bold py-3 rounded-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            <Play className="w-4 h-4 mr-2" />
            Enter Simulation
          </Button>
        </Link>
        <Link href={`/learn?procedure=${procedure.name}`} className="block">
          <Button variant="outline" className="w-full border-white/20 hover:border-primary/50 hover:bg-primary/5 py-3 rounded-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            <BookOpen className="w-4 h-4 mr-2" />
            Full Surgical Guide
          </Button>
        </Link>
      </div>
    </div>
  );
}

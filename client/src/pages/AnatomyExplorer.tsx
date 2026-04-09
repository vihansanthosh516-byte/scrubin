/**
 * Anatomy Explorer — Premium 3D Interactive Experience
 * Three.js powered rotating anatomical body with glowing hotspots
 */

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Lottie from "lottie-react";
import { Play, BookOpen, Activity, Stethoscope, RotateCcw } from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProcedureStep {
  number: number;
  title: string;
  description: string;
}

export interface Procedure {
  id: string;
  name: string;
  specialty: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  decisions: number;
  animationFile: string;
  organId: string;
  icon: string;
  steps: ProcedureStep[];
  position: [number, number, number]; // 3D position for hotspot
}

const PROCEDURES: Procedure[] = [
  {
    id: "craniotomy",
    name: "Craniotomy",
    specialty: "Neurosurgery",
    difficulty: "Advanced",
    duration: "60 min",
    decisions: 85,
    animationFile: "/animations/craniotomy.json",
    organId: "brain",
    icon: "🧠",
    position: [0, 1.6, 0],
    steps: [
      { number: 1, title: "Positioning and Access", description: "The patient is positioned in a Mayfield head holder. A curvilinear scalp incision is made, and the scalp flap is reflected forward to expose the skull." },
      { number: 2, title: "Craniotomy Flap", description: "Burr holes are drilled at strategic locations. A craniotome connects the burr holes, creating a bone flap that is carefully removed to expose the dura." },
      { number: 3, title: "Dural Opening and Tumor Resection", description: "The dura is opened and reflected. Under microscopic visualization, the tumor is carefully dissected from surrounding brain tissue." },
      { number: 4, title: "Closure and Reconstruction", description: "Hemostasis is achieved and the dura is closed watertight. The bone flap is secured with titanium plates and screws." },
    ],
  },
  {
    id: "cabg",
    name: "Heart Bypass (CABG)",
    specialty: "Cardiothoracic Surgery",
    difficulty: "Advanced",
    duration: "55 min",
    decisions: 78,
    animationFile: "/animations/heart-bypass.json",
    organId: "heart",
    icon: "❤️",
    position: [-0.1, 0.9, 0.15],
    steps: [
      { number: 1, title: "Sternotomy and Harvest", description: "A median sternotomy is performed. The left internal mammary artery is harvested, and saphenous vein grafts are harvested from the leg." },
      { number: 2, title: "Cardiopulmonary Bypass", description: "The patient is placed on cardiopulmonary bypass. Cannulae are inserted into the ascending aorta and right atrium." },
      { number: 3, title: "Distal Anastomoses", description: "Each diseased coronary artery is bypassed using the harvested grafts. The LIMA is anastomosed to the LAD." },
      { number: 4, title: "Proximal Anastomoses and Weaning", description: "Proximal anastomoses are completed. The patient is weaned from bypass and the chest is closed." },
    ],
  },
  {
    id: "cholecystectomy",
    name: "Cholecystectomy",
    specialty: "General Surgery",
    difficulty: "Intermediate",
    duration: "30 min",
    decisions: 51,
    animationFile: "/animations/cholecystectomy.json",
    organId: "gallbladder",
    icon: "🫁",
    position: [0.25, 0.65, 0.1],
    steps: [
      { number: 1, title: "Port Placement", description: "Four laparoscopic ports are placed: umbilical camera port, epigastric operating port, and two subcostal retraction ports." },
      { number: 2, title: "Calot's Triangle Dissection", description: "The gallbladder is retracted to expose Calot's triangle. The cystic duct and artery are identified." },
      { number: 3, title: "Ligation and Division", description: "The cystic duct and artery are clipped and divided. The gallbladder is dissected from the liver bed." },
      { number: 4, title: "Extraction and Closure", description: "The gallbladder is placed in a specimen bag and removed. Port sites are closed." },
    ],
  },
  {
    id: "appendectomy",
    name: "Appendectomy",
    specialty: "General Surgery",
    difficulty: "Beginner",
    duration: "25 min",
    decisions: 42,
    animationFile: "/animations/appendectomy.json",
    organId: "appendix",
    icon: "🫀",
    position: [0.2, 0.25, 0.1],
    steps: [
      { number: 1, title: "Anesthesia and Access", description: "General anesthesia is administered. Three laparoscopic ports are inserted, with the camera port at the umbilicus." },
      { number: 2, title: "Locating the Appendix", description: "The laparoscope navigates to the right lower quadrant. The inflamed appendix is identified at the convergence of the taenia coli." },
      { number: 3, title: "Ligation and Division", description: "The mesoappendix is divided using ultrasonic shears. The appendix base is secured with endoloops." },
      { number: 4, title: "Extraction and Closure", description: "The specimen is removed through the umbilical port. Fascia and skin are closed." },
    ],
  },
  {
    id: "c-section",
    name: "C-Section",
    specialty: "OB/GYN",
    difficulty: "Intermediate",
    duration: "28 min",
    decisions: 44,
    animationFile: "/animations/c-section.json",
    organId: "uterus",
    icon: "👶",
    position: [0, 0.05, 0.1],
    steps: [
      { number: 1, title: "Preparation and Incision", description: "A Pfannenstiel skin incision is made above the pubic symphysis. The fascia is opened transversely." },
      { number: 2, title: "Uterine Entry", description: "The peritoneum is opened and the bladder is reflected. A low transverse uterine incision is made." },
      { number: 3, title: "Delivery of the Infant", description: "The surgeon delivers the infant's head. The cord is clamped and the infant is handed to neonatology." },
      { number: 4, title: "Uterine Repair and Closure", description: "The placenta is delivered and the uterus is closed in two layers. Fascia and skin are closed." },
    ],
  },
  {
    id: "acl-reconstruction",
    name: "ACL Reconstruction",
    specialty: "Orthopedic Surgery",
    difficulty: "Intermediate",
    duration: "35 min",
    decisions: 48,
    animationFile: "/animations/acl-reconstruction.json",
    organId: "knee",
    icon: "🦴",
    position: [-0.15, -0.6, 0.1],
    steps: [
      { number: 1, title: "Arthroscopy and Graft Harvest", description: "Diagnostic arthroscopy assesses the ACL tear. A patellar tendon or hamstring graft is harvested." },
      { number: 2, title: "Tunnel Preparation", description: "The tibial tunnel is created at the native ACL footprint. The femoral tunnel is drilled for anatomic placement." },
      { number: 3, title: "Graft Passage and Fixation", description: "The graft is passed through the tunnels. Femoral and tibial fixation are achieved with interference screws." },
      { number: 4, title: "Tensioning and Closure", description: "The graft is tensioned with the knee in extension. Portals are closed and a brace is applied." },
    ],
  },
  {
    id: "spinal-fusion",
    name: "Spinal Fusion",
    specialty: "Spine Surgery",
    difficulty: "Advanced",
    duration: "45 min",
    decisions: 62,
    animationFile: "/animations/spinal-fusion.json",
    organId: "spine",
    icon: "🦴",
    position: [0, 0.5, -0.15],
    steps: [
      { number: 1, title: "Positioning and Exposure", description: "The patient is positioned prone. A midline incision is made and paraspinal muscles are dissected off the spine." },
      { number: 2, title: "Decompression and Facetectomy", description: "Laminectomy is performed to decompress neural elements. Facet joints are removed at fusion levels." },
      { number: 3, title: "Pedicle Screw Placement", description: "Pedicle screws are placed under fluoroscopic guidance, angling medially into the vertebral body." },
      { number: 4, title: "Rod Placement and Grafting", description: "Contoured rods are secured to the screws. Bone graft is packed into the lateral gutter fusion bed." },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3D HUMAN BODY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function HumanBody({ selectedOrgan, onOrganClick }: { selectedOrgan: string | null; onOrganClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.6, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Shoulders */}
      <mesh position={[-0.22, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.22, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Upper Arms */}
      <mesh position={[-0.28, 0.95, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.04, 0.25, 8, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.28, 0.95, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.04, 0.25, 8, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Lower Arms */}
      <mesh position={[-0.35, 0.6, 0]} rotation={[0, 0, 0.15]} castShadow>
        <capsuleGeometry args={[0.035, 0.3, 8, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.35, 0.6, 0]} rotation={[0, 0, -0.15]} castShadow>
        <capsuleGeometry args={[0.035, 0.3, 8, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Pelvis */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.15, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Upper Legs */}
      <mesh position={[-0.1, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.35, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.15, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.35, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Knees */}
      <mesh position={[-0.1, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.5, 0]} castShadow>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#1a1520" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Lower Legs */}
      <mesh position={[-0.1, -0.85, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.35, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.1, -0.85, 0]} castShadow>
        <capsuleGeometry args={[0.045, 0.35, 16, 32]} />
        <meshStandardMaterial color="#1a1520" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Hotspots */}
      {PROCEDURES.map((proc) => (
        <Hotspot
          key={proc.organId}
          position={proc.position}
          label={proc.icon}
          isSelected={selectedOrgan === proc.organId}
          onClick={() => onOrganClick(proc.organId)}
        />
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOTSPOT COMPONENT - Glowing pulsing circle
// ═══════════════════════════════════════════════════════════════════════════════

function Hotspot({
  position,
  label,
  isSelected,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      meshRef.current.scale.setScalar(isSelected ? 1.5 : scale);
    }
    if (glowRef.current && glowRef.current.material) {
      const glowScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      glowRef.current.scale.setScalar(isSelected ? 2 : glowScale);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.4 : 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#5DCAA5" : "#7EC8E3"}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Inner circle */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#5DCAA5" : "#7EC8E3"}
        />
      </mesh>

      {/* Label (HTML overlay) */}
      <Html
        position={[0, 0.06, 0]}
        center
        style={{
          transition: "all 0.2s",
          opacity: isSelected ? 1 : 0.7,
          transform: `scale(${isSelected ? 1.2 : 1})`,
          pointerEvents: "none",
        }}
      >
        <div
          className="text-lg select-none"
          style={{
            textShadow: "0 0 10px rgba(126, 200, 227, 0.8)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Scene({ selectedOrgan, onOrganClick }: { selectedOrgan: string | null; onOrganClick: (id: string) => void }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#7EC8E3" />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#7EC8E3" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Human Body */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <HumanBody selectedOrgan={selectedOrgan} onOrganClick={onOrganClick} />
      </Float>

      {/* Orbit Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function AnatomyExplorer() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);

  const selectedProcedure = selectedOrgan
    ? PROCEDURES.find((p) => p.organId === selectedOrgan) || null
    : null;

  useEffect(() => {
    if (selectedProcedure) {
      fetch(selectedProcedure.animationFile)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setAnimationData(data))
        .catch(() => setAnimationData(null));
    } else {
      setAnimationData(null);
    }
  }, [selectedProcedure]);

  const handleOrganClick = useCallback((organId: string) => {
    setSelectedOrgan(organId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0906] overflow-hidden">
      <Navbar />

      {/* Main layout */}
      <div className="h-screen pt-16 flex flex-col md:flex-row">
        {/* Left side - 3D Body (55%) */}
        <div className="w-full md:w-[55%] h-[50%] md:h-full relative">
          {/* 3D Canvas */}
          <Canvas
            camera={{ position: [0, 0.5, 3], fov: 50 }}
            shadows
            className="w-full h-full"
          >
            <Suspense fallback={null}>
              <Scene selectedOrgan={selectedOrgan} onOrganClick={handleOrganClick} />
            </Suspense>
          </Canvas>

          {/* Instructions overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/40 text-sm font-mono">Drag to rotate • Scroll to zoom</p>
          </div>
        </div>

        {/* Right side - Procedure Panel (45%) */}
        <div className="w-full md:w-[45%] h-[50%] md:h-full bg-[#0D1117] border-l border-white/5 overflow-y-auto">
          <ProcedurePanel
            procedure={selectedProcedure}
            animationData={animationData}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE PANEL - Matching ProcedureLibrary card style
// ═══════════════════════════════════════════════════════════════════════════════

function ProcedurePanel({
  procedure,
  animationData,
}: {
  procedure: Procedure | null;
  animationData: object | null;
}) {
  if (!procedure) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <Activity className="w-12 h-12 text-[#7EC8E3] mx-auto mb-4 opacity-50" />
          <p className="text-white/40 text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
            Click a hotspot to explore
          </p>
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-4"
          >
            <span className="inline-block w-2 h-5 bg-[#7EC8E3]/30 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const difficultyConfig = {
    Beginner: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    Intermediate: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    Advanced: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  };

  const diff = difficultyConfig[procedure.difficulty];

  return (
    <motion.div
      key={procedure.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col p-6 overflow-y-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {procedure.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${diff.color} ${diff.bg} font-mono`}>
            {procedure.difficulty}
          </span>
          <span className="text-white/50 text-sm">{procedure.specialty}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/40 font-mono text-sm">{procedure.duration}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/40 font-mono text-sm">{procedure.decisions} decisions</span>
        </div>
      </motion.div>

      {/* Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-muted/30 to-muted/10"
        style={{ height: "35%", minHeight: "180px", maxHeight: "250px" }}
      >
        {animationData ? (
          <Lottie animationData={animationData} loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Stethoscope className="w-12 h-12 text-white/20" />
            </motion.div>
            <p className="text-white/30 text-sm font-mono mt-3">Animation loading</p>
          </div>
        )}
      </motion.div>

      {/* Steps - Card style matching ProcedureLibrary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2
          className="text-lg font-bold text-white mb-4"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {procedure.steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.1 }}
              className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-primary/20 bg-card/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(126,200,227,0.15)] hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
              <div className="relative z-10 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="text-2xl font-bold text-[#7EC8E3]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3
                      className="text-sm font-bold text-white mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-auto pt-4"
      >
        <div className="flex flex-col gap-3">
          <Link href={`/simulation?proc=${procedure.id}`}>
            <Button
              className="w-full bg-[#7EC8E3] hover:bg-[#7EC8E3]/90 text-[#0A0906] font-bold py-4 rounded-xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Play className="w-5 h-5 mr-2" />
              Enter Simulation
            </Button>
          </Link>
          <Link href="/learn">
            <Button
              variant="outline"
              className="w-full border-white/20 hover:border-[#7EC8E3]/50 hover:bg-[#7EC8E3]/5 py-4 rounded-xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Read in Learn Hub
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

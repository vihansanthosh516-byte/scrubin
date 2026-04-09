/**
 * Anatomy Explorer — Immersive Surgical Training Experience
 * Dark, cinematic, interactive medical documentary feel
 * Left: anatomical body with organs | Right: procedure panel
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Lottie from "lottie-react";
import { Play, BookOpen, Activity, Stethoscope } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE DATA — Medically accurate content for each surgery
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
  steps: ProcedureStep[];
  organId: string;
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
    steps: [
      {
        number: 1,
        title: "Positioning and Access",
        description: "The patient is positioned in a Mayfield head holder with the surgical site exposed. A curvilinear scalp incision is made, and the scalp flap is reflected forward to expose the skull.",
      },
      {
        number: 2,
        title: "Craniotomy Flap",
        description: "A series of burr holes are drilled at strategic locations. A craniotome is used to connect the burr holes, creating a bone flap that is carefully removed to expose the dura mater.",
      },
      {
        number: 3,
        title: "Dural Opening and Tumor Resection",
        description: "The dura is opened and reflected. Under microscopic visualization, the tumor is carefully dissected from surrounding brain tissue using microsurgical techniques, preserving critical neurovascular structures.",
      },
      {
        number: 4,
        title: "Closure and Reconstruction",
        description: "Hemostasis is achieved and the dura is closed watertight. The bone flap is secured with titanium plates and screws. The scalp is closed in layers with galeal sutures and skin staples.",
      },
    ],
  },
  {
    id: "heart-bypass",
    name: "Coronary Artery Bypass Grafting",
    specialty: "Cardiothoracic Surgery",
    difficulty: "Advanced",
    duration: "55 min",
    decisions: 78,
    animationFile: "/animations/heart-bypass.json",
    organId: "heart",
    steps: [
      {
        number: 1,
        title: "Sternotomy and Harvest",
        description: "A median sternotomy is performed to access the heart. The left internal mammary artery is harvested in situ, and saphenous vein grafts are harvested from the leg for additional bypasses.",
      },
      {
        number: 2,
        title: "Cardiopulmonary Bypass",
        description: "The patient is placed on cardiopulmonary bypass. Cannulae are inserted into the ascending aorta and right atrium. The heart is arrested with cold cardioplegia solution.",
      },
      {
        number: 3,
        title: "Distal Anastomoses",
        description: "With the heart still, each diseased coronary artery is bypassed using the harvested grafts. The LIMA is anastomosed to the LAD, and vein grafts are connected to the right coronary and circumflex territories.",
      },
      {
        number: 4,
        title: "Proximal Anastomoses and Weaning",
        description: "Proximal anastomoses are completed on the ascending aorta. The cross-clamp is removed, and the heart is reperfused. The patient is weaned from bypass and chest closure is performed with sternal wires.",
      },
    ],
  },
  {
    id: "cholecystectomy",
    name: "Laparoscopic Cholecystectomy",
    specialty: "General Surgery",
    difficulty: "Intermediate",
    duration: "30 min",
    decisions: 51,
    animationFile: "/animations/cholecystectomy.json",
    organId: "gallbladder",
    steps: [
      {
        number: 1,
        title: "Port Placement and Access",
        description: "Four laparoscopic ports are placed: a 10mm umbilical port for the camera, a 10mm epigastric port for the operating instrument, and two 5mm ports in the right subcostal region for retraction.",
      },
      {
        number: 2,
        title: "Calot's Triangle Dissection",
        description: "The gallbladder is retracted superiorly to expose Calot's triangle. Peritoneal layers are carefully dissected to identify the cystic duct and cystic artery, with critical visualization of the common bile duct.",
      },
      {
        number: 3,
        title: "Ligation and Division",
        description: "The cystic duct and artery are clipped with titanium clips and divided. The gallbladder is then dissected from the liver bed using electrocautery or ultrasonic dissection.",
      },
      {
        number: 4,
        title: "Extraction and Closure",
        description: "The gallbladder is placed in a specimen bag and removed through the umbilical port. The fascia at port sites larger than 5mm is closed, and skin is closed with subcuticular sutures.",
      },
    ],
  },
  {
    id: "appendectomy",
    name: "Laparoscopic Appendectomy",
    specialty: "General Surgery",
    difficulty: "Beginner",
    duration: "25 min",
    decisions: 42,
    animationFile: "/animations/appendectomy.json",
    organId: "appendix",
    steps: [
      {
        number: 1,
        title: "Anesthesia and Access",
        description: "General anesthesia is administered and three small laparoscopic ports are inserted into the abdomen. The camera port goes through the umbilicus, with working ports in the left lower quadrant and suprapubic region.",
      },
      {
        number: 2,
        title: "Locating the Appendix",
        description: "The laparoscope enters and the surgeon navigates to the right lower quadrant. The inflamed appendix is identified at the convergence of the taenia coli on the cecum.",
      },
      {
        number: 3,
        title: "Ligation and Division",
        description: "The mesoappendix containing the appendiceal artery is divided using ultrasonic shears or clips. The appendix base is secured with endoloops and then sharply divided.",
      },
      {
        number: 4,
        title: "Extraction and Closure",
        description: "The specimen is placed in an endobag and removed through the umbilical port. The fascia at the umbilical site is closed with absorbable suture, and skin incisions are closed with subcuticular Monocryl.",
      },
    ],
  },
  {
    id: "c-section",
    name: "Cesarean Section",
    specialty: "Obstetrics & Gynecology",
    difficulty: "Intermediate",
    duration: "28 min",
    decisions: 44,
    animationFile: "/animations/c-section.json",
    organId: "uterus",
    steps: [
      {
        number: 1,
        title: "Preparation and Incision",
        description: "A Pfannenstiel skin incision is made approximately 2cm above the pubic symphysis. The subcutaneous tissue is dissected, and the fascia is opened transversely. The rectus muscles are separated in the midline.",
      },
      {
        number: 2,
        title: "Uterine Entry",
        description: "The peritoneum is opened and the bladder is reflected inferiorly. A low transverse uterine incision is made in the lower uterine segment, carefully avoiding the bladder and extending laterally.",
      },
      {
        number: 3,
        title: "Delivery of the Infant",
        description: "The surgeon's hand is introduced into the uterine cavity to deliver the infant's head. Gentle fundal pressure assists delivery. The cord is clamped and cut, and the infant is handed to the neonatal team.",
      },
      {
        number: 4,
        title: "Uterine Repair and Closure",
        description: "The placenta is delivered and the uterus is closed in two layers with absorbable suture. The peritoneum and fascia are closed, and the skin is approximated with subcuticular suture or staples.",
      },
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
    steps: [
      {
        number: 1,
        title: "Diagnostic Arthroscopy and Graft Harvest",
        description: "Diagnostic arthroscopy is performed to assess the ACL tear and any associated meniscal or chondral injuries. A patellar tendon or hamstring graft is harvested and prepared on the back table.",
      },
      {
        number: 2,
        title: "Tunnel Preparation",
        description: "The tibial tunnel is created using a guide to position the tunnel at the native ACL footprint. The femoral tunnel is drilled through the tibial tunnel or via an accessory portal for anatomic placement.",
      },
      {
        number: 3,
        title: "Graft Passage and Fixation",
        description: "The graft is passed through the tunnels using a passing suture. Femoral fixation is achieved with an interference screw or suspensory button. Tibial fixation is performed with an interference screw.",
      },
      {
        number: 4,
        title: "Tensioning and Closure",
        description: "The graft is tensioned with the knee in full extension. Range of motion is verified, and the arthroscopy portals are closed with simple sutures. A sterile dressing and hinged knee brace are applied.",
      },
    ],
  },
  {
    id: "spinal-fusion",
    name: "Posterior Lumbar Fusion",
    specialty: "Spine Surgery",
    difficulty: "Advanced",
    duration: "45 min",
    decisions: 62,
    animationFile: "/animations/spinal-fusion.json",
    organId: "spine",
    steps: [
      {
        number: 1,
        title: "Positioning and Exposure",
        description: "The patient is positioned prone on a Jackson table. A midline incision is made over the affected levels. The paraspinal muscles are dissected off the spinous processes and lamina to expose the facet joints and transverse processes.",
      },
      {
        number: 2,
        title: "Decompression and Facetectomy",
        description: "Laminectomy is performed to decompress the neural elements. The facet joints are removed bilaterally at the fusion levels, creating room for the nerve roots and exposing bleeding bone for fusion.",
      },
      {
        number: 3,
        title: "Pedicle Screw Placement",
        description: "Pedicle screws are placed under fluoroscopic guidance using the freehand technique or navigation. The screw trajectory starts at the junction of the transverse process and facet, angling medially into the vertebral body.",
      },
      {
        number: 4,
        title: "Rod Placement and Bone Grafting",
        description: "Contoured rods are secured to the screws with set screws. The transverse processes are decorticated, and autograft and allograft bone are packed into the lateral gutter fusion bed. The wound is closed over drains.",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

type ViewType = "front" | "back";

export default function AnatomyExplorer() {
  const [view, setView] = useState<ViewType>("front");
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [breathPhase, setBreathPhase] = useState(0);
  const [heartBeat, setHeartBeat] = useState(0);

  // Get selected procedure
  const selectedProcedure = selectedOrgan
    ? PROCEDURES.find((p) => p.organId === selectedOrgan) || null
    : null;

  // Breathing animation - 4 second loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 100);
    }, 40); // 100 steps over 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Heartbeat animation - 0.85 second loop (70 bpm)
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat((prev) => (prev + 1) % 100);
    }, 8.5); // 100 steps over 0.85 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOrganClick = useCallback((organId: string) => {
    setSelectedOrgan(organId);
  }, []);

  const handleOrganHover = useCallback((organId: string | null) => {
    setHoveredOrgan(organId);
  }, []);

  const handleViewToggle = useCallback(() => {
    setView((prev) => (prev === "front" ? "back" : "front"));
    setSelectedOrgan(null);
    setHoveredOrgan(null);
  }, []);

  // Calculate breathing scale (subtle 0.8% expansion)
  const breathScale = 1 + 0.004 * Math.sin((breathPhase / 100) * 2 * Math.PI);

  // Calculate heartbeat scale (4% pulse at systole)
  const heartScale = 1 + 0.04 * Math.max(0, Math.sin((heartBeat / 100) * 2 * Math.PI - 0.5));

  return (
    <div className="min-h-screen bg-[#0A0906] overflow-hidden">
      <Navbar />

      {/* Main layout - split screen */}
      <div className="h-screen pt-20 flex flex-col md:flex-row">
        {/* Left side - Body diagram (45%) */}
        <div className="w-full md:w-[45%] h-[45%] md:h-full relative flex items-center justify-center">
          {/* View toggle pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 bg-[#111009] rounded-full p-1 border border-white/10">
              <button
                onClick={() => setView("front")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  view === "front"
                    ? "bg-[#7EC8E3] text-[#0A0906]"
                    : "text-white/60 hover:text-white"
                }`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Front
              </button>
              <button
                onClick={() => setView("back")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  view === "back"
                    ? "bg-[#7EC8E3] text-[#0A0906]"
                    : "text-white/60 hover:text-white"
                }`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Back
              </button>
            </div>
          </div>

          {/* Body SVG */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center"
            >
              <BodyDiagram
                view={view}
                selectedOrgan={selectedOrgan}
                hoveredOrgan={hoveredOrgan}
                onOrganClick={handleOrganClick}
                onOrganHover={handleOrganHover}
                breathScale={breathScale}
                heartScale={heartScale}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side - Procedure panel (55%) */}
        <div className="w-full md:w-[55%] h-[55%] md:h-full bg-[#111009] border-l border-white/5 overflow-y-auto">
          <ProcedurePanel procedure={selectedProcedure} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BODY DIAGRAM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface BodyDiagramProps {
  view: ViewType;
  selectedOrgan: string | null;
  hoveredOrgan: string | null;
  onOrganClick: (organId: string) => void;
  onOrganHover: (organId: string | null) => void;
  breathScale: number;
  heartScale: number;
}

function BodyDiagram({
  view,
  selectedOrgan,
  hoveredOrgan,
  onOrganClick,
  onOrganHover,
  breathScale,
  heartScale,
}: BodyDiagramProps) {
  const organOpacity = 0.2;
  const glowColor = "#7EC8E3";
  const selectedColor = "#5DCAA5";

  // Check if organ is active (hovered or selected)
  const isOrganActive = (organId: string) => {
    return hoveredOrgan === organId || selectedOrgan === organId;
  };

  return (
    <svg
      viewBox="0 0 400 700"
      className="w-full max-w-lg h-auto max-h-[90%]"
      style={{ filter: "drop-shadow(0 0 40px rgba(126, 200, 227, 0.05))" }}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1915" />
          <stop offset="100%" stopColor="#0d0c0a" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Body silhouette */}
      <g transform="translate(200, 350)">
        {view === "front" ? (
          <FrontView
            selectedOrgan={selectedOrgan}
            hoveredOrgan={hoveredOrgan}
            onOrganClick={onOrganClick}
            onOrganHover={onOrganHover}
            breathScale={breathScale}
            heartScale={heartScale}
            organOpacity={organOpacity}
            glowColor={glowColor}
            selectedColor={selectedColor}
            isOrganActive={isOrganActive}
          />
        ) : (
          <BackView
            selectedOrgan={selectedOrgan}
            hoveredOrgan={hoveredOrgan}
            onOrganClick={onOrganClick}
            onOrganHover={onOrganHover}
            organOpacity={organOpacity}
            glowColor={glowColor}
            selectedColor={selectedColor}
            isOrganActive={isOrganActive}
          />
        )}
      </g>

      {/* Subtle vignette overlay */}
      <rect
        x="0"
        y="0"
        width="400"
        height="700"
        fill="url(#bodyGradient)"
        opacity="0.3"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRONT VIEW - Detailed anatomical organs
// ═══════════════════════════════════════════════════════════════════════════════

function FrontView({
  selectedOrgan,
  hoveredOrgan,
  onOrganClick,
  onOrganHover,
  breathScale,
  heartScale,
  organOpacity,
  glowColor,
  selectedColor,
  isOrganActive,
}: {
  selectedOrgan: string | null;
  hoveredOrgan: string | null;
  onOrganClick: (organId: string) => void;
  onOrganHover: (organId: string | null) => void;
  breathScale: number;
  heartScale: number;
  organOpacity: number;
  glowColor: string;
  selectedColor: string;
  isOrganActive: (organId: string) => boolean;
}) {
  return (
    <>
      {/* Head outline */}
      <ellipse
        cx="0"
        cy="-280"
        rx="55"
        ry="65"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* Brain */}
      <motion.g
        initial={{ opacity: organOpacity }}
        animate={{
          opacity: isOrganActive("brain") ? 1 : organOpacity,
        }}
        transition={{ duration: 0.2 }}
        style={{
          filter: isOrganActive("brain") ? "url(#strongGlow)" : "none",
        }}
      >
        <motion.path
          d="M-35,-310 Q-40,-340 -20,-350 Q0,-360 20,-350 Q40,-340 35,-310 Q30,-280 0,-275 Q-30,-280 -35,-310"
          fill="none"
          stroke={selectedOrgan === "brain" ? selectedColor : glowColor}
          strokeWidth="1.5"
          className="cursor-pointer"
          onMouseEnter={() => onOrganHover("brain")}
          onMouseLeave={() => onOrganHover(null)}
          onClick={() => onOrganClick("brain")}
        />
        {/* Brain sulci details */}
        <path
          d="M-20,-330 Q-10,-320 0,-330 Q10,-340 20,-330"
          fill="none"
          stroke={selectedOrgan === "brain" ? selectedColor : glowColor}
          strokeWidth="0.8"
          opacity="0.6"
        />
      </motion.g>

      {/* Neck */}
      <rect x="-18" y="-220" width="36" height="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Torso outline - with breathing animation */}
      <motion.g style={{ scale: breathScale, originX: 0, originY: -100 }}>
        {/* Ribcage outline */}
        <path
          d="M-70,-190 Q-80,-150 -75,-100 L-70,-50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <path
          d="M70,-190 Q80,-150 75,-100 L70,-50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Left Lung */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{
            opacity: isOrganActive("lung") ? 1 : organOpacity,
            scale: breathScale,
          }}
          transition={{ duration: 0.2 }}
          style={{
            filter: isOrganActive("lung") ? "url(#strongGlow)" : "none",
            transformOrigin: "-35px -140px",
          }}
        >
          <path
            d="M-65,-180 Q-75,-160 -70,-130 Q-65,-100 -50,-90 L-35,-90 Q-30,-110 -30,-140 Q-30,-170 -45,-180 Q-55,-190 -65,-180"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("lung")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("lung")}
          />
          {/* Lung fissure */}
          <path
            d="M-55,-140 Q-45,-145 -40,-135"
            fill="none"
            stroke={glowColor}
            strokeWidth="0.6"
            opacity="0.5"
          />
        </motion.g>

        {/* Right Lung */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{
            opacity: isOrganActive("lung") ? 1 : organOpacity,
            scale: breathScale,
          }}
          transition={{ duration: 0.2 }}
          style={{
            filter: isOrganActive("lung") ? "url(#strongGlow)" : "none",
            transformOrigin: "35px -140px",
          }}
        >
          <path
            d="M65,-180 Q75,-160 70,-130 Q65,-100 50,-90 L35,-90 Q30,-110 30,-140 Q30,-170 45,-180 Q55,-190 65,-180"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("lung")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("lung")}
          />
          <path
            d="M55,-140 Q45,-145 40,-135"
            fill="none"
            stroke={glowColor}
            strokeWidth="0.6"
            opacity="0.5"
          />
        </motion.g>

        {/* Heart - with heartbeat animation */}
        <motion.g
          animate={{
            scale: heartScale,
            opacity: isOrganActive("heart") ? 1 : organOpacity,
          }}
          transition={{ duration: 0.08 }}
          style={{
            filter: isOrganActive("heart") ? "url(#strongGlow)" : "url(#glow)",
            transformOrigin: "0px -130px",
          }}
        >
          <path
            d="M0,-160 Q-30,-175 -35,-145 Q-38,-125 -20,-110 L0,-90 L20,-110 Q38,-125 35,-145 Q30,-175 0,-160"
            fill="none"
            stroke={selectedOrgan === "heart" ? selectedColor : glowColor}
            strokeWidth="1.5"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("heart")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("heart")}
          />
          {/* Coronary arteries */}
          <path
            d="M-15,-130 Q-5,-125 0,-115 Q5,-125 15,-130"
            fill="none"
            stroke={selectedOrgan === "heart" ? selectedColor : glowColor}
            strokeWidth="0.6"
            opacity="0.6"
          />
        </motion.g>

        {/* Liver */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{ opacity: isOrganActive("liver") ? 1 : organOpacity }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("liver") ? "url(#strongGlow)" : "none" }}
        >
          <path
            d="M50,-80 Q60,-70 55,-40 Q45,-20 25,-15 L-20,-20 Q-30,-40 -25,-60 Q-15,-80 10,-85 Q30,-90 50,-80"
            fill="none"
            stroke={glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("liver")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("liver")}
          />
          {/* Liver lobes */}
          <path d="M10,-60 Q20,-55 25,-45" fill="none" stroke={glowColor} strokeWidth="0.5" opacity="0.4" />
        </motion.g>

        {/* Gallbladder */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{ opacity: isOrganActive("gallbladder") ? 1 : organOpacity }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("gallbladder") ? "url(#strongGlow)" : "none" }}
        >
          <path
            d="M35,-55 Q40,-50 38,-40 Q35,-35 30,-38 Q28,-48 30,-55 Q32,-60 35,-55"
            fill="none"
            stroke={selectedOrgan === "gallbladder" ? selectedColor : glowColor}
            strokeWidth="1"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("gallbladder")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("gallbladder")}
          />
        </motion.g>

        {/* Stomach */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{ opacity: isOrganActive("stomach") ? 1 : organOpacity }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("stomach") ? "url(#strongGlow)" : "none" }}
        >
          <path
            d="M-15,-60 Q-35,-55 -45,-35 Q-50,-15 -40,5 Q-25,15 -10,10 Q5,0 10,-20 Q12,-45 -5,-55 Q-10,-60 -15,-60"
            fill="none"
            stroke={glowColor}
            strokeWidth="1"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("stomach")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("stomach")}
          />
        </motion.g>

        {/* Small intestine outline */}
        <motion.g
          initial={{ opacity: organOpacity * 0.5 }}
          animate={{ opacity: isOrganActive("intestine") ? 1 : organOpacity * 0.5 }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("intestine") ? "url(#glow)" : "none" }}
        >
          <ellipse
            cx="0"
            cy="30"
            rx="45"
            ry="35"
            fill="none"
            stroke={glowColor}
            strokeWidth="0.8"
            opacity="0.5"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("intestine")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("intestine")}
          />
        </motion.g>

        {/* Appendix - Right Lower Quadrant */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{ opacity: isOrganActive("appendix") ? 1 : organOpacity }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("appendix") ? "url(#strongGlow)" : "none" }}
        >
          <path
            d="M40,45 Q50,50 52,60 Q50,70 42,68 Q38,60 40,45"
            fill="none"
            stroke={selectedOrgan === "appendix" ? selectedColor : glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("appendix")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("appendix")}
          />
          {/* Appendix connection to cecum */}
          <circle cx="42" cy="45" r="3" fill="none" stroke={glowColor} strokeWidth="0.8" />
        </motion.g>

        {/* Uterus (centered lower abdomen) */}
        <motion.g
          initial={{ opacity: organOpacity }}
          animate={{ opacity: isOrganActive("uterus") ? 1 : organOpacity }}
          transition={{ duration: 0.2 }}
          style={{ filter: isOrganActive("uterus") ? "url(#strongGlow)" : "none" }}
        >
          <path
            d="M-20,80 Q-25,90 -20,100 Q-10,110 0,105 Q10,110 20,100 Q25,90 20,80 Q10,75 0,78 Q-10,75 -20,80"
            fill="none"
            stroke={selectedOrgan === "uterus" ? selectedColor : glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("uterus")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("uterus")}
          />
          {/* Fallopian tubes */}
          <path d="M-20,85 Q-35,80 -45,75" fill="none" stroke={glowColor} strokeWidth="0.6" opacity="0.5" />
          <path d="M20,85 Q35,80 45,75" fill="none" stroke={glowColor} strokeWidth="0.6" opacity="0.5" />
        </motion.g>
      </motion.g>

      {/* Left Knee */}
      <motion.g
        initial={{ opacity: organOpacity }}
        animate={{ opacity: isOrganActive("knee") ? 1 : organOpacity }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("knee") ? "url(#strongGlow)" : "none" }}
      >
        <g transform="translate(-50, 220)">
          <ellipse
            cx="0"
            cy="0"
            rx="25"
            ry="35"
            fill="none"
            stroke={selectedOrgan === "knee" ? selectedColor : glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("knee")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("knee")}
          />
          {/* ACL representation */}
          <path d="M-8,-10 L8,15" fill="none" stroke={glowColor} strokeWidth="0.8" opacity="0.6" />
          <path d="M8,-10 L-8,15" fill="none" stroke={glowColor} strokeWidth="0.8" opacity="0.4" />
        </g>
      </motion.g>

      {/* Right Knee */}
      <motion.g
        initial={{ opacity: organOpacity }}
        animate={{ opacity: isOrganActive("knee") ? 1 : organOpacity }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("knee") ? "url(#strongGlow)" : "none" }}
      >
        <g transform="translate(50, 220)">
          <ellipse
            cx="0"
            cy="0"
            rx="25"
            ry="35"
            fill="none"
            stroke={selectedOrgan === "knee" ? selectedColor : glowColor}
            strokeWidth="1.2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("knee")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("knee")}
          />
          <path d="M-8,-10 L8,15" fill="none" stroke={glowColor} strokeWidth="0.8" opacity="0.6" />
          <path d="M8,-10 L-8,15" fill="none" stroke={glowColor} strokeWidth="0.8" opacity="0.4" />
        </g>
      </motion.g>

      {/* Legs outline */}
      <path d="M-30,130 Q-35,180 -50,250" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M-50,280 Q-55,350 -50,320" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M30,130 Q35,180 50,250" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M50,280 Q55,350 50,320" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACK VIEW - Spine, Kidneys, Shoulder blades
// ═══════════════════════════════════════════════════════════════════════════════

function BackView({
  selectedOrgan,
  hoveredOrgan,
  onOrganClick,
  onOrganHover,
  organOpacity,
  glowColor,
  selectedColor,
  isOrganActive,
}: {
  selectedOrgan: string | null;
  hoveredOrgan: string | null;
  onOrganClick: (organId: string) => void;
  onOrganHover: (organId: string | null) => void;
  organOpacity: number;
  glowColor: string;
  selectedColor: string;
  isOrganActive: (organId: string) => boolean;
}) {
  return (
    <>
      {/* Head outline */}
      <ellipse cx="0" cy="-280" rx="55" ry="65" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Neck */}
      <rect x="-18" y="-220" width="36" height="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Spine - with faint glow */}
      <motion.g
        initial={{ opacity: 0.25 }}
        animate={{ opacity: isOrganActive("spine") ? 1 : 0.25 }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("spine") ? "url(#strongGlow)" : "url(#glow)" }}
      >
        {/* Cervical vertebrae */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={`cervical-${i}`}
            x="-8"
            y={-210 + i * 12}
            width="16"
            height="10"
            fill="none"
            stroke={selectedOrgan === "spine" ? selectedColor : glowColor}
            strokeWidth="0.8"
            rx="2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("spine")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("spine")}
          />
        ))}
        {/* Thoracic vertebrae */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <rect
            key={`thoracic-${i}`}
            x="-10"
            y={-126 + i * 12}
            width="20"
            height="10"
            fill="none"
            stroke={selectedOrgan === "spine" ? selectedColor : glowColor}
            strokeWidth="0.8"
            rx="2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("spine")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("spine")}
          />
        ))}
        {/* Lumbar vertebrae */}
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={`lumbar-${i}`}
            x="-12"
            y={10 + i * 14}
            width="24"
            height="12"
            fill="none"
            stroke={selectedOrgan === "spine" ? selectedColor : glowColor}
            strokeWidth="1"
            rx="2"
            className="cursor-pointer"
            onMouseEnter={() => onOrganHover("spine")}
            onMouseLeave={() => onOrganHover(null)}
            onClick={() => onOrganClick("spine")}
          />
        ))}
      </motion.g>

      {/* Left Shoulder Blade (Scapula) */}
      <motion.g
        initial={{ opacity: organOpacity * 0.6 }}
        animate={{ opacity: isOrganActive("scapula") ? 1 : organOpacity * 0.6 }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("scapula") ? "url(#glow)" : "none" }}
      >
        <path
          d="M-70,-160 Q-85,-140 -80,-100 Q-75,-70 -55,-60 L-45,-80 Q-55,-110 -55,-140 Q-60,-160 -70,-160"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          className="cursor-pointer"
          onMouseEnter={() => onOrganHover("scapula")}
          onMouseLeave={() => onOrganHover(null)}
          onClick={() => onOrganClick("scapula")}
        />
      </motion.g>

      {/* Right Shoulder Blade */}
      <motion.g
        initial={{ opacity: organOpacity * 0.6 }}
        animate={{ opacity: isOrganActive("scapula") ? 1 : organOpacity * 0.6 }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("scapula") ? "url(#glow)" : "none" }}
      >
        <path
          d="M70,-160 Q85,-140 80,-100 Q75,-70 55,-60 L45,-80 Q55,-110 55,-140 Q60,-160 70,-160"
          fill="none"
          stroke={glowColor}
          strokeWidth="1"
          className="cursor-pointer"
          onMouseEnter={() => onOrganHover("scapula")}
          onMouseLeave={() => onOrganHover(null)}
          onClick={() => onOrganClick("scapula")}
        />
      </motion.g>

      {/* Left Kidney */}
      <motion.g
        initial={{ opacity: organOpacity }}
        animate={{ opacity: isOrganActive("kidney") ? 1 : organOpacity }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("kidney") ? "url(#strongGlow)" : "none" }}
      >
        <path
          d="M-50,0 Q-60,10 -55,30 Q-45,45 -35,40 Q-25,30 -30,10 Q-35,-5 -50,0"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.2"
          className="cursor-pointer"
          onMouseEnter={() => onOrganHover("kidney")}
          onMouseLeave={() => onOrganHover(null)}
          onClick={() => onOrganClick("kidney")}
        />
      </motion.g>

      {/* Right Kidney */}
      <motion.g
        initial={{ opacity: organOpacity }}
        animate={{ opacity: isOrganActive("kidney") ? 1 : organOpacity }}
        transition={{ duration: 0.2 }}
        style={{ filter: isOrganActive("kidney") ? "url(#strongGlow)" : "none" }}
      >
        <path
          d="M50,0 Q60,10 55,30 Q45,45 35,40 Q25,30 30,10 Q35,-5 50,0"
          fill="none"
          stroke={glowColor}
          strokeWidth="1.2"
          className="cursor-pointer"
          onMouseEnter={() => onOrganHover("kidney")}
          onMouseLeave={() => onOrganHover(null)}
          onClick={() => onOrganClick("kidney")}
        />
      </motion.g>

      {/* Back outline */}
      <path
        d="M-70,-190 Q-80,-150 -75,-50 Q-70,50 -60,100 Q-50,150 -40,200"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <path
        d="M70,-190 Q80,-150 75,-50 Q70,50 60,100 Q50,150 40,200"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />

      {/* Arms outline */}
      <path d="M-70,-180 Q-85,-170 -95,-130" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M70,-180 Q85,-170 95,-130" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Legs outline */}
      <path d="M-40,150 Q-45,200 -50,280" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <path d="M40,150 Q45,200 50,280" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCEDURE PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProcedurePanel({ procedure }: { procedure: Procedure | null }) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [animationLoading, setAnimationLoading] = useState(false);

  // Load animation when procedure changes
  useEffect(() => {
    if (procedure) {
      setAnimationLoading(true);
      fetch(procedure.animationFile)
        .then((res) => {
          if (!res.ok) throw new Error("Animation not found");
          return res.json();
        })
        .then((data) => {
          setAnimationData(data);
          setAnimationLoading(false);
        })
        .catch(() => {
          setAnimationData(null);
          setAnimationLoading(false);
        });
    } else {
      setAnimationData(null);
    }
  }, [procedure]);

  if (!procedure) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <Activity className="w-12 h-12 text-[#7EC8E3] mx-auto mb-4 opacity-50" />
          <p
            className="text-white/40 text-lg"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Select a region to explore the procedure
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
      className="h-full flex flex-col p-6 md:p-8 overflow-y-auto"
    >
      {/* Section 1: Procedure Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4 mb-2">
          <h1
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {procedure.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${diff.color} ${diff.bg} font-mono`}
          >
            {procedure.difficulty}
          </span>
          <span className="text-white/50 text-sm">{procedure.specialty}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/40 font-mono text-sm">{procedure.duration}</span>
          <span className="text-white/30">•</span>
          <span className="text-white/40 font-mono text-sm">{procedure.decisions} decisions</span>
        </div>
      </motion.div>

      {/* Section 2: Lottie Animation Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative w-full rounded-xl overflow-hidden mb-6"
        style={{ height: "40%", minHeight: "200px", maxHeight: "300px" }}
      >
        <div className="absolute inset-0 bg-[#0A0906] rounded-xl">
          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
            }}
          />

          {animationData ? (
            <Lottie
              animationData={animationData}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Stethoscope className="w-16 h-16 text-white/20" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-4 flex gap-1"
              >
                <div className="w-1 h-1 bg-[#7EC8E3]/40 rounded-full" />
                <div
                  className="w-1 h-1 bg-[#7EC8E3]/40 rounded-full"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1 h-1 bg-[#7EC8E3]/40 rounded-full"
                  style={{ animationDelay: "0.4s" }}
                />
              </motion.div>
              <p className="text-white/30 text-sm font-mono mt-2">Animation loading</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Section 3: How It Works - 4 Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
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
              transition={{ duration: 0.3, delay: 0.25 + index * 0.1 }}
              className="p-4 rounded-xl bg-white/[0.04] border border-[#7EC8E3]/20"
            >
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
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section 4: Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
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

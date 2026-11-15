/**
 * The Home signature: the patient's three vitals as rings in space, beating at 78 bpm.
 * Each ring's lit arc is the reading against its range (HR of 180, SpO2 of 100, MAP of 140).
 * `progress` (0..1, from page scroll) dollies the camera in through the rings.
 * Three.js cannot read CSS variables, so the vital colours are literal here (stamp: answered 48).
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const BEAT_S = 60 / 78;
import { VITALS } from "./vitals";

const COLORS = { dust: "#9FE8CF" };

/** A sharp systole then a soft decay, 0..1, across one beat. */
function beatCurve(t: number) {
  const p = (t % BEAT_S) / BEAT_S;
  return p < 0.12 ? p / 0.12 : Math.exp(-(p - 0.12) * 7);
}

function Ring({ radius, fraction, color, tilt, still }: { radius: number; fraction: number; color: string; tilt: number; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lit = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (still || !group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.z = -Math.PI / 2 + Math.sin(t * 0.15 + radius) * 0.08;
    group.current.rotation.x = tilt + Math.sin(t * 0.22 + radius * 2) * 0.06;
    if (lit.current) lit.current.emissiveIntensity = 0.3 + beatCurve(t + radius * 0.04) * 0.55;
  });
  return (
    <group ref={group} rotation={[tilt, 0, -Math.PI / 2]}>
      <mesh>
        <torusGeometry args={[radius, 0.035, 16, 200]} />
        <meshStandardMaterial color={color} transparent opacity={0.14} roughness={0.6} />
      </mesh>
      <mesh>
        <torusGeometry args={[radius, 0.085, 24, 240, Math.PI * 2 * fraction]} />
        <meshStandardMaterial ref={lit} color={color} emissive={color} emissiveIntensity={0.45} roughness={0.25} metalness={0.35} />
      </mesh>
    </group>
  );
}

function Dust({ still }: { still: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 420;
    const a = new Float32Array(n * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const r = 2.6 + rnd() * 5;
      const th = rnd() * Math.PI * 2;
      a[i * 3] = Math.cos(th) * r;
      a[i * 3 + 1] = (rnd() - 0.5) * 6;
      a[i * 3 + 2] = Math.sin(th) * r - 2;
    }
    return a;
  }, []);
  useFrame(({ clock }) => {
    if (!still && ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={COLORS.dust} size={0.025} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Rig({ progress, still }: { progress?: MotionValue<number>; still: boolean }) {
  const scene = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector2());
  useFrame(({ camera, pointer, clock }) => {
    const p = progress?.get() ?? 0;
    // Dolly in through the rings as the page scrolls past the hero.
    camera.position.z = THREE.MathUtils.lerp(9, 2.4, p);
    camera.position.y = THREE.MathUtils.lerp(0, -0.4, p);
    if (!still) target.current.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.04);
    camera.position.x = target.current.x * 0.5;
    camera.lookAt(0, target.current.y * 0.3, 0);
    if (scene.current && !still) {
      const s = 1 + beatCurve(clock.getElapsedTime()) * 0.018;
      scene.current.scale.setScalar(s);
    }
  });
  return (
    <group ref={scene}>
      {VITALS.map((v, i) => (
        <Ring key={v.key} radius={v.radius} fraction={v.fraction} color={v.color} tilt={0.32 - i * 0.16} still={still} />
      ))}
      <Dust still={still} />
    </group>
  );
}

export default function VitalRings3D({ progress, still = false }: { progress?: MotionValue<number>; still?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={still ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 4, 5]} intensity={18} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={8} color={COLORS.dust} />
      <Rig progress={progress} still={still} />
    </Canvas>
  );
}

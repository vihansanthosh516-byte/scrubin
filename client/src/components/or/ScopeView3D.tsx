import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CaseState, SurgeryState } from "@/engine/types";

/**
 * 3D laparoscopic view. Purely a picture of engine state: nothing here changes
 * the case. The camera sits at the umbilical port looking into the right lower
 * quadrant; drag to look around, scroll to zoom, and it re-centres on the
 * current step unless you have just moved it yourself.
 */

type V3 = [number, number, number];

const CECUM: V3 = [1.3, -0.6, -3.2];
const BASE: V3 = [1.05, -1.1, -2.95];
const LEFT_PORT = new THREE.Vector3(-3.2, -0.6, 0.6);
const RIGHT_PORT = new THREE.Vector3(0.4, -2.6, 0.4);
const THERMAL = new Set(["hook_cautery", "harmonic", "ligasure"]);

// Where the camera looks during each step.
const FOCUS: Record<string, V3> = {
  explore: [0.6, -0.6, -3],
  lyse_adhesions: [1.3, -0.3, -3],
  mobilize_cecum: [1.6, -0.5, -3.3],
  grasp_appendix: [0.8, -1.4, -2.8],
  window: [0.9, -1.2, -2.9],
  divide_meso: [0.8, -1.3, -2.9],
  secure_base: BASE,
  divide_appendix: BASE,
  bag: [0.5, -1.5, -2.7],
  remove_specimen: [0.3, -1, -2],
  irrigate: [0.4, -2, -2.8],
  inspect_hemostasis: [0.9, -1.1, -3],
  control_bleeding: [0.8, -1.3, -2.9],
};
const DEFAULT_FOCUS: V3 = [0.8, -0.9, -3];

interface Scene {
  done: Set<string>;
  running: SurgeryState["running"];
  iap: number;
  bleeding: boolean;
  position: "pelvic" | "retrocecal" | "subcecal";
  perforated: boolean;
  adhesions: boolean;
  tilt: boolean;
}

function readScene(state: CaseState): Scene {
  const s = state.surgery!;
  const f = s.findings.join(" ").toLowerCase();
  return {
    done: new Set(s.done),
    running: s.running,
    iap: s.iap,
    bleeding: s.bleeding,
    position: f.includes("retrocecal") ? "retrocecal" : f.includes("subcecal") ? "subcecal" : "pelvic",
    perforated: f.includes("perforated") && !f.includes("no perforation"),
    adhesions: f.includes("omentum is stuck"),
    tilt: state.position === "left_side_down" || state.position === "left_tilt",
  };
}

// ---------------------------------------------------------------------------
// Textures: generated once, shared by every tissue material.

function makeNoiseTexture(size = 256, seed = 7): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  let x = seed;
  const rnd = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const v = Math.floor(90 + rnd() * 90);
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.beginPath();
    g.arc(rnd() * size, rnd() * size, 1 + rnd() * 5, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

function makeWallTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, "#c46a5c");
  grad.addColorStop(1, "#8e3b33");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  let x = 11;
  const rnd = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  // branching vessels on the peritoneum
  const branch = (px: number, py: number, ang: number, len: number, w: number, depth: number) => {
    if (depth <= 0 || w < 0.4) return;
    const nx = px + Math.cos(ang) * len;
    const ny = py + Math.sin(ang) * len;
    g.strokeStyle = `rgba(110,20,25,${0.25 + 0.1 * depth})`;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(px, py);
    g.quadraticCurveTo((px + nx) / 2 + (rnd() - 0.5) * 20, (py + ny) / 2 + (rnd() - 0.5) * 20, nx, ny);
    g.stroke();
    branch(nx, ny, ang + (rnd() - 0.5) * 0.9, len * 0.75, w * 0.7, depth - 1);
    if (rnd() < 0.7) branch(nx, ny, ang + (rnd() > 0.5 ? 0.7 : -0.7), len * 0.6, w * 0.6, depth - 1);
  };
  for (let i = 0; i < 9; i++) branch(rnd() * size, rnd() * size, rnd() * Math.PI * 2, 50, 3.5, 5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 1);
  return t;
}

function useTextures() {
  return useMemo(() => ({ bump: makeNoiseTexture(), wall: makeWallTexture() }), []);
}

function Wet({ color, bump, opacity = 1, emissive }: { color: string; bump: THREE.Texture; opacity?: number; emissive?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.42}
      clearcoat={1}
      clearcoatRoughness={0.18}
      bumpMap={bump}
      bumpScale={0.6}
      transparent={opacity < 1}
      opacity={opacity}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? 0.25 : 0}
    />
  );
}

function tube(points: V3[], radius: number, segments = 64) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return { curve, geometry: new THREE.TubeGeometry(curve, segments, radius, 16, false) };
}

// ---------------------------------------------------------------------------
// Anatomy

function Cavity({ iap, wall }: { iap: number; wall: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    // The dome lifts as the abdomen fills with CO2.
    const k = 0.55 + 0.45 * Math.min(iap / 12, 1);
    if (ref.current) ref.current.scale.lerp(new THREE.Vector3(8, 5 * k, 8), 0.05);
  });
  return (
    <mesh ref={ref} position={[0, 0, -1.5]} scale={[8, 5, 8]}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshStandardMaterial map={wall} side={THREE.BackSide} roughness={0.55} />
    </mesh>
  );
}

const BOWEL_LOOPS: V3[][] = [
  [[-3.5, -1.8, -1.5], [-2.2, -1.2, -2.4], [-1, -2, -2], [-0.3, -1.6, -3.4], [-1.6, -0.9, -4], [-2.8, -1.6, -3.6]],
  [[-3, -0.2, -2.5], [-1.8, 0.4, -3.2], [-0.8, -0.3, -4.2], [-2, -0.9, -4.8], [-3.4, -0.4, -4.2]],
  [[-1.2, -2.4, -1.2], [0, -2.5, -1.8], [-0.4, -2.2, -2.8], [-1.4, -2.6, -3]],
];

function SmallBowel({ tilt, bump }: { tilt: boolean; bump: THREE.Texture }) {
  const ref = useRef<THREE.Group>(null);
  const geos = useMemo(() => BOWEL_LOOPS.map((p) => tube(p, 0.42, 80).geometry), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Tilting the table lets the bowel fall away from the right lower quadrant.
    ref.current.position.lerp(new THREE.Vector3(tilt ? -1.6 : 0, tilt ? -0.3 : 0, 0), 0.03);
    ref.current.position.y += Math.sin(clock.elapsedTime * 1.3) * 0.002; // peristalsis / breathing
  });
  return (
    <group ref={ref}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <Wet color={i === 1 ? "#d7907f" : "#dc9a88"} bump={bump} />
        </mesh>
      ))}
    </group>
  );
}

function Cecum({ bump, mobilized }: { bump: THREE.Texture; mobilized: boolean }) {
  const ileum = useMemo(() => tube([[-1.5, -0.8, -3.6], [-0.4, -0.9, -3.5], [0.6, -0.7, -3.3], [1.0, -0.6, -3.2]], 0.3).geometry, []);
  const colon = useMemo(() => tube([[1.4, -0.6, -3.3], [1.7, 0.6, -3.6], [1.8, 1.8, -4.2]], 0.62).geometry, []);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    ref.current?.rotation.set(0, 0, THREE.MathUtils.lerp(ref.current.rotation.z, mobilized ? 0.25 : 0, 0.03));
  });
  return (
    <group ref={ref}>
      <mesh position={CECUM} scale={[0.95, 0.8, 0.85]}>
        <sphereGeometry args={[1, 40, 32]} />
        <Wet color="#d99a86" bump={bump} />
      </mesh>
      <mesh geometry={ileum}>
        <Wet color="#d48f7e" bump={bump} />
      </mesh>
      <mesh geometry={colon}>
        <Wet color="#d29783" bump={bump} />
      </mesh>
    </group>
  );
}

function appendixPath(sc: Scene): V3[] {
  const hidden = sc.position === "retrocecal" && !sc.done.has("mobilize_cecum");
  if (hidden) return [BASE, [1.6, -0.9, -3.8], [2.0, -0.4, -4.1], [2.1, 0.2, -4.0]];
  if (sc.position === "subcecal") return [BASE, [1.2, -1.6, -2.9], [1.5, -2.0, -2.7], [1.9, -2.2, -2.6]];
  return [BASE, [0.8, -1.5, -2.8], [0.3, -1.8, -2.6], [-0.2, -1.9, -2.4]];
}

function Appendix({ sc, bump }: { sc: Scene; bump: THREE.Texture }) {
  const d = sc.done;
  const gone = d.has("remove_specimen");
  const bagged = d.has("bag") && !gone;
  const divided = d.has("divide_appendix");
  const pts = appendixPath(sc);
  const key = pts.flat().join(",") + divided;
  const { geometry, curve } = useMemo(() => {
    // Once divided, the specimen drifts away from the stump.
    const shifted = divided ? pts.map((p, i) => (i === 0 ? ([p[0] - 0.12, p[1] - 0.12, p[2] + 0.05] as V3) : ([p[0] - 0.15, p[1] - 0.1, p[2] + 0.1] as V3))) : pts;
    return tube(shifted, sc.perforated ? 0.19 : 0.16, 48);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, sc.perforated]);
  const tip = curve.getPoint(1);
  const meso = useMemo(() => mesoGeometry(curve), [curve]);
  if (gone) return null;
  const color = sc.perforated ? "#8a5a36" : "#e07a66";
  return (
    <group>
      {!bagged && (
        <>
          <mesh geometry={geometry}>
            <Wet color={color} bump={bump} emissive="#5a0f0a" />
          </mesh>
          <mesh position={tip} scale={sc.perforated ? 0.24 : 0.19}>
            <sphereGeometry args={[1, 20, 16]} />
            <Wet color={color} bump={bump} emissive="#5a0f0a" />
          </mesh>
          {sc.perforated && (
            <mesh position={[tip.x + 0.1, tip.y - 0.05, tip.z + 0.1]} scale={[0.22, 0.1, 0.22]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshPhysicalMaterial color="#d8c25a" roughness={0.3} clearcoat={1} />
            </mesh>
          )}
          {!d.has("divide_meso") && (
            <mesh geometry={meso}>
              <meshPhysicalMaterial color="#e9c47c" roughness={0.5} clearcoat={0.6} transparent opacity={d.has("window") ? 0.7 : 0.85} side={THREE.DoubleSide} />
            </mesh>
          )}
        </>
      )}
      {bagged && (
        <mesh position={curve.getPoint(0.6)} scale={[0.5, 0.35, 0.35]}>
          <sphereGeometry args={[1, 24, 18]} />
          <meshPhysicalMaterial color="#eef3f5" roughness={0.2} transmission={0.4} transparent opacity={0.75} clearcoat={1} />
        </mesh>
      )}
    </group>
  );
}

/** Fan of fatty mesentery between the appendix and a root on the cecum. */
function mesoGeometry(curve: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const root = new THREE.Vector3(1.2, -1.05, -3.25);
  const n = 20;
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = 0.05 + (i / n) * 0.9;
    const a = curve.getPoint(t);
    const b = root.clone().lerp(a, 0.25 + 0.15 * Math.sin(t * Math.PI));
    b.y -= 0.08;
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    if (i < n) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Fat lobules that make up the omental apron (local offsets, radii).
const OMENTUM_LOBULES: [V3, number][] = Array.from({ length: 26 }, (_, i) => {
  const a = i * 2.39996; // golden-angle spiral: an even, organic spread
  const r = Math.sqrt(i / 26) * 1.25;
  return [[Math.cos(a) * r, Math.sin(i * 1.7) * 0.06, Math.sin(a) * r * 0.7], 0.22 + ((i * 37) % 10) / 70];
});

function Omentum({ sc, bump }: { sc: Scene; bump: THREE.Texture }) {
  // A fatty apron drapes over the right lower quadrant until explored;
  // adhesions keep part of it stuck to the cecum until they're taken down.
  const explored = sc.done.has("explore");
  const stuck = sc.adhesions && !sc.done.has("lyse_adhesions");
  const target = !explored
    ? { pos: new THREE.Vector3(0.7, -1.15, -2.9), s: 1 }
    : stuck
      ? { pos: new THREE.Vector3(1.45, -0.35, -2.75), s: 0.5 }
      : { pos: new THREE.Vector3(-0.8, 1.6, -4.4), s: 0.6 };
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.lerp(target.pos, 0.03);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target.s, 0.03));
  });
  return (
    <group ref={ref} position={[0.7, -1.15, -2.9]} rotation={[0.35, 0, 0.1]}>
      {OMENTUM_LOBULES.map(([p, r], i) => (
        <mesh key={i} position={p} scale={[r * 1.3, r * 0.45, r]}>
          <sphereGeometry args={[1, 14, 10]} />
          <Wet color={i % 3 ? "#eac47c" : "#e3b56a"} bump={bump} />
        </mesh>
      ))}
    </group>
  );
}

function Ligatures({ sc }: { sc: Scene }) {
  if (!sc.done.has("secure_base")) return null;
  return (
    <group position={BASE}>
      {[0, 0.12].map((o) => (
        <mesh key={o} position={[-o * 0.8, -o * 0.6, o * 0.2]} rotation={[0.3, 0.8, 0.6]}>
          <torusGeometry args={[0.2, 0.035, 10, 32]} />
          <meshStandardMaterial color="#cfd5da" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Blood({ active }: { active: boolean }) {
  const blob = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (blob.current) {
      const s = active ? 0.18 + Math.abs(Math.sin(clock.elapsedTime * 4.5)) * 0.08 : 0.0001;
      blob.current.scale.setScalar(s);
    }
    if (pool.current) {
      const cur = pool.current.scale.x;
      const next = active ? Math.min(cur + dt * 0.05, 1.3) : Math.max(cur - dt * 0.3, 0.0001);
      pool.current.scale.set(next, 1, next);
    }
  });
  return (
    <group>
      <mesh ref={blob} position={[0.85, -1.25, -2.85]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshPhysicalMaterial color="#9c0a0a" roughness={0.1} clearcoat={1} emissive="#3a0000" />
      </mesh>
      <mesh ref={pool} position={[0.4, -2.05, -2.6]} scale={[0.0001, 1, 0.0001]}>
        <cylinderGeometry args={[1, 1, 0.04, 32]} />
        <meshPhysicalMaterial color="#6e0000" roughness={0.05} clearcoat={1} />
      </mesh>
    </group>
  );
}

function Fluid({ sc }: { sc: Scene }) {
  const irrigating = sc.running?.task === "irrigate";
  const pus = sc.perforated && sc.done.has("explore") && !sc.done.has("irrigate");
  if (!irrigating && !pus) return null;
  return (
    <mesh position={[0.1, -2.1, -2.6]} scale={[1.2, 1, 1]}>
      <cylinderGeometry args={[1, 1, 0.03, 32]} />
      <meshPhysicalMaterial color={irrigating ? "#c9dde0" : "#c9b04a"} roughness={0.05} clearcoat={1} transparent opacity={0.75} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Instruments

function Tip({ instrument, open }: { instrument: string | null; open: number }) {
  const steel = <meshStandardMaterial color="#b8c2ca" metalness={0.95} roughness={0.2} />;
  const dark = <meshStandardMaterial color="#2b2f33" metalness={0.6} roughness={0.4} />;
  switch (instrument) {
    case "hook_cautery":
      return (
        <mesh position={[0, 0, 0.12]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.07, 0.015, 8, 16, Math.PI]} />
          {steel}
        </mesh>
      );
    case "suction_irrigator":
    case "veress":
      return null;
    case "stapler":
    case "ligasure":
    case "harmonic":
    case "clip_applier":
    case "grasper":
    case "maryland":
    case "scissors":
    default: {
      const big = instrument === "stapler" ? 2.2 : instrument === "ligasure" ? 1.5 : 1;
      const len = 0.22 * big;
      return (
        <group>
          {[1, -1].map((sgn) => (
            <mesh key={sgn} position={[0, sgn * 0.02 * big, len / 2]} rotation={[sgn * open * 0.35, 0, 0]}>
              <boxGeometry args={[0.05 * big, 0.025 * big, len]} />
              {instrument === "stapler" || instrument === "ligasure" ? dark : steel}
            </mesh>
          ))}
        </group>
      );
    }
  }
}

function Instrument({ port, target, instrument, working, reach = 0 }: { port: THREE.Vector3; target: V3; instrument: string | null; working: boolean; reach?: number }) {
  const ref = useRef<THREE.Group>(null);
  const goal = useMemo(() => new THREE.Vector3(...target), [target]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    // Small purposeful movements while working; still otherwise.
    const wobble = working ? new THREE.Vector3(Math.sin(t * 2.1) * 0.08, Math.sin(t * 2.7) * 0.05, Math.cos(t * 1.7) * 0.06) : new THREE.Vector3();
    const tip = goal.clone().add(wobble);
    tip.add(tip.clone().sub(port).normalize().multiplyScalar(-0.3 + reach));
    const dir = tip.clone().sub(port);
    const len = dir.length();
    ref.current.position.copy(port);
    ref.current.lookAt(tip);
    ref.current.scale.set(1, 1, 1);
    ref.current.userData.len = len;
    const shaft = ref.current.children[0] as THREE.Mesh;
    shaft.scale.set(1, len, 1);
    shaft.position.set(0, 0, len / 2);
    const head = ref.current.children[1];
    head.position.set(0, 0, len);
    head.rotation.z = working ? Math.sin(t * 3) * 0.4 : 0; // wrist roll while working
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 1, 16]} />
        <meshStandardMaterial color="#3c4248" metalness={0.8} roughness={0.35} />
      </mesh>
      <group>
        <Tip instrument={instrument} open={working ? 0.6 : 0.2} />
      </group>
    </group>
  );
}

function Smoke({ active }: { active: boolean }) {
  const count = 60;
  const ref = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const life = new Float32Array(count).map(() => Math.random());
    return { pos, life };
  }, []);
  useFrame((_, dt) => {
    const p = ref.current;
    if (!p) return;
    const mat = p.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, active ? 0.35 : 0, 0.05);
    for (let i = 0; i < count; i++) {
      data.life[i] += dt * 0.5;
      if (data.life[i] > 1) {
        data.life[i] = 0;
        data.pos.set([0.85 + (Math.random() - 0.5) * 0.2, -1.2, -2.85 + (Math.random() - 0.5) * 0.2], i * 3);
      }
      data.pos[i * 3 + 1] += dt * 0.6;
      data.pos[i * 3] += (Math.random() - 0.5) * dt * 0.3;
    }
    (p.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#e8e8e8" size={0.35} transparent opacity={0} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Camera: a headlight like a real scope, and auto-follow of the current step.

function ScopeRig({ focus, controls, userMovedAt }: { focus: V3; controls: React.RefObject<OrbitControlsImpl | null>; userMovedAt: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const light = useRef<THREE.SpotLight>(null);
  const goal = useMemo(() => new THREE.Vector3(...focus), [focus]);
  useFrame(() => {
    const c = controls.current;
    if (c && performance.now() - userMovedAt.current > 6000) {
      c.target.lerp(goal, 0.04);
      c.update();
    }
    if (light.current) {
      light.current.position.copy(camera.position);
      light.current.target.position.copy(c ? c.target : goal);
      light.current.target.updateMatrixWorld();
    }
  });
  return <spotLight ref={light} intensity={60} angle={0.75} penumbra={0.6} decay={1.6} distance={14} color="#fff4e6" />;
}

function Scene3D({ sc, recenter }: { sc: Scene; recenter: number }) {
  const { bump, wall } = useTextures();
  const controls = useRef<OrbitControlsImpl | null>(null);
  const userMovedAt = useRef(0);
  const task = sc.running?.task ?? null;
  const focus = (task && FOCUS[task]) || DEFAULT_FOCUS;
  useEffect(() => {
    userMovedAt.current = 0; // "Recenter" hands the camera back to auto-follow
  }, [recenter]);
  const ins = sc.running?.instrument ?? null;
  const portsIn = sc.done.has("working_ports") && !sc.done.has("desufflate");
  return (
    <>
      <color attach="background" args={["#000"]} />
      <fog attach="fog" args={["#1a0503", 4, 11]} />
      <hemisphereLight args={["#ffd9cc", "#3a0a08", 0.35]} />
      <ScopeRig focus={focus} controls={controls} userMovedAt={userMovedAt} />
      <Cavity iap={sc.iap} wall={wall} />
      <SmallBowel tilt={sc.tilt} bump={bump} />
      <Cecum bump={bump} mobilized={sc.done.has("mobilize_cecum")} />
      <Appendix sc={sc} bump={bump} />
      <Omentum sc={sc} bump={bump} />
      <Ligatures sc={sc} />
      <Blood active={sc.bleeding} />
      <Fluid sc={sc} />
      <Smoke active={!!ins && THERMAL.has(ins) && !!task} />
      {portsIn && (
        <>
          {/* Left hand: grasper retracting the cecum/appendix. */}
          <Instrument port={LEFT_PORT} target={sc.done.has("grasp_appendix") && !sc.done.has("bag") ? appendixPath(sc)[2] : [1.2, -0.4, -2.8]} instrument="grasper" working={false} reach={0.15} />
          {/* Right hand: whatever the running step uses. */}
          {task && ins && <Instrument port={RIGHT_PORT} target={focus} instrument={ins} working />}
        </>
      )}
      <OrbitControls
        ref={controls}
        makeDefault
        target={DEFAULT_FOCUS}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={5.5}
        minPolarAngle={0.9}
        maxPolarAngle={2.2}
        minAzimuthAngle={-0.9}
        maxAzimuthAngle={0.9}
        rotateSpeed={0.5}
        onStart={() => (userMovedAt.current = performance.now())}
        onChange={(e) => {
          if (e && performance.now() - userMovedAt.current < 6000) userMovedAt.current = performance.now();
        }}
      />
    </>
  );
}

export default function ScopeView3D({ state }: { state: CaseState }) {
  const sc = readScene(state);
  const [recenter, setRecenter] = useState(0);
  return (
    <div className="absolute inset-0">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.3, 1.2], fov: 68, near: 0.05, far: 40 }} gl={{ antialias: true }}>
        <Scene3D sc={sc} recenter={recenter} />
      </Canvas>
      {/* Round scope image with dark edges, like a real laparoscope monitor. */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 62% 78% at 50% 50%, transparent 78%, rgba(0,0,0,0.85) 96%, #000 100%)" }} />
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="hidden sm:inline text-[10px] text-white/60">drag to look · scroll to zoom</span>
        <button
          type="button"
          onClick={() => setRecenter((n) => n + 1)}
          className="rounded-sm bg-black/60 px-2 py-0.5 text-[11px] text-white/80 hover:text-white border border-white/20"
        >
          Recenter
        </button>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Uniforms = {
  [key: string]: { value: number[] | number[][] | number; type: string };
};

interface ShaderProps {
  source: string;
  uniforms: {
    [key: string]: { value: number[] | number[][] | number; type: string };
  };
  maxFps?: number;
}

interface SignInPageProps {
  className?: string;
  onGoogleSignIn: () => void;
  onGitHubSignIn: () => void;
  loading?: boolean;
}

export const CanvasRevealEffect = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize,
  showGradient = true,
  reverse = false,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
}) => {
  return (
    <div className={cn("h-full relative w-full", containerClassName)}>
      <div className="h-full w-full">
        <DotMatrix
          colors={colors ?? [[0, 255, 255]]}
          dotSize={dotSize ?? 3}
          opacities={
            opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]
          }
          shader={` ${reverse ? "u_reverse_active" : "false"}_; animation_speed_factor_${animationSpeed.toFixed(1)}_; `}
          center={["x", "y"]}
        />
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      )}
    </div>
  );
};

interface DotMatrixProps {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  shader?: string;
  center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
  colors = [[0, 0, 0]],
  opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
  totalSize = 20,
  dotSize = 2,
  shader = "",
  center = ["x", "y"],
}) => {
  const uniforms = React.useMemo(() => {
    let colorsArray = [
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
      colors[0],
    ];
    if (colors.length === 2) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[1],
      ];
    } else if (colors.length === 3) {
      colorsArray = [
        colors[0],
        colors[0],
        colors[1],
        colors[1],
        colors[2],
        colors[2],
      ];
    }
    return {
      u_colors: {
        value: colorsArray.map((color) => [
          color[0] / 255,
          color[1] / 255,
          color[2] / 255,
        ]),
        type: "uniform3fv",
      },
      u_opacities: { value: opacities, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: {
        value: shader.includes("u_reverse_active") ? 1 : 0,
        type: "uniform1i",
      },
    };
  }, [colors, opacities, totalSize, dotSize, shader]);

  return (
    <Shader
      source={` precision mediump float; in vec2 fragCoord; uniform float u_time; uniform float u_opacities[10]; uniform vec3 u_colors[6]; uniform float u_total_size; uniform float u_dot_size; uniform vec2 u_resolution; uniform int u_reverse; out vec4 fragColor; float PHI = 1.61803398874989484820459; float random(vec2 xy) { return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); } float map(float value, float min1, float max1, float min2, float max2) { return min2 + (value - min1) * (max2 - min2) / (max1 - min1); } void main() { vec2 st = fragCoord.xy; ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""} ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""} float opacity = step(0.0, st.x); opacity *= step(0.0, st.y); vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size)); float frequency = 5.0; float show_offset = random(st2); float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency)); opacity *= u_opacities[int(rand * 10.0)]; opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size)); opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size)); vec3 color = u_colors[int(show_offset * 6.0)]; float animation_speed_factor = 0.5; vec2 center_grid = u_resolution / 2.0 / u_total_size; float dist_from_center = distance(center_grid, st2); float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15); float max_grid_dist = distance(center_grid, vec2(0.0, 0.0)); float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2); float current_timing_offset; if (u_reverse == 1) { current_timing_offset = timing_offset_outro; opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor); opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25); } else { current_timing_offset = timing_offset_intro; opacity *= step(current_timing_offset, u_time * animation_speed_factor); opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25); } fragColor = vec4(color, opacity); fragColor.rgb *= fragColor.a; }`}
      uniforms={uniforms}
      maxFps={60}
    />
  );
};

const ShaderMaterial = ({
  source,
  uniforms,
  maxFps = 60,
}: {
  hovered?: boolean;
  maxFps?: number;
  uniforms: Uniforms;
  source: string;
}) => {
  const { size } = useThree();
  const ref = useRef<THREE.Mesh>(null);
  let lastFrameTime = 0;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const timestamp = clock.getElapsedTime();
    lastFrameTime = timestamp;
    const material: any = ref.current.material;
    const timeLocation = material.uniforms.u_time;
    timeLocation.value = timestamp;
  });

  const getUniforms = () => {
    const preparedUniforms: any = {};
    for (const uniformName in uniforms) {
      const uniform: any = uniforms[uniformName];
      switch (uniform.type) {
        case "uniform1f":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1f" };
          break;
        case "uniform1i":
          preparedUniforms[uniformName] = { value: uniform.value, type: "1i" };
          break;
        case "uniform3f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector3().fromArray(uniform.value),
            type: "3f",
          };
          break;
        case "uniform1fv":
          preparedUniforms[uniformName] = {
            value: uniform.value,
            type: "1fv",
          };
          break;
        case "uniform3fv":
          preparedUniforms[uniformName] = {
            value: uniform.value.map(
              (v: number[]) => new THREE.Vector3().fromArray(v)
            ),
            type: "3fv",
          };
          break;
        case "uniform2f":
          preparedUniforms[uniformName] = {
            value: new THREE.Vector2().fromArray(uniform.value),
            type: "2f",
          };
          break;
        default:
          console.error(`Invalid uniform type for '${uniformName}'.`);
          break;
      }
    }
    preparedUniforms["u_time"] = { value: 0, type: "1f" };
    preparedUniforms["u_resolution"] = {
      value: new THREE.Vector2(size.width * 2, size.height * 2),
    };
    return preparedUniforms;
  };

  const material = useMemo(() => {
    const materialObject = new THREE.ShaderMaterial({
      vertexShader: ` precision mediump float; in vec2 coordinates; uniform vec2 u_resolution; out vec2 fragCoord; void main(){ float x = position.x; float y = position.y; gl_Position = vec4(x, y, 0.0, 1.0); fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution; fragCoord.y = u_resolution.y - fragCoord.y; } `,
      fragmentShader: source,
      uniforms: getUniforms(),
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
    });
    return materialObject;
  }, [size.width, size.height, source]);

  return (
    <mesh ref={ref as any}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
  return (
    <Canvas className="absolute inset-0 h-full w-full">
      <ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} />
    </Canvas>
  );
};

// Google SVG Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.23v2.84C4.13 20.49 7.8 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.23C1.46 8.55 1 10.22 1 12s.46 3.45 1.23 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.8 1 4.13 3.49 2.23 7.07l3.61 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// GitHub Icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
        fill="currentColor"
      />
    </svg>
  );
}

export const SignInPage = ({
  className,
  onGoogleSignIn,
  onGitHubSignIn,
  loading,
}: SignInPageProps) => {
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative", className)}>
      {/* Background Animation Layer */}
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[[126, 200, 227]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="signin-step"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-baby-blue"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h1
                className="text-4xl font-bold tracking-tight text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Scrub<span className="text-baby-blue">In</span>
              </h1>
              <p className="text-sm text-white/50 mt-1 font-mono-data">
                Advanced Surgical Simulator
              </p>
            </motion.div>

            {/* Welcome Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                Welcome Developer
              </h2>
              <p className="text-white/60">
                Sign in to save your progress and track your surgical skills
              </p>
            </motion.div>

            {/* Sign In Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 pt-4"
            >
              {/* Google Sign In */}
              <button
                onClick={onGoogleSignIn}
                disabled={loading}
                className="backdrop-blur-[2px] w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3.5 px-4 transition-all duration-200 hover:border-white/20"
              >
                <GoogleIcon className="w-5 h-5" />
                <span className="font-medium">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-sm">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              {/* GitHub Sign In */}
              <button
                onClick={onGitHubSignIn}
                disabled={loading}
                className="backdrop-blur-[2px] w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3.5 px-4 transition-all duration-200 hover:border-white/20"
              >
                <GitHubIcon className="w-5 h-5" />
                <span className="font-medium">Continue with GitHub</span>
              </button>
            </motion.div>

            {/* Footer Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-white/40 pt-6 leading-relaxed"
            >
              By signing in, you agree to our{" "}
              <a href="#" className="underline text-white/40 hover:text-white/60 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline text-white/40 hover:text-white/60 transition-colors">
                Privacy Policy
              </a>
              . We only use your name and profile picture.
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

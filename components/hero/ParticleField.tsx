"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/components/providers/Providers";

const FOV = 60;
const CAM_Z = 8;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec2 uMouse;
  uniform float uRepelRadius;
  uniform float uRepelStrength;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    vec3 p = position;

    // organic drift (cheap pseudo-noise)
    float t = uTime * uSpeed;
    p.x += sin(t * 0.7 + aSeed * 17.0 + p.y * 0.45) * 0.55;
    p.y += cos(t * 0.55 + aSeed * 23.0 + p.x * 0.35) * 0.45;
    p.z += sin(t * 0.4 + aSeed * 31.0) * 0.35;

    // mouse repel in world xy
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float force = smoothstep(uRepelRadius, 0.0, dist) * uRepelStrength;
    p.xy += normalize(d + 0.0001) * force;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * (26.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uRed;
  uniform float uOpacity;
  uniform float uRedThresh;
  varying float vSeed;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.04, d) * uOpacity;
    // warm gold spectrum variation per particle
    vec3 col = uColor * (0.75 + 0.4 * fract(vSeed * 7.31));
    col.b *= 0.85 + 0.3 * fract(vSeed * 3.77);
    // crimson embers (fraction set per theme via uRedThresh)
    float redMix = step(uRedThresh, fract(vSeed * 13.77));
    col = mix(col, uRed * 1.15, redMix);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* broken enso ring — gold body, crimson fresnel rim */
const ensoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ensoFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uRed;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.0);
    vec3 col = mix(uGold * 0.45, uGold * 1.35, fres);
    col = mix(col, uRed * 1.2, smoothstep(0.62, 1.0, fres) * 0.85);
    float alpha = (0.22 + 0.78 * fres) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

function EnsoRing({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uGold: { value: new THREE.Color("#E2B84C") },
      uRed: { value: new THREE.Color("#D61F33") },
      uAlpha: { value: 0.85 },
    }),
    []
  );

  useEffect(() => {
    const setFrom = (cx: number, cy: number) => {
      mouse.current.x = (cx / window.innerWidth) * 2 - 1;
      mouse.current.y = -((cy / window.innerHeight) * 2 - 1);
    };
    const onPointer = (e: PointerEvent) => setFrom(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setFrom(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current || !mat.current) return;
    const g = group.current;
    g.rotation.z -= delta * 0.12;
    g.rotation.x += (mouse.current.y * 0.35 - g.rotation.x) * 0.045;
    g.rotation.y += (mouse.current.x * 0.5 - g.rotation.y) * 0.045;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    mat.current.uniforms.uGold.value.set(dark ? "#E2B84C" : "#84202A");
    mat.current.uniforms.uRed.value.set(dark ? "#D61F33" : "#A81020");
    mat.current.uniforms.uAlpha.value = dark ? 0.85 : 0.55;
  });

  return (
    <group ref={group} position={[3.4, 0.2, -1.5]} rotation={[0.35, -0.4, 0.6]}>
      <mesh>
        <torusGeometry args={[2.7, 0.045, 32, 220, Math.PI * 1.82]} />
        <shaderMaterial
          ref={mat}
          vertexShader={ensoVertex}
          fragmentShader={ensoFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
      {/* inner echo ring */}
      <mesh rotation={[0.15, 0.2, 1.4]} scale={0.82}>
        <torusGeometry args={[2.7, 0.014, 24, 200, Math.PI * 1.6]} />
        <shaderMaterial
          vertexShader={ensoVertex}
          fragmentShader={ensoFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}

function Particles({ dark, count }: { dark: boolean; count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(-100, -100));
  const scrollVel = useRef(0);
  const lastScroll = useRef(0);
  const lastInput = useRef(0);
  const coarse = useRef(false);

  const { positions, sizes, seeds } = useMemo(() => {
    const COUNT = count;
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1;
      sizes[i] = 0.5 + Math.random() * 2.0;
      seeds[i] = Math.random() * 100;
    }
    return { positions, sizes, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0.28 },
      uMouse: { value: new THREE.Vector2(-100, -100) },
      uRepelRadius: { value: 2.1 },
      uRepelStrength: { value: 0.9 },
      uColor: { value: new THREE.Color("#E2B84C") },
      uRed: { value: new THREE.Color("#D61F33") },
      uOpacity: { value: 0.55 },
      uRedThresh: { value: 0.8 },
    }),
    []
  );

  useEffect(() => {
    coarse.current = window.matchMedia("(pointer: coarse)").matches;
    const setFrom = (cx: number, cy: number) => {
      const ndcX = (cx / window.innerWidth) * 2 - 1;
      const ndcY = -((cy / window.innerHeight) * 2 - 1);
      const halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
      const halfW = halfH * (size.width / size.height);
      mouse.current.set(ndcX * halfW, ndcY * halfH);
      lastInput.current = performance.now();
    };
    const onPointer = (e: PointerEvent) => setFrom(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setFrom(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    // scroll velocity boosts drift speed (brief: scrollSpeedMult 2.0)
    const sy = window.scrollY;
    const v = Math.min(Math.abs(sy - lastScroll.current) / 60, 2.0);
    lastScroll.current = sy;
    scrollVel.current += (v - scrollVel.current) * 0.06;
    u.uSpeed.value = 0.28 * (1 + scrollVel.current * 2.0);
    u.uTime.value += delta;
    // touch devices: when the finger is idle, drift the repel point autonomously
    if (coarse.current && performance.now() - lastInput.current > 2500) {
      const t = u.uTime.value;
      const halfH = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
      const halfW = halfH * (size.width / size.height);
      mouse.current.set(
        Math.sin(t * 0.33) * halfW * 0.55,
        Math.sin(t * 0.21 + 1.7) * halfH * 0.45
      );
    }
    u.uMouse.value.lerp(mouse.current, 0.12);
    u.uColor.value.set(dark ? "#E2B84C" : "#84202A");
    u.uRed.value.set(dark ? "#D61F33" : "#A81020");
    u.uOpacity.value = dark ? 0.55 : 0.28;
    // Stark HUD: ~20% red embers in dark, ~35% in the red/white light theme
    u.uRedThresh.value = dark ? 0.8 : 0.65;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

export default function ParticleField() {
  const { theme } = useTheme();
  const [cfg, setCfg] = useState<{ count: number; dprMax: number } | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const small = window.innerWidth < 640;
    setCfg({ count: small ? 3500 : 9000, dprMax: small ? 1.75 : 2 });
  }, []);

  if (!cfg) {
    // reduced-motion fallback: static gold wash
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgb(var(--accent-gold) / 0.14), transparent 70%)",
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        dpr={[1, cfg.dprMax]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Particles dark={theme === "dark"} count={cfg.count} />
        <EnsoRing dark={theme === "dark"} />
      </Canvas>
    </div>
  );
}

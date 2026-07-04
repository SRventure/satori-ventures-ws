"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SLABS = 4;
const SLAB_W = 2.3;
const SLAB_H = 0.55;
const GAP = 0.025;
const STEP = SLAB_H + GAP;
const SPREAD = 1.05; // extra separation per step when exploded

const slabVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const slabFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uRed;
  uniform float uAlpha;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // abs() = two-sided fresnel; plain max() turns back faces full-bright
    // (solid orange slabs instead of translucent glass)
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float fres = pow(1.0 - ndv, 2.2);
    vec3 col = mix(uGold * 0.55, uGold * 1.30, fres) * uGlow;
    col = mix(col, uRed * 1.15, smoothstep(0.72, 1.0, fres) * 0.75);
    float alpha = (0.3 + 0.7 * fres) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

function Cube({ progress, dark }: { progress: React.MutableRefObject<number>; dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const lines = useRef<(THREE.LineBasicMaterial | null)[]>([]);

  const geo = useMemo(() => new THREE.BoxGeometry(SLAB_W, SLAB_H, SLAB_W), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const uniformsArr = useMemo(
    () =>
      Array.from({ length: SLABS }, () => ({
        uGold: { value: new THREE.Color("#E2B84C") },
        uRed: { value: new THREE.Color("#D61F33") },
        uAlpha: { value: 0.9 },
        uGlow: { value: 1 },
      })),
    []
  );

  useFrame((state, delta) => {
    const p = progress.current;
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // explode envelope: up 0.30→0.52, hold, down 0.70→0.85
    const explode = smoothstep(0.3, 0.52, p) * (1 - smoothstep(0.7, 0.85, p));
    // logo morph: cube dissolves 0.86→0.97
    const dissolve = smoothstep(0.86, 0.97, p);
    // phase-1 glow pulse
    const pulse = 1 + Math.sin(t * 2.1) * 0.14 * (1 - smoothstep(0.25, 0.35, p));

    g.rotation.y += delta * 0.22 * (1 + explode * 0.4);
    g.rotation.x = 0.32 + Math.sin(t * 0.35) * 0.03;
    g.position.y = Math.sin(t * 0.5) * 0.07;
    const s = 1 - dissolve * 0.35;
    g.scale.setScalar(s);

    for (let i = 0; i < SLABS; i++) {
      const slab = slabs.current[i];
      const mat = mats.current[i];
      const line = lines.current[i];
      if (!slab || !mat) continue;
      const centered = i - (SLABS - 1) / 2;
      slab.position.y = centered * (STEP + SPREAD * explode);
      slab.rotation.y = centered * 0.16 * explode;
      const gold = dark ? "#E2B84C" : "#84202A";
      const red = dark ? "#D61F33" : "#A81020";
      mat.uniforms.uGold.value.set(gold);
      mat.uniforms.uRed.value.set(red);
      mat.uniforms.uGlow.value = pulse;
      mat.uniforms.uAlpha.value = (dark ? 0.92 : 0.75) * (1 - dissolve);
      if (line) {
        line.color.set(gold);
        line.opacity = (dark ? 0.85 : 0.7) * (1 - dissolve);
      }
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: SLABS }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            slabs.current[i] = el;
          }}
        >
          <mesh geometry={geo}>
            <shaderMaterial
              ref={(el) => {
                mats.current[i] = el;
              }}
              vertexShader={slabVertex}
              fragmentShader={slabFragment}
              uniforms={uniformsArr[i]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
            />
          </mesh>
          <lineSegments geometry={edges} scale={1.002}>
            <lineBasicMaterial
              ref={(el) => {
                lines.current[i] = el;
              }}
              color="#E2B84C"
              opacity={0.85}
              transparent
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/* sparse gold dust motes (prompt: max 50) */
function Motes({ dark }: { dark: boolean }) {
  const pts = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 11;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pts.current) return;
    pts.current.rotation.y = state.clock.elapsedTime * 0.02;
    const m = pts.current.material as THREE.PointsMaterial;
    m.color.set(dark ? "#E2B84C" : "#84202A");
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} transparent opacity={0.45} depthWrite={false} sizeAttenuation />
    </points>
  );
}

export default function SatoriCubeScene({
  progress,
  dark,
}: {
  progress: React.MutableRefObject<number>;
  dark: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Cube progress={progress} dark={dark} />
      <Motes dark={dark} />
    </Canvas>
  );
}

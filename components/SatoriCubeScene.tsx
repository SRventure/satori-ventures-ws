"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const SLABS = 4;
const SLAB_W = 2.6;
const SLAB_D = 1.7;
const SLAB_H = 0.4;
const GAP = 0.07;
const STEP = SLAB_H + GAP;
const SPREAD = 0.92;

const GOLD = "#E2B84C";
const ACCENTS = ["#00d4ff", "#f59e0b", "#67e8f9", "#a855f7"];

function ss(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/* separation envelope with per-slab parallax stagger; re-assembly is
   squared for a magnetic late snap */
function env(p: number, i: number) {
  const d = i * 0.02;
  const apart = ss(0.3 + d, 0.5 + d, p);
  const back = ss(0.68, 0.84 - i * 0.01, p);
  return apart * (1 - back * back);
}

const slabVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;

/* two-sided fresnel glass: deep glass body -> gold rim, accent bleeding in
   at grazing angles. abs() keeps DoubleSide back faces translucent. */
const slabFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uAccent;
  uniform float uAlpha;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float fres = pow(1.0 - ndv, 2.0);
    float sheen = smoothstep(-0.22, 0.22, vPos.y) * 0.35 + 0.65;
    vec3 body = mix(vec3(0.045, 0.05, 0.075), uGold * 0.5, fres * 0.9) * sheen;
    vec3 col = mix(body, uGold * 1.25, smoothstep(0.45, 0.95, fres));
    col = mix(col, uAccent * 1.35, smoothstep(0.62, 1.0, fres) * 0.8);
    col *= uGlow;
    float alpha = (0.22 + 0.78 * fres) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

function roundedSlabGeometry() {
  const r = 0.16;
  const w = SLAB_W / 2;
  const d = SLAB_D / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -d);
  shape.lineTo(w - r, -d);
  shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r);
  shape.quadraticCurveTo(w, d, w - r, d);
  shape.lineTo(-w + r, d);
  shape.quadraticCurveTo(-w, d, -w, d - r);
  shape.lineTo(-w, -d + r);
  shape.quadraticCurveTo(-w, -d, -w + r, -d);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: SLAB_H - 0.09,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

function Stack({
  progress,
  focusRef,
  onFocus,
  onExpand,
}: {
  progress: React.MutableRefObject<number>;
  focusRef: React.MutableRefObject<number | null>;
  onFocus: (i: number | null) => void;
  onExpand: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const lineMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const coreMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const glowLevels = useRef<number[]>([1, 1, 1, 1]);

  const geo = useMemo(() => roundedSlabGeometry(), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 32), [geo]);
  const coreGeo = useMemo(() => new THREE.BoxGeometry(SLAB_W * 0.72, 0.055, SLAB_D * 0.62), []);
  const uniformsArr = useMemo(
    () =>
      ACCENTS.map((a) => ({
        uGold: { value: new THREE.Color(GOLD) },
        uAccent: { value: new THREE.Color(a) },
        uAlpha: { value: 0.92 },
        uGlow: { value: 1 },
      })),
    []
  );

  useFrame((state, delta) => {
    const p = progress.current;
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const focus = focusRef.current;

    const dissolve = ss(0.86, 0.97, p);
    const explodeAny = env(p, 1);
    const pulse = 1 + Math.sin(t * 2.1) * 0.12 * (1 - ss(0.25, 0.35, p));

    g.rotation.y += delta * (0.16 + explodeAny * 0.08) * (focus === null ? 1 : 0.12);
    g.rotation.x = 0.3 + Math.sin(t * 0.35) * 0.03;
    g.position.y = Math.sin(t * 0.5) * 0.06;
    g.scale.setScalar(1 - dissolve * 0.35);

    for (let i = 0; i < SLABS; i++) {
      const slab = slabs.current[i];
      const mat = mats.current[i];
      const line = lineMats.current[i];
      const core = coreMats.current[i];
      if (!slab || !mat) continue;
      const e = env(p, i);
      const centered = i - (SLABS - 1) / 2;
      slab.position.y = centered * (STEP + SPREAD * e) + Math.sin(t * (0.7 + i * 0.13) + i) * 0.02;
      slab.rotation.y = centered * 0.13 * e;

      // hover focus: hovered slab brightens + lifts scale, others recede
      const target = focus === null ? 1 : focus === i ? 1.5 : 0.42;
      glowLevels.current[i] += (target - glowLevels.current[i]) * Math.min(delta * 9, 1);
      const gl = glowLevels.current[i];
      const sc = 1 + (focus === i ? 0.05 : 0) * Math.min(gl, 1);
      slab.scale.setScalar(sc);

      mat.uniforms.uGlow.value = pulse * gl;
      mat.uniforms.uAlpha.value = 0.92 * (1 - dissolve) * (0.55 + 0.45 * Math.min(gl, 1));
      if (line) {
        line.color.set(GOLD).lerp(new THREE.Color(ACCENTS[i]), 0.35 + 0.4 * e);
        line.opacity = (0.5 + 0.4 * e) * (1 - dissolve) * Math.min(gl, 1.15);
      }
      if (core) {
        // cores stay faint while assembled (clean gold monolith), bloom on separation
        core.opacity =
          (0.1 + 0.72 * e + Math.sin(t * 2.4 + i * 1.7) * (0.04 + 0.1 * e)) *
          (1 - dissolve) *
          Math.min(gl, 1.3);
      }
    }
  });

  return (
    <group ref={group}>
      {ACCENTS.map((accent, i) => (
        <group
          key={i}
          ref={(el) => {
            slabs.current[i] = el;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onFocus(i);
          }}
          onPointerOut={() => onFocus(null)}
          onClick={(e) => {
            e.stopPropagation();
            onExpand(i);
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
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <lineSegments geometry={edges} scale={1.003}>
            <lineBasicMaterial
              ref={(el) => {
                lineMats.current[i] = el;
              }}
              color={GOLD}
              transparent
              opacity={0.6}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
          {/* inner energy cell */}
          <mesh geometry={coreGeo}>
            <meshBasicMaterial
              ref={(el) => {
                coreMats.current[i] = el;
              }}
              color={accent}
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* rising data packets on the stack axis — visible while separated */
function Packets({ progress }: { progress: React.MutableRefObject<number> }) {
  const pts = useRef<THREE.Points>(null);
  const N = 26;
  const seeds = useMemo(
    () =>
      Array.from({ length: N }, () => ({
        r: 0.05 + Math.random() * 0.16,
        a: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.55,
        off: Math.random() * 10,
      })),
    []
  );
  const positions = useMemo(() => new Float32Array(N * 3), []);

  useFrame((state) => {
    const p = pts.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    const span = (SLABS - 1) * (STEP + SPREAD * env(progress.current, 1)) + 1.1;
    const pos = p.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const s = seeds[i];
      const y = ((t * s.speed + s.off) % 1.6) / 1.6;
      pos[i * 3] = Math.cos(s.a + t * 0.4) * s.r;
      pos[i * 3 + 1] = (y - 0.5) * span;
      pos[i * 3 + 2] = Math.sin(s.a + t * 0.4) * s.r;
    }
    p.geometry.attributes.position.needsUpdate = true;
    (p.material as THREE.PointsMaterial).opacity = 0.85 * env(progress.current, 1);
    p.rotation.x = 0.3;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8ff3ff"
        size={0.05}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* sparse gold dust motes */
function Motes() {
  const pts = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 11;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 7;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pts.current) return;
    pts.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={GOLD}
        size={0.04}
        transparent
        opacity={0.4}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* pull the camera back on narrow canvases so the exploded stack fits */
function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.z = size.width < 700 ? 10.6 : 7.6;
    camera.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

export default function SatoriCubeScene({
  progress,
  focusRef,
  onFocus,
  onExpand,
}: {
  progress: React.MutableRefObject<number>;
  focusRef: React.MutableRefObject<number | null>;
  onFocus: (i: number | null) => void;
  onExpand: (i: number) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Rig />
      <Stack progress={progress} focusRef={focusRef} onFocus={onFocus} onExpand={onExpand} />
      <Packets progress={progress} />
      <Motes />
    </Canvas>
  );
}

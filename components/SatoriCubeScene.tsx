"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CUBE_LAYERS } from "./SatoriCube";

/* one tier per thesis layer — the four-layer stack IS the model */
const SLABS = CUBE_LAYERS.length; // 4
const SLAB_W = 2.6;
const SLAB_D = 1.7;
const SLAB_H = 0.4;
const GAP = 0.07;
const STEP = SLAB_H + GAP;
const SPREAD = 0.92;

/* per-theme palettes — dark: restrained neutral stage with gold structure and
   jewel accent per tier glowing additively; light: warm paper glass with
   garnet red-lux structure, normal blending */
const PALETTES = {
  dark: {
    gold: "#E2B84C",
    accents: ["#00d4ff", "#f59e0b", "#67e8f9", "#a855f7"],
    body: new THREE.Color(0.04, 0.045, 0.07),
    alpha: 0.94,
    lineBoost: 1,
  },
  light: {
    gold: "#84202A",
    accents: ["#0369a1", "#b45309", "#0e7490", "#7e22ce"],
    body: new THREE.Color(0.9, 0.86, 0.79),
    alpha: 0.85,
    lineBoost: 1.25,
  },
};

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

/* machined-glass slab: deep neutral body, soft vertical sheen, gold fresnel
   rim, a whisper of the tier's accent at grazing angles. abs() keeps
   DoubleSide back faces translucent without muddy blowout. */
const slabFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uAccent;
  uniform vec3 uBody;
  uniform float uAlpha;
  uniform float uGlow;
  uniform float uAccentMix;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vec3 n = normalize(vNormal);
    float ndv = abs(dot(n, normalize(vView)));
    float fres = pow(1.0 - ndv, 2.6);
    /* soft top-down light: upper faces read brighter, like a gallery spot */
    float sheen = 0.72 + 0.28 * smoothstep(-0.5, 0.5, n.y);
    vec3 body = uBody * sheen;
    /* faint inner depth — the slab's heart carries a hint of accent */
    body += uAccent * 0.05 * uAccentMix * smoothstep(0.3, 0.0, length(vPos.xz));
    vec3 col = mix(body, uGold * 0.85, smoothstep(0.12, 0.75, fres) * 0.7);
    col = mix(col, uGold * 1.15, smoothstep(0.72, 1.0, fres));
    col = mix(col, uAccent * 1.2, smoothstep(0.8, 1.0, fres) * uAccentMix * 0.55);
    col *= uGlow;
    float alpha = (0.2 + 0.8 * fres) * uAlpha;
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

/* ── signature motifs: ONE idea per tier, echoing CUBE_LAYERS ─────────── */

/* Layer 01 · Physical Infrastructure — a clean grid-etched substrate */
function gridGeometry() {
  const w = SLAB_W * 0.36;
  const d = SLAB_D * 0.36;
  const n = 2;
  const y = SLAB_H / 2 + 0.014;
  const pts: number[] = [];
  for (let k = -n; k <= n; k++) {
    const f = (k / n) * (k === -n || k === n ? 1 : 0.98);
    pts.push(-w, y, f * d, w, y, f * d);
    pts.push(f * w, y, -d, f * w, y, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/* Layer 02 · Network & Connectivity — six nodes, five elegant links */
const NET_NODES: [number, number][] = [
  [-0.92, 0.32],
  [-0.38, -0.34],
  [0.08, 0.22],
  [0.62, -0.34],
  [0.95, 0.24],
  [0.34, 0.52],
];
const NET_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
];
function networkGeometry() {
  const pts: number[] = [];
  for (const [a, b] of NET_LINKS) {
    pts.push(NET_NODES[a][0], 0, NET_NODES[a][1], NET_NODES[b][0], 0, NET_NODES[b][1]);
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const nodePos = new Float32Array(NET_NODES.length * 3);
  NET_NODES.forEach(([x, z], i) => {
    nodePos[i * 3] = x;
    nodePos[i * 3 + 1] = 0;
    nodePos[i * 3 + 2] = z;
  });
  const nodes = new THREE.BufferGeometry();
  nodes.setAttribute("position", new THREE.Float32BufferAttribute(nodePos, 3));
  return { lines, nodes };
}

type Motif = (THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.PointsMaterial) & {
  userData: { base: number };
};

function Stack({
  progress,
  focusRef,
  onFocus,
  onExpand,
  dark,
}: {
  progress: React.MutableRefObject<number>;
  focusRef: React.MutableRefObject<number | null>;
  onFocus: (i: number | null) => void;
  onExpand: (i: number) => void;
  dark: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const edgeMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const motifs = useRef<Motif[][]>([[], [], [], []]);
  const spineMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const spine = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial | null>(null);
  const glowLevels = useRef<number[]>([1, 1, 1, 1]);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const geo = useMemo(() => roundedSlabGeometry(), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 32), [geo]);
  const gridGeo = useMemo(() => gridGeometry(), []);
  const network = useMemo(() => networkGeometry(), []);
  const coreGeo = useMemo(() => new THREE.SphereGeometry(0.15, 32, 32), []);
  const haloGeo = useMemo(() => new THREE.SphereGeometry(0.3, 24, 24), []);
  const ringGeo = useMemo(() => {
    const g = new THREE.TorusGeometry(0.52, 0.0075, 8, 96);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const spineGeo = useMemo(() => new THREE.BoxGeometry(0.009, 1, 0.009), []);
  const uniformsArr = useMemo(
    () =>
      Array.from({ length: SLABS }, () => ({
        uGold: { value: new THREE.Color(PALETTES.dark.gold) },
        uAccent: { value: new THREE.Color("#ffffff") },
        uBody: { value: new THREE.Color() },
        uAlpha: { value: 0.94 },
        uGlow: { value: 1 },
        uAccentMix: { value: 0.8 },
      })),
    []
  );

  /* shared geometries are passed by prop, so R3F won't auto-dispose them */
  useEffect(
    () => () => {
      geo.dispose();
      edges.dispose();
      gridGeo.dispose();
      network.lines.dispose();
      network.nodes.dispose();
      coreGeo.dispose();
      haloGeo.dispose();
      ringGeo.dispose();
      spineGeo.dispose();
    },
    [geo, edges, gridGeo, network, coreGeo, haloGeo, ringGeo, spineGeo]
  );

  const regMotif = (i: number, base: number) => (el: THREE.Material | null) => {
    if (el && !motifs.current[i].includes(el as Motif)) {
      el.userData = { base };
      motifs.current[i].push(el as Motif);
    }
  };

  useFrame((state, delta) => {
    const p = progress.current;
    const g = group.current;
    if (!g) return;
    const P = dark ? PALETTES.dark : PALETTES.light;
    const t = state.clock.elapsedTime;
    const focus = focusRef.current;

    const form = ss(0.03, 0.2, p); // gathering in
    const dissolve = ss(0.86, 0.97, p); // resolving into the brand mark
    const explodeAny = env(p, 1);
    const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    const live = (1 - dissolve) * (0.25 + 0.75 * form);

    /* still, confident motion — slow idle, calmer while a tier is focused */
    g.rotation.y += delta * 0.13 * (focus === null ? 1 : 0.15);
    g.rotation.x = 0.3 + Math.sin(t * 0.3) * 0.025;
    g.position.y = Math.sin(t * 0.45) * 0.05;
    g.scale.setScalar((0.92 + 0.08 * form) * (1 - dissolve * 0.3));

    /* the conviction spine: one slim axis through all four tiers */
    const span = (SLABS - 1) * (STEP + SPREAD * explodeAny) + 0.55;
    if (spine.current) spine.current.scale.y = span;
    if (spineMat.current) {
      spineMat.current.color.set(P.gold);
      spineMat.current.opacity = 0.3 * live * (0.35 + 0.65 * explodeAny) * P.lineBoost;
      spineMat.current.blending = blend;
    }

    /* the economy ring precesses with slow grace */
    if (ring.current) {
      ring.current.rotation.x = 1.62 + Math.sin(t * 0.4) * 0.08;
      ring.current.rotation.y = t * 0.22;
    }

    for (let i = 0; i < SLABS; i++) {
      const slab = slabs.current[i];
      const mat = mats.current[i];
      const edge = edgeMats.current[i];
      if (!slab || !mat) continue;
      const e = env(p, i);
      const centered = i - (SLABS - 1) / 2;
      const hovered = focus === i;

      /* hover = a calm lift, not a jump */
      const target = focus === null ? 1 : hovered ? 1.45 : 0.45;
      glowLevels.current[i] += (target - glowLevels.current[i]) * Math.min(delta * 7, 1);
      const gl = glowLevels.current[i];
      const lift = hovered ? 0.07 * Math.min(gl - 1, 1) : 0;

      slab.position.y =
        centered * (STEP + SPREAD * e) + Math.sin(t * (0.6 + i * 0.11) + i) * 0.015 + lift;
      slab.rotation.y = centered * 0.1 * e;
      slab.scale.setScalar(1 + (hovered ? 0.035 : 0) * Math.min(gl, 1));

      mat.uniforms.uGold.value.set(P.gold);
      mat.uniforms.uAccent.value.set(P.accents[i]);
      mat.uniforms.uBody.value.copy(P.body);
      mat.uniforms.uGlow.value = 0.9 + 0.25 * Math.min(gl, 1.4);
      mat.uniforms.uAlpha.value = P.alpha * live * (0.5 + 0.5 * Math.min(gl, 1));
      mat.uniforms.uAccentMix.value = dark ? 0.8 : 0.4;
      mat.blending = blend;

      if (edge) {
        edge.color.set(P.gold);
        edge.opacity = (0.45 + 0.3 * e) * live * Math.min(gl, 1.1) * P.lineBoost;
        edge.blending = blend;
      }

      /* the tier's single motif blooms as the stack separates */
      const vis = (0.25 + 0.75 * e) * live * Math.min(gl, 1.25) * P.lineBoost;
      for (const m of motifs.current[i]) {
        tmpColor.set(P.accents[i]);
        if (m === coreMat.current) {
          /* the intelligence core breathes — the one living accent */
          tmpColor.multiplyScalar(0.85 + 0.15 * Math.sin(t * 1.4));
        }
        m.color.copy(tmpColor);
        m.opacity = m.userData.base * vis;
        m.blending = blend;
      }
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: SLABS }, (_, i) => (
        <group
          key={CUBE_LAYERS[i].strata}
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
          {/* glass slab */}
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
            />
          </mesh>
          {/* clean machined edge */}
          <lineSegments geometry={edges} scale={1.002}>
            <lineBasicMaterial
              ref={(el) => {
                edgeMats.current[i] = el;
              }}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </lineSegments>

          {/* Layer 01 — grid-etched substrate */}
          {i === 0 && (
            <lineSegments geometry={gridGeo}>
              <lineBasicMaterial ref={regMotif(0, 0.5)} transparent opacity={0} depthWrite={false} />
            </lineSegments>
          )}

          {/* Layer 02 — sparse connection lines + nodes */}
          {i === 1 && (
            <>
              <lineSegments geometry={network.lines}>
                <lineBasicMaterial
                  ref={regMotif(1, 0.55)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </lineSegments>
              <points geometry={network.nodes}>
                <pointsMaterial
                  ref={regMotif(1, 0.9)}
                  size={0.06}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  sizeAttenuation
                />
              </points>
            </>
          )}

          {/* Layer 03 — one luminous core */}
          {i === 2 && (
            <>
              <mesh geometry={coreGeo}>
                <meshBasicMaterial
                  ref={(el) => {
                    coreMat.current = el;
                    regMotif(2, 0.95)(el);
                  }}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
              <mesh geometry={haloGeo}>
                <meshBasicMaterial
                  ref={regMotif(2, dark ? 0.14 : 0.07)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
            </>
          )}

          {/* Layer 04 — one graceful ring */}
          {i === 3 && (
            <mesh ref={ring} geometry={ringGeo}>
              <meshBasicMaterial ref={regMotif(3, 0.65)} transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}

      {/* the through-line: one conviction axis piercing all four tiers */}
      <mesh ref={spine} geometry={spineGeo}>
        <meshBasicMaterial
          ref={(el) => {
            spineMat.current = el;
          }}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
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
  dark,
}: {
  progress: React.MutableRefObject<number>;
  focusRef: React.MutableRefObject<number | null>;
  onFocus: (i: number | null) => void;
  onExpand: (i: number) => void;
  dark: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.6], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Rig />
      <Stack
        progress={progress}
        focusRef={focusRef}
        onFocus={onFocus}
        onExpand={onExpand}
        dark={dark}
      />
    </Canvas>
  );
}

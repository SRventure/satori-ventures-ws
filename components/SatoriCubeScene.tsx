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

/* per-theme palettes — dark: gold + neon accents glowing additively on the
   near-black stage; light: garnet red-lux with normal blending on warm paper */
const PALETTES = {
  dark: {
    gold: "#E2B84C",
    accents: ["#00d4ff", "#f59e0b", "#67e8f9", "#a855f7"],
    body: new THREE.Color(0.045, 0.05, 0.075),
    packets: "#8ff3ff",
    alpha: 0.92,
    lineBoost: 1,
  },
  light: {
    gold: "#84202A",
    accents: ["#0369a1", "#b45309", "#0e7490", "#7e22ce"],
    body: new THREE.Color(0.88, 0.83, 0.76),
    packets: "#A81020",
    alpha: 0.8,
    lineBoost: 1.3,
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

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

/* two-sided fresnel glass: theme body -> gold rim, accent bleeding in
   at grazing angles. abs() keeps DoubleSide back faces translucent. */
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
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float fres = pow(1.0 - ndv, 2.0);
    float sheen = smoothstep(-0.22, 0.22, vPos.y) * 0.35 + 0.65;
    vec3 body = mix(uBody, uGold * 0.5, fres * 0.9) * sheen;
    vec3 col = mix(body, uGold * 1.25, smoothstep(0.45, 0.95, fres));
    col = mix(col, uAccent * 1.35, smoothstep(0.62, 1.0, fres) * uAccentMix);
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

/* Manhattan circuit traces etched on a slab's top face */
function traceGeometry(seed: number) {
  const rnd = mulberry32(seed);
  const w = SLAB_W * 0.42;
  const d = SLAB_D * 0.42;
  const y = SLAB_H / 2 + 0.015;
  const pts: number[] = [];
  for (let n = 0; n < 11; n++) {
    let x = (rnd() - 0.5) * 2 * w * 0.9;
    let z = (rnd() - 0.5) * 2 * d * 0.9;
    let horiz = rnd() > 0.5;
    const segs = 2 + Math.floor(rnd() * 2);
    for (let s = 0; s < segs; s++) {
      const len = (0.15 + rnd() * 0.5) * (rnd() > 0.5 ? 1 : -1);
      const nx = horiz ? Math.min(Math.max(x + len, -w), w) : x;
      const nz = horiz ? z : Math.min(Math.max(z + len, -d), d);
      pts.push(x, y, z, nx, y, nz);
      x = nx;
      z = nz;
      horiz = !horiz;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return geo;
}

/* node mesh network for the rails layer: nodes + each linked to 2 nearest */
function latticeGeometry(seed: number) {
  const rnd = mulberry32(seed);
  const N = 14;
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    nodes.push(
      new THREE.Vector3(
        (rnd() - 0.5) * SLAB_W * 0.74,
        (rnd() - 0.5) * 0.16,
        (rnd() - 0.5) * SLAB_D * 0.66
      )
    );
  }
  const linePts: number[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < N; i++) {
    const dists = nodes
      .map((n, j) => ({ j, d: n.distanceTo(nodes[i]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of dists) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      linePts.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
    }
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(linePts, 3));
  const nodePos = new Float32Array(N * 3);
  nodes.forEach((n, i) => {
    nodePos[i * 3] = n.x;
    nodePos[i * 3 + 1] = n.y;
    nodePos[i * 3 + 2] = n.z;
  });
  return { lines, nodePos };
}

type Bucketed = (THREE.MeshBasicMaterial | THREE.LineBasicMaterial | THREE.PointsMaterial) & {
  userData: { kind: "gold" | "accent"; base: number };
};
type Orbiter = { mesh: THREE.Object3D; r: number; speed: number; off: number; ybob: number };

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
  const lineMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const coreMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const inner = useRef<Bucketed[][]>([[], [], [], []]);
  const stackMats = useRef<Bucketed[]>([]);
  const orbiters = useRef<Orbiter[]>([]);
  const rails = useRef<(THREE.Mesh | null)[]>([]);
  const halo1 = useRef<THREE.Mesh>(null);
  const halo2 = useRef<THREE.Mesh>(null);
  const pillarMesh = useRef<THREE.InstancedMesh>(null);
  const glowLevels = useRef<number[]>([1, 1, 1, 1]);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  const geo = useMemo(() => roundedSlabGeometry(), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 32), [geo]);
  const coreGeo = useMemo(() => new THREE.BoxGeometry(SLAB_W * 0.72, 0.055, SLAB_D * 0.62), []);
  const traceGeos = useMemo(() => [13, 211, 977, 3251].map((s) => traceGeometry(s)), []);
  const lattice = useMemo(() => latticeGeometry(47), []);
  const colGeo = useMemo(() => new THREE.BoxGeometry(0.05, SLAB_H * 0.72, 0.05), []);
  const pillarGeo = useMemo(() => new THREE.BoxGeometry(0.085, 1, 0.085), []);
  const icosa = useMemo(() => new THREE.IcosahedronGeometry(0.23, 0), []);
  const icosaEdges = useMemo(() => new THREE.EdgesGeometry(icosa), [icosa]);
  const orbGeo = useMemo(() => new THREE.SphereGeometry(0.035, 12, 12), []);
  const tokenGeo = useMemo(() => new THREE.OctahedronGeometry(0.05, 0), []);
  const ringGeo = useMemo(() => {
    const g = new THREE.TorusGeometry(0.42, 0.006, 8, 64);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const railGeo = useMemo(() => new THREE.BoxGeometry(0.024, 1, 0.024), []);
  const haloGeoA = useMemo(() => new THREE.TorusGeometry(2.35, 0.008, 8, 128), []);
  const haloGeoB = useMemo(() => new THREE.TorusGeometry(2.72, 0.005, 8, 128), []);
  const uniformsArr = useMemo(
    () =>
      Array.from({ length: SLABS }, () => ({
        uGold: { value: new THREE.Color(PALETTES.dark.gold) },
        uAccent: { value: new THREE.Color("#ffffff") },
        uBody: { value: new THREE.Color() },
        uAlpha: { value: 0.92 },
        uGlow: { value: 1 },
        uAccentMix: { value: 0.8 },
      })),
    []
  );

  /* foundation pillar field (layer 01) — instanced, varied heights */
  useEffect(() => {
    const m = pillarMesh.current;
    if (!m) return;
    const rnd = mulberry32(777);
    const tmp = new THREE.Object3D();
    let k = 0;
    for (let gx = 0; gx < 8; gx++) {
      for (let gz = 0; gz < 4; gz++) {
        const x = (gx / 7 - 0.5) * SLAB_W * 0.72;
        const z = (gz / 3 - 0.5) * SLAB_D * 0.6;
        const h = 0.09 + rnd() * 0.14;
        tmp.position.set(x, -SLAB_H / 2 + 0.05 + h / 2, z);
        tmp.scale.set(1, h, 1);
        tmp.updateMatrix();
        m.setMatrixAt(k++, tmp.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  const reg =
    (i: number, kind: "gold" | "accent", base: number) => (el: THREE.Material | null) => {
      if (el && !inner.current[i].includes(el as Bucketed)) {
        el.userData = { kind, base };
        inner.current[i].push(el as Bucketed);
      }
    };
  const regStack = (kind: "gold" | "accent", base: number) => (el: THREE.Material | null) => {
    if (el && !stackMats.current.includes(el as Bucketed)) {
      el.userData = { kind, base };
      stackMats.current.push(el as Bucketed);
    }
  };
  const regOrbit =
    (r: number, speed: number, off: number, ybob: number) => (el: THREE.Mesh | null) => {
      if (el && !orbiters.current.some((o) => o.mesh === el)) {
        orbiters.current.push({ mesh: el, r, speed, off, ybob });
      }
    };

  useFrame((state, delta) => {
    const p = progress.current;
    const g = group.current;
    if (!g) return;
    const P = dark ? PALETTES.dark : PALETTES.light;
    const t = state.clock.elapsedTime;
    const focus = focusRef.current;

    const dissolve = ss(0.86, 0.97, p);
    const explodeAny = env(p, 1);
    const pulse = 1 + Math.sin(t * 2.1) * 0.12 * (1 - ss(0.25, 0.35, p));
    const blend = dark ? THREE.AdditiveBlending : THREE.NormalBlending;

    g.rotation.y += delta * (0.16 + explodeAny * 0.08) * (focus === null ? 1 : 0.12);
    g.rotation.x = 0.3 + Math.sin(t * 0.35) * 0.03;
    g.position.y = Math.sin(t * 0.5) * 0.06;
    g.scale.setScalar(1 - dissolve * 0.35);

    /* orbiting satellites inside AI + economy layers */
    for (const o of orbiters.current) {
      const ang = t * o.speed + o.off;
      o.mesh.position.set(
        Math.cos(ang) * o.r,
        o.ybob * Math.sin(t * 1.3 + o.off),
        Math.sin(ang) * o.r
      );
      o.mesh.rotation.y = ang;
    }

    /* stack chrome: corner rails stretch with the explode; halo rings spin */
    const span = (SLABS - 1) * (STEP + SPREAD * explodeAny) + 0.75;
    for (const rail of rails.current) {
      if (rail) rail.scale.y = span;
    }
    if (halo1.current) halo1.current.rotation.z += delta * 0.1;
    if (halo2.current) halo2.current.rotation.z -= delta * 0.14;
    for (const m of stackMats.current) {
      tmpColor.set(m.userData.kind === "accent" ? P.accents[2] : P.gold);
      m.color.copy(tmpColor);
      m.opacity = m.userData.base * (0.55 + 0.7 * explodeAny) * (1 - dissolve) * P.lineBoost;
      m.blending = blend;
    }

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

      mat.uniforms.uGold.value.set(P.gold);
      mat.uniforms.uAccent.value.set(P.accents[i]);
      mat.uniforms.uBody.value.copy(P.body);
      mat.uniforms.uGlow.value = pulse * gl;
      mat.uniforms.uAlpha.value = P.alpha * (1 - dissolve) * (0.55 + 0.45 * Math.min(gl, 1));
      mat.uniforms.uAccentMix.value = dark ? 0.8 : 0.45;
      mat.blending = blend;
      if (line) {
        line.color.set(P.gold).lerp(tmpColor.set(P.accents[i]), 0.35 + 0.4 * e);
        line.opacity = (0.5 + 0.4 * e) * (1 - dissolve) * Math.min(gl, 1.15) * P.lineBoost;
        line.blending = blend;
      }
      if (core) {
        // cores stay faint while assembled (clean monolith), bloom on separation
        core.color.set(P.accents[i]);
        core.opacity =
          (0.1 + 0.72 * e + Math.sin(t * 2.4 + i * 1.7) * (0.04 + 0.1 * e)) *
          (1 - dissolve) *
          Math.min(gl, 1.3);
        core.blending = blend;
      }
      /* the layer's internal machinery brightens as it separates */
      const vis = (0.7 + 0.5 * e) * (1 - dissolve) * Math.min(gl, 1.25) * P.lineBoost;
      for (const m of inner.current[i]) {
        tmpColor.set(m.userData.kind === "accent" ? P.accents[i] : P.gold);
        m.color.copy(tmpColor);
        m.opacity = m.userData.base * vis;
        m.blending = blend;
      }
    }
  });

  const colPositions: [number, number, number][] = [
    [SLAB_W / 2 - 0.24, 0, SLAB_D / 2 - 0.22],
    [-(SLAB_W / 2 - 0.24), 0, SLAB_D / 2 - 0.22],
    [SLAB_W / 2 - 0.24, 0, -(SLAB_D / 2 - 0.22)],
    [-(SLAB_W / 2 - 0.24), 0, -(SLAB_D / 2 - 0.22)],
  ];
  const railPositions: [number, number][] = [
    [SLAB_W / 2 + 0.28, SLAB_D / 2 + 0.24],
    [-(SLAB_W / 2 + 0.28), SLAB_D / 2 + 0.24],
    [SLAB_W / 2 + 0.28, -(SLAB_D / 2 + 0.24)],
    [-(SLAB_W / 2 + 0.28), -(SLAB_D / 2 + 0.24)],
  ];

  return (
    <group ref={group}>
      {Array.from({ length: SLABS }, (_, i) => (
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
            />
          </mesh>
          <lineSegments geometry={edges} scale={1.003}>
            <lineBasicMaterial
              ref={(el) => {
                lineMats.current[i] = el;
              }}
              transparent
              opacity={0.6}
              depthWrite={false}
            />
          </lineSegments>
          {/* inner energy cell */}
          <mesh geometry={coreGeo}>
            <meshBasicMaterial
              ref={(el) => {
                coreMats.current[i] = el;
              }}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </mesh>
          {/* etched circuit traces on the top face */}
          <lineSegments geometry={traceGeos[i]}>
            <lineBasicMaterial
              ref={reg(i, "accent", 0.5)}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </lineSegments>
          {/* interior corner columns */}
          {colPositions.map((cp, k) => (
            <mesh key={k} geometry={colGeo} position={cp}>
              <meshBasicMaterial
                ref={reg(i, "gold", 0.38)}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          ))}

          {/* layer 01 — foundation pillar field */}
          {i === 0 && (
            <instancedMesh ref={pillarMesh} args={[pillarGeo, undefined, 32]}>
              <meshBasicMaterial
                ref={reg(0, "accent", 0.5)}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </instancedMesh>
          )}

          {/* layer 02 — node mesh network */}
          {i === 1 && (
            <>
              <lineSegments geometry={lattice.lines}>
                <lineBasicMaterial
                  ref={reg(1, "accent", 0.6)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </lineSegments>
              <points>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[lattice.nodePos, 3]} />
                </bufferGeometry>
                <pointsMaterial
                  ref={reg(1, "accent", 0.85)}
                  size={0.055}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  sizeAttenuation
                />
              </points>
            </>
          )}

          {/* layer 03 — intelligence core: icosa + orbiting nodes */}
          {i === 2 && (
            <>
              <lineSegments geometry={icosaEdges}>
                <lineBasicMaterial
                  ref={reg(2, "accent", 0.8)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </lineSegments>
              <mesh geometry={icosa}>
                <meshBasicMaterial
                  ref={reg(2, "accent", 0.1)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
              {[0, 1, 2].map((k) => (
                <mesh
                  key={k}
                  geometry={orbGeo}
                  ref={regOrbit(0.46, 0.8 + k * 0.3, (k * Math.PI * 2) / 3, 0.07)}
                >
                  <meshBasicMaterial
                    ref={reg(2, "accent", 0.9)}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
              ))}
            </>
          )}

          {/* layer 04 — market ring with orbiting tokens */}
          {i === 3 && (
            <>
              <mesh geometry={ringGeo}>
                <meshBasicMaterial
                  ref={reg(3, "accent", 0.6)}
                  transparent
                  opacity={0}
                  depthWrite={false}
                />
              </mesh>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <mesh
                  key={k}
                  geometry={tokenGeo}
                  ref={regOrbit(0.58, 0.5 + (k % 3) * 0.22, (k * Math.PI) / 3, 0.05)}
                >
                  <meshBasicMaterial
                    ref={reg(3, "accent", 0.85)}
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
              ))}
            </>
          )}
        </group>
      ))}

      {/* corner rails framing the whole stack */}
      {railPositions.map(([x, z], k) => (
        <mesh
          key={k}
          geometry={railGeo}
          position={[x, 0, z]}
          ref={(el) => {
            rails.current[k] = el;
          }}
        >
          <meshBasicMaterial ref={regStack("gold", 0.3)} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* gyroscopic halo rings */}
      <mesh ref={halo1} geometry={haloGeoA} rotation={[1.28, 0, 0]}>
        <meshBasicMaterial ref={regStack("gold", 0.3)} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={halo2} geometry={haloGeoB} rotation={[1.85, 0.3, 0]}>
        <meshBasicMaterial
          ref={regStack("accent", 0.22)}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* rising data packets on the stack axis — visible while separated */
function Packets({ progress, dark }: { progress: React.MutableRefObject<number>; dark: boolean }) {
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
    const m = p.material as THREE.PointsMaterial;
    m.color.set(dark ? PALETTES.dark.packets : PALETTES.light.packets);
    m.opacity = 0.85 * env(progress.current, 1);
    m.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    p.rotation.x = 0.3;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  );
}

/* sparse dust motes */
function Motes({ dark }: { dark: boolean }) {
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
    const m = pts.current.material as THREE.PointsMaterial;
    m.color.set(dark ? PALETTES.dark.gold : PALETTES.light.gold);
    m.opacity = dark ? 0.4 : 0.3;
  });

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} transparent opacity={0.4} depthWrite={false} sizeAttenuation />
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
      <Packets progress={progress} dark={dark} />
      <Motes dark={dark} />
    </Canvas>
  );
}

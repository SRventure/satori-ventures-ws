"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* AI-datacenter stack, bottom → top (labels read top → bottom):
   L0 power+cooling foundation / L1 server racks / L2 network spine / L3 AI core */
const LAYERS = 4;
const STEP = 0.68;
const SPREAD = 1.05;
const FOOT = 2.7; // tray footprint

const trayVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const trayFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uRed;
  uniform float uAlpha;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    // abs() = two-sided fresnel; max() turns back faces solid on DoubleSide
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float fres = pow(1.0 - ndv, 2.2);
    vec3 col = mix(uGold * 0.55, uGold * 1.30, fres) * uGlow;
    col = mix(col, uRed * 1.15, smoothstep(0.72, 1.0, fres) * 0.6);
    float alpha = (0.25 + 0.75 * fres) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

const ledVertex = /* glsl */ `
  attribute float seed;
  varying float vSeed;
  void main() {
    vSeed = seed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 42.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const ledFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uGold;
  uniform vec3 uRed;
  uniform float uAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    float blink = 0.25 + 0.75 * step(0.3, fract(uTime * (0.3 + vSeed * 0.8) + vSeed * 7.0));
    vec3 col = mix(uGold, uRed, step(0.82, fract(vSeed * 13.7)));
    gl_FragColor = vec4(col * 1.7, blink * uAlpha);
  }
`;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

function rand(seed: number) {
  return Math.abs(Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1;
}

/* rack grid: 3 aisles × 5 racks */
const RACKS = (() => {
  const out: { base: THREE.Vector3; dir: THREE.Vector3; seed: number }[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      const base = new THREE.Vector3(-1.0 + c * 0.5, 0.02, -0.82 + r * 0.82);
      const dir = base.clone().setY(0);
      if (dir.lengthSq() < 0.01) dir.set(0.3, 0, 0.3);
      dir.normalize();
      out.push({ base, dir, seed: rand(r * 5 + c + 1) });
    }
  }
  return out;
})();

function ledGeometry(variant: number) {
  const n = 6;
  const pos = new Float32Array(n * 3);
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (rand(variant * 31 + i) - 0.5) * 0.17;
    pos[i * 3 + 1] = (rand(variant * 57 + i) - 0.5) * 0.4;
    pos[i * 3 + 2] = 0;
    seeds[i] = rand(variant * 91 + i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  return g;
}

function AIDC({ progress, dark }: { progress: React.MutableRefObject<number>; dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);
  const racks = useRef<(THREE.Group | null)[]>([]);
  const cracs = useRef<(THREE.Group | null)[]>([]);
  const ring = useRef<THREE.Mesh>(null);
  const icosa = useRef<THREE.LineSegments>(null);
  const orbits = useRef<(THREE.Mesh | null)[]>([]);

  /* ---- geometries ---- */
  const geo = useMemo(() => {
    const tray = new THREE.BoxGeometry(FOOT, 0.045, FOOT);
    const outlineBox = new THREE.BoxGeometry(FOOT, 0.6, FOOT);
    const rack = new THREE.BoxGeometry(0.26, 0.52, 0.34);
    const crac = new THREE.BoxGeometry(0.52, 0.42, 0.52);
    const sw = new THREE.BoxGeometry(0.95, 0.16, 0.34);
    return {
      tray,
      trayEdges: new THREE.EdgesGeometry(tray),
      outline: new THREE.EdgesGeometry(outlineBox),
      rack,
      rackEdges: new THREE.EdgesGeometry(rack),
      crac,
      cracEdges: new THREE.EdgesGeometry(crac),
      pipe: new THREE.CylinderGeometry(0.032, 0.032, 2.35, 8),
      sw,
      swEdges: new THREE.EdgesGeometry(sw),
      icosa: new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.42, 1)),
      core: new THREE.SphereGeometry(0.27, 24, 24),
      ringT: new THREE.TorusGeometry(0.6, 0.01, 8, 64),
      node: new THREE.SphereGeometry(0.035, 10, 10),
      leds: [ledGeometry(1), ledGeometry(2), ledGeometry(3)],
    };
  }, []);

  /* ---- shared materials (recolored per frame) ---- */
  const mat = useMemo(() => {
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    return {
      tray: new THREE.ShaderMaterial({
        vertexShader: trayVertex,
        fragmentShader: trayFragment,
        uniforms: {
          uGold: { value: new THREE.Color("#E2B84C") },
          uRed: { value: new THREE.Color("#D61F33") },
          uAlpha: { value: 0.85 },
          uGlow: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending,
      }),
      fill: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.12, depthWrite: false, blending }),
      edge: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
      faint: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.3, depthWrite: false }),
      pipeGold: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5, depthWrite: false, blending }),
      pipeRed: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false, blending }),
      core: new THREE.ShaderMaterial({
        vertexShader: trayVertex,
        fragmentShader: trayFragment,
        uniforms: {
          uGold: { value: new THREE.Color("#E2B84C") },
          uRed: { value: new THREE.Color("#D61F33") },
          uAlpha: { value: 1 },
          uGlow: { value: 1.4 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending,
      }),
      led: new THREE.ShaderMaterial({
        vertexShader: ledVertex,
        fragmentShader: ledFragment,
        uniforms: {
          uTime: { value: 0 },
          uGold: { value: new THREE.Color("#E2B84C") },
          uRed: { value: new THREE.Color("#D61F33") },
          uAlpha: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending,
      }),
      ringM: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthWrite: false, blending }),
      nodeM: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false, blending }),
    };
  }, [dark]);

  /* fiber arcs: switch spines → tray corners */
  const arcs = useMemo(() => {
    const out: THREE.Line[] = [];
    const corners = [
      [-1.1, -0.18, -1.1],
      [1.1, -0.18, -1.1],
      [-1.1, -0.18, 1.1],
      [1.1, -0.18, 1.1],
    ];
    [-0.5, 0.5].forEach((sx, si) => {
      corners.forEach(([x, y, z], ci) => {
        if ((si + ci) % 2 === 0) return; // 4 arcs total, alternating
        const a = new THREE.Vector3(sx, 0.14, 0);
        const b = new THREE.Vector3(x, y, z);
        const mid = a.clone().add(b).multiplyScalar(0.5).setY(0.55);
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));
        const m = new THREE.LineDashedMaterial({
          transparent: true,
          depthWrite: false,
          dashSize: 0.08,
          gapSize: 0.05,
          opacity: 0.7,
        });
        const line = new THREE.Line(g, m);
        line.computeLineDistances();
        out.push(line);
      });
    });
    return out;
  }, []);

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(2.35, 8, "#E2B84C", "#E2B84C");
    const m = g.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0.28;
    m.depthWrite = false;
    if (!dark) m.color.set("#84202A");
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  useFrame((state, delta) => {
    const p = progress.current;
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    const explode = smoothstep(0.3, 0.52, p) * (1 - smoothstep(0.7, 0.85, p));
    const dissolve = smoothstep(0.86, 0.97, p);
    const pulse = 1 + Math.sin(t * 2.1) * 0.14 * (1 - smoothstep(0.25, 0.35, p));
    const fade = 1 - dissolve;

    g.rotation.y += delta * 0.22 * (1 + explode * 0.4);
    g.rotation.x = 0.32 + Math.sin(t * 0.35) * 0.03;
    g.position.y = Math.sin(t * 0.5) * 0.07;
    // shrink slightly while exploded so the full stack stays in frame
    g.scale.setScalar((1 - dissolve * 0.35) * (1 - explode * 0.16));

    for (let i = 0; i < LAYERS; i++) {
      const layer = layers.current[i];
      if (!layer) continue;
      const centered = i - (LAYERS - 1) / 2;
      layer.position.y = centered * (STEP + SPREAD * explode);
      layer.rotation.y = centered * 0.16 * explode;
    }

    /* per-equipment disassembly */
    racks.current.forEach((r, i) => {
      if (!r) return;
      const { base, dir, seed } = RACKS[i];
      const s = 0.42 * explode * (0.7 + seed * 0.6);
      r.position.set(base.x + dir.x * s, base.y + seed * 0.14 * explode, base.z + dir.z * s);
      r.rotation.y = (seed - 0.5) * 0.7 * explode;
    });
    cracs.current.forEach((c, i) => {
      if (!c) return;
      c.position.x = (i === 0 ? -0.72 : 0.72) * (1 + 0.5 * explode);
      c.rotation.y = (i === 0 ? -1 : 1) * 0.3 * explode;
    });
    if (ring.current) {
      ring.current.rotation.x = 1.15 + 0.5 * explode;
      ring.current.rotation.z += delta * 0.5;
    }
    if (icosa.current) icosa.current.rotation.y -= delta * 0.3;
    orbits.current.forEach((o, i) => {
      if (!o) return;
      const a = t * 0.8 + (i * Math.PI * 2) / 3;
      const rr = 0.62 + 0.25 * explode;
      o.position.set(Math.cos(a) * rr, Math.sin(a * 1.3) * 0.16, Math.sin(a) * rr);
    });

    /* theme + fades */
    const gold = dark ? "#E2B84C" : "#84202A";
    const red = dark ? "#D61F33" : "#A81020";
    mat.tray.uniforms.uGold.value.set(gold);
    mat.tray.uniforms.uRed.value.set(red);
    // near-glass: equipment must stay readable through the tray planes
    mat.tray.uniforms.uGlow.value = pulse * 0.55;
    mat.tray.uniforms.uAlpha.value = (dark ? 0.13 : 0.22) * fade;
    mat.core.uniforms.uGold.value.set(gold);
    mat.core.uniforms.uRed.value.set(red);
    mat.core.uniforms.uGlow.value = 1.3 + Math.sin(t * 1.7) * 0.25;
    mat.core.uniforms.uAlpha.value = fade;
    mat.led.uniforms.uTime.value = t;
    mat.led.uniforms.uGold.value.set(gold);
    mat.led.uniforms.uRed.value.set(red);
    mat.led.uniforms.uAlpha.value = fade;
    mat.fill.color.set(gold);
    mat.fill.opacity = (dark ? 0.17 : 0.1) * fade;
    mat.edge.color.set(gold);
    mat.edge.opacity = (dark ? 0.85 : 0.7) * fade;
    mat.faint.color.set(gold);
    mat.faint.opacity = (dark ? 0.3 : 0.35) * fade;
    mat.pipeGold.color.set(gold);
    mat.pipeGold.opacity = 0.5 * fade;
    mat.pipeRed.color.set(red);
    mat.pipeRed.opacity = 0.55 * fade;
    mat.ringM.color.set(red);
    mat.ringM.opacity = 0.8 * fade;
    mat.nodeM.color.set(gold);
    mat.nodeM.opacity = 0.9 * fade;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.28 * fade;
    arcs.forEach((l, i) => {
      const m = l.material as THREE.LineDashedMaterial;
      m.color.set(red);
      m.opacity = (0.45 + Math.sin(t * 2 + i) * 0.25 + explode * 0.3) * fade;
    });
  });

  const tray = (
    <>
      <mesh geometry={geo.tray} material={mat.tray} position={[0, -0.3, 0]} />
      <lineSegments geometry={geo.trayEdges} material={mat.edge} position={[0, -0.3, 0]} />
      <lineSegments geometry={geo.outline} material={mat.faint} />
    </>
  );

  return (
    <group ref={group}>
      {/* L0 — power + liquid cooling foundation */}
      <group ref={(el) => { layers.current[0] = el; }}>
        {tray}
        <primitive object={grid} position={[0, -0.27, 0]} />
        {[0, 1].map((i) => (
          <group key={i} ref={(el) => { cracs.current[i] = el; }} position={[i === 0 ? -0.72 : 0.72, -0.06, 0]}>
            <mesh geometry={geo.crac} material={mat.fill} />
            <lineSegments geometry={geo.cracEdges} material={mat.edge} />
          </group>
        ))}
        <mesh geometry={geo.pipe} material={mat.pipeGold} rotation={[0, 0, Math.PI / 2]} position={[0, -0.18, -1.05]} />
        <mesh geometry={geo.pipe} material={mat.pipeRed} rotation={[0, 0, Math.PI / 2]} position={[0, -0.1, -1.05]} />
        <mesh geometry={geo.pipe} material={mat.pipeGold} rotation={[Math.PI / 2, 0, 0]} position={[-1.18, -0.14, 0]} />
      </group>

      {/* L1 — server rack rows */}
      <group ref={(el) => { layers.current[1] = el; }}>
        {tray}
        {RACKS.map((r, i) => (
          <group key={i} ref={(el) => { racks.current[i] = el; }} position={r.base}>
            <mesh geometry={geo.rack} material={mat.fill} />
            <lineSegments geometry={geo.rackEdges} material={mat.edge} />
            <points geometry={geo.leds[i % 3]} material={mat.led} position={[0, 0, 0.175]} />
          </group>
        ))}
      </group>

      {/* L2 — network spine + fiber arcs */}
      <group ref={(el) => { layers.current[2] = el; }}>
        {tray}
        {[0, 1].map((i) => (
          <group key={i} position={[i === 0 ? -0.5 : 0.5, 0.14, 0]}>
            <mesh geometry={geo.sw} material={mat.fill} />
            <lineSegments geometry={geo.swEdges} material={mat.edge} />
          </group>
        ))}
        {arcs.map((l, i) => (
          <primitive key={i} object={l} />
        ))}
        {[[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].map(([x, z], i) => (
          <mesh key={i} geometry={geo.node} material={mat.nodeM} position={[x, -0.18, z]} />
        ))}
      </group>

      {/* L3 — holographic AI core */}
      <group ref={(el) => { layers.current[3] = el; }}>
        {tray}
        <mesh geometry={geo.core} material={mat.core} position={[0, 0.1, 0]} />
        <lineSegments ref={icosa} geometry={geo.icosa} material={mat.edge} position={[0, 0.1, 0]} />
        <mesh ref={ring} geometry={geo.ringT} material={mat.ringM} position={[0, 0.1, 0]} rotation={[1.15, 0, 0]} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={geo.node} material={mat.nodeM} ref={(el) => { orbits.current[i] = el; }} position={[0, 0.1, 0]} />
        ))}
      </group>
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
      <AIDC progress={progress} dark={dark} />
      <Motes dark={dark} />
    </Canvas>
  );
}

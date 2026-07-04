"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { companies, type Company } from "@/lib/companies";

export type Sector = "ai" | "rails" | "econ";

export const SECTORS: Record<Sector, { label: string; ring: number; tilt: number; speed: number }> = {
  ai: { label: "Frontier AI", ring: 2.1, tilt: 0.42, speed: 0.05 },
  rails: { label: "Web3 Rails", ring: 3.1, tilt: -0.2, speed: -0.035 },
  econ: { label: "Open Economies", ring: 4.0, tilt: 0.12, speed: 0.025 },
};

export function sectorOf(c: Company): Sector {
  const cat = c.category;
  if (/AI|Robotics/i.test(cat)) return "ai";
  if (/Layer 1|Infrastructure|Oracle|DePIN|Payments|Naming|Web3 Data|Developer/i.test(cat)) return "rails";
  return "econ";
}

const nodeVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const nodeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uBoost;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float rim = pow(1.0 - ndv, 1.8);
    float core = pow(ndv, 3.0) * 0.55;
    vec3 col = (uColor * (0.35 + core) + uColor * 1.7 * rim) * uBoost;
    float alpha = (0.3 + 0.7 * max(rim, core)) * uAlpha;
    gl_FragColor = vec4(col, alpha);
  }
`;

type NodeDef = {
  company: Company;
  sector: Sector;
  pos: THREE.Vector3;
  phase: number;
};

function buildNodes(): NodeDef[] {
  const bySector: Record<Sector, Company[]> = { ai: [], rails: [], econ: [] };
  companies.forEach((c) => bySector[sectorOf(c)].push(c));
  const out: NodeDef[] = [];
  (Object.keys(bySector) as Sector[]).forEach((s) => {
    const list = bySector[s];
    const { ring, tilt } = SECTORS[s];
    list.forEach((c, i) => {
      const a = (i / list.length) * Math.PI * 2 + ring; // ring offset de-aligns clusters
      const jitter = Math.sin(i * 12.9898 + ring) * 0.28;
      const p = new THREE.Vector3(
        Math.cos(a) * (ring + jitter),
        Math.sin(a) * (ring + jitter) * Math.sin(tilt) + Math.cos(i * 3.7) * 0.3,
        Math.sin(a) * (ring + jitter) * Math.cos(tilt)
      );
      out.push({ company: c, sector: s, pos: p, phase: i * 1.7 });
    });
  });
  return out;
}

function sectorColor(s: Sector, dark: boolean): string {
  if (s === "ai") return dark ? "#E2B84C" : "#84202A";
  if (s === "rails") return dark ? "#D61F33" : "#A81020";
  return dark ? "#D8D4CC" : "#3A3438";
}

function Nodes({
  progress,
  dark,
  onHover,
}: {
  progress: React.MutableRefObject<number>;
  dark: boolean;
  onHover: (c: Company | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(buildNodes, []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const [hovered, setHovered] = useState<number>(-1);
  const geo = useMemo(() => new THREE.SphereGeometry(0.15, 20, 20), []);
  const sunGeo = useMemo(() => new THREE.SphereGeometry(0.5, 28, 28), []);
  const sunMat = useRef<THREE.ShaderMaterial>(null);

  const uniformsArr = useMemo(
    () =>
      nodes.map((n) => ({
        uColor: { value: new THREE.Color(sectorColor(n.sector, true)) },
        uBoost: { value: 1 },
        uAlpha: { value: 1 },
      })),
    [nodes]
  );
  const sunUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#E2B84C") },
      uBoost: { value: 1.3 },
      uAlpha: { value: 1 },
    }),
    []
  );

  /* constellation polylines: connect consecutive nodes within each sector */
  const lineGeos = useMemo(() => {
    const geos: { sector: Sector; geo: THREE.BufferGeometry }[] = [];
    (Object.keys(SECTORS) as Sector[]).forEach((s) => {
      const ring = nodes.filter((n) => n.sector === s);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < ring.length; i++) {
        pts.push(ring[i].pos, ring[(i + 1) % ring.length].pos);
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      geos.push({ sector: s, geo: g });
    });
    return geos;
  }, [nodes]);
  const lineMats = useRef<(THREE.LineDashedMaterial | null)[]>([]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progress.current; // 0→1 fly-in
    const entry = Math.min(Math.max(p, 0), 1);

    g.rotation.y += delta * 0.06;
    g.rotation.x = 0.18 + Math.sin(t * 0.2) * 0.02;
    g.position.z = -12 * (1 - entry);
    // narrow (portrait) viewports: shrink the whole system to fit
    const fit = state.viewport.aspect < 1 ? 0.55 : 1;
    g.scale.setScalar(fit);

    nodes.forEach((n, i) => {
      const m = meshes.current[i];
      const mat = mats.current[i];
      if (!m || !mat) return;
      m.position.copy(n.pos);
      m.position.y += Math.sin(t * 0.6 + n.phase) * 0.08;
      const target = hovered === i ? 1.8 : 1;
      m.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
      mat.uniforms.uColor.value.set(sectorColor(n.sector, dark));
      mat.uniforms.uBoost.value = hovered === i ? 1.9 : 1;
      mat.uniforms.uAlpha.value = entry;
    });

    if (sunMat.current) {
      sunMat.current.uniforms.uColor.value.set(dark ? "#E2B84C" : "#84202A");
      sunMat.current.uniforms.uBoost.value = 1.25 + Math.sin(t * 1.6) * 0.2;
      sunMat.current.uniforms.uAlpha.value = entry;
    }

    lineMats.current.forEach((lm, i) => {
      if (!lm) return;
      lm.color.set(sectorColor(lineGeos[i].sector, dark));
      lm.opacity = 0.28 * entry;
    });
  });

  return (
    <group ref={group}>
      {/* Satori sun */}
      <mesh geometry={sunGeo}>
        <shaderMaterial
          ref={sunMat}
          vertexShader={nodeVertex}
          fragmentShader={nodeFragment}
          uniforms={sunUniforms}
          transparent
          depthWrite={false}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>

      {lineGeos.map((lg, i) => (
        <lineSegments
          key={lg.sector}
          geometry={lg.geo}
          onUpdate={(l) => l.computeLineDistances()}
        >
          <lineDashedMaterial
            ref={(el) => {
              lineMats.current[i] = el;
            }}
            transparent
            depthWrite={false}
            dashSize={0.14}
            gapSize={0.1}
            opacity={0.28}
          />
        </lineSegments>
      ))}

      {nodes.map((n, i) => (
        <mesh
          key={n.company.name}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geo}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(i);
            onHover(n.company);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(-1);
            onHover(null);
            document.body.style.cursor = "";
          }}
          onClick={() => window.open(n.company.url, "_blank", "noopener")}
        >
          <shaderMaterial
            vertexShader={nodeVertex}
            fragmentShader={nodeFragment}
            uniforms={uniformsArr[i]}
            transparent
            depthWrite={false}
            blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
            ref={(el) => {
              mats.current[i] = el;
            }}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ConstellationScene({
  progress,
  dark,
  onHover,
}: {
  progress: React.MutableRefObject<number>;
  dark: boolean;
  onHover: (c: Company | null) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 9], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Nodes progress={progress} dark={dark} onHover={onHover} />
    </Canvas>
  );
}

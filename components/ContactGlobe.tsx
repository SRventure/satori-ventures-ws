"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CITIES } from "@/lib/cities";

const R = 2.1;

function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const atmoVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const atmoFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float ndv = abs(dot(normalize(vNormal), normalize(vView)));
    float rim = pow(1.0 - ndv, 2.4);
    gl_FragColor = vec4(uColor * (0.25 + 1.6 * rim), (0.06 + rim * 0.9) * uAlpha);
  }
`;

function Globe({ dark }: { dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const wireMat = useRef<THREE.LineBasicMaterial>(null);
  const arcMats = useRef<(THREE.LineDashedMaterial | null)[]>([]);
  const nodeMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const nodes = useRef<(THREE.Mesh | null)[]>([]);
  const vel = useRef(0.0016);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const { gl } = useThree();

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(R, 48, 48), []);
  const wireGeo = useMemo(
    () => new THREE.WireframeGeometry(new THREE.SphereGeometry(R * 0.999, 18, 14)),
    []
  );
  const nodeGeo = useMemo(() => new THREE.SphereGeometry(0.045, 12, 12), []);
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#E2B84C") }, uAlpha: { value: 1 } }),
    []
  );

  /* connection arcs: every city → SIN (HQ hub) */
  const arcLines = useMemo(() => {
    const hub = toVec(CITIES[0].lat, CITIES[0].lon);
    return CITIES.slice(1).map((c, i) => {
      const end = toVec(c.lat, c.lon);
      const mid = hub.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.35);
      const curve = new THREE.QuadraticBezierCurve3(hub, mid, end);
      const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
      const m = new THREE.LineDashedMaterial({
        transparent: true,
        depthWrite: false,
        dashSize: 0.12,
        gapSize: 0.08,
        opacity: 0.75,
      });
      const line = new THREE.Line(g, m);
      line.computeLineDistances();
      arcMats.current[i] = m;
      return line;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (!dragging.current) {
      vel.current += (0.0016 - vel.current) * 0.02; // ease back to auto-rotate
    }
    g.rotation.y += vel.current * (delta * 60);

    const gold = dark ? "#E2B84C" : "#84202A";
    const red = dark ? "#D61F33" : "#A81020";
    atmoMat.current?.uniforms.uColor.value.set(gold);
    if (wireMat.current) {
      wireMat.current.color.set(gold);
      wireMat.current.opacity = dark ? 0.14 : 0.18;
    }
    arcMats.current.forEach((m) => {
      if (!m) return;
      m.color.set(red);
      m.opacity = 0.6 + Math.sin(t * 1.8) * 0.25;
    });
    nodes.current.forEach((n, i) => {
      if (!n) return;
      const pulse = 1 + Math.sin(t * 2.2 + i * 1.4) * 0.35;
      n.scale.setScalar(pulse);
      nodeMats.current[i]?.color.set(CITIES[i].hq ? red : gold);
    });
  });

  return (
    <group
      ref={group}
      rotation={[0.32, -1.4, 0]}
      onPointerDown={(e) => {
        dragging.current = true;
        lastX.current = e.clientX;
        gl.domElement.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        vel.current = (e.clientX - lastX.current) * 0.00045;
        if (group.current) group.current.rotation.y += (e.clientX - lastX.current) * 0.005;
        lastX.current = e.clientX;
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* atmosphere limb */}
      <mesh geometry={sphereGeo}>
        <shaderMaterial
          ref={atmoMat}
          vertexShader={atmoVertex}
          fragmentShader={atmoFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>
      {/* lat/long graticule */}
      <lineSegments geometry={wireGeo}>
        <lineBasicMaterial ref={wireMat} transparent opacity={0.14} depthWrite={false} color="#E2B84C" />
      </lineSegments>
      {/* connection arcs */}
      {arcLines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
      {/* city nodes */}
      {CITIES.map((c, i) => (
        <mesh
          key={c.code}
          geometry={nodeGeo}
          position={toVec(c.lat, c.lon, R * 1.005)}
          ref={(el) => {
            nodes.current[i] = el;
          }}
        >
          <meshBasicMaterial
            ref={(el) => {
              nodeMats.current[i] = el;
            }}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ContactGlobe({ dark }: { dark: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Globe dark={dark} />
    </Canvas>
  );
}

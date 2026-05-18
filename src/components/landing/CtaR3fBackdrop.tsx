"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function CandyOrbit() {
  const g = useRef<Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.x += dt * 0.12;
    g.current.rotation.y += dt * 0.18;
  });
  return (
    <group ref={g} scale={0.92}>
      <mesh position={[0.35, 0.2, 0]}>
        <torusGeometry args={[1, 0.32, 24, 48]} />
        <meshStandardMaterial
          color="#c4f312"
          emissive="#0891b2"
          emissiveIntensity={0.22}
          roughness={0.32}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[-0.45, -0.15, 0.2]} scale={0.45} rotation={[0.7, 0.4, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#a1a1aa"
          emissive="#52525b"
          emissiveIntensity={0.12}
          roughness={0.35}
          metalness={0.35}
        />
      </mesh>
    </group>
  );
}

/** Soft 3D accent for the closing CTA — pointer-events off. */
export function CtaR3fBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.28] md:opacity-[0.36]">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.65} />
        <pointLight position={[5, 4, 6]} intensity={0.9} color="#e4e4e7" />
        <pointLight position={[-4, -2, 4]} intensity={0.5} color="#c4f312" />
        <CandyOrbit />
      </Canvas>
    </div>
  );
}

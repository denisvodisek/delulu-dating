"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function FloatingCandyCloud() {
  const groupRef = useRef<Group>(null);
  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += dt * 0.12;
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-1.35, 0.58, -0.2]} scale={0.48}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#f9a8d4" emissive="#f472b6" emissiveIntensity={0.2} roughness={0.36} />
      </mesh>
      <mesh position={[-0.82, 0.72, 0.12]} scale={0.36}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#fbcfe8" emissive="#c084fc" emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      <mesh position={[1.15, 0.62, 0.08]} scale={0.42}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#f472b6" emissiveIntensity={0.23} roughness={0.32} />
      </mesh>
      <mesh position={[0.72, 0.82, -0.18]} scale={0.28}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={0.2} roughness={0.26} />
      </mesh>
      <mesh position={[-0.22, 0.08, 0.25]} scale={0.35} rotation={[0.3, 0.8, 0.4]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#93c5fd" emissive="#f472b6" emissiveIntensity={0.22} roughness={0.2} metalness={0.36} />
      </mesh>
      <mesh position={[0.33, -0.15, -0.05]} scale={0.42} rotation={[0.4, 0.2, 0.6]}>
        <torusGeometry args={[1, 0.28, 20, 42]} />
        <meshStandardMaterial color="#fda4af" emissive="#a78bfa" emissiveIntensity={0.26} roughness={0.24} metalness={0.34} />
      </mesh>
    </group>
  );
}

export function ResultHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-50">
      <Canvas camera={{ position: [0, 0.2, 5.4], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <ambientLight intensity={0.62} />
        <pointLight position={[4, 4, 7]} intensity={1.1} color="#fdf2f8" />
        <pointLight position={[-4, -1, 5]} intensity={0.68} color="#ddd6fe" />
        <FloatingCandyCloud />
      </Canvas>
    </div>
  );
}

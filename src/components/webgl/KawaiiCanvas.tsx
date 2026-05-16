"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

function Blob({
  color,
  position,
  scale,
}: {
  color: string;
  position: [number, number, number];
  scale: number;
}) {
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.75}>
      <Sphere position={position} args={[1, 40, 40]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          roughness={0.25}
          metalness={0.06}
          distort={0.32}
          speed={1.5}
        />
      </Sphere>
    </Float>
  );
}

export default function KawaiiCanvas() {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.62} />
      <directionalLight intensity={0.85} position={[4.5, 3.2, 5]} />
      <Blob color="#ffb6d9" position={[-2.3, 1.05, 0]} scale={1.28} />
      <Blob color="#c9b6ff" position={[2.35, -0.85, -0.8]} scale={0.98} />
      <Blob color="#ffd0b6" position={[0.35, -1.65, 0.45]} scale={0.78} />
    </Canvas>
  );
}

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function GoldenCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[2.2, 1.6, 2.2]} />
      <MeshDistortMaterial
        color="#C9972D"
        roughness={0.3}
        metalness={0.8}
        distort={0.05}
        speed={2}
      />
    </mesh>
  );
}

function FloatingIngredient({ position, color, size = 0.15 }: { position: [number, number, number]; color: string; size?: number }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>
    </Float>
  );
}

function Particles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4,
    ] as [number, number, number],
    color: ["#C9972D", "#DAA520", "#F5DEB3"][i % 3],
    size: Math.random() * 0.06 + 0.02,
  }));

  return (
    <>
      {particles.map((p, i) => (
        <FloatingIngredient key={i} position={p.position} color={p.color} size={p.size} />
      ))}
    </>
  );
}

function Ingredients() {
  return (
    <>
      {/* Pistachios - green */}
      <FloatingIngredient position={[-2.5, 1, 0.5]} color="#7A9D54" size={0.2} />
      <FloatingIngredient position={[2.2, -0.5, 1]} color="#7A9D54" size={0.15} />
      {/* Cashews - cream */}
      <FloatingIngredient position={[2.5, 1.2, -0.5]} color="#F5DEB3" size={0.22} />
      <FloatingIngredient position={[-1.8, -1, 1.2]} color="#F5DEB3" size={0.18} />
      {/* Gram flour particles */}
      <Particles />
    </>
  );
}

const Hero3D = () => {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFF7ED" />
        <pointLight position={[-3, 2, 3]} intensity={0.8} color="#C9972D" />
        <pointLight position={[3, -2, -3]} intensity={0.4} color="#DAA520" />
        <GoldenCube />
        <Ingredients />
      </Canvas>
    </div>
  );
};

export default Hero3D;

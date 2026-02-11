'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import * as THREE from 'three';

interface BlockCubeProps {
  position: [number, number, number];
  index: number;
  isGenesis: boolean;
  isValid: boolean;
  isSelected: boolean;
  onClick: () => void;
  blockData: string;
}

export default function BlockCube({
  position,
  index,
  isGenesis,
  isValid,
  isSelected,
  onClick,
  blockData,
}: BlockCubeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Colors
  const validColor = isGenesis ? '#a855f7' : '#00f0ff';
  const invalidColor = '#ef4444';
  const baseColor = isValid ? validColor : invalidColor;

  // Animate: float bob + hover scale + selected glow
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating bob
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + index * 1.2) * 0.15;

    // Subtle rotation
    meshRef.current.rotation.y = Math.sin(t * 0.3 + index * 0.5) * 0.08;
    meshRef.current.rotation.x = Math.sin(t * 0.2 + index * 0.7) * 0.04;

    // Scale on hover/select
    const targetScale = isSelected ? 1.2 : hovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  const dataPreview = typeof blockData === 'string'
    ? (blockData.length > 20 ? blockData.substring(0, 20) + '...' : blockData)
    : '-';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial
          color={baseColor}
          transparent
          opacity={isSelected ? 0.25 : hovered ? 0.2 : 0.12}
          emissive={baseColor}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.2}
          roughness={0.1}
          metalness={0.8}
        />
        <Edges threshold={15} color={baseColor} />
      </mesh>

      {/* Block index label above */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.3}
        color={baseColor}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {isGenesis ? 'GENESIS' : `BLOCK #${index}`}
      </Text>

      {/* Data preview label below */}
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.18}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
        maxWidth={2}
        textAlign="center"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {dataPreview}
      </Text>

      {/* Point light glow emanating from block */}
      <pointLight
        color={baseColor}
        intensity={isSelected ? 3 : hovered ? 2 : 0.8}
        distance={4}
        decay={2}
      />
    </group>
  );
}

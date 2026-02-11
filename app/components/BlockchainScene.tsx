'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Line } from '@react-three/drei';
import { Block } from '@/app/lib/blockchain';
import BlockCube from './BlockCube';
import * as THREE from 'three';

interface BlockchainSceneProps {
  chain: Block[];
  selectedIndex: number | null;
  onSelectBlock: (index: number | null) => void;
}

/** Compute block positions in a gentle arc formation */
function getBlockPositions(count: number): [number, number, number][] {
  const spacing = 3.5;
  const arcCurve = 0.15; // subtle upward arc
  const positions: [number, number, number][] = [];

  const totalWidth = (count - 1) * spacing;
  const startX = -totalWidth / 2;

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const x = startX + i * spacing;
    const y = Math.sin(t * Math.PI) * arcCurve * count; // gentle arc
    const z = Math.sin(t * Math.PI * 0.5) * -0.8; // slight depth
    positions.push([x, y, z]);
  }
  return positions;
}

/** Animated beam connection between two blocks */
function ConnectionBeam({
  start,
  end,
  isValid,
}: {
  start: [number, number, number];
  end: [number, number, number];
  isValid: boolean;
}) {
  const color = isValid ? '#00f0ff' : '#ef4444';

  // Create midpoint slightly offset for a curved beam
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 0.3,
    (start[2] + end[2]) / 2 - 0.2,
  ];

  return (
    <Line
      points={[start, mid, end]}
      color={color}
      lineWidth={isValid ? 1.5 : 1}
      transparent
      opacity={isValid ? 0.4 : 0.3}
      dashed
      dashSize={0.15}
      gapSize={0.1}
    />
  );
}

/** Animated light that orbits the scene */
function OrbitingLight() {
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.2;
    if (lightRef.current) {
      lightRef.current.position.x = Math.cos(t) * 12;
      lightRef.current.position.z = Math.sin(t) * 12;
      lightRef.current.position.y = Math.sin(t * 0.5) * 3 + 4;
    }
  });

  return <pointLight ref={lightRef} color="#a855f7" intensity={1.5} distance={30} decay={2} />;
}

/** Inner scene with all 3D objects */
function Scene({ chain, selectedIndex, onSelectBlock }: BlockchainSceneProps) {
  const positions = useMemo(() => getBlockPositions(chain.length), [chain.length]);

  return (
    <>
      {/* Environment */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 8, 8]} color="#00f0ff" intensity={1} distance={25} decay={2} />
      <pointLight position={[-5, -3, 5]} color="#a855f7" intensity={0.8} distance={20} decay={2} />
      <OrbitingLight />

      {/* Starfield */}
      <Stars
        radius={80}
        depth={60}
        count={4000}
        factor={4}
        saturation={0.3}
        fade
        speed={0.5}
      />

      {/* Connection beams */}
      {chain.map((block, i) => {
        if (i === 0) return null;
        const prevBlock = chain[i - 1];
        const linkValid = block.previousHash === prevBlock.hash && block.hash === block.calculateHash();
        return (
          <ConnectionBeam
            key={`beam-${i}`}
            start={positions[i - 1]}
            end={positions[i]}
            isValid={linkValid}
          />
        );
      })}

      {/* Block cubes */}
      {chain.map((block, i) => {
        const hashMatches = block.hash === block.calculateHash();
        const linkValid = i === 0 ? true : block.previousHash === chain[i - 1].hash;
        const blockIsValid = hashMatches && linkValid;
        const blockData = typeof block.data === 'string' ? block.data : JSON.stringify(block.data);

        return (
          <BlockCube
            key={block.index}
            position={positions[i]}
            index={i}
            isGenesis={i === 0}
            isValid={blockIsValid}
            isSelected={selectedIndex === i}
            onClick={() => onSelectBlock(selectedIndex === i ? null : i)}
            blockData={blockData}
          />
        );
      })}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={3}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

export default function BlockchainScene({ chain, selectedIndex, onSelectBlock }: BlockchainSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 55 }}
      style={{ background: 'linear-gradient(180deg, #030014 0%, #0d0628 40%, #020a1a 100%)' }}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onSelectBlock(null)}
    >
      <Scene chain={chain} selectedIndex={selectedIndex} onSelectBlock={onSelectBlock} />
    </Canvas>
  );
}

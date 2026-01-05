
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Sphere, Float, Stars, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

// Fix for missing JSX types in the current environment
// Augmenting both global JSX and React.JSX namespaces for maximum compatibility with @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

const COLORS: Record<string, string> = {
  'Creative': '#F4C95D', // Gold
  'Tech': '#003F72',     // Deep Blue Hover
  'Ministry': '#FFFFFF', // White
  'Content': '#9CA3AF',  // Soft Gray
  'Growth': '#D1D5DB',   // Light Gray
  'default': '#003F72'   // Deep Blue Accent
};

const AnimatedSphere = ({ activeCategory }: { activeCategory: string | null }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const targetColor = useRef(new THREE.Color(COLORS['default']));

  useFrame((state, delta) => {
    // Only animate if visible to save resources
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.15;
      meshRef.current.rotation.y = t * 0.25;
    }

    if (materialRef.current) {
      const colorKey = activeCategory || 'default';
      const hex = COLORS[colorKey] || COLORS['default'];
      targetColor.current.set(hex);
      materialRef.current.color.lerp(targetColor.current, delta * 2);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.3}>
      <Sphere args={[1, 32, 32]} scale={2} ref={meshRef}>
        {/* @ts-ignore - Fix for meshStandardMaterial JSX error */}
        <meshStandardMaterial
          ref={materialRef}
          color={COLORS['default']}
          roughness={0.4}
          metalness={0.6}
        />
      </Sphere>
    </Float>
  );
};

export const BackgroundScene = ({ activeCategory }: { activeCategory: string | null }) => {
  const [dpr, setDpr] = useState(1);
  const [isTabActive, setIsTabActive] = useState(true);

  // Visibility API to pause rendering when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas
        frameloop={isTabActive ? 'always' : 'never'}
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'low-power' }}
      >
        <PerformanceMonitor 
          onDecline={() => setDpr(0.5)} 
          onIncline={() => setDpr(window.devicePixelRatio)} 
        />
        {/* @ts-ignore - Fix for ambientLight JSX error */}
        <ambientLight intensity={0.6} />
        {/* @ts-ignore - Fix for directionalLight JSX error */}
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#F4C95D" />
        <AnimatedSphere activeCategory={activeCategory} />
        <Stars radius={80} depth={30} count={300} factor={3} fade speed={0.2} />
      </Canvas>
    </div>
  );
};

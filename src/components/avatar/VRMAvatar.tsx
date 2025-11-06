'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { VRM, VRMExpressionPresetName } from '@pixiv/three-vrm';
import { getVRMModel } from '@/services/avatar/vrmLoader';
import { useAudio } from '@/contexts/AudioContext';
import { getVisemeAtTime, type OculusViseme } from '@/services/avatar/visemeMapper';

interface VRMAvatarProps {
  state?: 'idle' | 'thinking' | 'speaking';
  size?: number;
}

/**
 * Map Oculus visemes to VRM expression names
 * VRM uses standard expression presets
 */
const VISEME_TO_VRM_EXPRESSION: Record<OculusViseme, string> = {
  'sil': 'neutral',
  'PP': 'aa',  // Lips together (use 'aa' shape with low intensity)
  'FF': 'aa',  // Lip-teeth (similar to 'aa')
  'TH': 'aa',  // Tongue-teeth
  'DD': 'aa',  // Tongue-alveolar
  'kk': 'aa',  // Back of tongue
  'CH': 'aa',  // Postalveolar
  'SS': 'aa',  // Alveolar fricative
  'nn': 'aa',  // Nasal
  'RR': 'aa',  // R sound
  'aa': 'aa',  // Open mouth
  'E': 'aa',   // Mid-front vowel
  'I': 'aa',   // High-front vowel (slight smile)
  'O': 'oh',   // Rounded lips
  'U': 'oh',   // Rounded lips
};

/**
 * VRM Model Component - handles the 3D model rendering
 */
function VRMModel({ vrm, state }: { vrm: VRM; state: 'idle' | 'thinking' | 'speaking' }) {
  const modelRef = useRef<THREE.Group>(null);
  const clockRef = useRef(new THREE.Clock());

  // Phase 2: Get viseme timeline and audio time from context
  const { visemeTimeline, currentAudioTime } = useAudio();

  // Animation loop
  useFrame(() => {
    if (!vrm) return;

    const deltaTime = clockRef.current.getDelta();

    // Update VRM (handles animations)
    vrm.update(deltaTime);

    // Phase 2: Apply viseme blendshapes during speaking
    if (state === 'speaking' && visemeTimeline && visemeTimeline.length > 0 && vrm.expressionManager) {
      const currentViseme = getVisemeAtTime(visemeTimeline, currentAudioTime);

      // Reset all expressions to 0
      const expressionManager = vrm.expressionManager;
      if (expressionManager) {
        // Get all available expressions
        const expressionNames = expressionManager.expressionMap;
        for (const name of Object.keys(expressionNames)) {
          expressionManager.setValue(name as VRMExpressionPresetName, 0);
        }

        // Apply current viseme expression
        const expressionName = VISEME_TO_VRM_EXPRESSION[currentViseme];
        if (expressionName) {
          // Map different visemes to different intensities
          let intensity = 1.0;

          // Adjust intensity based on viseme type
          if (currentViseme === 'sil') {
            intensity = 0.0; // Silence = closed mouth
          } else if (currentViseme === 'aa' || currentViseme === 'E') {
            intensity = 0.8; // Open vowels
          } else if (currentViseme === 'O' || currentViseme === 'U') {
            intensity = 0.6; // Rounded vowels
          } else if (currentViseme === 'PP') {
            intensity = 0.3; // Lips closed
          } else {
            intensity = 0.5; // Consonants
          }

          expressionManager.setValue(expressionName as VRMExpressionPresetName, intensity);
        }
      }
    } else if (vrm.expressionManager) {
      // Reset expressions when not speaking
      const expressionManager = vrm.expressionManager;
      const expressionNames = expressionManager.expressionMap;
      for (const name of Object.keys(expressionNames)) {
        expressionManager.setValue(name as VRMExpressionPresetName, 0);
      }
    }

    // Idle breathing animation
    if (state === 'idle' || state === 'speaking') {
      const time = clockRef.current.getElapsedTime();
      const breathIntensity = Math.sin(time * 2) * 0.01; // Gentle breathing

      if (vrm.humanoid) {
        const spine = vrm.humanoid.getNormalizedBoneNode('spine');
        if (spine) {
          spine.position.y = breathIntensity;
        }
      }
    }

    // Thinking animation - gentle head tilt
    if (state === 'thinking') {
      const time = clockRef.current.getElapsedTime();
      const tiltAmount = Math.sin(time * 1.5) * 0.05;

      if (vrm.humanoid) {
        const head = vrm.humanoid.getNormalizedBoneNode('head');
        if (head) {
          head.rotation.z = tiltAmount;
        }
      }
    }
  });

  return <primitive ref={modelRef} object={vrm.scene} />;
}

/**
 * 3D Avatar Scene Component
 */
function AvatarScene({ state }: { state: 'idle' | 'thinking' | 'speaking' }) {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getVRMModel()
      .then((loadedVRM) => {
        if (mounted) {
          setVrm(loadedVRM);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Failed to load VRM model:', err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#60a5fa" wireframe />
      </mesh>
    );
  }

  if (error || !vrm) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    );
  }

  return <VRMModel vrm={vrm} state={state} />;
}

/**
 * Main VRMAvatar Component
 * Renders a 3D VRM avatar using React Three Fiber
 */
export default function VRMAvatar({ state = 'idle', size = 180 }: VRMAvatarProps) {
  const { isPlaying } = useAudio();

  // Determine current state (speaking overrides thinking)
  const currentState = isPlaying ? 'speaking' : state;

  return (
    <div
      className="vrm-avatar-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.3, 2.5], fov: 30 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[1, 2, 3]}
          intensity={1.2}
          castShadow
        />
        <directionalLight
          position={[-1, 1, -1]}
          intensity={0.5}
        />

        {/* Avatar */}
        <AvatarScene state={currentState} />

        {/* Optional: Enable controls for debugging */}
        {/* <OrbitControls /> */}
      </Canvas>

      {/* State indicator overlay */}
      {currentState === 'thinking' && (
        <div
          className="thinking-indicator"
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(59, 130, 246, 0.9)',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              background: 'white',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Avatar } from './Avatar';
import dynamic from 'next/dynamic';
import type { AvatarState } from '@/types/avatar';

// Dynamically import VRMAvatar to avoid SSR issues
const VRMAvatar = dynamic(() => import('./VRMAvatar'), {
  ssr: false,
  loading: () => <Avatar state="idle" />,
});

interface AvatarFallbackProps {
  state?: AvatarState;
  size?: number;
  className?: string;
  force2D?: boolean; // Force 2D avatar for testing
}

/**
 * Detects WebGL support in the browser
 */
function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) return false;

    // Additional check: ensure WebGL is actually working
    if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
      return true;
    }

    return false;
  } catch (e) {
    console.warn('WebGL detection failed:', e);
    return false;
  }
}

/**
 * AvatarFallback Component
 *
 * Automatically detects WebGL support and renders either:
 * - VRMAvatar (3D) if WebGL is supported and enabled
 * - Avatar (2D) as fallback if WebGL is not supported or disabled
 *
 * This ensures a graceful degradation for users on unsupported browsers.
 */
export function AvatarFallback({
  state = 'idle',
  size = 180,
  className = '',
  force2D = false
}: AvatarFallbackProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [use3D, setUse3D] = useState(false);

  // Detect WebGL support on mount
  useEffect(() => {
    const webglSupported = detectWebGL();
    const enable3D = process.env.NEXT_PUBLIC_ENABLE_3D_AVATAR === 'true';

    setHasWebGL(webglSupported);
    setUse3D(webglSupported && enable3D && !force2D);

    console.log('[AvatarFallback] WebGL support:', webglSupported, '| 3D enabled:', enable3D, '| Using 3D:', webglSupported && enable3D && !force2D);
  }, [force2D]);

  // Show 2D avatar while detecting or if 3D is disabled
  if (hasWebGL === null || !use3D) {
    return <Avatar state={state} size={size} className={className} />;
  }

  // Render 3D avatar if WebGL is supported and enabled
  return <VRMAvatar state={state} size={size} />;
}

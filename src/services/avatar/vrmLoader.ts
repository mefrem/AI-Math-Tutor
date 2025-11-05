import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

/**
 * Loads a VRM model from a URL
 * @param url - Path to the VRM file
 * @returns Promise that resolves to the loaded VRM model
 */
export async function loadVRM(url: string): Promise<VRM> {
  const loader = new GLTFLoader();

  // Register VRM loader plugin
  loader.register((parser) => new VRMLoaderPlugin(parser));

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;

        if (!vrm) {
          reject(new Error('VRM data not found in the loaded model'));
          return;
        }

        // Disable frustum culling for VRM
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        // Rotate model to face camera (VRM models typically face +Z)
        vrm.scene.rotation.y = Math.PI;

        resolve(vrm);
      },
      (progress) => {
        console.log(
          `Loading VRM model: ${(100.0 * progress.loaded / progress.total).toFixed(2)}%`
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Preload VRM model with caching
 */
let cachedVRM: VRM | null = null;

export async function getVRMModel(url: string = '/models/tutor-avatar.vrm'): Promise<VRM> {
  if (cachedVRM) {
    // Return cloned model to allow multiple instances
    return cachedVRM;
  }

  cachedVRM = await loadVRM(url);
  return cachedVRM;
}

/**
 * Clear cached VRM model
 */
export function clearVRMCache(): void {
  if (cachedVRM) {
    cachedVRM.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
    cachedVRM = null;
  }
}

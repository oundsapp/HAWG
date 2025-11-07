"use client";

import { useRef, useEffect, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

function Model({ url, basePath }: { url: string; basePath: string }) {
  const [obj, setObj] = useState<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new OBJLoader();
    const textureLoader = new THREE.TextureLoader();
    let cancelled = false;
    
    // Helper function to configure texture
    const configureTexture = (texture: THREE.Texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = true; // OBJ files typically need Y-flip
      texture.colorSpace = THREE.SRGBColorSpace;
    };
    
    // Load all PBR textures
    const diffuseTexture = textureLoader.load(
      `${basePath}/texture_diffuse.png`,
      (texture) => {
        configureTexture(texture);
      }
    );
    const normalTexture = textureLoader.load(
      `${basePath}/texture_normal.png`,
      (texture) => {
        configureTexture(texture);
      }
    );
    const metallicTexture = textureLoader.load(
      `${basePath}/texture_metallic.png`,
      (texture) => {
        configureTexture(texture);
      }
    );
    const roughnessTexture = textureLoader.load(
      `${basePath}/texture_roughness.png`,
      (texture) => {
        configureTexture(texture);
      }
    );
    const pbrTexture = textureLoader.load(
      `${basePath}/texture_pbr.png`,
      (texture) => {
        configureTexture(texture);
      }
    );
    
    loader.load(
      url,
      (object: THREE.Group) => {
        if (cancelled) return;
        
        // Add material with all PBR textures to all meshes in the object
        object.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              map: diffuseTexture,
              //normalMap: normalTexture,
              metalnessMap: metallicTexture,
              roughnessMap: roughnessTexture,
              aoMap: pbrTexture,
              metalness: 0.5,
              roughness: 0.8,
              normalScale: new THREE.Vector2(1, 1),
              aoMapIntensity: 1.0,
            });
          }
        });
        
        // Center the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Move the model to center at origin
        object.position.x = -center.x;
        object.position.y = -center.y;
        object.position.z = -center.z;
        
        // Scale the model to make it bigger (smaller on mobile)
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const scale = isMobile ? 1.5 : 1.4;
        object.scale.multiplyScalar(scale);
        
        setObj(object);
      },
      undefined,
      (error: unknown) => {
        if (!cancelled) {
          console.error("Error loading OBJ:", error);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url, basePath]);

  // Auto-rotation disabled

  if (!obj) return null;

  return (
    <group ref={meshRef}>
      <primitive object={obj} />
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  useEffect(() => {
    if (isMobile) {
      camera.position.set(0, 0.8, 5.5); // Further away on mobile
    } else {
      camera.position.set(0, 0.8, 4.5);
    }
    camera.updateProjectionMatrix();
  }, [camera, isMobile]);
  
  return null;
}

export default function ModelViewer({ modelPath, basePath }: { modelPath: string; basePath: string }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Canvas 
        camera={{ position: [0, 0.8, isMobile ? 5.5 : 4.5], fov: isMobile ? 60 : 50 }}
        gl={{ alpha: true }}
      >
        <CameraController />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, 5, -5]} intensity={0.6} />
        <pointLight position={[0, 0, 5]} intensity={0.3} />
        <Suspense fallback={null}>
          <Model url={modelPath} basePath={basePath} />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={true} 
          enableRotate={true}
          minPolarAngle={Math.PI / 2 - 0.3}
          maxPolarAngle={Math.PI / 2 - 0.3}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}


import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Character } from '../../types/game';
import { Sparkles, Sun, Moon, Zap, RotateCcw, Smile, Award, ZoomIn, ZoomOut, Eye, Maximize2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ThreeLifeSceneProps {
  character: Character;
}

export const ThreeLifeScene: React.FC<ThreeLifeSceneProps> = ({ character }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const environmentGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Interaction & Camera Presets
  const [currentEmote, setCurrentEmote] = useState<
    'idle' | 'wave' | 'celebrate' | 'dance' | 'meditate' | 'walk' | 'run' | 'eat' | 'study' | 'work' | 'workout'
  >('idle');
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'cyber'>('day');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'full' | 'portrait' | 'diorama'>('full');

  // Animation values & refs for GC-free loop
  const emoteTimerRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotTargetRef = useRef<{ x: number; y: number }>({ x: 0.3, y: -0.35 });
  const rotCurrentRef = useRef<{ x: number; y: number }>({ x: 0.3, y: -0.35 });
  const cameraTargetPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.6, 5.8));
  const cameraCurrentPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 2.6, 5.8));
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.1, 0));
  const blinkTimerRef = useRef<number>(3.0);
  const isBlinkingRef = useRef<boolean>(false);

  const { age, gender, stats, currentEnrollment, currentJob, isAlive } = character;

  // Trigger celebration on age change / major milestone
  useEffect(() => {
    setCurrentEmote('celebrate');
    emoteTimerRef.current = 2.5;
  }, [age]);

  // Adjust camera preset target position
  useEffect(() => {
    if (cameraView === 'portrait') {
      cameraTargetPosRef.current.set(0, 1.55, 2.2);
      cameraLookAtRef.current.set(0, 1.35, 0);
    } else if (cameraView === 'diorama') {
      cameraTargetPosRef.current.set(0, 3.8, 7.2);
      cameraLookAtRef.current.set(0, 0.8, 0);
    } else {
      // Full body
      cameraTargetPosRef.current.set(0, 2.4, 5.2);
      cameraLookAtRef.current.set(0, 1.05, 0);
    }
  }, [cameraView]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.copy(cameraTargetPosRef.current);
    camera.lookAt(cameraLookAtRef.current);
    cameraRef.current = camera;

    // High performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Studio 3-Point Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.75);
    dirLight.position.set(4.5, 9, 5.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.bias = -0.0005;
    dirLight.name = 'mainLight';
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(-4, 6, -4);
    rimLight.name = 'rimLight';
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xfef08a, 0.65, 12);
    fillLight.position.set(2, 2.5, 3);
    fillLight.name = 'fillLight';
    scene.add(fillLight);

    // Root groups
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const envGroup = new THREE.Group();
    worldGroup.add(envGroup);
    environmentGroupRef.current = envGroup;

    const charGroup = new THREE.Group();
    worldGroup.add(charGroup);
    characterGroupRef.current = charGroup;

    // Build initial stage, character, and particles
    buildEnvironment(envGroup, age, stats.happiness);
    buildCharacter(charGroup, character);
    buildFloatingParticles(scene, age >= 100 || !isAlive);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // IntersectionObserver to pause rendering when off-screen
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    // Mouse / Touch Drag Orbit Controls
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      rotTargetRef.current.y += deltaX * 0.008;
      rotTargetRef.current.x = Math.max(0.05, Math.min(0.75, rotTargetRef.current.x + deltaY * 0.005));
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.004;
      cameraTargetPosRef.current.z = Math.max(2.0, Math.min(8.5, cameraTargetPosRef.current.z + zoomDelta));
      cameraTargetPosRef.current.y = Math.max(1.2, Math.min(4.5, cameraTargetPosRef.current.y + zoomDelta * 0.4));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // High performance RAF loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current || document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth Rotation Lerp
      if (isRotating && !isDraggingRef.current) {
        rotTargetRef.current.y += delta * 0.22;
      }
      rotCurrentRef.current.x += (rotTargetRef.current.x - rotCurrentRef.current.x) * 0.12;
      rotCurrentRef.current.y += (rotTargetRef.current.y - rotCurrentRef.current.y) * 0.12;

      worldGroup.rotation.y = rotCurrentRef.current.y;
      worldGroup.rotation.x = rotCurrentRef.current.x * 0.35;

      // Smooth Camera Transition
      cameraCurrentPosRef.current.lerp(cameraTargetPosRef.current, 0.08);
      camera.position.copy(cameraCurrentPosRef.current);
      camera.lookAt(cameraLookAtRef.current);

      // Emote countdown
      if (emoteTimerRef.current > 0) {
        emoteTimerRef.current -= delta;
        if (emoteTimerRef.current <= 0) {
          setCurrentEmote('idle');
        }
      }

      // Blinking Eyes Engine
      blinkTimerRef.current -= delta;
      if (blinkTimerRef.current <= 0) {
        isBlinkingRef.current = true;
        if (blinkTimerRef.current <= -0.15) {
          isBlinkingRef.current = false;
          blinkTimerRef.current = 2.5 + Math.random() * 3.5;
        }
      }

      // Procedural skeletal animation
      animateCharacter(charGroup, elapsed, currentEmote, stats.happiness, isBlinkingRef.current);

      // Particle sparkles animation
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsed * 0.1;
        const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          let y = posAttr.getY(i);
          y += delta * 0.35;
          if (y > 4.2) y = 0.2;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, []);

  // Update Environment & Character on state changes
  useEffect(() => {
    if (environmentGroupRef.current) {
      buildEnvironment(environmentGroupRef.current, age, stats.happiness);
    }
    if (characterGroupRef.current) {
      buildCharacter(characterGroupRef.current, character);
    }
    if (sceneRef.current) {
      buildFloatingParticles(sceneRef.current, age >= 100 || !isAlive);
    }
  }, [age, gender, stats.looks, stats.health, stats.happiness, stats.smarts, currentEnrollment, currentJob, isAlive]);

  // Update Lighting Mode
  useEffect(() => {
    if (!sceneRef.current) return;
    const ambient = sceneRef.current.getObjectByName('ambient') as THREE.AmbientLight;
    const dir = sceneRef.current.getObjectByName('mainLight') as THREE.DirectionalLight;
    const rim = sceneRef.current.getObjectByName('rimLight') as THREE.DirectionalLight;
    const fill = sceneRef.current.getObjectByName('fillLight') as THREE.PointLight;

    if (lightingMode === 'day') {
      ambient?.color.setHex(0xffffff);
      if (ambient) ambient.intensity = 0.9;
      dir?.color.setHex(0xfffaed);
      dir?.position.set(4.5, 9, 5.5);
      if (dir) dir.intensity = 1.75;
      rim?.color.setHex(0x93c5fd);
      fill?.color.setHex(0xfef08a);
    } else if (lightingMode === 'sunset') {
      ambient?.color.setHex(0xffd1b3);
      if (ambient) ambient.intensity = 0.8;
      dir?.color.setHex(0xff7733);
      dir?.position.set(6, 4.5, 4);
      if (dir) dir.intensity = 2.1;
      rim?.color.setHex(0xf43f5e);
      fill?.color.setHex(0xfbbf24);
    } else if (lightingMode === 'cyber') {
      ambient?.color.setHex(0x1e1b4b);
      if (ambient) ambient.intensity = 0.65;
      dir?.color.setHex(0x06b6d4);
      dir?.position.set(-3.5, 7, 4.5);
      if (dir) dir.intensity = 1.7;
      rim?.color.setHex(0xd946ef);
      fill?.color.setHex(0xa855f7);
    }
  }, [lightingMode]);

  const triggerEmote = (
    emote: 'wave' | 'celebrate' | 'dance' | 'meditate' | 'walk' | 'run' | 'eat' | 'study' | 'work' | 'workout'
  ) => {
    setCurrentEmote(emote);
    emoteTimerRef.current = 4.0;
    sounds.playClick();
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 shadow-2xl">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-72 sm:h-80 cursor-grab active:cursor-grabbing touch-none select-none relative"
        title="Click & drag to rotate view • Scroll wheel to zoom"
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-neutral-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-neutral-700/80 shadow-lg text-xs z-10">
        {/* Camera Views */}
        <div className="flex items-center gap-1 bg-neutral-800/90 rounded-xl p-0.5 border border-neutral-700">
          <button
            onClick={() => setCameraView('portrait')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              cameraView === 'portrait' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Portrait Closeup View"
          >
            Portrait
          </button>
          <button
            onClick={() => setCameraView('full')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              cameraView === 'full' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Full Character View"
          >
            Full
          </button>
          <button
            onClick={() => setCameraView('diorama')}
            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
              cameraView === 'diorama' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
            title="Diorama Stage View"
          >
            Diorama
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-700" />

        {/* Lighting Selector */}
        <button
          onClick={() => setLightingMode('day')}
          className={`p-1.5 rounded-xl transition-all ${
            lightingMode === 'day' ? 'bg-amber-500 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
          }`}
          title="Studio Daylight"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setLightingMode('sunset')}
          className={`p-1.5 rounded-xl transition-all ${
            lightingMode === 'sunset' ? 'bg-rose-500 text-white shadow-xs' : 'text-neutral-400 hover:text-white'
          }`}
          title="Golden Sunset"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setLightingMode('cyber')}
          className={`p-1.5 rounded-xl transition-all ${
            lightingMode === 'cyber' ? 'bg-cyan-400 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
          }`}
          title="Cyber Neon"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-neutral-700" />

        {/* Auto Rotation Toggle */}
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-xl transition-all ${
            isRotating ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title={isRotating ? 'Pause Auto-Spin' : 'Resume Auto-Spin'}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* Emote & Persona Actions Bottom Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-neutral-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-700/80 shadow-lg">
          <button
            onClick={() => triggerEmote('walk')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'walk' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🚶 Walk
          </button>
          <button
            onClick={() => triggerEmote('eat')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'eat' ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🍔 Eat
          </button>
          <button
            onClick={() => triggerEmote('study')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'study' ? 'bg-indigo-500 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🎓 Study
          </button>
          <button
            onClick={() => triggerEmote('work')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'work' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            💼 Work
          </button>
          <button
            onClick={() => triggerEmote('celebrate')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'celebrate' ? 'bg-amber-500 text-neutral-950 shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🎉 Celebrate
          </button>
          <button
            onClick={() => triggerEmote('dance')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'dance' ? 'bg-pink-600 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🕺 Dance
          </button>
          <button
            onClick={() => triggerEmote('meditate')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              currentEmote === 'meditate' ? 'bg-teal-600 text-white shadow-xs' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            🧘 Zen
          </button>
        </div>

        {/* Life Stage Indicator Badge */}
        <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-neutral-700 text-xs font-bold text-neutral-200 shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            {age === 0 && '👶 Newborn (Age 0)'}
            {age > 0 && age <= 4 && `🍼 Toddler (Age ${age})`}
            {age >= 5 && age <= 12 && `🧒 School Kid (Age ${age})`}
            {age >= 13 && age <= 17 && `🧑 Teenager (Age ${age})`}
            {age >= 18 && age <= 30 && `🎓 Young Adult (Age ${age})`}
            {age >= 31 && age <= 59 && `💼 Prime Adult (Age ${age})`}
            {age >= 60 && age <= 85 && `👴 Senior Citizen (Age ${age})`}
            {age >= 86 && age < 100 && `🧓 Golden Elder (Age ${age})`}
            {age >= 100 && `👑 Centenarian (Age ${age})`}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PROCEDURAL HIGH-QUALITY 3D GENERATION
// ==========================================

function clearGroup(group: THREE.Group) {
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    if ((obj as THREE.Mesh).material) {
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  }
}

// Build 3D Diorama Stage according to life age stage
function buildEnvironment(group: THREE.Group, age: number, happiness: number) {
  clearGroup(group);

  // Multi-tier Studio Pedestal
  let podiumColor = 0x1e222d;
  let rimColor = 0x6366f1;
  let innerColor = 0x111827;

  if (age < 6) {
    podiumColor = 0xfce7f3;
    rimColor = 0xf472b6;
    innerColor = 0xfdf2f8;
  } else if (age < 18) {
    podiumColor = 0xe0e7ff;
    rimColor = 0x4f46e5;
    innerColor = 0xeef2ff;
  } else if (age < 60) {
    podiumColor = 0x1e293b;
    rimColor = 0x38bdf8;
    innerColor = 0x0f172a;
  } else if (age >= 100) {
    podiumColor = 0x2d1f04;
    rimColor = 0xfbbf24;
    innerColor = 0x451a03;
  }

  // Base tier cylinder
  const baseGeo = new THREE.CylinderGeometry(2.6, 2.75, 0.3, 48);
  const baseMat = new THREE.MeshStandardMaterial({
    color: podiumColor,
    roughness: 0.35,
    metalness: 0.15,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -0.15;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Inner pedestal disc
  const innerGeo = new THREE.CylinderGeometry(2.35, 2.35, 0.05, 48);
  const innerMat = new THREE.MeshStandardMaterial({
    color: innerColor,
    roughness: 0.5,
    metalness: 0.1,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  innerMesh.position.y = 0.02;
  innerMesh.receiveShadow = true;
  group.add(innerMesh);

  // Glowing neon rim torus
  const ringGeo = new THREE.TorusGeometry(2.4, 0.045, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    roughness: 0.1,
    metalness: 0.8,
    emissive: rimColor,
    emissiveIntensity: 0.6,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0.03;
  group.add(ringMesh);

  // Ambient Contact Shadow Disk
  const shadowGeo = new THREE.CircleGeometry(1.2, 32);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.025;
  group.add(shadowMesh);

  // Age Specific Props
  if (age <= 5) {
    // Nursery blocks, colorful ball, teddy shape
    const blockMat1 = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const blockMat2 = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    const blockMat3 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), blockMat1);
    b1.position.set(-1.3, 0.19, 0.5);
    b1.castShadow = true;
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), blockMat2);
    b2.position.set(-1.25, 0.54, 0.5);
    b2.rotation.y = 0.35;
    b2.castShadow = true;
    group.add(b2);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), blockMat3);
    ball.position.set(1.2, 0.26, 0.7);
    ball.castShadow = true;
    group.add(ball);
  } else if (age <= 17) {
    // School study desk, stack of books, desk lamp
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.55), deskMat);
    desk.position.set(-1.35, 0.325, -0.3);
    desk.castShadow = true;
    group.add(desk);

    // Books stack
    const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.28), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
    book1.position.set(-1.35, 0.69, -0.3);
    group.add(book1);

    const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.25), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
    book2.position.set(-1.35, 0.77, -0.3);
    book2.rotation.y = 0.2;
    group.add(book2);

    // Warm study desk lamp
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.6 });
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.35, 16), lampMat);
    lamp.position.set(1.35, 0.45, -0.4);
    group.add(lamp);
  } else if (age <= 59) {
    // Modern Apple-style Workstation & Indoor Plant
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.65, 0.55), tableMat);
    table.position.set(-1.35, 0.325, -0.3);
    table.castShadow = true;
    group.add(table);

    // Sleek Laptop
    const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.26), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 }));
    lapBase.position.set(-1.35, 0.66, -0.3);
    group.add(lapBase);

    const lapScreen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.02), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 }));
    lapScreen.position.set(-1.35, 0.78, -0.42);
    group.add(lapScreen);

    // Modern Ceramic Plant Pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.38, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    pot.position.set(1.4, 0.19, 0.3);
    group.add(pot);

    const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }));
    leaves.position.set(1.4, 0.5, 0.3);
    group.add(leaves);
  } else {
    // Senior Zen garden / Grand Centenary Golden Pantheon
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.8 });
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 0.38), lanternMat);
    lantern.position.set(-1.45, 0.375, -0.3);
    group.add(lantern);

    const bonsaiPot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.16, 20), new THREE.MeshStandardMaterial({ color: 0x292524 }));
    bonsaiPot.position.set(1.35, 0.08, 0.35);
    group.add(bonsaiPot);

    const bonsaiFoliage = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 20), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 }));
    bonsaiFoliage.position.set(1.35, 0.38, 0.35);
    group.add(bonsaiFoliage);

    if (age >= 100) {
      // Golden champion pillars
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      });
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.0, 24), goldMat);
      p1.position.set(-1.65, 1.0, 0);
      group.add(p1);

      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.0, 24), goldMat);
      p2.position.set(1.65, 1.0, 0);
      group.add(p2);
    }
  }
}

// Build 3D Character Model with stylized anatomy, facial features, and accessories
function buildCharacter(group: THREE.Group, character: Character) {
  clearGroup(group);

  const { age, gender, stats, currentEnrollment, currentJob, isAlive } = character;

  // Scale based on age
  let scale = 1.0;
  let posY = 0.0;

  if (age === 0) {
    scale = 0.45;
    posY = 0.15;
  } else if (age <= 4) {
    scale = 0.62;
    posY = 0.28;
  } else if (age <= 12) {
    scale = 0.78;
    posY = 0.48;
  } else if (age <= 17) {
    scale = 0.92;
    posY = 0.72;
  } else if (age >= 80) {
    scale = 0.96;
    posY = 0.8;
  } else {
    scale = 1.0;
    posY = 0.85;
  }

  group.scale.set(scale, scale, scale);
  group.position.set(0, posY, 0);

  // Skin material with subsurface appearance
  let skinColor = 0xffdfba;
  if (!isAlive) skinColor = 0x9ca3af;
  else if (stats.health < 30) skinColor = 0xf5d0b5;
  else if (stats.looks >= 80) skinColor = 0xffe2cb;

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.5,
    metalness: 0.05,
  });

  // Clothing Colors
  let shirtColor = gender === 'female' ? 0xec4899 : 0x3b82f6;
  let pantsColor = 0x1e293b;

  if (currentJob?.job.category === 'Executive') {
    shirtColor = 0x0f172a;
    pantsColor = 0x0f172a;
  } else if (currentJob?.job.category === 'Healthcare') {
    shirtColor = 0x06b6d4;
    pantsColor = 0x0891b2;
  } else if (currentJob?.job.category === 'Tech') {
    shirtColor = 0x4f46e5;
    pantsColor = 0x1e293b;
  } else if (currentEnrollment) {
    shirtColor = 0x6366f1;
    pantsColor = 0x374151;
  } else if (age >= 75) {
    shirtColor = 0xb45309;
    pantsColor = 0x57534e;
  }

  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.45 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });

  // 1. Torso
  const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.75, 20);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = 0.85;
  torso.castShadow = true;
  torso.name = 'torso';
  group.add(torso);

  // Collar detail
  const collarGeo = new THREE.TorusGeometry(0.2, 0.04, 12, 24);
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.2, 0);
  torso.add(collar);

  // 2. Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.48, 0);
  headGroup.name = 'headGroup';
  group.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.33, 32, 32);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Ears
  const earGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.33, 0, 0);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.33, 0, 0);
  headGroup.add(rightEar);

  // Animated Eyes
  const eyeGroup = new THREE.Group();
  eyeGroup.name = 'eyeGroup';
  headGroup.add(eyeGroup);

  const eyeGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.1, 0.05, 0.3);
  eyeGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.1, 0.05, 0.3);
  eyeGroup.add(rightEye);

  // Specular Eye Highlights
  const highlightGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leftHi = new THREE.Mesh(highlightGeo, highlightMat);
  leftHi.position.set(-0.09, 0.065, 0.335);
  eyeGroup.add(leftHi);

  const rightHi = new THREE.Mesh(highlightGeo, highlightMat);
  rightHi.position.set(0.11, 0.065, 0.335);
  eyeGroup.add(rightHi);

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: age >= 65 ? 0xd1d5db : 0x27272a });
  const browGeo = new THREE.BoxGeometry(0.08, 0.02, 0.02);
  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.position.set(-0.1, 0.12, 0.31);
  leftBrow.name = 'leftBrow';
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.position.set(0.1, 0.12, 0.31);
  rightBrow.name = 'rightBrow';
  headGroup.add(rightBrow);

  // Mouth
  const mouthGeo = new THREE.TorusGeometry(0.065, 0.018, 12, 16, Math.PI);
  const mouthMat = new THREE.MeshBasicMaterial({ color: stats.happiness > 40 ? 0xd97706 : 0x4b5563 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.rotation.x = Math.PI;
  mouth.position.set(0, -0.09, 0.3);
  mouth.name = 'mouth';
  headGroup.add(mouth);

  // Hair / Accessories
  let hairColor = age >= 65 ? 0xe5e7eb : gender === 'female' ? 0x78350f : 0x1e293b;
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 });

  if (age >= 100) {
    // Golden Centenarian Crown
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5,
    });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 0.22, 12), crownMat);
    crown.position.set(0, 0.36, 0);
    headGroup.add(crown);
  } else if (currentEnrollment) {
    // Graduation Mortarboard Cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 });
    const capTop = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.58), capMat);
    capTop.position.set(0, 0.36, 0);
    capTop.rotation.y = Math.PI / 4;
    headGroup.add(capTop);

    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    tassel.position.set(0.22, 0.25, 0.22);
    headGroup.add(tassel);
  } else {
    // Stylized Hair
    const hairGeo = new THREE.SphereGeometry(0.35, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.06;
    headGroup.add(hair);

    if (gender === 'female') {
      const ponytail = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), hairMat);
      ponytail.position.set(0, 0.1, -0.32);
      headGroup.add(ponytail);
    }
  }

  // Glasses for high smarts
  if (stats.smarts >= 75) {
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const glassFrame1 = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), glassMat);
    glassFrame1.position.set(-0.1, 0.05, 0.31);
    headGroup.add(glassFrame1);

    const glassFrame2 = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), glassMat);
    glassFrame2.position.set(0.1, 0.05, 0.31);
    headGroup.add(glassFrame2);
  }

  // 3. Limbs (Arms & Legs)
  const limbGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.65, 16);

  // Left Arm
  const leftArm = new THREE.Mesh(limbGeo, shirtMat);
  leftArm.position.set(-0.43, 0.85, 0);
  leftArm.castShadow = true;
  leftArm.name = 'leftArm';
  group.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Mesh(limbGeo, shirtMat);
  rightArm.position.set(0.43, 0.85, 0);
  rightArm.castShadow = true;
  rightArm.name = 'rightArm';
  group.add(rightArm);

  // Left Leg
  const leftLeg = new THREE.Mesh(limbGeo, pantsMat);
  leftLeg.position.set(-0.16, 0.25, 0);
  leftLeg.castShadow = true;
  leftLeg.name = 'leftLeg';
  group.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(limbGeo, pantsMat);
  rightLeg.position.set(0.16, 0.25, 0);
  rightLeg.castShadow = true;
  rightLeg.name = 'rightLeg';
  group.add(rightLeg);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.16, 0.1, 0.25);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.16, -0.05, 0.05);
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.16, -0.05, 0.05);
  group.add(rightShoe);
}

// Procedural floating stardust particles
function buildFloatingParticles(scene: THREE.Scene, isGolden: boolean) {
  const existing = scene.getObjectByName('stardust');
  if (existing) {
    scene.remove(existing);
  }

  const particleCount = isGolden ? 120 : 60;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const r = 1.0 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const y = 0.2 + Math.random() * 3.5;

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: isGolden ? 0xfbbf24 : 0x60a5fa,
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'stardust';
  scene.add(points);
}

// Procedural skeletal & facial animations
function animateCharacter(
  group: THREE.Group,
  elapsed: number,
  emote:
    | 'idle'
    | 'wave'
    | 'celebrate'
    | 'dance'
    | 'meditate'
    | 'walk'
    | 'run'
    | 'eat'
    | 'study'
    | 'work'
    | 'workout',
  happiness: number,
  isBlinking: boolean
) {
  const torso = group.getObjectByName('torso');
  const headGroup = group.getObjectByName('headGroup');
  const eyeGroup = group.getObjectByName('eyeGroup');
  const leftArm = group.getObjectByName('leftArm');
  const rightArm = group.getObjectByName('rightArm');
  const leftLeg = group.getObjectByName('leftLeg');
  const rightLeg = group.getObjectByName('rightLeg');
  const leftBrow = group.getObjectByName('leftBrow');
  const rightBrow = group.getObjectByName('rightBrow');

  if (!torso || !headGroup || !leftArm || !rightArm) return;

  // Eye Blinking Animation
  if (eyeGroup) {
    eyeGroup.scale.y = isBlinking ? 0.1 : 1.0;
  }

  // Eyebrow emotional tilt
  if (leftBrow && rightBrow) {
    const browTilt = happiness > 60 ? 0.05 : happiness < 35 ? -0.05 : 0;
    leftBrow.rotation.z = -browTilt;
    rightBrow.rotation.z = browTilt;
  }

  // Reset basic defaults
  torso.rotation.set(0, 0, 0);
  if (leftLeg) leftLeg.rotation.set(0, 0, 0);
  if (rightLeg) rightLeg.rotation.set(0, 0, 0);

  // Idle Breathing
  const breathe = Math.sin(elapsed * 2.5) * 0.02;
  torso.scale.set(1 + breathe, 1, 1 + breathe);
  headGroup.position.y = 1.48 + breathe * 0.5;

  if (emote === 'idle') {
    // Natural head tilt & gentle arm sway
    headGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.1;
    headGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.03;
    leftArm.position.set(-0.43, 0.85, 0);
    rightArm.position.set(0.43, 0.85, 0);
    leftArm.rotation.set(Math.sin(elapsed * 1.5) * 0.08, 0, 0.1);
    rightArm.rotation.set(-Math.sin(elapsed * 1.5) * 0.08, 0, -0.1);
  } else if (emote === 'walk' || emote === 'run') {
    const isRun = emote === 'run';
    const speed = isRun ? 12 : 6;
    const stride = Math.sin(elapsed * speed) * (isRun ? 0.8 : 0.45);
    const armSwing = -Math.sin(elapsed * speed) * (isRun ? 0.9 : 0.5);
    const bob = Math.abs(Math.cos(elapsed * speed)) * 0.08;

    if (leftLeg) leftLeg.rotation.x = stride;
    if (rightLeg) rightLeg.rotation.x = -stride;
    leftArm.position.set(-0.43, 0.85, 0);
    rightArm.position.set(0.43, 0.85, 0);
    leftArm.rotation.set(armSwing, 0, 0.1);
    rightArm.rotation.set(-armSwing, 0, -0.1);
    torso.position.y = 0.85 + bob;
    torso.rotation.x = isRun ? 0.18 : 0.05;
  } else if (emote === 'eat') {
    leftArm.position.set(-0.43, 0.85, 0);
    rightArm.position.set(0.35, 1.1, 0.15);
    rightArm.rotation.set(-1.4 + Math.sin(elapsed * 6) * 0.2, 0, -0.4);
    leftArm.rotation.set(-0.3, 0, 0.2);
    headGroup.rotation.x = 0.15 + Math.sin(elapsed * 6) * 0.08;
  } else if (emote === 'study' || emote === 'work') {
    leftArm.position.set(-0.4, 1.0, 0.2);
    rightArm.position.set(0.4, 1.0, 0.2);
    leftArm.rotation.set(-0.8 + Math.sin(elapsed * 8) * 0.1, 0, 0.3);
    rightArm.rotation.set(-0.8 - Math.sin(elapsed * 8) * 0.1, 0, -0.3);
    headGroup.rotation.x = 0.25;
  } else if (emote === 'workout') {
    const curl = Math.sin(elapsed * 5);
    leftArm.position.set(-0.43, 0.85, 0);
    rightArm.position.set(0.43, 0.85, 0);
    leftArm.rotation.set(-curl * 1.2, 0, 0.3);
    rightArm.rotation.set(-curl * 1.2, 0, -0.3);
    headGroup.position.y = 1.48 + Math.abs(curl) * 0.08;
  } else if (emote === 'wave') {
    rightArm.position.set(0.43, 1.15, 0.1);
    rightArm.rotation.z = -2.2 + Math.sin(elapsed * 12) * 0.4;
    leftArm.rotation.z = 0.2;
    headGroup.rotation.y = 0.2;
  } else if (emote === 'celebrate') {
    const jump = Math.abs(Math.sin(elapsed * 6)) * 0.25;
    group.position.y = (group.position.y || 0.85) + jump * 0.1;
    leftArm.position.set(-0.43, 1.15, 0);
    leftArm.rotation.z = 2.4 + Math.sin(elapsed * 8) * 0.2;
    rightArm.position.set(0.43, 1.15, 0);
    rightArm.rotation.z = -2.4 - Math.sin(elapsed * 8) * 0.2;
    headGroup.rotation.x = -0.2;
  } else if (emote === 'dance') {
    torso.rotation.y = Math.sin(elapsed * 6) * 0.35;
    leftArm.rotation.z = Math.sin(elapsed * 6) * 0.8 + 0.5;
    rightArm.rotation.z = -Math.sin(elapsed * 6) * 0.8 - 0.5;
    headGroup.rotation.z = Math.sin(elapsed * 6) * 0.2;
  } else if (emote === 'meditate') {
    const floatHover = Math.sin(elapsed * 1.5) * 0.1;
    group.position.y = (group.position.y || 0.85) + floatHover;
    leftArm.rotation.z = 0.6;
    rightArm.rotation.z = -0.6;
    headGroup.rotation.x = 0.1;
  }
}

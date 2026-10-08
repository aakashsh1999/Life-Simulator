import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Character } from '../../types/game';
import {
  Sparkles,
  Sun,
  Moon,
  Zap,
  RotateCcw,
  Footprints,
  Coffee,
  GraduationCap,
  Briefcase,
  Utensils,
  Dumbbell,
  Bed,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  CheckCircle2,
  DollarSign,
  Heart,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface ThreePersonaWorldProps {
  character: Character;
  onPersonaAction?: (actionType: string, payload?: any) => void;
}

interface Destination {
  id: string;
  name: string;
  category: 'education' | 'job' | 'food' | 'gym' | 'home' | 'park';
  icon: string;
  position: { x: number; z: number };
  color: number;
  description: string;
  image: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'dest_education',
    name: 'University Academy',
    category: 'education',
    icon: '🎓',
    position: { x: -2.8, z: -2.2 },
    color: 0x4f46e5,
    description: 'Attend lectures, study textbooks, and ace exams.',
    image: '/src/assets/images/university_campus_1791446443830.jpg',
  },
  {
    id: 'dest_job',
    name: 'Corporate & Tech Tower',
    category: 'job',
    icon: '💼',
    position: { x: 2.8, z: -2.2 },
    color: 0x059669,
    description: 'Work daily shifts, complete projects, and earn salary.',
    image: '/src/assets/images/corporate_tower_1791446428710.jpg',
  },
  {
    id: 'dest_food',
    name: 'Gourmet Bistro & Cafe',
    category: 'food',
    icon: '🍔',
    position: { x: -2.8, z: 2.2 },
    color: 0xe11d48,
    description: 'Dine on delicious meals, grab espresso, and restore energy.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'dest_gym',
    name: 'Athletic Fitness Track',
    category: 'gym',
    icon: '🏋️',
    position: { x: 2.8, z: 2.2 },
    color: 0xd97706,
    description: 'Run cardio sprint laps and lift weights to boost health.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'dest_home',
    name: 'Living Quarters',
    category: 'home',
    icon: '🛋️',
    position: { x: 0, z: -3.4 },
    color: 0x8b5cf6,
    description: 'Rest, recharge full energy, and unwind.',
    image: '/src/assets/images/downtown_penthouse_1791446414569.jpg',
  },
  {
    id: 'dest_park',
    name: 'Central Plaza & Fountain',
    category: 'park',
    icon: '🌳',
    position: { x: 0, z: 0 },
    color: 0x10b981,
    description: 'Stroll around nature, meditate, and enjoy fresh air.',
    image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&auto=format&fit=crop&q=80',
  },
];

const FOOD_MENU = [
  { id: 'coffee', name: 'Triple Espresso', cost: 5, energy: 30, smarts: 4, health: 0, happiness: 4, icon: '☕', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80' },
  { id: 'burger', name: 'Gourmet Burger & Fries', cost: 15, energy: 35, smarts: 0, health: -1, happiness: 10, icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { id: 'salad', name: 'Organic Superfood Salad', cost: 20, energy: 25, smarts: 2, health: 8, happiness: 5, icon: '🥗', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80' },
  { id: 'pizza', name: 'Cheesy Pepperoni Pizza', cost: 12, energy: 30, smarts: 0, health: -2, happiness: 12, icon: '🍕', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80' },
  { id: 'sushi', name: 'Deluxe Nigiri Box', cost: 45, energy: 40, smarts: 5, health: 6, happiness: 16, icon: '🍣', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80' },
  { id: 'banquet', name: '5-Star Michelin Feast', cost: 160, energy: 50, smarts: 6, health: 4, happiness: 30, icon: '🍱', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' },
];

export const ThreePersonaWorld: React.FC<ThreePersonaWorldProps> = ({
  character,
  onPersonaAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const personaGroupRef = useRef<THREE.Group | null>(null);
  const waypointMeshRef = useRef<THREE.Mesh | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Pre-allocated reusable vectors (prevents GC frame drops)
  const personaPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const personaRotRef = useRef<number>(0);
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const scratchMoveVec = useRef<THREE.Vector2>(new THREE.Vector2());
  const scratchDirVec = useRef<THREE.Vector3>(new THREE.Vector3());
  const scratchLookAt = useRef<THREE.Vector3>(new THREE.Vector3());
  const scratchCamDesired = useRef<THREE.Vector3>(new THREE.Vector3());

  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [activeActivity, setActiveActivity] = useState<string>('idle');
  const [cameraMode, setCameraMode] = useState<'follow' | 'orbit'>('follow');
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [activeMenu, setActiveMenu] = useState<'none' | 'food' | 'education' | 'job' | 'gym'>('none');
  const [floatingToast, setFloatingToast] = useState<{ text: string; color: string; id: number } | null>(null);

  // Keyboard keys pressed
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitAngleRef = useRef<{ theta: number; phi: number }>({ theta: 0, phi: 0.65 });

  const { age, gender, stats, currentEnrollment, currentJob, money, country } = character;
  const currency = country.currencySymbol;

  // Show floating toast message
  const triggerToast = useCallback((text: string, color: string = 'text-emerald-400') => {
    setFloatingToast({ text, color, id: Date.now() });
    setTimeout(() => {
      setFloatingToast((prev) => (prev?.text === text ? null : prev));
    }, 2800);
  }, []);

  // Perform Persona Life Actions
  const executePersonaAction = useCallback(
    (actionType: string, payload?: any) => {
      if (onPersonaAction) {
        onPersonaAction(actionType, payload);
      }

      if (actionType === 'eat') {
        const item = payload;
        sounds.playEat();
        setActiveActivity('eating');
        triggerToast(`Ate ${item.name}! +${item.energy} Energy, +${item.happiness} Happiness`, 'text-emerald-300');
        setTimeout(() => setActiveActivity('idle'), 2500);
      } else if (actionType === 'study') {
        sounds.playStudy();
        setActiveActivity('studying');
        triggerToast(`Studied in Academy! +Smarts & Academic progress! 🎓`, 'text-indigo-300');
        setTimeout(() => setActiveActivity('idle'), 2800);
      } else if (actionType === 'work') {
        sounds.playCash();
        setActiveActivity('working');
        triggerToast(`Completed work shift! Earned paycheck & performance! 💼`, 'text-emerald-400');
        setTimeout(() => setActiveActivity('idle'), 2800);
      } else if (actionType === 'workout') {
        sounds.playWorkout();
        setActiveActivity('workout');
        triggerToast(`High intensity workout! +Health & Fitness! 🏋️`, 'text-amber-300');
        setTimeout(() => setActiveActivity('idle'), 2500);
      } else if (actionType === 'sleep') {
        sounds.playAgeUp();
        setActiveActivity('sleeping');
        triggerToast(`Rested peacefully! 100% Energy Restored! 💤`, 'text-purple-300');
        setTimeout(() => setActiveActivity('idle'), 2500);
      } else if (actionType === 'meditate') {
        sounds.playClick();
        setActiveActivity('meditating');
        triggerToast(`Mindful Zen meditation in Central Park. +Karma 🌸`, 'text-teal-300');
        setTimeout(() => setActiveActivity('idle'), 2500);
      }
      setActiveMenu('none');
    },
    [onPersonaAction, triggerToast]
  );

  // Navigate persona directly to a destination
  const navigateToDestination = (dest: Destination) => {
    sounds.playClick();
    targetPosRef.current = new THREE.Vector3(dest.position.x, 0, dest.position.z);
    if (waypointMeshRef.current) {
      waypointMeshRef.current.position.set(dest.position.x, 0.05, dest.position.z);
      waypointMeshRef.current.visible = true;
    }
    triggerToast(`Traveling to ${dest.name}... 🚶`, 'text-indigo-300');
  };

  // Setup ThreeJS Scene ONCE on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.04);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 4.5, 6.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    ambientLight.name = 'ambient';
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0005;
    sunLight.name = 'sunLight';
    scene.add(sunLight);

    // Build 3D City District & Props
    buildWorldDistrict(scene);

    // Waypoint click indicator ring
    const wpGeo = new THREE.RingGeometry(0.18, 0.28, 24);
    const wpMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const wpMesh = new THREE.Mesh(wpGeo, wpMat);
    wpMesh.rotation.x = -Math.PI / 2;
    wpMesh.position.set(0, 0.05, 0);
    wpMesh.visible = false;
    scene.add(wpMesh);
    waypointMeshRef.current = wpMesh;

    // Build 3D Persona Group
    const personaGroup = new THREE.Group();
    scene.add(personaGroup);
    personaGroupRef.current = personaGroup;
    buildPersonaMesh(personaGroup, character);

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

    // Visibility Observer
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    // Click Raycaster for Click-to-Move on Ground
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        if (hit.object.name === 'ground_plane') {
          const targetX = Math.max(-4.4, Math.min(4.4, hit.point.x));
          const targetZ = Math.max(-4.4, Math.min(4.4, hit.point.z));
          targetPosRef.current = new THREE.Vector3(targetX, 0, targetZ);

          if (waypointMeshRef.current) {
            waypointMeshRef.current.position.set(targetX, 0.05, targetZ);
            waypointMeshRef.current.visible = true;
          }
          sounds.playClick();
          break;
        }
      }
    };

    // Keyboard Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      keysPressedRef.current[e.code] = true;
      targetPosRef.current = null;
      if (waypointMeshRef.current) waypointMeshRef.current.visible = false;

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsSprinting(true);
      }
      if (e.code === 'KeyE') {
        checkNearbyDestination(personaPosRef.current);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setIsSprinting(false);
      }
    };

    // Mouse drag for camera orbit
    const onMouseDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      orbitAngleRef.current.theta -= dx * 0.008;
      orbitAngleRef.current.phi = Math.max(0.2, Math.min(1.2, orbitAngleRef.current.phi + dy * 0.006));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('click', onClick);
    container.addEventListener('pointerdown', onMouseDown);
    window.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Animation & Physics Loop
    let clock = new THREE.Clock();
    let animTime = 0;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!isVisibleRef.current || document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Waypoint ring pulse
      if (waypointMeshRef.current && waypointMeshRef.current.visible) {
        const scale = 1 + Math.sin(elapsed * 8) * 0.15;
        waypointMeshRef.current.scale.set(scale, scale, scale);
      }

      // Handle Locomotion Input & Movement
      let moveX = 0;
      let moveZ = 0;

      const keys = keysPressedRef.current;
      if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      const isMovingKeyboard = moveX !== 0 || moveZ !== 0;

      if (isMovingKeyboard) {
        scratchMoveVec.current.set(moveX, moveZ).normalize();
        const speed = isSprinting ? 5.2 : 2.7;
        personaPosRef.current.x += scratchMoveVec.current.x * speed * delta;
        personaPosRef.current.z += scratchMoveVec.current.y * speed * delta;
        personaRotRef.current = Math.atan2(scratchMoveVec.current.x, scratchMoveVec.current.y);
      } else if (targetPosRef.current) {
        // Pathfind to target point
        const dist = personaPosRef.current.distanceTo(targetPosRef.current);
        if (dist > 0.15) {
          scratchDirVec.current.subVectors(targetPosRef.current, personaPosRef.current).normalize();
          const speed = isSprinting ? 5.0 : 2.8;
          personaPosRef.current.addScaledVector(scratchDirVec.current, speed * delta);
          personaRotRef.current = Math.atan2(scratchDirVec.current.x, scratchDirVec.current.z);
        } else {
          targetPosRef.current = null;
          if (waypointMeshRef.current) waypointMeshRef.current.visible = false;
        }
      }

      // District boundary constraints
      personaPosRef.current.x = Math.max(-4.4, Math.min(4.4, personaPosRef.current.x));
      personaPosRef.current.z = Math.max(-4.4, Math.min(4.4, personaPosRef.current.z));

      // Update Persona Group Position & Rotation
      if (personaGroupRef.current) {
        personaGroupRef.current.position.copy(personaPosRef.current);
        personaGroupRef.current.rotation.y = personaRotRef.current;

        const isCurrentlyWalking = isMovingKeyboard || !!targetPosRef.current;
        if (isCurrentlyWalking) {
          animTime += delta * (isSprinting ? 12 : 7);
        }

        // Animate Persona Skeleton
        animatePersonaBody(
          personaGroupRef.current,
          animTime,
          isCurrentlyWalking,
          isSprinting,
          activeActivity,
          stats.happiness
        );

        // Track camera orientation for persona portrait hologram
        const portraitBadge = personaGroupRef.current.getObjectByName('persona_portrait_badge');
        if (portraitBadge && cameraRef.current) {
          portraitBadge.lookAt(cameraRef.current.position);
        }
        const portraitRing = personaGroupRef.current.getObjectByName('persona_portrait_ring');
        if (portraitRing && cameraRef.current) {
          portraitRing.lookAt(cameraRef.current.position);
        }
      }

      // Smooth Camera Lerp
      if (cameraRef.current) {
        scratchLookAt.current.set(personaPosRef.current.x, 0.8, personaPosRef.current.z);

        if (cameraMode === 'follow') {
          const camDist = 5.2;
          const camHeight = 3.6;
          const desiredCamX = personaPosRef.current.x + Math.sin(orbitAngleRef.current.theta) * camDist;
          const desiredCamZ = personaPosRef.current.z + Math.cos(orbitAngleRef.current.theta) * camDist;
          const desiredCamY = camHeight * Math.sin(orbitAngleRef.current.phi);

          scratchCamDesired.current.set(desiredCamX, desiredCamY, desiredCamZ);
          cameraRef.current.position.lerp(scratchCamDesired.current, 0.08);
          cameraRef.current.lookAt(scratchLookAt.current);
        } else {
          // Orbit mode
          const dist = 7.2;
          cameraRef.current.position.x = Math.sin(orbitAngleRef.current.theta) * dist;
          cameraRef.current.position.z = Math.cos(orbitAngleRef.current.theta) * dist;
          cameraRef.current.position.y = 4.2;
          cameraRef.current.lookAt(0, 0.5, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('click', onClick);
      container.removeEventListener('pointerdown', onMouseDown);
      window.removeEventListener('pointermove', onMouseMove);
      window.removeEventListener('pointerup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
    };
  }, []);

  // Update Persona Mesh attributes when character state changes WITHOUT recreating WebGL context
  useEffect(() => {
    if (personaGroupRef.current) {
      buildPersonaMesh(personaGroupRef.current, character);
    }
  }, [age, gender, stats.looks, stats.health, stats.happiness, currentEnrollment, currentJob]);

  // Check if character is standing near any interactive destination
  const checkNearbyDestination = (pos: THREE.Vector3) => {
    let nearest: Destination | null = null;
    let minDist = 1.6;

    for (const dest of DESTINATIONS) {
      const d = Math.hypot(pos.x - dest.position.x, pos.z - dest.position.z);
      if (d < minDist) {
        nearest = dest;
        minDist = d;
      }
    }

    if (nearest) {
      sounds.playClick();
      if (nearest.category === 'food') setActiveMenu('food');
      else if (nearest.category === 'education') setActiveMenu('education');
      else if (nearest.category === 'job') setActiveMenu('job');
      else if (nearest.category === 'gym') setActiveMenu('gym');
      else if (nearest.category === 'home') executePersonaAction('sleep');
      else if (nearest.category === 'park') executePersonaAction('meditate');
    }
  };

  // Dynamic Lighting Update
  useEffect(() => {
    if (!sceneRef.current) return;
    const amb = sceneRef.current.getObjectByName('ambient') as THREE.AmbientLight;
    const sun = sceneRef.current.getObjectByName('sunLight') as THREE.DirectionalLight;

    if (lightingMode === 'day') {
      amb?.color.setHex(0xffffff);
      if (amb) amb.intensity = 0.9;
      sun?.color.setHex(0xfffaed);
      if (sun) sun.intensity = 1.8;
      sceneRef.current.background = new THREE.Color(0x0a0e17);
    } else if (lightingMode === 'sunset') {
      amb?.color.setHex(0xffd1b3);
      if (amb) amb.intensity = 0.8;
      sun?.color.setHex(0xff6622);
      if (sun) sun.intensity = 2.1;
      sceneRef.current.background = new THREE.Color(0x1a0f1a);
    } else if (lightingMode === 'night') {
      amb?.color.setHex(0x334466);
      if (amb) amb.intensity = 0.55;
      sun?.color.setHex(0x6688cc);
      if (sun) sun.intensity = 0.9;
      sceneRef.current.background = new THREE.Color(0x05070e);
    }
  }, [lightingMode]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative text-white">
      {/* Top Header & HUD */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xl shadow-inner">
            🚶
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {character.firstName} {character.lastName}
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Age {age} • {gender}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Live Persona Simulation • Move freely, explore stations, eat, study & work!
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          {/* Sprint / Walk Toggle */}
          <button
            onClick={() => {
              setIsSprinting(!isSprinting);
              sounds.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isSprinting
                ? 'bg-amber-500 text-neutral-950 shadow-amber-500/20'
                : 'bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>{isSprinting ? '🏃 Sprinting (Fast)' : '🚶 Walking'}</span>
          </button>

          {/* Time / Lighting mode */}
          <div className="flex items-center bg-neutral-800/90 rounded-xl p-0.5 border border-neutral-700">
            <button
              onClick={() => setLightingMode('day')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingMode === 'day' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
              }`}
              title="Daylight"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLightingMode('sunset')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingMode === 'sunset' ? 'bg-rose-500 text-white font-bold' : 'text-neutral-400'
              }`}
              title="Golden Sunset"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                lightingMode === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-neutral-400'
              }`}
              title="Nighttime"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Camera Mode */}
          <button
            onClick={() => {
              setCameraMode(cameraMode === 'follow' ? 'orbit' : 'follow');
              sounds.playClick();
            }}
            className={`p-2 rounded-xl text-xs border transition-colors ${
              cameraMode === 'follow'
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-indigo-600 border-indigo-500 text-white'
            }`}
            title={cameraMode === 'follow' ? 'Switch to 360 Orbit' : 'Switch to Persona Follow'}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D World Canvas Stage */}
      <div className="relative w-full h-80 sm:h-96 select-none">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Notification Toast */}
        {floatingToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-indigo-500/50 shadow-2xl flex items-center gap-2 animate-fade-in text-xs font-bold text-white z-20">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className={floatingToast.color}>{floatingToast.text}</span>
          </div>
        )}

        {/* Live Activity State Badge */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
          <div className="bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700 text-xs font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">
              Activity:{' '}
              <strong className="text-white capitalize">
                {activeActivity === 'idle'
                  ? isSprinting
                    ? 'Jogging / Sprinting'
                    : 'Exploring District'
                  : activeActivity}
              </strong>
            </span>
          </div>

          <div className="bg-neutral-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-neutral-400 hidden sm:block">
            Controls: <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-white">W</kbd>{' '}
            <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-white">A</kbd>{' '}
            <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-white">S</kbd>{' '}
            <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-white">D</kbd> or Click on ground to walk
          </div>
        </div>

        {/* Quick Action Button for Nearby Station */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => checkNearbyDestination(personaPosRef.current)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 border border-indigo-400/40 transition-all hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interact Station</span>
          </button>
        </div>
      </div>

      {/* Interactive Destination Selector Strip */}
      <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Fast Travel Destinations:
          </span>
          <span className="text-[11px] text-indigo-400">Click any spot to walk directly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              onClick={() => {
                navigateToDestination(dest);
                setTimeout(() => {
                  if (dest.category === 'food') setActiveMenu('food');
                  else if (dest.category === 'education') setActiveMenu('education');
                  else if (dest.category === 'job') setActiveMenu('job');
                  else if (dest.category === 'gym') setActiveMenu('gym');
                }, 1200);
              }}
              className="rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-indigo-500/60 transition-all text-left group overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div className="relative w-full h-16 sm:h-20 overflow-hidden bg-neutral-950">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-1.5 left-1.5 text-base drop-shadow">{dest.icon}</span>
              </div>
              <div className="p-2">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                  {dest.name}
                </div>
                <div className="text-[10px] text-neutral-400 truncate capitalize">{dest.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Modals / Menus */}
      {activeMenu === 'food' && (
        <div className="p-5 bg-neutral-900 border-t border-rose-500/30 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍔</span>
              <div>
                <h3 className="text-sm font-bold text-white">Gourmet Bistro & Cafe Menu</h3>
                <p className="text-xs text-neutral-400">Eat delicious meals to restore Energy and Happiness</p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu('none')}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FOOD_MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => executePersonaAction('eat', item)}
                className="p-3 rounded-2xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/50 transition-all text-left flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-neutral-900">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1 right-2 text-xs font-black text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      {currency}{item.cost}
                    </span>
                    <span className="absolute top-1.5 left-1.5 text-lg">{item.icon}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{item.name}</h4>
                  <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
                    <span className="text-amber-400">⚡ +{item.energy} Energy</span>
                    {item.happiness > 0 && <span className="text-rose-400">❤️ +{item.happiness}</span>}
                    {item.smarts > 0 && <span className="text-indigo-400">🧠 +{item.smarts}</span>}
                  </div>
                </div>
                <div className="mt-2 text-center py-1 bg-rose-600/20 text-rose-300 font-bold rounded-xl text-[11px] group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  Order & Eat
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMenu === 'education' && (
        <div className="p-5 bg-neutral-900 border-t border-indigo-500/30 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <div>
                <h3 className="text-sm font-bold text-white">University & Academy Lectures</h3>
                <p className="text-xs text-neutral-400">
                  {currentEnrollment
                    ? `Enrolled: ${currentEnrollment.degree.name} (Year ${currentEnrollment.currentYear}/${currentEnrollment.totalYears})`
                    : 'Study to boost Smarts and prepare for degrees'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu('none')}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => executePersonaAction('study', { type: 'lecture' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">📚</div>
              <h4 className="text-xs font-bold text-white">Attend Academic Lecture</h4>
              <p className="text-[11px] text-neutral-400">Take detailed notes and engage with professors.</p>
              <div className="text-[11px] font-bold text-indigo-400">+5 Smarts • Boosts GPA</div>
            </button>

            <button
              onClick={() => executePersonaAction('study', { type: 'library' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">🔬</div>
              <h4 className="text-xs font-bold text-white">Science Lab & Research</h4>
              <p className="text-[11px] text-neutral-400">Perform lab experiments and research papers.</p>
              <div className="text-[11px] font-bold text-indigo-400">+6 Smarts • Academic Fame</div>
            </button>

            <button
              onClick={() => executePersonaAction('study', { type: 'exam' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-indigo-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">✍️</div>
              <h4 className="text-xs font-bold text-white">Take Semester Exams</h4>
              <p className="text-[11px] text-neutral-400">Demonstrate mastery and pass courses.</p>
              <div className="text-[11px] font-bold text-amber-400">+Grade Advancement</div>
            </button>
          </div>
        </div>
      )}

      {activeMenu === 'job' && (
        <div className="p-5 bg-neutral-900 border-t border-emerald-500/30 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <div>
                <h3 className="text-sm font-bold text-white">Corporate Tower & Workstation</h3>
                <p className="text-xs text-neutral-400">
                  {currentJob
                    ? `Role: ${currentJob.job.title} • ${currency}${currentJob.currentSalary.toLocaleString()}/yr`
                    : 'Freelance gig & job opportunities'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu('none')}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => executePersonaAction('work', { type: 'shift' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">💻</div>
              <h4 className="text-xs font-bold text-white">Work Daily Shift</h4>
              <p className="text-[11px] text-neutral-400">Deliver on client deliverables and team projects.</p>
              <div className="text-[11px] font-bold text-emerald-400">+Salary Wages • +10 Performance</div>
            </button>

            <button
              onClick={() => executePersonaAction('work', { type: 'overtime' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">⚡</div>
              <h4 className="text-xs font-bold text-white">Overtime Sprint</h4>
              <p className="text-[11px] text-neutral-400">Work late night to exceed quarterly KPIs.</p>
              <div className="text-[11px] font-bold text-amber-400">+18 Performance • Bonus Pay</div>
            </button>

            <button
              onClick={() => executePersonaAction('work', { type: 'pitch' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">📈</div>
              <h4 className="text-xs font-bold text-white">Pitch Promotion to Boss</h4>
              <p className="text-[11px] text-neutral-400">Present executive deck for salary boost.</p>
              <div className="text-[11px] font-bold text-indigo-400">Promotion Review</div>
            </button>
          </div>
        </div>
      )}

      {activeMenu === 'gym' && (
        <div className="p-5 bg-neutral-900 border-t border-amber-500/30 animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              <div>
                <h3 className="text-sm font-bold text-white">Athletic Gym & Sprint Circuit</h3>
                <p className="text-xs text-neutral-400">Boost cardiovascular health, fitness, and aesthetic looks</p>
              </div>
            </div>
            <button
              onClick={() => setActiveMenu('none')}
              className="px-2.5 py-1 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => executePersonaAction('workout', { type: 'run' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">🏃‍♂️</div>
              <h4 className="text-xs font-bold text-white">5km Sprint Circuit</h4>
              <p className="text-[11px] text-neutral-400">High speed endurance cardio session.</p>
              <div className="text-[11px] font-bold text-amber-400">+6 Health • -Stress</div>
            </button>

            <button
              onClick={() => executePersonaAction('workout', { type: 'weights' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">💪</div>
              <h4 className="text-xs font-bold text-white">Heavy Compound Lifting</h4>
              <p className="text-[11px] text-neutral-400">Bench press, squats, and dumbbell curls.</p>
              <div className="text-[11px] font-bold text-amber-400">+5 Health • +4 Looks</div>
            </button>

            <button
              onClick={() => executePersonaAction('workout', { type: 'yoga' })}
              className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 transition-all text-left space-y-1.5"
            >
              <div className="text-xl">🧘</div>
              <h4 className="text-xs font-bold text-white">Mobility & Yoga Stretch</h4>
              <p className="text-[11px] text-neutral-400">Flexibility and core restoration.</p>
              <div className="text-[11px] font-bold text-teal-400">+8 Happiness • +3 Health</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3D PROCEDURAL WORLD GENERATION HELPERS
// ==========================================

function buildWorldDistrict(scene: THREE.Scene) {
  // Ground Base (District Plaza)
  const groundGeo = new THREE.PlaneGeometry(11, 11);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x141a24,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  ground.name = 'ground_plane';
  scene.add(ground);

  // Crosswalk / Cobblestone Walkways
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x222e40, roughness: 0.7 });
  const p1 = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.4), pathMat);
  p1.rotation.x = -Math.PI / 2;
  p1.position.set(0, 0.005, 0);
  p1.receiveShadow = true;
  scene.add(p1);

  const p2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 10.5), pathMat);
  p2.rotation.x = -Math.PI / 2;
  p2.position.set(0, 0.005, 0);
  p2.receiveShadow = true;
  scene.add(p2);

  // Central Fountain in Plaza
  const fountainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.5 });
  const fBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.28, 28), new THREE.MeshStandardMaterial({ color: 0x334155 }));
  fBasin.position.set(0, 0.14, 0);
  scene.add(fBasin);

  const fWater = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.29, 28), fountainMat);
  fWater.position.set(0, 0.15, 0);
  scene.add(fWater);

  const fCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.75, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
  fCenter.position.set(0, 0.38, 0);
  scene.add(fCenter);

  // 1. EDUCATION ZONE (Top Left)
  buildEducationStation(scene, -2.8, -2.2);

  // 2. CORPORATE & JOB TOWER (Top Right)
  buildJobStation(scene, 2.8, -2.2);

  // 3. DINER & BISTRO (Bottom Left)
  buildFoodStation(scene, -2.8, 2.2);

  // 4. FITNESS GYM & TRACK (Bottom Right)
  buildGymStation(scene, 2.8, 2.2);

  // 5. HOME QUARTERS (North)
  buildHomeStation(scene, 0, -3.4);

  // Decorative Trees
  addTree(scene, -4.2, 0);
  addTree(scene, 4.2, 0);
  addTree(scene, 0, 4.2);
  addTree(scene, -4.2, -4.2);
  addTree(scene, 4.2, 4.2);
}

const texLoader = new THREE.TextureLoader();

function createStationBuilding(
  imageUrl: string,
  width: number,
  height: number,
  neonColor: number,
  titleText: string
) {
  const buildingGroup = new THREE.Group();

  // Foundation platform
  const pod = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 })
  );
  pod.position.y = 0.1;
  pod.receiveShadow = true;
  buildingGroup.add(pod);

  // Neon glowing perimeter line
  const edgeGeo = new THREE.BoxGeometry(2.64, 0.04, 2.64);
  const edgeMat = new THREE.MeshBasicMaterial({ color: neonColor });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.y = 0.2;
  buildingGroup.add(edge);

  // Real Image Facade Billboard
  const texture = texLoader.load(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const facadeGeo = new THREE.PlaneGeometry(width, height);
  const facadeMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.25,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const facadeMesh = new THREE.Mesh(facadeGeo, facadeMat);
  facadeMesh.position.set(0, height / 2 + 0.2, -0.6);
  facadeMesh.castShadow = true;
  buildingGroup.add(facadeMesh);

  // Archway / Frame behind the image
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  backWall.position.set(0, height / 2 + 0.2, -0.7);
  backWall.castShadow = true;
  buildingGroup.add(backWall);

  // Roof Canopy Trim
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.35, 0.12, 0.8),
    new THREE.MeshStandardMaterial({ color: neonColor, roughness: 0.3 })
  );
  canopy.position.set(0, height + 0.26, -0.4);
  buildingGroup.add(canopy);

  // Entrance steps
  const step = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.1, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
  );
  step.position.set(0, 0.24, 0.35);
  buildingGroup.add(step);

  return buildingGroup;
}

// 🎓 Education Station (University Campus Real Image)
function buildEducationStation(scene: THREE.Scene, x: number, z: number) {
  const building = createStationBuilding(
    '/src/assets/images/university_campus_1791446443830.jpg',
    2.2,
    1.6,
    0x6366f1,
    'University Academy'
  );
  building.position.set(x, 0, z);
  scene.add(building);
}

// 💼 Job & Tech Tower Station (Corporate Skyscraper Real Image)
function buildJobStation(scene: THREE.Scene, x: number, z: number) {
  const building = createStationBuilding(
    '/src/assets/images/corporate_tower_1791446428710.jpg',
    2.2,
    1.9,
    0x10b981,
    'Corporate Tech Tower'
  );
  building.position.set(x, 0, z);
  scene.add(building);
}

// 🍔 Gourmet Diner & Cafe (Real Bistro Image)
function buildFoodStation(scene: THREE.Scene, x: number, z: number) {
  const building = createStationBuilding(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    2.2,
    1.5,
    0xf43f5e,
    'Gourmet Bistro & Cafe'
  );
  building.position.set(x, 0, z);
  scene.add(building);
}

// 🏋️ Athletic Fitness Gym & Track (Real Gym Image)
function buildGymStation(scene: THREE.Scene, x: number, z: number) {
  const building = createStationBuilding(
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    2.2,
    1.5,
    0xf59e0b,
    'Athletic Fitness Track'
  );
  building.position.set(x, 0, z);
  scene.add(building);
}

// 🛋️ Home Living Station (Downtown Penthouse Real Image)
function buildHomeStation(scene: THREE.Scene, x: number, z: number) {
  const building = createStationBuilding(
    '/src/assets/images/downtown_penthouse_1791446414569.jpg',
    2.2,
    1.6,
    0x8b5cf6,
    'Living Quarters & Home'
  );
  building.position.set(x, 0, z);
  scene.add(building);
}

function addTree(scene: THREE.Scene, x: number, z: number) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0x5a3d28 }));
  trunk.position.set(x, 0.45, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }));
  foliage.position.set(x, 1.4, z);
  foliage.castShadow = true;
  scene.add(foliage);
}

// ==========================================
// 3D PROCEDURAL PERSONA MESH & SKELETON
// ==========================================

function buildPersonaMesh(group: THREE.Group, character: Character) {
  while (group.children.length > 0) {
    const c = group.children[0];
    group.remove(c);
  }

  const { gender, stats, currentJob, age } = character;
  const isMale = gender === 'male';

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.5 });
  let shirtColor = isMale ? 0x2563eb : 0xec4899;
  if (currentJob) shirtColor = 0x059669;
  if (age < 6) shirtColor = 0x38bdf8;

  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.4 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

  // 1. Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.22), shirtMat);
  torso.position.y = 0.68;
  torso.castShadow = true;
  torso.name = 'torso';
  group.add(torso);

  // Floating Real Persona Portrait Hologram
  const personaTex = texLoader.load('/src/assets/images/persona_portrait_1791446380264.jpg');
  personaTex.colorSpace = THREE.SRGBColorSpace;
  const portraitGeo = new THREE.PlaneGeometry(0.5, 0.5);
  const portraitMat = new THREE.MeshBasicMaterial({
    map: personaTex,
    side: THREE.DoubleSide,
  });
  const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
  portraitMesh.position.y = 1.75;
  portraitMesh.name = 'persona_portrait_badge';
  group.add(portraitMesh);

  const ringGeo = new THREE.RingGeometry(0.25, 0.28, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.y = 1.75;
  ringMesh.position.z = 0.005;
  ringMesh.name = 'persona_portrait_ring';
  group.add(ringMesh);

  // 2. Head & Hair
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.05, 0);
  headGroup.name = 'head';

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  const hairColor = age >= 65 ? 0xd1d5db : isMale ? 0x1f2937 : 0x78350f;
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.3 })
  );
  hair.position.y = 0.02;
  headGroup.add(hair);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
  leftEye.position.set(0.07, 0.02, 0.18);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeMat);
  rightEye.position.set(-0.07, 0.02, 0.18);
  headGroup.add(rightEye);

  group.add(headGroup);

  // 3. Left & Right Arms
  const armGeo = new THREE.BoxGeometry(0.1, 0.38, 0.1);

  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(0.24, 0.65, 0);
  leftArm.castShadow = true;
  leftArm.name = 'leftArm';
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(-0.24, 0.65, 0);
  rightArm.castShadow = true;
  rightArm.name = 'rightArm';
  group.add(rightArm);

  // 4. Left & Right Legs
  const legGeo = new THREE.BoxGeometry(0.12, 0.44, 0.12);

  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(0.1, 0.24, 0);
  leftLeg.castShadow = true;
  leftLeg.name = 'leftLeg';
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(-0.1, 0.24, 0);
  rightLeg.castShadow = true;
  rightLeg.name = 'rightLeg';
  group.add(rightLeg);

  let scale = 1.0;
  if (age < 3) scale = 0.55;
  else if (age < 8) scale = 0.72;
  else if (age < 16) scale = 0.88;
  group.scale.set(scale, scale, scale);
}

function animatePersonaBody(
  group: THREE.Group,
  time: number,
  isWalking: boolean,
  isSprinting: boolean,
  activity: string,
  happiness: number
) {
  const leftLeg = group.getObjectByName('leftLeg');
  const rightLeg = group.getObjectByName('rightLeg');
  const leftArm = group.getObjectByName('leftArm');
  const rightArm = group.getObjectByName('rightArm');
  const head = group.getObjectByName('head');
  const torso = group.getObjectByName('torso');

  if (isWalking) {
    const strideAngle = Math.sin(time) * (isSprinting ? 0.75 : 0.45);
    const armAngle = -Math.sin(time) * (isSprinting ? 0.8 : 0.5);
    const bob = Math.abs(Math.cos(time * 2)) * 0.05;

    if (leftLeg) leftLeg.rotation.x = strideAngle;
    if (rightLeg) rightLeg.rotation.x = -strideAngle;
    if (leftArm) leftArm.rotation.x = armAngle;
    if (rightArm) rightArm.rotation.x = -armAngle;

    if (torso) {
      torso.position.y = 0.68 + bob;
      torso.rotation.x = isSprinting ? 0.15 : 0.05;
    }
    if (head) {
      head.position.y = 1.05 + bob;
      head.rotation.y = Math.sin(time * 0.5) * 0.08;
    }
  } else {
    const breathe = Math.sin(time * 2) * 0.02;

    if (leftLeg) leftLeg.rotation.x = 0;
    if (rightLeg) rightLeg.rotation.x = 0;

    if (activity === 'eating') {
      if (rightArm) {
        rightArm.rotation.x = -1.3 + Math.sin(time * 5) * 0.2;
        rightArm.rotation.z = 0.4;
      }
      if (leftArm) leftArm.rotation.x = -0.4;
      if (head) head.rotation.x = 0.15 + Math.sin(time * 5) * 0.08;
    } else if (activity === 'studying' || activity === 'working') {
      if (leftArm) leftArm.rotation.x = -0.9;
      if (rightArm) rightArm.rotation.x = -0.9 + Math.sin(time * 6) * 0.1;
      if (head) head.rotation.x = 0.2;
    } else if (activity === 'workout') {
      const curl = Math.sin(time * 4);
      if (leftArm) leftArm.rotation.x = -curl * 1.2;
      if (rightArm) rightArm.rotation.x = -curl * 1.2;
      if (head) head.position.y = 1.05 + Math.abs(curl) * 0.05;
    } else if (activity === 'sleeping' || activity === 'meditating') {
      if (leftArm) leftArm.rotation.x = 0;
      if (rightArm) rightArm.rotation.x = 0;
      if (head) head.rotation.x = 0.3;
    } else {
      if (leftArm) leftArm.rotation.x = 0;
      if (rightArm) rightArm.rotation.x = 0;
      if (head) head.position.y = 1.05 + breathe;
      if (torso) torso.position.y = 0.68 + breathe;
    }
  }
}

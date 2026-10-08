import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LifeLogEntry } from '../../types/game';
import { Sparkles, Calendar, RotateCcw, ZoomIn } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ThreeLifeConstellationProps {
  lifeLogs: LifeLogEntry[];
  currentAge: number;
}

export const ThreeLifeConstellation: React.FC<ThreeLifeConstellationProps> = ({
  lifeLogs,
  currentAge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const starsGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<LifeLogEntry | null>(null);
  const [autoOrbit, setAutoOrbit] = useState<boolean>(true);

  const rotRef = useRef<{ x: number; y: number }>({ x: 0.3, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 7.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const centerGlow = new THREE.PointLight(0x6366f1, 2.5, 15);
    centerGlow.position.set(0, 0, 0);
    scene.add(centerGlow);

    // Center Core Sun / Soul Orb
    const coreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      })
    );
    scene.add(coreMesh);

    // Orbital Rings
    [2.0, 3.2, 4.4].forEach((radius) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.015, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x312e81, transparent: true, opacity: 0.4 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // Life Nodes Group
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);
    starsGroupRef.current = starsGroup;

    // Build timeline stars in a spiral galaxy formation
    const totalEntries = Math.max(lifeLogs.length, 1);
    const starGeo = new THREE.SphereGeometry(0.12, 16, 16);

    lifeLogs.forEach((log, index) => {
      const progress = index / totalEntries;
      const angle = progress * Math.PI * 6; // 3 full turns
      const radius = 1.2 + progress * 3.2;
      const height = (progress - 0.5) * 1.5;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;

      let color = 0x60a5fa; // Default Blue
      if (log.type === 'milestone') color = 0xf59e0b; // Gold
      else if (log.type === 'health') color = 0xf43f5e; // Rose
      else if (log.type === 'career') color = 0x10b981; // Emerald
      else if (log.type === 'wealth') color = 0x8b5cf6; // Purple

      const starMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(x, y, z);
      star.userData = { log };
      starsGroup.add(star);
    });

    // Mouse drag rotation
    const onDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      rotRef.current.y += dx * 0.008;
      rotRef.current.x = Math.max(-0.5, Math.min(1.0, rotRef.current.x + dy * 0.005));
    };

    const onUp = () => {
      isDraggingRef.current = false;
    };

    // Click Raycaster for picking 3D milestone star nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(starsGroup.children);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData?.log) {
          setSelectedEntry(hit.userData.log);
          sounds.playClick();
        }
      }
    };

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('click', onClick);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoOrbit && !isDraggingRef.current) {
        rotRef.current.y += delta * 0.2;
      }

      starsGroup.rotation.y = rotRef.current.y;
      starsGroup.rotation.x = rotRef.current.x;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
    };
  }, [lifeLogs]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            3D 100-Year Life Constellation ({lifeLogs.length} Stars)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-400 hidden sm:inline">Click any star to inspect memory</span>
          <button
            onClick={() => setAutoOrbit(!autoOrbit)}
            className={`p-1.5 rounded-xl text-xs transition-colors ${
              autoOrbit ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
            title="Toggle Galaxy Orbit"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoOrbit ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800">
        <div ref={containerRef} className="w-full h-64 cursor-pointer select-none" />

        {selectedEntry && (
          <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 backdrop-blur-md p-3 rounded-xl border border-indigo-500/40 text-xs shadow-xl animate-fade-in flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Age {selectedEntry.age}: {selectedEntry.title}</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {selectedEntry.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-neutral-400 hover:text-white px-2 py-0.5 rounded-lg bg-neutral-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

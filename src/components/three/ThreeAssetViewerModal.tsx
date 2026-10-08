import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RealEstate, Vehicle } from '../../types/game';
import { X, Eye, Palette, Lightbulb, Volume2, RotateCw, ZoomIn, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ThreeAssetViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: RealEstate | Vehicle | null;
  assetType: 'property' | 'vehicle';
  currencySymbol: string;
}

const CAR_COLORS = [
  { name: 'Racing Red', hex: '#dc2626' },
  { name: 'Midnight Obsidian', hex: '#0f172a' },
  { name: 'Cyber Titanium', hex: '#64748b' },
  { name: 'Monaco Blue', hex: '#2563eb' },
  { name: 'Hyper Yellow', hex: '#eab308' },
  { name: 'Emerald British Green', hex: '#059669' },
  { name: 'Pure Pearl White', hex: '#f8fafc' },
];

export const ThreeAssetViewerModal: React.FC<ThreeAssetViewerModalProps> = ({
  isOpen,
  onClose,
  asset,
  assetType,
  currencySymbol,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>(CAR_COLORS[0].hex);
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [studioLight, setStudioLight] = useState<'showroom' | 'night' | 'sunset'>('showroom');

  const rotRef = useRef<{ y: number; x: number }>({ y: 0.5, x: 0.3 });
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen || !asset || !containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 360;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0.8, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    ambient.name = 'ambient';
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.name = 'keyLight';
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x60a5fa, 1.5, 20);
    rimLight.position.set(-6, 4, -4);
    rimLight.name = 'rimLight';
    scene.add(rimLight);

    // Floor Turntable
    const floorGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Glowing Neon Ring on Turntable
    const ringGeo = new THREE.TorusGeometry(4.25, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Model group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Build the 3D Asset
    if (assetType === 'vehicle') {
      build3DVehicle(modelGroup, asset as Vehicle, selectedColor, headlightsOn);
    } else {
      build3DProperty(modelGroup, asset as RealEstate, headlightsOn);
    }

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const nw = entry.contentRect.width;
        const nh = entry.contentRect.height;
        if (nw > 0 && nh > 0 && rendererRef.current) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          rendererRef.current.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse Drag Controls
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
      rotRef.current.x = Math.max(0.05, Math.min(0.9, rotRef.current.x + dy * 0.005));
    };

    const onUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    // Render loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current) {
        rotRef.current.y += delta * 0.35;
      }

      modelGroup.rotation.y = rotRef.current.y;
      modelGroup.rotation.x = rotRef.current.x * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
    };
  }, [isOpen, asset, assetType]);

  // Update vehicle color / headlights without re-initializing entire scene
  useEffect(() => {
    if (!modelGroupRef.current || !asset) return;
    if (assetType === 'vehicle') {
      build3DVehicle(modelGroupRef.current, asset as Vehicle, selectedColor, headlightsOn);
    } else {
      build3DProperty(modelGroupRef.current, asset as RealEstate, headlightsOn);
    }
  }, [selectedColor, headlightsOn]);

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">{asset.name}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  3D Showroom
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Market Value: {currencySymbol}{asset.purchasePrice.toLocaleString()} • Drag to inspect 360°
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Canvas Area */}
        <div className="relative w-full h-80 sm:h-96 bg-neutral-950">
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Quick HUD Overlays */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700/80 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-300">
              {assetType === 'vehicle' ? 'Photorealistic Aero Studio' : 'Architectural CAD Visualizer'}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-xl border border-neutral-700/80">
            <button
              onClick={() => setHeadlightsOn(!headlightsOn)}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                headlightsOn ? 'bg-amber-400 text-neutral-950 shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
              title="Toggle Headlights / Windows Glow"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                autoRotate ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Toggle Turntable Spin"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customization & Specs Footer */}
        <div className="p-5 bg-neutral-900 border-t border-neutral-800 space-y-4">
          {assetType === 'vehicle' && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom Exterior Paint Finish:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {CAR_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setSelectedColor(c.hex);
                      sounds.playClick();
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor === c.hex
                        ? 'scale-125 border-white shadow-lg'
                        : 'border-transparent hover:scale-110 opacity-75'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
            <div>
              <span className="text-neutral-500 block">Class:</span>
              <strong className="text-white font-bold">{asset.type}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">Annual Upkeep:</span>
              <strong className="text-amber-400 font-bold">
                {currencySymbol}
                {assetType === 'vehicle'
                  ? (asset as Vehicle).annualMaintenance.toLocaleString()
                  : ((asset as RealEstate).annualMaintenance + (asset as RealEstate).annualPropertyTax).toLocaleString()}
                /yr
              </strong>
            </div>
            <div>
              <span className="text-neutral-500 block">
                {assetType === 'vehicle' ? 'Top Speed Rating:' : 'Est. Rental Yield:'}
              </span>
              <strong className="text-emerald-400 font-bold">
                {assetType === 'vehicle'
                  ? `${(asset as Vehicle).speedRating}/100`
                  : `+${currencySymbol}${(asset as RealEstate).rentalIncomeAnnual?.toLocaleString() || 0}/yr`}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3D MODEL BUILDERS (VEHICLE & REAL ESTATE)
// ==========================================

function clearModelGroup(group: THREE.Group) {
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

function build3DVehicle(group: THREE.Group, vehicle: Vehicle, paintHex: string, lights: boolean) {
  clearModelGroup(group);

  const paintColor = new THREE.Color(paintHex);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: paintColor,
    metalness: 0.85,
    roughness: 0.15,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85,
  });

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.1 });
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: lights ? 0xffffff : 0x222222,
    emissiveIntensity: lights ? 1.5 : 0.1,
  });
  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: lights ? 0xff0000 : 0x330000,
    emissiveIntensity: lights ? 1.2 : 0.1,
  });

  if (vehicle.type === 'Sports Car' || vehicle.type === 'Luxury Sedan' || vehicle.type === 'Economy Car') {
    const isSupercar = vehicle.type === 'Sports Car';

    // Main Chassis
    const chassisGeo = new THREE.BoxGeometry(2.2, isSupercar ? 0.45 : 0.65, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    group.add(chassis);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(1.8, isSupercar ? 0.38 : 0.6, isSupercar ? 2.2 : 2.6);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, isSupercar ? 0.95 : 1.15, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Spoiler for supercar
    if (isSupercar) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.4), bodyMat);
      wing.position.set(0, 1.05, 2.0);
      group.add(wing);
    }

    // Headlights
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), lightMat);
    h1.position.set(-0.7, 0.65, -2.2);
    group.add(h1);

    const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.1), lightMat);
    h2.position.set(0.7, 0.65, -2.2);
    group.add(h2);

    // Taillights
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), tailLightMat);
    t1.position.set(-0.7, 0.65, 2.2);
    group.add(t1);

    const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.1), tailLightMat);
    t2.position.set(0.7, 0.65, 2.2);
    group.add(t2);

    // Wheels (4)
    const wheelPositions = [
      [-1.15, 0.35, -1.3],
      [1.15, 0.35, -1.3],
      [-1.15, 0.35, 1.3],
      [1.15, 0.35, 1.3],
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 20), wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(x, y, z);
      tire.castShadow = true;
      group.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.29, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(x, y, z);
      group.add(rim);
    });
  } else if (vehicle.type === 'Yacht') {
    // 3D Luxury Yacht Hull
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.8, 5.5, 16), bodyMat);
    hull.rotation.x = Math.PI / 2;
    hull.position.y = 0.6;
    group.add(hull);

    // Superstructure decks
    const deck1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 3.2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    deck1.position.set(0, 1.1, -0.4);
    group.add(deck1);

    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.8), glassMat);
    deck2.position.set(0, 1.6, -0.2);
    group.add(deck2);

    // Radar Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), rimMat);
    mast.position.set(0, 2.1, -0.2);
    group.add(mast);
  } else if (vehicle.type === 'Private Jet') {
    // 3D Jet Fuselage
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 6.0, 16), bodyMat);
    fuse.rotation.x = Math.PI / 2;
    fuse.position.y = 0.9;
    group.add(fuse);

    // Nose Cone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 16), bodyMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0.9, -3.6);
    group.add(nose);

    // Wings
    const wings = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.08, 1.4), bodyMat);
    wings.position.set(0, 0.85, 0.2);
    group.add(wings);

    // Jet Engines (2)
    const eng1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 12), rimMat);
    eng1.rotation.x = Math.PI / 2;
    eng1.position.set(-1.0, 1.1, 1.8);
    group.add(eng1);

    const eng2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 12), rimMat);
    eng2.rotation.x = Math.PI / 2;
    eng2.position.set(1.0, 1.1, 1.8);
    group.add(eng2);
  } else {
    // Motorcycle / Other
    const bikeBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 2.6), bodyMat);
    bikeBody.position.y = 0.8;
    group.add(bikeBody);

    const frontWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16), wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.4, -1.2);
    group.add(frontWheel);

    const backWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16), wheelMat);
    backWheel.rotation.z = Math.PI / 2;
    backWheel.position.set(0, 0.4, 1.2);
    group.add(backWheel);
  }
}

function build3DProperty(group: THREE.Group, property: RealEstate, lights: boolean) {
  clearModelGroup(group);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: lights ? 0xfef08a : 0x0284c7,
    emissiveIntensity: lights ? 1.0 : 0.2,
    roughness: 0.1,
  });

  const poolWaterMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.9,
  });

  // Base grass lawn
  const lawn = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.1, 4.8),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
  );
  lawn.position.y = 0.05;
  lawn.receiveShadow = true;
  group.add(lawn);

  if (property.type === 'Mansion' || property.type === 'Villa' || property.type === 'Penthouse') {
    // Luxury 2-Story Villa Structure
    const floor1 = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 2.6), wallMat);
    floor1.position.set(-0.4, 0.65, 0);
    floor1.castShadow = true;
    group.add(floor1);

    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 2.0), wallMat);
    floor2.position.set(-0.4, 1.75, 0);
    floor2.castShadow = true;
    group.add(floor2);

    // Modern Flat Roof Trim
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 2.2), roofMat);
    roof.position.set(-0.4, 2.3, 0);
    group.add(roof);

    // Large Glass Windows
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.05), windowMat);
    w1.position.set(-0.4, 0.7, 1.32);
    group.add(w1);

    const w2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.05), windowMat);
    w2.position.set(-0.4, 1.75, 1.02);
    group.add(w2);

    // Swimming Pool on right lawn
    const pool = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 2.2), poolWaterMat);
    pool.position.set(1.5, 0.1, 0.4);
    group.add(pool);

    // Palm Tree
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    trunk.position.set(1.5, 0.7, -1.4);
    group.add(trunk);

    const palmFoliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 })
    );
    palmFoliage.position.set(1.5, 1.4, -1.4);
    group.add(palmFoliage);
  } else {
    // Single Family Home / Apartment
    const mainHouse = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), wallMat);
    mainHouse.position.set(0, 0.65, 0);
    mainHouse.castShadow = true;
    group.add(mainHouse);

    // Slanted Gable Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.9, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 1.7, 0);
    group.add(roof);

    // Windows & Door
    const windowFront = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), windowMat);
    windowFront.position.set(0.5, 0.7, 1.22);
    group.add(windowFront);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.05), new THREE.MeshStandardMaterial({ color: 0x9a3412 }));
    door.position.set(-0.4, 0.4, 1.22);
    group.add(door);
  }
}

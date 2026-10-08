import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Dices, Sparkles, Trophy } from 'lucide-react';

interface ThreeDiceRollerProps {
  money: number;
  currencySymbol: string;
  onUpdateMoney: (amount: number, reason: string) => void;
}

export const ThreeDiceRoller: React.FC<ThreeDiceRollerProps> = ({
  money,
  currencySymbol,
  onUpdateMoney,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dice1Ref = useRef<THREE.Mesh | null>(null);
  const dice2Ref = useRef<THREE.Mesh | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [betType, setBetType] = useState<'over7' | 'under7' | 'lucky7' | 'doubles'>('over7');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<{ d1: number; d2: number; sum: number } | null>(null);
  const [message, setMessage] = useState<string>('Select bet and roll the 3D dice!');

  // Dice face rotation maps for (1..6)
  const faceRotations: { [key: number]: THREE.Euler } = {
    1: new THREE.Euler(0, 0, 0),
    2: new THREE.Euler(Math.PI / 2, 0, 0),
    3: new THREE.Euler(0, 0, -Math.PI / 2),
    4: new THREE.Euler(0, 0, Math.PI / 2),
    5: new THREE.Euler(-Math.PI / 2, 0, 0),
    6: new THREE.Euler(Math.PI, 0, 0),
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 460;
    const height = 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x064e3b); // Casino green felt

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 4.5, 3.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xfffaed, 2.0);
    spot.position.set(0, 8, 2);
    spot.castShadow = true;
    scene.add(spot);

    // Green Felt Table Surface with wooden rim
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.2, 5),
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.8 })
    );
    table.position.y = -0.1;
    table.receiveShadow = true;
    scene.add(table);

    // Create 2 3D Dice with rounded texture/pips
    const diceGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const createDiceMaterials = () => {
      // 6 face textures (1..6)
      const mats: THREE.MeshStandardMaterial[] = [];
      for (let i = 1; i <= 6; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 128, 128);

        // Border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 122, 122);

        // Draw Pips (dots)
        ctx.fillStyle = i === 1 ? '#dc2626' : '#0f172a';
        const drawDot = (cx: number, cy: number) => {
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.fill();
        };

        if (i === 1) drawDot(64, 64);
        if (i === 2) {
          drawDot(36, 36);
          drawDot(92, 92);
        }
        if (i === 3) {
          drawDot(34, 34);
          drawDot(64, 64);
          drawDot(94, 94);
        }
        if (i === 4) {
          drawDot(36, 36);
          drawDot(92, 36);
          drawDot(36, 92);
          drawDot(92, 92);
        }
        if (i === 5) {
          drawDot(34, 34);
          drawDot(94, 34);
          drawDot(64, 64);
          drawDot(34, 94);
          drawDot(94, 94);
        }
        if (i === 6) {
          drawDot(36, 30);
          drawDot(92, 30);
          drawDot(36, 64);
          drawDot(92, 64);
          drawDot(36, 98);
          drawDot(92, 98);
        }

        const tex = new THREE.CanvasTexture(canvas);
        mats.push(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2 }));
      }
      return mats;
    };

    const d1 = new THREE.Mesh(diceGeo, createDiceMaterials());
    d1.position.set(-0.8, 0.4, 0);
    d1.castShadow = true;
    scene.add(d1);
    dice1Ref.current = d1;

    const d2 = new THREE.Mesh(diceGeo, createDiceMaterials());
    d2.position.set(0.8, 0.4, 0);
    d2.castShadow = true;
    scene.add(d2);
    dice2Ref.current = d2;

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, []);

  const rollDice = () => {
    if (money < betAmount) {
      setMessage('⚠️ Insufficient cash for this roll!');
      return;
    }
    if (isRolling) return;

    sounds.playClick();
    onUpdateMoney(-betAmount, `Placed ${currencySymbol}${betAmount} Craps Dice bet`);
    setIsRolling(true);

    const result1 = Math.floor(Math.random() * 6) + 1;
    const result2 = Math.floor(Math.random() * 6) + 1;
    const sum = result1 + result2;

    const startTime = performance.now();
    const duration = 1600; // ms

    const animateRoll = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);

      if (dice1Ref.current && dice2Ref.current) {
        if (progress < 1) {
          // Tumbling & bouncing
          const bounce = Math.sin(progress * Math.PI * 4) * (1 - progress) * 1.5;
          dice1Ref.current.position.y = 0.4 + bounce;
          dice1Ref.current.position.x = -0.8 + Math.sin(progress * Math.PI * 2) * 0.3;
          dice1Ref.current.rotation.x += 0.35;
          dice1Ref.current.rotation.y += 0.45;
          dice1Ref.current.rotation.z += 0.25;

          dice2Ref.current.position.y = 0.4 + bounce * 0.8;
          dice2Ref.current.position.x = 0.8 - Math.sin(progress * Math.PI * 2) * 0.3;
          dice2Ref.current.rotation.x -= 0.4;
          dice2Ref.current.rotation.y += 0.35;
          dice2Ref.current.rotation.z -= 0.3;

          requestAnimationFrame(animateRoll);
        } else {
          // Final landing position
          dice1Ref.current.position.set(-0.7, 0.4, 0);
          dice2Ref.current.position.set(0.7, 0.4, 0);

          const targetRot1 = faceRotations[result1];
          const targetRot2 = faceRotations[result2];

          dice1Ref.current.rotation.set(targetRot1.x, targetRot1.y, targetRot1.z);
          dice2Ref.current.rotation.set(targetRot2.x, targetRot2.y, targetRot2.z);

          setIsRolling(false);
          setLastRoll({ d1: result1, d2: result2, sum });

          // Resolve Bet
          let won = false;
          let multiplier = 0;

          if (betType === 'over7' && sum > 7) {
            won = true;
            multiplier = 2;
          } else if (betType === 'under7' && sum < 7) {
            won = true;
            multiplier = 2;
          } else if (betType === 'lucky7' && sum === 7) {
            won = true;
            multiplier = 5; // 5x payout for exact 7!
          } else if (betType === 'doubles' && result1 === result2) {
            won = true;
            multiplier = 4; // 4x payout for doubles!
          }

          if (won) {
            const payout = betAmount * multiplier;
            onUpdateMoney(payout, `Won 3D Dice Roll (${sum})`);
            setMessage(`🎉 YOU WON! ${multiplier}x Payout: +${currencySymbol}${payout.toLocaleString()}`);
            sounds.playCash();
            confetti({ particleCount: 60, spread: 70 });
          } else {
            setMessage(`Rolled ${result1} + ${result2} = ${sum}. House wins this roll.`);
          }
        }
      }
    };

    requestAnimationFrame(animateRoll);
  };

  return (
    <div className="space-y-4">
      {/* 3D Dice Stage */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-700/80 shadow-inner">
        <div ref={containerRef} className="w-full h-52 bg-emerald-950" />

        {lastRoll && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-amber-300 border border-amber-400/40">
            Rolled: {lastRoll.d1} + {lastRoll.d2} = {lastRoll.sum}
          </div>
        )}
      </div>

      {/* Bet Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
        <button
          onClick={() => setBetType('over7')}
          disabled={isRolling}
          className={`p-2.5 rounded-xl border transition-all ${
            betType === 'over7'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          Over 7 (2x)
          <span className="block text-[10px] font-normal opacity-80">Sum: 8 - 12</span>
        </button>

        <button
          onClick={() => setBetType('under7')}
          disabled={isRolling}
          className={`p-2.5 rounded-xl border transition-all ${
            betType === 'under7'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          Under 7 (2x)
          <span className="block text-[10px] font-normal opacity-80">Sum: 2 - 6</span>
        </button>

        <button
          onClick={() => setBetType('lucky7')}
          disabled={isRolling}
          className={`p-2.5 rounded-xl border transition-all ${
            betType === 'lucky7'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          Lucky 7 (5x)
          <span className="block text-[10px] font-normal opacity-80">Exact Sum 7</span>
        </button>

        <button
          onClick={() => setBetType('doubles')}
          disabled={isRolling}
          className={`p-2.5 rounded-xl border transition-all ${
            betType === 'doubles'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          Doubles (4x)
          <span className="block text-[10px] font-normal opacity-80">e.g. 3 & 3</span>
        </button>
      </div>

      {/* Bet Amount & Roll Button */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {[25, 100, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              disabled={isRolling}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                betAmount === amt
                  ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                  : 'border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              {currencySymbol}{amt}
            </button>
          ))}
        </div>

        <button
          onClick={rollDice}
          disabled={isRolling || money < betAmount}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-neutral-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling...' : `Roll 3D Dice (${currencySymbol}${betAmount})`}</span>
        </button>
      </div>

      {message && (
        <div className="text-center text-xs font-bold text-amber-300 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
          {message}
        </div>
      )}
    </div>
  );
};

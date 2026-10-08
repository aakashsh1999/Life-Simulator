import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Disc } from 'lucide-react';

interface ThreeRouletteWheelProps {
  money: number;
  currencySymbol: string;
  onUpdateMoney: (amount: number, reason: string) => void;
}

// European roulette numbers in wheel order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const ThreeRouletteWheel: React.FC<ThreeRouletteWheelProps> = ({
  money,
  currencySymbol,
  onUpdateMoney,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const wheelGroupRef = useRef<THREE.Group | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [betChoice, setBetChoice] = useState<'red' | 'black' | 'even' | 'odd' | 'green'>('red');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('Select your color/bet and spin the 3D wheel!');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 460;
    const height = 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 4.2, 3.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xfffaed, 2.5);
    spot.position.set(0, 7, 3);
    spot.castShadow = true;
    scene.add(spot);

    // Wooden Outer Bowl
    const bowlGeo = new THREE.CylinderGeometry(2.4, 2.2, 0.4, 48);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.2 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = -0.2;
    scene.add(bowl);

    // Gold Brass Rim
    const brassRim = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.08, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.15 })
    );
    brassRim.rotation.x = Math.PI / 2;
    brassRim.position.y = 0.05;
    scene.add(brassRim);

    // Wheel Rotor Group
    const wheelGroup = new THREE.Group();
    scene.add(wheelGroup);
    wheelGroupRef.current = wheelGroup;

    // Draw Roulette Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const center = 256;
    const radius = 240;
    const totalSlots = ROULETTE_NUMBERS.length;
    const sliceAngle = (Math.PI * 2) / totalSlots;

    ROULETTE_NUMBERS.forEach((num, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      if (num === 0) ctx.fillStyle = '#16a34a'; // Green 0
      else if (RED_NUMBERS.has(num)) ctx.fillStyle = '#dc2626'; // Red
      else ctx.fillStyle = '#18181b'; // Black
      ctx.fill();

      // Numbers text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(num.toString(), radius - 15, 6);
      ctx.restore();
    });

    const wheelTexture = new THREE.CanvasTexture(canvas);
    const wheelCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 0.2, 48),
      new THREE.MeshStandardMaterial({ map: wheelTexture, roughness: 0.3 })
    );
    wheelCylinder.position.y = -0.05;
    wheelGroup.add(wheelCylinder);

    // Center Golden Turret
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 0.4, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 })
    );
    turret.position.y = 0.15;
    wheelGroup.add(turret);

    // Roulette Ball
    const ballGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.3 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(1.8, 0.1, 0);
    scene.add(ball);
    ballRef.current = ball;

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (!isSpinning && wheelGroupRef.current) {
        wheelGroupRef.current.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, [isSpinning]);

  const spinWheel = () => {
    if (money < betAmount) {
      setResultMessage('⚠️ Insufficient cash for this bet!');
      return;
    }
    if (isSpinning) return;

    sounds.playClick();
    onUpdateMoney(-betAmount, `Placed ${currencySymbol}${betAmount} 3D Roulette bet`);
    setIsSpinning(true);

    const winIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winningNum = ROULETTE_NUMBERS[winIndex];

    const spinDuration = 3200; // ms
    const startTime = performance.now();

    const animateSpin = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / spinDuration);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      if (wheelGroupRef.current && ballRef.current) {
        // Wheel rotation
        wheelGroupRef.current.rotation.y = easeOut * Math.PI * 14 + (winIndex / ROULETTE_NUMBERS.length) * Math.PI * 2;

        // Ball track orbit (counter-rotational)
        const ballAngle = -(1 - easeOut) * Math.PI * 24;
        const ballRadius = 2.0 - easeOut * 0.4;
        ballRef.current.position.x = Math.cos(ballAngle) * ballRadius;
        ballRef.current.position.z = Math.sin(ballAngle) * ballRadius;
        ballRef.current.position.y = 0.08 + Math.abs(Math.sin(elapsed * 0.02)) * 0.04 * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(animateSpin);
        } else {
          setIsSpinning(false);
          setWinningNumber(winningNum);

          const isRed = RED_NUMBERS.has(winningNum);
          const isBlack = winningNum !== 0 && !isRed;
          const isEven = winningNum !== 0 && winningNum % 2 === 0;
          const isOdd = winningNum % 2 !== 0;

          let won = false;
          let multiplier = 0;

          if (betChoice === 'red' && isRed) {
            won = true;
            multiplier = 2;
          } else if (betChoice === 'black' && isBlack) {
            won = true;
            multiplier = 2;
          } else if (betChoice === 'even' && isEven) {
            won = true;
            multiplier = 2;
          } else if (betChoice === 'odd' && isOdd) {
            won = true;
            multiplier = 2;
          } else if (betChoice === 'green' && winningNum === 0) {
            won = true;
            multiplier = 14; // Huge payout for hitting single Green 0!
          }

          if (won) {
            const payout = betAmount * multiplier;
            onUpdateMoney(payout, `Won 3D Roulette (${winningNum} ${isRed ? 'Red' : isBlack ? 'Black' : 'Green'})`);
            setResultMessage(`🎉 WINNER! Ball landed on ${winningNum} (${isRed ? 'Red' : isBlack ? 'Black' : 'Green'})! +${currencySymbol}${payout.toLocaleString()}`);
            sounds.playCash();
            confetti({ particleCount: 70, spread: 80 });
          } else {
            setResultMessage(`Ball landed on ${winningNum} (${isRed ? 'Red' : isBlack ? 'Black' : 'Green'}). House wins.`);
          }
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="space-y-4">
      {/* 3D Wheel Stage */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-800/80 shadow-inner">
        <div ref={containerRef} className="w-full h-56 bg-neutral-950" />

        {winningNumber !== null && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold border border-amber-400/40 flex items-center gap-1.5">
            <span>Result:</span>
            <span
              className={`px-2 py-0.5 rounded text-white font-black ${
                winningNumber === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(winningNumber) ? 'bg-rose-600' : 'bg-neutral-800'
              }`}
            >
              {winningNumber}
            </span>
          </div>
        )}
      </div>

      {/* Betting Options */}
      <div className="grid grid-cols-5 gap-2 text-xs font-bold">
        <button
          onClick={() => setBetChoice('red')}
          disabled={isSpinning}
          className={`p-2.5 rounded-xl border transition-all ${
            betChoice === 'red'
              ? 'bg-rose-600 text-white border-white shadow-md scale-105'
              : 'bg-rose-950/70 text-rose-300 border-rose-900 hover:border-rose-700'
          }`}
        >
          🔴 RED (2x)
        </button>

        <button
          onClick={() => setBetChoice('black')}
          disabled={isSpinning}
          className={`p-2.5 rounded-xl border transition-all ${
            betChoice === 'black'
              ? 'bg-neutral-800 text-white border-white shadow-md scale-105'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
          }`}
        >
          ⚫ BLACK (2x)
        </button>

        <button
          onClick={() => setBetChoice('even')}
          disabled={isSpinning}
          className={`p-2.5 rounded-xl border transition-all ${
            betChoice === 'even'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          EVEN (2x)
        </button>

        <button
          onClick={() => setBetChoice('odd')}
          disabled={isSpinning}
          className={`p-2.5 rounded-xl border transition-all ${
            betChoice === 'odd'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
          }`}
        >
          ODD (2x)
        </button>

        <button
          onClick={() => setBetChoice('green')}
          disabled={isSpinning}
          className={`p-2.5 rounded-xl border transition-all ${
            betChoice === 'green'
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md scale-105'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-900 hover:border-emerald-700'
          }`}
        >
          🟢 ZERO (14x)
        </button>
      </div>

      {/* Bet Amount & Spin Button */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          {[25, 100, 500, 2000].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              disabled={isSpinning}
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
          onClick={spinWheel}
          disabled={isSpinning || money < betAmount}
          className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-neutral-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 text-sm flex items-center justify-center gap-2"
        >
          <Disc className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : `Spin 3D Wheel (${currencySymbol}${betAmount})`}</span>
        </button>
      </div>

      {resultMessage && (
        <div className="text-center text-xs font-bold text-amber-300 bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
          {resultMessage}
        </div>
      )}
    </div>
  );
};

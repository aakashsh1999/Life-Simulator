import React from 'react';
import { Character } from '../types/game';
import { Trophy, Sparkles, Award, Star, Flame, Heart, Crown, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CenturyVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  netWorth: number;
  onRebirth: () => void;
}

export const CenturyVictoryModal: React.FC<CenturyVictoryModalProps> = ({
  isOpen,
  onClose,
  character,
  netWorth,
  onRebirth,
}) => {
  if (!isOpen) return null;

  const { firstName, lastName, age, birthYear, activeMission, stats, country } = character;
  const currentYear = birthYear + age;

  // Calculate Life Rating Score
  const milestoneCount = activeMission?.milestones?.filter((m) => m.completed)?.length || 0;
  let score = 0;
  score += age * 50;
  score += Math.min(3000, Math.floor(netWorth / 5000));
  score += Math.floor(stats.health + stats.happiness + stats.smarts + stats.karma + stats.fame) * 10;
  score += milestoneCount * 800;

  let grade = 'A';
  let title = 'Honored Centenarian';
  if (score > 12000) {
    grade = 'SSS';
    title = 'Immortal Legend of the Century';
  } else if (score > 9000) {
    grade = 'SS';
    title = 'Grand Centenary Paragon';
  } else if (score > 7000) {
    grade = 'S';
    title = 'Master of Century Longevity';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-amber-400 shadow-2xl max-w-2xl w-full overflow-hidden my-6 max-h-[92vh] flex flex-col animate-scale-up">
        {/* Victory Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-900 text-neutral-950 p-6 sm:p-8 relative shrink-0 text-center">
          <div className="inline-flex items-center gap-1.5 bg-neutral-950/80 text-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-md border border-amber-400/40">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>100-Year Life Century Milestone Reached!</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
            100 YEARS OF LIFE COMPLETED!
          </h1>
          <p className="text-sm font-bold text-neutral-900 mt-1 max-w-lg mx-auto">
            {firstName} {lastName} was born in {birthYear} and has triumphed through an entire century to reach Year {currentYear}!
          </p>

          {/* Big Grade Badge */}
          <div className="mt-4 inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-amber-300 shadow-lg">
            <span className="text-3xl font-black text-amber-600 tracking-tighter">
              GRADE {grade}
            </span>
            <div className="w-px h-8 bg-neutral-300" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block leading-none">
                Century Title
              </span>
              <span className="text-sm font-black text-neutral-900">
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime Achievements & Stats Summary */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-neutral-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Lifespan</span>
              <span className="text-lg font-black text-indigo-900 tabular-nums">100 Years</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Final Net Worth</span>
              <span className="text-lg font-black text-emerald-600 tabular-nums">
                {country.currencySymbol}{Math.floor(netWorth).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Quest Milestones</span>
              <span className="text-lg font-black text-amber-600 tabular-nums">
                {milestoneCount} / 6 Done
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Life Score</span>
              <span className="text-lg font-black text-purple-700 tabular-nums">
                {score.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Life Quest Recap */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Assigned Life Mission</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {activeMission?.title}
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              {activeMission?.description}
            </p>
          </div>

          {/* Action Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="py-3 px-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue Living (Supercentenarian) 🌟</span>
            </button>
            <button
              onClick={() => {
                sounds.playFanfare();
                onRebirth();
              }}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-md"
            >
              <span>Rebirth: Start New Persona (Year 2026) 👶</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

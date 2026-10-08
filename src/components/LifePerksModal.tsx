import React from 'react';
import { Character, LifePerk } from '../types/game';
import { LIFE_PERKS } from '../data/missionsData';
import { Zap, ShieldCheck, Check, Sparkles, X, Lock } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LifePerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUnlockPerk: (perkId: string) => void;
}

export const LifePerksModal: React.FC<LifePerksModalProps> = ({
  isOpen,
  onClose,
  character,
  onUnlockPerk,
}) => {
  if (!isOpen) return null;

  const { perkPoints, unlockedPerks } = character;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-xl w-full overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-indigo-950 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>RPG Skill Tree & Life Perks</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Enhance Your Persona
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5">
                Spend perk points earned from completing milestones and leveling up.
              </p>
            </div>
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl px-4 py-2 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Available</span>
              <span className="text-xl font-black text-amber-300 tabular-nums">
                {perkPoints} Points
              </span>
            </div>
          </div>
        </div>

        {/* Perks Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-neutral-50/60">
          {LIFE_PERKS.map((perk) => {
            const isUnlocked = unlockedPerks?.includes(perk.id);
            const canAfford = perkPoints >= perk.costPoints;

            return (
              <div
                key={perk.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                    : canAfford
                    ? 'bg-white border-indigo-200 hover:border-indigo-400 shadow-xs'
                    : 'bg-white/60 border-neutral-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl mt-0.5">{perk.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">
                        {perk.name}
                      </h4>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active Buff
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      {perk.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isUnlocked ? (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      Unlocked
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playUpgrade();
                        onUnlockPerk(perk.id);
                      }}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-xs active:scale-95'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Unlock</span>
                      <span className="text-[10px] font-black opacity-80">({perk.costPoints} pt)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

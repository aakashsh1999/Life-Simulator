import React from 'react';
import { Character, MissionMilestone } from '../types/game';
import { Target, CheckCircle2, Circle, Trophy, Award, Gift, Sparkles, X, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface MissionQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
}

export const MissionQuestModal: React.FC<MissionQuestModalProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  if (!isOpen) return null;

  const { activeMission, age, birthYear } = character;
  if (!activeMission) return null;

  const completedCount = activeMission.milestones.filter((m) => m.completed).length;
  const totalCount = activeMission.milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-neutral-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>100-Year Life Quest & Calling</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{activeMission.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeMission.title}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                {activeMission.subtitle}
              </p>
            </div>
          </div>

          {/* Progress Bar & Destiny Perk */}
          <div className="mt-4 pt-3 border-t border-indigo-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-200">
                Quest Progress:
              </span>
              <span className="text-xs font-black text-amber-300 tabular-nums">
                {completedCount} / {totalCount} Milestones ({progressPercent}%)
              </span>
            </div>
            <div className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
              ✨ {activeMission.destinyPerk}
            </div>
          </div>
        </div>

        {/* Milestone Path */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-neutral-50/50">
          <p className="text-xs text-neutral-600 leading-relaxed bg-white p-3.5 rounded-2xl border border-neutral-200">
            {activeMission.description} Complete the 6 life-stage milestones as you age from 0 to 100 to achieve your full destiny.
          </p>

          <div className="space-y-3">
            {activeMission.milestones.map((m, index) => {
              const isCurrent = !m.completed && (age >= m.minAge || index === 0 || activeMission.milestones[index - 1]?.completed);
              const isLocked = !m.completed && age < m.minAge && !isCurrent;

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    m.completed
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : isCurrent
                      ? 'bg-white border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-neutral-100/70 border-neutral-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {m.completed ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-300 text-neutral-600 flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">{m.icon}</span>
                          <h4 className={`text-sm font-bold ${m.completed ? 'text-emerald-950' : 'text-neutral-900'}`}>
                            {m.title}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                            Ages {m.minAge} - {m.maxAge}
                          </span>
                          {m.completed && m.completedAtAge !== undefined && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              Completed at Age {m.completedAtAge} (Year {birthYear + m.completedAtAge})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        +{m.xpReward} XP
                      </div>
                      {m.cashReward && (
                        <div className="text-[10px] font-semibold text-emerald-600 mt-1">
                          +${m.cashReward.toLocaleString()} Cash
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Age up to progress through life stages and unlock milestone rewards!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Continue Journey
          </button>
        </div>
      </div>
    </div>
  );
};

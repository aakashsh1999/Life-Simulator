import React from 'react';
import { Character } from '../types/game';
import { getLifeStage, getEraForYear } from '../data/missionsData';
import { Target, Award, Sparkles, Zap, ChevronRight, Trophy, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CenturyTimelineBarProps {
  character: Character;
  onOpenQuestModal: () => void;
  onOpenPerksModal: () => void;
  onOpenEraModal: () => void;
}

export const CenturyTimelineBar: React.FC<CenturyTimelineBarProps> = ({
  character,
  onOpenQuestModal,
  onOpenPerksModal,
  onOpenEraModal,
}) => {
  const { age, birthYear, activeMission, level, currentXp, nextLevelXp, perkPoints } = character;
  const currentYear = birthYear + age;
  const stageInfo = getLifeStage(age);
  const eraInfo = getEraForYear(currentYear);

  // Calculate milestones done
  const completedMilestones = activeMission?.milestones?.filter((m) => m.completed)?.length || 0;
  const totalMilestones = activeMission?.milestones?.length || 6;
  const missionProgress = Math.round((completedMilestones / totalMilestones) * 100);

  // Active milestone to display
  const currentMilestone = activeMission?.milestones?.find((m) => !m.completed) || activeMission?.milestones?.[activeMission.milestones.length - 1];

  // Age progress toward 100
  const agePercent = Math.min(100, Math.max(0, (age / 100) * 100));
  const xpPercent = Math.min(100, Math.max(0, (currentXp / nextLevelXp) * 100));

  return (
    <div className="bg-gradient-to-r from-neutral-950 via-purple-950 to-neutral-950 text-white border-b border-fuchsia-900/60 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        {/* Top Mini Strip: Age, Year, Era, and Quest Progress */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Year & Age Century Tracker */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-purple-950/80 border border-fuchsia-800/60 rounded-xl px-2.5 py-1">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block leading-none">
                  Year
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 tracking-tight tabular-nums">
                  {currentYear}
                </span>
              </div>
              <div className="w-px h-6 bg-indigo-700/60" />
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block leading-none">
                  Lifespan
                </span>
                <span className="text-sm sm:text-base font-black text-white tracking-tight tabular-nums">
                  Age {age} <span className="text-xs text-neutral-400">/ 100</span>
                </span>
              </div>
            </div>

            {/* Life Stage Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-neutral-800/80 border border-neutral-700 rounded-xl px-2.5 py-1">
              <span className="text-base">{stageInfo.icon}</span>
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block leading-none">
                  Stage
                </span>
                <span className="text-xs font-bold text-neutral-200">
                  {stageInfo.label}
                </span>
              </div>
            </div>

            {/* Era Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenEraModal();
              }}
              className="flex items-center gap-1.5 bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl px-2.5 py-1 transition-colors text-left"
              title="View Historical Era Details"
            >
              <span className="text-sm">{eraInfo.icon}</span>
              <div className="hidden md:block">
                <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold block leading-none">
                  Historical Era
                </span>
                <span className="text-xs font-bold text-neutral-100 truncate max-w-[150px] block">
                  {eraInfo.title}
                </span>
              </div>
            </button>
          </div>

          {/* Right Side: Quest Status & RPG Level / Perks */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Level & XP */}
            <div className="flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 rounded-xl px-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-xs text-white">
                {level}
              </div>
              <div className="text-left min-w-[70px] sm:min-w-[90px]">
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-200 leading-none mb-1">
                  <span>Level {level}</span>
                  <span className="text-neutral-400 tabular-nums">{currentXp}/{nextLevelXp} XP</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Perks Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenPerksModal();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                perkPoints > 0
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse hover:bg-amber-500/30'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Perks</span>
              {perkPoints > 0 && (
                <span className="bg-amber-500 text-neutral-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  +{perkPoints}
                </span>
              )}
            </button>

            {/* Life Quest Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onOpenQuestModal();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3 py-1.5 rounded-xl border border-indigo-400/30 font-bold text-xs shadow-xs transition-transform active:scale-95"
            >
              <Target className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden xs:inline">100-Yr Mission:</span>
              <span className="truncate max-w-[100px] sm:max-w-[130px]">
                {activeMission?.title || 'Life Quest'}
              </span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-md tabular-nums font-black">
                {completedMilestones}/{totalMilestones}
              </span>
            </button>
          </div>
        </div>

        {/* 100-Year Life Span Timeline Bar */}
        <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 shrink-0">
            0-100 Year Journey:
          </span>
          <div className="flex-1 bg-neutral-800/90 rounded-full h-2.5 overflow-hidden relative border border-neutral-700/60">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${agePercent}%` }}
            />
            {/* 100-year mark indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-400" title="100 Years Milestone" />
          </div>
          <span className="text-[11px] font-bold text-amber-300 tabular-nums shrink-0">
            {age}% of Century
          </span>

          {currentMilestone && (
            <div className="hidden lg:flex items-center gap-1.5 text-neutral-300 text-[11px] ml-2 shrink-0 bg-neutral-800/60 px-2 py-0.5 rounded-lg border border-neutral-700/50">
              <span className="text-amber-400 font-bold">Current Quest:</span>
              <span className="truncate max-w-[220px] font-medium text-white">
                {currentMilestone.title}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

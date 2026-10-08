import React, { useState } from 'react';
import { Character, LifeLogEntry, Achievement } from '../../types/game';
import { BookmarkCheck, Trophy, Sparkles, Filter, Calendar, Award, CheckCircle2, Lock, Orbit } from 'lucide-react';
import { ThreeLifeConstellation } from '../three/ThreeLifeConstellation';
import { sounds } from '../../utils/audio';

interface LifeLogTabProps {
  character: Character;
}

export const LifeLogTab: React.FC<LifeLogTabProps> = ({ character }) => {
  const [activeView, setActiveView] = useState<'journal' | 'achievements'>('journal');
  const [show3DConstellation, setShow3DConstellation] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { lifeLog, achievements, birthYear, age } = character;

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'milestone', label: '⭐ Milestones' },
    { id: 'career', label: '💼 Career' },
    { id: 'education', label: '🎓 Education' },
    { id: 'love', label: '❤️ Love & Family' },
    { id: 'asset', label: '🏡 Assets' },
    { id: 'finance', label: '💰 Finance' },
    { id: 'health', label: '🏥 Health' },
  ];

  const filteredLogs = lifeLog.filter((entry) => {
    if (selectedCategory === 'all') return true;
    return entry.category === selectedCategory;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveView('journal');
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'journal'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            📜 100-Year Life Journal ({lifeLog.length})
          </button>
          <button
            onClick={() => {
              setActiveView('achievements');
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeView === 'achievements'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            🏆 Achievements ({unlockedCount} / {achievements.length})
          </button>
        </div>
      </div>

      {/* 1. LIFE JOURNAL TIMELINE */}
      {activeView === 'journal' && (
        <div className="space-y-5">
          {/* 3D Life Constellation */}
          {show3DConstellation && (
            <ThreeLifeConstellation lifeLogs={lifeLog} currentAge={age} />
          )}

          <div className="flex items-center justify-between">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShow3DConstellation(!show3DConstellation)}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-800 flex items-center gap-1 px-3 py-1.5 bg-neutral-100 rounded-xl whitespace-nowrap ml-2"
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>{show3DConstellation ? 'Hide 3D Galaxy' : 'Show 3D Galaxy'}</span>
            </button>
          </div>

          {/* Timeline Feed */}
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-sm">
                No events recorded in this category yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                {filteredLogs.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                        entry.isSignificant ? 'bg-amber-500 ring-2 ring-amber-200' : 'bg-indigo-500'
                      }`}
                    />

                    <div className="bg-neutral-50/80 hover:bg-indigo-50/40 border border-neutral-100 group-hover:border-indigo-200 rounded-2xl p-4 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                            Age {entry.age}
                          </span>
                          <span className="text-xs font-medium text-neutral-400">
                            Year {entry.year}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {entry.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-neutral-900 text-sm">{entry.title}</h4>
                      <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACHIEVEMENTS SYSTEM */}
      {activeView === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-neutral-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Milestone Trophy Room
              </div>
              <h3 className="text-2xl font-black text-white mt-0.5">
                {unlockedCount} of {achievements.length} Badges Unlocked
              </h3>
              <p className="text-xs text-amber-200 mt-1">
                Reach landmark ages, career heights, and massive fortunes to unlock all achievements.
              </p>
            </div>
            <Trophy className="w-12 h-12 text-amber-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  ach.unlocked
                    ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                    : 'bg-white border-neutral-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-800 text-lg font-bold">
                      {ach.unlocked ? '🏆' : <Lock className="w-4 h-4 text-neutral-400" />}
                    </div>
                    {ach.unlocked && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Age {ach.unlockedAtAge ?? 0}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-neutral-900 text-sm">{ach.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1">{ach.description}</p>
                </div>

                <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Category: {ach.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

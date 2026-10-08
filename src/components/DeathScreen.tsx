import React from 'react';
import { Character, PersonRelation } from '../types/game';
import { Trophy, Heart, Award, DollarSign, Users, Home, Sparkles, RefreshCw, BookmarkCheck, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

interface DeathScreenProps {
  character: Character;
  onStartNewLife: () => void;
  onContinueAsChild: (child: PersonRelation) => void;
  netWorth: number;
}

export const DeathScreen: React.FC<DeathScreenProps> = ({
  character,
  onStartNewLife,
  onContinueAsChild,
  netWorth,
}) => {
  const { age, firstName, lastName, country, lifeLog, achievements, relationships, stats, degrees, currentJob, startup } = character;

  // Calculate life score
  const livingChildren = relationships.filter((r) => r.type === 'Child');
  const unlockedAchCount = achievements.filter((a) => a.unlocked).length;
  
  const score = Math.round(
    age * 100 +
    Math.min(10000, netWorth / 1000) +
    stats.karma * 50 +
    unlockedAchCount * 300 +
    livingChildren.length * 500 +
    degrees.length * 400
  );

  const getRank = () => {
    if (age >= 100 && netWorth >= 1000000) return { grade: 'S+', title: 'Legendary Centenarian Titan', color: 'from-amber-400 to-yellow-500 text-amber-950' };
    if (age >= 100) return { grade: 'S', title: 'Centenary Champion', color: 'from-amber-400 to-yellow-400 text-amber-950' };
    if (score > 18000) return { grade: 'A+', title: 'High-Achieving Luminary', color: 'from-indigo-400 to-purple-500 text-white' };
    if (score > 12000) return { grade: 'A', title: 'Flourishing Success', color: 'from-blue-400 to-indigo-500 text-white' };
    if (score > 7000) return { grade: 'B', title: 'Fulfilled Life Traveler', color: 'from-emerald-400 to-teal-500 text-white' };
    return { grade: 'C', title: 'Humid Wanderer', color: 'from-neutral-400 to-neutral-600 text-white' };
  };

  const rank = getRank();

  React.useEffect(() => {
    if (age >= 100) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      sounds.playFanfare();
    }
  }, [age]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        {/* Tombstone / Memorial Plaque */}
        <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border-2 border-neutral-700/80 rounded-3xl p-6 sm:p-10 text-center shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          
          <div className="text-4xl sm:text-6xl mb-3">
            {age >= 100 ? '👑' : '🕊️'}
          </div>

          <div className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            In Loving Memory of
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
            {firstName} {lastName}
          </h1>

          <div className="text-sm sm:text-base text-neutral-400 flex items-center justify-center gap-2">
            <span>{country.flag} {country.name}</span>
            <span>•</span>
            <span>Age {age} ({character.birthYear} — {character.birthYear + age})</span>
          </div>

          <p className="mt-4 text-neutral-300 italic max-w-lg mx-auto text-sm sm:text-base">
            "{character.causeOfDeath || (age >= 100 ? 'Passed away peacefully of old age after completing a glorious 100-year century on Earth.' : 'Departed peacefully, leaving cherished memories.')}"
          </p>

          {/* Grade Badge */}
          <div className="mt-6 inline-flex items-center gap-3 bg-neutral-800/90 border border-neutral-700 rounded-2xl px-5 py-2.5 shadow-md">
            <div className={`text-2xl sm:text-3xl font-black px-3 py-1 rounded-xl bg-gradient-to-r ${rank.color}`}>
              {rank.grade}
            </div>
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold">Life Legacy Rating</div>
              <div className="text-sm font-bold text-white">{rank.title}</div>
            </div>
          </div>
        </div>

        {/* Vital Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs text-neutral-400 font-medium">Final Net Worth</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              {country.currencySymbol}{Math.floor(netWorth).toLocaleString()}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <div className="text-xs text-neutral-400 font-medium">Children Raised</div>
            <div className="text-base sm:text-lg font-bold text-white">
              {livingChildren.length} Descendants
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-xs text-neutral-400 font-medium">Achievements</div>
            <div className="text-base sm:text-lg font-bold text-amber-300">
              {unlockedAchCount} / {achievements.length}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
            <div className="text-xs text-neutral-400 font-medium">Karma & Deeds</div>
            <div className="text-base sm:text-lg font-bold text-white">
              {stats.karma >= 80 ? 'Saintly 🌟' : stats.karma >= 50 ? 'Honorable ✨' : 'Mischievous 😈'}
            </div>
          </div>
        </div>

        {/* Continuation / Successor Options */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Succession & Next Journey</span>
          </h2>

          {livingChildren.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-300">
                You have living heirs! Choose a child to inherit your estate of {country.currencySymbol}{Math.floor(netWorth).toLocaleString()} and continue Generation {character.generation + 1}:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {livingChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => {
                      sounds.playCash();
                      onContinueAsChild(child);
                    }}
                    className="p-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-indigo-300">
                        {child.name}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Age {child.age} • {child.gender}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                      Play Child
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">
              You left behind no living descendants. Your estate has been bequeathed according to your legacy will.
            </p>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              id="start-new-life-btn"
              onClick={onStartNewLife}
              className="flex-1 py-3 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Brand New Life (Gen 1)</span>
            </button>
          </div>
        </div>

        {/* Life Log Highlights */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <span>Lifetime Journal Highlights</span>
          </h2>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {lifeLog.slice().reverse().map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm py-1.5 border-b border-neutral-800/60 last:border-0">
                <span className="font-bold text-indigo-400 min-w-[55px]">Age {entry.age}:</span>
                <span className="text-neutral-300">{entry.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

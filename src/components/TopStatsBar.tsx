import React from 'react';
import { Character } from '../types/game';
import { AvatarDisplay } from './AvatarDisplay';
import { Heart, Smile, Brain, Sparkles, Zap, Scale, DollarSign, Calendar, Volume2, VolumeX, FastForward, Play, Pause, RefreshCw, Landmark } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TopStatsBarProps {
  character: Character;
  onAgeUp: () => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onNewGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  netWorth: number;
}

export const TopStatsBar: React.FC<TopStatsBarProps> = ({
  character,
  onAgeUp,
  isAutoPlaying,
  onToggleAutoPlay,
  onNewGame,
  soundEnabled,
  onToggleSound,
  netWorth,
}) => {
  const { stats, age, country, money, firstName, lastName, isAlive } = character;

  const formatCurrency = (amount: number) => {
    return `${country.currencySymbol}${Math.floor(amount).toLocaleString()}`;
  };

  const getStatColor = (val: number) => {
    if (val >= 75) return 'bg-emerald-500 text-emerald-700';
    if (val >= 40) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  const wantedStars = Math.max(0, Math.min(6, Math.floor((100 - stats.karma) / 18)));

  const StatItem = ({
    icon: Icon,
    label,
    value,
    id,
    color,
    barColor,
  }: {
    icon: any;
    label: string;
    value: number;
    id: string;
    color: string;
    barColor: string;
  }) => (
    <div id={id} className="flex flex-col gap-1 min-w-[65px] sm:min-w-[85px]">
      <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
        <span className="flex items-center gap-1">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span className="hidden sm:inline font-mono text-[11px] font-bold">{label}</span>
        </span>
        <span className="tabular-nums font-mono font-black text-white text-[11px] sm:text-xs">
          {Math.round(value)}%
        </span>
      </div>
      <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-fuchsia-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Row 1: Profile, Age Bar, Wealth, and Primary Age Up Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          {/* Identity & Avatar */}
          <div className="flex items-center gap-3">
            <AvatarDisplay character={character} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white leading-tight font-sans tracking-wide">
                  {firstName} {lastName}
                </span>
                <span className="text-base" title={country.name}>
                  {country.flag}
                </span>

                {/* Wanted Stars */}
                <div className="hidden xs:flex items-center gap-0.5 ml-1">
                  {[1, 2, 3, 4, 5, 6].map((starIdx) => (
                    <span
                      key={starIdx}
                      className={`text-xs ${
                        starIdx <= wantedStars
                          ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse'
                          : 'text-neutral-800'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 font-mono">
                <span className="font-bold bg-fuchsia-950/80 border border-fuchsia-500/40 px-2 py-0.5 rounded-md text-fuchsia-300">
                  AGE {age} / 100
                </span>
                <span>•</span>
                <span className="text-cyan-300">YEAR {character.birthYear + age}</span>
                <span>•</span>
                <span className="truncate max-w-[120px] sm:max-w-none text-neutral-300 font-sans">
                  {character.currentEnrollment
                    ? `🎓 ${character.currentEnrollment.degree.name}`
                    : character.currentJob
                    ? `💼 ${character.currentJob.job.title}`
                    : character.isRetired
                    ? '🏖️ Retired'
                    : age < 6
                    ? '👶 Infant'
                    : age < 18
                    ? '🎒 Student'
                    : '🌴 Vice City Freelancer'}
                </span>
              </div>
            </div>
          </div>

          {/* GTA Cash & Net Worth Display */}
          <div className="flex items-center gap-3 sm:gap-5 bg-neutral-900/90 border border-fuchsia-500/30 rounded-2xl px-3.5 py-1.5 shadow-lg">
            <div>
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>CASH</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] tabular-nums">
                {country.currencySymbol}
                {Math.floor(money).toLocaleString()}
              </div>
            </div>
            <div className="w-px h-7 bg-neutral-800" />
            <div>
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Landmark className="w-3 h-3 text-cyan-400" />
                <span>NET WORTH</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-cyan-300 tabular-nums">
                {country.currencySymbol}
                {Math.floor(netWorth).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Controls: Age Up Button & Utilities */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              id="sound-toggle-btn"
              onClick={onToggleSound}
              className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-fuchsia-400" /> : <VolumeX className="w-4 h-4 text-neutral-600" />}
            </button>

            {isAlive && (
              <button
                id="auto-play-toggle-btn"
                onClick={onToggleAutoPlay}
                className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                  isAutoPlaying
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                    : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                }`}
                title="Auto Age Progression"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline">{isAutoPlaying ? 'PAUSE' : 'AUTO'}</span>
              </button>
            )}

            {isAlive ? (
              <button
                id="age-up-primary-btn"
                onClick={() => {
                  sounds.playAgeUp();
                  onAgeUp();
                }}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black px-4 sm:px-6 py-2 rounded-xl shadow-lg shadow-fuchsia-600/30 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base border border-fuchsia-400/50 uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                <span>🕹️ AGE +1 YEAR</span>
                <span className="text-[10px] opacity-90 font-mono font-bold hidden md:inline bg-black/40 rounded px-1.5 py-0.5 border border-white/20">
                  SPACE
                </span>
              </button>
            ) : (
              <button
                id="new-life-btn"
                onClick={onNewGame}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all text-sm border border-neutral-700"
              >
                <RefreshCw className="w-4 h-4 text-fuchsia-400" />
                <span>NEW LIFE</span>
              </button>
            )}
          </div>
        </div>

        {/* 100-Year Life Progress Bar with Vice City Neon Gradient */}
        <div className="w-full bg-neutral-900 rounded-full h-1.5 mb-2.5 overflow-hidden flex border border-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 transition-all duration-700 shadow-[0_0_8px_rgba(217,70,239,0.8)]"
            style={{ width: `${Math.min(100, Math.max(0, age))}%` }}
          />
        </div>

        {/* Row 2: Vitals Status Bars in Vice City Neon Palette */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 pt-1 border-t border-neutral-900">
          <StatItem id="stat-health" icon={Heart} label="Health" value={stats.health} color="text-rose-500" barColor="bg-rose-500" />
          <StatItem id="stat-happiness" icon={Smile} label="Happy" value={stats.happiness} color="text-amber-400" barColor="bg-amber-400" />
          <StatItem id="stat-smarts" icon={Brain} label="Smarts" value={stats.smarts} color="text-cyan-400" barColor="bg-cyan-400" />
          <StatItem id="stat-looks" icon={Sparkles} label="Looks" value={stats.looks} color="text-fuchsia-400" barColor="bg-fuchsia-500" />
          <StatItem id="stat-energy" icon={Zap} label="Energy" value={stats.energy} color="text-yellow-400" barColor="bg-yellow-400" />
          <StatItem id="stat-karma" icon={Scale} label="Karma" value={stats.karma} color="text-emerald-400" barColor="bg-emerald-400" />
        </div>
      </div>
    </header>
  );
};

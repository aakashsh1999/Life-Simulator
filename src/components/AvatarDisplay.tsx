import React from 'react';
import { Character } from '../types/game';
import { Sparkles, Heart, Crown, GraduationCap, Briefcase, Stethoscope, Trophy } from 'lucide-react';

interface AvatarDisplayProps {
  character: Character;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ character, size = 'md', showBadge = true }) => {
  const { age, gender, stats, currentEnrollment, currentJob, isAlive } = character;

  // Derive age stage
  const getStageEmoji = () => {
    if (!isAlive) return '🪦';
    if (age === 0) return '👶';
    if (age <= 3) return '🍼';
    if (age <= 6) return gender === 'female' ? '👧' : '👦';
    if (age <= 12) return gender === 'female' ? '🧒' : '👦';
    if (age <= 17) return gender === 'female' ? '👱‍♀️' : '🧑';
    if (age <= 35) {
      if (stats.looks >= 85) return gender === 'female' ? '💃' : '🕺';
      return gender === 'female' ? '👩' : '👨';
    }
    if (age <= 55) {
      if (currentJob?.job.category === 'Executive') return gender === 'female' ? '👩‍💼' : '👨‍💼';
      return gender === 'female' ? '👩' : '👨';
    }
    if (age <= 79) return gender === 'female' ? '👵' : '👴';
    if (age >= 100) return '👑';
    return '🧓';
  };

  // Expression indicator
  const getMoodBorder = () => {
    if (!isAlive) return 'border-neutral-500 bg-neutral-800';
    if (stats.health < 25) return 'border-rose-500 bg-rose-50 ring-4 ring-rose-300 animate-pulse';
    if (stats.happiness >= 80) return 'border-amber-400 bg-amber-50 ring-4 ring-amber-200/60 shadow-lg';
    if (stats.happiness <= 30) return 'border-blue-400 bg-blue-50';
    return 'border-emerald-300 bg-emerald-50';
  };

  // Dimensions
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
    xl: 'w-32 h-32 text-6xl',
  }[size];

  // Stage label
  const getStageLabel = () => {
    if (!isAlive) return 'Deceased';
    if (age === 0) return 'Newborn';
    if (age <= 3) return 'Toddler';
    if (age <= 12) return 'Child';
    if (age <= 17) return 'Teenager';
    if (age <= 29) return 'Young Adult';
    if (age <= 59) return 'Adult';
    if (age <= 84) return 'Senior';
    if (age >= 100) return 'Centenarian Legend';
    return 'Super Senior';
  };

  // Derive real photographic portrait URL based on age and gender
  const getPersonaImageUrl = () => {
    if (!isAlive) return null;
    if (age >= 16 && age <= 60) {
      if (gender === 'male') {
        return '/src/assets/images/vice_tommy_portrait_1791447613161.jpg';
      }
      return '/src/assets/images/persona_portrait_1791446380264.jpg';
    }
    if (age < 5) {
      return 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&auto=format&fit=crop&q=80';
    }
    if (age <= 15) {
      return gender === 'female'
        ? 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80';
    }
    if (age > 60) {
      return gender === 'female'
        ? 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80';
    }
    return '/src/assets/images/vice_tommy_portrait_1791447613161.jpg';
  };

  const personaImg = getPersonaImageUrl();

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Centenarian Aura */}
      {age >= 100 && isAlive && (
        <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-80 blur-md animate-pulse" />
      )}

      {/* Main Avatar Bubble */}
      <div
        id={`avatar-${character.id}`}
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden border-2 shadow-xl transition-all duration-300 ${getMoodBorder()} ${sizeClasses}`}
      >
        {personaImg ? (
          <img
            src={personaImg}
            alt={`${character.firstName} ${character.lastName}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="transform transition-transform hover:scale-110 duration-200">
            {getStageEmoji()}
          </span>
        )}

        {/* Dynamic status badge overlay */}
        {showBadge && isAlive && (
          <>
            {currentEnrollment && (
              <div className="absolute top-1 right-1 bg-indigo-600 text-white p-1 rounded-full shadow-md z-10">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
            )}
            {!currentEnrollment && currentJob?.job.category === 'Executive' && (
              <div className="absolute top-1 right-1 bg-amber-500 text-white p-1 rounded-full shadow-md z-10">
                <Crown className="w-3.5 h-3.5" />
              </div>
            )}
            {!currentEnrollment && currentJob?.job.category === 'Healthcare' && (
              <div className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full shadow-md z-10">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
            )}
            {age >= 100 && (
              <div className="absolute top-1 right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white p-1.5 rounded-full shadow-lg border border-white z-10">
                <Trophy className="w-4 h-4 text-amber-950" />
              </div>
            )}
          </>
        )}

        {/* Small age level badge overlay at bottom */}
        {isAlive && (
          <div className="absolute bottom-0 inset-x-0 bg-neutral-950/85 backdrop-blur-xs py-0.5 text-center text-[10px] font-black text-amber-300 border-t border-neutral-700/60 z-10">
            LVL {age}
          </div>
        )}
      </div>

      {/* Stage chip if medium or larger */}
      {(size === 'lg' || size === 'xl') && (
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-neutral-200 border border-neutral-700 shadow-md flex items-center gap-1.5">
          {age >= 100 ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          <span>{getStageLabel()}</span>
        </div>
      )}
    </div>
  );
};

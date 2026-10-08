import React, { useState } from 'react';
import { Character, LifeLogEntry } from '../../types/game';
import { AvatarDisplay } from '../AvatarDisplay';
import { ThreeLifeScene } from '../three/ThreeLifeScene';
import { ThreePersonaWorld } from '../three/ThreePersonaWorld';
import {
  GraduationCap,
  Briefcase,
  Home,
  Car,
  Heart,
  Users,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Smile,
  Dumbbell,
  BookOpen,
  Calendar,
  DollarSign,
  Coffee,
  Box,
  UserCheck,
  Footprints,
  Compass
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface DashboardTabProps {
  character: Character;
  onQuickAction: (action: string) => void;
  onPersonaAction?: (actionType: string, payload?: any) => void;
  onNavigateTab: (tab: string) => void;
  netWorth: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  character,
  onQuickAction,
  onPersonaAction,
  onNavigateTab,
  netWorth,
}) => {
  const [viewMode, setViewMode] = useState<'persona' | 'stage' | 'classic'>('persona');
  const {
    age,
    firstName,
    lastName,
    country,
    stats,
    currentEnrollment,
    currentJob,
    properties,
    vehicles,
    relationships,
    partnerId,
    isMarried,
    diseases,
    diet,
    gymMembership,
    lifeLog,
    startup,
  } = character;

  const partner = relationships.find((r) => r.id === partnerId);
  const children = relationships.filter((r) => r.type === 'Child');
  const livingParents = relationships.filter((r) => (r.type === 'Father' || r.type === 'Mother') && r.isAlive);
  const primaryHome = properties.find((p) => !p.isRentedOut) || properties[0];
  const primaryVehicle = vehicles[0];

  const recentLogs = lifeLog.slice(-4).reverse();

  return (
    <div className="space-y-6">
      {/* View Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-300 uppercase tracking-wider font-mono">
            3D VICE CITY LIVING ENVIRONMENT
          </span>
        </div>

        <div className="flex items-center bg-neutral-950/90 border border-fuchsia-500/30 p-1 rounded-2xl shadow-xl gap-1">
          <button
            onClick={() => {
              setViewMode('persona');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'persona'
                ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] border border-pink-400/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-cyan-300" />
            <span>3D Living Persona</span>
          </button>

          <button
            onClick={() => {
              setViewMode('stage');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'stage'
                ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] border border-pink-400/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>3D Stage Diorama</span>
          </button>

          <button
            onClick={() => {
              setViewMode('classic');
              sounds.playClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'classic'
                ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.6)] border border-pink-400/50'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Classic Bio</span>
          </button>
        </div>
      </div>

      {/* 3D Real Persona World (Walk, Run, Eat, Go to Education & Job) */}
      {viewMode === 'persona' && (
        <ThreePersonaWorld
          character={character}
          onPersonaAction={onPersonaAction}
        />
      )}

      {/* 3D Life Stage Diorama & Character Canvas */}
      {viewMode === 'stage' && (
        <ThreeLifeScene character={character} />
      )}

      {/* Primary Life Status Card (GTA Vice City Neon Hero Card) */}
      <div className="bg-gradient-to-r from-neutral-950 via-purple-950/90 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-fuchsia-500/40">
        {/* Decorative neon ambient gradients */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 rounded-full bg-fuchsia-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-56 h-56 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarDisplay character={character} size="xl" />

          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50 shadow-sm flex items-center gap-1">
                <span>🌴</span>
                <span>OCEAN BEACH • VICE CITY</span>
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                GEN {character.generation}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>100-YEAR EMPIRE</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans flex items-center justify-center sm:justify-start gap-2">
              <span>{firstName} {lastName}</span>
              <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded-md border border-pink-500/30">
                PROTAGONIST
              </span>
            </h1>

            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed">
              {age < 18
                ? `Growing up on the vibrant avenues of ${country.name}, prepping for the Vice City empire.`
                : firstName === 'Tommy'
                ? `Operating out of the Ocean View Hotel safehouse on Ocean Drive. Expanding influence across Sunshine Autos, Malibu Club, and Starfish Island!`
                : `Living the ultimate 100-year life simulation, making destiny choices in career, real estate, and lifestyle.`}
            </p>

            {/* Quick stats badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-neutral-300 font-mono">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-neutral-200">
                  {partner ? `${isMarried ? 'Married to' : 'Dating'} ${partner.name}` : 'Single Kingpin'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-400" />
                <span className="text-neutral-200">
                  {primaryVehicle ? primaryVehicle.name : 'Vice City Cheetah'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-400" />
                <span className="text-neutral-200">{primaryHome ? primaryHome.name : 'Ocean View Hotel Suite'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diseases / Health Alerts Banner (if any) */}
      {diseases.length > 0 && (
        <div className="bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-900 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-200">
                Medical Condition: {diseases.join(', ')}
              </div>
              <div className="text-xs text-rose-300">
                Visit Vice City Medical Center to receive treatment.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('health')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-colors"
          >
            Visit Doctor
          </button>
        </div>
      )}

      {/* Quick Action Hub (Vice City Retro Gaming Console) */}
      <div className="bg-neutral-950 border border-fuchsia-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span>Annual Quick Actions</span>
          </h2>
          <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-900 px-2.5 py-1 rounded-xl border border-neutral-800">
            ⚡ Energy: {stats.energy}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick study / work hard */}
          {currentEnrollment ? (
            <button
              onClick={() => onQuickAction('study_hard')}
              className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-indigo-500 text-left transition-all group"
            >
              <GraduationCap className="w-5 h-5 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Study Hard</div>
              <div className="text-[11px] text-neutral-400">+Smarts, +Grades</div>
            </button>
          ) : currentJob ? (
            <button
              onClick={() => onQuickAction('work_hard')}
              className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-cyan-500 text-left transition-all group"
            >
              <Briefcase className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Showroom Overtime</div>
              <div className="text-[11px] text-neutral-400">+Performance, +Bonus</div>
            </button>
          ) : age >= 16 ? (
            <button
              onClick={() => onNavigateTab('career')}
              className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-emerald-500 text-left transition-all group"
            >
              <TrendingUp className="w-5 h-5 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Career Board</div>
              <div className="text-[11px] text-neutral-400">Apply for positions</div>
            </button>
          ) : (
            <button
              onClick={() => onQuickAction('study_hard')}
              className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-indigo-500 text-left transition-all group"
            >
              <BookOpen className="w-5 h-5 text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Read Books</div>
              <div className="text-[11px] text-neutral-400">+Smarts</div>
            </button>
          )}

          {/* Gym / Workout */}
          <button
            onClick={() => onQuickAction('gym_workout')}
            className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-rose-500 text-left transition-all group"
          >
            <Dumbbell className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Ocean Gym Workout</div>
            <div className="text-[11px] text-neutral-400">+Health, +Looks</div>
          </button>

          {/* Socialize / Spend time with family */}
          <button
            onClick={() => onQuickAction('spend_time_family')}
            className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-amber-500 text-left transition-all group"
          >
            <Smile className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Malibu Social Club</div>
            <div className="text-[11px] text-neutral-400">+Happiness, +Affinity</div>
          </button>

          {/* Meditate / Relax */}
          <button
            onClick={() => onQuickAction('relax_meditate')}
            className="p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/90 hover:border-fuchsia-500 text-left transition-all group"
          >
            <Coffee className="w-5 h-5 text-fuchsia-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Vercetti Estate Rest</div>
            <div className="text-[11px] text-neutral-400">+Happiness, -Stress</div>
          </button>
        </div>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Career / School Card */}
        <div className="bg-neutral-950 border border-neutral-800 hover:border-cyan-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                OCCUPATION
              </span>
              <button
                onClick={() => onNavigateTab('career')}
                className="text-cyan-400 hover:underline capitalize font-semibold"
              >
                View &rarr;
              </button>
            </div>

            {currentEnrollment ? (
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white">
                  {currentEnrollment.degree.name}
                </div>
                <div className="text-xs text-neutral-400">
                  Year {currentEnrollment.currentYear} of {currentEnrollment.totalYears}
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-neutral-800">
                  <div
                    className="bg-indigo-500 h-full"
                    style={{
                      width: `${(currentEnrollment.currentYear / currentEnrollment.totalYears) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : currentJob ? (
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white">
                  {currentJob.job.title}
                </div>
                <div className="text-xs font-semibold text-emerald-400 font-mono">
                  Salary: {country.currencySymbol}{currentJob.currentSalary.toLocaleString()}/yr
                </div>
                <div className="text-xs text-neutral-400">
                  Experience: {currentJob.yearsInRole} yrs • Performance: {currentJob.performance}%
                </div>
              </div>
            ) : startup ? (
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white">
                  Founder @ {startup.name}
                </div>
                <div className="text-xs text-cyan-400 font-semibold font-mono">
                  Valuation: {country.currencySymbol}{startup.valuation.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-400">
                  {startup.employees} associates • Profit: {country.currencySymbol}{startup.annualProfit.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 py-3 font-mono">
                {age < 6 ? 'Early childhood' : age < 18 ? 'Enrolled in primary/secondary school' : 'Vice City Freelancer. Browse Career tab.'}
              </div>
            )}
          </div>
        </div>

        {/* Real Estate & Living */}
        <div className="bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-400" />
                RESIDENCE & REAL ESTATE
              </span>
              <button
                onClick={() => onNavigateTab('assets')}
                className="text-amber-400 hover:underline capitalize font-semibold"
              >
                Market &rarr;
              </button>
            </div>

            {primaryHome ? (
              <div className="space-y-2">
                <div className="relative w-full h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 group">
                  {primaryHome.image?.startsWith('http') || primaryHome.image?.startsWith('/src/') ? (
                    <img
                      src={primaryHome.image}
                      alt={primaryHome.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-neutral-900">
                      {primaryHome.image}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-black/20 to-transparent" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-neutral-950/90 text-[10px] font-bold text-amber-300 border border-amber-400/40 font-mono">
                    {primaryHome.type}
                  </span>
                  <span className="absolute bottom-1.5 left-2 right-2 text-xs font-bold text-white truncate">
                    {primaryHome.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Market Value:</span>
                  <strong className="text-white font-bold">{country.currencySymbol}{primaryHome.purchasePrice.toLocaleString()}</strong>
                </div>
                <div className="text-xs text-emerald-400 font-semibold font-mono">
                  {properties.length} Properties Owned • {vehicles.length} Vehicles
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 py-3 font-mono">
                {age < 18 ? 'Living at safehouse with family' : 'Renting modest quarters. Acquire Vice City estates in Assets tab.'}
              </div>
            )}
          </div>
        </div>

        {/* Relationships & Love */}
        <div className="bg-neutral-950 border border-neutral-800 hover:border-pink-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider mb-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400" />
                RELATIONSHIPS & CREW
              </span>
              <button
                onClick={() => onNavigateTab('relationships')}
                className="text-pink-400 hover:underline capitalize font-semibold"
              >
                Crew &rarr;
              </button>
            </div>

            {partner ? (
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white">
                  {isMarried ? '💍 Married:' : '❤️ Partner:'} {partner.name}
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  Harmony: {partner.affinity}%
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden border border-neutral-800">
                  <div
                    className="bg-pink-500 h-full shadow-[0_0_6px_rgba(236,72,153,0.8)]"
                    style={{ width: `${partner.affinity}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 py-3 font-mono">
                {age < 14 ? `Family circle: ${livingParents.length} parents` : 'Single. Browse the matchmaker in Relationships tab.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Diary / Timeline Feed (Vice City Game Chronicle) */}
      <div className="bg-neutral-950 border border-fuchsia-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-fuchsia-400" />
            <span>Vice City Chronicles & Life Events</span>
          </h2>
          <button
            onClick={() => onNavigateTab('lifelog')}
            className="text-xs font-mono font-bold text-fuchsia-400 hover:underline"
          >
            Full 100-Year Life Log ({lifeLog.length}) &rarr;
          </button>
        </div>

        <div className="space-y-2.5">
          {recentLogs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs sm:text-sm hover:border-fuchsia-500/40 transition-colors"
            >
              <span className="font-mono font-bold text-fuchsia-300 bg-fuchsia-950/80 border border-fuchsia-500/30 px-2 py-0.5 rounded-lg shrink-0">
                AGE {log.age}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-white">{log.title}: </span>
                <span className="text-neutral-300">{log.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

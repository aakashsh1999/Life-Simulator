import React from 'react';
import { Character } from '../../types/game';
import {
  Heart,
  Dumbbell,
  Stethoscope,
  Plane,
  Sparkles,
  Smile,
  ShieldAlert,
  Dices,
  Eye,
  Activity,
  Music,
  Award,
  Zap
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface HealthLifestyleTabProps {
  character: Character;
  onSelectDiet: (diet: Character['diet']) => void;
  onToggleGym: () => void;
  onDoctorAction: (action: string) => void;
  onGoVacation: (vacationType: string, cost: number) => void;
  onHobbyAction: (hobby: string) => void;
  onCrimeAction: (crimeType: string) => void;
  onOpenCasino: () => void;
}

export const HealthLifestyleTab: React.FC<HealthLifestyleTabProps> = ({
  character,
  onSelectDiet,
  onToggleGym,
  onDoctorAction,
  onGoVacation,
  onHobbyAction,
  onCrimeAction,
  onOpenCasino,
}) => {
  const { stats, diseases, diet, gymMembership, country, money, age } = character;
  const currency = country.currencySymbol;

  const diets: Character['diet'][] = [
    'Standard',
    'Mediterranean',
    'Vegetarian',
    'Organic High-Protein',
    'Junk Food',
  ];

  return (
    <div className="space-y-8">
      {/* 1. HEALTH & MEDICAL CLINIC */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-rose-500" />
          <span>Medical Center & Wellness</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-2">🩺</div>
              <h4 className="font-bold text-neutral-900 text-sm">General Doctor Consultation</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-3">
                Comprehensive health screening and vitals assessment.
              </p>
            </div>
            <button
              onClick={() => onDoctorAction('checkup')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
            >
              Consult Doctor ({currency}200)
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-2">💊</div>
              <h4 className="font-bold text-neutral-900 text-sm">Treat Active Illnesses</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-3">
                {diseases.length > 0
                  ? `Active: ${diseases.join(', ')}`
                  : 'You have no major chronic illnesses diagnosed.'}
              </p>
            </div>
            <button
              disabled={diseases.length === 0}
              onClick={() => onDoctorAction('treat_illness')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white transition-colors"
            >
              Treat Illness ({currency}600)
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-2">✨</div>
              <h4 className="font-bold text-neutral-900 text-sm">Aesthetic Plastic Surgery</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-3">
                Premium cosmetic enhancements to dramatically boost looks.
              </p>
            </div>
            <button
              disabled={age < 18}
              onClick={() => onDoctorAction('plastic_surgery')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-pink-50 hover:bg-pink-100 text-pink-700 transition-colors"
            >
              Cosmetic Surgery ({currency}8,000)
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-2">🧠</div>
              <h4 className="font-bold text-neutral-900 text-sm">Therapy & Mindfulness</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-3">
                Speak with a licensed therapist to soothe anxiety and restore happiness.
              </p>
            </div>
            <button
              onClick={() => onDoctorAction('therapy')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
            >
              Therapy Session ({currency}150)
            </button>
          </div>
        </div>
      </div>

      {/* 2. FITNESS & DIET REGIMEN */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-indigo-600" />
              <span>Nutrition & Fitness Regimen</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Your daily nutrition and training directly dictate your health and 100-year longevity.
            </p>
          </div>

          <button
            onClick={onToggleGym}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
              gymMembership
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
            }`}
          >
            {gymMembership ? '✓ Active Gym Member ($40/mo)' : '+ Join Fitness Center ($40/mo)'}
          </button>
        </div>

        {/* Diet options */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Selected Diet Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {diets.map((d) => (
              <button
                key={d}
                onClick={() => {
                  sounds.playClick();
                  onSelectDiet(d);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  diet === d
                    ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-bold text-xs text-neutral-900">{d}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {d === 'Mediterranean' && '+10% Longevity'}
                  {d === 'Organic High-Protein' && '+Health, +Looks'}
                  {d === 'Vegetarian' && '+Clean Energy'}
                  {d === 'Junk Food' && '-Health, +Fast'}
                  {d === 'Standard' && 'Balanced'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. VACATIONS & WORLD TRAVEL */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Plane className="w-4 h-4 text-indigo-600" />
          <span>Vacations & World Travel</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: '🌲 Camping & Backpacking',
              cost: 500,
              desc: 'Trek through pine forests and sit by campfire under the stars.',
              id: 'camping',
            },
            {
              title: '🗼 Tokyo Cyber Expedition',
              cost: 3500,
              desc: 'Neon street food, bullet trains, and anime tech arcades.',
              id: 'tokyo',
            },
            {
              title: '🍷 Paris Romance Getaway',
              cost: 4800,
              desc: 'Eiffel Tower sunsets, French bakeries, and art galleries.',
              id: 'paris',
            },
            {
              title: '🚢 100-Day World Luxury Cruise',
              cost: 28000,
              desc: 'Circumnavigate all 7 continents in five-star ultra luxury.',
              id: 'world_cruise',
            },
          ].map((trip) => (
            <div
              key={trip.id}
              className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-neutral-900 text-sm mb-1">{trip.title}</h4>
                <div className="text-sm font-black text-indigo-600 mb-2">
                  {currency}{trip.cost.toLocaleString()}
                </div>
                <p className="text-xs text-neutral-600 mb-4">{trip.desc}</p>
              </div>

              <button
                disabled={money < trip.cost}
                onClick={() => onGoVacation(trip.id, trip.cost)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-xs transition-all"
              >
                Book Vacation
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CASINO & ENTERTAINMENT */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Casino & Entertainment
          </span>
          <h3 className="text-2xl font-black text-white mt-1">Monte Carlo Casino & Lottery</h3>
          <p className="text-xs text-amber-200 mt-1 max-w-md">
            Test your luck with scratch-off lottery tickets or high-stakes Blackjack games.
          </p>
        </div>

        <button
          id="open-casino-btn"
          onClick={onOpenCasino}
          className="py-3 px-6 rounded-xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 shadow-lg hover:from-amber-300 hover:to-yellow-300 transition-transform active:scale-95 text-sm shrink-0"
        >
          Enter Casino & Lottery &rarr;
        </button>
      </div>

      {/* 5. HOBBIES & VOLUNTEERING */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Hobbies & Personal Growth</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onHobbyAction('guitar')}
            className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-indigo-400 text-left shadow-xs transition-all"
          >
            <div className="text-2xl mb-1">🎸</div>
            <div className="text-xs font-bold text-neutral-900">Guitar & Music</div>
            <div className="text-[11px] text-neutral-500">+Smarts, +Happiness</div>
          </button>

          <button
            onClick={() => onHobbyAction('martial_arts')}
            className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-indigo-400 text-left shadow-xs transition-all"
          >
            <div className="text-2xl mb-1">🥋</div>
            <div className="text-xs font-bold text-neutral-900">Martial Arts (Black Belt)</div>
            <div className="text-[11px] text-neutral-500">+Health, +Confidence</div>
          </button>

          <button
            onClick={() => onHobbyAction('volunteer')}
            className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-indigo-400 text-left shadow-xs transition-all"
          >
            <div className="text-2xl mb-1">🤝</div>
            <div className="text-xs font-bold text-neutral-900">Charity Volunteering</div>
            <div className="text-[11px] text-neutral-500">+Karma, +Happiness</div>
          </button>

          <button
            onClick={() => onHobbyAction('pilot')}
            className="p-4 rounded-2xl bg-white border border-neutral-200 hover:border-indigo-400 text-left shadow-xs transition-all"
          >
            <div className="text-2xl mb-1">✈️</div>
            <div className="text-xs font-bold text-neutral-900">Pilot Flight School</div>
            <div className="text-[11px] text-neutral-500">+Smarts, +Fame ({currency}3k)</div>
          </button>
        </div>
      </div>

      {/* 6. CRIME & MISCHIEF */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Underworld & Mischief</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              High-risk illegal activities. Getting caught results in heavy police fines or jail time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onCrimeAction('pickpocket')}
            className="p-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left transition-all"
          >
            <div className="font-bold text-xs text-white">👛 Pickpocket Subway Rider</div>
            <div className="text-[11px] text-neutral-400">Low risk • +{currency}200</div>
          </button>

          <button
            onClick={() => onCrimeAction('shoplift')}
            className="p-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-left transition-all"
          >
            <div className="font-bold text-xs text-white">💎 Shoplift Designer Watch</div>
            <div className="text-[11px] text-neutral-400">Medium risk • +{currency}2,500</div>
          </button>

          <button
            onClick={() => onCrimeAction('bank_heist')}
            className="p-3.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-left transition-all"
          >
            <div className="font-bold text-xs text-rose-300">🏦 High-Stakes Bank Heist</div>
            <div className="text-[11px] text-rose-400">Extreme risk • +{currency}100,000</div>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Gender, CountryInfo, LifeMission } from '../types/game';
import { COUNTRIES, FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, LAST_NAMES } from '../data/gameData';
import { LIFE_MISSIONS } from '../data/missionsData';
import { Dices, Sparkles, User, Globe, ArrowRight, Target, Shield, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface NewGameModalProps {
  isOpen: boolean;
  onStartGame: (config: {
    firstName: string;
    lastName: string;
    gender: Gender;
    country: CountryInfo;
    mission: LifeMission;
  }) => void;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({ isOpen, onStartGame }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(COUNTRIES[0]);
  const [selectedMission, setSelectedMission] = useState<LifeMission>(LIFE_MISSIONS[0]);

  // Randomize helper
  const handleRandomize = () => {
    sounds.playClick();
    const isMale = Math.random() > 0.5;
    const g: Gender = isMale ? 'male' : 'female';
    const firstList = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
    const randomFirst = firstList[Math.floor(Math.random() * firstList.length)];
    const randomLast = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const randomC = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const randomM = LIFE_MISSIONS[Math.floor(Math.random() * LIFE_MISSIONS.length)];

    setGender(g);
    setFirstName(randomFirst);
    setLastName(randomLast);
    setSelectedCountry(randomC);
    setSelectedMission(randomM);
  };

  const handleSelectTommyVercetti = () => {
    sounds.playMissionPassed();
    setGender('male');
    setFirstName('Tommy');
    setLastName('Vercetti');
    setSelectedCountry(COUNTRIES[0]);
    const tycoonMission = LIFE_MISSIONS.find((m) => m.id === 'mission_tycoon') || LIFE_MISSIONS[0];
    setSelectedMission(tycoonMission);
  };

  React.useEffect(() => {
    if (isOpen && !firstName) {
      handleSelectTommyVercetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playFanfare();
    onStartGame({
      firstName: firstName.trim() || 'Tommy',
      lastName: lastName.trim() || 'Vercetti',
      gender,
      country: selectedCountry,
      mission: JSON.parse(JSON.stringify(selectedMission)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        id="new-character-modal"
        className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-2xl w-full overflow-hidden my-6 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-fuchsia-950 to-neutral-950 text-white p-6 relative shrink-0 border-b border-fuchsia-500/30">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-fuchsia-300 flex items-center gap-1.5">
              <span>🌴</span>
              <span>GTA VICE CITY: 100-YEAR LIFE SIMULATOR</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectTommyVercetti}
                className="inline-flex items-center gap-1 text-xs font-black bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 text-white px-3 py-1.5 rounded-lg border border-pink-400/50 transition-all shadow-xs"
              >
                <span>🌴 Tommy Vercetti</span>
              </button>
              <button
                type="button"
                id="randomize-character-btn"
                onClick={handleRandomize}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-colors shadow-xs"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Roll Destiny</span>
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>A Vice City Legend is Born</span>
            <span className="text-sm font-bold bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full font-mono">
              YEAR 2026
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-fuchsia-200 mt-1">
            Choose your persona's identity, birth nation, and 100-Year Life Calling Quest in Vice City.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Life Mission / Destiny Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-950 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select 100-Year Life Mission Quest</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                6 Milestones (Age 0 ➔ 100)
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1 bg-neutral-50 rounded-2xl border border-neutral-200">
              {LIFE_MISSIONS.map((m) => {
                const isSelected = selectedMission.id === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      setSelectedMission(m);
                      sounds.playClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-xs font-bold text-neutral-900 leading-tight">
                          {m.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                        {m.subtitle}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 truncate">
                      🎁 {m.destinyPerk}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Biological Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', label: 'Male 👦' },
                { id: 'female', label: 'Female 👧' },
                { id: 'non-binary', label: 'Non-Binary 🧑' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setGender(item.id as Gender);
                    sounds.playClick();
                  }}
                  className={`py-2 px-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all ${
                    gender === item.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                First Name
              </label>
              <input
                id="char-first-name-input"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Liam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Last Name
              </label>
              <input
                id="char-last-name-input"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sterling"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-neutral-900"
              />
            </div>
          </div>

          {/* Country of Birth */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center justify-between">
              <span>Country of Birth</span>
              <span className="text-neutral-400 font-normal normal-case">
                Currency: {selectedCountry.currency} ({selectedCountry.currencySymbol})
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
              {COUNTRIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setSelectedCountry(c);
                    sounds.playClick();
                  }}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center justify-center text-center ${
                    selectedCountry.id === c.id
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-xs font-bold text-neutral-800 mt-1 truncate w-full">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Perk pill */}
            <div className="mt-2 text-xs bg-amber-50 text-amber-900 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><strong>National Perk:</strong> {selectedCountry.perk}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="start-life-submit-btn"
            className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 text-base"
          >
            <span>Begin 100-Year Life Quest (Born 2026) 👶🚀</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};


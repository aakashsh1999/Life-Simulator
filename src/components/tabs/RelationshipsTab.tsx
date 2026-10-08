import React, { useState } from 'react';
import { Character, PersonRelation, Gender } from '../../types/game';
import { Heart, Users, Sparkles, Smile, MessageCircle, Gift, DollarSign, Gem, UserPlus, Baby, Shield, Trash2 } from 'lucide-react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface RelationshipsTabProps {
  character: Character;
  onInteract: (personId: string, action: string) => void;
  onFindDate: () => void;
  onSelectDate: (partner: PersonRelation) => void;
  onPropose: () => void;
  onHaveBaby: () => void;
  onAdoptPet: (species: string, name: string) => void;
  datingCandidates: PersonRelation[];
}

export const RelationshipsTab: React.FC<RelationshipsTabProps> = ({
  character,
  onInteract,
  onFindDate,
  onSelectDate,
  onPropose,
  onHaveBaby,
  onAdoptPet,
  datingCandidates,
}) => {
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Golden Retriever');

  const { relationships, partnerId, isMarried, country, age, money } = character;
  const currency = country.currencySymbol;

  const partner = relationships.find((r) => r.id === partnerId);
  const family = relationships.filter((r) => r.type === 'Father' || r.type === 'Mother' || r.type === 'Sibling');
  const children = relationships.filter((r) => r.type === 'Child');
  const pets = relationships.filter((r) => r.type === 'Pet');

  const handlePetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;
    sounds.playFanfare();
    onAdoptPet(petType, petName.trim());
    setPetName('');
  };

  return (
    <div className="space-y-8">
      {/* 1. ROMANTIC PARTNER / DATING */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Romantic Partnership</span>
        </h3>

        {partner ? (
          <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-3xl">
                  {partner.gender === 'female' ? '👩' : '👨'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40">
                      {isMarried ? '💍 Married Spouse' : '❤️ Romantic Partner'}
                    </span>
                    <span className="text-xs text-neutral-400">Age {partner.age}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{partner.name}</h2>
                  <div className="text-xs text-rose-200 mt-0.5">
                    {partner.occupation || 'Loving companion'}
                  </div>
                </div>
              </div>

              <div className="min-w-[160px] space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Relationship Harmony</span>
                  <span>{partner.affinity}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{ width: `${partner.affinity}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Partner Interaction Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-rose-800/60">
              <button
                onClick={() => onInteract(partner.id, 'date')}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>🌹 Romantic Dinner</span>
              </button>

              <button
                onClick={() => onInteract(partner.id, 'gift')}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎁 Buy Jewelry ({currency}500)</span>
              </button>

              {!isMarried ? (
                <button
                  onClick={onPropose}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                >
                  <span>💍 Propose Marriage</span>
                </button>
              ) : (
                <button
                  disabled={age < 18 || age > 65}
                  onClick={onHaveBaby}
                  className="py-2.5 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Baby className="w-4 h-4" />
                  <span>Have Baby / Child</span>
                </button>
              )}

              <button
                onClick={() => onInteract(partner.id, 'breakup')}
                className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isMarried ? 'File Divorce' : 'Break Up'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-neutral-900 text-base">You are currently Single</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ready for romance? Spin the matchmaker algorithm to discover compatible dates in your area.
                </p>
              </div>
              <button
                disabled={age < 14}
                onClick={onFindDate}
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Prospective Dates</span>
              </button>
            </div>

            {/* Candidates */}
            {datingCandidates.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {datingCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{candidate.gender === 'female' ? '👩' : '👨'}</span>
                        <div>
                          <div className="font-bold text-neutral-900 text-sm">{candidate.name}</div>
                          <div className="text-xs text-neutral-500">Age {candidate.age} • {candidate.occupation}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectDate(candidate)}
                      className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                    >
                      Ask Out on Date ❤️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. FAMILY & RELATIVES */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          <span>Parents & Siblings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {family.map((rel) => (
            <div
              key={rel.id}
              className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {rel.type === 'Father' ? '👨' : rel.type === 'Mother' ? '👩' : '🧑'}
                    </span>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{rel.name}</h4>
                      <span className="text-xs text-neutral-500">{rel.type} • Age {rel.age}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      rel.isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {rel.isAlive ? 'Alive' : 'Deceased'}
                  </span>
                </div>

                {rel.isAlive && (
                  <div className="space-y-1 my-3">
                    <div className="flex justify-between text-xs text-neutral-500 font-medium">
                      <span>Affection</span>
                      <span>{rel.affinity}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full"
                        style={{ width: `${rel.affinity}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {rel.isAlive && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => onInteract(rel.id, 'spend_time')}
                    className="py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Chat / Visit
                  </button>
                  <button
                    onClick={() => onInteract(rel.id, 'gift')}
                    className="py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    Give Gift
                  </button>
                  <button
                    onClick={() => onInteract(rel.id, 'ask_money')}
                    className="py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Ask Money
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. CHILDREN & DESCENDANTS */}
      {children.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Baby className="w-4 h-4 text-amber-600" />
            <span>Children & Next Generation ({children.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{child.gender === 'female' ? '👧' : '👦'}</span>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm">{child.name}</h4>
                        <span className="text-xs text-neutral-500">Child • Age {child.age}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Affinity: {child.affinity}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => onInteract(child.id, 'spend_time')}
                    className="py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Spend Quality Time
                  </button>
                  <button
                    onClick={() => onInteract(child.id, 'give_allowance')}
                    className="py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Give Allowance ({currency}100)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PETS */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <span>🐾 Beloved Pets ({pets.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐶</span>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{pet.name}</h4>
                    <span className="text-xs text-neutral-500">{pet.petSpecies} • Age {pet.age}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Love: {pet.affinity}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => onInteract(pet.id, 'walk_pet')}
                  className="py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  Walk & Play Fetch
                </button>
                <button
                  onClick={() => onInteract(pet.id, 'vet')}
                  className="py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                >
                  Vet Checkup
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Adopt pet form */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs">
          <h4 className="font-bold text-neutral-900 text-sm mb-3">Adopt a Pet from Animal Shelter</h4>
          <form onSubmit={handlePetSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Pet Name (e.g. Buster)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-sm"
            />
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-medium"
            >
              <option value="Golden Retriever">🐶 Golden Retriever</option>
              <option value="Siberian Cat">🐱 Siberian Cat</option>
              <option value="African Grey Parrot">🦜 Talking Parrot</option>
              <option value="French Bulldog">🐕 French Bulldog</option>
            </select>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
            >
              Adopt Pet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Dilemma, DilemmaChoice, Character } from '../types/game';
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight, Heart, Smile, Brain, DollarSign } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DilemmaModalProps {
  dilemma: Dilemma;
  character: Character;
  onResolve: (choice: DilemmaChoice) => void;
}

export const DilemmaModal: React.FC<DilemmaModalProps> = ({ dilemma, character, onResolve }) => {
  const [selectedChoice, setSelectedChoice] = useState<DilemmaChoice | null>(null);
  const [outcomeRevealed, setOutcomeRevealed] = useState(false);

  const handleSelect = (choice: DilemmaChoice) => {
    setSelectedChoice(choice);
    setOutcomeRevealed(true);
    sounds.playClick();
  };

  const handleProceed = () => {
    if (selectedChoice) {
      onResolve(selectedChoice);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Career': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Love': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Finance': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Family': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Health': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Ethics': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-fade-in">
      <div
        id="dilemma-dialog"
        className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white p-5">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(dilemma.category)}`}>
              {dilemma.category} Dilemma
            </span>
            <span className="text-xs font-medium text-neutral-300">Age {character.age}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{dilemma.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          {!outcomeRevealed ? (
            <>
              <p className="text-neutral-700 text-base leading-relaxed mb-6">
                {dilemma.prompt}
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  What will you do?
                </div>
                {dilemma.choices.map((choice, idx) => {
                  const cannotAfford = choice.requiresMoney && character.money < choice.requiresMoney;
                  const tooLowSmarts = choice.requiresSmarts && character.stats.smarts < choice.requiresSmarts;
                  const isBlocked = cannotAfford || tooLowSmarts;

                  return (
                    <button
                      key={idx}
                      id={`dilemma-choice-${idx}`}
                      disabled={isBlocked}
                      onClick={() => handleSelect(choice)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
                        isBlocked
                          ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed text-neutral-400'
                          : 'border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50/50 bg-white text-neutral-800 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-sm sm:text-base text-neutral-900">
                        {choice.text}
                      </div>
                      {isBlocked && (
                        <div className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {cannotAfford && `Requires ${character.country.currencySymbol}${choice.requiresMoney?.toLocaleString()}`}
                          {tooLowSmarts && `Requires ${choice.requiresSmarts}% Smarts`}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-2 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900">Outcome</h3>
                <p className="text-neutral-700 text-sm leading-relaxed max-w-md mx-auto">
                  {selectedChoice?.outcomeText}
                </p>
              </div>

              {/* Stat updates summary */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {selectedChoice?.moneyChange !== undefined && selectedChoice.moneyChange !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedChoice.moneyChange > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {selectedChoice.moneyChange > 0 ? '+' : ''}
                    {character.country.currencySymbol}
                    {Math.abs(selectedChoice.moneyChange).toLocaleString()}
                  </span>
                )}
                {selectedChoice?.statChanges.happiness !== undefined && selectedChoice.statChanges.happiness !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedChoice.statChanges.happiness > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    {selectedChoice.statChanges.happiness > 0 ? '+' : ''}
                    {selectedChoice.statChanges.happiness}% Happiness
                  </span>
                )}
                {selectedChoice?.statChanges.health !== undefined && selectedChoice.statChanges.health !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedChoice.statChanges.health > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    {selectedChoice.statChanges.health > 0 ? '+' : ''}
                    {selectedChoice.statChanges.health}% Health
                  </span>
                )}
                {selectedChoice?.statChanges.smarts !== undefined && selectedChoice.statChanges.smarts !== 0 && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedChoice.statChanges.smarts > 0
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    {selectedChoice.statChanges.smarts > 0 ? '+' : ''}
                    {selectedChoice.statChanges.smarts}% Smarts
                  </span>
                )}
              </div>

              <button
                id="dilemma-continue-btn"
                onClick={handleProceed}
                className="mt-6 w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Continue Living</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

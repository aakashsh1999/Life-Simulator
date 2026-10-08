import React from 'react';
import { Character } from '../types/game';
import { HISTORICAL_ERAS } from '../data/missionsData';
import { Globe, Calendar, Zap, Sparkles, X, ChevronRight, Check } from 'lucide-react';

interface EraChroniclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
}

export const EraChroniclesModal: React.FC<EraChroniclesModalProps> = ({
  isOpen,
  onClose,
  character,
}) => {
  if (!isOpen) return null;

  const currentYear = character.birthYear + character.age;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-950 via-indigo-950 to-neutral-950 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>100-Year Historical Eras & Future Chronicles</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>The Century Timeline</span>
            <span className="text-sm font-bold bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full">
              Current Year: {currentYear}
            </span>
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            As your persona ages from 0 to 100, the world evolves across 5 distinct technological and economic epochs.
          </p>
        </div>

        {/* Eras List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-neutral-50/50">
          {HISTORICAL_ERAS.map((era, index) => {
            const isCurrent = currentYear >= era.startYear && currentYear <= era.endYear;
            const isPassed = currentYear > era.endYear;
            const isFuture = currentYear < era.startYear;

            return (
              <div
                key={era.title}
                className={`p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : isPassed
                    ? 'bg-neutral-100/80 border-neutral-200 opacity-80'
                    : 'bg-white/60 border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-0.5">{era.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-neutral-900">
                          {era.title}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-200 text-neutral-800">
                          Years {era.startYear} - {era.endYear}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded-full animate-pulse">
                            Active Era
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-xs font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-md">
                            Passed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        {era.subtitle}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-indigo-50/80 border border-indigo-100 p-2 rounded-xl">
                          <span className="font-bold text-indigo-900 block">🔬 Tech Frontier:</span>
                          <span className="text-neutral-700">{era.technologyTrend}</span>
                        </div>
                        <div className="bg-amber-50/80 border border-amber-100 p-2 rounded-xl">
                          <span className="font-bold text-amber-900 block">📊 Global Markets:</span>
                          <span className="text-neutral-700">{era.marketFlavor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors"
          >
            Close Chronicles
          </button>
        </div>
      </div>
    </div>
  );
};

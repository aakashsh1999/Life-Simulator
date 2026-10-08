import React, { useState } from 'react';
import { Character } from '../../types/game';
import { Dices, DollarSign, X, Trophy, Sparkles, RefreshCw, Disc } from 'lucide-react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ThreeDiceRoller } from '../three/ThreeDiceRoller';
import { ThreeRouletteWheel } from '../three/ThreeRouletteWheel';

interface CasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateMoney: (amount: number, reason: string) => void;
}

export const CasinoModal: React.FC<CasinoModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateMoney,
}) => {
  const [tab, setTab] = useState<'dice3d' | 'roulette3d' | 'blackjack' | 'lottery'>('dice3d');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [lotteryResult, setLotteryResult] = useState<string | null>(null);

  // Blackjack state
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [blackjackMessage, setBlackjackMessage] = useState<string>('');

  if (!isOpen) return null;

  const currency = character.country.currencySymbol;

  // Lottery draw
  const buyLotteryTicket = () => {
    const cost = 25;
    if (character.money < cost) {
      setLotteryResult('⚠️ Not enough cash to purchase a lottery ticket!');
      return;
    }

    sounds.playClick();
    onUpdateMoney(-cost, 'Bought a State Lottery scratch-off ticket');

    const roll = Math.random();
    if (roll < 0.005) {
      // 0.5% Mega Jackpot $500,000!
      const jackpot = 500000;
      onUpdateMoney(jackpot, '🎉 WON THE MEGA STATE LOTTERY JACKPOT!');
      setLotteryResult(`🎉 MEGA JACKPOT! You won ${currency}${jackpot.toLocaleString()}!`);
      confetti({ particleCount: 150, spread: 90 });
      sounds.playFanfare();
    } else if (roll < 0.05) {
      // 5% Big prize $5,000
      const prize = 5000;
      onUpdateMoney(prize, 'Won 2nd Tier Lottery Prize');
      setLotteryResult(`⭐ 2nd Place Prize! You won ${currency}${prize.toLocaleString()}!`);
      sounds.playCash();
    } else if (roll < 0.25) {
      // 20% small win
      const prize = 50;
      onUpdateMoney(prize, 'Won minor lottery scratcher');
      setLotteryResult(`✨ You won ${currency}${prize}!`);
      sounds.playCash();
    } else {
      setLotteryResult('❌ Better luck next time! Your numbers did not match.');
    }
  };

  // Blackjack handlers
  const drawCard = () => Math.min(10, Math.floor(Math.random() * 11) + 1);

  const calculateHand = (hand: number[]) => {
    let sum = hand.reduce((a, b) => a + b, 0);
    return sum;
  };

  const startBlackjack = () => {
    if (character.money < betAmount) {
      setBlackjackMessage('⚠️ Not enough cash for this bet!');
      return;
    }

    sounds.playClick();
    onUpdateMoney(-betAmount, `Placed ${currency}${betAmount} Blackjack bet`);

    const p = [drawCard(), drawCard()];
    const d = [drawCard()];
    setPlayerHand(p);
    setDealerHand(d);
    setGameActive(true);
    setBlackjackMessage('Hit or Stand?');
  };

  const hit = () => {
    sounds.playClick();
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const score = calculateHand(newHand);
    if (score > 21) {
      setGameActive(false);
      setBlackjackMessage(`Bust! (${score}) Dealer wins.`);
    }
  };

  const stand = () => {
    sounds.playClick();
    let currentDealer = [...dealerHand];
    while (calculateHand(currentDealer) < 17) {
      currentDealer.push(drawCard());
    }
    setDealerHand(currentDealer);
    setGameActive(false);

    const pScore = calculateHand(playerHand);
    const dScore = calculateHand(currentDealer);

    if (dScore > 21 || pScore > dScore) {
      const payout = betAmount * 2;
      onUpdateMoney(payout, `Won Blackjack against dealer (${pScore} vs ${dScore})`);
      setBlackjackMessage(`🎉 You Won! You received ${currency}${payout.toLocaleString()}!`);
      sounds.playCash();
      confetti({ particleCount: 50, spread: 60 });
    } else if (pScore === dScore) {
      onUpdateMoney(betAmount, 'Blackjack push (tie)');
      setBlackjackMessage(`🤝 Push! Tie score (${pScore}). Your bet is returned.`);
    } else {
      setBlackjackMessage(`Dealer wins (${dScore} vs ${pScore}). Better luck next hand!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dices className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Monte Carlo Casino & Lottery
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-4 border-b border-neutral-800 bg-neutral-950 text-[11px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setTab('dice3d')}
            className={`py-3 text-center transition-colors ${
              tab === 'dice3d' ? 'border-b-2 border-amber-400 text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎲 3D Craps
          </button>
          <button
            onClick={() => setTab('roulette3d')}
            className={`py-3 text-center transition-colors ${
              tab === 'roulette3d' ? 'border-b-2 border-amber-400 text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎡 3D Roulette
          </button>
          <button
            onClick={() => setTab('blackjack')}
            className={`py-3 text-center transition-colors ${
              tab === 'blackjack' ? 'border-b-2 border-amber-400 text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-white'
            }`}
          >
            ♠️ 21 Blackjack
          </button>
          <button
            onClick={() => setTab('lottery')}
            className={`py-3 text-center transition-colors ${
              tab === 'lottery' ? 'border-b-2 border-amber-400 text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🎟️ Lottery
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'dice3d' && (
            <ThreeDiceRoller
              money={character.money}
              currencySymbol={currency}
              onUpdateMoney={onUpdateMoney}
            />
          )}

          {tab === 'roulette3d' && (
            <ThreeRouletteWheel
              money={character.money}
              currencySymbol={currency}
              onUpdateMoney={onUpdateMoney}
            />
          )}

          {tab === 'lottery' && (
            <div className="text-center space-y-5">
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-6">
                <div className="text-xs uppercase tracking-widest font-bold text-amber-400 mb-1">
                  National Golden Jackpot
                </div>
                <div className="text-3xl font-black text-amber-300 mb-2">
                  {currency}500,000
                </div>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Buy a scratch-off ticket for {currency}25. Match 3 golden symbols to win the life-changing jackpot!
                </p>

                <button
                  id="buy-lottery-ticket-btn"
                  onClick={buyLotteryTicket}
                  className="mt-5 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 text-base"
                >
                  Buy Ticket ({currency}25)
                </button>
              </div>

              {lotteryResult && (
                <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm font-semibold text-neutral-200 animate-fade-in">
                  {lotteryResult}
                </div>
              )}
            </div>
          )}

          {tab === 'blackjack' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Select Bet Amount:</span>
                <div className="flex items-center gap-1.5">
                  {[50, 100, 500, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      disabled={gameActive}
                      className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                        betAmount === amt
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                          : 'border-neutral-700 hover:border-neutral-600 text-neutral-400'
                      }`}
                    >
                      {currency}{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-emerald-950/80 border-2 border-emerald-800/80 rounded-2xl p-5 text-center space-y-4">
                {/* Dealer */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Dealer Cards ({calculateHand(dealerHand)})
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 min-h-[40px]">
                    {dealerHand.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white text-neutral-900 font-black rounded-lg shadow-md">
                        {c}
                      </span>
                    ))}
                    {dealerHand.length === 0 && <span className="text-xs text-emerald-600">Waiting for deal...</span>}
                  </div>
                </div>

                <div className="h-px bg-emerald-800/60" />

                {/* Player */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Your Cards ({calculateHand(playerHand)})
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 min-h-[40px]">
                    {playerHand.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white text-neutral-900 font-black rounded-lg shadow-md">
                        {c}
                      </span>
                    ))}
                    {playerHand.length === 0 && <span className="text-xs text-emerald-600">Place bet to start</span>}
                  </div>
                </div>

                {blackjackMessage && (
                  <div className="text-sm font-bold text-amber-300 pt-1">
                    {blackjackMessage}
                  </div>
                )}
              </div>

              {/* Controls */}
              {!gameActive ? (
                <button
                  onClick={startBlackjack}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-black rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Deal Hand ({currency}{betAmount})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={hit}
                    className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
                  >
                    Hit (+1 Card)
                  </button>
                  <button
                    onClick={stand}
                    className="py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95"
                  >
                    Stand
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

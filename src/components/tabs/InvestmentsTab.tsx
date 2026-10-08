import React, { useState } from 'react';
import { Character, StockAsset, CryptoAsset } from '../../types/game';
import { TrendingUp, DollarSign, PieChart, Landmark, ArrowUpRight, ArrowDownRight, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface InvestmentsTabProps {
  character: Character;
  onBuyStock: (stockId: string, shares: number) => void;
  onSellStock: (stockId: string, shares: number) => void;
  onBuyCrypto: (cryptoId: string, amount: number) => void;
  onSellCrypto: (cryptoId: string, amount: number) => void;
  onBorrowLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
}

export const InvestmentsTab: React.FC<InvestmentsTabProps> = ({
  character,
  onBuyStock,
  onSellStock,
  onBuyCrypto,
  onSellCrypto,
  onBorrowLoan,
  onRepayLoan,
}) => {
  const [activeMarket, setActiveMarket] = useState<'stocks' | 'crypto' | 'banking'>('stocks');
  const [selectedStock, setSelectedStock] = useState<StockAsset | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoAsset | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(1);

  const { stocks, cryptos, money, country, bankDebt } = character;
  const currency = country.currencySymbol;

  // Portfolio Totals
  const totalStockValue = stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
  const totalCryptoValue = cryptos.reduce((acc, c) => acc + c.coinsOwned * c.currentPrice, 0);
  const totalInvested = totalStockValue + totalCryptoValue;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Total Investment Portfolio
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              {currency}{Math.floor(totalInvested).toLocaleString()}
            </h2>
            <div className="text-xs text-neutral-400 mt-1">
              Stocks: {currency}{Math.floor(totalStockValue).toLocaleString()} • Crypto: {currency}{Math.floor(totalCryptoValue).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
              <div className="text-xs text-neutral-400">Cash on Hand</div>
              <div className="text-lg font-bold text-emerald-400">
                {currency}{Math.floor(money).toLocaleString()}
              </div>
            </div>
            {bankDebt > 0 && (
              <div className="bg-rose-500/20 rounded-2xl p-4 text-center border border-rose-500/30">
                <div className="text-xs text-rose-300">Bank Debt</div>
                <div className="text-lg font-bold text-rose-400">
                  {currency}{Math.floor(bankDebt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => {
            setActiveMarket('stocks');
            sounds.playClick();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMarket === 'stocks'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          📈 Wall Street Equities
        </button>
        <button
          onClick={() => {
            setActiveMarket('crypto');
            sounds.playClick();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMarket === 'crypto'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          🪙 Crypto Assets
        </button>
        <button
          onClick={() => {
            setActiveMarket('banking');
            sounds.playClick();
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMarket === 'banking'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          🏦 Bank Loans & Savings
        </button>
      </div>

      {/* 1. STOCKS MARKET */}
      {activeMarket === 'stocks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stocks.map((stock) => {
            const ownedValue = stock.sharesOwned * stock.currentPrice;
            const prevPrice = stock.history[stock.history.length - 2] || stock.currentPrice;
            const diffPct = ((stock.currentPrice - prevPrice) / prevPrice) * 100;
            const isPositive = diffPct >= 0;

            return (
              <div
                key={stock.id}
                className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-900 text-base">{stock.symbol}</span>
                        <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {stock.category}
                        </span>
                      </div>
                      <h4 className="text-xs text-neutral-600 mt-0.5">{stock.name}</h4>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-neutral-900">
                        {currency}{stock.currentPrice.toLocaleString()}
                      </div>
                      <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{diffPct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline trend visualizer */}
                  <div className="bg-neutral-50 rounded-xl p-2.5 my-3 border border-neutral-100">
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">5-Year Price History</div>
                    <div className="flex items-end gap-1.5 h-10">
                      {stock.history.map((val, i) => {
                        const min = Math.min(...stock.history);
                        const max = Math.max(...stock.history);
                        const height = max === min ? 50 : Math.max(15, ((val - min) / (max - min)) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className="w-full bg-indigo-500/70 hover:bg-indigo-600 rounded-t-sm transition-all"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Owned status */}
                  <div className="flex items-center justify-between text-xs py-2 border-t border-neutral-100 text-neutral-600 font-medium">
                    <span>Shares Owned: <strong className="text-neutral-900">{stock.sharesOwned}</strong></span>
                    <span>Total Value: <strong className="text-emerald-600">{currency}{Math.floor(ownedValue).toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Buy / Sell Quick Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                  <button
                    disabled={money < stock.currentPrice}
                    onClick={() => {
                      sounds.playCash();
                      onBuyStock(stock.id, 1);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-xs transition-all"
                  >
                    Buy 1 Share ({currency}{stock.currentPrice})
                  </button>
                  <button
                    disabled={stock.sharesOwned < 1}
                    onClick={() => {
                      sounds.playCash();
                      onSellStock(stock.id, 1);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 transition-all"
                  >
                    Sell 1 Share
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. CRYPTO EXCHANGE */}
      {activeMarket === 'crypto' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cryptos.map((crypto) => {
            const ownedValue = crypto.coinsOwned * crypto.currentPrice;
            const prevPrice = crypto.history[crypto.history.length - 2] || crypto.currentPrice;
            const diffPct = ((crypto.currentPrice - prevPrice) / prevPrice) * 100;
            const isPositive = diffPct >= 0;

            return (
              <div
                key={crypto.id}
                className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-black text-neutral-900 text-base">{crypto.symbol}</span>
                      <h4 className="text-xs text-neutral-600 mt-0.5">{crypto.name}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-neutral-900">
                        {currency}{crypto.currentPrice.toLocaleString()}
                      </div>
                      <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        <span>{diffPct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-600 py-3 border-y border-neutral-100 my-2 space-y-1">
                    <div>Coins Owned: <strong className="text-neutral-900">{crypto.coinsOwned.toFixed(3)}</strong></div>
                    <div>Holdings: <strong className="text-emerald-600">{currency}{Math.floor(ownedValue).toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    disabled={money < 100}
                    onClick={() => {
                      sounds.playCash();
                      onBuyCrypto(crypto.id, 100);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-xs transition-all"
                  >
                    Buy {currency}100
                  </button>
                  <button
                    disabled={crypto.coinsOwned <= 0}
                    onClick={() => {
                      sounds.playCash();
                      onSellCrypto(crypto.id, crypto.coinsOwned);
                    }}
                    className="py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 transition-all"
                  >
                    Sell All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. BANKING & LOANS */}
      {activeMarket === 'banking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-600" />
              <span>High-Yield Cash Savings Account</span>
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              All your liquid cash balance automatically earns a 4.5% annual compound yield when you advance to the next year.
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
              Current Interest Return: +{currency}{Math.floor(money * 0.045).toLocaleString()} / year
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span>Bank Credit & Personal Loans</span>
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Borrow capital for real estate or business investments. Loans accrue 6% annual interest.
            </p>

            <div className="flex items-center justify-between text-xs font-bold py-1">
              <span>Current Outstanding Debt:</span>
              <span className="text-rose-600">{currency}{Math.floor(bankDebt).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onBorrowLoan(25000)}
                className="py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Borrow {currency}25,000
              </button>
              <button
                disabled={bankDebt <= 0 || money <= 0}
                onClick={() => onRepayLoan(Math.min(money, bankDebt))}
                className="py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-xs transition-colors"
              >
                Repay Debt ({currency}{Math.min(money, bankDebt).toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

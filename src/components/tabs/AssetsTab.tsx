import React, { useState } from 'react';
import { Character, RealEstate, Vehicle } from '../../types/game';
import { REAL_ESTATE_CATALOG, VEHICLES_CATALOG } from '../../data/gameData';
import { Home, Car, DollarSign, Wrench, Sparkles, Key, Check, Plus, AlertCircle, Shield, TrendingUp, Eye, Box } from 'lucide-react';
import { ThreeAssetViewerModal } from '../three/ThreeAssetViewerModal';
import { sounds } from '../../utils/audio';

interface AssetsTabProps {
  character: Character;
  onBuyProperty: (property: Omit<RealEstate, 'condition' | 'isRentedOut' | 'boughtAtAge'>) => void;
  onManageProperty: (propId: string, action: 'toggle_rent' | 'renovate' | 'sell') => void;
  onBuyVehicle: (vehicle: Omit<Vehicle, 'condition' | 'boughtAtAge'>) => void;
  onManageVehicle: (vehId: string, action: 'maintain' | 'joyride' | 'sell') => void;
}

export const AssetsTab: React.FC<AssetsTabProps> = ({
  character,
  onBuyProperty,
  onManageProperty,
  onBuyVehicle,
  onManageVehicle,
}) => {
  const [subTab, setSubTab] = useState<'real_estate' | 'vehicles'>('real_estate');
  const [inspectModal, setInspectModal] = useState<{
    isOpen: boolean;
    asset: RealEstate | Vehicle | null;
    type: 'property' | 'vehicle';
  }>({
    isOpen: false,
    asset: null,
    type: 'property',
  });

  const { properties, vehicles, money, country, age } = character;
  const currency = country.currencySymbol;

  const totalPropertyValue = properties.reduce((acc, p) => acc + p.purchasePrice, 0);
  const totalRentalIncome = properties.filter((p) => p.isRentedOut).reduce((acc, p) => acc + (p.rentalIncomeAnnual || 0), 0);
  const totalVehicleValue = vehicles.reduce((acc, v) => acc + v.purchasePrice, 0);

  const open3DInspect = (asset: RealEstate | Vehicle, type: 'property' | 'vehicle') => {
    sounds.playClick();
    setInspectModal({
      isOpen: true,
      asset,
      type,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSubTab('real_estate');
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'real_estate'
                ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-lg'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🏡 Vice City Estates ({properties.length})
          </button>
          <button
            onClick={() => {
              setSubTab('vehicles');
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === 'vehicles'
                ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white shadow-lg'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🏎️ Garage & Vehicles ({vehicles.length})
          </button>
        </div>

        <div className="text-right text-xs text-neutral-400 hidden sm:block font-mono">
          {subTab === 'real_estate' ? (
            <span>Total Real Estate: <strong className="text-emerald-400">{currency}{totalPropertyValue.toLocaleString()}</strong></span>
          ) : (
            <span>Total Vehicles: <strong className="text-cyan-400">{currency}{totalVehicleValue.toLocaleString()}</strong></span>
          )}
        </div>
      </div>

      {/* 1. REAL ESTATE TAB */}
      {subTab === 'real_estate' && (
        <div className="space-y-8">
          {/* Owned Properties Section */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Your Owned Properties & Safehouses</span>
                </h3>
                {totalRentalIncome > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                    +{currency}{totalRentalIncome.toLocaleString()}/yr Passive Rent
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((prop) => {
                  const isRealImage = prop.image?.startsWith('http') || prop.image?.startsWith('/src/');
                  return (
                    <div
                      key={prop.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between text-white hover:border-neutral-700 transition-all"
                    >
                      <div>
                        {/* Real Property Photo */}
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 bg-neutral-950 border border-neutral-800 group">
                          {isRealImage ? (
                            <img
                              src={prop.image}
                              alt={prop.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl bg-neutral-800">
                              {prop.image}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-400/30 shadow-md">
                            {prop.type}
                          </div>
                          <span
                            className={`absolute top-2.5 right-2.5 text-xs font-black px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md border ${
                              prop.isRentedOut
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                            }`}
                          >
                            {prop.isRentedOut ? '💼 Rented Out' : '🛋️ Primary Home'}
                          </span>
                          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white">
                            <h4 className="font-bold text-sm truncate max-w-[65%]">{prop.name}</h4>
                            <span className="text-xs font-black text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                              {currency}{prop.purchasePrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 py-2 border-y border-neutral-800 my-2">
                          <div>Condition: <strong className="text-emerald-400 font-bold">{prop.condition}%</strong></div>
                          <div>Rental Yield: <strong className="text-emerald-400 font-bold">+{currency}{prop.rentalIncomeAnnual?.toLocaleString() || 0}/yr</strong></div>
                          <div>Upkeep & Taxes: <strong className="text-neutral-300">{currency}{(prop.annualMaintenance + prop.annualPropertyTax).toLocaleString()}/yr</strong></div>
                          <div>Acquired: <strong className="text-neutral-300">Age {prop.boughtAtAge}</strong></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mt-2">
                        <button
                          onClick={() => open3DInspect(prop, 'property')}
                          className="py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-1 border border-neutral-700 transition-colors"
                          title="Inspect in 3D Showroom"
                        >
                          <Box className="w-3.5 h-3.5 text-indigo-400" />
                          <span>3D</span>
                        </button>
                        <button
                          onClick={() => onManageProperty(prop.id, 'toggle_rent')}
                          className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                            prop.isRentedOut
                              ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                          }`}
                        >
                          {prop.isRentedOut ? 'Move In' : 'Rent Out'}
                        </button>
                        <button
                          onClick={() => onManageProperty(prop.id, 'renovate')}
                          className="py-2 rounded-xl text-xs font-bold bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 transition-colors"
                        >
                          Renovate
                        </button>
                        <button
                          onClick={() => onManageProperty(prop.id, 'sell')}
                          className="py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition-colors"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Real Estate Marketplace */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-fuchsia-400" />
              <span>Vice City Real Estate Marketplace & Starfish Estates</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REAL_ESTATE_CATALOG.map((prop) => {
                const canAfford = money >= prop.purchasePrice;
                const isRealImage = prop.image?.startsWith('http') || prop.image?.startsWith('/src/');
                return (
                  <div
                    key={prop.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl hover:border-neutral-700 transition-all text-white group"
                  >
                    <div>
                      {/* Real Property Photo */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3 bg-neutral-950 border border-neutral-800">
                        {isRealImage ? (
                          <img
                            src={prop.image}
                            alt={prop.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-neutral-800">
                            {prop.image}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-400/30 shadow-md">
                          {prop.type}
                        </div>
                        <button
                          onClick={() => open3DInspect(prop as any, 'property')}
                          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-neutral-950/80 backdrop-blur-md hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>3D</span>
                        </button>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                          <span className="text-xs font-black truncate max-w-[65%]">{prop.name}</span>
                          <span className="text-xs font-black text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            {currency}{prop.purchasePrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-neutral-400 space-y-1 mb-4 p-2.5 bg-neutral-950/60 rounded-2xl border border-neutral-800/80">
                        <div className="flex justify-between">
                          <span>Est. Annual Rent:</span>
                          <strong className="text-emerald-400">+{currency}{prop.rentalIncomeAnnual?.toLocaleString()}/yr</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes & Upkeep:</span>
                          <strong className="text-neutral-300">{currency}{(prop.annualMaintenance + prop.annualPropertyTax).toLocaleString()}/yr</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford || age < 18}
                      onClick={() => onBuyProperty(prop)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{age < 18 ? 'Must be 18+ to buy' : canAfford ? 'Purchase Property' : 'Insufficient Funds'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. VEHICLES TAB */}
      {subTab === 'vehicles' && (
        <div className="space-y-8">
          {/* Garage Section */}
          {vehicles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>Your Vice City Garage</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((veh) => (
                  <div
                    key={veh.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between text-white"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{veh.name}</h4>
                          <span className="text-xs text-neutral-400">{veh.type}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
                          Condition: {veh.condition}%
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 space-y-1 my-3 font-mono">
                        <div>Speed Rating: <strong className="text-cyan-400">{veh.speedRating} / 100</strong></div>
                        <div>Annual Upkeep: <strong className="text-neutral-200">{currency}{veh.annualMaintenance.toLocaleString()}/yr</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => open3DInspect(veh, 'vehicle')}
                        className="py-2 rounded-xl text-xs font-bold bg-neutral-800 text-white hover:bg-neutral-700 flex items-center justify-center gap-1 transition-colors border border-neutral-700"
                        title="3D Showroom & Color Customizer"
                      >
                        <Box className="w-3.5 h-3.5 text-cyan-400" />
                        <span>3D</span>
                      </button>
                      <button
                        onClick={() => onManageVehicle(veh.id, 'joyride')}
                        className="py-2 rounded-xl text-xs font-bold bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 transition-colors"
                      >
                        🏎️ Ride
                      </button>
                      <button
                        onClick={() => onManageVehicle(veh.id, 'maintain')}
                        className="py-2 rounded-xl text-xs font-bold bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 transition-colors"
                      >
                        🔧 Service
                      </button>
                      <button
                        onClick={() => onManageVehicle(veh.id, 'sell')}
                        className="py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dealership */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>Sunshine Autos & Hangar Showroom</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLES_CATALOG.map((veh) => {
                const canAfford = money >= veh.purchasePrice;
                return (
                  <div
                    key={veh.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:border-neutral-700 transition-all text-white"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40 font-mono">
                          {veh.type}
                        </span>
                        <button
                          onClick={() => open3DInspect(veh as any, 'vehicle')}
                          className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1 border border-neutral-700"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          3D
                        </button>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{veh.name}</h4>
                      <div className="text-base font-mono font-black text-emerald-400 my-2">
                        {currency}{veh.purchasePrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-400 space-y-1 mb-4 font-mono">
                        <div>Speed: <strong className="text-cyan-400">{veh.speedRating}/100</strong></div>
                        <div>Upkeep: <strong className="text-neutral-300">{currency}{veh.annualMaintenance.toLocaleString()}/yr</strong></div>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyVehicle(veh)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-500 hover:to-fuchsia-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white shadow-md transition-all font-mono"
                    >
                      {canAfford ? 'Buy Vehicle' : 'Cannot Afford'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3D Asset Inspection Modal */}
      <ThreeAssetViewerModal
        isOpen={inspectModal.isOpen}
        onClose={() => setInspectModal((prev) => ({ ...prev, isOpen: false }))}
        asset={inspectModal.asset}
        assetType={inspectModal.type}
        currencySymbol={currency}
      />
    </div>
  );
};

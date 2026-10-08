import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Character,
  Gender,
  CountryInfo,
  PersonRelation,
  Degree,
  Job,
  RealEstate,
  Vehicle,
  Dilemma,
  DilemmaChoice,
  StartupBusiness,
  LifeLogEntry,
  LifeMission,
} from './types/game';
import {
  COUNTRIES,
  FIRST_NAMES_MALE,
  FIRST_NAMES_FEMALE,
  LAST_NAMES,
  ACHIEVEMENTS,
  INITIAL_STOCKS,
  INITIAL_CRYPTOS,
  DILEMMAS_DATABASE,
  RANDOM_ANNUAL_EVENTS,
} from './data/gameData';
import { LIFE_MISSIONS, LIFE_PERKS } from './data/missionsData';
import { TopStatsBar } from './components/TopStatsBar';
import { CenturyTimelineBar } from './components/CenturyTimelineBar';
import { MissionQuestModal } from './components/MissionQuestModal';
import { LifePerksModal } from './components/LifePerksModal';
import { EraChroniclesModal } from './components/EraChroniclesModal';
import { CenturyVictoryModal } from './components/CenturyVictoryModal';
import { DilemmaModal } from './components/DilemmaModal';
import { DeathScreen } from './components/DeathScreen';
import { NewGameModal } from './components/NewGameModal';
import { CasinoModal } from './components/MiniGames/CasinoModal';

// Tabs
import { DashboardTab } from './components/tabs/DashboardTab';
import { CareerTab } from './components/tabs/CareerTab';
import { AssetsTab } from './components/tabs/AssetsTab';
import { InvestmentsTab } from './components/tabs/InvestmentsTab';
import { RelationshipsTab } from './components/tabs/RelationshipsTab';
import { HealthLifestyleTab } from './components/tabs/HealthLifestyleTab';
import { LifeLogTab } from './components/tabs/LifeLogTab';

import {
  LayoutDashboard,
  Briefcase,
  Home,
  TrendingUp,
  Heart,
  Activity,
  BookmarkCheck,
} from 'lucide-react';
import { sounds } from './utils/audio';
import confetti from 'canvas-confetti';

const STORAGE_KEY = '100_years_life_sim_save_v1';

// Initial Character Generator
function createNewCharacter(
  config?: {
    firstName: string;
    lastName: string;
    gender: Gender;
    country: CountryInfo;
    mission?: LifeMission;
  },
  generation = 1,
  inheritedMoney = 0
): Character {
  const isMale = config ? config.gender === 'male' : true;
  const gender: Gender = config ? config.gender : 'male';
  const country = config ? config.country : COUNTRIES[0];
  const firstName = config?.firstName || 'Tommy';
  const lastName = config?.lastName || 'Vercetti';

  const fatherName = `${FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]} ${lastName}`;
  const motherName = `${FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]} ${lastName}`;

  const fatherAge = Math.floor(Math.random() * 10) + 26;
  const motherAge = Math.floor(Math.random() * 8) + 24;

  const parents: PersonRelation[] = [
    {
      id: 'rel_dad',
      name: fatherName,
      type: 'Father',
      gender: 'male',
      age: fatherAge,
      affinity: Math.floor(Math.random() * 20) + 80,
      status: 'Alive',
      isAlive: true,
      avatarSeed: 'dad',
      occupation: 'Civil Engineer',
    },
    {
      id: 'rel_mom',
      name: motherName,
      type: 'Mother',
      gender: 'female',
      age: motherAge,
      affinity: Math.floor(Math.random() * 15) + 85,
      status: 'Alive',
      isAlive: true,
      avatarSeed: 'mom',
      occupation: 'Architect',
    },
  ];

  const startingSmarts = Math.floor(Math.random() * 35) + 50;
  const startingLooks = Math.floor(Math.random() * 35) + 50;
  const startingHealth = Math.floor(Math.random() * 15) + 85;

  const selectedMission = config?.mission
    ? JSON.parse(JSON.stringify(config.mission))
    : JSON.parse(JSON.stringify(LIFE_MISSIONS[0]));

  return {
    id: `char_${Date.now()}`,
    firstName,
    lastName,
    gender,
    age: (firstName === 'Tommy' && lastName === 'Vercetti') ? 25 : 0,
    birthYear: new Date().getFullYear() - ((firstName === 'Tommy' && lastName === 'Vercetti') ? 25 : 0),
    country,
    stats: {
      health: startingHealth,
      happiness: country.baseHappiness,
      smarts: startingSmarts,
      looks: startingLooks,
      karma: 50,
      fame: 15,
      energy: 100,
    },
    money: inheritedMoney > 0 ? inheritedMoney : (firstName === 'Tommy' ? 25000 : 100),
    bankDebt: 0,
    hasDriverLicense: firstName === 'Tommy' ? true : false,
    education: firstName === 'Tommy' ? 'high_school' : 'none',
    degrees: [],
    jobHistory: [],
    isRetired: false,
    properties: firstName === 'Tommy' ? [
      {
        id: 'prop_ocean_view',
        name: 'Ocean View Hotel Suite (Ocean Beach)',
        type: 'Apartment',
        purchasePrice: 220000,
        annualMaintenance: 2800,
        annualPropertyTax: 2200,
        rentalIncomeAnnual: 18000,
        image: '/src/assets/images/ocean_view_hotel_1791447627973.jpg',
        condition: 100,
        isRentedOut: false,
        boughtAtAge: 25,
      }
    ] : [],
    vehicles: firstName === 'Tommy' ? [
      {
        id: 'veh_cheetah',
        name: 'Vice City Cheetah Exotic (White)',
        type: 'Sports Car',
        purchasePrice: 140000,
        annualMaintenance: 4500,
        speedRating: 95,
        condition: 100,
        boughtAtAge: 25,
      }
    ] : [],
    stocks: JSON.parse(JSON.stringify(INITIAL_STOCKS)),
    cryptos: JSON.parse(JSON.stringify(INITIAL_CRYPTOS)),
    relationships: parents,
    isMarried: false,
    diseases: [],
    diet: 'Standard',
    gymMembership: true,
    // 100-Year Life RPG Progression
    level: 2,
    currentXp: 150,
    nextLevelXp: 500,
    perkPoints: 1,
    activeMission: selectedMission,
    unlockedPerks: [],
    centuryMilestoneReached: false,
    centuryCelebrated: false,
    lifeLog: [
      {
        age: (firstName === 'Tommy' && lastName === 'Vercetti') ? 25 : 0,
        year: new Date().getFullYear(),
        title: (firstName === 'Tommy') ? 'Arrived in Vice City' : 'Born into the World',
        description: (firstName === 'Tommy')
          ? 'Stepped off the plane onto Ocean Beach, Miami. Ready to conquer the 100-Year Empire from Ocean View Hotel to Starfish Island!'
          : `You were born in ${country.name}. Embarked on the 100-year destiny: "${selectedMission.title}"!`,
        category: 'milestone',
        isSignificant: true,
      },
    ],
    achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)),
    isAlive: true,
    generation,
  };
}

export default function App() {
  const [character, setCharacter] = useState<Character>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.activeMission) parsed.activeMission = JSON.parse(JSON.stringify(LIFE_MISSIONS[0]));
        if (!parsed.level) parsed.level = 1;
        if (!parsed.currentXp) parsed.currentXp = 0;
        if (!parsed.nextLevelXp) parsed.nextLevelXp = 500;
        if (!parsed.perkPoints) parsed.perkPoints = 0;
        if (!parsed.unlockedPerks) parsed.unlockedPerks = [];
        // Ensure Tommy Vercetti is loaded with Vice City assets
        if (parsed.firstName === 'Tommy' || parsed.lastName === 'Vercetti') {
          return parsed;
        }
      }
    } catch {}
    return createNewCharacter();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentDilemma, setCurrentDilemma] = useState<Dilemma | null>(null);
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const [isEraModalOpen, setIsEraModalOpen] = useState(false);
  const [isCenturyVictoryOpen, setIsCenturyVictoryOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [datingCandidates, setDatingCandidates] = useState<PersonRelation[]>([]);
  const [viceToast, setViceToast] = useState<{
    title: string;
    description?: string;
    type?: 'success' | 'danger' | 'warning' | 'info';
  } | null>(null);

  const showViceToast = useCallback(
    (title: string, description?: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') => {
      setViceToast({ title, description, type });
      setTimeout(() => {
        setViceToast((curr) => (curr?.title === title ? null : curr));
      }, 4200);
    },
    []
  );

  // Auto-save state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    } catch {}
  }, [character]);

  // Calculate Net Worth
  const calculateNetWorth = useCallback((char: Character) => {
    const propertyVal = char.properties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const vehicleVal = char.vehicles.reduce((sum, v) => sum + v.purchasePrice, 0);
    const stockVal = char.stocks.reduce((sum, s) => sum + s.sharesOwned * s.currentPrice, 0);
    const cryptoVal = char.cryptos.reduce((sum, c) => sum + c.coinsOwned * c.currentPrice, 0);
    const startupVal = char.startup ? char.startup.valuation : 0;
    return char.money + propertyVal + vehicleVal + stockVal + cryptoVal + startupVal - char.bankDebt;
  }, []);

  const netWorth = calculateNetWorth(character);

  // Check and unlock achievements
  const checkAchievements = useCallback((char: Character) => {
    const achs = [...char.achievements];
    let changed = false;

    const unlock = (id: string) => {
      const target = achs.find((a) => a.id === id);
      if (target && !target.unlocked) {
        target.unlocked = true;
        target.unlockedAtAge = char.age;
        changed = true;
        sounds.playFanfare();
        confetti({ particleCount: 70, spread: 60 });
      }
    };

    if (char.age >= 100) unlock('ach_centenarian');
    if (calculateNetWorth(char) >= 1000000) unlock('ach_millionaire');
    if (calculateNetWorth(char) >= 10000000) unlock('ach_multi_millionaire');
    if (char.currentJob && char.currentJob.currentSalary >= 100000) unlock('ach_six_figures');
    if (char.properties.length > 0) unlock('ach_homeowner');
    if (char.vehicles.some((v) => v.type === 'Supercar')) unlock('ach_supercar');
    if (char.properties.some((p) => p.type === 'Island')) unlock('ach_private_island');
    if (char.isMarried) unlock('ach_wedding_bells');
    if (char.relationships.some((r) => r.type === 'Child')) unlock('ach_proud_parent');
    if (char.degrees.length > 0) unlock('ach_graduate');
    if (char.partnerId) unlock('ach_first_kiss');
    if (char.isRetired) unlock('ach_retiree');
    if (char.stats.karma >= 95) unlock('ach_saint');
    if (char.startup && char.startup.valuation >= 5000000) unlock('ach_startup_unicorn');
    if (
      char.currentJob &&
      (char.currentJob.job.category === 'Executive' || char.currentJob.job.id === 'job_ceo')
    ) {
      unlock('ach_executive_chair');
    }

    if (changed) {
      char.achievements = achs;
    }
  }, [calculateNetWorth]);

  // Advance 1 Year
  const handleAgeUp = useCallback(() => {
    if (!character.isAlive) return;

    setCharacter((prev) => {
      const nextAge = prev.age + 1;
      const nextYear = prev.birthYear + nextAge;
      let newHealth = prev.stats.health;
      let newHappiness = prev.stats.happiness;
      let newSmarts = prev.stats.smarts;
      let newLooks = prev.stats.looks;
      let newKarma = prev.stats.karma;
      let newMoney = prev.money;
      let newDebt = prev.bankDebt;
      let newIsAlive = true;
      let causeOfDeath = '';
      const newLogs: LifeLogEntry[] = [...prev.lifeLog];
      let newDegrees = [...prev.degrees];
      let newEnrollment = prev.currentEnrollment ? { ...prev.currentEnrollment } : undefined;
      let newCurrentJob = prev.currentJob ? { ...prev.currentJob } : undefined;
      let newStartup = prev.startup ? { ...prev.startup } : undefined;
      let newProperties = [...prev.properties];
      let newVehicles = [...prev.vehicles];
      let newDiseases = [...prev.diseases];

      // 1. Natural Aging & Health Wear (Adjusted by Perks)
      const hasCentenarianGene = prev.unlockedPerks?.includes('perk_centenarian_gene');
      const hasIronLungs = prev.unlockedPerks?.includes('perk_iron_lungs');
      const hasMarketOracle = prev.unlockedPerks?.includes('perk_market_oracle');
      const hasSilverTongue = prev.unlockedPerks?.includes('perk_silver_tongue');
      const hasGenius = prev.unlockedPerks?.includes('perk_genius_cognition');

      const ageWearMultiplier = hasCentenarianGene ? 0.4 : 1.0;
      if (nextAge > 45) newHealth -= 1 * ageWearMultiplier;
      if (nextAge > 70) newHealth -= 2.5 * ageWearMultiplier;
      if (nextAge > 85) newHealth -= 4 * ageWearMultiplier;
      if (nextAge >= 98) newHealth -= (hasCentenarianGene ? 3 : 7);

      if (hasIronLungs) {
        newHealth += 1.5;
      }
      if (hasGenius) {
        newSmarts += 1.5;
      }

      // Diet & Gym buffs/debuffs
      if (prev.gymMembership) {
        newHealth += 2;
        newLooks += 1;
        newMoney -= 480; // Gym dues
      }
      if (prev.diet === 'Mediterranean') newHealth += 1.5;
      if (prev.diet === 'Junk Food') {
        newHealth -= 2;
        newHappiness += 1;
      }
      if (prev.diet === 'Organic High-Protein') {
        newHealth += 1;
        newLooks += 0.5;
        newMoney -= 1200;
      }

      // 2. Education Progression
      if (newEnrollment) {
        newEnrollment.currentYear += 1;
        newSmarts += (hasGenius ? 5 : 3);
        if (newEnrollment.currentYear > newEnrollment.totalYears) {
          // Graduated!
          newDegrees.push(newEnrollment.degree);
          newLogs.push({
            age: nextAge,
            year: nextYear,
            title: `Graduated: ${newEnrollment.degree.name}!`,
            description: `You successfully completed your ${newEnrollment.degree.name} with honors. Career prospects opened up!`,
            category: 'education',
            isSignificant: true,
          });
          newEnrollment = undefined;
          newHappiness += 15;
          sounds.playFanfare();
        }
      }

      // Elementary & High school milestones
      if (nextAge === 6) {
        newLogs.push({
          age: 6,
          year: nextYear,
          title: 'Started Elementary School',
          description: 'You entered 1st grade, made new classroom friends, and learned to read and write.',
          category: 'education',
        });
      }
      if (nextAge === 14) {
        newLogs.push({
          age: 14,
          year: nextYear,
          title: 'Entered High School',
          description: 'High school begins! You are now eligible for part-time gigs and driving school.',
          category: 'milestone',
        });
      }

      // 3. Employment & Salary Cashflow
      if (newCurrentJob) {
        newCurrentJob.yearsInRole += 1;
        let annualPay = newCurrentJob.currentSalary;
        if (hasSilverTongue) {
          annualPay = Math.round(annualPay * 1.15);
        }
        newMoney += annualPay;

        // Auto-raise based on performance
        if (newCurrentJob.performance >= 70) {
          const raise = Math.round(annualPay * (hasSilverTongue ? 0.06 : 0.04));
          newCurrentJob.currentSalary += raise;
        }

        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: `Salary Earned: ${prev.country.currencySymbol}${annualPay.toLocaleString()}`,
          description: `Worked as ${newCurrentJob.job.title}. Performance rated at ${newCurrentJob.performance}%.`,
          category: 'career',
        });
      }

      // 4. Startup Cashflow & Growth
      if (newStartup) {
        newStartup.yearsActive += 1;
        newStartup.annualRevenue = Math.round(newStartup.annualRevenue * (1 + (Math.random() * 0.3 - 0.05)));
        newStartup.annualProfit = Math.round(newStartup.annualRevenue * 0.25);
        newStartup.valuation = Math.round(newStartup.annualRevenue * 5);
        newMoney += newStartup.annualProfit;

        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: `Startup Growth: ${newStartup.name}`,
          description: `Generated ${prev.country.currencySymbol}${newStartup.annualProfit.toLocaleString()} profit. Enterprise valuation rose to ${prev.country.currencySymbol}${newStartup.valuation.toLocaleString()}.`,
          category: 'career',
        });
      }

      // 5. Assets Cashflow (Rental Income & Upkeep)
      let netPropertyCashflow = 0;
      newProperties.forEach((p) => {
        const upkeep = p.annualMaintenance + p.annualPropertyTax;
        let income = 0;
        if (p.isRentedOut && p.rentalIncomeAnnual) {
          income = p.rentalIncomeAnnual;
        }
        netPropertyCashflow += income - upkeep;
        // Property value appreciation ~ 3.5%
        p.purchasePrice = Math.round(p.purchasePrice * (1 + (Math.random() * 0.06 - 0.01)));
      });
      newMoney += netPropertyCashflow;

      // Vehicles upkeep & depreciation
      newVehicles.forEach((v) => {
        newMoney -= v.annualMaintenance;
        v.condition = Math.max(10, v.condition - 5);
      });

      // 6. Investments Markets Fluctuation
      const updatedStocks = prev.stocks.map((s) => {
        const volatilityBias = hasMarketOracle ? 0.05 : 0;
        const delta = (Math.random() * 2 - 1) * s.volatility + 0.07 + volatilityBias; // average +7% long term
        const nextPrice = Math.max(5, Math.round(s.currentPrice * (1 + delta)));
        const newHist = [...s.history.slice(-9), nextPrice];
        return { ...s, currentPrice: nextPrice, history: newHist };
      });

      const updatedCryptos = prev.cryptos.map((c) => {
        const delta = (Math.random() * 2 - 1) * c.volatility + 0.1;
        const nextPrice = Math.max(1, Math.round(c.currentPrice * (1 + delta)));
        const newHist = [...c.history.slice(-9), nextPrice];
        return { ...c, currentPrice: nextPrice, history: newHist };
      });

      // Savings compound interest (+4.5%)
      if (newMoney > 0) {
        const interest = Math.round(newMoney * 0.045);
        newMoney += interest;
      }

      // Debt interest (6%)
      if (newDebt > 0) {
        newDebt = Math.round(newDebt * 1.06);
      }

      // Basic Living Costs (scaled with age & lifestyle)
      if (nextAge >= 18) {
        const livingCost = 14000 * prev.country.costMultiplier;
        newMoney -= livingCost;
      }

      // 7. Relationships Aging
      const updatedRelationships = prev.relationships.map((rel) => {
        const rAge = rel.age + 1;
        let isAlive = rel.isAlive;
        if (isAlive && (rel.type === 'Father' || rel.type === 'Mother') && rAge >= 76) {
          // Natural mortality chance for parents
          if (Math.random() < 0.12 || rAge >= 92) {
            isAlive = false;
            newLogs.push({
              age: nextAge,
              year: nextYear,
              title: `${rel.name} Passed Away`,
              description: `Your ${rel.type.toLowerCase()} passed away peacefully at the age of ${rAge}. You held a heartfelt memorial.`,
              category: 'love',
              isSignificant: true,
            });
            newHappiness -= 25;
          }
        }
        return { ...rel, age: rAge, isAlive, status: isAlive ? 'Alive' : 'Deceased' };
      });

      // 8. Random Annual Event
      if (Math.random() < 0.35 && nextAge >= 6) {
        const ev = RANDOM_ANNUAL_EVENTS[Math.floor(Math.random() * RANDOM_ANNUAL_EVENTS.length)];
        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: ev.title,
          description: ev.desc,
          category: 'general',
        });
        if (ev.type === 'happiness_boost') newHappiness += 8;
        if (ev.type === 'health_boost') newHealth += 6;
        if (ev.type === 'money_boost') newMoney += 1850;
      }

      // 9. Mission Milestones Evaluation & RPG Progression
      let currentXp = (prev.currentXp || 0) + 50; // Annual passive life XP
      let level = prev.level || 1;
      let nextLevelXp = prev.nextLevelXp || 500;
      let perkPoints = prev.perkPoints || 0;
      const updatedMission = prev.activeMission ? JSON.parse(JSON.stringify(prev.activeMission)) : undefined;

      if (updatedMission && updatedMission.milestones) {
        const currentNetWorth = calculateNetWorth({
          ...prev,
          money: newMoney,
          properties: newProperties,
          vehicles: newVehicles,
          stocks: updatedStocks,
          cryptos: updatedCryptos,
          startup: newStartup,
          bankDebt: newDebt,
        });

        updatedMission.milestones.forEach((m: any) => {
          if (!m.completed) {
            let isMet = false;
            if (m.targetType === 'age' && nextAge >= m.targetValue) {
              isMet = true;
            } else if (m.targetType === 'money' && currentNetWorth >= m.targetValue) {
              isMet = true;
            } else if (m.targetType === 'stat') {
              const statVal = (newHealth + newHappiness + newSmarts + newLooks) / 4;
              if (m.targetKey && (prev.stats as any)[m.targetKey] >= m.targetValue) {
                isMet = true;
              } else if (statVal >= m.targetValue) {
                isMet = true;
              }
            } else if (m.targetType === 'career' && (newCurrentJob || newStartup || newDegrees.length > 0)) {
              if (nextAge >= m.minAge) isMet = true;
            } else if (m.targetType === 'education' && newDegrees.length > 0) {
              isMet = true;
            } else if (m.targetType === 'family' && (prev.isMarried || prev.relationships.some((r) => r.type === 'Child'))) {
              isMet = true;
            }

            if (isMet) {
              m.completed = true;
              m.completedAtAge = nextAge;
              m.completedAtYear = nextYear;
              currentXp += m.xpReward;
              perkPoints += 1;
              if (m.cashReward) {
                newMoney += m.cashReward;
              }
              sounds.playFanfare();
              confetti({ particleCount: 80, spread: 70 });
              newLogs.push({
                age: nextAge,
                year: nextYear,
                title: `🌟 Life Quest Milestone: ${m.title}!`,
                description: `Achieved 100-Year Milestone: "${m.title}". Awarded +${m.xpReward} XP, +1 Perk Point!`,
                category: 'milestone',
                isSignificant: true,
              });
            }
          }
        });
      }

      // Check RPG Level Up
      while (currentXp >= nextLevelXp) {
        currentXp -= nextLevelXp;
        level += 1;
        nextLevelXp = Math.round(nextLevelXp * 1.4);
        perkPoints += 1;
        newHappiness += 10;
        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: `⚡ Level Up: Persona Reached Level ${level}!`,
          description: `Gained life mastery and unlocked +1 Skill Perk Point.`,
          category: 'milestone',
          isSignificant: true,
        });
        sounds.playUpgrade();
      }

      // 10. Century Milestone (Age 100 Celebration) & Longevity Limits
      let centuryMilestoneReached = prev.centuryMilestoneReached || false;
      let centuryCelebrated = prev.centuryCelebrated || false;

      if (nextAge >= 100 && !centuryCelebrated) {
        centuryMilestoneReached = true;
        centuryCelebrated = true;
        setIsCenturyVictoryOpen(true);
        sounds.playFanfare();
        confetti({ particleCount: 120, spread: 90 });
        newLogs.push({
          age: 100,
          year: nextYear,
          title: '👑 100-YEAR CENTURY COMPLETED!',
          description: `You have officially lived 100 full years of life in the world! A legendary centenarian paragon.`,
          category: 'milestone',
          isSignificant: true,
        });
      }

      if (nextAge > 120) {
        newIsAlive = false;
        causeOfDeath = 'Accomplished a legendary 120-year supercentenarian existence on Earth.';
        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: 'Ascended into Immortality',
          description: `After 120 glorious years, your grand saga came to a peaceful conclusion.`,
          category: 'milestone',
          isSignificant: true,
        });
      } else if (newHealth <= 0) {
        newIsAlive = false;
        causeOfDeath = 'Succumbed to critical medical health complications.';
        newLogs.push({
          age: nextAge,
          year: nextYear,
          title: 'Passed Away',
          description: `Your health gave out at age ${nextAge}. You departed surrounded by your memories.`,
          category: 'milestone',
          isSignificant: true,
        });
      }

      // Clamp stats
      const finalStats = {
        health: Math.max(0, Math.min(100, newHealth)),
        happiness: Math.max(0, Math.min(100, newHappiness)),
        smarts: Math.max(0, Math.min(100, newSmarts)),
        looks: Math.max(0, Math.min(100, newLooks)),
        karma: Math.max(0, Math.min(100, newKarma)),
        fame: prev.stats.fame,
        energy: 100, // resets every year!
      };

      const updatedChar: Character = {
        ...prev,
        age: nextAge,
        stats: finalStats,
        money: Math.round(newMoney),
        bankDebt: newDebt,
        education: newDegrees.length > 0 ? newDegrees[newDegrees.length - 1].level : prev.education,
        currentEnrollment: newEnrollment,
        degrees: newDegrees,
        currentJob: newCurrentJob,
        startup: newStartup,
        properties: newProperties,
        vehicles: newVehicles,
        stocks: updatedStocks,
        cryptos: updatedCryptos,
        relationships: updatedRelationships,
        diseases: newDiseases,
        lifeLog: newLogs,
        isAlive: newIsAlive,
        causeOfDeath: causeOfDeath || undefined,
        deathAge: newIsAlive ? undefined : nextAge,
        level,
        currentXp,
        nextLevelXp,
        perkPoints,
        activeMission: updatedMission,
        centuryMilestoneReached,
        centuryCelebrated,
      };

      checkAchievements(updatedChar);

      // Check dilemma trigger
      if (newIsAlive) {
        const eligibleDilemmas = DILEMMAS_DATABASE.filter(
          (d) => nextAge >= d.minAge && nextAge <= d.maxAge
        );
        if (eligibleDilemmas.length > 0 && Math.random() < 0.65) {
          const chosenDilemma = eligibleDilemmas[Math.floor(Math.random() * eligibleDilemmas.length)];
          setCurrentDilemma(chosenDilemma);
          if (isAutoPlaying) {
            setIsAutoPlaying(false); // Pause auto-play on dilemmas!
          }
        }
      }

      return updatedChar;
    });
  }, [character.isAlive, checkAchievements, isAutoPlaying]);

  // Spacebar hotkey to Age Up
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !currentDilemma && !isNewGameOpen && !isCasinoOpen && character.isAlive) {
        // Prevent default space scroll
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        sounds.playAgeUp();
        handleAgeUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDilemma, isNewGameOpen, isCasinoOpen, character.isAlive, handleAgeUp]);

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying && character.isAlive && !currentDilemma) {
      timer = setInterval(() => {
        handleAgeUp();
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, character.isAlive, currentDilemma, handleAgeUp]);

  // Resolve Dilemma
  const handleResolveDilemma = (choice: DilemmaChoice) => {
    setCharacter((prev) => {
      const stats = { ...prev.stats };
      if (choice.statChanges.health) stats.health = Math.max(0, Math.min(100, stats.health + choice.statChanges.health));
      if (choice.statChanges.happiness) stats.happiness = Math.max(0, Math.min(100, stats.happiness + choice.statChanges.happiness));
      if (choice.statChanges.smarts) stats.smarts = Math.max(0, Math.min(100, stats.smarts + choice.statChanges.smarts));
      if (choice.statChanges.looks) stats.looks = Math.max(0, Math.min(100, stats.looks + choice.statChanges.looks));
      if (choice.statChanges.karma) stats.karma = Math.max(0, Math.min(100, stats.karma + choice.statChanges.karma));
      if (choice.statChanges.fame) stats.fame = Math.max(0, Math.min(100, stats.fame + choice.statChanges.fame));

      let newMoney = prev.money + (choice.moneyChange || 0);

      const newLog: LifeLogEntry = {
        age: prev.age,
        year: prev.birthYear + prev.age,
        title: currentDilemma?.title || 'Decision Made',
        description: choice.outcomeText,
        category: 'milestone',
      };

      return {
        ...prev,
        stats,
        money: newMoney,
        lifeLog: [...prev.lifeLog, newLog],
      };
    });

    setCurrentDilemma(null);
  };

  // Quick Action Handler from Dashboard
  const handleQuickAction = (action: string) => {
    sounds.playClick();
    setCharacter((prev) => {
      if (prev.stats.energy < 15) {
        showViceToast('OUT OF ANNUAL ENERGY', 'Click "Age +1 Year" or rest to recharge stamina.', 'warning');
        return prev;
      }

      const stats = { ...prev.stats, energy: prev.stats.energy - 20 };
      const newLogs = [...prev.lifeLog];

      if (action === 'study_hard') {
        stats.smarts = Math.min(100, stats.smarts + 5);
        stats.happiness = Math.max(0, stats.happiness - 2);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Studied Meticulously',
          description: 'Spent late nights reading textbooks and mastering technical subjects.',
          category: 'education',
        });
      } else if (action === 'work_hard') {
        if (prev.currentJob) {
          const updatedJob = {
            ...prev.currentJob,
            performance: Math.min(100, prev.currentJob.performance + 12),
          };
          stats.health = Math.max(0, stats.health - 3);
          newLogs.push({
            age: prev.age,
            year: prev.birthYear + prev.age,
            title: 'Logged Significant Overtime',
            description: 'Put in 60-hour workweeks to impress leadership.',
            category: 'career',
          });
          return { ...prev, stats, currentJob: updatedJob, lifeLog: newLogs };
        }
      } else if (action === 'gym_workout') {
        stats.health = Math.min(100, stats.health + 4);
        stats.looks = Math.min(100, stats.looks + 3);
        stats.happiness = Math.min(100, stats.happiness + 3);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Hit the Gym for Strength Training',
          description: 'Completed a high-intensity workout and drank protein shake.',
          category: 'health',
        });
      } else if (action === 'spend_time_family') {
        stats.happiness = Math.min(100, stats.happiness + 8);
        stats.karma = Math.min(100, stats.karma + 3);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Family Gathering & Bonding',
          description: 'Cooked dinner with family members and laughed together.',
          category: 'love',
        });
      } else if (action === 'relax_meditate') {
        stats.happiness = Math.min(100, stats.happiness + 10);
        stats.health = Math.min(100, stats.health + 2);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Mindful Meditation & Rest',
          description: 'Practiced deep diaphragmatic breathing and felt at peace.',
          category: 'health',
        });
      }

      return { ...prev, stats, lifeLog: newLogs };
    });
  };

  // Handle Real Persona Life Simulation Actions (Walk, Run, Eat, Study, Work, Gym, Sleep)
  const handlePersonaAction = (actionType: string, payload?: any) => {
    setCharacter((prev) => {
      let stats = { ...prev.stats };
      let money = prev.money;
      let newLogs = [...prev.lifeLog];
      let currentJob = prev.currentJob ? { ...prev.currentJob } : undefined;

      if (actionType === 'eat') {
        const item = payload || { cost: 15, energy: 35, happiness: 8, smarts: 0, health: 0, name: 'Gourmet Meal' };
        if (money >= item.cost) {
          money -= item.cost;
        }
        stats.energy = Math.min(100, stats.energy + (item.energy || 25));
        stats.happiness = Math.min(100, stats.happiness + (item.happiness || 5));
        if (item.health) stats.health = Math.min(100, Math.max(0, stats.health + item.health));
        if (item.smarts) stats.smarts = Math.min(100, stats.smarts + item.smarts);

        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: `Dined at Bistro: ${item.name}`,
          description: `Enjoyed a delicious meal in the district square.`,
          category: 'health',
        });
      } else if (actionType === 'study') {
        stats.smarts = Math.min(100, stats.smarts + 5);
        stats.energy = Math.max(0, stats.energy - 8);
        stats.happiness = Math.min(100, stats.happiness + 2);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Attended Lectures at University',
          description: 'Engaged actively in academic lectures and library research.',
          category: 'education',
        });
      } else if (actionType === 'work') {
        const wage = currentJob ? Math.round(currentJob.currentSalary / 250) : 180;
        money += wage;
        stats.energy = Math.max(0, stats.energy - 12);
        if (currentJob) {
          currentJob.performance = Math.min(100, currentJob.performance + 8);
        }
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Completed Corporate Work Shift',
          description: `Delivered high-value project sprint and earned ${prev.country.currencySymbol}${wage} wages.`,
          category: 'career',
        });
      } else if (actionType === 'workout') {
        stats.health = Math.min(100, stats.health + 5);
        stats.looks = Math.min(100, stats.looks + 4);
        stats.energy = Math.max(0, stats.energy - 15);
        stats.happiness = Math.min(100, stats.happiness + 5);
        newLogs.push({
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: 'Cardio & Strength Workout',
          description: 'Ran laps on the athletic track and lifted compound weights.',
          category: 'health',
        });
      } else if (actionType === 'sleep') {
        stats.energy = 100;
        stats.happiness = Math.min(100, stats.happiness + 6);
      } else if (actionType === 'meditate') {
        stats.karma = Math.min(100, stats.karma + 4);
        stats.happiness = Math.min(100, stats.happiness + 8);
      }

      return {
        ...prev,
        stats,
        money,
        currentJob,
        lifeLog: newLogs,
      };
    });
  };

  // Start New Life
  const handleStartNewLife = (config?: {
    firstName: string;
    lastName: string;
    gender: Gender;
    country: CountryInfo;
    mission?: LifeMission;
  }) => {
    const newChar = createNewCharacter(config, 1, 0);
    setCharacter(newChar);
    setIsNewGameOpen(false);
    setActiveTab('dashboard');
  };

  // Unlock RPG Perk
  const handleUnlockPerk = (perkId: string) => {
    setCharacter((prev) => {
      const perk = LIFE_PERKS.find((p) => p.id === perkId);
      if (!perk || (prev.unlockedPerks && prev.unlockedPerks.includes(perkId))) return prev;
      if (prev.perkPoints < perk.costPoints) return prev;

      const updatedUnlocked = [...(prev.unlockedPerks || []), perkId];
      const stats = { ...prev.stats };
      let money = prev.money;

      if (perkId === 'perk_silver_tongue') stats.looks = Math.min(100, stats.looks + 5);
      if (perkId === 'perk_genius_cognition') stats.smarts = Math.min(100, stats.smarts + 8);
      if (perkId === 'perk_iron_lungs') stats.health = Math.min(100, stats.health + 10);
      if (perkId === 'perk_endless_stamina') stats.energy = 100;

      const newLogs: LifeLogEntry[] = [
        ...prev.lifeLog,
        {
          age: prev.age,
          year: prev.birthYear + prev.age,
          title: `Unlocked Perk: ${perk.name}`,
          description: `Acquired permanent life perk: "${perk.name}" (${perk.description})!`,
          category: 'milestone',
          isSignificant: true,
        },
      ];

      return {
        ...prev,
        stats,
        money,
        perkPoints: prev.perkPoints - perk.costPoints,
        unlockedPerks: updatedUnlocked,
        lifeLog: newLogs,
      };
    });
  };

  // Continue As Child (Generational Inheritance)
  const handleContinueAsChild = (child: PersonRelation) => {
    const inheritedEstate = Math.floor(netWorth);
    const newChar = createNewCharacter(
      {
        firstName: child.name.split(' ')[0],
        lastName: character.lastName,
        gender: child.gender,
        country: character.country,
      },
      character.generation + 1,
      inheritedEstate
    );
    newChar.age = child.age;
    newChar.lifeLog.push({
      age: child.age,
      year: character.birthYear + character.age,
      title: 'Inherited Family Dynasty',
      description: `Inherited your parent's estate of ${character.country.currencySymbol}${inheritedEstate.toLocaleString()} to continue Generation ${character.generation + 1}!`,
      category: 'milestone',
      isSignificant: true,
    });

    setCharacter(newChar);
    setActiveTab('dashboard');
  };

  // Nav items
  const navTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'career', label: 'Career & Edu', icon: Briefcase },
    { id: 'assets', label: 'Real Estate & Cars', icon: Home },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'relationships', label: 'Family & Love', icon: Heart },
    { id: 'health', label: 'Health & Lifestyle', icon: Activity },
    { id: 'lifelog', label: '100-Yr Life Log', icon: BookmarkCheck },
  ];

  return (
    <div className="min-h-screen bg-[#0d071a] text-neutral-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white relative">
      {/* GTA Vice City Floating Notification Banner */}
      {viceToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl border-2 text-center backdrop-blur-md max-w-md ${
              viceToast.type === 'danger'
                ? 'bg-gradient-to-r from-rose-950/95 via-red-900/95 to-rose-950/95 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                : viceToast.type === 'warning'
                ? 'bg-gradient-to-r from-amber-950/95 via-yellow-900/95 to-amber-950/95 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-to-r from-pink-900/95 via-fuchsia-900/95 to-purple-950/95 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.7)]'
            }`}
          >
            <div className="text-base sm:text-lg font-black text-white uppercase tracking-wider drop-shadow-md">
              {viceToast.title}
            </div>
            {viceToast.description && (
              <div className="text-xs text-neutral-200 font-bold font-mono mt-1">
                {viceToast.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header & Interactive Stats Bar */}
      <TopStatsBar
        character={character}
        onAgeUp={handleAgeUp}
        isAutoPlaying={isAutoPlaying}
        onToggleAutoPlay={() => setIsAutoPlaying((p) => !p)}
        onNewGame={() => setIsNewGameOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(sounds.toggleMute())}
        netWorth={netWorth}
      />

      {/* 100-Year Life Century Milestone Timeline & RPG Progression HUD */}
      <CenturyTimelineBar
        character={character}
        onOpenQuestModal={() => setIsQuestModalOpen(true)}
        onOpenPerksModal={() => setIsPerksModalOpen(true)}
        onOpenEraModal={() => setIsEraModalOpen(true)}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs Header */}
        <nav
          id="main-navigation-tabs"
          className="flex items-center gap-1.5 overflow-x-auto bg-neutral-950/90 backdrop-blur-md p-1.5 rounded-2xl border border-fuchsia-500/30 shadow-2xl custom-scrollbar"
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-pink-400/50'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content Display */}
        {character.isAlive ? (
          <div>
            {activeTab === 'dashboard' && (
              <DashboardTab
                character={character}
                onQuickAction={handleQuickAction}
                onPersonaAction={handlePersonaAction}
                onNavigateTab={(t) => setActiveTab(t)}
                netWorth={netWorth}
              />
            )}

            {activeTab === 'career' && (
              <CareerTab
                character={character}
                onEnrollDegree={(deg, payUpfront) => {
                  sounds.playCash();
                  setCharacter((prev) => {
                    let money = prev.money;
                    let debt = prev.bankDebt;
                    if (payUpfront) money -= deg.annualTuition;
                    else debt += deg.annualTuition * deg.durationYears;

                    return {
                      ...prev,
                      money,
                      bankDebt: debt,
                      currentEnrollment: {
                        degree: deg,
                        currentYear: 1,
                        totalYears: deg.durationYears,
                      },
                      lifeLog: [
                        ...prev.lifeLog,
                        {
                          age: prev.age,
                          year: prev.birthYear + prev.age,
                          title: `Enrolled in ${deg.name}`,
                          description: `Started your ${deg.durationYears}-year academic program in ${deg.field}.`,
                          category: 'education',
                        },
                      ],
                    };
                  });
                }}
                onApplyJob={(job) => {
                  sounds.playFanfare();
                  setCharacter((prev) => ({
                    ...prev,
                    currentJob: {
                      job,
                      yearsInRole: 0,
                      currentSalary: job.baseSalary,
                      performance: 75,
                      hoursOvertime: 0,
                    },
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Hired as ${job.title}!`,
                        description: `Joined the company with starting salary of ${prev.country.currencySymbol}${job.baseSalary.toLocaleString()}/yr.`,
                        category: 'career',
                        isSignificant: true,
                      },
                    ],
                  }));
                }}
                onJobAction={(action) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    if (!prev.currentJob && action !== 'study_hard' && action !== 'drop_out') return prev;
                    if (action === 'work_overtime') {
                      return {
                        ...prev,
                        stats: { ...prev.stats, health: Math.max(0, prev.stats.health - 4) },
                        currentJob: {
                          ...prev.currentJob!,
                          performance: Math.min(100, prev.currentJob!.performance + 15),
                        },
                      };
                    }
                    if (action === 'ask_raise') {
                      if (prev.currentJob!.performance >= 75) {
                        sounds.playCash();
                        const boost = Math.round(prev.currentJob!.currentSalary * 0.12);
                        showViceToast('RAISE APPROVED!', `Salary increased by +${prev.country.currencySymbol}${boost.toLocaleString()}/yr!`, 'success');
                        return {
                          ...prev,
                          currentJob: {
                            ...prev.currentJob!,
                            currentSalary: prev.currentJob!.currentSalary + boost,
                          },
                        };
                      } else {
                        showViceToast('COMPENSATION REVIEW DENIED', 'Raise your annual job performance before requesting a raise.', 'warning');
                        return prev;
                      }
                    }
                    if (action === 'seek_promotion') {
                      if (prev.currentJob!.performance >= 85) {
                        sounds.playFanfare();
                        showViceToast('PROMOTED!', 'You climbed to the next senior rank with increased salary and perks!', 'success');
                        return {
                          ...prev,
                          currentJob: {
                            ...prev.currentJob!,
                            currentSalary: Math.round(prev.currentJob!.currentSalary * 1.3),
                            performance: 80,
                          },
                        };
                      } else {
                        showViceToast('PROMOTION DENIED', 'Excel in your duties and boost performance first!', 'warning');
                        return prev;
                      }
                    }
                    if (action === 'resign') {
                      return { ...prev, currentJob: undefined };
                    }
                    if (action === 'study_hard') {
                      return {
                        ...prev,
                        stats: { ...prev.stats, smarts: Math.min(100, prev.stats.smarts + 6) },
                      };
                    }
                    if (action === 'drop_out') {
                      return { ...prev, currentEnrollment: undefined };
                    }
                    return prev;
                  });
                }}
                onLaunchStartup={(business) => {
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money - 15000,
                    startup: business,
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Incorporated Startup: ${business.name}`,
                        description: `Founded a high-growth ${business.industry} enterprise.`,
                        category: 'career',
                        isSignificant: true,
                      },
                    ],
                  }));
                }}
                onManageStartup={(action) => {
                  sounds.playCash();
                  setCharacter((prev) => {
                    if (!prev.startup) return prev;
                    const st = { ...prev.startup };
                    let money = prev.money;

                    if (action === 'marketing') {
                      if (money < 10000) {
                        showViceToast('INSUFFICIENT FUNDS', 'At least $10,000 required for advertising and PR campaign.', 'danger');
                        return prev;
                      }
                      money -= 10000;
                      st.annualRevenue = Math.round(st.annualRevenue * 1.4);
                      st.valuation = Math.round(st.valuation * 1.5);
                    } else if (action === 'hire') {
                      if (money < 20000) {
                        showViceToast('INSUFFICIENT FUNDS', 'At least $20,000 required to recruit executives.', 'danger');
                        return prev;
                      }
                      money -= 20000;
                      st.employees += 5;
                      st.marketShare = Math.min(100, st.marketShare + 10);
                      st.valuation = Math.round(st.valuation * 1.6);
                    } else if (action === 'sell_company') {
                      const exitPayout = st.valuation;
                      money += exitPayout;
                      confetti({ particleCount: 150, spread: 90 });
                      showViceToast('SUCCESSFUL IPO EXIT! 🎉', `You sold your company for ${prev.country.currencySymbol}${exitPayout.toLocaleString()}!`, 'success');
                      return {
                        ...prev,
                        money,
                        startup: undefined,
                        lifeLog: [
                          ...prev.lifeLog,
                          {
                            age: prev.age,
                            year: prev.birthYear + prev.age,
                            title: `Sold Company: ${st.name}`,
                            description: `Exited for a massive buyout of ${prev.country.currencySymbol}${exitPayout.toLocaleString()}.`,
                            category: 'finance',
                            isSignificant: true,
                          },
                        ],
                      };
                    }

                    return { ...prev, money, startup: st };
                  });
                }}
                onSideHustle={(type) => {
                  sounds.playCash();
                  setCharacter((prev) => {
                    const pay = type === 'content_creator' ? 450 : type === 'tutoring' ? 800 : 350;
                    return {
                      ...prev,
                      money: prev.money + pay,
                      stats: { ...prev.stats, energy: Math.max(0, prev.stats.energy - 10) },
                    };
                  });
                }}
              />
            )}

            {activeTab === 'assets' && (
              <AssetsTab
                character={character}
                onBuyProperty={(prop) => {
                  sounds.playCash();
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money - prop.purchasePrice,
                    properties: [
                      ...prev.properties,
                      {
                        ...prop,
                        condition: 100,
                        isRentedOut: false,
                        boughtAtAge: prev.age,
                      },
                    ],
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Purchased ${prop.name}`,
                        description: `Acquired real estate property for ${prev.country.currencySymbol}${prop.purchasePrice.toLocaleString()}.`,
                        category: 'asset',
                        isSignificant: true,
                      },
                    ],
                  }));
                }}
                onManageProperty={(propId, action) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    const props = [...prev.properties];
                    const target = props.find((p) => p.id === propId);
                    if (!target) return prev;

                    if (action === 'toggle_rent') {
                      target.isRentedOut = !target.isRentedOut;
                    } else if (action === 'renovate') {
                      if (prev.money < 8000) {
                        showViceToast('INSUFFICIENT FUNDS', 'Not enough cash for property renovation ($8,000 required).', 'danger');
                        return prev;
                      }
                      target.condition = 100;
                      target.purchasePrice = Math.round(target.purchasePrice * 1.15);
                      return { ...prev, money: prev.money - 8000, properties: props };
                    } else if (action === 'sell') {
                      sounds.playCash();
                      const sellPrice = target.purchasePrice;
                      return {
                        ...prev,
                        money: prev.money + sellPrice,
                        properties: props.filter((p) => p.id !== propId),
                      };
                    }

                    return { ...prev, properties: props };
                  });
                }}
                onBuyVehicle={(veh) => {
                  sounds.playCash();
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money - veh.purchasePrice,
                    vehicles: [
                      ...prev.vehicles,
                      {
                        ...veh,
                        condition: 100,
                        boughtAtAge: prev.age,
                      },
                    ],
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Bought ${veh.name}`,
                        description: `Purchased new vehicle for ${prev.country.currencySymbol}${veh.purchasePrice.toLocaleString()}.`,
                        category: 'asset',
                      },
                    ],
                  }));
                }}
                onManageVehicle={(vehId, action) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    const vehs = [...prev.vehicles];
                    const target = vehs.find((v) => v.id === vehId);
                    if (!target) return prev;

                    if (action === 'joyride') {
                      return {
                        ...prev,
                        stats: {
                          ...prev.stats,
                          happiness: Math.min(100, prev.stats.happiness + 6),
                          looks: Math.min(100, prev.stats.looks + 2),
                        },
                      };
                    } else if (action === 'maintain') {
                      target.condition = 100;
                      return { ...prev, money: prev.money - target.annualMaintenance, vehicles: vehs };
                    } else if (action === 'sell') {
                      sounds.playCash();
                      return {
                        ...prev,
                        money: prev.money + Math.round(target.purchasePrice * (target.condition / 100)),
                        vehicles: vehs.filter((v) => v.id !== vehId),
                      };
                    }

                    return { ...prev, vehicles: vehs };
                  });
                }}
              />
            )}

            {activeTab === 'investments' && (
              <InvestmentsTab
                character={character}
                onBuyStock={(stockId, shares) => {
                  setCharacter((prev) => {
                    const st = prev.stocks.map((s) => {
                      if (s.id === stockId) {
                        return { ...s, sharesOwned: s.sharesOwned + shares };
                      }
                      return s;
                    });
                    const target = prev.stocks.find((s) => s.id === stockId);
                    const cost = (target?.currentPrice || 0) * shares;
                    return { ...prev, money: prev.money - cost, stocks: st };
                  });
                }}
                onSellStock={(stockId, shares) => {
                  setCharacter((prev) => {
                    const target = prev.stocks.find((s) => s.id === stockId);
                    if (!target || target.sharesOwned < shares) return prev;
                    const revenue = target.currentPrice * shares;
                    const st = prev.stocks.map((s) => {
                      if (s.id === stockId) {
                        return { ...s, sharesOwned: s.sharesOwned - shares };
                      }
                      return s;
                    });
                    return { ...prev, money: prev.money + revenue, stocks: st };
                  });
                }}
                onBuyCrypto={(cryptoId, amt) => {
                  setCharacter((prev) => {
                    const target = prev.cryptos.find((c) => c.id === cryptoId);
                    if (!target || prev.money < amt) return prev;
                    const coins = amt / target.currentPrice;
                    const cr = prev.cryptos.map((c) => {
                      if (c.id === cryptoId) {
                        return { ...c, coinsOwned: c.coinsOwned + coins };
                      }
                      return c;
                    });
                    return { ...prev, money: prev.money - amt, cryptos: cr };
                  });
                }}
                onSellCrypto={(cryptoId, amt) => {
                  setCharacter((prev) => {
                    const target = prev.cryptos.find((c) => c.id === cryptoId);
                    if (!target || target.coinsOwned <= 0) return prev;
                    const revenue = target.coinsOwned * target.currentPrice;
                    const cr = prev.cryptos.map((c) => {
                      if (c.id === cryptoId) {
                        return { ...c, coinsOwned: 0 };
                      }
                      return c;
                    });
                    return { ...prev, money: prev.money + revenue, cryptos: cr };
                  });
                }}
                onBorrowLoan={(amt) => {
                  sounds.playCash();
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money + amt,
                    bankDebt: prev.bankDebt + amt,
                  }));
                }}
                onRepayLoan={(amt) => {
                  sounds.playCash();
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money - amt,
                    bankDebt: Math.max(0, prev.bankDebt - amt),
                  }));
                }}
              />
            )}

            {activeTab === 'relationships' && (
              <RelationshipsTab
                character={character}
                datingCandidates={datingCandidates}
                onFindDate={() => {
                  sounds.playClick();
                  const firsts = character.gender === 'male' ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
                  const candGender: Gender = character.gender === 'male' ? 'female' : 'male';
                  const occupations = ['Doctor', 'Software Engineer', 'Artist', 'Architect', 'Attorney', 'Teacher', 'Entrepreneur'];
                  const cands: PersonRelation[] = [1, 2, 3].map((i) => ({
                    id: `cand_${Date.now()}_${i}`,
                    name: `${firsts[Math.floor(Math.random() * firsts.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
                    type: 'Partner',
                    gender: candGender,
                    age: Math.max(18, character.age + Math.floor(Math.random() * 6 - 3)),
                    affinity: Math.floor(Math.random() * 30) + 70,
                    status: 'Alive',
                    isAlive: true,
                    avatarSeed: `partner_${i}`,
                    occupation: occupations[Math.floor(Math.random() * occupations.length)],
                  }));
                  setDatingCandidates(cands);
                }}
                onSelectDate={(partner) => {
                  sounds.playFanfare();
                  setCharacter((prev) => ({
                    ...prev,
                    partnerId: partner.id,
                    relationships: [...prev.relationships, partner],
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Started Dating ${partner.name}`,
                        description: `Sparked a romantic connection with ${partner.name} (${partner.occupation}).`,
                        category: 'love',
                        isSignificant: true,
                      },
                    ],
                  }));
                  setDatingCandidates([]);
                }}
                onPropose={() => {
                  sounds.playFanfare();
                  confetti({ particleCount: 100, spread: 80 });
                  setCharacter((prev) => ({
                    ...prev,
                    isMarried: true,
                    stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 20) },
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: 'Tied the Knot in Marriage! 💍',
                        description: 'Held a grand wedding celebration with loved ones and exchanged vows.',
                        category: 'love',
                        isSignificant: true,
                      },
                    ],
                  }));
                }}
                onHaveBaby={() => {
                  sounds.playFanfare();
                  confetti({ particleCount: 90, spread: 70 });
                  const isBabyBoy = Math.random() > 0.5;
                  const babyGender: Gender = isBabyBoy ? 'male' : 'female';
                  const babyFirst = isBabyBoy
                    ? FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)]
                    : FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)];
                  const babyName = `${babyFirst} ${character.lastName}`;

                  const child: PersonRelation = {
                    id: `child_${Date.now()}`,
                    name: babyName,
                    type: 'Child',
                    gender: babyGender,
                    age: 0,
                    affinity: 100,
                    status: 'Alive',
                    isAlive: true,
                    avatarSeed: 'baby',
                  };

                  setCharacter((prev) => ({
                    ...prev,
                    relationships: [...prev.relationships, child],
                    stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 25) },
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Welcomed Baby ${babyName}! 👶`,
                        description: `Your child ${babyName} was born into the family!`,
                        category: 'love',
                        isSignificant: true,
                      },
                    ],
                  }));
                }}
                onAdoptPet={(species, name) => {
                  const pet: PersonRelation = {
                    id: `pet_${Date.now()}`,
                    name,
                    type: 'Pet',
                    gender: 'male',
                    age: 1,
                    affinity: 100,
                    status: 'Alive',
                    isAlive: true,
                    avatarSeed: 'pet',
                    petSpecies: species,
                  };
                  setCharacter((prev) => ({
                    ...prev,
                    relationships: [...prev.relationships, pet],
                    stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 15) },
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Adopted ${name} the ${species}`,
                        description: `Brought home a loyal animal companion.`,
                        category: 'love',
                      },
                    ],
                  }));
                }}
                onInteract={(personId, action) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    const rels = [...prev.relationships];
                    const target = rels.find((r) => r.id === personId);
                    if (!target) return prev;

                    let money = prev.money;
                    let happiness = prev.stats.happiness;

                    if (action === 'date' || action === 'spend_time') {
                      target.affinity = Math.min(100, target.affinity + 8);
                      happiness = Math.min(100, happiness + 5);
                    } else if (action === 'gift') {
                      if (money >= 500) {
                        money -= 500;
                        target.affinity = Math.min(100, target.affinity + 15);
                      }
                    } else if (action === 'ask_money') {
                      money += 150;
                      target.affinity = Math.max(0, target.affinity - 5);
                    } else if (action === 'breakup') {
                      return {
                        ...prev,
                        partnerId: undefined,
                        isMarried: false,
                        relationships: rels.filter((r) => r.id !== personId),
                      };
                    } else if (action === 'give_allowance') {
                      if (money >= 100) {
                        money -= 100;
                        target.affinity = Math.min(100, target.affinity + 10);
                      }
                    }

                    return {
                      ...prev,
                      money,
                      stats: { ...prev.stats, happiness },
                      relationships: rels,
                    };
                  });
                }}
              />
            )}

            {activeTab === 'health' && (
              <HealthLifestyleTab
                character={character}
                onSelectDiet={(diet) => setCharacter((prev) => ({ ...prev, diet }))}
                onToggleGym={() => setCharacter((prev) => ({ ...prev, gymMembership: !prev.gymMembership }))}
                onDoctorAction={(action) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    let health = prev.stats.health;
                    let looks = prev.stats.looks;
                    let happiness = prev.stats.happiness;
                    let money = prev.money;
                    let diseases = [...prev.diseases];

                    if (action === 'checkup') {
                      money -= 200;
                      health = Math.min(100, health + 8);
                    } else if (action === 'treat_illness') {
                      money -= 600;
                      diseases = [];
                      health = Math.min(100, health + 20);
                    } else if (action === 'plastic_surgery') {
                      money -= 8000;
                      looks = Math.min(100, looks + 25);
                      sounds.playFanfare();
                    } else if (action === 'therapy') {
                      money -= 150;
                      happiness = Math.min(100, happiness + 15);
                    }

                    return {
                      ...prev,
                      money,
                      diseases,
                      stats: { ...prev.stats, health, looks, happiness },
                    };
                  });
                }}
                onGoVacation={(type, cost) => {
                  sounds.playFanfare();
                  confetti({ particleCount: 80, spread: 70 });
                  setCharacter((prev) => ({
                    ...prev,
                    money: prev.money - cost,
                    stats: {
                      ...prev.stats,
                      happiness: Math.min(100, prev.stats.happiness + 25),
                      health: Math.min(100, prev.stats.health + 10),
                    },
                    lifeLog: [
                      ...prev.lifeLog,
                      {
                        age: prev.age,
                        year: prev.birthYear + prev.age,
                        title: `Traveled on Vacation`,
                        description: `Enjoyed an unforgettable holiday trip across scenic destinations.`,
                        category: 'milestone',
                      },
                    ],
                  }));
                }}
                onHobbyAction={(hobby) => {
                  sounds.playClick();
                  setCharacter((prev) => {
                    const stats = { ...prev.stats };
                    let money = prev.money;
                    if (hobby === 'guitar') {
                      stats.smarts = Math.min(100, stats.smarts + 3);
                      stats.happiness = Math.min(100, stats.happiness + 5);
                    } else if (hobby === 'martial_arts') {
                      stats.health = Math.min(100, stats.health + 5);
                      stats.looks = Math.min(100, stats.looks + 2);
                    } else if (hobby === 'volunteer') {
                      stats.karma = Math.min(100, stats.karma + 10);
                      stats.happiness = Math.min(100, stats.happiness + 6);
                    } else if (hobby === 'pilot') {
                      money -= 3000;
                      stats.smarts = Math.min(100, stats.smarts + 8);
                      stats.fame = Math.min(100, stats.fame + 10);
                    }
                    return { ...prev, money, stats };
                  });
                }}
                onCrimeAction={(crime) => {
                  sounds.playClick();
                  const caughtChance = crime === 'bank_heist' ? 0.65 : crime === 'shoplift' ? 0.35 : 0.15;
                  const reward = crime === 'bank_heist' ? 100000 : crime === 'shoplift' ? 2500 : 200;

                  if (Math.random() < caughtChance) {
                    sounds.playHeartbeat();
                    showViceToast('🚔 BUSTED / ARRESTED!', 'Police apprehended you at the scene! Paid heavy court fines & bail.', 'danger');
                    setCharacter((prev) => ({
                      ...prev,
                      money: Math.max(0, prev.money - reward * 1.5),
                      stats: {
                        ...prev.stats,
                        happiness: Math.max(0, prev.stats.happiness - 20),
                        karma: Math.max(0, prev.stats.karma - 15),
                      },
                    }));
                  } else {
                    sounds.playCash();
                    showViceToast('😈 HEIST SUCCESSFUL!', `You escaped clean with ${character.country.currencySymbol}${reward.toLocaleString()}!`, 'success');
                    setCharacter((prev) => ({
                      ...prev,
                      money: prev.money + reward,
                      stats: { ...prev.stats, karma: Math.max(0, prev.stats.karma - 10) },
                    }));
                  }
                }}
                onOpenCasino={() => setIsCasinoOpen(true)}
              />
            )}

            {activeTab === 'lifelog' && <LifeLogTab character={character} />}
          </div>
        ) : (
          <DeathScreen
            character={character}
            onStartNewLife={() => setIsNewGameOpen(true)}
            onContinueAsChild={handleContinueAsChild}
            netWorth={netWorth}
          />
        )}
      </main>

      {/* Dilemma Modal */}
      {currentDilemma && (
        <DilemmaModal
          dilemma={currentDilemma}
          character={character}
          onResolve={handleResolveDilemma}
        />
      )}

      {/* Casino Mini Game Modal */}
      <CasinoModal
        isOpen={isCasinoOpen}
        onClose={() => setIsCasinoOpen(false)}
        character={character}
        onUpdateMoney={(amt, reason) => {
          setCharacter((prev) => ({
            ...prev,
            money: prev.money + amt,
            lifeLog:
              amt > 1000
                ? [
                    ...prev.lifeLog,
                    {
                      age: prev.age,
                      year: prev.birthYear + prev.age,
                      title: 'Casino / Lottery Win',
                      description: reason,
                      category: 'finance',
                    },
                  ]
                : prev.lifeLog,
          }));
        }}
      />

      {/* Character Creation Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onStartGame={handleStartNewLife}
      />

      {/* 100-Year Life Quest Book Modal */}
      <MissionQuestModal
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        character={character}
      />

      {/* RPG Skill Perks Modal */}
      <LifePerksModal
        isOpen={isPerksModalOpen}
        onClose={() => setIsPerksModalOpen(false)}
        character={character}
        onUnlockPerk={handleUnlockPerk}
      />

      {/* 100-Year Historical Eras & Future Chronicles Modal */}
      <EraChroniclesModal
        isOpen={isEraModalOpen}
        onClose={() => setIsEraModalOpen(false)}
        character={character}
      />

      {/* Century Victory (100 Years of Life) Celebration Modal */}
      <CenturyVictoryModal
        isOpen={isCenturyVictoryOpen}
        onClose={() => setIsCenturyVictoryOpen(false)}
        character={character}
        netWorth={netWorth}
        onRebirth={() => {
          setIsCenturyVictoryOpen(false);
          setIsNewGameOpen(true);
        }}
      />
    </div>
  );
}

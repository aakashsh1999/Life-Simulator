export type Gender = 'male' | 'female' | 'non-binary';

export interface CountryInfo {
  id: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  costMultiplier: number;
  baseHappiness: number;
  perk: string;
}

export interface CharacterStats {
  health: number;    // 0 - 100
  happiness: number; // 0 - 100
  smarts: number;    // 0 - 100
  looks: number;     // 0 - 100
  karma: number;     // 0 - 100
  fame: number;      // 0 - 100
  energy: number;    // 0 - 100 (resets yearly)
}

export type EducationLevel = 
  | 'none' 
  | 'elementary' 
  | 'high_school' 
  | 'trade_school' 
  | 'undergraduate' 
  | 'master' 
  | 'doctorate' 
  | 'medical_school' 
  | 'law_school';

export interface Degree {
  id: string;
  name: string;
  field: string;
  level: EducationLevel;
  durationYears: number;
  annualTuition: number;
  minSmarts: number;
  salaryBoost: number;
}

export interface Job {
  id: string;
  title: string;
  category: 'Corporate' | 'Tech' | 'Healthcare' | 'Law' | 'Creative' | 'Service' | 'Trades' | 'Executive' | 'Crime';
  requiredEducation: EducationLevel;
  requiredSmarts: number;
  requiredLooks?: number;
  experienceNeeded: number; // in years
  baseSalary: number;
  promotionTo?: string; // Job id
  stressLevel: number; // 1 - 10
  hoursPerWeek: number;
  description: string;
  iconName: string;
}

export interface ActiveJob {
  job: Job;
  yearsInRole: number;
  currentSalary: number;
  performance: number; // 0 - 100
  hoursOvertime: number;
}

export interface RealEstate {
  id: string;
  name: string;
  type: 'Apartment' | 'House' | 'Penthouse' | 'Villa' | 'Mansion' | 'Castle' | 'Island' | 'Commercial';
  purchasePrice: number;
  annualMaintenance: number;
  annualPropertyTax: number;
  condition: number; // 0 - 100
  isRentedOut: boolean;
  rentalIncomeAnnual?: number;
  boughtAtAge: number;
  image: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Bicycle' | 'Motorcycle' | 'Economy Car' | 'Luxury Sedan' | 'Sports Car' | 'Supercar' | 'Classic Car' | 'Yacht' | 'Private Jet';
  purchasePrice: number;
  annualMaintenance: number;
  condition: number; // 0 - 100
  speedRating: number;
  boughtAtAge: number;
}

export interface StockAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'Tech' | 'Finance' | 'Clean Energy' | 'Index ETF' | 'Pharma';
  currentPrice: number;
  sharesOwned: number;
  avgBuyPrice: number;
  history: number[]; // past 10 years prices
  volatility: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  coinsOwned: number;
  avgBuyPrice: number;
  history: number[];
  volatility: number;
}

export type RelationshipType = 'Father' | 'Mother' | 'Sibling' | 'Friend' | 'Partner' | 'Spouse' | 'Child' | 'Pet';

export interface PersonRelation {
  id: string;
  name: string;
  type: RelationshipType;
  gender: Gender;
  age: number;
  affinity: number; // 0 - 100
  status: 'Alive' | 'Deceased';
  isAlive: boolean;
  avatarSeed: string;
  petSpecies?: string;
  occupation?: string;
}

export interface DilemmaChoice {
  text: string;
  statChanges: Partial<CharacterStats>;
  moneyChange?: number;
  karmaChange?: number;
  outcomeText: string;
  requiresSmarts?: number;
  requiresMoney?: number;
  riskFactor?: number; // 0 to 1 chance of failure
  failureOutcome?: {
    statChanges: Partial<CharacterStats>;
    moneyChange?: number;
    outcomeText: string;
  };
}

export interface Dilemma {
  id: string;
  title: string;
  prompt: string;
  minAge: number;
  maxAge: number;
  category: 'School' | 'Career' | 'Family' | 'Love' | 'Ethics' | 'Health' | 'Finance' | 'Random' | 'Crisis';
  choices: DilemmaChoice[];
}

export interface LifeLogEntry {
  age: number;
  year: number;
  title: string;
  description: string;
  category: 'milestone' | 'career' | 'education' | 'love' | 'asset' | 'health' | 'finance' | 'general' | 'crime';
  isSignificant?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wealth' | 'age' | 'career' | 'family' | 'lifestyle';
  unlocked: boolean;
  unlockedAtAge?: number;
}

export type LifeStage =
  | 'infancy'      // 0 - 5
  | 'childhood'    // 6 - 12
  | 'youth'        // 13 - 17
  | 'young_adult'  // 18 - 29
  | 'prime_adult'  // 30 - 49
  | 'senior'       // 50 - 69
  | 'golden_elder' // 70 - 89
  | 'centenarian'; // 90 - 100+

export interface MissionMilestone {
  id: string;
  stage: LifeStage;
  minAge: number;
  maxAge: number;
  title: string;
  description: string;
  icon: string;
  targetType: 'stat' | 'money' | 'career' | 'education' | 'asset' | 'family' | 'age' | 'special';
  targetKey?: string;
  targetValue?: number;
  xpReward: number;
  cashReward?: number;
  completed: boolean;
  completedAtAge?: number;
  completedAtYear?: number;
}

export interface LifeMission {
  id: string;
  title: string;
  subtitle: string;
  category: 'tech_titan' | 'zen_centenarian' | 'wealth_tycoon' | 'superstar_icon' | 'healer_humanitarian' | 'dynasty_patriarch';
  icon: string;
  description: string;
  destinyPerk: string;
  milestones: MissionMilestone[];
  isCompleted: boolean;
  completedAtAge?: number;
}

export interface LifePerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  costPoints: number;
  isUnlocked: boolean;
  category: 'wealth' | 'health' | 'career' | 'mind' | 'longevity';
  effectType: 'health_boost' | 'salary_boost' | 'smarts_boost' | 'market_luck' | 'energy_bonus' | 'longevity_shield';
  magnitude: number;
}

export interface EraInfo {
  startYear: number;
  endYear: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  technologyTrend: string;
  marketFlavor: string;
}

export interface StartupBusiness {
  name: string;
  industry: 'Tech' | 'E-commerce' | 'Food & Beverage' | 'Fashion' | 'AI' | 'BioTech';
  valuation: number;
  annualRevenue: number;
  annualProfit: number;
  employees: number;
  marketShare: number; // 0 - 100
  yearsActive: number;
}

export interface Character {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  birthYear: number;
  country: CountryInfo;
  stats: CharacterStats;
  money: number;
  bankDebt: number;
  hasDriverLicense: boolean;
  
  // Mission & RPG Progression
  level: number;
  currentXp: number;
  nextLevelXp: number;
  perkPoints: number;
  activeMission: LifeMission;
  unlockedPerks: string[]; // Perk IDs
  centuryMilestoneReached: boolean;
  centuryCelebrated: boolean;
  
  // Education & Work
  education: EducationLevel;
  currentEnrollment?: {
    degree: Degree;
    currentYear: number;
    totalYears: number;
  };
  degrees: Degree[];
  currentJob?: ActiveJob;
  jobHistory: { title: string; yearsWorked: number; finalSalary: number }[];
  isRetired: boolean;
  startup?: StartupBusiness;

  // Assets
  properties: RealEstate[];
  vehicles: Vehicle[];
  stocks: StockAsset[];
  cryptos: CryptoAsset[];

  // Social
  relationships: PersonRelation[];
  partnerId?: string;
  isMarried: boolean;

  // Health conditions
  diseases: string[];
  diet: 'Standard' | 'Mediterranean' | 'Vegetarian' | 'Junk Food' | 'Organic High-Protein';
  gymMembership: boolean;

  // Logs & History
  lifeLog: LifeLogEntry[];
  achievements: Achievement[];
  
  // Life Status
  isAlive: boolean;
  causeOfDeath?: string;
  deathAge?: number;
  generation: number;
}

import React, { useState } from 'react';
import { Character, Degree, Job, StartupBusiness } from '../../types/game';
import { DEGREES_CATALOG, JOBS_CATALOG } from '../../data/gameData';
import {
  GraduationCap,
  Briefcase,
  Rocket,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle2,
  Users,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Laptop
} from 'lucide-react';
import { sounds } from '../../utils/audio';

interface CareerTabProps {
  character: Character;
  onEnrollDegree: (degree: Degree, payUpfront: boolean) => void;
  onApplyJob: (job: Job) => void;
  onJobAction: (action: string) => void;
  onLaunchStartup: (business: StartupBusiness) => void;
  onManageStartup: (action: string) => void;
  onSideHustle: (type: string) => void;
}

export const CareerTab: React.FC<CareerTabProps> = ({
  character,
  onEnrollDegree,
  onApplyJob,
  onJobAction,
  onLaunchStartup,
  onManageStartup,
  onSideHustle,
}) => {
  const [subTab, setSubTab] = useState<'jobs' | 'education' | 'startup' | 'hustles'>('jobs');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [startupName, setStartupName] = useState('');
  const [startupIndustry, setStartupIndustry] = useState<StartupBusiness['industry']>('Tech');

  const {
    age,
    money,
    country,
    stats,
    education,
    currentEnrollment,
    degrees,
    currentJob,
    startup,
    isRetired,
  } = character;

  const currency = country.currencySymbol;

  // Filter jobs
  const categories = ['All', 'Tech', 'Healthcare', 'Law', 'Corporate', 'Trades', 'Service', 'Creative', 'Executive'];
  const filteredJobs = JOBS_CATALOG.filter((j) => {
    if (selectedCategory === 'All') return true;
    return j.category === selectedCategory;
  });

  const [startupError, setStartupError] = useState<string>('');

  const handleStartupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStartupError('');
    if (!startupName.trim()) return;
    const initialCost = 15000;
    if (money < initialCost) {
      setStartupError(`You need at least ${currency}${initialCost.toLocaleString()} to incorporate your company.`);
      return;
    }

    sounds.playFanfare();
    onLaunchStartup({
      name: startupName.trim(),
      industry: startupIndustry,
      valuation: 50000,
      annualRevenue: 30000,
      annualProfit: 8000,
      employees: 3,
      marketShare: 1,
      yearsActive: 0,
    });
    setStartupName('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'jobs', label: '💼 Career & Jobs' },
          { id: 'education', label: '🎓 Education & Degrees' },
          { id: 'startup', label: '🚀 Business & Startups' },
          { id: 'hustles', label: '⚡ Side Hustles' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`career-subtab-${tab.id}`}
            onClick={() => {
              setSubTab(tab.id as any);
              sounds.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              subTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. CAREER & JOBS */}
      {subTab === 'jobs' && (
        <div className="space-y-6">
          {/* Current Job Spotlight Card */}
          {currentJob ? (
            <div className="bg-gradient-to-r from-neutral-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {currentJob.job.category} Track
                    </span>
                    <span className="text-xs text-neutral-400">
                      {currentJob.yearsInRole} Years in Company
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{currentJob.job.title}</h2>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    Salary: {currency}{currentJob.currentSalary.toLocaleString()} / year
                  </div>
                </div>

                <div className="flex flex-col gap-1 min-w-[160px]">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Performance</span>
                    <span>{currentJob.performance}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${currentJob.performance}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-800">
                <button
                  id="job-overtime-btn"
                  onClick={() => onJobAction('work_overtime')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Work Overtime</span>
                </button>
                <button
                  id="job-ask-raise-btn"
                  onClick={() => onJobAction('ask_raise')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Ask for Raise</span>
                </button>
                <button
                  id="job-promotion-btn"
                  onClick={() => onJobAction('seek_promotion')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Seek Promotion</span>
                </button>
                <button
                  id="job-resign-btn"
                  onClick={() => onJobAction('resign')}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Resign / Quit</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-base font-bold text-neutral-900">You Are Currently Unemployed</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Explore the job board below to apply for positions matching your education and smarts.
              </p>
            </div>
          )}

          {/* Job Board */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Job Openings Market</span>
              </h3>

              {/* Category selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === c
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => {
                const meetsSmarts = stats.smarts >= job.requiredSmarts;
                const isUnderAge = age < 16;
                const isCurrent = currentJob?.job.id === job.id;

                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all ${
                      isCurrent ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {job.category}
                          </span>
                          <h4 className="font-bold text-neutral-900 text-base mt-1">{job.title}</h4>
                        </div>
                        <div className="text-right font-black text-emerald-600 text-sm">
                          {currency}{job.baseSalary.toLocaleString()}<span className="text-[10px] font-normal text-neutral-500">/yr</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 font-medium mb-4">
                        <span>Edu: <strong className="text-neutral-700 capitalize">{job.requiredEducation.replace('_', ' ')}</strong></span>
                        <span>•</span>
                        <span>Smarts Req: <strong className={meetsSmarts ? 'text-emerald-600' : 'text-rose-600'}>{job.requiredSmarts}%</strong></span>
                        <span>•</span>
                        <span>Stress: <strong className="text-amber-600">{job.stressLevel}/10</strong></span>
                      </div>
                    </div>

                    <button
                      disabled={isCurrent || isUnderAge}
                      onClick={() => onApplyJob(job)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-neutral-100 text-neutral-400 cursor-default'
                          : isUnderAge
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? 'Current Position' : isUnderAge ? 'Must be Age 16+' : 'Apply for Position'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. EDUCATION & DEGREES */}
      {subTab === 'education' && (
        <div className="space-y-6">
          {/* Active Enrollment */}
          {currentEnrollment ? (
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200">
                  Enrolled Program
                </span>
                <span className="text-xs text-neutral-300">
                  Year {currentEnrollment.currentYear} of {currentEnrollment.totalYears}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">{currentEnrollment.degree.name}</h2>
              <div className="w-full bg-indigo-950 rounded-full h-2.5 overflow-hidden mt-3">
                <div
                  className="bg-indigo-400 h-full"
                  style={{
                    width: `${(currentEnrollment.currentYear / currentEnrollment.totalYears) * 100}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-indigo-800/80">
                <button
                  onClick={() => onJobAction('study_hard')}
                  className="py-2.5 px-4 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors"
                >
                  📚 Study Late at Library (+Smarts)
                </button>
                <button
                  onClick={() => onJobAction('drop_out')}
                  className="py-2.5 px-4 bg-rose-500/20 text-rose-200 rounded-xl text-xs font-bold hover:bg-rose-500/30 transition-colors"
                >
                  Drop Out of University
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-neutral-500">Highest Education Attained</div>
                <div className="text-base font-bold text-neutral-900 capitalize mt-0.5">
                  {education.replace('_', ' ')}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Degrees completed: {degrees.length > 0 ? degrees.map((d) => d.name).join(', ') : 'None'}
                </div>
              </div>
              <GraduationCap className="w-10 h-10 text-indigo-600/30" />
            </div>
          )}

          {/* Degree Offerings */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-neutral-900">University & Vocational Programs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEGREES_CATALOG.map((deg) => {
                const meetsSmarts = stats.smarts >= deg.minSmarts;
                const canAfford = money >= deg.annualTuition;
                const isUnderAge = age < 17;
                const alreadyHas = degrees.some((d) => d.id === deg.id);

                return (
                  <div
                    key={deg.id}
                    className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-neutral-300 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {deg.field} ({deg.durationYears} Years)
                        </span>
                        <div className="font-bold text-neutral-900 text-sm">
                          {currency}{deg.annualTuition.toLocaleString()}<span className="text-[10px] font-normal text-neutral-500">/yr</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-neutral-900 text-sm mt-1 mb-2">{deg.name}</h4>

                      <div className="text-xs text-neutral-500 space-y-1 mb-4">
                        <div>Min Smarts: <strong className={meetsSmarts ? 'text-emerald-600' : 'text-rose-600'}>{deg.minSmarts}%</strong></div>
                        <div>Career Salary Multiplier: <strong className="text-indigo-600">+{Math.round((deg.salaryBoost - 1) * 100)}%</strong></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={alreadyHas || isUnderAge || !meetsSmarts || !canAfford || !!currentEnrollment}
                        onClick={() => onEnrollDegree(deg, true)}
                        className="py-2 px-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-100 disabled:text-neutral-400 text-white shadow-xs transition-all"
                      >
                        {alreadyHas ? 'Completed' : 'Pay Tuition'}
                      </button>
                      <button
                        disabled={alreadyHas || isUnderAge || !meetsSmarts || !!currentEnrollment}
                        onClick={() => onEnrollDegree(deg, false)}
                        className="py-2 px-2.5 rounded-xl text-xs font-bold border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:border-neutral-200 transition-all"
                      >
                        Student Loan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. STARTUPS & BUSINESS */}
      {subTab === 'startup' && (
        <div className="space-y-6">
          {startup ? (
            <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {startup.industry} Enterprise
                  </span>
                  <h2 className="text-2xl font-black text-white mt-1">{startup.name}</h2>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Operating for {startup.yearsActive} years • {startup.employees} full-time staff
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-center sm:text-right">
                  <div className="text-xs text-neutral-300 font-medium">Estimated Company Valuation</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300">
                    {currency}{Math.floor(startup.valuation).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Startup Financials */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-800">
                <div className="p-3 bg-neutral-800/80 rounded-xl">
                  <div className="text-[11px] text-neutral-400 font-medium">Annual Revenue</div>
                  <div className="text-base font-bold text-emerald-400">
                    {currency}{Math.floor(startup.annualRevenue).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-neutral-800/80 rounded-xl">
                  <div className="text-[11px] text-neutral-400 font-medium">Annual Profit</div>
                  <div className="text-base font-bold text-emerald-300">
                    {currency}{Math.floor(startup.annualProfit).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-neutral-800/80 rounded-xl">
                  <div className="text-[11px] text-neutral-400 font-medium">Market Share</div>
                  <div className="text-base font-bold text-indigo-300">
                    {startup.marketShare}%
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => onManageStartup('marketing')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-center"
                >
                  🚀 Run Marketing Blitz ({currency}10k)
                </button>
                <button
                  onClick={() => onManageStartup('hire')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-center"
                >
                  👥 Hire Top Talent ({currency}20k)
                </button>
                <button
                  onClick={() => onManageStartup('sell_company')}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all text-center col-span-2 sm:col-span-1"
                >
                  💰 Sell Company / IPO Exit
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl text-white">
              <h3 className="text-lg font-bold text-white mb-1">Incorporate a New Startup</h3>
              <p className="text-xs text-neutral-400 mb-6">
                Take the entrepreneurial plunge. Requires {currency}15,000 in capital to register legal entity, develop MVP, and hire starting engineers.
              </p>

              {startupError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold font-mono">
                  ⚠️ {startupError}
                </div>
              )}

              <form onSubmit={handleStartupSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. Apex Robotics, Nova AI, Silk Commerce"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500 text-sm font-medium text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={startupIndustry}
                    onChange={(e) => setStartupIndustry(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500 text-sm font-medium text-white"
                  >
                    <option value="Tech">Technology & Cloud Software</option>
                    <option value="AI">Artificial Intelligence & Robotics</option>
                    <option value="E-commerce">E-commerce & Direct Retail</option>
                    <option value="Food & Beverage">Food & Beverage Chain</option>
                    <option value="Fashion">Luxury Fashion & Apparel</option>
                    <option value="BioTech">Biotech & Longevity Science</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={money < 15000}
                  className="py-3 px-6 rounded-xl font-bold bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white shadow-md flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Launch Business ({currency}15,000)</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. SIDE HUSTLES */}
      {subTab === 'hustles' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-2xl mb-2">📹</div>
              <h4 className="font-bold text-neutral-900 text-base">Content Creator & Streamer</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">
                Stream video games and post lifestyle vlogs to grow a digital following and earn ad revenue.
              </p>
            </div>
            <button
              onClick={() => onSideHustle('content_creator')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
            >
              Post Video / Stream (-10 Energy)
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-bold text-neutral-900 text-base">Freelance Tutoring & Consulting</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">
                Tutor university students in math, science, and coding for immediate cash payouts.
              </p>
            </div>
            <button
              onClick={() => onSideHustle('tutoring')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
            >
              Consulting Session (+Cash)
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="text-2xl mb-2">🚗</div>
              <h4 className="font-bold text-neutral-900 text-base">Rideshare & Food Delivery</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-4 leading-relaxed">
                Drive passengers and deliver gourmet meals during evening peak hours.
              </p>
            </div>
            <button
              onClick={() => onSideHustle('rideshare')}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
            >
              Drive Evening Shift (+Cash)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

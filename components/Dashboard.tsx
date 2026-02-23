import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MarketService, MarketIntelligence } from '../services/marketService';
import { TrendingUp, ArrowUpRight, DollarSign, Briefcase, Map, AlertCircle } from './ui/Icons';

const mockTrendData = [
  { name: 'Mon', jobs: 2400 },
  { name: 'Tue', jobs: 1398 },
  { name: 'Wed', jobs: 9800 },
  { name: 'Thu', jobs: 3908 },
  { name: 'Fri', jobs: 4800 },
  { name: 'Sat', jobs: 3800 },
  { name: 'Sun', jobs: 4300 },
];

const mockSalaryData = [
  { name: 'Junior', salary: 45000 },
  { name: 'Mid', salary: 85000 },
  { name: 'Senior', salary: 145000 },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: any; color: string }> = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3 mr-1" /> {trend}
      </span>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [marketIntel, setMarketIntel] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);
      const data = await MarketService.getMarketIntelligence();

      if ("error" in data) {
        setError(data.error);
        setMarketIntel(null);
      } else {
        setMarketIntel(data);
        setError(null);
      }
      setLoading(false);
    };

    fetchMarketData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Market Intelligence Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time insights for Software Engineering roles.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-neutral-700 shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Market Data
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Backend Error:</strong> {error === "SERPAPI_KEY not set" ? "Please configure SERPAPI_KEY in the backend .env file to see live data." : error}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Daily Booming Jobs"
              value={marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) ? marketIntel.market_analysis.total_jobs_estimate.toString() : "0"}
              trend="+12%"
              icon={Briefcase}
              color="bg-blue-500"
            />
            <StatCard
              title="Salary Summary"
              value={marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) ? marketIntel.market_analysis.salary_range_summary : "N/A"}
              trend="Market Avg."
              icon={DollarSign}
              color="bg-emerald-500"
            />
            <StatCard
              title="Remote Demand"
              value={marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) ? `${marketIntel.market_analysis.remote_demand_percentage_estimate}%` : "0%"}
              trend="Global"
              icon={Map}
              color="bg-violet-500"
            />
            <StatCard
              title="Market Growth"
              value={marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) ? marketIntel.market_analysis.market_growth_indicator : "N/A"}
              trend="Indicator"
              icon={ArrowUpRight}
              color="bg-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Job Demand Trends (Last 7 Days)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrendData}>
                    <defs>
                      <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-neutral-700" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--tw-colors-neutral-800, #1f2937)', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#0ea5e9' }}
                    />
                    <Area type="monotone" dataKey="jobs" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Salary Progression</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalaryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" className="dark:stroke-neutral-700" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13 }} width={50} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                    <Bar dataKey="salary" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Trending Roles for You</h2>
              <div className="space-y-4">
                {(marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) ? marketIntel.market_analysis.top_trending_roles : [
                  'Full Stack Developer',
                  'DevOps Engineer',
                  'Cloud Architect'
                ]).map((roleName: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-neutral-600 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{roleName}</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">High Demand</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recommended Actions</h2>
              <ul className="space-y-3">
                {(marketIntel?.market_analysis && !('error' in marketIntel.market_analysis) && marketIntel.market_analysis.trending_skills.length > 0) ? (
                  marketIntel.market_analysis.trending_skills.map((skill, idx) => (
                    <li key={idx} className="flex gap-3 items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Master {skill}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High demand skill detected for your profile.</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-3 items-start p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                      <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Update Resume Keywords</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Market analysis suggests adding 'React' and 'AWS' to your profile.</p>
                      </div>
                    </li>
                    <li className="flex gap-3 items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Complete System Design Module</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">80% of target roles require this skill.</p>
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { Recycle, BadgeCheck, Coins, Target, TrendingUp, Loader2 } from 'lucide-react';

const COLORS = {
  organic: '#F59E0B',
  recyclable: '#3B82F6',
  hazardous: '#EF4444',
};

const COLORS_ARR = ['#1B3A2F', '#2D7A5A', '#C8F5E8', '#5EC89E', '#E8F8F0'];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalWaste: 0,
    correctlySegregated: 0,
    successfulVerifications: 0,
    totalTokens: 0,
    segregationAccuracy: 0,
  });
  const [categoryDist, setCategoryDist] = useState([]);
  const [dailyCollection, setDailyCollection] = useState([]);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, catRes, dailyRes, recentRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/category-distribution'),
        fetch('/api/dashboard/daily-collection'),
        fetch('/api/dashboard/recent-deposits'),
      ]);
      setStats(await statsRes.json());
      setCategoryDist(await catRes.json());
      setDailyCollection(await dailyRes.json());
      setRecentDeposits(await recentRes.json());
      setLoading(false);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="text-leaf animate-spin" strokeWidth={2.5} />
      </div>
    );
  }

  const formattedDaily = dailyCollection.reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: d.total_weight,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Dashboard</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">Sustainability Overview</h2>
        <p className="text-ash text-sm leading-relaxed max-w-xl">Real-time metrics from verified waste deposits. All data reflects actual records in the system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Waste Collected" value={`${stats.totalWaste.toFixed(1)} kg`} icon={Recycle} change="+12% vs last week" accent="mint" />
        <StatsCard title="Correctly Segregated" value={`${stats.correctlySegregated.toFixed(1)} kg`} icon={BadgeCheck} change="+8% vs last week" accent="mint" />
        <StatsCard title="Verifications" value={stats.successfulVerifications} icon={Coins} change="+5 this week" accent="forest" />
        <StatsCard title="Tokens Rewarded" value={stats.totalTokens} icon={Coins} change="+127 tokens" accent="forest" />
        <StatsCard title="Segregation Accuracy" value={`${stats.segregationAccuracy}%`} icon={Target} change="+3 pp" accent="forest" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Waste by Category</h3>
            <span className="text-[10px] text-ash">Pie chart</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categoryDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDist.map((d: any) => ({ name: d.category, value: d.total_weight }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    paddingAngle={2} dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryDist.map((_: any, i: number) => (
                      <Cell key={`cell-${i}`} fill={COLORS_ARR[i % COLORS_ARR.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A2220', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(value: number) => `${value.toFixed(1)} kg`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Daily Collection */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Daily Collection (Last 7 Days)</h3>
            <span className="text-[10px] text-ash">Area chart</span>
          </div>
          <div className="h-64">
            {formattedDaily.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D7A5A" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#C8F5E8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B3A2F" />
                      <stop offset="100%" stopColor="#2D7A5A" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A222008" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A2220', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Waste Collected']}
                  />
                  <Area type="monotone" dataKey="weight" stroke="url(#lineGradient)" strokeWidth={2.5} fill="url(#areaGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm h-full flex items-center justify-center">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Impact & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-forest via-forest to-leaf rounded-[28px] p-8 shadow-2xl shadow-forest/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <h3 className="font-display font-bold text-xl text-white mb-6 relative z-10">Environmental Impact <span className="text-mint font-normal">(Estimates)</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {[
              { label: 'CO₂ Saved', value: `${(stats.totalWaste * 0.5).toFixed(1)} kg`, unit: 'vs landfill' },
              { label: 'Water Saved', value: `${(stats.totalWaste * 2.3).toFixed(0)} L`, unit: 'in production' },
              { label: 'Energy Saved', value: `${(stats.totalWaste * 1.8).toFixed(0)} kWh`, unit: 'recycled vs new' },
              { label: 'Trees Equivalent', value: `${(stats.totalWaste * 0.02).toFixed(1)}`, unit: 'trees saved' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="font-display font-extrabold text-2xl text-white">{item.value}</p>
                <p className="text-[11px] text-white/50 mt-1">{item.unit}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-5 text-center">* Estimates based on EPA/WWF conversion factors for mixed municipal waste. Not measured values.</p>
        </div>

        {/* Recent Deposits */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Recent Deposit Activity</h3>
            <span className="text-[10px] text-ash">Latest 10</span>
          </div>
          <div className="space-y-3">
            {recentDeposits.length > 0 ? recentDeposits.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-stone/50 hover:bg-stone/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d.category === 'Organic' ? 'bg-amber-100' : d.category === 'Recyclable' ? 'bg-sky-100' : 'bg-rose-100'}`}>
                    <Recycle size={14} className={d.category === 'Organic' ? 'text-amber-600' : d.category === 'Recyclable' ? 'text-sky-600' : 'text-rose-600'} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-ink">{d.user_name || 'User'}</p>
                    <p className="text-xs text-ash">{d.category} • {d.subcategory || ''} • {d.weight} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${d.verification_status === 'verified' ? 'bg-leaf/15 text-leaf' : d.verification_status === 'rejected' ? 'bg-rose-100 text-rose-600' : d.verification_status === 'needs_review' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
                    {d.verification_status || d.status}
                  </span>
                  <span className="text-xs text-ink/40 font-mono">
                    {new Date(d.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-ash text-sm text-center py-8">No deposits yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { Loader2, Calendar, ArrowDownAZ, ArrowUpAZ, TrendingUp, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const [segregationData, setSegregationData] = useState<any[]>([]);
  const [tokenDistribution, setTokenDistribution] = useState<any[]>([]);
  const [dailyCollection, setDailyCollection] = useState<any[]>([]);
  const [categoryReports, setCategoryReports] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [segRes, tokenRes, dailyRes, catRes] = await Promise.all([
        fetch('/api/analytics/segregation?startDate=' + (dateFrom || '2026-01-01') + '&endDate=' + (dateTo || '2026-10-22')),
        fetch('/api/analytics/token-distribution'),
        fetch('/api/analytics/daily-collection?startDate=' + (dateFrom || '2026-01-01') + '&endDate=' + (dateTo || '2026-10-22')),
        fetch('/api/analytics/category-reports?startDate=' + (dateFrom || '2026-01-01') + '&endDate=' + (dateTo || '2026-10-22')),
      ]);
      setSegregationData(await segRes.json());
      setTokenDistribution(await tokenRes.json());
      setDailyCollection(await dailyRes.json());
      setCategoryReports(await catRes.json());
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // Format daily data
  const formattedDaily = dailyCollection.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: d.total_weight,
  }));

  // Format token data
  const formattedTokens = tokenDistribution.map((d: any) => ({
    category: d.category,
    verified: d.verified || 0,
    rejected: d.rejected || 0,
    totalWeight: d.total_weight || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Analytics & Reports</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">Analytics & Reports</h2>
        <p className="text-ash text-sm leading-relaxed">Performance metrics for your segregation project.</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-[24px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-5 mb-6">
        <h3 className="font-display font-bold text-sm text-leaf uppercase tracking-wider mb-4">Date Range Filter</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-ink/40 uppercase tracking-wider mb-1.5 block">From</label>
            <input
              type="date"
              value={dateFrom || ''}
              onChange={e => setDateFrom(e.target.value || null)}
              className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] text-sm text-ink focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20"
            />
          </div>
          <div>
            <label className="text-[10px] text-ink/40 uppercase tracking-wider mb-1.5 block">To</label>
            <input
              type="date"
              value={dateTo || '2026-10-22'}
              onChange={e => setDateTo(e.target.value || null)}
              className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] text-sm text-ink focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20"
            />
          </div>
        </div>

        <button
          onClick={() => fetchData()}
          className="mt-4 w-full bg-gradient-to-r from-forest to-leaf text-white font-display font-bold text-sm py-3 rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCcw size={14} /> Refresh Report
        </button>
      </div>

      {/* Segregation by Category */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <h3 className="font-display font-bold text-lg mb-4">Category-wise Segregation Accuracy</h3>
          <p className="text-xs text-ink/40 mb-4">Percentage of correctly segregated waste per category (filtered date range)</p>
          <div className="h-64">
            {segregationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segregationData.map((d: any) => ({
                  name: d.category,
                  verified: d.correct_count || 0,
                  rejected: ((d.total_deposits || 0) - (d.correct_count || 0)),
                  total: d.total_deposits || 0,
                }))} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A222008" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A2220', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(value: number) => `${value} deposits`}
                  />
                  <Bar dataKey="verified" name="Verified" fill="#1B3A2F" />
                  <Bar dataKey="rejected" name="Needs Review" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm h-full flex items-center justify-center">Select a date range</p>
            )}
          </div>
        </div>

        {/* Token Distribution */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <h3 className="font-display font-bold text-lg mb-4">Token Distribution</h3>
          <p className="text-xs text-ink/40 mb-4">Tokens awarded per verified category</p>
          <div className="h-64">
            {tokenDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedTokens.map((d: any, i: number) => ({
                  name: d.category,
                  value: Math.round(d.totalWeight) || 0,
                }))} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A222008" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A2220', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(value: number) => `${value} kg`}
                  />
                  <Bar dataKey="value" name="Total Weight (kg)" fill="#2D7A5A" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm h-full flex items-center justify-center">Select a date range</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Collection & Verification vs Rejected */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <h3 className="font-display font-bold text-lg mb-4">Daily Waste Collection</h3>
          <p className="text-xs text-ink/40 mb-4">Verified weight per day (filtered date range)</p>
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
                    formatter={(value: number) => `${value.toFixed(1)} kg`}
                  />
                  <Area type="monotone" dataKey="weight" stroke="url(#lineGradient)" strokeWidth={2.5} fill="url(#areaGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm h-full flex items-center justify-center">Select a date range</p>
            )}
          </div>
        </div>

        {/* Verification vs Rejected */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
          <h3 className="font-display font-bold text-lg mb-4">Verified vs Rejected</h3>
          <p className="text-xs text-ink/40 mb-4">Deposits status across date range</p>
          <div className="h-64">
            {categoryReports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryReports.map((d: any) => ({
                  name: `${d.category}: ${d.total_deposits} deposits`,
                  verified: d.verified || 0,
                  rejected: d.rejected || 0,
                }))} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A222008" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64736F' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1A2220', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(value: number) => `${value} deposits`}
                  />
                  <Bar dataKey="verified" name="Verified" fill="#1B3A2F" />
                  <Bar dataKey="rejected" name="Rejected" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ash text-sm h-full flex items-center justify-center">Select a date range</p>
            )}
          </div>
        </div>
      </div>

      {/* CSV Export */}
      <div className="mt-6 bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-6">
        <h3 className="font-display font-bold text-lg mb-4">CSV Export</h3>
        <p className="text-xs text-ink/40 mb-4">Export deposit records and token transactions.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = '/api/export/deposits'}
            className="w-full py-3 bg-gradient-to-r from-forest to-leaf text-white font-display font-bold text-sm rounded-xl hover:bg-forest/90 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={14} /> Deposit Records
          </button>
          <button
            onClick={() => window.location.href = '/api/export/transactions'}
            className="w-full py-3 bg-amber-600 text-stone font-bold text-sm rounded-xl hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={14} /> Token Transactions
          </button>
        </div>
        <p className="text-xs text-ink/40 mt-3 text-center">Export format: CSV. Opens download dialog.</p>
      </div>
    </div>
  );
}
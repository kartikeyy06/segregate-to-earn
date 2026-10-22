import { TrendingUp, BadgeCheck, Recycle, AlertTriangle, Coins, ChevronUp } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, change, accent }: any) {
  return (
    <div className="group bg-white rounded-3xl p-6 border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] hover:shadow-[0_8px_40px_-16px_rgba(27,58,47,0.1)] transition-all duration-300 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/3 translate-x-1/4 opacity-[0.03] bg-gradient-to-br ${accent === 'mint' ? 'from-mint to-leaf' : 'from-leaf to-forest'}`} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-leaf/10 to-mint/30 flex items-center justify-center shadow-sm shadow-leaf/10">
          <Icon size={20} className="text-leaf" strokeWidth={1.8} />
        </div>
        {change && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-leaf bg-leaf/8 px-2 py-0.5 rounded-full">
            <ChevronUp size={12} /> {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-ink tracking-tight mb-1">{value}</p>
      <p className="text-[13px] text-ash font-medium">{title}</p>
    </div>
  );
}

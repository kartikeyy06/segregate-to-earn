import { useState, useEffect } from 'react';
import { LayoutDashboard, Upload, ShieldCheck, Coins, QrCode, BarChart3, Settings, Menu, X, Bell, User } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Upload, label: 'Classify Waste', href: '/classify' },
  { icon: ShieldCheck, label: 'Register Deposit', href: '/deposit' },
  { icon: Coins, label: 'Token Wallet', href: '/wallet' },
  { icon: QrCode, label: 'QR / RFID', href: '/qr-rfid' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  return (
    <div className="min-h-screen bg-stone flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-forest shadow-2xl shadow-forest/20 transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:z-auto`}>
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-mint flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2F" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2L4 8v8l8 6 8-6V8l-8-6z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-[15px] text-white leading-tight">Segregate-to-Earn</h1>
            <p className="text-[10px] text-white/40 tracking-wide">SUSTAINABILITY PROTOTYPE</p>
          </div>
        </div>
        <nav className="px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 group"
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="absolute bottom-4 left-6 right-6">
          <div className="rounded-2xl bg-gradient-to-br from-leaf/20 to-mint/10 border border-white/5 p-4">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Demo Note</p>
            <p className="text-xs text-white/80 leading-relaxed">This is a prototype demonstration. All AI classifications are simulated.</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-stone/80 backdrop-blur-xl border-b border-ink/5 px-6 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -ml-2 text-ink/60 hover:text-ink">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="md:hidden text-sm font-display font-bold text-ink">Segregate-to-Earn</div>

          <div className="flex items-center gap-3">
            <a href="/analytics" className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-leaf bg-leaf/8 hover:bg-leaf/15 px-3 py-2 rounded-full transition-colors">
              <BarChart3 size={13} /> Analytics
            </a>
            <button className="relative p-2.5 rounded-full hover:bg-ink/5 text-ink/50 hover:text-ink transition-colors" onClick={() => setNotifications(n => Math.max(0, n - 1))}>
              <Bell size={18} strokeWidth={1.5} />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-leaf rounded-full ring-2 ring-stone animate-pulse" />
              )}
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-ink/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-leaf to-mint flex items-center justify-center shadow-sm shadow-leaf/20">
                <User size={14} strokeWidth={2} className="text-forest" />
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-ink leading-tight">Dr. Sarah Park</p>
                <p className="text-ink/40 leading-tight">Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-6 lg:px-10 py-8 lg:py-12 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

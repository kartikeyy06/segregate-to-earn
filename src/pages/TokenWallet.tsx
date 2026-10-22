import { useState, useEffect } from 'react';
import { Coins, Loader2, Loader3, Minus, Plus, RefreshCcw } from 'lucide-react';

export default function TokenWallet() {
  const userId = 'demo-user-1';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [balanceRes, txsRes, userRes] = await Promise.all([
        fetch(`/api/wallet/${userId}/balance`),
        fetch(`/api/wallet/${userId}/transactions`),
        fetch(`/api/wallet/${userId}`),
      ]);
      const balanceData = await balanceRes.json();
      const txsData = await txsRes.json();
      const userData = await userRes.json();

      setUser(userData);
      setBalance(balanceData.balance);
      setTotalEarned(balanceData.totalEarned || 0);
      setTotalRedeemed(balanceData.totalRedeemed || 0);
      setTransactions(txsData || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || redeemAmount <= 0) {
      setRedeemError('Enter an amount');
      return;
    }
    setRedeemError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/${userId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: redeemAmount, rewardType: 'demo reward' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redeem failed');
      setRedeemAmount(0);
      fetchUserData();
      setMessage({ type: 'success', text: `Redeemed ${redeemAmount} prototype tokens` });
    } catch (err: any) {
      setRedeemError(err.message);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader3 size={32} className="text-leaf animate-spin" strokeWidth={2.5} />
      </div>
    );
  }

  if (!user) {
    return <p className="text-ash text-sm">User not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Token Wallet</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">Prototype Token Balance</h2>
        <p className="text-ash text-sm leading-relaxed">All rewards are prototype tokens for demo purposes only. Not cryptocurrency or real monetary value.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Balance Summary */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${balance >= 0 ? 'bg-leaf/10 text-leaf' : 'bg-rose-50 text-rose-600'}`}>
              <Coins size={24} className={balance >= 0 ? 'text-leaf' : 'text-rose-600'} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink">{balance >= 0 ? balance : 0}</p>
              <p className="text-sm text-ink/40 font-medium">Prototype Token Balance</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-left">
              <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">Total Earned</p>
              <p className="font-display font-bold text-3xl text-ink">{totalEarned}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">Total Redeemed</p>
              <p className="font-display font-bold text-3xl text-ink">{totalRedeemed}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">Net Balance</p>
              <p className={`font-display font-bold ${balance >= 0 ? 'text-ink' : 'text-rose-600'} text-3xl capitalize`}>
                {balance >= 0 ? 'Positive' : 'Overdraft'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <h3 className="font-display font-bold text-lg mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-ash text-sm text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.map((t: any, i: number) => (
                <div key={t.id} className={`flex items-center justify-between p-3 rounded-2xl bg-stone/50 ${t.type === 'reward' ? 'bg-leaf/10' : 'bg-amber/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'reward' ? 'bg-leaf/10' : 'bg-amber/10'}`}>
                      {t.type === 'reward' ? (
                        <Coins size={16} className="text-leaf" strokeWidth={1.5} />
                      ) : (
                        <Minus size={16} className="text-amber-600" strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-ink">{t.type === 'reward' ? 'Earned' : 'Redeemed'}</p>
                      <p className="text-xs text-ink/40 font-mono">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium text-ink ${t.type === 'reward' ? 'text-leaf' : 'text-amber-600'}`}>+{t.amount}</span>
                    <p className="text-xs text-ink/40">{t.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Redeem Form */}
      <div className="mt-6 bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
        <h3 className="font-display font-bold text-lg mb-4">Redeem Demo Tokens</h3>
        <p className="text-xs text-ink/40 mb-5">Award configurable demo tokens after successful verification. Formula: {transactions.filter((t: any) => t.type === 'reward').length > 0 ? (transactions.filter((t: any) => t.type === 'reward').reduce((sum: number, t: any) => sum + t.amount, 0) / transactions.filter((t: any) => t.type === 'reward').length || 1).toFixed(1) : '2 tokens/kg'} - See README.</p>

        <div className="grid gap-3 mb-4">
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-1 block">Amount to Redeem</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={redeemAmount}
            onChange={e => setRedeemAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
            placeholder="Amount (0.01+)"
          />
          {redeemError && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium">{redeemError}</p>
          )}
        </div>

        <button
          onClick={handleRedeem}
          disabled={!redeemAmount || redeemAmount <= 0 || loading}
          className="w-full bg-gradient-to-r from-leaf to-forest text-white font-display font-bold text-base py-4 rounded-2xl shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span className="flex-1">{loading ? <Loader2 size={20} className="animate-spin" /> Redeeming... : 'Redeem Tokens'}</span>
          <Plus size={20} strokeWidth={2.5} />
        </button>

        <p className="mt-3 text-xs text-ink/40 text-center">
          Warning: Negative balances are prevented. Each deposit can only earn tokens once.
        </p>
      </div>
    </div>
  );
}

// Use context - this would use React context or a hook
function useContext() {
  return { userId: 'demo-user-1' };
}
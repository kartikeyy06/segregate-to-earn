import { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

export default function VerificationPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/verification/pending');
      const data = await res.json();
      setPending(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (depositId: string, isCorrect: boolean) => {
    setVerifying(depositId);
    setMessage(null);

    try {
      const res = await fetch(`/api/verification/${depositId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verifiedBy: 'admin-1',
          isCorrectlySegregated: isCorrect,
          notes: isCorrect ? 'Correctly segregated per bin category' : 'Category mismatch with bin',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: `Deposit ${isCorrect ? 'verified' : 'rejected'} successfully` });
      fetchPending();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setVerifying(null);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-sky-100 text-sky-600',
    needs_review: 'bg-amber-100 text-amber-600',
    verified: 'bg-leaf/15 text-leaf',
    rejected: 'bg-rose-100 text-rose-600',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Verification Engine</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">Verify Deposits</h2>
        <p className="text-ash text-sm leading-relaxed max-w-xl">Review pending deposits and confirm segregation correctness. Tokens are awarded only after successful verification.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-leaf/10 text-leaf border border-leaf/20' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="text-leaf animate-spin" strokeWidth={2.5} />
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-ash">
            <ShieldCheck size={40} strokeWidth={1} className="mb-4 opacity-30" />
            <p className="font-display font-semibold text-sm">No pending verifications</p>
            <p className="text-xs text-ink/20">All deposits have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-ink/[0.04]">
            {pending.map((d: any) => (
              <div key={d.id} className="p-5 hover:bg-stone/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${d.category === 'Organic' ? 'bg-amber-100' : d.category === 'Recyclable' ? 'bg-sky-100' : 'bg-rose-100'}`}>
                      <ShieldCheck size={18} className={d.category === 'Organic' ? 'text-amber-600' : d.category === 'Recyclable' ? 'text-sky-600' : 'text-rose-600'} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ink">{d.user_name}</p>
                      <p className="text-xs text-ash font-mono">{d.bin_id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[d.status]}`}>{d.status}</span>
                    <span className="px-3 py-1.5 bg-stone/50 rounded-xl font-medium text-ink">{d.weight} kg</span>
                    <span className="px-3 py-1.5 bg-stone/50 rounded-xl font-medium text-ink">{d.category}</span>
                    <span className="px-3 py-1.5 bg-stone/50 rounded-xl font-medium text-ink">{d.subcategory}</span>
                    <span className="text-xs text-ink/40 font-mono">{new Date(d.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-ink/[0.04]">
                  <button
                    onClick={() => handleVerify(d.id, false)}
                    disabled={verifying === d.id}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleVerify(d.id, true)}
                    disabled={verifying === d.id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-leaf to-forest text-white text-sm font-bold shadow-md shadow-forest/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {verifying === d.id ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Approve</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-sage rounded-[24px] p-5 border border-leaf/20">
        <p className="text-xs text-ink/60 font-medium">Verification Rules:</p>
        <ul className="text-xs text-ink/50 mt-2 space-y-1 list-disc list-inside">
          <li>Check selected waste category against bin's accepted category</li>
          <li>Approve only if deposit is correctly segregated</li>
          <li>Reject if category mismatch or contamination detected</li>
          <li>Tokens awarded automatically on successful verification</li>
          <li>Duplicate rewards prevented per deposit ID</li>
        </ul>
      </div>
    </div>
  );
}
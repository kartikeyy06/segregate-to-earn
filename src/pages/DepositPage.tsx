import { useState, useEffect } from 'react';
import { Upload, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

export default function DepositPage() {
  const [formData, setFormData] = useState({
    userId: 'demo-user-1',
    userName: 'Alex Chen',
    binId: '',
    category: '',
    subcategory: '',
    weight: '',
    predictedCategory: '',
    imageUrl: '',
    notes: '',
  });
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [depositId, setDepositId] = useState('');

  useEffect(() => {
    fetch('/api/bins').then(r => r.json()).then(setBins).catch(() => setBins([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/deposits/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          binId: formData.binId,
          category: formData.category,
          subcategory: formData.subcategory,
          weight: parseFloat(formData.weight),
          imageUrl: formData.imageUrl || null,
          predictedCategory: formData.predictedCategory || null,
          notes: formData.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setMessage({ type: 'success', text: `Deposit registered! ID: ${data.depositId}` });
      setDepositId(data.depositId);
      setFormData({ ...formData, binId: '', category: '', subcategory: '', weight: '', predictedCategory: '', imageUrl: '', notes: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
    }
  };

  const subcategories: Record<string, string[]> = {
    'Organic': ['Food Scraps', 'Garden Waste', 'Compost'],
    'Recyclable': ['Paper', 'Cardboard', 'Plastic Bottles', 'Metal Cans'],
    'Hazardous': ['Batteries', 'Electronic Waste', 'Chemicals', 'Medical Waste'],
  };

  const selectedBin = bins.find((b: any) => b.id === formData.binId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Deposit Registration</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">Register Waste Deposit</h2>
        <p className="text-ash text-sm leading-relaxed max-w-xl">Log a new waste deposit with category, weight and bin verification. All fields are validated server-side.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7 space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-leaf/10 text-leaf border border-leaf/20' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* User */}
          <div>
            <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">User</label>
            <div className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] text-sm text-ink font-medium">
              {formData.userName} (Demo User)
            </div>
          </div>

          {/* Deposit ID (auto-generated) */}
          <div>
            <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Deposit ID</label>
            <div className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] text-sm text-ink/40 font-mono">
              Auto-generated on submit
            </div>
          </div>
        </div>

        {/* Bin Selection */}
        <div>
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Bin / QR / RFID *</label>
          <select
            value={formData.binId}
            onChange={e => setFormData({ ...formData, binId: e.target.value })}
            className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
            required
          >
            <option value="">Select a bin</option>
            {bins.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.bin_id} — {b.category} ({b.location})
              </option>
            ))}
          </select>
          {selectedBin && (
            <p className="text-xs text-leaf mt-1.5 font-medium flex items-center gap-1">
              <ShieldCheck size={12} /> Accepts: {selectedBin.category} waste
            </p>
          )}
        </div>

        {/* Category & Subcategory */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Waste Category *</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
              className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
              required
            >
              <option value="">Select category</option>
              <option value="Organic">Organic / Wet</option>
              <option value="Recyclable">Dry / Recyclable</option>
              <option value="Hazardous">Hazardous</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Subcategory *</label>
            <select
              value={formData.subcategory}
              onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
              required
              disabled={!formData.category}
            >
              <option value="">Select subcategory</option>
              {formData.category && subcategories[formData.category].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Weight (kg) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.weight}
            onChange={e => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
            placeholder="e.g., 2.5"
            required
          />
          <p className="text-xs text-ash mt-1.5">Must be a positive number</p>
        </div>

        {/* Predicted Category from Classification */}
        <div>
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">AI Predicted Category (Optional)</label>
          <input
            type="text"
            value={formData.predictedCategory}
            onChange={e => setFormData({ ...formData, predictedCategory: e.target.value })}
            className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
            placeholder="From classification page"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Waste Image (Optional)</label>
          <label className="relative block w-full h-40 rounded-2xl border-2 border-dashed border-ink/10 hover:border-leaf/30 hover:bg-sage/40 transition-all cursor-pointer overflow-hidden group">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {formData.imageUrl ? (
              <>
                <img src={formData.imageUrl} alt="Waste" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md">
                    <Upload size={14} className="text-ink/50" strokeWidth={2} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf/10 to-mint/30 flex items-center justify-center mb-3">
                  <Upload size={20} className="text-leaf" strokeWidth={1.5} />
                </div>
                <p className="font-medium text-ink text-sm">Drop an image or click to upload</p>
                <p className="text-xs text-ash">PNG, JPG up to 10MB</p>
              </div>
            )}
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink resize-none"
            placeholder="Any additional information..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-forest to-leaf text-white font-display font-bold text-base py-4 rounded-2xl shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          <ShieldCheck size={20} strokeWidth={2.5} />
          {loading ? <><Loader2 size={20} className="animate-spin" /> Registering...</> : 'Register Deposit'}
        </button>

        <p className="text-center text-xs text-ink/30">* Required fields are validated server-side. Duplicate deposits are rejected.</p>
      </form>
    </div>
  );
}
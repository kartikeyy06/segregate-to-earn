import { useState, useEffect } from 'react';
import { Upload, Scan, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClassificationPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [manualCategory, setManualCategory] = useState('');
  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setManualCategory('');
      setClassification(null);
    }
  };

  const runClassification = async () => {
    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const categories = ['Organic', 'Recyclable', 'Hazardous'];
      const subcategories: Record<string, string[]> = {
        'Organic': ['Food Scraps', 'Garden Waste', 'Compost'],
        'Recyclable': ['Paper', 'Plastic Bottles', 'Metal Cans', 'Cardboard'],
        'Hazardous': ['Batteries', 'Electronic Waste', 'Chemicals'],
      };

      const pred = manualCategory || categories[Math.floor(Math.random() * categories.length)];
      const sub = subcategories[pred][Math.floor(Math.random() * subcategories[pred].length)];

      setClassification({
        predictedCategory: pred,
        subcategory: sub,
        confidence: manualCategory ? 0.92 : Math.round(Math.random() * 20 + 70) / 100,
        isDemo: !manualCategory,
        explanation: manualCategory ? 'User-selected category' : 'Demo classification: simulated inference (no actual AI model connected). For real inference, connect a vision model API.',
      });
      setLoading(false);
    }, 1200);
  };

  const subcategories = {
    'Organic': ['Food Scraps', 'Garden Waste', 'Compost'],
    'Recyclable': ['Paper', 'Plastic Bottles', 'Metal Cans', 'Cardboard'],
    'Hazardous': ['Batteries', 'Electronic Waste', 'Chemicals'],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">Waste Classification</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">AI-Assisted Waste Classification</h2>
        <p className="text-ash text-sm leading-relaxed max-w-xl">Upload an image of waste. The system simulates AI classification into Organic, Recyclable or Hazardous categories. <span className="text-leaf font-semibold">Always clearly marked as demo.</span></p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Upload Area */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <h3 className="font-display font-bold text-lg mb-4">Upload Image</h3>

          <label className="relative block w-full h-64 rounded-2xl border-2 border-dashed border-ink/10 hover:border-leaf/30 hover:bg-sage/40 transition-all cursor-pointer overflow-hidden group">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl ? (
              <img src={imageUrl} alt="Waste" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-leaf/10 to-mint/30 flex items-center justify-center mb-4 shadow-sm shadow-leaf/10">
                  <Upload size={24} className="text-leaf" strokeWidth={1.5} />
                </div>
                <p className="font-display font-semibold text-ink mb-1">Drop an image or click to upload</p>
                <p className="text-xs text-ash">PNG, JPG up to 10MB</p>
              </div>
            )}
          </label>

          <div className="mt-5">
            <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Manual Category (Optional)</label>
            <div className="flex gap-2 flex-wrap">
              {['Organic', 'Recyclable', 'Hazardous'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setManualCategory(manualCategory === cat ? '' : cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${manualCategory === cat ? 'bg-leaf text-white shadow-md shadow-leaf/20' : 'bg-stone text-ink/60 hover:bg-sage hover:text-ink'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runClassification}
            disabled={!imageUrl && !manualCategory}
            className="w-full mt-5 bg-gradient-to-r from-forest to-leaf text-white font-display font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-forest/20 hover:shadow-xl hover:shadow-forest/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <span className="flex items-center justify-center gap-2.5">
              <Scan size={18} strokeWidth={2.5} />
              {loading ? 'Analyzing...' : 'Run Classification'}
            </span>
          </button>

          {imageUrl && (
            <button onClick={() => { setImageUrl(null); setClassification(null); }} className="w-full mt-3 text-xs text-ink/30 hover:text-ink/60 flex items-center justify-center gap-1.5 transition-colors">
              <Trash2 size={13} /> Clear selection
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <h3 className="font-display font-bold text-lg mb-4">Classification Results</h3>

          {(loading || classification) ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              {loading ? (
                <>
                  <div className="w-14 h-14 rounded-full border-[3px] border-leaf/20 border-t-leaf animate-spin mb-4" />
                  <p className="text-ink font-display font-semibold">Simulating AI inference...</p>
                  <p className="text-xs text-ash mt-1">No real ML model is connected.</p>
                </>
              ) : classification ? (
                <>
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-5 shadow-lg ${classification.predictedCategory === 'Organic' ? 'bg-gradient-to-br from-amber-100 to-amber-200 shadow-amber-200/50' : classification.predictedCategory === 'Recyclable' ? 'bg-gradient-to-br from-sky-100 to-sky-200 shadow-sky-200/50' : 'bg-gradient-to-br from-rose-100 to-rose-200 shadow-rose-200/50'}`}>
                    <Scan size={28} className={classification.predictedCategory === 'Organic' ? 'text-amber-600' : classification.predictedCategory === 'Recyclable' ? 'text-sky-600' : 'text-rose-600'} strokeWidth={2} />
                  </div>
                  <h4 className="font-display font-extrabold text-2xl text-ink mb-1">{classification.predictedCategory}</h4>
                  <p className="text-sm text-ash font-medium mb-4">Subcategory: <span className="text-ink font-bold">{classification.subcategory}</span></p>

                  <div className="w-full max-w-xs bg-ink/[0.04] rounded-full h-3 overflow-hidden mb-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-leaf to-mint transition-all duration-700" style={{ width: `${classification.confidence * 100}%` }} />
                  </div>
                  <p className="text-xs text-ash mb-2">Confidence: <span className="font-bold text-ink">{Math.round(classification.confidence * 100)}%</span></p>

                  <div className="bg-sage rounded-2xl p-4 w-full max-w-xs text-xs text-ink/70 leading-relaxed">
                    <span className="inline-block text-[10px] font-extrabold text-leaf uppercase tracking-wider mb-1">Explanation</span>
                    <p>{classification.explanation}</p>
                  </div>

                  {classification.isDemo && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 w-full max-w-xs">
                      <p className="text-xs text-amber-700 font-medium flex items-start gap-2">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>Demo mode: No real AI model is configured. This uses simulated selection rules.</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 w-full max-w-xs">
                    <button
                      onClick={() => setManualCategory('Organic')}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-leaf to-forest text-white text-xs font-bold shadow-md shadow-forest/20 hover:shadow-lg transition-all"
                    >Accept</button>
                    <button
                      onClick={() => setManualCategory('Recyclable')}
                      className="flex-1 py-2.5 rounded-xl bg-stone text-ink/60 text-xs font-bold hover:bg-sage transition-all"
                    >Correct</button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center text-ink/30">
              <Scan size={40} strokeWidth={1} className="mb-4 opacity-30" />
              <p className="font-display font-semibold text-sm">No classification yet</p>
              <p className="text-xs text-ink/20">Upload an image or select a manual category, then click "Run Classification".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

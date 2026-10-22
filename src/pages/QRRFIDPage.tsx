import { useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Scan, Tag, Search, ClipboardCopy } from 'lucide-react';

export default function QRRFIDPage() {
  const [qrValue, setQrValue] = useState('');
  const [qrDisplay, setQrDisplay] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [selectedRFID, setSelectedRFID] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateQRCode = async () => {
    if (!qrValue) return;
    setLoading(true);
    try {
      const url = await QRCode.toDataURL(qrValue, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1B3A2F',
          light: '#FFFFFF',
        },
      });
      setQrUrl(url);
      setQrDisplay(qrValue);
      setScanResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scanQR = () => {
    setLoading(true);
    setTimeout(() => {
      if (qrDisplay) {
        setScanResult({
          type: 'QR',
          value: qrDisplay,
          scannedAt: new Date().toISOString(),
          binCategory: qrDisplay.includes('BIN-ORG') ? 'Organic' :
                     qrDisplay.includes('BIN-REC') ? 'Recyclable' : 'Hazardous',
        });
      }
      setLoading(false);
    }, 500);
  };

  const scanRFID = () => {
    setLoading(true);
    setTimeout(() => {
      const rfids = ['RFID-ORG-001', 'RFID-REC-002', 'RFID-REC-004', 'RFID-HAZ-003'];
      const rfid = rfids[Math.floor(Math.random() * rfids.length)];
      setSelectedRFID(rfid);
      const categories = ['Organic', 'Recyclable', 'Hazardous'];
      const cat = categories[rfids.indexOf(rfid) % categories.length];
      setScanResult({
        type: 'RFID',
        value: rfid,
        scannedAt: new Date().toISOString(),
        binCategory: cat,
      });
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2">
        <span className="inline-block text-[10px] font-bold tracking-[0.15em] text-leaf uppercase mb-3">QR & RFID Module</span>
        <h2 className="text-4xl font-display font-extrabold text-ink tracking-tight mb-2">QR Code & RFID Scanner</h2>
        <p className="text-ash text-sm leading-relaxed">Generate QR codes for bins and simulate RFID scanning. Both are clearly marked as simulated for demonstration.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Generator */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-forest" /> QR Code Generator
          </h3>
          <p className="text-xs text-ink/40 mb-4">Generate QR codes for waste bins and deposit IDs. Used for simulated scanning demonstrations.</p>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-ink/50 uppercase tracking-wider mb-2 block">Bin ID or Value</label>
              <input
                type="text"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                placeholder="e.g., BIN-ORG-001"
                className="w-full px-4 py-3 bg-stone/50 rounded-xl border border-ink/[0.04] focus:border-leaf/30 focus:outline-none focus:ring-2 focus:ring-leaf/20 text-sm text-ink"
              />
            </div>

            <button
              onClick={generateQRCode}
              disabled={!qrValue || loading}
              className="w-full py-3 bg-gradient-to-r from-forest to-leaf text-white font-display font-bold text-sm rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Download size={16} /> Generate QR Code
            </button>

            {qrUrl && (
              <div className="mt-5 p-5 bg-stone/50 rounded-2xl border border-ink/[0.04] text-center">
                <div className="inline-block p-4 bg-white rounded-xl shadow-sm shadow-forest/10">
                  <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-xs text-ink/40 mt-3 font-mono break-all">{qrDisplay}</p>
                <button
                  onClick={() => copyToClipboard(qrDisplay)}
                  className="mt-2 text-xs text-leaf hover:text-forest font-medium flex items-center gap-1 mx-auto"
                >
                  <ClipboardCopy size={12} /> Copy Value
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scanning Interface */}
        <div className="bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Scan size={18} className="text-leaf" /> Scanning Interface
          </h3>
          <p className="text-xs text-ink/40 mb-4">Simulate scanning QR codes or RFID tags. Shows linked bin ID and category.</p>

          <div className="space-y-5">
            {/* QR Scan */}
            <div>
              <h4 className="text-sm font-bold text-ink/60 mb-3">QR Scan Simulation</h4>
              {qrDisplay ? (
                <div className="p-4 rounded-2xl bg-leaf/10 border border-leaf/20 mb-3">
                  <p className="text-xs text-ink/40 mb-1">Current QR value:</p>
                  <p className="text-sm font-mono text-ink font-medium">{qrDisplay}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone/30 border border-ink/[0.04] text-center mb-3">
                  <p className="text-xs text-ink/30">No QR generated yet</p>
                </div>
              )}
              <button
                onClick={scanQR}
                disabled={!qrDisplay || loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-forest to-leaf text-white text-sm font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Scan size={14} /> Scan QR
              </button>
            </div>

            {/* RFID Scan */}
            <div>
              <h4 className="text-sm font-bold text-ink/60 mb-3">RFID Scan Simulation</h4>
              <div className="p-4 rounded-2xl bg-stone/30 border border-ink/[0.04] mb-3">
                <p className="text-xs text-ink/40 mb-1">Available RFID Tags:</p>
                <ul className="space-y-1">
                  <li className="text-xs font-mono text-ink/70">RFID-ORG-001 — Organic</li>
                  <li className="text-xs font-mono text-ink/70">RFID-REC-002 — Recyclable</li>
                  <li className="text-xs font-mono text-ink/70">RFID-REC-004 — Recyclable</li>
                  <li className="text-xs font-mono text-ink/70">RFID-HAZ-003 — Hazardous</li>
                </ul>
              </div>
              <button
                onClick={scanRFID}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mint to-leaf text-forest text-sm font-bold hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Tag size={14} /> Scan RFID
              </button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-stone/50 to-sage/30 border border-ink/[0.04]">
              <h4 className="text-sm font-bold text-ink/60 mb-2">Scan Result</h4>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-ink/40">Type:</p>
                  <p className="text-sm font-medium text-ink">{scanResult.type} — {scanResult.value}</p>
                  <p className="text-xs text-ink/40 mt-1">Scanned at:</p>
                  <p className="text-xs font-mono text-ink/60">{new Date(scanResult.scannedAt).toLocaleString()}</p>
                  <p className="text-xs text-ink/40 mt-1">Accepted Category:</p>
                  <p className="text-sm font-semibold text-forest">{scanResult.binCategory}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scanResult.type === 'QR' ? 'bg-forest/10' : 'bg-mint/20'}`}>
                  {scanResult.type === 'QR' ? <QrCode size={18} className="text-forest" /> : <Tag size={18} className="text-leaf" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel */}
      <div className="mt-6 bg-white rounded-[28px] border border-ink/[0.04] shadow-[0_2px_32px_-16px_rgba(27,58,47,0.06)] p-7">
        <h3 className="font-display font-bold text-lg mb-4">Bin Database (Simulated)</h3>
        <p className="text-xs text-ink/40 mb-4">View all registered waste bins and their QR/UID codes.</p>
        <div className="overflow-hidden rounded-2xl border border-ink/[0.04]">
          <div className="grid grid-cols-5 bg-stone/50 px-4 py-3 text-[11px] font-bold text-ink/50 uppercase tracking-wider">
            <div>Bin ID</div>
            <div>Category</div>
            <div>Location</div>
            <div>QR Code</div>
            <div>Status</div>
          </div>
          <div className="divide-y divide-ink/[0.04]">
            {[
              { id: 'BIN-ORG-001', category: 'Organic', location: 'Building A', qr: 'QR-ORG-001', status: 'Active' },
              { id: 'BIN-REC-002', category: 'Recyclable', location: 'Building B', qr: 'QR-REC-002', status: 'Active' },
              { id: 'BIN-REC-004', category: 'Recyclable', location: 'Library', qr: 'QR-REC-004', status: 'Active' },
              { id: 'BIN-HAZ-003', category: 'Hazardous', location: 'Science Lab', qr: 'QR-HAZ-003', status: 'Active' },
            ].map((bin, idx) => (
              <div key={bin.id} className="grid grid-cols-5 px-4 py-3 text-sm hover:bg-stone/50 transition-colors">
                <div className="font-mono text-ink">{bin.id}</div>
                <div className="text-ink/70">{bin.category}</div>
                <div className="text-ink/70">{bin.location}</div>
                <div className="font-mono text-xs text-ink/40">{bin.qr}</div>
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${bin.status === 'Active' ? 'bg-leaf/15 text-leaf' : 'bg-ash/20 text-ink/40'}`}>{bin.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
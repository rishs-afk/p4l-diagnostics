import { useState, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';
import LabCard from '../components/LabCard';

const isValidIMEI = (imei) => {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = parseInt(imei[i]);
    if (i % 2 !== 0) d *= 2;
    if (d > 9) d -= 9;
    sum += d;
  }
  return sum % 10 === 0;
};

export default function IMEIVerification({ onResult }) {
  const [status, setStatus] = useState('idle'); // idle, scanning, pass, fail
  const [imei, setImei] = useState(null);
  const [preview, setPreview] = useState(null);
  const [manualImei, setManualImei] = useState('');
  const fileInputRef = useRef(null);

  const processImage = useCallback(async (file) => {
    setStatus('scanning');
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const result = await Tesseract.recognize(objectUrl, 'eng', {
        logger: m => console.log(m)
      });
      const text = result.data.text;
      const matches = text.match(/\b\d{15}\b/g);

      let foundValidImei = null;
      if (matches) {
        for (const match of matches) {
          if (isValidIMEI(match)) {
            foundValidImei = match;
            break;
          }
        }
      }

      if (foundValidImei) {
        setImei(foundValidImei);
        setStatus('pass');
        onResult({ status: 'pass', imei: foundValidImei });
      } else {
        setStatus('fail');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setStatus('fail');
    }
  }, [onResult]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (isValidIMEI(manualImei)) {
      setImei(manualImei);
      setStatus('pass');
      onResult({ status: 'pass', imei: manualImei });
    } else {
      alert("Invalid IMEI format or checksum.");
    }
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <line x1="10" y1="3" x2="8" y2="21"></line>
      <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
  );

  return (
    <LabCard title="Hardware Verification" icon={<Icon />} status={status === 'scanning' ? 'running' : status === 'pass' ? 'pass' : status === 'fail' ? 'fail' : 'pending'} id="lab-imei">
      <div className="section-bg relative overflow-hidden transition-all duration-500">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm font-semibold text-charcoal mb-2">Dial *#06#</p>
            <p className="text-xs text-charcoal-muted mb-4">Screenshot the result and upload it here.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-charcoal text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              Upload Screenshot
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
        )}

        {status === 'scanning' && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10 shadow-inner">
            {preview && (
              <img src={preview} alt="IMEI Preview" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-multiply" />
            )}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgoJPHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjAxIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgoJPC9zdmc+')] mix-blend-overlay pointer-events-none"></div>
            
            <div className="absolute left-0 right-0 h-1 bg-p4l-red shadow-[0_0_10px_2px_rgba(255,59,48,0.5)] animate-scan-line"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-charcoal animate-pulse drop-shadow-sm bg-white/70 px-2 py-1 rounded-md">Scanning...</span>
            </div>
            <style>{`
              @keyframes scan-line {
                0% { top: 0; }
                50% { top: 100%; }
                100% { top: 0; }
              }
              .animate-scan-line {
                animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
            `}</style>
          </div>
        )}

        {status === 'pass' && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="text-[10px] font-bold text-emerald-pass uppercase tracking-widest mb-1">Verified IMEI</p>
            <p className="text-sm font-semibold text-charcoal font-mono">{imei}</p>
          </div>
        )}

        {status === 'fail' && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <p className="text-xs font-bold text-p4l-red mb-2">Deep Scan Failed</p>
            <p className="text-[10px] text-charcoal-muted mb-4 text-center">We couldn't detect a valid 15-digit IMEI. Please enter it manually.</p>
            
            <form onSubmit={handleManualSubmit} className="flex gap-2 w-full max-w-[200px]">
              <input 
                type="text" 
                value={manualImei} 
                onChange={(e) => setManualImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                placeholder="15-digit IMEI" 
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-charcoal font-mono"
                maxLength={15}
              />
              <button type="submit" className="bg-charcoal text-white px-3 py-2 rounded-lg text-xs font-bold">
                Verify
              </button>
            </form>
          </div>
        )}
      </div>
    </LabCard>
  );
}

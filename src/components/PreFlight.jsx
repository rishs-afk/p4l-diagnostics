import { useState, useCallback } from 'react';
import eandLogo from '../assets/eand-logo-white.svg';
import p4lLogo from '../assets/p4l-logo.png';

const Icons = {
  crosshair: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>
    </svg>
  ),
  hand: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  ),
  monitor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  'rotate-ccw': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
    </svg>
  ),
};

const DEFAULT_CHECKS = [
  { label: 'Camera Array', desc: 'Front & rear camera detection' },
  { label: 'Microphone', desc: 'Audio input clarity test' },
  { label: 'Sensors', desc: 'Gyroscope, haptics & orientation' },
  { label: 'Display', desc: 'Touch zones & panel uniformity' },
];

const DEFAULT_BRAND = {
  preflightTitle: 'Device Diagnostics',
  preflightCopy: 'We will scan the device hardware to verify everything is working properly.',
  preflightNote: 'Your browser will ask for camera and microphone access. This data stays on your device and is never uploaded.',
  poweredByLabel: 'Powered by Protect4Less',
  logoSrc: eandLogo,
  logoAlt: 'Diagnostic brand',
  logoDark: false,
};

export default function PreFlight({ onGranted, brand = {}, onBackHome }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mergedBrand = { ...DEFAULT_BRAND, ...brand };
  const checks = brand.preflightChecks ?? DEFAULT_CHECKS;

  const requestPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      onGranted({ camera: 'granted', mic: 'granted' });
    } catch (err) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        onGranted({ camera: 'granted', mic: 'denied' });
      } catch {
        setError('Camera access is required to run the diagnostic. Please allow access and try again.');
        setLoading(false);
      }
    }
  }, [onGranted]);

  return (
    <div className="min-h-screen bg-[#f3f6f8] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,#fff0f1_0%,#f7f9fc_48%,#edf7f3_100%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-[1180px] items-center px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="w-full">
          <header className="mb-7 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-5">
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl sm:h-[84px] sm:w-[84px] ${
              mergedBrand.logoDark
                ? 'bg-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.16)]'
                : 'border border-white/80 bg-white/60 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl'
            }`}>
              <img src={mergedBrand.logoSrc} alt={mergedBrand.logoAlt} className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
            </div>
            <h1 className="text-3xl font-black leading-none text-slate-950 sm:text-4xl lg:text-[40px]">
              {mergedBrand.preflightTitle}
            </h1>
          </header>

          <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.8fr)] lg:gap-6">
            <section className="rounded-lg border border-white/80 bg-white/50 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 backdrop-blur-2xl sm:p-7">
              <p className="mb-2 text-[10px] font-bold uppercase text-slate-500">What we'll check</p>
              <div className="grid gap-x-10 sm:grid-cols-2">
                {checks.map((item) => (
                  <div key={item.label} className="flex min-w-0 items-start gap-3 border-t border-white/80 px-1 py-5">
                    {item.iconName ? (
                      <span className="mt-0.5 shrink-0 text-slate-500">{Icons[item.iconName]}</span>
                    ) : (
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-p4l-red" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex h-full flex-col rounded-lg border border-white/80 bg-white/50 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 backdrop-blur-2xl sm:p-7">
              {onBackHome && (
                <div className="mb-4 flex justify-end lg:hidden">
                  <button
                    type="button"
                    onClick={onBackHome}
                    className="rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase text-slate-600 hover:bg-white"
                  >
                    Back
                  </button>
                </div>
              )}

              <div className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  onClick={requestPermissions}
                  disabled={loading}
                  className="w-full rounded-lg bg-[#e6001f] px-6 py-4 text-base font-semibold text-white shadow-[0_10px_30px_rgba(230,0,31,0.22)] transition-all duration-200 ease-in-out hover:bg-[#c9001a] focus:outline-none focus:ring-2 focus:ring-[#e6001f]/30 active:scale-[0.98] disabled:opacity-60"
                  id="begin-scan-btn"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Requesting Access...
                    </span>
                  ) : (
                    'Begin Diagnostics'
                  )}
                </button>

                <div className="flex items-start gap-2 text-left">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
                  </svg>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {mergedBrand.preflightNote}
                  </p>
                </div>
              </div>

              <div className="mt-auto border-t border-white/80 pt-5 text-center">
                <p className="text-[10px] font-semibold uppercase text-slate-400">{mergedBrand.poweredByLabel}</p>
                <img src={p4lLogo} alt="Protect4Less" className="mx-auto mt-1 h-5 object-contain" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import eandLogo from './assets/eand-logo-white.svg';
import p4lLogo from './assets/p4l-logo.png';
import PreFlight from './components/PreFlight';
import Stepper from './components/Stepper';
import DeviceContext from './labs/DeviceContext';
import CameraInventory from './labs/CameraInventory';
import BatteryLab from './labs/BatteryLab';
import RefreshRate from './labs/RefreshRate';
import AudioSpectrum from './labs/AudioSpectrum';
import OrientationLab from './labs/OrientationLab';
import FlashlightToggle from './labs/FlashlightToggle';
import TouchZoneMap from './labs/TouchZoneMap';
import MultiTouch from './labs/MultiTouch';
import IMEIVerification from './labs/IMEIVerification';
import PixelDrop from './labs/PixelDrop';
import HealthCertificate from './components/HealthCertificate';

const STEPS = ['scan', 'verify', 'summary'];

const FULL_PROFILE = {
  id: 'full',
  mode: 'full',
  brandName: 'Protect4Less',
  brandLabel: 'Protect4Less',
  logoSrc: p4lLogo,
  logoAlt: 'Protect4Less',
  modeLabel: 'Full Version',
  heroTitle: 'Protect4Less full test page',
  heroCopy: 'Run the complete diagnostic workflow for Protect4Less support, QA, and device certification.',
  preflightTitle: 'Device Diagnostics',
  preflightCopy: 'Run the full Protect4Less test flow and produce a certificate at the end.',
  poweredByLabel: 'Powered by Protect4Less',
  footerLabel: 'Certified Hardware Assessment • Protect4Less Diagnostic Tool',
  featureList: [
    'Complete device scan, verification, and report generation',
    'Protect4Less branding and export-ready certificate',
    'Reusable for internal QA, support, and onboarding',
  ],
};

const PARTNER_PROFILES = [
  {
    id: 'etisalat',
    name: 'Etisalat',
    brandName: 'Etisalat',
    brandLabel: 'Etisalat',
    logoSrc: eandLogo,
    logoAlt: 'Etisalat',
    modeLabel: 'Partner Version',
    heroTitle: 'Etisalat partner version',
    heroCopy: 'A partner-branded diagnostic flow that can be tailored per partner while keeping the same inspection engine.',
    preflightTitle: 'Device Diagnostics',
    preflightCopy: 'This Etisalat-branded version can be adapted for future partner deployments.',
    poweredByLabel: 'Powered by Protect4Less',
    footerLabel: 'Certified Hardware Assessment • Etisalat Partner Diagnostic',
    logoDark: true,
    preflightChecks: [
      { iconName: 'crosshair', label: 'Touch zones', desc: 'Ensure touch detection across the display' },
      { iconName: 'hand', label: 'Multi-touch', desc: 'Detect simultaneous touch points and gestures' },
      { iconName: 'monitor', label: 'Pixel drop', desc: 'Scan for dead or stuck pixels in display colors' },
      { iconName: 'rotate-ccw', label: 'Orientation', desc: 'Confirm the screen orientation sensor is active' },
    ],
    labConfig: {
      scanLabs: ['deviceContext'],
      verifyLabs: ['touchZone', 'multiTouch', 'pixelDrop', 'orientation'],
    },
  },
];

function getPartnerProfile(partnerId) {
  return PARTNER_PROFILES.find((partner) => partner.id === partnerId);
}

function buildProfile(mode, partner) {
  if (mode === 'full') {
    return FULL_PROFILE;
  }

  return partner;
}

function PartnerSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.id === value) || null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-left transition-all duration-150 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-p4l-red/20 focus:border-p4l-red"
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.name : 'Select a partner'}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,23,42,0.1)] overflow-hidden">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => { onChange(option.id); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors duration-100 ${
                option.id === value
                  ? 'bg-p4l-red/5 text-p4l-red'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {option.name}
              {option.id === value && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroLanding({ selectedPartner, onOpenFull, onOpenPartner, onPartnerChange }) {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-36 -left-36 w-[600px] h-[600px] bg-p4l-red rounded-full blur-[160px] opacity-[0.18]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-rose-300 rounded-full blur-[160px] opacity-10" />
        <div className="absolute -bottom-40 -right-24 w-[500px] h-[500px] bg-slate-300 rounded-full blur-[160px] opacity-15" />
      </div>

      <div className="relative max-w-[960px] mx-auto px-4 sm:px-8 lg:px-12 py-10 lg:py-16 min-h-screen flex items-center">
        <div className="w-full animate-fade-in">
          <div className="grid gap-4 lg:grid-cols-2 items-stretch">
            <button
              type="button"
              onClick={onOpenFull}
              className="group rounded-[1.75rem] border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.07)] px-6 py-6 text-left transition-all duration-200 hover:bg-white/90 hover:shadow-[0_8px_32px_rgba(15,23,42,0.1)] flex flex-col"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  <img src={p4lLogo} alt="Protect4Less" className="w-8 h-8 object-contain" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Main version</span>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Protect4Less</h2>
                <p className="text-sm text-slate-500 leading-relaxed">Open the full diagnostic experience.</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                View full version <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </button>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_4px_24px_rgba(15,23,42,0.07)] px-6 py-6 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-200 ${selectedPartner ? 'bg-slate-900' : 'bg-white/60 border border-white/80'}`}>
                  {selectedPartner && (
                    <img src={selectedPartner.logoSrc} alt={selectedPartner.logoAlt} className="w-7 h-7 object-contain" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Partner preview</span>
              </div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Select a partner</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">The preview button becomes active once a partner is chosen.</p>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Partner</p>
              <PartnerSelect
                value={selectedPartner?.id || ''}
                options={PARTNER_PROFILES}
                onChange={onPartnerChange}
              />

              <button
                type="button"
                onClick={onOpenPartner}
                disabled={!selectedPartner}
                className="mt-4 w-full rounded-2xl border border-white/70 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm font-semibold text-slate-700 text-center transition-all duration-200 hover:bg-white/80 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selectedPartner ? `Open ${selectedPartner.name} preview →` : 'View partner preview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const initialResults = {
  deviceContext: null,
  cameras: null,
  battery: null,
  refreshRate: null,
  audio: null,
  orientation: null,
  flashlight: null,
  touchZone: null,
  multiTouch: null,
  pixelDrop: null,
  imei: null,
};

function resultsReducer(state, action) {
  switch (action.type) {
    case 'SET_RESULT':
      return { ...state, [action.lab]: action.result };
    case 'RESET':
      return initialResults;
    default:
      return state;
  }
}

function DiagnosticExperience({ mode, partner, onBackHome }) {
  const profile = buildProfile(mode, partner);
  const [step, setStep] = useState('preflight');
  const [results, dispatch] = useReducer(resultsReducer, initialResults);
  const [permissions, setPermissions] = useState({ camera: null, mic: null });
  const [resetKeys, setResetKeys] = useState({
    audio: 0, orientation: 0, flashlight: 0, touchZone: 0, multiTouch: 0, pixelDrop: 0, imei: 0,
  });

  const setResult = useCallback((lab, result) => {
    dispatch({ type: 'SET_RESULT', lab, result });
  }, []);

  const handleRedo = useCallback((lab) => {
    dispatch({ type: 'SET_RESULT', lab, result: null });
    setResetKeys((prev) => ({ ...prev, [lab]: prev[lab] + 1 }));
  }, []);

  const handlePermissionsGranted = useCallback((perms) => {
    setPermissions(perms);
    setStep(profile.labConfig?.scanLabs?.length === 0 ? 'verify' : 'scan');
  }, [profile]);

  const handleScanComplete = useCallback(() => {
    setStep('verify');
  }, []);

  const handleVerifyComplete = useCallback(() => {
    setStep('summary');
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'RESET' });
    setStep('preflight');
    setResetKeys({
      audio: 0, orientation: 0, flashlight: 0, touchZone: 0, multiTouch: 0, pixelDrop: 0, imei: 0,
    });
  }, []);

  const scanLabs = useMemo(
    () => profile.labConfig?.scanLabs ?? ['deviceContext', 'cameras', 'battery', 'refreshRate', 'imei'],
    [profile],
  );
  const verifyLabs = useMemo(
    () => profile.labConfig?.verifyLabs ?? ['audio', 'orientation', 'flashlight', 'touchZone', 'multiTouch'],
    [profile],
  );
  const scanComplete = scanLabs.every((lab) => results[lab] !== null);
  const verifyComplete = verifyLabs.every((lab) => results[lab] !== null);

  if (step === 'preflight') {
    return <PreFlight brand={profile} onGranted={handlePermissionsGranted} />;
  }

  return (
    <div className="min-h-screen bg-white relative pb-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-p4l-red rounded-full blur-[160px] opacity-[0.12]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-slate-300 rounded-full blur-[160px] opacity-10" />
      </div>

      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onBackHome}
                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden shrink-0 ${profile.logoDark ? 'bg-slate-900' : 'bg-white border border-slate-200'}`}
                aria-label="Back to home"
              >
                <img src={profile.logoSrc} alt={profile.logoAlt} className="w-5 h-5 object-contain" />
              </button>
              <div>
                <span className="font-bold text-sm text-slate-900 tracking-tight uppercase block leading-tight">{profile.brandLabel}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block leading-tight">Device Diagnostic</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {step === 'scan' ? 'Analyzing' : step === 'verify' ? 'Verifying' : 'Complete'}
              </span>
            </div>
          </div>
          <Stepper currentStep={step} steps={STEPS} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-5">
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900">{profile.brandName} system scan</h1>
              <p className="text-sm text-slate-500 mt-1">Automatically detecting your device hardware for the selected version.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {scanLabs.includes('deviceContext') && <DeviceContext onResult={(r) => setResult('deviceContext', r)} />}
              {scanLabs.includes('cameras') && <CameraInventory onResult={(r) => setResult('cameras', r)} />}
              {scanLabs.includes('battery') && <BatteryLab onResult={(r) => setResult('battery', r)} />}
              {scanLabs.includes('refreshRate') && <RefreshRate onResult={(r) => setResult('refreshRate', r)} />}
              {scanLabs.includes('imei') && <IMEIVerification key={`imei-${resetKeys.imei}`} onResult={(r) => setResult('imei', r)} />}
            </div>

            {scanComplete && (
              <div className="pt-4 animate-fade-in">
                <button onClick={handleScanComplete} className="btn-primary md:w-auto md:px-10">
                  Continue to Verification →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900">{profile.brandName} hardware verification</h1>
              <p className="text-sm text-slate-500 mt-1">Test each component to verify functionality for this version.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {verifyLabs.includes('audio') && <AudioSpectrum key={`audio-${resetKeys.audio}`} onResult={(r) => setResult('audio', r)} onRedo={() => handleRedo('audio')} />}
              {verifyLabs.includes('orientation') && <OrientationLab key={`orientation-${resetKeys.orientation}`} onResult={(r) => setResult('orientation', r)} onRedo={() => handleRedo('orientation')} />}
              {verifyLabs.includes('flashlight') && <FlashlightToggle key={`flashlight-${resetKeys.flashlight}`} onResult={(r) => setResult('flashlight', r)} onRedo={() => handleRedo('flashlight')} />}
              {verifyLabs.includes('touchZone') && <TouchZoneMap key={`touchZone-${resetKeys.touchZone}`} onResult={(r) => setResult('touchZone', r)} onRedo={() => handleRedo('touchZone')} />}
              {verifyLabs.includes('multiTouch') && <MultiTouch key={`multiTouch-${resetKeys.multiTouch}`} onResult={(r) => setResult('multiTouch', r)} onRedo={() => handleRedo('multiTouch')} />}
              {verifyLabs.includes('pixelDrop') && <PixelDrop key={`pixelDrop-${resetKeys.pixelDrop}`} onResult={(r) => setResult('pixelDrop', r)} onRedo={() => handleRedo('pixelDrop')} />}
            </div>

            {verifyComplete && (
              <div className="pt-4 animate-fade-in">
                <button onClick={handleVerifyComplete} className="btn-primary md:w-auto md:px-10">
                  View Health Report →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'summary' && (
          <HealthCertificate
            results={results}
            onRestart={handleRestart}
            footerText={profile.footerLabel}
            activeLabs={[...scanLabs, ...verifyLabs]}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  const selectedPartner = useMemo(() => getPartnerProfile(selectedPartnerId) || null, [selectedPartnerId]);

  const handleOpenFull = useCallback(() => {
    setView('full');
  }, []);

  const handleOpenPartner = useCallback(() => {
    if (selectedPartner) {
      setView('partner');
    }
  }, [selectedPartner]);

  const handlePartnerChange = useCallback((partnerId) => {
    setSelectedPartnerId(partnerId);
  }, []);

  const handleBackHome = useCallback(() => {
    setView('home');
  }, []);

  if (view === 'home') {
    return (
      <HeroLanding
        selectedPartner={selectedPartner}
        onOpenFull={handleOpenFull}
        onOpenPartner={handleOpenPartner}
        onPartnerChange={handlePartnerChange}
      />
    );
  }

  return (
    <DiagnosticExperience
      key={`${view}-${selectedPartner?.id || 'none'}`}
      mode={view}
      partner={selectedPartner}
      onBackHome={handleBackHome}
    />
  );
}

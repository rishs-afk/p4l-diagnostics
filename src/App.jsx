import { useState, useReducer, useCallback } from 'react';
import eandLogo from './assets/eand-logo-white.svg';
import PreFlight from './components/PreFlight';
import Stepper from './components/Stepper';
import LabCard from './components/LabCard';
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
import HealthCertificate from './components/HealthCertificate';

const STEPS = ['scan', 'verify', 'summary'];

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

export default function App() {
  const [step, setStep] = useState('preflight');
  const [results, dispatch] = useReducer(resultsReducer, initialResults);
  const [permissions, setPermissions] = useState({ camera: null, mic: null });
  const [resetKeys, setResetKeys] = useState({
    audio: 0, orientation: 0, flashlight: 0, touchZone: 0, multiTouch: 0, imei: 0
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
    setStep('scan');
  }, []);

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
      audio: 0, orientation: 0, flashlight: 0, touchZone: 0, multiTouch: 0, imei: 0
    });
  }, []);

  // Count completed scans
  const scanLabs = ['deviceContext', 'cameras', 'battery', 'refreshRate', 'imei'];
  const scanComplete = scanLabs.every((lab) => results[lab] !== null);

  const verifyLabs = ['audio', 'orientation', 'flashlight', 'touchZone', 'multiTouch'];
  const verifyComplete = verifyLabs.every((lab) => results[lab] !== null);

  if (step === 'preflight') {
    return <PreFlight onGranted={handlePermissionsGranted} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative overflow-hidden pb-8">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-p4l-red rounded-full blur-[120px] opacity-25" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-p4l-red rounded-full blur-[120px] opacity-20" />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-p4l-red rounded-lg flex items-center justify-center shadow-sm">
                <img src={eandLogo} alt="e&" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-sm text-charcoal tracking-tight uppercase">Diagnostic Lab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] text-charcoal-muted font-bold uppercase tracking-wider">
                {step === 'scan' ? 'Analyzing' : step === 'verify' ? 'Verifying' : 'Complete'}
              </span>
            </div>
          </div>
          <Stepper currentStep={step} steps={STEPS} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-5">
        {/* SCAN STEP */}
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">System Scan</h1>
              <p className="text-sm text-white/50 mt-1">Automatically detecting your device hardware.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <DeviceContext onResult={(r) => setResult('deviceContext', r)} />
              <CameraInventory onResult={(r) => setResult('cameras', r)} />
              <BatteryLab onResult={(r) => setResult('battery', r)} />
              <RefreshRate onResult={(r) => setResult('refreshRate', r)} />
              <IMEIVerification key={`imei-${resetKeys.imei}`} onResult={(r) => setResult('imei', r)} />
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

        {/* VERIFY STEP */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">Hardware Verification</h1>
              <p className="text-sm text-white/50 mt-1">Test each component to verify functionality.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AudioSpectrum key={`audio-${resetKeys.audio}`} onResult={(r) => setResult('audio', r)} onRedo={() => handleRedo('audio')} />
              <OrientationLab key={`orientation-${resetKeys.orientation}`} onResult={(r) => setResult('orientation', r)} onRedo={() => handleRedo('orientation')} />
              <FlashlightToggle key={`flashlight-${resetKeys.flashlight}`} onResult={(r) => setResult('flashlight', r)} onRedo={() => handleRedo('flashlight')} />
              <TouchZoneMap key={`touchZone-${resetKeys.touchZone}`} onResult={(r) => setResult('touchZone', r)} onRedo={() => handleRedo('touchZone')} />
              <MultiTouch key={`multiTouch-${resetKeys.multiTouch}`} onResult={(r) => setResult('multiTouch', r)} onRedo={() => handleRedo('multiTouch')} />
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

        {/* SUMMARY STEP */}
        {step === 'summary' && (
          <HealthCertificate results={results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}

import { useState, useReducer, useCallback } from 'react';
import PreFlight from './components/PreFlight';
import Stepper from './components/Stepper';
import LabCard from './components/LabCard';
import DeviceContext from './labs/DeviceContext';
import CameraInventory from './labs/CameraInventory';
import BatteryLab from './labs/BatteryLab';
import RefreshRate from './labs/RefreshRate';
import HapticTest from './labs/HapticTest';
import AudioSpectrum from './labs/AudioSpectrum';
import OrientationLab from './labs/OrientationLab';
import FlashlightToggle from './labs/FlashlightToggle';
import TouchZoneMap from './labs/TouchZoneMap';
import MultiTouch from './labs/MultiTouch';
import PanelUniformity from './labs/PanelUniformity';
import HealthCertificate from './components/HealthCertificate';

const STEPS = ['scan', 'verify', 'summary'];

const initialResults = {
  deviceContext: null,
  cameras: null,
  battery: null,
  refreshRate: null,
  haptic: null,
  audio: null,
  orientation: null,
  flashlight: null,
  touchZone: null,
  multiTouch: null,
  panelUniformity: null,
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

  const setResult = useCallback((lab, result) => {
    dispatch({ type: 'SET_RESULT', lab, result });
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
  }, []);

  // Count completed scans
  const scanLabs = ['deviceContext', 'cameras', 'battery', 'refreshRate'];
  const scanComplete = scanLabs.every((lab) => results[lab] !== null);

  const verifyLabs = ['haptic', 'audio', 'orientation', 'flashlight', 'touchZone', 'multiTouch', 'panelUniformity'];
  const verifyComplete = verifyLabs.every((lab) => results[lab] !== null);

  if (step === 'preflight') {
    return <PreFlight onGranted={handlePermissionsGranted} />;
  }

  return (
    <div className="min-h-screen bg-white pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-p4l-red rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="font-bold text-sm text-charcoal tracking-tight">P4L Diagnostics</span>
            </div>
            <span className="text-xs text-charcoal-muted font-medium">
              {step === 'scan' ? 'Scanning...' : step === 'verify' ? 'Verifying...' : 'Complete'}
            </span>
          </div>
          <Stepper currentStep={step} steps={STEPS} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {/* SCAN STEP */}
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-charcoal">System Scan</h1>
              <p className="text-sm text-charcoal-muted mt-1">Automatically detecting your device hardware.</p>
            </div>

            <DeviceContext onResult={(r) => setResult('deviceContext', r)} />
            <CameraInventory onResult={(r) => setResult('cameras', r)} />
            <BatteryLab onResult={(r) => setResult('battery', r)} />
            <RefreshRate onResult={(r) => setResult('refreshRate', r)} />

            {scanComplete && (
              <div className="pt-4 animate-fade-in">
                <button onClick={handleScanComplete} className="btn-primary">
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
              <h1 className="text-xl font-bold text-charcoal">Hardware Verification</h1>
              <p className="text-sm text-charcoal-muted mt-1">Test each component to verify functionality.</p>
            </div>

            <HapticTest onResult={(r) => setResult('haptic', r)} />
            <AudioSpectrum onResult={(r) => setResult('audio', r)} />
            <OrientationLab onResult={(r) => setResult('orientation', r)} />
            <FlashlightToggle onResult={(r) => setResult('flashlight', r)} />
            <TouchZoneMap onResult={(r) => setResult('touchZone', r)} />
            <MultiTouch onResult={(r) => setResult('multiTouch', r)} />
            <PanelUniformity onResult={(r) => setResult('panelUniformity', r)} />

            {verifyComplete && (
              <div className="pt-4 animate-fade-in">
                <button onClick={handleVerifyComplete} className="btn-primary">
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

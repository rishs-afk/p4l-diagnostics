import { useState } from 'react';
import LabCard from '../components/LabCard';

export default function HapticTest({ onResult }) {
  const [tested, setTested] = useState(false);
  const [result, setResult] = useState(null);
  const [pulsing, setPulsing] = useState(false);
  const supported = typeof navigator.vibrate === 'function';

  const triggerVibration = () => {
    setPulsing(true);
    if (supported) {
      navigator.vibrate([100, 50, 150, 50, 200]);
    }
    setTimeout(() => setPulsing(false), 600);
    setTested(true);
  };

  const handleResult = (pass) => {
    const r = { status: pass ? 'pass' : 'fail', supported };
    setResult(r);
    onResult(r);
  };

  return (
    <LabCard
      title="Haptic Motor"
      icon="📳"
      status={result ? result.status : 'pending'}
      id="lab-haptic"
    >
      {!result ? (
        <div className="space-y-3">
          {!supported && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
              Vibration API not available on this device. A visual pulse will simulate the test.
            </div>
          )}

          <button
            onClick={triggerVibration}
            className="w-full relative py-4 bg-p4l-red text-white font-semibold text-sm rounded-xl 
                       transition-all duration-200 active:scale-[0.97] overflow-hidden"
            id="haptic-trigger-btn"
          >
            {/* Pulse ring effect */}
            {pulsing && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full border-2 border-white/40 animate-pulse-ring" />
              </span>
            )}
            <span className="relative z-10">
              {pulsing ? '⚡ Vibrating...' : tested ? 'Tap to Test Again' : '⚡ Tap to Vibrate'}
            </span>
          </button>

          {tested && (
            <div className="flex gap-2 animate-fade-in">
              <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="haptic-pass-btn">
                ✓ Felt It
              </button>
              <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="haptic-fail-btn">
                ✗ Nothing
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Vibration motor working' : '✗ Vibration not detected'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

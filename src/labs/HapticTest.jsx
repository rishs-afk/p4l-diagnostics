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
    setState('done');
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
      <path d="M12 18h.01"></path>
    </svg>
  );

  return (
    <LabCard
      title="Haptic Motor"
      icon={<Icon />}
      status={result ? result.status : 'pending'}
      id="lab-haptic"
    >
      {state !== 'done' && (
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
            {pulsing && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full border-2 border-white/40 animate-pulse-ring" />
              </span>
            )}
            <span className="relative z-10">
              {pulsing ? 'Vibrating...' : tested ? 'Tap to Test Again' : 'Tap to Vibrate'}
            </span>
          </button>

            <div className="flex gap-3 animate-fade-in">
              <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="haptic-pass-btn">
                ✓ Felt It
              </button>
              <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="haptic-fail-btn">
                ✗ Nothing
              </button>
            </div>
        </div>
      {state === 'done' && result && (
        <div className={`section-bg mt-4 ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Vibration motor working' : '✗ Vibration not detected'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

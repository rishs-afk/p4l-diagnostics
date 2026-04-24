import { useState } from 'react';
import LabCard from '../components/LabCard';

export default function HapticTest({ onResult, onRedo }) {
  const [state, setState] = useState('idle');
  const [tested, setTested] = useState(false);
  const [result, setResult] = useState(null);
  const [pulsing, setPulsing] = useState(false);
  const supported = typeof navigator.vibrate === 'function';

  const triggerVibration = () => {
    setPulsing(true);
    let pass = false;
    if (supported) {
      navigator.vibrate([100, 50, 150, 50, 200]);
      pass = true;
    }
    setTimeout(() => {
      setPulsing(false);
      handleResult(pass);
    }, 600);
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
      onRedo={onRedo}
    >
      {state !== 'done' && (
        <div className="space-y-3">
          {!supported && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
              Vibration API not available on this device.
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
              {pulsing ? 'Testing...' : 'Tap to Test Vibrate'}
            </span>
          </button>
        </div>
      )}
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

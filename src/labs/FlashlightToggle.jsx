import { useState, useRef, useCallback, useEffect } from 'react';
import LabCard from '../components/LabCard';

export default function FlashlightToggle({ onResult }) {
  const [state, setState] = useState('idle');
  const [torchOn, setTorchOn] = useState(false);
  const [supported, setSupported] = useState(true);
  const [result, setResult] = useState(null);
  const trackRef = useRef(null);
  const streamRef = useRef(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    trackRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const initTorch = async () => {
    setState('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      if (!capabilities || !capabilities.torch) {
        track.stop();
        setSupported(false);
        setState('unsupported');
        return;
      }
      trackRef.current = track;
      setState('ready');
    } catch {
      setSupported(false);
      setState('unsupported');
    }
  };

  const toggleTorch = async () => {
    if (!trackRef.current) return;
    const newState = !torchOn;
    try {
      await trackRef.current.applyConstraints({
        advanced: [{ torch: newState }],
      });
      setTorchOn(newState);
    } catch {}
  };

  const handleResult = (pass) => {
    cleanup();
    const r = { status: pass ? 'pass' : 'fail', supported };
    setResult(r);
    onResult(r);
  };

  const handleSkip = () => {
    cleanup();
    const r = { status: 'unsupported', reason: 'Torch not available' };
    setResult(r);
    onResult(r);
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
      <line x1="9" y1="18" x2="15" y2="18"></line>
      <line x1="10" y1="22" x2="14" y2="22"></line>
    </svg>
  );

  return (
    <LabCard
      title="Flashlight / Torch"
      icon={<Icon />}
      status={result ? result.status : state === 'ready' ? 'running' : 'pending'}
      id="lab-flashlight"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">Test your device's LED flash by toggling the torch.</p>
          <button onClick={initTorch} className="btn-primary" id="flashlight-init-btn">
            Initialize Torch
          </button>
        </div>
      )}

      {state === 'ready' && (
        <div className="space-y-3">
          <button
            onClick={toggleTorch}
            className={`w-full py-6 rounded-xl text-center transition-all duration-300 border-2 ${
              torchOn
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-charcoal'
            }`}
            id="flashlight-toggle-btn"
          >
            <p className="text-sm font-bold uppercase tracking-widest">{torchOn ? 'ON' : 'OFF'}</p>
            <p className="text-xs text-charcoal-muted mt-1 font-medium">Tap to toggle LED</p>
          </button>

          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="flashlight-pass-btn">
              Working
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="flashlight-fail-btn">
              Fail
            </button>
          </div>
        </div>
      )}

      {state === 'unsupported' && !result && (
        <div className="space-y-3">
          <div className="section-bg">
            <p className="text-xs text-charcoal-muted font-medium">
              Torch control is not supported on this device/browser.
            </p>
          </div>
          <button onClick={handleSkip} className="btn-secondary" id="flashlight-skip-btn">
            Skip Test
          </button>
        </div>
      )}

      {result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : result.status === 'fail' ? '!bg-red-50' : ''}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Flashlight working' : result.status === 'fail' ? '✗ Flashlight issue' : '— Torch not available'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

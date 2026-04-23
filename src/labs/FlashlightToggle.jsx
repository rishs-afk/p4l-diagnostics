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

      // Check if torch is supported
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
    } catch {
      // Torch toggle failed
    }
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

  return (
    <LabCard
      title="Flashlight / Torch"
      icon="🔦"
      status={result ? result.status : state === 'ready' ? 'running' : 'pending'}
      id="lab-flashlight"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted">Test your device's LED flash by toggling the torch.</p>
          <button onClick={initTorch} className="btn-primary" id="flashlight-init-btn">
            🔦 Initialize Torch
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-p4l-red animate-pulse" />
          <p className="text-xs text-charcoal-muted">Accessing camera for torch control...</p>
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
            <div className="text-3xl mb-1">{torchOn ? '💡' : '🔦'}</div>
            <p className="text-sm font-semibold">{torchOn ? 'Torch ON' : 'Torch OFF'}</p>
            <p className="text-xs text-charcoal-muted mt-0.5">Tap to toggle</p>
          </button>

          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="flashlight-pass-btn">
              ✓ Working
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="flashlight-fail-btn">
              ✗ Not Working
            </button>
          </div>
        </div>
      )}

      {state === 'unsupported' && !result && (
        <div className="space-y-3">
          <div className="section-bg">
            <p className="text-xs text-charcoal-muted">
              Torch control is not supported on this device/browser. This is common on iOS Safari and some desktop browsers.
            </p>
          </div>
          <button onClick={handleSkip} className="btn-secondary" id="flashlight-skip-btn">
            Skip This Test
          </button>
        </div>
      )}

      {result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : result.status === 'fail' ? '!bg-red-50' : ''}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Flashlight working' : result.status === 'fail' ? '✗ Flashlight issue' : '— Torch not available on this device'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

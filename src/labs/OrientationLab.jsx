import { useState, useEffect, useRef, useCallback } from 'react';
import LabCard from '../components/LabCard';

export default function OrientationLab({ onResult }) {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [inTarget, setInTarget] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [supported, setSupported] = useState(true);
  const listenerRef = useRef(null);
  const holdTimerRef = useRef(null);

  const TARGET = { x: 75, y: 25, radius: 15 };
  const HOLD_REQUIRED = 1.5;

  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('deviceorientation', listenerRef.current);
      listenerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startTest = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          setSupported(false);
          const r = { status: 'fail', reason: 'Permission denied' };
          setResult(r);
          onResult(r);
          setState('done');
          return;
        }
      } catch {
        setSupported(false);
        const r = { status: 'fail', reason: 'Permission request failed' };
        setResult(r);
        onResult(r);
        setState('done');
        return;
      }
    }

    setState('testing');
    const handler = (event) => {
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;
      const x = Math.min(100, Math.max(0, 50 + (gamma / 45) * 50));
      const y = Math.min(100, Math.max(0, 50 + ((beta - 45) / 45) * 50));
      setPosition({ x, y });
      const dx = x - TARGET.x;
      const dy = y - TARGET.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setInTarget(dist < TARGET.radius);
    };
    window.addEventListener('deviceorientation', handler);
    listenerRef.current = handler;
  };

  useEffect(() => {
    if (state !== 'testing') return;
    if (inTarget) {
      holdTimerRef.current = setInterval(() => {
        setHoldTime((prev) => {
          const next = prev + 0.1;
          if (next >= HOLD_REQUIRED) {
            cleanup();
            const r = { status: 'pass' };
            setResult(r);
            onResult(r);
            setState('done');
          }
          return next;
        });
      }, 100);
    } else {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      setHoldTime(0);
    }
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, [inTarget, state, cleanup]);

  const handleSkip = (pass) => {
    cleanup();
    const r = { status: pass ? 'pass' : 'fail' };
    setResult(r);
    onResult(r);
    setState('done');
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
    </svg>
  );

  return (
    <LabCard
      title="Orientation Sensor"
      icon={<Icon />}
      status={result ? result.status : state === 'testing' ? 'running' : 'pending'}
      id="lab-orientation"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">Tilt your device to move the marker into the target zone.</p>
          <button onClick={startTest} className="btn-primary" id="orientation-start-btn">
            Start Tilt Test
          </button>
        </div>
      )}

      {state === 'testing' && (
        <div className="space-y-3">
          <div className="section-bg relative overflow-hidden" style={{ height: '180px' }}>
            <div
              className={`absolute w-12 h-12 rounded-full border-2 border-dashed transition-colors duration-300 ${
                inTarget ? 'border-emerald-pass bg-emerald-pass/20' : 'border-slate-300'
              }`}
              style={{
                left: `${TARGET.x}%`,
                top: `${TARGET.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {inTarget && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-pass">{holdTime.toFixed(1)}s</span>
                </div>
              )}
            </div>

            <div
              className={`absolute w-6 h-6 rounded-full shadow-lg transition-colors duration-200 ${
                inTarget ? 'bg-emerald-pass' : 'bg-p4l-red'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.1s, top 0.1s',
              }}
            />
          </div>

          <p className="text-xs text-charcoal-muted text-center font-medium">
            Tilt dot into circle
          </p>

          <div className="flex gap-2">
            <button onClick={() => handleSkip(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="orientation-pass-btn">
              Working
            </button>
            <button onClick={() => handleSkip(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="orientation-fail-btn">
              Fail
            </button>
          </div>
        </div>
      )}

      {state === 'done' && result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Gyroscope responding correctly' : '✗ Orientation sensor issue'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

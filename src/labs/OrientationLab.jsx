import { useState, useEffect, useRef, useCallback } from 'react';
import LabCard from '../components/LabCard';

export default function OrientationLab({ onResult }) {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [inTarget, setInTarget] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [raw, setRaw] = useState({ beta: 0, gamma: 0 });
  const listenerRef = useRef(null);
  const holdTimerRef = useRef(null);

  const TARGET = { x: 75, y: 25, radius: 15 };
  const HOLD_REQUIRED = 1.5;

  const cleanup = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('deviceorientation', listenerRef.current);
      window.removeEventListener('deviceorientationabsolute', listenerRef.current);
      listenerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startTest = async () => {
    let permissionGranted = false;

    // 1. Request Permission (iOS)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        permissionGranted = perm === 'granted';
      } catch (err) {
        console.error('Permission request failed:', err);
      }
    } else {
      // Android or older browsers
      permissionGranted = true;
    }

    if (!permissionGranted) {
      const r = { status: 'fail', reason: 'Permission denied' };
      setResult(r);
      onResult(r);
      setState('done');
      return;
    }

    // 2. Start Testing State
    setState('testing');
    setHoldTime(0);

    // 3. Define Handler with Orientation Awareness
    const handler = (event) => {
      // Use beta and gamma
      let beta = event.beta || 0;
      let gamma = event.gamma || 0;
      
      setRaw({ beta, gamma });

      // Handle screen orientation (Portrait vs Landscape)
      const orientation = window.orientation || (window.screen && window.screen.orientation && window.screen.orientation.angle) || 0;

      let x, y;
      
      if (orientation === 90) { // Landscape Left
        x = 50 + (beta / 90) * 50;
        y = 50 + (-gamma / 90) * 50;
      } else if (orientation === -90 || orientation === 270) { // Landscape Right
        x = 50 + (-beta / 90) * 50;
        y = 50 + (gamma / 90) * 50;
      } else if (orientation === 180) { // Upside Down
        x = 50 + (-gamma / 90) * 50;
        y = 50 + (-beta / 90) * 50;
      } else { // Portrait
        x = 50 + (gamma / 90) * 50;
        y = 50 + (beta / 90) * 50;
      }

      // Constrain and Update
      const constrainedX = Math.min(100, Math.max(0, x));
      const constrainedY = Math.min(100, Math.max(0, y));
      
      setPosition({ x: constrainedX, y: constrainedY });

      // Check Target
      const dx = constrainedX - TARGET.x;
      const dy = constrainedY - TARGET.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setInTarget(dist < TARGET.radius);
    };

    // 4. Attach Listeners Immediately
    const eventType = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventType, handler, true);
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

      {state === 'testing' && !result && (
        <div className="space-y-3">
          <div className="section-bg relative overflow-hidden bg-slate-50 border border-slate-100" style={{ height: '180px' }}>
            {/* Target Area */}
            <div
              className={`absolute w-14 h-14 rounded-full border-2 border-dashed transition-all duration-300 ${
                inTarget ? 'border-emerald-pass bg-emerald-pass/20 scale-110' : 'border-slate-300'
              }`}
              style={{
                left: `${TARGET.x}%`,
                top: `${TARGET.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {inTarget ? (
                  <span className="text-xs font-bold text-emerald-pass">{holdTime.toFixed(1)}s</span>
                ) : (
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                )}
              </div>
            </div>

            {/* Tilt Dot */}
            <div
              className={`absolute w-6 h-6 rounded-full shadow-lg transition-colors duration-200 ${
                inTarget ? 'bg-emerald-pass scale-110' : 'bg-p4l-red'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <p className="text-[10px] text-charcoal-muted font-bold uppercase tracking-tight">
               Tilt phone to reach target
             </p>
             <p className="text-[9px] text-slate-400 font-mono">
               B: {raw.beta.toFixed(0)}° G: {raw.gamma.toFixed(0)}°
             </p>
          </div>

          <div className="flex gap-3">
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
        <div className={`section-bg mt-4 ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Gyroscope responding correctly' : '✗ Orientation sensor issue'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

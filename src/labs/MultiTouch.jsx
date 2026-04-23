import { useState, useRef, useEffect, useCallback } from 'react';
import LabCard from '../components/LabCard';

const COLORS = ['#E30613', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'];

export default function MultiTouch({ onResult }) {
  const [state, setState] = useState('idle');
  const [touches, setTouches] = useState([]);
  const [maxTouches, setMaxTouches] = useState(0);
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);
  const maxRef = useRef(0);

  const startTest = () => {
    setState('testing');
    maxRef.current = 0;
    setMaxTouches(0);
  };

  const handleTouch = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentTouches = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      currentTouches.push({
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        id: t.identifier,
        color: COLORS[t.identifier % COLORS.length],
      });
    }
    setTouches(currentTouches);
    if (currentTouches.length > maxRef.current) {
      maxRef.current = currentTouches.length;
      setMaxTouches(currentTouches.length);
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 0) setTouches([]);
    else handleTouch(e);
  }, [handleTouch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state !== 'testing') return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    touches.forEach((t) => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, 30, 0, Math.PI * 2);
      ctx.fillStyle = t.color + '20';
      ctx.fill();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.fill();
    });
  }, [touches, state]);

  const handleResult = (pass) => {
    const r = { status: pass ? 'pass' : 'fail', maxTouches: maxRef.current };
    setResult(r);
    onResult(r);
    setState('done');
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
    </svg>
  );

  return (
    <LabCard
      title="Multi-Touch Test"
      icon={<Icon />}
      status={result ? result.status : state === 'testing' ? 'running' : 'pending'}
      id="lab-multi-touch"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">Place multiple fingers on the screen to test multi-touch support.</p>
          <button onClick={startTest} className="btn-primary" id="multitouch-start-btn">
            Start Multi-Touch Test
          </button>
        </div>
      )}

      {state === 'testing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal">Active: {touches.length}</span>
            <span className="text-xs font-semibold text-p4l-red">Max: {maxTouches}</span>
          </div>
          <div className="section-bg relative overflow-hidden rounded-xl" style={{ height: '220px' }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none"
              onTouchStart={handleTouch}
              onTouchMove={handleTouch}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
            />
            {touches.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-charcoal-muted font-medium">Touch the area with multiple fingers</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="multitouch-pass-btn">
              Working
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="multitouch-fail-btn">
              Fail
            </button>
          </div>
        </div>
      )}

      {state === 'done' && result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass'
              ? `✓ Multi-touch working — ${result.maxTouches} points detected`
              : `✗ Multi-touch issue — max ${result.maxTouches} points`}
          </p>
        </div>
      )}
    </LabCard>
  );
}

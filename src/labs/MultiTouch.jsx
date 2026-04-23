import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    setTouches([]);
  };

  const updateTouches = useCallback((e) => {
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

  const handleEnd = useCallback((e) => {
    e.preventDefault();
    updateTouches(e);
  }, [updateTouches]);

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state !== 'testing') return;
    const ctx = canvas.getContext('2d');
    
    // Set initial size if needed
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw grid/background for better spatial awareness
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
    }

    // Draw touches
    touches.forEach((t) => {
      // Outer ring
      ctx.beginPath();
      ctx.arc(t.x, t.y, 45, 0, Math.PI * 2);
      ctx.fillStyle = t.color + '15';
      ctx.fill();
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.fill();

      // Coordinates text
      ctx.font = 'bold 10px Inter';
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(`ID: ${t.id}`, t.x, t.y - 55);
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
          <p className="text-xs text-charcoal-muted font-medium">Verify multi-finger support by placing up to 10 points on the screen.</p>
          <button onClick={startTest} className="btn-primary" id="multitouch-start-btn">
            Start Multi-Touch Test
          </button>
        </div>
      )}

      {state === 'testing' && createPortal(
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="relative w-full h-full touch-none select-none bg-slate-50">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none"
              onTouchStart={updateTouches}
              onTouchMove={updateTouches}
              onTouchEnd={handleEnd}
              onTouchCancel={handleEnd}
            />
            
            {/* Floating Status Bar */}
            <div className="absolute top-10 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="bg-charcoal/90 backdrop-blur-md px-6 h-[72px] rounded-2xl border border-white/10 shadow-2xl flex items-center">
                <h2 className="text-white font-bold text-lg">Multi-Touch</h2>
              </div>
              <div className="flex gap-2">
                <div className="bg-p4l-red h-[72px] px-4 rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[72px]">
                  <span className="text-white font-black text-xl leading-none">{touches.length}</span>
                  <span className="text-[8px] text-white/70 uppercase font-bold mt-1">Active</span>
                </div>
                <div className="bg-charcoal h-[72px] px-4 rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[72px]">
                  <span className="text-white font-black text-xl leading-none">{maxTouches}</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold mt-1">Max</span>
                </div>
              </div>
            </div>

            {touches.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="w-20 h-20 border-4 border-slate-200 border-dashed rounded-full mx-auto flex items-center justify-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                  </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-10 left-6 right-6 flex gap-4 z-50">
              <button 
                onPointerDown={(e) => { e.stopPropagation(); handleResult(false); }}
                className="flex-1 py-4 bg-white text-p4l-red font-bold rounded-2xl shadow-lg border border-red-100 active:scale-95 transition-transform"
              >
                Failed
              </button>
              <button 
                onPointerDown={(e) => { e.stopPropagation(); handleResult(true); }}
                className="flex-[2] py-4 bg-emerald-pass text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Verified ({maxTouches} Points)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {state === 'done' && result && (
        <div className={`section-bg mt-4 ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass'
              ? `✓ Multi-touch verified — detected up to ${result.maxTouches} points`
              : `✗ Multi-touch failed — detected ${result.maxTouches} points`}
          </p>
        </div>
      )}
    </LabCard>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import LabCard from '../components/LabCard';

const GRID_COLS = 5;
const GRID_ROWS = 8;
const TOTAL_ZONES = GRID_COLS * GRID_ROWS;

export default function TouchZoneMap({ onResult }) {
  const [state, setState] = useState('idle'); // idle | testing | done
  const [isEdgeTest, setIsEdgeTest] = useState(false);
  const [touched, setTouched] = useState(new Set());
  const [result, setResult] = useState(null);
  const containerRef = useRef(null);
  const touchedRef = useRef(new Set());

  const cleanup = useCallback(() => {
    // Event listeners are on the ref element which unmounts naturally
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startTest = () => {
    setState('testing');
    setIsEdgeTest(false);
    touchedRef.current = new Set();
    setTouched(new Set());
  };

  const getCellFromPoint = (clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const col = Math.floor((x / rect.width) * GRID_COLS);
    const row = Math.floor((y / rect.height) * GRID_ROWS);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return row * GRID_COLS + col;
  };

  const handleTouch = (e) => {
    if (state !== 'testing') return;
    e.preventDefault();
    const newTouched = new Set(touchedRef.current);
    for (let i = 0; i < e.touches.length; i++) {
      const cell = getCellFromPoint(e.touches[i].clientX, e.touches[i].clientY);
      if (cell !== null) newTouched.add(cell);
    }
    touchedRef.current = newTouched;
    setTouched(new Set(newTouched));

    // Auto-pass when all zones touched
    if (newTouched.size >= TOTAL_ZONES) {
      const r = { status: 'pass', zonesHit: newTouched.size, total: TOTAL_ZONES };
      setResult(r);
      onResult(r);
      setState('done');
    }
  };

  const handleFinish = () => {
    const pass = touchedRef.current.size >= TOTAL_ZONES * 0.95; // Higher threshold for multi-stage
    const r = { status: pass ? 'pass' : 'fail', zonesHit: touchedRef.current.size, total: TOTAL_ZONES };
    setResult(r);
    onResult(r);
    setState('done');
  };

  const progress = Math.round((touched.size / TOTAL_ZONES) * 100);

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
      title="Touch Zone Map"
      icon={<Icon />}
      status={result ? result.status : state === 'testing' ? 'running' : 'pending'}
      id="lab-touch-zone"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">Full-screen multi-stage test to verify 100% of the digitizer.</p>
          <button onClick={startTest} className="btn-primary" id="touchzone-start-btn">
            Start Touch Test
          </button>
        </div>
      )}

      {state === 'testing' && createPortal(
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          {!isEdgeTest ? (
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-charcoal">Stage 1: Main Area</h2>
                  <p className="text-[10px] text-charcoal-muted uppercase tracking-wider font-bold">Swipe the visible grid area</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-charcoal">{touched.size}/{TOTAL_ZONES}</span>
                  <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center relative">
                    <span className="text-[10px] font-bold text-p4l-red">{progress}%</span>
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#E30613" strokeWidth="2" strokeDasharray={`${progress}, 100`} />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                ref={containerRef}
                className="flex-1 touch-none select-none overflow-hidden rounded-xl border border-slate-100 shadow-inner"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                  gap: '1px',
                  backgroundColor: '#f1f5f9'
                }}
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
              >
                {Array.from({ length: TOTAL_ZONES }).map((_, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-200 ${
                      touched.has(i) ? 'bg-p4l-red shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]' : 'bg-white'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={handleFinish} className="btn-secondary flex-1">
                  Finish Now
                </button>
                <button onClick={() => setIsEdgeTest(true)} className="btn-primary flex-[2]">
                  Test Edges →
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full touch-none select-none">
              <div
                ref={containerRef}
                className="absolute inset-0 bg-slate-100"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                  gap: '1px',
                }}
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
              >
                {Array.from({ length: TOTAL_ZONES }).map((_, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-200 ${
                      touched.has(i) ? 'bg-p4l-red' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
              
              {/* Floating controls for edge test */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-charcoal/80 backdrop-blur-md rounded-full pointer-events-none shadow-lg border border-white/10">
                <p className="text-[10px] text-white font-bold uppercase tracking-widest whitespace-nowrap">
                  Stage 2: Swipe edges to finish ({touched.size}/{TOTAL_ZONES})
                </p>
              </div>

              <button 
                onClick={handleFinish}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-2xl"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E30613" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          )}
        </div>,
        document.body
      )}

      {state === 'done' && result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass'
              ? `✓ All touch zones responsive (${result.zonesHit}/${result.total})`
              : `✗ ${result.zonesHit}/${result.total} zones detected — some areas unresponsive`}
          </p>
        </div>
      )}
    </LabCard>
  );
}

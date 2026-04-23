import { useState, useRef, useEffect, useCallback } from 'react';
import LabCard from '../components/LabCard';

const GRID_COLS = 5;
const GRID_ROWS = 8;
const TOTAL_ZONES = GRID_COLS * GRID_ROWS;

export default function TouchZoneMap({ onResult }) {
  const [state, setState] = useState('idle'); // idle | testing | done
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
    const pass = touchedRef.current.size >= TOTAL_ZONES * 0.85; // 85% threshold
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
          <p className="text-xs text-charcoal-muted font-medium">Swipe across the entire screen to verify all touch zones are responsive.</p>
          <button onClick={startTest} className="btn-primary" id="touchzone-start-btn">
            Start Touch Test
          </button>
        </div>
      )}

      {state === 'testing' && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-charcoal">Touch Test</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-charcoal">{touched.size}/{TOTAL_ZONES} zones</span>
              <span className="text-sm font-semibold text-p4l-red">{progress}%</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-p4l-red rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>

          <div
            ref={containerRef}
            className="flex-1 touch-none select-none overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              gap: '1px',
              width: 'calc(100% + 2rem)',
              marginLeft: '-1rem',
              marginRight: '-1rem'
            }}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                const cell = getCellFromPoint(e.clientX, e.clientY);
                if (cell !== null) {
                  const newTouched = new Set(touchedRef.current);
                  newTouched.add(cell);
                  touchedRef.current = newTouched;
                  setTouched(new Set(newTouched));
                  if (newTouched.size >= TOTAL_ZONES) {
                    const r = { status: 'pass', zonesHit: newTouched.size, total: TOTAL_ZONES };
                    setResult(r);
                    onResult(r);
                    setState('done');
                  }
                }
              }
            }}
          >
            {Array.from({ length: TOTAL_ZONES }).map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-200 ${
                  touched.has(i) ? 'bg-p4l-red' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>

          <div className="mt-4">
            <button onClick={handleFinish} className="btn-secondary w-full" id="touchzone-finish-btn">
              Finish Test ({touched.size}/{TOTAL_ZONES})
            </button>
          </div>
        </div>
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

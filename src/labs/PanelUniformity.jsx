import { useState } from 'react';
import LabCard from '../components/LabCard';

const COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
];

export default function PanelUniformity({ onResult }) {
  const [state, setState] = useState('idle');
  const [colorIndex, setColorIndex] = useState(0);
  const [result, setResult] = useState(null);

  const startTest = () => {
    setState('testing');
    setColorIndex(0);
  };

  const nextColor = () => {
    if (colorIndex < COLORS.length - 1) {
      setColorIndex((i) => i + 1);
    } else {
      setState('confirm');
    }
  };

  const handleResult = (pass) => {
    const r = { status: pass ? 'pass' : 'fail' };
    setResult(r);
    onResult(r);
    setState('done');
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );

  if (state === 'testing') {
    const color = COLORS[colorIndex];
    const isLight = color.name === 'White' || color.name === 'Red' || color.name === 'Green';
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-end pb-12 cursor-pointer select-none"
        style={{ backgroundColor: color.value }}
        onClick={nextColor}
        id="panel-color-overlay"
      >
        <div className={`text-center ${isLight ? 'text-black/40' : 'text-white/40'}`}>
          <p className="text-sm font-bold mb-1 uppercase tracking-widest">
            {color.name} ({colorIndex + 1}/{COLORS.length})
          </p>
          <p className="text-xs font-medium">Tap to continue</p>
        </div>
        <div className="flex gap-2 mt-4">
          {COLORS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i <= colorIndex
                  ? isLight ? 'bg-black/30' : 'bg-white/50'
                  : isLight ? 'bg-black/10' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <LabCard
      title="Display Panel Check"
      icon={<Icon />}
      status={result ? result.status : state === 'confirm' ? 'running' : 'pending'}
      id="lab-panel-uniformity"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">
            Cycle through full-screen colors to check for dead pixels or panel defects.
          </p>
          <button onClick={startTest} className="btn-primary" id="panel-start-btn">
            Start Panel Test
          </button>
        </div>
      )}

      {state === 'confirm' && (
        <div className="space-y-3">
          <div className="section-bg">
            <p className="text-sm font-bold text-charcoal mb-1">Panel test complete</p>
            <p className="text-xs text-charcoal-muted font-medium">Did you notice any dead pixels or color irregularities?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="panel-pass-btn">
              Looks Good
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="panel-fail-btn">
              Issues Found
            </button>
          </div>
        </div>
      )}

      {state === 'done' && result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Display panel appears uniform' : '✗ Display panel issue reported'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

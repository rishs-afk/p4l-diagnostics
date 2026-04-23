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
  const [state, setState] = useState('idle'); // idle | testing | done
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
      // Finished all colors — ask for result
      setState('confirm');
    }
  };

  const handleResult = (pass) => {
    const r = { status: pass ? 'pass' : 'fail' };
    setResult(r);
    onResult(r);
    setState('done');
  };

  // Full-screen color overlay
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
          <p className="text-sm font-semibold mb-1">
            {color.name} ({colorIndex + 1}/{COLORS.length})
          </p>
          <p className="text-xs">Tap anywhere for next color</p>
        </div>

        {/* Progress dots */}
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
      icon="🎨"
      status={result ? result.status : state === 'confirm' ? 'running' : 'pending'}
      id="lab-panel-uniformity"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted">
            Cycle through full-screen colors to check for dead pixels, uneven brightness, or panel defects.
          </p>
          <button onClick={startTest} className="btn-primary" id="panel-start-btn">
            🎨 Start Panel Test
          </button>
        </div>
      )}

      {state === 'confirm' && (
        <div className="space-y-3">
          <div className="section-bg">
            <p className="text-sm font-medium text-charcoal mb-1">Panel test complete</p>
            <p className="text-xs text-charcoal-muted">Did you notice any dead pixels, color irregularities, or uneven brightness?</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="panel-pass-btn">
              ✓ Looks Good
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="panel-fail-btn">
              ✗ Issues Found
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

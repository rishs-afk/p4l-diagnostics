import { useState } from 'react';
import { createPortal } from 'react-dom';
import LabCard from '../components/LabCard';

const COLORS = [
  { name: 'Black', bg: '#000000', text: '#ffffff' },
  { name: 'White', bg: '#ffffff', text: '#000000' },
  { name: 'Red',   bg: '#ff0000', text: '#ffffff' },
  { name: 'Green', bg: '#00cc44', text: '#000000' },
  { name: 'Blue',  bg: '#0055ff', text: '#ffffff' },
];

const Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export default function PixelDrop({ onResult, onRedo }) {
  const [state, setState] = useState('idle');
  const [colorIndex, setColorIndex] = useState(0);
  const [result, setResult] = useState(null);

  const startTest = () => {
    setColorIndex(0);
    setState('testing');
  };

  const nextColor = () => {
    if (colorIndex < COLORS.length - 1) {
      setColorIndex((i) => i + 1);
    }
  };

  const finish = (pass) => {
    setState('done');
    const r = { status: pass ? 'pass' : 'fail' };
    setResult(r);
    onResult(r);
  };

  const current = COLORS[colorIndex];
  const isLast = colorIndex === COLORS.length - 1;

  return (
    <LabCard
      title="Pixel Drop"
      icon={<Icon />}
      status={result ? result.status : state === 'testing' ? 'running' : 'pending'}
      id="lab-pixel-drop"
      onRedo={onRedo}
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Cycles through solid colors to reveal dead or stuck pixels on the display.
          </p>
          <button onClick={startTest} className="btn-primary" id="pixel-drop-start-btn">
            Start Pixel Test
          </button>
        </div>
      )}

      {state === 'testing' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: current.bg }}
          onClick={!isLast ? nextColor : undefined}
        >
          <div style={{ color: current.text }} className="text-center space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] opacity-50">
              {colorIndex + 1} / {COLORS.length} — {current.name}
            </p>
            {!isLast && (
              <p className="text-xs opacity-30">Tap to continue</p>
            )}
            {isLast && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => finish(false)}
                  className="px-5 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.18)', color: current.text }}
                >
                  Dead pixels found
                </button>
                <button
                  onClick={() => finish(true)}
                  className="px-5 py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.18)', color: current.text }}
                >
                  Display looks good ✓
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {state === 'done' && result && (
        <div className={`section-bg mt-4 ${result.status === 'pass' ? '!bg-emerald-50 border-emerald-200' : '!bg-red-50 border-red-200'}`}>
          <p className={`text-sm font-medium ${result.status === 'pass' ? 'text-emerald-700' : 'text-red-600'}`}>
            {result.status === 'pass' ? '✓ Display pixel check passed' : '✗ Dead or stuck pixels detected'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

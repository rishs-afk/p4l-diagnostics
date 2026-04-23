import { useMemo } from 'react';

export default function HealthCertificate({ results, onRestart }) {
  const { score, totalLabs, passedLabs, details } = useMemo(() => {
    const labs = [
      { id: 'deviceContext', label: 'Device Integrity', icon: '📱' },
      { id: 'cameras', label: 'Camera Array', icon: '📸' },
      { id: 'battery', label: 'Power System', icon: '🔋' },
      { id: 'refreshRate', label: 'Display Physics', icon: '🖥️' },
      { id: 'haptic', label: 'Haptic Feedback', icon: '📳' },
      { id: 'audio', label: 'Audio Quality', icon: '🎤' },
      { id: 'orientation', label: 'Motion Sensors', icon: '🔄' },
      { id: 'flashlight', label: 'Flash/Torch', icon: '🔦' },
      { id: 'touchZone', label: 'Digitizer Map', icon: '👆' },
      { id: 'multiTouch', label: 'Multi-Touch', icon: '🤚' },
      { id: 'panelUniformity', label: 'Panel Uniformity', icon: '🎨' },
    ];

    const details = labs.map((lab) => {
      const res = results[lab.id];
      const status = res?.status || 'skipped';
      return { ...lab, status };
    });

    const passed = details.filter((d) => d.status === 'pass').length;
    const total = details.filter((d) => d.status !== 'unsupported' && d.status !== 'skipped').length;
    
    // Calculate score out of 100
    const calculatedScore = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { score: calculatedScore, totalLabs: total, passedLabs: passed, details };
  }, [results]);

  const dashOffset = 283 - (283 * score) / 100;

  return (
    <div className="animate-fade-in pb-12">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        {/* Certificate Header */}
        <div className="bg-slate-50 px-6 py-8 text-center border-b border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              {/* Circular Progress */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="283"
                  style={{ 
                    strokeDashoffset: dashOffset,
                    transition: 'stroke-dashoffset 1.5s ease-out'
                  }}
                  className="text-p4l-red"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-charcoal">{score}</span>
                <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-tighter">Score</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-charcoal">Device Health Certificate</h2>
          <p className="text-sm text-charcoal-muted mt-1">Verified Hardware Scan • {new Date().toLocaleDateString()}</p>
        </div>

        {/* Device Summary */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="section-bg p-3">
              <p className="text-[10px] font-bold text-charcoal-muted uppercase mb-1">Status</p>
              <p className={`text-sm font-bold ${score >= 90 ? 'text-emerald-pass' : 'text-p4l-red'}`}>
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Action Required'}
              </p>
            </div>
            <div className="section-bg p-3">
              <p className="text-[10px] font-bold text-charcoal-muted uppercase mb-1">Passed Tests</p>
              <p className="text-sm font-bold text-charcoal">{passedLabs} / {totalLabs}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-charcoal-muted uppercase tracking-widest mb-4">Detailed Report</h3>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {details.map((lab) => (
              <div key={lab.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lab.icon}</span>
                  <span className="text-sm font-medium text-charcoal">{lab.label}</span>
                </div>
                <div>
                  {lab.status === 'pass' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-pass bg-emerald-50 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Pass
                    </span>
                  ) : lab.status === 'fail' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-p4l-red bg-red-50 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Fail
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                      {lab.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 bg-white border-t border-slate-100">
          <button 
            className="btn-primary mb-3 shadow-lg shadow-p4l-red/20"
            onClick={() => window.open('https://protect4less.com/buy', '_blank')}
          >
            Protect This Device
          </button>
          <button 
            onClick={onRestart}
            className="btn-secondary"
          >
            Run New Diagnostic
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-charcoal-muted mt-6 px-8 leading-relaxed">
        This certificate is a point-in-time assessment of device hardware health based on accessible browser APIs.
      </p>
    </div>
  );
}

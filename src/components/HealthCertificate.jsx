import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const icons = {
  deviceContext: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  cameras: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  ),
  battery: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
      <line x1="23" y1="13" x2="23" y2="11"></line>
    </svg>
  ),
  refreshRate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  haptic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
      <path d="M12 18h.01"></path>
    </svg>
  ),
  audio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  ),
  orientation: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
    </svg>
  ),
  flashlight: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
      <line x1="9" y1="18" x2="15" y2="18"></line>
      <line x1="10" y1="22" x2="14" y2="22"></line>
    </svg>
  ),
  touchZone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
    </svg>
  ),
  multiTouch: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
    </svg>
  ),
  panelUniformity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
};

export default function HealthCertificate({ results, onRestart }) {
  const certificateRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const { score, totalLabs, passedLabs, details } = useMemo(() => {
    const labs = [
      { id: 'deviceContext', label: 'Device Integrity' },
      { id: 'cameras', label: 'Camera Array' },
      { id: 'battery', label: 'Power System' },
      { id: 'refreshRate', label: 'Display Physics' },
      { id: 'haptic', label: 'Haptic Feedback' },
      { id: 'audio', label: 'Audio Quality' },
      { id: 'orientation', label: 'Motion Sensors' },
      { id: 'flashlight', label: 'Flash/Torch' },
      { id: 'touchZone', label: 'Digitizer Map' },
      { id: 'multiTouch', label: 'Multi-Touch' },
      { id: 'panelUniformity', label: 'Panel Uniformity' },
    ];

    const details = labs.map((lab) => {
      const res = results[lab.id];
      const status = res?.status || 'skipped';
      return { ...lab, status, icon: icons[lab.id] };
    });

    const passed = details.filter((d) => d.status === 'pass').length;
    const total = details.filter((d) => d.status !== 'unsupported' && d.status !== 'skipped').length;
    const calculatedScore = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { score: calculatedScore, totalLabs: total, passedLabs: passed, details };
  }, [results]);

  const exportPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);

    try {
      // Small delay to ensure any UI state updates are settled
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Hide elements we don't want in the PDF
          const actionArea = clonedDoc.querySelector('[data-pdf-ignore]');
          if (actionArea) actionArea.style.display = 'none';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`P4L-Health-Certificate-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const dashOffset = 283 - (283 * score) / 100;

  return (
    <div className="animate-fade-in pb-12">
      <div ref={certificateRef} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="bg-slate-50 px-6 py-8 text-center border-b border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="283" style={{ strokeDashoffset: dashOffset, transition: 'stroke-dashoffset 1.5s ease-out' }} className="text-p4l-red" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-charcoal">{score}</span>
                <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-tighter">Score</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal tracking-tight">Health Certificate</h2>
          <p className="text-sm text-charcoal-muted font-medium mt-1">Verified Hardware Scan • {new Date().toLocaleDateString()}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="section-bg p-3">
              <p className="text-[10px] font-bold text-charcoal-muted uppercase mb-1 tracking-wider">Status</p>
              <p className={`text-sm font-bold ${score >= 90 ? 'text-emerald-pass' : 'text-p4l-red'}`}>
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Action Required'}
              </p>
            </div>
            <div className="section-bg p-3">
              <p className="text-[10px] font-bold text-charcoal-muted uppercase mb-1 tracking-wider">Passed Tests</p>
              <p className="text-sm font-bold text-charcoal">{passedLabs} / {totalLabs}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-charcoal-muted uppercase tracking-widest mb-4">Detailed Report</h3>
          <div className={`space-y-2 ${isExporting ? '' : 'max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'}`}>
            {details.map((lab) => (
              <div key={lab.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-p4l-red">{lab.icon}</span>
                  <span className="text-sm font-semibold text-charcoal">{lab.label}</span>
                </div>
                <div>
                  {lab.status === 'pass' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-pass bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      Pass
                    </span>
                  ) : lab.status === 'fail' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-p4l-red bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">
                      Fail
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                      {lab.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100" data-pdf-ignore>
          <button 
            onClick={exportPDF} 
            disabled={isExporting}
            className="w-full py-4 mb-3 bg-charcoal text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Health Certificate
              </>
            )}
          </button>
          
          <button className="btn-primary mb-3 shadow-lg shadow-p4l-red/20" onClick={() => window.open('https://protect4less.com/buy', '_blank')}>
            Protect This Device
          </button>
          <button onClick={onRestart} className="btn-secondary">
            Run New Diagnostic
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-charcoal-muted font-medium mt-6 px-8 leading-relaxed uppercase tracking-tighter opacity-60">
        Certified Hardware Assessment • Protect4Less Diagnostic Tool
      </p>
    </div>
  );
}

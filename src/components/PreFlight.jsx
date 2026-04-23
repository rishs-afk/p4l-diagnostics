import { useState, useCallback } from 'react';

export default function PreFlight({ onGranted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Request camera + mic together
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Immediately stop — we only need the permission unlock
      stream.getTracks().forEach((t) => t.stop());
      onGranted({ camera: 'granted', mic: 'granted' });
    } catch (err) {
      // Try camera-only fallback
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        onGranted({ camera: 'granted', mic: 'denied' });
      } catch {
        setError('Camera access is required to run the diagnostic. Please allow access and try again.');
        setLoading(false);
      }
    }
  }, [onGranted]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Brand mark */}
        <div className="mx-auto w-16 h-16 bg-p4l-red rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-p4l-red/20 animate-fade-in">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-charcoal mb-2 animate-slide-up">
          Device Diagnostic
        </h1>
        <p className="text-sm text-charcoal/60 leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          We'll scan your device's hardware to verify everything is working properly. This helps determine the best protection plan for your device.
        </p>

        {/* Permission explanation */}
        <div className="section-bg !p-6 mb-10 text-left animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-[10px] font-bold text-charcoal/60 uppercase tracking-[0.1em] mb-5">What We'll Check</h3>
          <div className="space-y-6">
            {[
              { icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              ), label: 'Camera Array', desc: 'Front & rear camera detection' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              ), label: 'Microphone', desc: 'Audio input clarity test' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              ), label: 'Sensors', desc: 'Gyroscope, haptics & orientation' },
              { icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              ), label: 'Display', desc: 'Touch zones & panel uniformity' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="text-p4l-red mt-0.5">{item.icon}</div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-charcoal">{item.label}</p>
                  <p className="text-[11px] text-charcoal/60 leading-tight font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-flight note */}
        <div className="flex items-start gap-2 text-left mb-10 px-1 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <svg className="w-4 h-4 text-charcoal/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
          </svg>
          <p className="text-xs text-charcoal/50 leading-relaxed font-medium">
            Your browser will ask for camera and microphone access. This data stays on your device and is never uploaded.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-p4l-red text-left animate-fade-in">
            {error}
          </div>
        )}

        <button
          onClick={requestPermissions}
          disabled={loading}
          className="btn-primary animate-slide-up disabled:opacity-60"
          style={{ animationDelay: '0.2s' }}
          id="begin-scan-btn"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Requesting Access...
            </span>
          ) : (
            'Begin Diagnostic'
          )}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import LabCard from '../components/LabCard';

export default function RefreshRate({ onResult }) {
  const [hz, setHz] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const timestamps = [];
    let frameCount = 0;
    const TARGET_FRAMES = 90;

    function measure(ts) {
      if (cancelled) return;
      timestamps.push(ts);
      frameCount++;

      if (frameCount >= TARGET_FRAMES) {
        // Calculate average delta
        let totalDelta = 0;
        for (let i = 1; i < timestamps.length; i++) {
          totalDelta += timestamps[i] - timestamps[i - 1];
        }
        const avgDelta = totalDelta / (timestamps.length - 1);
        const detectedHz = Math.round(1000 / avgDelta);

        // Snap to common values
        let snapped = detectedHz;
        if (detectedHz >= 115 && detectedHz <= 125) snapped = 120;
        else if (detectedHz >= 85 && detectedHz <= 95) snapped = 90;
        else if (detectedHz >= 55 && detectedHz <= 65) snapped = 60;
        else if (detectedHz >= 140 && detectedHz <= 150) snapped = 144;

        if (!cancelled) {
          setHz(snapped);
          onResult({
            status: 'pass',
            data: { hz: snapped, raw: detectedHz },
          });
        }
        return;
      }

      rafRef.current = requestAnimationFrame(measure);
    }

    rafRef.current = requestAnimationFrame(measure);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hzLabel = hz
    ? hz >= 120 ? 'ProMotion' : hz >= 90 ? 'High Refresh' : 'Standard'
    : '';

  return (
    <LabCard
      title="Display Refresh Rate"
      icon="🖥️"
      status={hz ? 'pass' : 'running'}
      id="lab-refresh-rate"
    >
      {hz ? (
        <div className="section-bg flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-charcoal">{hz}<span className="text-sm font-medium text-charcoal-muted ml-1">Hz</span></p>
            <p className="text-xs text-charcoal-muted">{hzLabel}</p>
          </div>
          <div className="flex gap-1">
            {[60, 90, 120].map((tier) => (
              <div
                key={tier}
                className={`h-8 w-3 rounded-full transition-all duration-300 ${
                  hz >= tier ? 'bg-p4l-red' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-p4l-red animate-pulse" />
          <p className="text-xs text-charcoal-muted">Measuring refresh rate...</p>
        </div>
      )}
    </LabCard>
  );
}

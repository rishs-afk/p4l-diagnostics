import { useEffect, useState, useRef } from 'react';
import LabCard from '../components/LabCard';

export default function BatteryLab({ onResult }) {
  const [battery, setBattery] = useState(null);
  const [supported, setSupported] = useState(true);
  const listenerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!navigator.getBattery) {
        setSupported(false);
        onResult({ status: 'unsupported', reason: 'Battery API not available' });
        return;
      }

      try {
        const batt = await navigator.getBattery();
        if (cancelled) return;

        const update = () => {
          if (cancelled) return;
          const data = {
            level: Math.round(batt.level * 100),
            charging: batt.charging,
            chargingTime: batt.chargingTime,
            dischargingTime: batt.dischargingTime,
          };
          setBattery(data);
          onResult({ status: 'pass', data });
        };

        update();
        batt.addEventListener('levelchange', update);
        batt.addEventListener('chargingchange', update);
        listenerRef.current = { batt, update };
      } catch {
        if (!cancelled) {
          setSupported(false);
          onResult({ status: 'unsupported', reason: 'Battery API error' });
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      if (listenerRef.current) {
        const { batt, update } = listenerRef.current;
        batt.removeEventListener('levelchange', update);
        batt.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  const levelColor = battery
    ? battery.level > 50 ? 'bg-emerald-pass' : battery.level > 20 ? 'bg-amber-500' : 'bg-p4l-red'
    : 'bg-slate-200';

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
      <line x1="23" y1="13" x2="23" y2="11"></line>
    </svg>
  );

  return (
    <LabCard
      title="Battery Status"
      icon={<Icon />}
      status={!supported ? 'unsupported' : battery ? 'pass' : 'running'}
      id="lab-battery"
    >
      {battery ? (
        <div className="section-bg flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-charcoal">{battery.level}%</p>
            <p className="text-xs text-charcoal-muted flex items-center gap-1">
              {battery.charging ? (
                <>
                  <svg className="w-3 h-3 text-emerald-pass" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Charging
                </>
              ) : 'On Battery'}
            </p>
          </div>
          {/* Battery visual */}
          <div className="relative w-12 h-6 border-2 border-slate-200 rounded-md flex-shrink-0">
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-[2px] h-2.5 bg-slate-200 rounded-r" />
            <div
              className={`h-full rounded-sm transition-all duration-500 ${levelColor}`}
              style={{ width: `${battery.level}%` }}
            />
          </div>
        </div>
      ) : !supported ? (
        <div className="section-bg">
          <p className="text-xs text-charcoal-muted">Battery API is not supported on this browser. This is expected on iOS Safari.</p>
        </div>
      ) : (
        <p className="text-xs text-charcoal-muted">Checking battery...</p>
      )}
    </LabCard>
  );
}

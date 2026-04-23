import { useEffect, useState } from 'react';
import LabCard from '../components/LabCard';

function parseUserAgent() {
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let device = 'Unknown Device';
  let browser = 'Unknown Browser';

  // OS detection
  if (/iPad|iPhone|iPod/.test(ua)) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[_\.]\d+)/);
    if (match) os += ' ' + match[1].replace('_', '.');
  } else if (/Android/.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android (\d+\.?\d*)/);
    if (match) os += ' ' + match[1];
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[_\.]\d+)/);
    if (match) os += ' ' + match[1].replace(/_/g, '.');
  } else if (/Windows/.test(ua)) {
    os = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) os += ' ' + match[1];
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  // Browser detection
  if (/CriOS/.test(ua)) browser = 'Chrome (iOS)';
  else if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) browser = 'Chrome ' + ua.match(/Chrome\/(\d+)/)[1];
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox\/(\d+)/.test(ua)) browser = 'Firefox ' + ua.match(/Firefox\/(\d+)/)[1];
  else if (/Edg\/(\d+)/.test(ua)) browser = 'Edge ' + ua.match(/Edg\/(\d+)/)[1];

  // Device type
  if (/Mobile|Android/.test(ua) && !/iPad/.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet/.test(ua)) device = 'Tablet';
  else device = 'Desktop';

  const platform = navigator.platform || 'Unknown';
  const cores = navigator.hardwareConcurrency || '?';
  const memory = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A';
  const screenRes = `${screen.width}×${screen.height}`;
  const pixelRatio = window.devicePixelRatio?.toFixed(1) || '1.0';

  return { os, browser, device, platform, cores, memory, screenRes, pixelRatio };
}

export default function DeviceContext({ onResult }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const data = parseUserAgent();
    setInfo(data);
    onResult({ status: 'pass', data });
  }, []);

  return (
    <LabCard title="Device Info" icon="📱" status={info ? 'pass' : 'running'} id="lab-device-context">
      {info ? (
        <div className="section-bg">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['OS', info.os],
              ['Browser', info.browser],
              ['Type', info.device],
              ['Screen', info.screenRes],
              ['DPR', info.pixelRatio + 'x'],
              ['Cores', info.cores],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-charcoal-muted font-semibold">{label}</p>
                <p className="text-sm font-medium text-charcoal mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-charcoal-muted">Detecting device...</p>
      )}
    </LabCard>
  );
}

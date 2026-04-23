import { useEffect, useState } from 'react';
import LabCard from '../components/LabCard';

function classifyCamera(device, allDevices) {
  const label = (device.label || '').toLowerCase();
  const groupDevices = allDevices.filter((d) => d.groupId === device.groupId && d.kind === 'videoinput');

  // Check facing mode from label
  if (label.includes('front') || label.includes('selfie') || label.includes('facetime') || label.includes('user'))
    return { name: 'Selfie Camera', icon: '🤳' };
  if (label.includes('ultra') || label.includes('wide'))
    return { name: 'Ultra-Wide Camera', icon: '🔭' };
  if (label.includes('tele'))
    return { name: 'Telephoto Camera', icon: '🔍' };
  if (label.includes('back') || label.includes('rear') || label.includes('environment'))
    return { name: 'Primary Rear Camera', icon: '📸' };
  if (label.includes('ir') || label.includes('infrared'))
    return { name: 'IR Camera', icon: '👁️' };

  // Fallback: if group has multiple, guess by index
  if (groupDevices.length > 1) {
    const idx = groupDevices.indexOf(device);
    if (idx === 0) return { name: 'Primary Camera', icon: '📸' };
    return { name: `Camera ${idx + 1}`, icon: '📷' };
  }

  return { name: device.label || 'Camera', icon: '📷' };
}

export default function CameraInventory({ onResult }) {
  const [cameras, setCameras] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        // Deduplicate by groupId + deviceId
        const seen = new Set();
        const unique = videoInputs.filter((d) => {
          const key = d.deviceId || d.label;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (cancelled) return;

        const classified = unique.map((d) => ({
          ...classifyCamera(d, videoInputs),
          id: d.deviceId,
          rawLabel: d.label,
        }));

        setCameras(classified);
        onResult({ status: 'pass', count: classified.length, devices: classified });
      } catch (err) {
        if (!cancelled) {
          setError('Could not enumerate cameras');
          onResult({ status: 'fail', error: err.message });
        }
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return (
    <LabCard
      title="Camera Inventory"
      icon="📷"
      status={error ? 'fail' : cameras ? 'pass' : 'running'}
      id="lab-camera-inventory"
    >
      {cameras ? (
        <div className="space-y-2">
          {cameras.map((cam, i) => (
            <div key={cam.id || i} className="section-bg flex items-center gap-3">
              <span className="text-xl">{cam.icon}</span>
              <div>
                <p className="text-sm font-medium text-charcoal">{cam.name}</p>
                {cam.rawLabel && cam.rawLabel !== cam.name && (
                  <p className="text-[10px] text-charcoal-muted truncate max-w-[200px]">{cam.rawLabel}</p>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-charcoal-muted mt-2">
            {cameras.length} camera{cameras.length !== 1 ? 's' : ''} detected
          </p>
        </div>
      ) : error ? (
        <p className="text-xs text-p4l-red">{error}</p>
      ) : (
        <p className="text-xs text-charcoal-muted">Scanning cameras...</p>
      )}
    </LabCard>
  );
}

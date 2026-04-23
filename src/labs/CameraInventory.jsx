import { useEffect, useState } from 'react';
import LabCard from '../components/LabCard';

function classifyCamera(device, allDevices) {
  const label = (device.label || '').toLowerCase();
  const groupDevices = allDevices.filter((d) => d.groupId === device.groupId && d.kind === 'videoinput');

  const icons = {
    selfie: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 7V5"></path>
      </svg>
    ),
    rear: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    ),
    tele: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  };

  if (label.includes('front') || label.includes('selfie') || label.includes('facetime') || label.includes('user'))
    return { name: 'Selfie Camera', icon: icons.selfie };
  if (label.includes('ultra') || label.includes('wide'))
    return { name: 'Ultra-Wide Camera', icon: icons.rear };
  if (label.includes('tele'))
    return { name: 'Telephoto Camera', icon: icons.tele };
  if (label.includes('back') || label.includes('rear') || label.includes('environment'))
    return { name: 'Primary Rear Camera', icon: icons.rear };

  return { name: device.label || 'Camera', icon: icons.rear };
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

  const MainIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );

  return (
    <LabCard
      title="Camera Inventory"
      icon={<MainIcon />}
      status={error ? 'fail' : cameras ? 'pass' : 'running'}
      id="lab-camera-inventory"
    >
      {cameras ? (
        <div className="space-y-2">
          {cameras.map((cam, i) => (
            <div key={cam.id || i} className="section-bg flex items-center gap-3">
              <span className="text-p4l-red">{cam.icon}</span>
              <div>
                <p className="text-sm font-semibold text-charcoal">{cam.name}</p>
                {cam.rawLabel && cam.rawLabel !== cam.name && (
                  <p className="text-[10px] text-charcoal-muted truncate max-w-[200px] font-medium">{cam.rawLabel}</p>
                )}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-charcoal-muted mt-2 font-medium">
            {cameras.length} lens module{cameras.length !== 1 ? 's' : ''} identified
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

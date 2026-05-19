import { useEffect, useState, useRef, useCallback } from 'react';
import LabCard from '../components/LabCard';

function classifyCamera(device, allDevices) {
  const label = (device.label || '').toLowerCase();
  
  const icons = {
    camera: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    ),
  };

  if (label.includes('front') || label.includes('selfie') || label.includes('facetime') || label.includes('user'))
    return { name: 'Selfie Camera', icon: icons.camera, position: 'front' };
  if (label.includes('ultra') || label.includes('wide'))
    return { name: 'Ultra-Wide Camera', icon: icons.camera, position: 'back' };
  if (label.includes('tele'))
    return { name: 'Telephoto Camera', icon: icons.camera, position: 'back' };
  if (label.includes('back') || label.includes('rear') || label.includes('environment'))
    return { name: 'Primary Rear Camera', icon: icons.camera, position: 'back' };

  return { name: device.label || 'Camera', icon: icons.camera, position: 'unknown' };
}

export default function CameraInventory({ onResult }) {
  const [cameras, setCameras] = useState(null);
  const [error, setError] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        const seen = new Set();
        const unique = videoInputs.filter((d) => {
          const key = d.deviceId || d.label;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (cancelled) return;

        const classified = unique.map((d) => ({
          ...classifyCamera(d, videoInputs),
          id: d.deviceId,
          rawLabel: d.label,
          verified: null, // null = pending, true = pass, false = fail
        }));

        setCameras(classified);
        updateResults(classified);
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

  const updateResults = (camList) => {
    const allVerified = camList.every(c => c.verified !== null);
    const someFailed = camList.some(c => c.verified === false);
    
    onResult({ 
      status: allVerified ? (someFailed ? 'fail' : 'pass') : 'running', 
      count: camList.length, 
      devices: camList 
    });
  };

  const startTest = async (camera) => {
    setActiveCamera(camera);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: { exact: camera.id } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start camera:', err);
      stopTest(false);
    }
  };

  const stopTest = (success) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    const updated = cameras.map(c => 
      c.id === activeCamera.id ? { ...c, verified: success } : c
    );
    setCameras(updated);
    setActiveCamera(null);
    updateResults(updated);
  };

  const MainIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );

  return (
    <LabCard
      title="Camera Inventory"
      icon={<MainIcon />}
      status={error ? 'fail' : cameras ? (cameras.every(c => c.verified !== null) ? (cameras.some(c => c.verified === false) ? 'fail' : 'pass') : 'running') : 'running'}
      id="lab-camera-inventory"
    >
      {cameras ? (
        <div className="space-y-3">
          {cameras.map((cam, i) => (
            <div key={cam.id || i} className="section-bg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-p4l-red">{cam.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{cam.name}</p>
                  <p className="text-[10px] text-charcoal/60 truncate max-w-[140px] font-medium">
                    {cam.rawLabel || 'System Default'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => startTest(cam)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  cam.verified === true ? 'bg-emerald-100 text-emerald-pass' :
                  cam.verified === false ? 'bg-red-100 text-p4l-red' :
                  'bg-slate-200 text-charcoal active:scale-95'
                }`}
              >
                {cam.verified === true ? 'Verified' : cam.verified === false ? 'Failed' : 'Verify'}
              </button>
            </div>
          ))}
          
          <p className="text-[11px] text-charcoal/50 mt-2 font-medium">
            {cameras.filter(c => c.verified === true).length}/{cameras.length} lenses verified
          </p>
        </div>
      ) : error ? (
        <p className="text-xs text-p4l-red">{error}</p>
      ) : (
        <p className="text-xs text-charcoal-muted">Scanning cameras...</p>
      )}

      {/* Camera Verification Overlay */}
      {activeCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          <div className="absolute top-6 left-6 z-10">
            <h2 className="text-white text-lg font-bold drop-shadow-md">{activeCamera.name}</h2>
            <p className="text-white/70 text-xs drop-shadow-md">Verify image clarity and focus</p>
          </div>
          
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-10 left-6 right-6 flex flex-col gap-3">
            <button 
              onClick={() => stopTest(true)}
              className="w-full py-4 bg-white text-charcoal font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-transform"
            >
              Finish Verification
            </button>
          </div>
        </div>
      )}
    </LabCard>
  );
}

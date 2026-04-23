import { useEffect, useState } from 'react';
import LabCard from '../components/LabCard';

function toGB(bytes) {
  return Math.round(bytes / (1024 * 1024 * 1024));
}

function getHardwareInfo() {
  const info = {
    gpu: 'Unknown GPU',
    chip: null
  };

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        info.gpu = renderer;
        // Detect Apple Silicon (M1, M2, M3, M4, etc)
        if (renderer.includes('Apple')) {
          const match = renderer.match(/Apple M\d+/);
          if (match) info.chip = match[0];
          else if (renderer.includes('Apple GPU')) info.chip = 'Apple Silicon';
        }
      }
    }
  } catch (e) {}

  return info;
}

function getIPhoneModel(width, height) {
  const res = `${width}x${height}`;
  const models = {
    '1290x2796': 'iPhone 15 Pro Max',
    '1179x2556': 'iPhone 15 Pro / 14 Pro',
    '1284x2778': 'iPhone 14 Plus / 13 Pro Max',
    '1170x2532': 'iPhone 15 / 14 / 13',
    '1125x2436': 'iPhone 11 Pro / X / XS',
    '1242x2688': 'iPhone 11 Pro Max / XS Max',
    '828x1792': 'iPhone 11 / XR',
    '1080x2340': 'iPhone 13 mini / 12 mini',
    '750x1334': 'iPhone SE / 8 / 7',
  };
  return models[res] || 'iPhone';
}

function getMacModel(width, height, chip) {
  const res = `${width}x${height}`;
  const cores = navigator.hardwareConcurrency || 8;
  const models = {
    // Physical resolutions
    '2560x1664': 'MacBook Air 13"',
    '2880x1864': 'MacBook Air 15"',
    '3024x1964': 'MacBook Pro 14"',
    '3456x2234': 'MacBook Pro 16"',
    // Common scaled/logical resolutions
    '2304x1440': 'MacBook Air',
    '2940x1912': 'MacBook Air',
    '3360x2100': 'MacBook Pro',
  };
  
  let base = models[res];
  if (!base) {
    if (cores <= 10) base = 'MacBook Air';
    else base = 'MacBook Pro';
  }
  return chip ? `${base} (${chip})` : base;
}

async function getClientHints() {
  if (!navigator.userAgentData?.getHighEntropyValues) return {};
  try {
    return await navigator.userAgentData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
  } catch (e) {
    return {};
  }
}

function detectOS(ua, hints) {
  let os = 'Unknown OS';

  const isIOS = /iPad|iPhone|iPod/.test(ua) || hints.platform === 'iOS';
  if (isIOS) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[_\.]\d+)/);
    if (match) os += ' ' + match[1].replace(/_/g, '.');
  } else if (/Android/.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android (\d+\.?\d*)/);
    if (match) os += ' ' + match[1];
  } else if (/Mac OS X|Macintosh/.test(ua) || hints.platform === 'macOS') {
    os = 'macOS';
  } else if (/Windows/.test(ua) || hints.platform === 'Windows') {
    os = 'Windows';
  } else if (/Linux/.test(ua) || hints.platform === 'Linux') {
    os = 'Linux';
  }

  return os;
}

function detectModel(ua, hints, hardware, width, height) {
  const isIOS = /iPad|iPhone|iPod/.test(ua) || hints.platform === 'iOS';
  const isMacLike = /Macintosh/.test(ua) || navigator.platform === 'MacIntel' || hints.platform === 'macOS';

  let modelLabel = navigator.platform || 'Unknown';
  if (isIOS && /iPhone/.test(ua)) {
    modelLabel = getIPhoneModel(width, height);
  } else if (hints.model && hints.model !== 'Unknown') {
    modelLabel = hints.model;
  } else if (isMacLike) {
    if (hardware.chip) {
      modelLabel = getMacModel(width, height, hardware.chip);
    } else if (navigator.maxTouchPoints > 0) {
      modelLabel = 'iPad (iPadOS)';
    } else {
      modelLabel = 'Mac (model unavailable in browser)';
    }
  }

  return modelLabel;
}

async function parseDeviceContext() {
  const ua = navigator.userAgent;
  const hints = await getClientHints();
  const hardware = getHardwareInfo();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(screen.width * dpr);
  const h = Math.round(screen.height * dpr);
  const os = detectOS(ua, hints);
  const modelLabel = detectModel(ua, hints, hardware, w, h);

  const cores = navigator.hardwareConcurrency || '?';
  const memory = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A';
  const screenRes = `${screen.width}×${screen.height}`;
  const pixelRatio = `${dpr.toFixed(1)} DPR`;
  const pixelDensityHelp = `${dpr.toFixed(1)}x means each UI pixel uses about ${Math.round(dpr)}×${Math.round(dpr)} hardware pixels.`;

  return { os, modelLabel, cores, memory, screenRes, pixelRatio, pixelDensityHelp, gpu: hardware.gpu };
}

export default function DeviceContext({ onResult }) {
  const [info, setInfo] = useState(null);
  const [storage, setStorage] = useState('Estimating...');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await parseDeviceContext();
      if (!mounted) return;

      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          const quotaGB = estimate.quota ? toGB(estimate.quota) : null;
          const usedGB = estimate.usage ? toGB(estimate.usage) : null;
          const storageLabel = quotaGB
            ? `${usedGB ?? 0} / ${quotaGB} GB Browser Quota`
            : 'Browser quota unavailable';
          setStorage(storageLabel);
          onResult({ status: 'pass', data: { ...data, storageQuotaGB: quotaGB, storageUsageGB: usedGB } });
        } catch (e) {
          setStorage('Browser quota unavailable');
          onResult({ status: 'pass', data });
        }
      } else {
        setStorage('Browser quota unavailable');
        onResult({ status: 'pass', data });
      }

      setInfo(data);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  );

  return (
    <LabCard title="Device Identity" icon={<Icon />} status={info ? 'pass' : 'running'} id="lab-device-context">
      {info ? (
        <div className="section-bg">
          <div className="grid grid-cols-2 gap-y-4 gap-x-3">
            {[
              ['OS', info.os],
              ['Hardware', info.modelLabel],
              ['RAM', info.memory],
              ['Browser Storage', storage],
              ['Cores', info.cores + ' CPU'],
              ['Pixel Density', info.pixelRatio],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold">{label}</p>
                <p className="text-sm font-semibold text-charcoal mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-charcoal-muted mt-3">{info.pixelDensityHelp}</p>
        </div>
      ) : (
        <p className="text-xs text-charcoal-muted">Detecting device...</p>
      )}
    </LabCard>
  );
}

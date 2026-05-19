import { useState, useRef, useEffect, useCallback } from 'react';
import LabCard from '../components/LabCard';

export default function AudioSpectrum({ onResult, onRedo }) {
  const [state, setState] = useState('idle'); // idle | listening | done
  const [result, setResult] = useState(null);
  const [hasSignal, setHasSignal] = useState(false);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    rafRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startListening = async () => {
    setState('listening');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawSpectrum();
    } catch {
      const r = { status: 'fail', reason: 'Microphone access denied' };
      setResult(r);
      onResult(r);
      setState('done');
    }
  };

  const drawSpectrum = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    let signalDetected = false;
    let signalFrames = 0;

    const timeoutId = setTimeout(() => {
      if (!signalDetected) {
        handleResult(false);
      }
    }, 10000);

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;


    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, W, H);

      const barCount = 48;
      const gap = 2;
      const barWidth = (W - gap * (barCount - 1)) / barCount;
      const step = Math.floor(bufferLength / barCount);

      let maxVal = 0;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step];
        if (val > maxVal) maxVal = val;
        const barHeight = (val / 255) * (H - 8);
        const x = i * (barWidth + gap);
        const y = H - barHeight;

        // Gradient from red to lighter red
        const intensity = val / 255;
        ctx.fillStyle = `rgba(227, 6, 19, ${0.3 + intensity * 0.7})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      // Signal detection: if average > threshold
      if (maxVal > 30) {
        signalFrames++;
        if (signalFrames > 10 && !signalDetected) {
          signalDetected = true;
          setHasSignal(true);
          clearTimeout(timeoutId);
          setTimeout(() => handleResult(true), 1500);
        }
      }
    };

    draw();
  };

  const handleResult = (pass) => {
    cleanup();
    const r = { status: pass ? 'pass' : 'fail' };
    setResult(r);
    onResult(r);
    setState('done');
  };

  const Icon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );

  const SuccessIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const FailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <LabCard
      title="Microphone Test"
      icon={<Icon />}
      status={result ? result.status : state === 'listening' ? 'running' : 'pending'}
      id="lab-audio-spectrum"
      onRedo={onRedo}
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted font-medium">Speak or play audio to test your microphone input.</p>
          <button onClick={startListening} className="btn-primary" id="audio-start-btn">
            Start Microphone Test
          </button>
        </div>
      )}

      {state === 'listening' && !result && (
        <div className="space-y-3">
          <div className="section-bg">
            <canvas
              ref={canvasRef}
              className="w-full h-24 rounded-lg"
              style={{ display: 'block' }}
            />
          </div>
          <p className="text-xs text-charcoal-muted text-center">
            {hasSignal ? '✓ Audio signal detected — completing test...' : 'Listening... speak into your microphone'}
          </p>
        </div>
      )}

      {state === 'done' && result && (
        <div className={`section-bg mt-4 ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Microphone working correctly' : '✗ Microphone issue detected'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

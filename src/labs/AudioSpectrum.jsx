import { useState, useRef, useEffect, useCallback } from 'react';
import LabCard from '../components/LabCard';

export default function AudioSpectrum({ onResult }) {
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

    let signalDetected = false;
    let signalFrames = 0;

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

  return (
    <LabCard
      title="Microphone Test"
      icon="🎤"
      status={result ? result.status : state === 'listening' ? 'running' : 'pending'}
      id="lab-audio-spectrum"
    >
      {state === 'idle' && (
        <div className="space-y-3">
          <p className="text-xs text-charcoal-muted">Speak or play audio to test your microphone input.</p>
          <button onClick={startListening} className="btn-primary" id="audio-start-btn">
            🎤 Start Microphone Test
          </button>
        </div>
      )}

      {state === 'listening' && (
        <div className="space-y-3">
          <div className="section-bg">
            <canvas
              ref={canvasRef}
              className="w-full h-24 rounded-lg"
              style={{ display: 'block' }}
            />
          </div>
          <p className="text-xs text-charcoal-muted text-center">
            {hasSignal ? '✓ Audio signal detected — speak to see the spectrum' : 'Listening... speak into your microphone'}
          </p>
          <div className="flex gap-2">
            <button onClick={() => handleResult(true)} className="flex-1 btn-secondary !bg-emerald-50 !text-emerald-pass !border-emerald-200" id="audio-pass-btn">
              ✓ Working
            </button>
            <button onClick={() => handleResult(false)} className="flex-1 btn-secondary !bg-red-50 !text-p4l-red !border-red-200" id="audio-fail-btn">
              ✗ No Sound
            </button>
          </div>
        </div>
      )}

      {state === 'done' && result && (
        <div className={`section-bg ${result.status === 'pass' ? '!bg-emerald-50' : '!bg-red-50'}`}>
          <p className="text-sm font-medium">
            {result.status === 'pass' ? '✓ Microphone working correctly' : '✗ Microphone issue detected'}
          </p>
        </div>
      )}
    </LabCard>
  );
}

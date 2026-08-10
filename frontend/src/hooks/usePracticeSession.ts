import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachingNote, SessionState } from '../types';
import { WS_URL, API_URL } from '../config';

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface LiveTelemetry {
  faceDetected: boolean;
  handsDetected: boolean;
  smiling: boolean;
  postureGood: boolean;
}

interface PracticeSessionApi {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  state: SessionState;
  cameraReady: boolean;
  engineReady: boolean;
  cameraError: string | null;
  elapsed: number;
  notes: CoachingNote[];
  toast: CoachingNote | null;
  transcript: string;
  interimTranscript: string;
  volumeBars: number[];
  eyeContact: number;
  telemetry: LiveTelemetry;
  start: (label?: string, context?: string) => void;
  stop: () => void;
  cancel: () => void;
}

export function usePracticeSession(): PracticeSessionApi {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  const [state, setState] = useState<SessionState>('loading');
  const [cameraReady, setCameraReady] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState<CoachingNote[]>([]);
  const [toast, setToast] = useState<CoachingNote | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volumeBars, setVolumeBars] = useState<number[]>(Array(20).fill(10));
  const [eyeContact, setEyeContact] = useState(0);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    faceDetected: false,
    handsDetected: false,
    smiling: false,
    postureGood: false,
  });

  const sessionIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const volIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const metricsIntervalRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const activeToastTimerRef = useRef<number | null>(null);

  const faceMeshRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const poseRef = useRef<any>(null);
  const cameraRafRef = useRef<number | null>(null);
  const mediaPipeSetupRef = useRef<boolean>(false);

  const eyeContactScoreRef = useRef<number>(0);
  const smileScoreRef = useRef<number>(0);

  // Load MediaPipe scripts
  useEffect(() => {
    const checkScripts = () => {
      const w = window as any;
      if (w.FaceMesh && w.Hands && w.Pose && w.drawConnectors) {
        if (!faceMeshRef.current) {
          faceMeshRef.current = new w.FaceMesh({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
          faceMeshRef.current.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

          handsRef.current = new w.Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
          handsRef.current.setOptions({ maxNumHands: 2, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

          poseRef.current = new w.Pose({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` });
          poseRef.current.setOptions({ modelComplexity: 0, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
          setScriptsLoaded(true);
        }
      } else {
        setTimeout(checkScripts, 500);
      }
    };
    checkScripts();
  }, []);

  // Initialize camera
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
        setCameraReady(true);
      } catch (err) {
        if (!cancelled) {
          setCameraError('Camera unavailable — running in preview mode.');
          setCameraReady(true);
        }
      }
    }
    boot();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (cameraRafRef.current) cancelAnimationFrame(cameraRafRef.current);
    };
  }, []);

  // Setup MediaPipe processing loop
  useEffect(() => {
    if (!scriptsLoaded || !cameraReady || mediaPipeSetupRef.current) return;

    if (faceMeshRef.current && handsRef.current && poseRef.current) {
      mediaPipeSetupRef.current = true;
      const w = window as any;

      let latestHands: any = null;
      let latestPose: any = null;

      handsRef.current.onResults((results: any) => {
        latestHands = results;
        const detected = !!(results.multiHandLandmarks && results.multiHandLandmarks.length > 0);
        (window as any).currentHandsDetected = detected;
        setTelemetry(prev => ({ ...prev, handsDetected: detected }));
      });

      poseRef.current.onResults((results: any) => {
        latestPose = results;
        if (results.poseLandmarks) {
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const shoulderDiffY = leftShoulder && rightShoulder ? Math.abs(leftShoulder.y - rightShoulder.y) : 0;
          const good = shoulderDiffY < 0.025;
          (window as any).currentPostureScore = good ? 1.0 : 0.0;
          setTelemetry(prev => ({ ...prev, postureGood: good }));
        } else {
          (window as any).currentPostureScore = 0.0;
          setTelemetry(prev => ({ ...prev, postureGood: false }));
        }
      });

      faceMeshRef.current.onResults((results: any) => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw live tracking telemetry overlays
        const drawOpts = { color: 'rgba(45, 212, 191, 0.35)', lineWidth: 0.5 };
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          for (const landmarks of results.multiFaceLandmarks) {
            w.drawConnectors(ctx, landmarks, w.FACEMESH_TESSELATION, drawOpts);
          }
        }
        if (latestPose && latestPose.poseLandmarks) {
          w.drawConnectors(ctx, latestPose.poseLandmarks, w.POSE_CONNECTIONS, { color: 'rgba(139, 92, 246, 0.5)', lineWidth: 1.5 });
        }
        if (latestHands && latestHands.multiHandLandmarks) {
          for (const landmarks of latestHands.multiHandLandmarks) {
            w.drawConnectors(ctx, landmarks, w.HAND_CONNECTIONS, { color: 'rgba(245, 158, 11, 0.5)', lineWidth: 1 });
          }
        }

        const faceDetected = !!(results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0);
        setTelemetry(prev => ({ ...prev, faceDetected }));

        if (faceDetected) {
          const landmarks = results.multiFaceLandmarks[0];
          const nose = landmarks[1];
          const leftEye = landmarks[159];
          const rightEye = landmarks[386];
          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          const diff = Math.abs(nose.x - eyeCenterX);
          if (diff < 0.03) eyeContactScoreRef.current = 0.95;
          else if (diff < 0.08) eyeContactScoreRef.current = 0.70;
          else eyeContactScoreRef.current = 0.30;
          setEyeContact(Math.round(eyeContactScoreRef.current * 100));

          const upperLip = landmarks[13];
          const lowerLip = landmarks[14];
          const leftMouthCorner = landmarks[61];
          const rightMouthCorner = landmarks[291];
          const mouthWidth = Math.abs(leftMouthCorner.x - rightMouthCorner.x);
          const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
          const smiling = mouthWidth > 0.05 && (mouthWidth / (mouthHeight || 0.001)) > 2.0;
          smileScoreRef.current = smiling ? 1.0 : 0.0;
          setTelemetry(prev => ({ ...prev, smiling }));
        } else {
          eyeContactScoreRef.current = 0;
          smileScoreRef.current = 0;
          setEyeContact(0);
          setTelemetry(prev => ({ ...prev, faceDetected: false, smiling: false }));
        }
        ctx.restore();
      });

      let lastProcessedTime = 0;
      const processFrame = async (now: number) => {
        if (videoRef.current && canvasRef.current && streamRef.current) {
          if (now - lastProcessedTime > 100) {
            lastProcessedTime = now;
            if (videoRef.current.readyState >= 2) {
              canvasRef.current.width = videoRef.current.videoWidth || 1280;
              canvasRef.current.height = videoRef.current.videoHeight || 720;
              try {
                await faceMeshRef.current.send({ image: videoRef.current });
                await handsRef.current.send({ image: videoRef.current });
                await poseRef.current.send({ image: videoRef.current });
              } catch (e) {}
            }
          }
        }
        cameraRafRef.current = requestAnimationFrame(processFrame);
      };
      cameraRafRef.current = requestAnimationFrame(processFrame);

      setEngineReady(true);
      setState('ready');
    }
  }, [scriptsLoaded, cameraReady]);

  const start = useCallback((label = 'Practice Session', context = 'General') => {
    if (!scriptsLoaded) return;

    setElapsed(0);
    setNotes([]);
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    setState('recording');
    isRecordingRef.current = true;

    const sessionId = Math.random().toString(36).substring(7);
    sessionIdRef.current = sessionId;

    const token = localStorage.getItem('eloquent_token') || '';
    const ws = new WebSocket(`${WS_URL}/api/ws/session/${sessionId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = async () => {
      ws.send(JSON.stringify({ type: 'init', data: { label, practice_context: context } }));
      const sessionStartTime = performance.now();

      const stream = streamRef.current;
      if (!stream) return;

      // Record canvas stream (includes MediaPipe overlays) + audio
      audioChunksRef.current = [];
      let recOptions: MediaRecorderOptions = { videoBitsPerSecond: 250000 };
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) recOptions = { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 250000 };
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) recOptions = { mimeType: 'video/webm;codecs=vp8,opus', videoBitsPerSecond: 250000 };
      else if (MediaRecorder.isTypeSupported('video/webm')) recOptions = { mimeType: 'video/webm', videoBitsPerSecond: 250000 };

      let targetStream: MediaStream = stream;
      if (canvasRef.current) {
        targetStream = canvasRef.current.captureStream(25);
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) targetStream.addTrack(audioTracks[0]);
      }

      const mediaRecorder = new MediaRecorder(targetStream, recOptions);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000); // chunk every second for streaming reliability
      mediaRecorderRef.current = mediaRecorder;

      // Audio level analyser for volume bars
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      volIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / bufferLength;
        const volPercent = Math.max(5, Math.min(100, (avg / 128) * 100 * 1.8));
        setVolumeBars(prev => [...prev.slice(1), volPercent]);
      }, 80);

      // Web Speech API — improved settings for better capture
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let finalChunk = '';
          let interimChunk = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalChunk += result[0].transcript;
            } else {
              interimChunk += result[0].transcript;
            }
          }
          // Show interim text live
          setInterimTranscript(interimChunk);

          if (finalChunk.trim()) {
            const cleanChunk = finalChunk.trim() + ' ';
            setTranscript(prev => {
              const next = prev + cleanChunk;
              transcriptRef.current = next;
              return next;
            });
            setInterimTranscript('');

            if (ws.readyState === WebSocket.OPEN) {
              const currentTime = (performance.now() - sessionStartTime) / 1000;
              ws.send(JSON.stringify({ type: 'live_transcript', data: cleanChunk, timestamp: currentTime }));
            }
          }
        };

        recognition.onerror = (event: any) => {
          // 'no-speech' and 'audio-capture' are non-fatal — just restart
          if (event.error !== 'aborted' && isRecordingRef.current) {
            setTimeout(() => {
              try { recognition.start(); } catch (e) {}
            }, 300);
          }
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        try { recognition.start(); } catch (e) {}
        (window as any).currentRecognition = recognition;
      }

      timerIntervalRef.current = window.setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);

      metricsIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const currentTime = (performance.now() - sessionStartTime) / 1000;
          ws.send(JSON.stringify({
            type: 'client_metrics',
            data: {
              timestamp: currentTime,
              face_detected: eyeContactScoreRef.current > 0,
              eye_contact_score: eyeContactScoreRef.current,
              hands_detected: (window as any).currentHandsDetected || false,
              smile_score: smileScoreRef.current,
              posture_score: (window as any).currentPostureScore || 0.0
            }
          }));
        }
      }, 1000);
    };

    ws.onerror = () => {
      console.warn('WebSocket error — session metrics may not be saved.');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'feedback') {
          const msg = data.data.message;
          const note: CoachingNote = {
            id: Date.now(),
            type: data.data.type || 'improvement',
            message: data.data.shortMessage || msg,
            timestamp: formatClock(0) // elapsed from ref to avoid closure issues
          };
          setNotes((prev) => [note, ...prev].slice(0, 12));
          setToast(note);
          if (activeToastTimerRef.current) window.clearTimeout(activeToastTimerRef.current);
          activeToastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
        }
      } catch (err) {}
    };
  }, [scriptsLoaded]);

  const stop = useCallback(() => {
    if (!isRecordingRef.current) return;

    isRecordingRef.current = false;
    setToast(null);
    setInterimTranscript('');
    setState('processing');

    if ((window as any).currentRecognition) {
      try { (window as any).currentRecognition.stop(); } catch (e) {}
    }
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (volIntervalRef.current) clearInterval(volIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'final_transcript', data: transcriptRef.current }));
      // Give the server ~500ms to process final_transcript before disconnect
      setTimeout(() => wsRef.current?.close(), 500);
    }

    const sid = sessionIdRef.current;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        if (!sid) return;
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        if (blob.size > 0) {
          const formData = new FormData();
          formData.append('file', blob, 'session.webm');
          try {
            await fetch(`${API_URL}/api/session/${sid}/audio`, { method: 'POST', body: formData });
          } catch (e) {
            console.warn('Failed to upload session video:', e);
          }
        }
        // Wait for backend AI report generation before navigating
        setTimeout(() => navigate(`/v2/results/${sid}`), 1500);
      };
      recorder.stop();
    } else {
      if (sid) setTimeout(() => navigate(`/v2/results/${sid}`), 1500);
    }
  }, [navigate]);

  const cancel = useCallback(() => {
    isRecordingRef.current = false;
    setToast(null);
    setNotes([]);
    setTranscript('');
    setInterimTranscript('');
    setElapsed(0);
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (volIntervalRef.current) clearInterval(volIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (wsRef.current) wsRef.current.close();
    if ((window as any).currentRecognition) {
      try { (window as any).currentRecognition.stop(); } catch (e) {}
    }
    setState('ready');
  }, []);

  return {
    videoRef,
    canvasRef,
    state,
    cameraReady,
    engineReady,
    cameraError,
    elapsed,
    notes,
    toast,
    transcript,
    interimTranscript,
    volumeBars,
    eyeContact,
    telemetry,
    start,
    stop,
    cancel
  };
}
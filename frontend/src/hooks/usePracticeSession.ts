import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CoachingNote, SessionState } from '../types';

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
  volumeBars: number[];
  eyeContact: number;
  start: () => void;
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
  const [volumeBars, setVolumeBars] = useState<number[]>(Array(20).fill(10));
  const [eyeContact, setEyeContact] = useState(82);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

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

  // Initialize camera and MediaPipe
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

      faceMeshRef.current.onResults((results: any) => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
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
          if (mouthWidth > 0.05 && (mouthWidth / (mouthHeight || 0.001)) > 2.0) {
            smileScoreRef.current = 1.0;
          } else {
            smileScoreRef.current = 0.0;
          }
        } else {
          eyeContactScoreRef.current = 0;
          smileScoreRef.current = 0;
          setEyeContact(0);
        }
        ctx.restore();
      });

      handsRef.current.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          (window as any).currentHandsDetected = true;
        } else {
          (window as any).currentHandsDetected = false;
        }
      });

      poseRef.current.onResults((results: any) => {
        if (results.poseLandmarks) {
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const shoulderDiffY = leftShoulder && rightShoulder ? Math.abs(leftShoulder.y - rightShoulder.y) : 0;
          (window as any).currentPostureScore = shoulderDiffY < 0.02 ? 1.0 : 0.0;
        } else {
          (window as any).currentPostureScore = 0.0;
        }
      });

      let lastProcessedTime = 0;
      const processFrame = async (now: number) => {
        if (videoRef.current && canvasRef.current && streamRef.current) {
          if (now - lastProcessedTime > 100) {
            lastProcessedTime = now;
            if (videoRef.current.readyState >= 2) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
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

  const start = useCallback(() => {
    if (!scriptsLoaded) return;
    
    setElapsed(0);
    setNotes([]);
    setTranscript('');
    transcriptRef.current = '';
    setState('recording');
    isRecordingRef.current = true;

    const sessionId = Math.random().toString(36).substring(7);
    sessionIdRef.current = sessionId;
    
    // Default ws logic
    const wsUrl = '/api/ws';
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${wsUrl}/session/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = async () => {
      ws.send(JSON.stringify({ type: "init", data: { label: "Eloquent One Session", practice_context: "General", practice_goal: "overall" } }));
      const sessionStartTime = performance.now();

      const stream = streamRef.current;
      if (!stream) return;

      audioChunksRef.current = [];
      let options = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) options = { mimeType: 'video/webm;codecs=vp9,opus' };
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) options = { mimeType: 'video/webm;codecs=vp8,opus' };
      else if (MediaRecorder.isTypeSupported('video/webm')) options = { mimeType: 'video/webm' };
      
      let targetStream = stream;
      if (canvasRef.current) {
          targetStream = canvasRef.current.captureStream(30); 
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) targetStream.addTrack(audioTracks[0]); 
      }
      
      const mediaRecorder = new MediaRecorder(targetStream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

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
          const volPercent = Math.max(10, Math.min(100, (avg / 128) * 100 * 1.5));
          setVolumeBars(prev => [...prev.slice(1), volPercent]);
      }, 100);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: any) => {
              let currentChunk = "";
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) currentChunk += event.results[i][0].transcript;
              }
              if (currentChunk) {
                  const cleanChunk = currentChunk.trim() + ". ";
                  setTranscript(prev => {
                      const next = prev + cleanChunk;
                      transcriptRef.current = next; 
                      return next;
                  });
                  if (ws.readyState === WebSocket.OPEN) {
                      const currentTime = (performance.now() - sessionStartTime) / 1000;
                      ws.send(JSON.stringify({ type: "live_transcript", data: cleanChunk, timestamp: currentTime }));
                  }
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

      setElapsed(0);
      timerIntervalRef.current = window.setInterval(() => {
          setElapsed(prev => prev + 1);
      }, 1000);

      metricsIntervalRef.current = window.setInterval(() => {
         if (ws.readyState === WebSocket.OPEN) {
             const currentTime = (performance.now() - sessionStartTime) / 1000;
             const handsNow = (window as any).currentHandsDetected || false;
             const eyeNow = eyeContactScoreRef.current;
             ws.send(JSON.stringify({
                 type: "client_metrics",
                 data: {
                     timestamp: currentTime,
                     face_detected: eyeNow > 0,
                     eye_contact_score: eyeNow,
                     hands_detected: handsNow,
                     smile_score: smileScoreRef.current,
                     posture_score: (window as any).currentPostureScore || 0.0
                 }
             }));
         }
      }, 1000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "feedback") {
          const msg = data.data.message;
          const note: CoachingNote = {
            id: Date.now(),
            type: data.data.type || 'improvement',
            message: data.data.shortMessage || msg,
            timestamp: formatClock(elapsed)
          };
          setNotes((prev) => [note, ...prev].slice(0, 12));
          setToast(note);
          
          if (activeToastTimerRef.current) window.clearTimeout(activeToastTimerRef.current);
          activeToastTimerRef.current = window.setTimeout(() => setToast(null), 3000);
        }
      } catch (err) {}
    };
  }, [scriptsLoaded, elapsed]);

  const stop = useCallback(() => {
    if (!isRecordingRef.current) return;
    
    setIsRecording(false);
    isRecordingRef.current = false;
    setToast(null);
    setState('processing');

    if (cameraRafRef.current) cancelAnimationFrame(cameraRafRef.current);
    if ((window as any).currentRecognition) (window as any).currentRecognition.stop();
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (volIntervalRef.current) clearInterval(volIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "final_transcript", data: transcriptRef.current }));
      wsRef.current.close();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        const currentRecorder = mediaRecorderRef.current;
        currentRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: currentRecorder.mimeType || 'video/webm' });
            if (sessionIdRef.current) {
                const formData = new FormData();
                formData.append("file", audioBlob, "session.webm");
                try {
                    await fetch(`/api/session/${sessionIdRef.current}/audio`, { method: "POST", body: formData });
                } catch (e) {
                    console.error("Failed to upload audio:", e);
                }
                setTimeout(() => navigate(`/v2/results/${sessionIdRef.current}`), 1000);
            }
        };
        currentRecorder.stop();
    } else {
        if (sessionIdRef.current) {
            setTimeout(() => navigate(`/v2/results/${sessionIdRef.current}`), 1000);
        }
    }
  }, [navigate]);

  const cancel = useCallback(() => {
    setToast(null);
    setNotes([]);
    setTranscript('');
    setElapsed(0);
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
    volumeBars,
    eyeContact,
    start,
    stop,
    cancel
  };
}
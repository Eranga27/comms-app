"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";

type FeedbackMessage = {
  message: string;
  type: string;
};

type GoalOption = {
  id: string;
  label: string;
  icon: string;
  description: string;
  metric: string; // the key we watch
};

const GOAL_OPTIONS: GoalOption[] = [
  { id: "reduce_fillers",     label: "Reduce Filler Words",       icon: "🎯", description: "Use fewer 'um', 'uh', 'like' during speech.",          metric: "fillers" },
  { id: "eye_contact",        label: "Improve Eye Contact",        icon: "👁️", description: "Maintain consistent gaze toward the camera.",           metric: "eye_contact" },
  { id: "confidence",         label: "Improve Confidence",         icon: "💪", description: "Project authority through posture and gestures.",        metric: "posture" },
  { id: "storytelling",       label: "Improve Storytelling",       icon: "📖", description: "Use clear sequence and persuasive language.",             metric: "content" },
  { id: "presentation",       label: "Improve Presentation Skills",icon: "📊", description: "Engage audience with varied gestures and energy.",        metric: "gestures" },
  { id: "interview_answers",  label: "Improve Interview Answers",  icon: "🎤", description: "Give concise, structured, relevant responses.",           metric: "content" },
  { id: "speaking_pace",      label: "Improve Speaking Pace",      icon: "⏱️", description: "Aim for a measured 130–150 WPM delivery.",               metric: "pace" },
  { id: "custom",             label: "Custom Goal",                 icon: "✏️", description: "Set your own practice intention.",                       metric: "overall" },
];

export default function PracticeSession() {
  const [sessionLabel, setSessionLabel] = useState<string>("Practice Session");
  const [practiceContext, setPracticeContext] = useState<string>("Job Interview");
  const [practiceGoal, setPracticeGoal] = useState<string>("reduce_fillers");
  const [customGoalText, setCustomGoalText] = useState<string>("");
  const [showNamingModal, setShowNamingModal] = useState(false);
  const [modalStep, setModalStep] = useState<1|2>(1);

  // Live goal tracking counters
  const [liveFillers, setLiveFillers] = useState(0);
  const liveFillerRef = useRef(0);
  const [liveEyePct, setLiveEyePct] = useState(0);
  const liveEyeFrames = useRef({ good: 0, total: 0 });
  const [liveGesturePct, setLiveGesturePct] = useState(0);
  const liveGestureFrames = useRef({ good: 0, total: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingStep, setLoadingStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef<boolean>(false);
  const [mediaReady, setMediaReady] = useState(false);
  
  const [feedback, setFeedback] = useState<FeedbackMessage[]>([]);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [handsDetected, setHandsDetected] = useState<boolean>(false);
  const [isSmiling, setIsSmiling] = useState<boolean>(false);
  const [isGoodPosture, setIsGoodPosture] = useState<boolean>(false);
  
  const [transcript, setTranscript] = useState<string>("");
  const transcriptRef = useRef<string>(""); 
  
  const [volumes, setVolumes] = useState<number[]>(Array(20).fill(10));
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [processingResults, setProcessingResults] = useState(false);
  
  // V2 Specific State
  const [focusMode, setFocusMode] = useState<"beginner" | "professional" | "analyst">("beginner");
  const focusModeRef = useRef<"beginner" | "professional" | "analyst">("beginner");
  
  useEffect(() => {
    focusModeRef.current = focusMode;
  }, [focusMode]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaPipeSetupRef = useRef<boolean>(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const volIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const poseRef = useRef<any>(null);

  const router = useRouter();
  const sessionIdRef = useRef<string | null>(null);

  const eyeContactScoreRef = useRef<number>(0);
  const smileScoreRef = useRef<number>(0);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const initializeMedia = async () => {
    if (streamRef.current) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => {
                if (e.name !== 'AbortError') console.error("Video play error", e);
            });
        }
        setMediaReady(true);
    } catch (err) {
        console.error("Error accessing media devices.", err);
    }
  };

  const setupMediaPipe = useCallback(() => {
     if (mediaPipeSetupRef.current || !faceMeshRef.current || !handsRef.current || !poseRef.current || !streamRef.current) return;
     mediaPipeSetupRef.current = true;
     
     const drawConnectors = (window as any).drawConnectors;
     const drawLandmarks = (window as any).drawLandmarks;
     const FACEMESH_TESSELATION = (window as any).FACEMESH_TESSELATION;
     const HAND_CONNECTIONS = (window as any).HAND_CONNECTIONS;
     const POSE_CONNECTIONS = (window as any).POSE_CONNECTIONS;

     const faceMesh = faceMeshRef.current;
     const hands = handsRef.current;
     const pose = poseRef.current;

     faceMesh.onResults((results: any) => {
       const canvasCtx = canvasRef.current?.getContext('2d');
       if (!canvasCtx || !canvasRef.current || !videoRef.current) return;
       canvasCtx.save();
       canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
       canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
       
       if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
         setFaceDetected(true);
         const landmarks = results.multiFaceLandmarks[0];
         
         if (focusModeRef.current === "analyst") {
             drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#14b8a6', lineWidth: 0.5});
         }
         
         const nose = landmarks[1];
         const leftEye = landmarks[159];
         const rightEye = landmarks[386];
         const eyeCenterX = (leftEye.x + rightEye.x) / 2;
         const diff = Math.abs(nose.x - eyeCenterX);
         if (diff < 0.03) eyeContactScoreRef.current = 0.95;
         else if (diff < 0.08) eyeContactScoreRef.current = 0.70;
         else eyeContactScoreRef.current = 0.30;
         
         const upperLip = landmarks[13];
         const lowerLip = landmarks[14];
         const leftMouthCorner = landmarks[61];
         const rightMouthCorner = landmarks[291];
         const mouthWidth = Math.abs(leftMouthCorner.x - rightMouthCorner.x);
         const mouthHeight = Math.abs(upperLip.y - lowerLip.y);
         if (mouthWidth > 0.05 && (mouthWidth / (mouthHeight || 0.001)) > 2.0) {
             smileScoreRef.current = 1.0;
             setIsSmiling(true);
         } else {
             smileScoreRef.current = 0.0;
             setIsSmiling(false);
         }
       } else {
         setFaceDetected(false);
         eyeContactScoreRef.current = 0;
         smileScoreRef.current = 0;
         setIsSmiling(false);
       }
       canvasCtx.restore();
     });

     hands.onResults((results: any) => {
       const canvasCtx = canvasRef.current?.getContext('2d');
       if (!canvasCtx || !canvasRef.current) return;
       canvasCtx.save();
       if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
         setHandsDetected(true);
         (window as any).currentHandsDetected = true;
         for (const landmarks of results.multiHandLandmarks) {
           if (focusModeRef.current === "analyst") {
             drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#f59e0b', lineWidth: 2});
             drawLandmarks(canvasCtx, landmarks, {color: '#ef4444', lineWidth: 1, radius: 2});
           }
         }
       } else {
         setHandsDetected(false);
         (window as any).currentHandsDetected = false;
       }
       canvasCtx.restore();
     });

     pose.onResults((results: any) => {
       const canvasCtx = canvasRef.current?.getContext('2d');
       if (!canvasCtx || !canvasRef.current) return;
       canvasCtx.save();
       if (results.poseLandmarks) {
          const leftShoulder = results.poseLandmarks[11];
          const rightShoulder = results.poseLandmarks[12];
          const shoulderDiffY = leftShoulder && rightShoulder ? Math.abs(leftShoulder.y - rightShoulder.y) : 0;
          
          if (shoulderDiffY < 0.02) {
              (window as any).currentPostureScore = 1.0;
              setIsGoodPosture(true);
          } else {
              (window as any).currentPostureScore = 0.0;
              setIsGoodPosture(false);
          }
          if (focusModeRef.current === "analyst") {
              drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#8b5cf6', lineWidth: 2});
          }
       } else {
          (window as any).currentPostureScore = 0.0;
          setIsGoodPosture(false);
       }
       canvasCtx.restore();
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
                     await faceMesh.send({image: videoRef.current});
                     await hands.send({image: videoRef.current});
                     await pose.send({image: videoRef.current});
                 } catch (e) {
                 }
             }
         }
         cameraRef.current = requestAnimationFrame(processFrame);
       }
     };
     cameraRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (faceMeshRef.current) faceMeshRef.current.close();
      if (handsRef.current) handsRef.current.close();
      if (poseRef.current) poseRef.current.close();
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error(e));
      }

      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (cameraRef.current) cancelAnimationFrame(cameraRef.current);
    };
  }, []);

  useEffect(() => {
     if (scriptsLoaded && mediaReady) {
         setupMediaPipe();
     }
  }, [scriptsLoaded, mediaReady, setupMediaPipe]);

  const handleScriptLoad = () => {
      if ((window as any).FaceMesh && (window as any).Hands && (window as any).Pose && (window as any).drawConnectors) {
          const FaceMesh = (window as any).FaceMesh;
          const Hands = (window as any).Hands;
          const Pose = (window as any).Pose;
          
          const faceMesh = new FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true, 
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          const hands = new Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0, 
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          
          const pose = new Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          });
          pose.setOptions({
            modelComplexity: 0,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          faceMeshRef.current = faceMesh;
          handsRef.current = hands;
          poseRef.current = pose;
          
          setScriptsLoaded(true);
      }
  };

  const startRecordingSession = async () => {
    if (!scriptsLoaded) return;

    setIsRecording(true);
    isRecordingRef.current = true;
    setFeedback([]);
    setTranscript("");
    transcriptRef.current = "";
    setProcessingResults(false);
    
    const sessionId = Math.random().toString(36).substring(7);
    sessionIdRef.current = sessionId;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/ws";
    const ws = new WebSocket(`${wsUrl}/session/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = async () => {
      // Store goal in localStorage for results page to read
      const goalObj = GOAL_OPTIONS.find(g => g.id === practiceGoal);
      const goalLabel = practiceGoal === "custom" ? (customGoalText || "Custom Goal") : (goalObj?.label ?? practiceGoal);
      localStorage.setItem("speakiq_active_goal", JSON.stringify({ id: practiceGoal, label: goalLabel, metric: goalObj?.metric ?? "overall", sessionId: sessionIdRef.current }));

      // Reset live counters
      liveFillerRef.current = 0;
      setLiveFillers(0);
      liveEyeFrames.current = { good: 0, total: 0 };
      setLiveEyePct(0);
      liveGestureFrames.current = { good: 0, total: 0 };
      setLiveGesturePct(0);

      ws.send(JSON.stringify({ type: "init", data: { label: sessionLabel, practice_context: practiceContext, practice_goal: practiceGoal === "custom" ? customGoalText : goalLabel } }));
      const sessionStartTime = performance.now();
      try {
        const stream = streamRef.current;
        if (!stream) return;

        audioChunksRef.current = [];
        let options = {};
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          options = { mimeType: 'video/webm;codecs=vp9,opus' };
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          options = { mimeType: 'video/webm;codecs=vp8,opus' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        }
        
        let targetStream = stream;
        if (canvasRef.current) {
            targetStream = canvasRef.current.captureStream(30); 
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                targetStream.addTrack(audioTracks[0]); 
            }
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
        
        volIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((a, b) => a + b, 0);
            const avg = sum / bufferLength;
            const volPercent = Math.max(10, Math.min(100, (avg / 128) * 100 * 1.5));
            setVolumes(prev => [...prev.slice(1), volPercent]);
        }, 100);

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                let currentChunk = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        currentChunk += event.results[i][0].transcript;
                    }
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
                    try {
                        recognition.start();
                    } catch (e) {
                        console.error("Speech recognition restart error", e);
                    }
                }
            };
            try {
                recognition.start();
            } catch (e) {
                console.error("Speech recognition start error", e);
            }
            (window as any).currentRecognition = recognition;
        }

        setElapsedTime(0);
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        metricsIntervalRef.current = setInterval(() => {
           if (ws.readyState === WebSocket.OPEN) {
               const currentTime = (performance.now() - sessionStartTime) / 1000;
               const handsNow = (window as any).currentHandsDetected || false;
               const eyeNow = eyeContactScoreRef.current;

               // Update live goal counters
               liveEyeFrames.current.total++;
               if (eyeNow > 0.7) liveEyeFrames.current.good++;
               setLiveEyePct(liveEyeFrames.current.total > 0 ? Math.round((liveEyeFrames.current.good / liveEyeFrames.current.total) * 100) : 0);

               liveGestureFrames.current.total++;
               if (handsNow) liveGestureFrames.current.good++;
               setLiveGesturePct(liveGestureFrames.current.total > 0 ? Math.round((liveGestureFrames.current.good / liveGestureFrames.current.total) * 100) : 0);

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

      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "feedback") {
          let msg = data.data.message;
          // V2: Replace generic prompts with explanatory coaching
          if (msg === "Try to look at the camera.") {
             msg = "Try maintaining steady eye contact with the lens. Consistent eye contact projects confidence and keeps the audience engaged.";
          } else if (msg === "Great eye contact!") {
             msg = "Excellent eye contact! Holding your gaze steady makes your message land with greater impact.";
          } else if (msg === "Keep your hands visible.") {
             msg = "Your hands have moved out of frame. Visible hand gestures generally improve perceived openness and audience trust.";
          } else if (msg === "Good use of gestures!") {
             msg = "Great body language! Open hand gestures perfectly complement your spoken message.";
          } else if (msg === "Sit upright to command presence.") {
             msg = "Your posture appears relaxed. Sitting upright and centering yourself in the frame helps project immediate authority.";
          } else if (msg.includes("Try to avoid filler words like")) {
             const match = msg.match(/'([^']+)'/);
             const word = match ? match[1] : "that";
             // Count live fillers
             liveFillerRef.current += 1;
             setLiveFillers(liveFillerRef.current);
             msg = `You used a filler word ('${word}'). Embracing silence instead of using filler sounds builds stronger executive presence.`;
          }
          data.data.message = msg;
          setFeedback(prev => [...prev, data.data].slice(-3));
        }
      } catch (err) {}
    };
  };

  const stopRecordingSession = () => {
    if (!isRecordingRef.current) return; 
    
    setIsRecording(false);
    isRecordingRef.current = false;
    setProcessingResults(true);
    
    if (cameraRef.current) cancelAnimationFrame(cameraRef.current);
    if ((window as any).currentRecognition) (window as any).currentRecognition.stop();
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    if (volIntervalRef.current) clearInterval(volIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setLoadingStep(1);
    setTimeout(() => setLoadingStep(2), 1500);
    setTimeout(() => setLoadingStep(3), 3500);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
          type: "final_transcript", 
          data: transcriptRef.current 
      }));
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
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
                    await fetch(`${apiUrl}/session/${sessionIdRef.current}/audio`, {
                        method: "POST",
                        body: formData
                    });
                } catch (e) {
                    console.error("Failed to upload audio for V2 processing:", e);
                }
                
                setTimeout(() => {
                    router.push(`/v2/results/${sessionIdRef.current}`);
                }, 1000);
            }
        };
        currentRecorder.stop();
    } else {
        if (sessionIdRef.current) {
            setTimeout(() => {
                router.push(`/v2/results/${sessionIdRef.current}`);
            }, 3500);
        }
    }
  };

  return (
    <div className="w-full flex flex-col items-center p-4 pt-8 animate-fade-in">
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" onLoad={handleScriptLoad} />
      
      {/* V2 Header & Focus Mode Selector */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <p className="text-primary-500 text-xs font-bold uppercase tracking-widest mb-1">Live Telemetry Engine</p>
           <h1 className="text-3xl font-bold text-white">Coaching Environment</h1>
           <p className="text-slate-400 text-sm mt-1">Calm, focused, and distraction-free practice.</p>
        </div>
        <div className="flex bg-slate-900/60 backdrop-blur-md rounded-xl p-1 border border-slate-800 shadow-sm">
           {(["beginner", "professional", "analyst"] as const).map(mode => (
             <button
                key={mode}
                onClick={() => setFocusMode(mode)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${focusMode === mode ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
             >
               {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
             </button>
           ))}
        </div>
      </div>

      <div className={`w-full max-w-6xl flex flex-col lg:flex-row gap-6 ${focusMode === 'beginner' ? 'justify-center items-center h-[75vh]' : 'h-[80vh]'}`}>
         {/* Main Camera View */}
         <div className={`relative flex flex-col gap-4 ${focusMode === 'beginner' ? 'w-full max-w-4xl h-full' : 'flex-1 h-full'}`}>
            <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-lg flex flex-col">
              
              {!mediaReady && (
                  <div className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mb-4" />
                      <p className="text-slate-400 animate-pulse">Initializing Camera & Tracking Engine...</p>
                  </div>
              )}
              
              {processingResults && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-8" />
                      <div className="space-y-4 w-full max-w-sm text-left">
                          <div className={`flex items-center gap-3 transition-opacity duration-500 ${loadingStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${loadingStep > 1 ? 'bg-emerald-500 text-white' : 'bg-primary-500/20 text-primary-400 border border-primary-500'}`}>{loadingStep > 1 ? '✓' : '1'}</div>
                             <p className={`text-sm ${loadingStep === 1 ? 'text-white font-medium animate-pulse' : 'text-slate-400'}`}>Analyzing behavioral data...</p>
                          </div>
                          <div className={`flex items-center gap-3 transition-opacity duration-500 ${loadingStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${loadingStep > 2 ? 'bg-emerald-500 text-white' : (loadingStep === 2 ? 'bg-primary-500/20 text-primary-400 border border-primary-500' : 'bg-slate-800 text-slate-500')}`}>{loadingStep > 2 ? '✓' : '2'}</div>
                             <p className={`text-sm ${loadingStep === 2 ? 'text-white font-medium animate-pulse' : 'text-slate-400'}`}>Transcribing audio with engine...</p>
                          </div>
                          <div className={`flex items-center gap-3 transition-opacity duration-500 ${loadingStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${loadingStep > 3 ? 'bg-emerald-500 text-white' : (loadingStep === 3 ? 'bg-primary-500/20 text-primary-400 border border-primary-500' : 'bg-slate-800 text-slate-500')}`}>{loadingStep > 3 ? '✓' : '3'}</div>
                             <p className={`text-sm ${loadingStep === 3 ? 'text-white font-medium animate-pulse' : 'text-slate-400'}`}>Generating coaching report...</p>
                          </div>
                      </div>
                  </div>
              )}
              
              <video ref={videoRef} playsInline muted className="hidden" />
              <canvas ref={canvasRef} className="w-full h-full object-cover transform scale-x-[-1]" />
              
              {/* Top Left: Recording Status & Timer */}
              <div className="absolute top-4 left-4 z-10">
                  <div className={`px-4 py-2 rounded-lg backdrop-blur-md text-sm font-medium flex items-center gap-2 ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/80 text-slate-300'}`}>
                    {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    {isRecording ? (
                       <span>{Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                    ) : "Camera Ready"}
                  </div>
              </div>

              {/* Goal Tracker HUD - shown during recording */}
              {isRecording && (() => {
                const goalId = practiceGoal;
                let goalValue: number | null = null;
                let goalLabel = '';
                let goalUnit = '';
                let goalInvert = false; // lower is better?
                if (goalId === 'reduce_fillers') { goalValue = liveFillers; goalLabel = 'Fillers'; goalUnit = ' detected'; goalInvert = true; }
                else if (goalId === 'eye_contact') { goalValue = liveEyePct; goalLabel = 'Eye Contact'; goalUnit = '%'; }
                else if (goalId === 'confidence' || goalId === 'presentation') { goalValue = liveGesturePct; goalLabel = 'Gesture Rate'; goalUnit = '%'; }
                if (goalValue === null) return null;
                const good = goalInvert ? goalValue === 0 : goalValue >= 70;
                return (
                  <div className="absolute bottom-16 left-4 z-10">
                    <div className={`px-3 py-2 rounded-xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2 ${
                      good ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                    }`}>
                      <span>🎯</span>
                      <span>{goalLabel}:</span>
                      <span className="font-bold">{goalValue}{goalUnit}</span>
                      {good ? <span>✓</span> : <span>↑</span>}
                    </div>
                  </div>
                );
              })()}
              {focusMode === 'analyst' && mediaReady && (
                 <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
                    <div className={`px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium transition-colors ${faceDetected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/80 text-slate-400 border border-slate-700'}`}>
                        {faceDetected ? "Face Tracked ✓" : "Face Lost"}
                    </div>
                    <div className={`px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium transition-colors ${handsDetected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/80 text-slate-400 border border-slate-700'}`}>
                        {handsDetected ? "Hands Tracked ✋" : "No Hands"}
                    </div>
                    {isSmiling && (
                      <div className="px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-fade-in">
                          Smiling 😊
                      </div>
                    )}
                    {isGoodPosture && (
                      <div className="px-3 py-1.5 rounded-md backdrop-blur-md text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-fade-in">
                          Good Posture 🧍
                      </div>
                    )}
                 </div>
              )}

              {/* Contextual Coaching Overlay (One at a time) */}
              {isRecording && feedback.length > 0 && (
                 <div className="absolute bottom-24 left-0 right-0 flex justify-center px-4 z-20 pointer-events-none">
                    <div className="max-w-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl animate-fade-in text-center transition-all duration-300">
                       <p className={`text-base md:text-lg font-medium leading-relaxed ${feedback[feedback.length - 1].type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {feedback[feedback.length - 1].message}
                       </p>
                    </div>
                 </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 gap-4">
                {!isRecording ? (
                  <button 
                    onClick={() => setShowNamingModal(true)}
                    className={`px-8 py-3 text-white rounded-full font-semibold shadow-lg transition-all ${scriptsLoaded && mediaReady ? 'bg-primary-600 hover:bg-primary-500 hover:scale-105' : 'bg-slate-700 cursor-not-allowed opacity-70'}`}
                    disabled={!scriptsLoaded || !mediaReady}
                  >
                    {!mediaReady ? "Starting Camera..." : (!scriptsLoaded ? "Loading Engine..." : "Start Practice")}
                  </button>
                ) : (
                  <button 
                    onClick={stopRecordingSession}
                    disabled={processingResults}
                    className={`px-8 py-3 text-white rounded-full font-semibold shadow-lg transition-all z-30 ${processingResults ? 'bg-amber-600 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 hover:scale-105 border border-slate-600'}`}
                  >
                    {processingResults ? "Processing..." : "End Session"}
                  </button>
                )}
                {focusMode === 'beginner' && (
                    <Link 
                        href="/v2/dashboard"
                        className="px-6 py-3 bg-slate-900/50 hover:bg-slate-800 text-white rounded-full font-medium transition-colors z-30 border border-slate-800"
                    >
                        Cancel
                    </Link>
                )}
              </div>
            </div>
            
            {/* Live Transcript (Professional & Analyst Mode Only) */}
            {focusMode !== 'beginner' && (
                <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800 p-5 overflow-y-auto shadow-inner flex flex-col">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2 font-semibold">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                     </svg>
                     Live Transcript Feed
                  </h4>
                  <div className="flex-1 mt-1">
                      {transcript ? (
                          <p className="text-slate-300 text-sm leading-relaxed font-sans animate-fade-in">{transcript}</p>
                      ) : (
                          <p className="text-slate-600 text-sm italic">{isRecording ? "Listening..." : "Waiting for speech..."}</p>
                      )}
                  </div>
                </div>
            )}
         </div>
         
         {/* Right Sidebar (Professional & Analyst Mode Only) */}
         {focusMode !== 'beginner' && (
             <div className="w-full lg:w-80 flex flex-col gap-4">
                {/* Behavior Summary */}
                <div className="bg-slate-900 p-5 flex-1 overflow-y-auto rounded-2xl border border-slate-800">
                  <h3 className="text-slate-300 font-semibold mb-5 text-xs uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Coaching History
                  </h3>
                  <div className="space-y-3">
                    {!isRecording ? (
                      <p className="text-slate-500 text-sm mt-4">Notifications will appear here once the session begins.</p>
                    ) : (
                      <>
                        {feedback.length === 0 ? (
                          <div className="flex flex-col items-center justify-center mt-10 opacity-50">
                              <p className="text-slate-500 text-sm animate-pulse">Monitoring behavior...</p>
                          </div>
                        ) : (
                          feedback.slice().reverse().map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl animate-fade-in border ${item.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}>
                              <p className={`text-xs font-medium leading-relaxed ${item.type === 'positive' ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>{item.message}</p>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Voice Amplification */}
                <div className="bg-slate-900 p-5 h-32 flex flex-col justify-center relative overflow-hidden rounded-2xl border border-slate-800">
                  <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 relative z-10 flex items-center gap-2 font-semibold">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                     </svg>
                     Audio Input Level
                  </h4>
                  <div className="flex gap-[3px] h-12 items-end relative z-10 mt-2">
                    {volumes.map((vol, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-sm transition-all duration-75 ${isRecording ? 'bg-primary-500 shadow-[0_0_8px_rgba(20,184,166,0.3)]' : 'bg-slate-700/50'}`}
                        style={{ height: `${vol}%` }}
                      />
                    ))}
                  </div>
                </div>

                <Link 
                    href="/v2/dashboard"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 text-center rounded-xl font-medium transition-colors border border-slate-800 shadow-sm"
                >
                    Cancel Session
                </Link>
             </div>
         )}
      </div>
      
      {/* Session Setup Modal — two steps */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg animate-fade-in shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-slate-800">
              <div className="h-1 bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500" style={{ width: modalStep === 1 ? '50%' : '100%' }} />
            </div>

            <div className="p-8">
              {modalStep === 1 ? (
                // ── Step 1: Goal Selection ─────────────────────────────
                <>
                  <p className="text-primary-500 text-xs uppercase font-bold tracking-widest mb-1">Step 1 of 2</p>
                  <h3 className="text-2xl font-bold text-white mb-1">What would you like to improve today?</h3>
                  <p className="text-slate-400 text-sm mb-6">Your session will be coached with this goal in focus.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {GOAL_OPTIONS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setPracticeGoal(g.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          practiceGoal === g.id
                            ? 'border-primary-500 bg-primary-500/10 text-white'
                            : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{g.icon}</span>
                        <div>
                          <p className={`text-sm font-semibold leading-tight ${practiceGoal === g.id ? 'text-white' : 'text-slate-300'}`}>{g.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{g.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {practiceGoal === 'custom' && (
                    <input
                      type="text"
                      value={customGoalText}
                      onChange={e => setCustomGoalText(e.target.value)}
                      placeholder="Describe your personal practice goal..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 mb-4 text-sm"
                      autoFocus
                    />
                  )}

                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowNamingModal(false)} className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium">Cancel</button>
                    <button onClick={() => setModalStep(2)} className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors text-sm font-medium">Next →</button>
                  </div>
                </>
              ) : (
                // ── Step 2: Context + Label ────────────────────────────
                <>
                  <p className="text-primary-500 text-xs uppercase font-bold tracking-widest mb-1">Step 2 of 2</p>
                  <h3 className="text-2xl font-bold text-white mb-1">Configure Your Session</h3>
                  <p className="text-slate-400 text-sm mb-6">Set the scenario for context-aware coaching.</p>

                  {/* Selected goal badge */}
                  <div className="mb-5 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center gap-3">
                    <span className="text-xl">{GOAL_OPTIONS.find(g => g.id === practiceGoal)?.icon}</span>
                    <div>
                      <p className="text-[10px] text-primary-400 uppercase font-bold tracking-wider">Active Goal</p>
                      <p className="text-white font-semibold text-sm">{practiceGoal === 'custom' ? (customGoalText || 'Custom Goal') : GOAL_OPTIONS.find(g => g.id === practiceGoal)?.label}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Practice Context</label>
                    <select value={practiceContext} onChange={e => setPracticeContext(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 appearance-none">
                      <option value="Job Interview">Job Interview</option>
                      <option value="Public Speaking">Public Speaking</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Sales Pitch">Sales Pitch</option>
                      <option value="Leadership Conversation">Leadership Conversation</option>
                      <option value="Networking Introduction">Networking Introduction</option>
                      <option value="Custom Practice">Custom Practice</option>
                    </select>
                  </div>

                  <div className="mb-8">
                    <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2">Session Label</label>
                    <input type="text" value={sessionLabel} onChange={e => setSessionLabel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      placeholder="e.g., Sales Pitch, Mock Interview..."
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setModalStep(1)} className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium">← Back</button>
                    <button onClick={() => { setShowNamingModal(false); startRecordingSession(); }}
                      className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-lg text-sm font-medium">
                      Start Recording
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

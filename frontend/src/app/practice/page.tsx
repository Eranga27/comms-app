"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";

type FeedbackMessage = {
  message: string;
  type: string;
};

export default function PracticeSession() {
  const [sessionLabel, setSessionLabel] = useState<string>("Practice Session");
  const [showNamingModal, setShowNamingModal] = useState(false);
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
  const transcriptRef = useRef<string>(""); // For access inside callbacks
  
  const [volumes, setVolumes] = useState<number[]>(Array(20).fill(10));
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [processingResults, setProcessingResults] = useState(false);
  
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
  const smileScoreRef = useRef<number>(0); // Action Unit: Smile
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
         drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#14b8a6', lineWidth: 0.5});
         
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
           drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#f59e0b', lineWidth: 2});
           drawLandmarks(canvasCtx, landmarks, {color: '#ef4444', lineWidth: 1, radius: 2});
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
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#8b5cf6', lineWidth: 2});
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
      // Clean up MediaPipe models and streams to prevent memory leaks and delay on next test
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
          // Pre-initialize models so they download WASM files in background, preventing lag when starting
          const FaceMesh = (window as any).FaceMesh;
          const Hands = (window as any).Hands;
          const Pose = (window as any).Pose;
          
          const faceMesh = new FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });
          faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true, // V2.0: Re-enabled Iris tracking for high-precision Gaze Detection
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          const hands = new Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0, // 0 = fastest, 1 = accurate. Fixes camera lag.
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });
          
          const pose = new Pose({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
          });
          pose.setOptions({
            modelComplexity: 0, // Keep fast
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
      ws.send(JSON.stringify({ type: "init", data: { label: sessionLabel } }));
      const sessionStartTime = performance.now();
      try {
        const stream = streamRef.current;
        if (!stream) return;

        // V2.0 Setup: Capture High-Fidelity Canvas + Audio for Baked-in Tracking Overlay
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
            targetStream = canvasRef.current.captureStream(30); // 30 FPS canvas recording
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
                targetStream.addTrack(audioTracks[0]); // Mix in original audio
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
                        transcriptRef.current = next; // sync ref
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
               ws.send(JSON.stringify({
                   type: "client_metrics",
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

      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "feedback") {
          setFeedback(prev => [...prev, data.data].slice(-3));
        }
      } catch (err) {}
    };
  };

  const stopRecordingSession = () => {
    if (!isRecordingRef.current) return; // Prevent double firing
    
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
    
    // Don't stop video stream to keep camera active
    // if (videoRef.current && videoRef.current.srcObject) {
    //   const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
    //   tracks.forEach(track => track.stop());
    // }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send the final accumulated transcript string reliably before disconnecting
      wsRef.current.send(JSON.stringify({ 
          type: "final_transcript", 
          data: transcriptRef.current 
      }));
      wsRef.current.close();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType || 'video/webm' });
            
            // Upload to V2.0 Batch Processing Endpoint
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
                
                // Allow backend processing time, then route
                setTimeout(() => {
                    router.push(`/results/${sessionIdRef.current}`);
                }, 1000);
            }
        };
        mediaRecorderRef.current.stop();
    } else {
        // Fallback if mediaRecorder failed
        if (sessionIdRef.current) {
            setTimeout(() => {
                router.push(`/results/${sessionIdRef.current}`);
            }, 3500);
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" onLoad={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" onLoad={handleScriptLoad} />
      <div className="w-full max-w-6xl glass-panel p-4 flex flex-col lg:flex-row gap-6 h-[85vh]">
        <div className="flex-1 flex flex-col h-full gap-4 relative">
          <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-800 shadow-lg flex flex-col">
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
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex flex-col gap-2">
                  <div className={`px-3 py-1.5 w-max rounded-full backdrop-blur-md text-sm font-medium flex items-center gap-2 ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800/50 text-slate-300'}`}>
                    {isRecording && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    {isRecording ? (
                       <span>Recording Session: <span className="font-mono">{Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}</span></span>
                    ) : "Camera Ready"}
                  </div>
                  {mediaReady && (
                      <div className="flex gap-2 flex-wrap">
                        <div className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium transition-colors ${faceDetected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400'}`}>
                            {faceDetected ? "Face Tracked ✓" : "Face Lost"}
                        </div>
                        <div className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium transition-colors ${handsDetected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/50 text-slate-400'}`}>
                            {handsDetected ? "Hands Tracked ✋" : "No Hands"}
                        </div>
                        {isSmiling && (
                          <div className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-fade-in">
                              Smiling 😊
                          </div>
                        )}
                        {isGoodPosture && (
                          <div className="px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-fade-in">
                              Good Posture 🧍
                          </div>
                        )}
                      </div>
                  )}
              </div>
            </div>

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
                  className={`px-8 py-3 text-white rounded-full font-semibold shadow-lg transition-all z-30 ${processingResults ? 'bg-amber-600 animate-pulse' : 'bg-red-600 hover:bg-red-500 hover:scale-105'}`}
                >
                  {processingResults ? "Processing Assessment..." : "Stop Session"}
                </button>
              )}
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium shadow-lg transition-colors z-30"
              >
                Cancel
              </Link>
            </div>
          </div>
          
          <div className="h-32 bg-slate-900 rounded-lg border border-slate-800 p-4 overflow-y-auto shadow-inner flex flex-col">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
               Live Speech Script
            </h4>
            <div className="flex-1">
                {transcript ? (
                    <p className="text-slate-300 text-sm leading-relaxed font-mono animate-fade-in">{transcript}</p>
                ) : (
                    <p className="text-slate-600 text-sm italic">{isRecording ? "Listening to your speech..." : "Transcript will appear here when you start..."}</p>
                )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="glass-panel p-4 flex-1 overflow-y-auto">
            <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Coaching Insights
            </h3>
            <div className="space-y-4">
              {!isRecording ? (
                <p className="text-slate-500 text-sm text-center mt-10">Start recording to see live behavioral feedback here.</p>
              ) : (
                <>
                  {feedback.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-10">
                        <div className="w-6 h-6 border-2 border-slate-600 border-t-primary-500 rounded-full animate-spin mb-3"></div>
                        <p className="text-slate-500 text-sm animate-pulse">Listening and analyzing behavior...</p>
                    </div>
                  ) : (
                    feedback.map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-lg animate-fade-in border ${item.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <p className={`text-sm font-medium ${item.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>{item.message}</p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="glass-panel p-4 h-32 flex flex-col justify-center relative overflow-hidden">
            <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2 relative z-10 flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
               </svg>
               Live Voice Amplification
            </h4>
            <div className="flex gap-[2px] h-12 items-end relative z-10 mt-2">
              {volumes.map((vol, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-sm transition-all duration-75 ${isRecording ? 'bg-primary-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-slate-700'}`}
                  style={{ height: `${vol}%` }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* Session Naming Modal */}
      {showNamingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-md animate-fade-in shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Name Your Session</h3>
            <p className="text-slate-400 text-sm mb-6">What are you practicing today? Giving it a label helps you track your progress over time.</p>
            
            <input 
              type="text" 
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 mb-6"
              placeholder="e.g., Sales Pitch, Mock Interview..."
              autoFocus
            />
            
            <div className="flex gap-3 justify-end">
               <button 
                 onClick={() => setShowNamingModal(false)}
                 className="px-5 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => {
                   setShowNamingModal(false);
                   startRecordingSession();
                 }}
                 className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors shadow-lg text-sm font-medium"
               >
                 Start Recording
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

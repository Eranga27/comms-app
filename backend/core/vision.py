import cv2
import numpy as np
import base64
import random

class VisionAnalyzer:
    def __init__(self):
        try:
            import mediapipe as mp
            if hasattr(mp, 'solutions'):
                self.mode = "mediapipe"
                self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=False,
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
            else:
                # Fallback for Python 3.12+ where mp.solutions might be missing
                self.mode = "opencv"
                self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        except ImportError:
            self.mode = "opencv"
            self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    def analyze_frame(self, base64_data: str):
        try:
            # Remove header if present (e.g., data:image/jpeg;base64,...)
            if ',' in base64_data:
                base64_data = base64_data.split(',')[1]
                
            img_bytes = base64.b64decode(base64_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if image is None:
                return {"error": "Invalid image data"}
                
            metrics = {
                "face_detected": False,
                "eye_contact_score": 0.0
            }
            
            if self.mode == "mediapipe":
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = self.face_mesh.process(image_rgb)
                
                if results.multi_face_landmarks:
                    metrics["face_detected"] = True
                    landmarks = results.multi_face_landmarks[0].landmark
                    nose = landmarks[1]
                    left_eye = landmarks[159]
                    right_eye = landmarks[386]
                    
                    eye_center_x = (left_eye.x + right_eye.x) / 2
                    diff = abs(nose.x - eye_center_x)
                    
                    if diff < 0.03:
                        metrics["eye_contact_score"] = 0.95
                    elif diff < 0.08:
                        metrics["eye_contact_score"] = 0.70
                    else:
                        metrics["eye_contact_score"] = 0.30
            else:
                # OpenCV Fallback
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    metrics["face_detected"] = True
                    # Simulate a score for MVP OpenCV mode
                    metrics["eye_contact_score"] = random.uniform(0.4, 0.99)
                    
            return metrics
            
        except Exception as e:
            return {"error": str(e)}

vision_analyzer = VisionAnalyzer()

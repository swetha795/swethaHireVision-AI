"""
Emotion detection from webcam frames using OpenCV (face detection) +
DeepFace (pre-trained CNN emotion classifier, backed by TensorFlow).

We use a PRE-TRAINED model (not training our own) since training a
reliable emotion-recognition CNN from scratch needs large labeled
datasets (e.g. FER2013) and significant compute/time. DeepFace bundles
a pre-trained model so this runs out of the box.

Frames are received as base64-encoded JPEG/PNG strings captured
periodically by the frontend webcam during each answer.
"""
import base64
import numpy as np
import cv2

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except Exception:
    # DeepFace/TensorFlow may not be installed in lightweight/dev setups.
    # We fall back to a neutral-weighted mock so the rest of the app still works.
    DEEPFACE_AVAILABLE = False

# Map DeepFace's 7 emotion classes into our 4 interview-relevant buckets
EMOTION_MAP = {
    "happy": "happy",
    "neutral": "neutral",
    "surprise": "confident",
    "angry": "nervous",
    "fear": "nervous",
    "sad": "nervous",
    "disgust": "nervous",
}


def _decode_base64_image(b64_string):
    """Convert a base64 data-URL string into an OpenCV BGR image."""
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    img_bytes = base64.b64decode(b64_string)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


def analyze_emotion_frames(base64_frames):
    """
    Analyze a list of base64 frames captured during one answer.
    Returns dominant emotion + percentage breakdown across our 4 buckets.
    """
    buckets = {"confident": 0, "neutral": 0, "nervous": 0, "happy": 0}

    if not base64_frames:
        # No frames captured (e.g. camera off) - return a neutral default
        buckets["neutral"] = 100
        return {"dominantEmotion": "neutral", "breakdown": buckets}

    if not DEEPFACE_AVAILABLE:
        # Graceful fallback so the demo still runs without heavy ML deps installed
        buckets["neutral"] = 60
        buckets["confident"] = 40
        return {"dominantEmotion": "neutral", "breakdown": buckets}

    analyzed_count = 0
    for frame_b64 in base64_frames:
        try:
            img = _decode_base64_image(frame_b64)
            if img is None:
                continue
            result = DeepFace.analyze(img, actions=["emotion"], enforce_detection=False, silent=True)
            # DeepFace returns a list when multiple faces are detected; use the first
            if isinstance(result, list):
                result = result[0]
            dominant = result.get("dominant_emotion", "neutral")
            mapped = EMOTION_MAP.get(dominant, "neutral")
            buckets[mapped] += 1
            analyzed_count += 1
        except Exception:
            continue  # skip unreadable/undetectable frames

    if analyzed_count == 0:
        buckets["neutral"] = 100
        return {"dominantEmotion": "neutral", "breakdown": buckets}

    # Convert raw counts to percentages
    for key in buckets:
        buckets[key] = round((buckets[key] / analyzed_count) * 100)

    dominant_emotion = max(buckets, key=buckets.get)
    return {"dominantEmotion": dominant_emotion, "breakdown": buckets}

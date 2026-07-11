"""
HireVision AI - Python AI Microservice
Handles:
  1. Resume parsing + NLP-based analysis (skills, ATS score, keyword match)
  2. Emotion detection from webcam frames (OpenCV + DeepFace/TensorFlow)
  3. Answer scoring (NLP-based heuristic scoring of interview answers)

Run with: python app.py   (defaults to http://127.0.0.1:5001)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from utils.resume_parser import extract_text, analyze_resume
from utils.emotion_detector import analyze_emotion_frames
from utils.scorer import score_answer

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "HireVision AI Service"})


@app.route("/analyze-resume", methods=["POST"])
def analyze_resume_route():
    """
    Accepts a multipart/form-data resume file + targetRole.
    Returns extracted text, detected skills, ATS score, keyword match, etc.
    """
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files["resume"]
    target_role = request.form.get("targetRole", "Software Engineer")

    temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(temp_path)

    try:
        raw_text = extract_text(temp_path)
        analysis = analyze_resume(raw_text, target_role)
        analysis["rawText"] = raw_text[:3000]  # cap stored text size
        return jsonify(analysis)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route("/analyze-answer", methods=["POST"])
def analyze_answer_route():
    """
    Accepts JSON: { question, answerText, emotionFrames: [base64 images] }
    Returns emotion breakdown + answer scoring + feedback.
    """
    data = request.get_json(force=True)
    question = data.get("question", "")
    answer_text = data.get("answerText", "")
    emotion_frames = data.get("emotionFrames", [])

    emotion_result = analyze_emotion_frames(emotion_frames)
    scoring_result = score_answer(question, answer_text)

    return jsonify({"emotion": emotion_result, "scoring": scoring_result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import scam_model  # our TF-IDF + RF model wrapper

app = Flask(__name__)
CORS(app)  # allow frontend (Netlify/Vite dev) to call this API


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "ok",
        "message": "Scam Analyzer backend (TF-IDF + RandomForest) running"
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").trim() if hasattr(str, "trim") else (data.get("message") or "").strip()
    # For safety if .trim isn't available in Python version, but usually strip is enough

    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "Message text is required"}), 400

    result = scam_model.analyze(message)

    # result already has: label, score (0–1), probabilities, reasons
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)

# ml_model.py
import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path("scam_model.joblib")


class ScamModel:
    def __init__(self, model):
        self.model = model

    def analyze(self, text: str):
        """
        Returns:
          {
            "label": "scam" | "not_scam",
            "score": float (0.0–1.0, prob of predicted class),
            "probabilities": {"ham": p0, "scam": p1},
            "reasons": [list of explanation strings]
          }
        """

        probs = self.model.predict_proba([text])[0]  # [p_ham, p_scam]
        p_ham, p_scam = float(probs[0]), float(probs[1])

        # predicted label
        pred = int(np.argmax(probs))
        label = "scam" if pred == 1 else "not_scam"
        score = probs[pred]  # probability of predicted class

        # Simple heuristic explanations based on text patterns
        reasons = []
        lowered = text.lower()

        if label == "scam":
            if any(w in lowered for w in ["password", "otp", "cvv", "pin", "bank details"]):
                reasons.append("Asks for sensitive login or banking information.")
            if any(w in lowered for w in ["click", "link", "verify", "login here"]):
                reasons.append("Contains links or asks you to click to verify something.")
            if any(w in lowered for w in ["urgent", "immediately", "final notice", "last warning"]):
                reasons.append("Uses urgency or fear tactics common in scams.")
            if any(w in lowered for w in ["lottery", "prize", "winner", "inheritance"]):
                reasons.append("Mentions unrealistic rewards like lottery or inheritance.")
            if not reasons:
                reasons.append("Model detected patterns similar to known phishing messages.")
        else:
            reasons.append("Message looks similar to normal, legitimate communication.")

        return {
            "label": label,
            "score": float(score),
            "probabilities": {
                "ham": p_ham,
                "scam": p_scam,
            },
            "reasons": reasons,
        }


# Load the model at import time
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Trained model not found at {MODEL_PATH}. Run train_tfidf_rf.py first."
    )

_loaded_model = joblib.load(MODEL_PATH)
scam_model = ScamModel(_loaded_model)

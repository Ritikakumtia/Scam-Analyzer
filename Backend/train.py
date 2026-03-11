# train_tfidf_rf.py
import pandas as pd
import numpy as np
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

import joblib

# === CONFIG ===
DATA_PATH = Path("emails.csv")   # change if your file has another name
TEXT_COLUMN = "body"             # change if your text column is named differently
LABEL_COLUMN = "label"           # change if label column name differs
MODEL_PATH = Path("scam_model.joblib")


def load_and_clean():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded raw data: {len(df)} rows")

    # Ensure the necessary columns exist
    if TEXT_COLUMN not in df.columns or LABEL_COLUMN not in df.columns:
        raise ValueError(
            f"Columns '{TEXT_COLUMN}' or '{LABEL_COLUMN}' not found. "
            f"Columns present: {list(df.columns)}"
        )

    # Drop rows with missing values
    before = len(df)
    df = df.dropna(subset=[TEXT_COLUMN, LABEL_COLUMN]).copy()
    print(f"After dropping NaNs: {len(df)} rows (removed {before - len(df)})")

    # Strip whitespace and remove empty messages
    df[TEXT_COLUMN] = df[TEXT_COLUMN].astype(str).str.strip()
    df = df[df[TEXT_COLUMN] != ""].reset_index(drop=True)
    print(f"After removing empty text: {len(df)} rows")

    # Deduplicate by body
    before = len(df)
    df = df.drop_duplicates(subset=[TEXT_COLUMN]).reset_index(drop=True)
    print(f"After deduplication: {len(df)} rows (removed {before - len(df)} duplicates)")

    # Normalize labels to 0/1
    labels_raw = df[LABEL_COLUMN].values

    # If numeric, just cast to int
    if np.issubdtype(labels_raw.dtype, np.number):
        labels = labels_raw.astype(int)
    else:
        labels = []
        for lbl in labels_raw:
            l = str(lbl).lower().strip()
            if l in ("spam", "phishing", "fraud", "malicious", "1", "true", "yes"):
                labels.append(1)
            else:
                labels.append(0)
        labels = np.array(labels, dtype=int)

    texts = df[TEXT_COLUMN].astype(str)

    print("Label distribution:", np.bincount(labels))
    return texts, labels


def main():
    X, y = load_and_clean()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")

    # TF-IDF + RandomForest pipeline
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            min_df=3
        )),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        ))
    ])

    print("Training TF-IDF + RandomForest model...")
    pipeline.fit(X_train, y_train)

    print("Evaluating on test set...")
    y_pred = pipeline.predict(X_test)

    print("=== Classification Report ===")
    print(classification_report(y_test, y_pred))

    print("=== Confusion Matrix ===")
    print(confusion_matrix(y_test, y_pred))

    joblib.dump(pipeline, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()

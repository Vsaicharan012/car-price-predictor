from pathlib import Path
from flask_cors import CORS

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
import json

BASE_DIR = Path(__file__).resolve().parent.parent
model = joblib.load(BASE_DIR / "models" / "car_price_model.joblib")

FEATURES = ["year", "km_driven", "fuel", "seller_type", "transmission",
            "owner", "mileage", "engine", "max_power", "seats", "brand"]


with open(BASE_DIR / "models" / "form_options.json") as f:
    OPTIONS = json.load(f)

NUMERIC_RULES = {
    "year": (1994, 2020),
    "km_driven": (1000, 600000),
    "mileage": (9, 45),
    "engine": (600, 3700),
    "max_power": (30, 410),
    "seats": (2, 14),
}

app = Flask(__name__)
CORS(app)

def validate(data):
    errors = []
    if not isinstance(data, dict):
        return ["Request body must be a JSON object."]

    for field in FEATURES:
        if field not in data or data[field] in (None, ""):
            errors.append(f"'{field}' is required.")
    if errors:
        return errors

    for field, (low, high) in NUMERIC_RULES.items():
        try:
            value = float(data[field])
        except (TypeError, ValueError):
            errors.append(f"'{field}' must be a number.")
            continue
        if not low <= value <= high:
            errors.append(f"'{field}' must be between {low} and {high}.")

    for field, allowed in OPTIONS.items():
        if data[field] not in allowed:
            errors.append(f"'{field}' must be one of: {', '.join(allowed)}.")

    return errors

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    errors = validate(data)
    if errors:
        return jsonify({"errors": errors}), 400

    try:
        row = pd.DataFrame([data], columns=FEATURES)
        for field in NUMERIC_RULES:
            row[field] = row[field].astype(float)
        price = float(np.expm1(model.predict(row)[0]))
    except Exception:
        return jsonify({"errors": ["Prediction failed on the server."]}), 500

    return jsonify({"predicted_price": round(price)})

@app.route("/api/options", methods=["GET"])
def options():
    return jsonify({
        "options": OPTIONS,
        "ranges": NUMERIC_RULES,
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
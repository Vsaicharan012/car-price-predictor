# Used Car Price Predictor

A full-stack machine learning web app that estimates the resale price of a used car.

## Tech stack
- **Frontend:** React (Vite), plain CSS
- **Backend:** Python Flask REST API
- **ML:** pandas, NumPy, scikit-learn (Random Forest), joblib

## How it works
1. The user enters car details in the React form.
2. React sends them as JSON to the Flask `/api/predict` endpoint.
3. Flask validates the input and runs it through a saved scikit-learn pipeline.
4. The predicted price is returned and displayed.

## Project structure
```
data/        raw and cleaned datasets
notebooks/   EDA and model training
models/      saved model and form options
backend/     Flask API
frontend/    React app
```

## Setup
(We'll fill this in next.)
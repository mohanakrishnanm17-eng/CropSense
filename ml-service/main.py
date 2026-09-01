from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import json
import os
import io
from PIL import Image

app = FastAPI()

# Allow the frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and label mapping once, when the server starts
model = tf.keras.models.load_model(os.path.join("models", "disease_classifier.h5"))

with open("labels.json", "r") as f:
    class_indices = json.load(f)
index_to_class = {v: k for k, v in class_indices.items()}


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CropSense ML service is running"}


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    # Read the uploaded image file
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((160, 160))

    # Preprocess exactly like during training
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    predicted_class = index_to_class[predicted_index]
    confidence = float(predictions[0][predicted_index] * 100)

    return {
        "disease": predicted_class,
        "confidence": round(confidence, 2)
    }
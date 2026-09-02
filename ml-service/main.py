from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import json
import os
import io
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model(os.path.join("models", "disease_classifier.h5"))

with open("labels.json", "r") as f:
    class_indices = json.load(f)
index_to_class = {v: k for k, v in class_indices.items()}

CONFIDENCE_THRESHOLD = 60.0
GREEN_RATIO_THRESHOLD = 0.15


def is_likely_leaf_image(img: Image.Image) -> bool:
    """Quick heuristic: real leaf photos are dominated by green tones."""
    img_small = img.resize((100, 100))
    arr = np.array(img_small).astype(int)

    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    green_mask = (g > r + 10) & (g > b + 10)
    green_ratio = np.mean(green_mask)

    return green_ratio >= GREEN_RATIO_THRESHOLD


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CropSense ML service is running"}


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    if not is_likely_leaf_image(img):
        return {
            "valid": False,
            "message": "This doesn't look like a plant leaf photo. Please upload a clear image of a leaf."
        }

    img_resized = img.resize((160, 160))
    img_array = np.array(img_resized) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    predicted_class = index_to_class[predicted_index]
    confidence = float(predictions[0][predicted_index] * 100)

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "valid": False,
            "message": "Couldn't confidently identify a disease. Please try a clearer, closer photo of the leaf."
        }

    return {
        "valid": True,
        "disease": predicted_class,
        "confidence": round(confidence, 2)
    }
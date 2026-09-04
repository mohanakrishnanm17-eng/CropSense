from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import json
import os
import io
import base64
import cv2
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

LAST_CONV_LAYER_NAME = "Conv_1"

grad_model = tf.keras.models.Model(
    inputs=model.inputs,
    outputs=[model.get_layer(LAST_CONV_LAYER_NAME).output, model.output]
)


def is_likely_leaf_image(img: Image.Image) -> bool:
    img_small = img.resize((100, 100))
    arr = np.array(img_small).astype(int)
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]
    green_mask = (g > r + 10) & (g > b + 10)
    green_ratio = np.mean(green_mask)
    return green_ratio >= GREEN_RATIO_THRESHOLD


def generate_gradcam_overlay(img: Image.Image, img_array: np.ndarray, predicted_index: int) -> str:
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, predicted_index]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    heatmap = heatmap.numpy()

    original_size = img.size
    heatmap_resized = cv2.resize(heatmap, original_size)
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    original_arr = np.array(img.convert("RGB"))
    overlay = cv2.addWeighted(original_arr, 0.6, heatmap_colored, 0.4, 0)

    overlay_img = Image.fromarray(overlay)
    buffer = io.BytesIO()
    overlay_img.save(buffer, format="JPEG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/jpeg;base64,{encoded}"


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
    img_array = np.expand_dims(img_array, axis=0).astype(np.float32)

    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    predicted_class = index_to_class[predicted_index]
    confidence = float(predictions[0][predicted_index] * 100)

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "valid": False,
            "message": "Couldn't confidently identify a disease. Please try a clearer, closer photo of the leaf."
        }

    heatmap_image = generate_gradcam_overlay(img, img_array, predicted_index)

    return {
        "valid": True,
        "disease": predicted_class,
        "confidence": round(confidence, 2),
        "heatmap": heatmap_image
    }
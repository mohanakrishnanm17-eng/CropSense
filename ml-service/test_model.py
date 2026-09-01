import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import json
import os
import random

# Load the trained model
model = tf.keras.models.load_model(os.path.join("models", "disease_classifier.h5"))

# Load label mapping (class name -> index), then reverse it (index -> class name)
with open("labels.json", "r") as f:
    class_indices = json.load(f)
index_to_class = {v: k for k, v in class_indices.items()}

# Pick a random test image from the dataset to try it out
DATA_DIR = os.path.join("data", "archive", "PlantVillage")
categories = [c for c in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, c))]
random_category = random.choice(categories)
category_path = os.path.join(DATA_DIR, random_category)
random_image_name = random.choice(os.listdir(category_path))
img_path = os.path.join(category_path, random_image_name)

print(f"Testing with image: {img_path}")
print(f"Actual label: {random_category}\n")

# Preprocess the image the same way training data was processed
img = image.load_img(img_path, target_size=(160, 160))
img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Predict
predictions = model.predict(img_array)
predicted_index = np.argmax(predictions[0])
predicted_class = index_to_class[predicted_index]
confidence = predictions[0][predicted_index] * 100

print(f"Predicted label: {predicted_class}")
print(f"Confidence: {confidence:.2f}%")

if predicted_class == random_category:
    print("\nCORRECT prediction!")
else:
    print("\nINCORRECT prediction.")
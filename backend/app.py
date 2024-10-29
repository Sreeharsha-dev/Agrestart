from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import cv2
import numpy as np
from PIL import Image
import io
import base64
import os
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load models
try:
    leaf_model = YOLO('models/Leaf.pt')
    pest_model = YOLO('models/Pest.pt')
    soil_model = YOLO('models/Soil.pt')
except Exception as e:
    print(f"Error loading models: {str(e)}")
    leaf_model = None
    pest_model = None
    soil_model = None

# Disease information database
LEAF_DISEASES = {
    "Bacterial_Leaf_Blight": {
        "description": "A serious bacterial disease affecting rice plants",
        "causes": [
            "Caused by Xanthomonas oryzae pv. oryzae",
            "High humidity and temperatures between 25-30°C",
            "Wounds on leaves from mechanical damage"
        ],
        "treatment": [
            "Use disease-resistant rice varieties",
            "Maintain good field drainage",
            "Apply copper-based bactericides",
            "Remove infected plants and debris",
            "Practice crop rotation"
        ]
    },
    "Leaf_Blast": {
        "description": "A fungal disease that affects rice leaves and panicles",
        "causes": [
            "Caused by Magnaporthe oryzae",
            "High humidity and leaf wetness",
            "Nitrogen excess"
        ],
        "treatment": [
            "Use resistant varieties",
            "Apply fungicides preventively",
            "Maintain balanced fertilization",
            "Improve air circulation",
            "Avoid dense planting"
        ]
    },
    "Tungro": {
        "description": "A viral disease transmitted by green leafhoppers",
        "causes": [
            "Caused by rice tungro bacilliform virus (RTBV)",
            "Transmitted by green leafhoppers",
            "Presence of infected rice plants or weeds"
        ],
        "treatment": [
            "Use resistant varieties",
            "Control leafhopper populations",
            "Remove infected plants",
            "Synchronize planting",
            "Maintain field cleanliness"
        ]
    }
}

PEST_INFO = {
    "aphid": {
        "description": "Small sap-sucking insects that can cause significant damage",
        "impact": "Reduces plant vigor, transmits diseases, produces honeydew",
        "control": [
            "Introduce natural predators like ladybugs",
            "Use insecticidal soaps",
            "Apply neem oil",
            "Remove heavily infested parts",
            "Maintain healthy plants"
        ]
    },
    "fruit_fly": {
        "description": "Small flies that lay eggs in fruits and vegetables",
        "impact": "Damages fruits, reduces yield quality",
        "control": [
            "Use fruit fly traps",
            "Practice good sanitation",
            "Apply approved insecticides",
            "Remove fallen fruits",
            "Use protective bags for fruits"
        ]
    },
    "scale_insect": {
        "description": "Small insects that attach to plants and suck sap",
        "impact": "Weakens plants, reduces growth, produces honeydew",
        "control": [
            "Prune affected areas",
            "Apply horticultural oil",
            "Use systemic insecticides",
            "Encourage natural predators",
            "Maintain plant health"
        ]
    }
}

SOIL_TYPES = {
    "chalky": {
        "description": "Alkaline soil with high calcium carbonate content",
        "characteristics": [
            "High pH levels",
            "Good drainage",
            "Can be nutrient deficient"
        ],
        "suitable_crops": [
            "Lavender",
            "Spinach",
            "Cabbage",
            "Sweet corn",
            "Beans"
        ],
        "management": [
            "Add organic matter regularly",
            "Use acidifying fertilizers",
            "Monitor nutrient levels",
            "Choose drought-resistant crops"
        ]
    },
    "clay": {
        "description": "Heavy soil with high mineral content",
        "characteristics": [
            "High water retention",
            "Poor drainage",
            "Rich in nutrients"
        ],
        "suitable_crops": [
            "Wheat",
            "Rice",
            "Cabbage",
            "Broccoli",
            "Brussels sprouts"
        ],
        "management": [
            "Improve drainage",
            "Add organic matter",
            "Avoid working wet soil",
            "Use raised beds"
        ]
    },
    "silt": {
        "description": "Fertile soil with medium-sized particles",
        "characteristics": [
            "Good water retention",
            "Rich in nutrients",
            "Can become compacted"
        ],
        "suitable_crops": [
            "Most vegetables",
            "Fruit trees",
            "Berries",
            "Ornamental plants"
        ],
        "management": [
            "Maintain organic matter",
            "Avoid soil compaction",
            "Use cover crops",
            "Practice crop rotation"
        ]
    }
}


def process_image(image_data, model_type):
    try:
        # Ensure the output directory exists
        output_dir = "static"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Convert base64 to image
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB and OpenCV format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image_cv2 = np.array(image)
        image_cv2 = cv2.cvtColor(image_cv2, cv2.COLOR_RGB2BGR)

        # Select model
        if model_type == 'leaf' and leaf_model:
            model, info_db = leaf_model, LEAF_DISEASES
        elif model_type == 'pest' and pest_model:
            model, info_db = pest_model, PEST_INFO
        elif model_type == 'soil' and soil_model:
            model, info_db = soil_model, SOIL_TYPES
        else:
            return {"error": f"{model_type.capitalize()} model not available"}

        # Run inference
        results = model(image_cv2)
        if not results or len(results) == 0:
            return {"error": "No detections found"}

        predictions = results[0]
        if len(predictions.boxes) == 0:
            return {"error": "No bounding boxes found"}

        # Process each bounding box
        for i, box in enumerate(predictions.boxes.xyxy):
            cls = int(predictions.boxes.cls[i])
            confidence = float(predictions.boxes.conf[i])
            label = predictions.names[cls]

            x_min, y_min, x_max, y_max = map(int, box)
            cv2.rectangle(image_cv2, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            cv2.putText(image_cv2, f"{label}: {confidence:.2f}", 
                        (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 
                        (0, 255, 0), 2)

        # Save processed image
        image_cv2 = cv2.cvtColor(image_cv2, cv2.COLOR_BGR2RGB)
        image_pil = Image.fromarray(image_cv2)
        output_path = os.path.join(output_dir, "processed_image.jpg")
        image_pil.save(output_path)

        # Select highest confidence prediction for response
        best_pred_idx = predictions.boxes.conf.argmax()
        best_pred_class = predictions.names[int(predictions.boxes.cls[best_pred_idx])]
        best_pred_conf = float(predictions.boxes.conf[best_pred_idx])
        best_pred_box = predictions.boxes.xyxy[best_pred_idx].tolist()

        # Fetch additional information
        info = info_db.get(best_pred_class, {})

        return {
            "prediction": best_pred_class,
            "confidence": best_pred_conf,
            "info": info,
            "bbox": best_pred_box,
            "image_url": output_path
        }
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return {"error": str(e)}

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid content type, expected JSON"}), 400
        
        data = request.json
        if not data or 'image' not in data or 'model_type' not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        image_data = data['image']
        model_type = data['model_type']
        
        if model_type not in ['leaf', 'pest', 'soil']:
            return jsonify({"error": "Invalid model type"}), 400
        
        result = process_image(image_data, model_type)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze route: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
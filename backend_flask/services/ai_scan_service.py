import os
import io
import json
import base64
from datetime import datetime
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms
import timm

class AlzheimerEfficientNetB0(nn.Module):
    """
    Architecture of the trained Alzheimer's EfficientNetB0 classifier.
    Backbone: Pretrained EfficientNetB0 feature extractor (1280-dim feature vector).
    Classification Head: BatchNorm -> Dropout(0.3) -> Linear(1280, 128) -> ReLU -> BatchNorm -> Dropout(0.21) -> Linear(128, num_classes).
    """
    def __init__(self, num_classes=4, dropout_rate=0.3, hidden_dim=128):
        super(AlzheimerEfficientNetB0, self).__init__()
        self.backbone = timm.create_model('efficientnet_b0', pretrained=False, num_classes=0)
        in_features = self.backbone.num_features
        self.classifier = nn.Sequential(
            nn.BatchNorm1d(in_features),
            nn.Dropout(dropout_rate),
            nn.Linear(in_features, hidden_dim),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(hidden_dim),
            nn.Dropout(dropout_rate * 0.7),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x):
        return self.classifier(self.backbone(x))


class AiScanService:
    _model = None
    _classes = None
    _class_descriptions = None
    _preprocessing_config = None
    _transform = None
    _device = None
    _is_initialized = False

    @classmethod
    def _find_model_dir(cls):
        """Locates the transferred alzheimer_model_package directory across possible working directories."""
        current_file_dir = os.path.dirname(os.path.abspath(__file__))
        search_paths = [
            os.path.abspath(os.path.join(current_file_dir, '..', '..', 'alzheimer_model_package')),
            os.path.abspath(os.path.join(current_file_dir, '..', 'alzheimer_model_package')),
            os.path.abspath(os.path.join(current_file_dir, 'alzheimer_model_package')),
            os.path.join(os.getcwd(), 'alzheimer_model_package'),
            os.path.join(os.getcwd(), 'neuroguardian', 'alzheimer_model_package')
        ]
        for path in search_paths:
            if os.path.isdir(path) and os.path.exists(os.path.join(path, 'class_names.json')):
                return path
        raise FileNotFoundError(f"alzheimer_model_package directory not found in candidate paths: {search_paths}")

    @classmethod
    def initialize(cls):
        """Loads model weights, configs, and transforms into memory once (Singleton)."""
        if cls._is_initialized and cls._model is not None:
            return

        model_dir = cls._find_model_dir()

        # 1. Load exact class definitions from class_names.json
        class_names_path = os.path.join(model_dir, 'class_names.json')
        if not os.path.exists(class_names_path):
            raise FileNotFoundError(f"class_names.json missing at {class_names_path}")
        with open(class_names_path, 'r', encoding='utf-8') as f:
            class_data = json.load(f)
        cls._classes = class_data.get('classes', ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"])
        cls._class_descriptions = class_data.get('class_descriptions', {})

        # 2. Load exact preprocessing configuration from preprocessing_config.json
        prep_path = os.path.join(model_dir, 'preprocessing_config.json')
        if os.path.exists(prep_path):
            with open(prep_path, 'r', encoding='utf-8') as f:
                cls._preprocessing_config = json.load(f)
        else:
            cls._preprocessing_config = {
                "target_size": [224, 224],
                "normalization": {
                    "mean": [0.485, 0.456, 0.406],
                    "std": [0.229, 0.224, 0.225]
                }
            }

        norm_cfg = cls._preprocessing_config.get('normalization', {})
        norm_mean = norm_cfg.get('mean', [0.485, 0.456, 0.406])
        norm_std = norm_cfg.get('std', [0.229, 0.224, 0.225])
        target_size = tuple(cls._preprocessing_config.get('target_size', [224, 224]))

        cls._transform = transforms.Compose([
            transforms.Resize(target_size),
            transforms.Lambda(lambda img: img.convert('RGB')),
            transforms.ToTensor(),
            transforms.Normalize(mean=norm_mean, std=norm_std)
        ])

        # 3. Load trained model weights from best_alzheimer_efficientnetb0.pth
        cls._device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = AlzheimerEfficientNetB0(num_classes=len(cls._classes))

        weights_path = os.path.join(model_dir, 'best_alzheimer_efficientnetb0.pth')
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model checkpoint missing at {weights_path}")

        checkpoint = torch.load(weights_path, map_location=cls._device)
        state_dict = checkpoint.get('model_state_dict', checkpoint)
        model.load_state_dict(state_dict)
        model.to(cls._device)
        model.eval()

        cls._model = model
        cls._is_initialized = True
        print(f"[AiScanService] Real Alzheimer's model loaded successfully from {weights_path} on {cls._device}")

    @classmethod
    def predict_alzheimer_risk(cls, image_payload):
        """
        Executes real Alzheimer's classification inference on the uploaded scan image.
        Uses exact training preprocessing and class mappings.
        """
        if not cls._is_initialized or cls._model is None:
            cls.initialize()

        if not image_payload:
            raise ValueError("No scan image payload provided for inference.")

        # Decode base64 payload
        if isinstance(image_payload, str):
            if "," in image_payload:
                base64_str = image_payload.split(",")[1]
            else:
                base64_str = image_payload
            image_bytes = base64.b64decode(base64_str)
            pil_image = Image.open(io.BytesIO(image_bytes))
        elif isinstance(image_payload, Image.Image):
            pil_image = image_payload
        else:
            raise TypeError("Unsupported image payload format. Expected base64 string or PIL Image.")

        # Apply exact preprocessing transformations
        tensor = cls._transform(pil_image).unsqueeze(0).to(cls._device)

        # Forward pass & Softmax probabilities
        with torch.no_grad():
            logits = cls._model(tensor)
            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

        pred_idx = int(probs.argmax())
        predicted_class = cls._classes[pred_idx]
        confidence_pct = round(float(probs[pred_idx]) * 100.0, 1)

        # Probability distribution mapping
        prob_dist = {
            c: f"{round(float(p) * 100.0, 1)}%"
            for c, p in zip(cls._classes, probs)
        }

        # Calculate overall Alzheimer's Risk based directly on model probabilities
        non_dem_idx = cls._classes.index("NonDemented") if "NonDemented" in cls._classes else -1
        if predicted_class == "NonDemented":
            non_dem_prob = float(probs[non_dem_idx]) if non_dem_idx >= 0 else 1.0
            risk_pct = round((1.0 - non_dem_prob) * 100.0, 1)
        else:
            if non_dem_idx >= 0:
                dementia_sum = sum(float(p) for i, p in enumerate(probs) if i != non_dem_idx)
                risk_pct = round(dementia_sum * 100.0, 1)
            else:
                risk_pct = confidence_pct

        # Exact class description from class_names.json
        class_desc = cls._class_descriptions.get(predicted_class, "")
        stage_display = f"{predicted_class} ({class_desc})" if class_desc else predicted_class

        return {
            'predictedClass': predicted_class,
            'stage': stage_display,
            'alzheimerRisk': f"{risk_pct}%",
            'aiConfidence': f"{confidence_pct}%",
            'probabilityDistribution': prob_dist,
            'heatmapRegion': "Not evaluated (2D slice classification model does not generate localization heatmaps)",
            'recommendation': "Not evaluated (Clinical recommendations must be provided by a licensed physician)",
            'timestamp': datetime.now().isoformat(),
            'disclaimer': 'Research and educational prototype only. Not intended for clinical diagnostic use. Consult a licensed neurologist.'
        }


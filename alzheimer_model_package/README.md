# 🧠 Alzheimer's Disease MRI Classification Model Package

Standalone machine learning deployment package for classifying Alzheimer's disease stages from brain MRI scans using transfer learning on **EfficientNetB0**.

This package is completely independent and self-contained.

---

## 1. Model Architecture

* **Backbone Feature Extractor**: EfficientNetB0 pre-trained on ImageNet ($4.01\text{M}$ parameters, $1280$-dimensional global feature representation).
* **Classification Head**:
  ```
  Input Tensor [Batch, 3, 224, 224]
    │
    ▼
  EfficientNetB0 Backbone (1280-d Feature Vector)
    │
    ├── BatchNorm1d(1280)
    ├── Dropout(p = 0.30)
    ├── Linear(1280 → 128)
    ├── ReLU Activation
    ├── BatchNorm1d(128)
    ├── Dropout(p = 0.21)
    └── Linear(128 → 4 Output Classes)
    │
    ▼
  Softmax Output Probabilities [Batch, 4]
  ```
* **Total Parameters**: $4,174,848$ ($\sim 16.2\text{ MB}$ uncompressed).

---

## 2. Dataset Used

* **Title**: Alzheimer's Dataset (4 class of images)
* **Modality**: **MRI** (2D T1-weighted axial brain slices — **NOT CT**)
* **Total Scans**: $6,400$ images across 4 disease severity categories
* **Resolution**: Native $176 \times 208$ pixels, 8-bit grayscale

---

## 3. Dataset Source

* **Public Distribution**: Kaggle dataset repository (`tourist55/alzheimers-dataset-4-class-of-images`)
* **Mirror Archive**: Hugging Face datasets repository (`SilpaCS/Alzheimer`)

---

## 4. Dataset License & Usage Terms

* **License**: Public Domain / Open Research (CC0 / Open Data Commons Attribution)
* **Terms**: Free for educational, academic, and non-commercial machine learning research.

---

## 5. Input Image Requirements

* **Modality**: Structural Brain MRI (axial cross-sectional slice)
* **Accepted Formats**: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tif`, `.tiff`
* **Channels**: Single-channel grayscale (automatically expanded to 3 channels) or RGB
* **Target Size**: Dynamically resized to $224 \times 224$ pixels

---

## 6. Image Preprocessing Protocol

All inference inputs must undergo the following exact transformation:

1. **Resolution Resize**: Bilinear interpolation to $224 \times 224$ pixels.
2. **Channel Duplication**: Convert single-channel grayscale (`L`) to 3-channel RGB.
3. **Tensor Scaling**: Convert pixel integers $[0, 255] \longrightarrow [0.0, 1.0]$ float tensor.
4. **ImageNet Normalization**:
   $$\text{Input}_{\text{norm}} = \frac{\text{Pixel} - \mu}{\sigma}$$
   * $\mu = [0.485, 0.456, 0.406]$
   * $\sigma = [0.229, 0.224, 0.225]$

*Configuration stored in: [`preprocessing_config.json`](preprocessing_config.json)*

---

## 7. Class Mapping

The model outputs predictions across 4 discrete diagnostic categories:

| Index | Class Name | Description |
| :---: | :--- | :--- |
| `0` | **MildDemented** | Mild clinical Alzheimer's disease |
| `1` | **ModerateDemented** | Moderate to advanced cognitive impairment |
| `2` | **NonDemented** | Normal cognitive control (no dementia) |
| `3` | **VeryMildDemented** | Early cognitive decline (Mild Cognitive Impairment equivalent) |

*Configuration stored in: [`class_names.json`](class_names.json)*

---

## 8. Model Output Format

Inference yields a multi-class probability distribution summing to $1.0$ ($100\%$):

```json
{
  "status": "success",
  "image_path": "scan_001.jpg",
  "predicted_class": "VeryMildDemented",
  "predicted_index": 3,
  "confidence": 0.8911,
  "confidence_percentage": "89.11%",
  "probability_distribution": {
    "MildDemented": 0.0326,
    "ModerateDemented": 0.0246,
    "NonDemented": 0.0517,
    "VeryMildDemented": 0.8911
  },
  "inference_time_ms": 24.8,
  "disclaimer": "Research and educational prototype only. Not intended for clinical diagnostic use."
}
```

---

## 9. Framework & Library Compatibility

* **Deep Learning Framework**: Keras 3.x / PyTorch 2.x
* **Core Dependencies**: `torch>=2.0.0`, `torchvision>=0.15.0`, `keras>=3.0.0`, `timm>=0.9.0`, `pillow>=9.5.0`, `numpy>=1.24.0`

---

## 10. Python Version Support

* Compatible with **Python 3.10**, **3.11**, **3.12**, **3.13**, and **3.14** (64-bit).

---

## 11. How to Load the Model (Python Code Snippet)

```python
import os
import json
import torch
import torch.nn as nn
import timm

class AlzheimerEfficientNetB0(nn.Module):
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

# 1. Load weights
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AlzheimerEfficientNetB0(num_classes=4).to(device)

checkpoint = torch.load("best_alzheimer_efficientnetb0.pth", map_location=device)
state_dict = checkpoint.get("model_state_dict", checkpoint)
model.load_state_dict(state_dict)
model.eval()
print("Model loaded successfully!")
```

---

## 12. How to Perform Inference

```python
from PIL import Image
from torchvision import transforms

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Lambda(lambda img: img.convert('RGB')),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load and preprocess image
image = Image.open("path_to_brain_mri.jpg")
tensor = transform(image).unsqueeze(0).to(device)

# Predict
with torch.no_grad():
    logits = model(tensor)
    probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

classes = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
pred_idx = probs.argmax()
print(f"Prediction: {classes[pred_idx]} ({probs[pred_idx]*100:.2f}% confidence)")
```

---

## 13. Known Technical Limitations

1. **Class Imbalance Sensitivity**: The source dataset has extreme class skew ($50\%$ NonDemented vs $1\%$ ModerateDemented). In unweighted inference, the model exhibits a bias toward `VeryMildDemented`.
2. **2D Slice Limitations**: Analysis is performed on single 2D axial cross-sections rather than full 3D volumetric scans.
3. **Continuous Disease Spectrum**: The visual anatomical difference between healthy brain tissue and early Mild Cognitive Impairment is continuous and subtle.

---

## 14. Regulatory & Clinical Disclaimer

> [!CAUTION]
> **Research and Educational Prototype Only**: This machine learning package is strictly an educational research tool developed on public de-identified datasets. It is **NOT** an FDA-cleared or CE-marked medical diagnostic device, does **NOT** provide physician-certified medical diagnoses, and must **NEVER** be used for clinical decision-making or patient management without institutional IRB approval and regulatory clearance.

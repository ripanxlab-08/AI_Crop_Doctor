# 🌱 AI Crop Doctor

> **AI-powered mobile crop disease detection and farmer assistance
> platform**

AI Crop Doctor is a smart, farmer-focused application designed to help
identify crop diseases from leaf images using **MobileViT-based deep
learning**. The project combines computer vision, artificial
intelligence, and a lightweight mobile-friendly interface to provide
practical crop health assistance.

The project is being developed in phases, beginning with **Tomato
disease detection** and later expanding to additional crops.

------------------------------------------------------------------------

## 📌 Project Overview

Crop diseases can significantly affect agricultural productivity,
especially when identification is delayed or requires expert
intervention.

**AI Crop Doctor** aims to provide a simple workflow:

``` text
Farmer
   ↓
Capture / Upload Leaf Image
   ↓
Image Validation & Preprocessing
   ↓
MobileViT Disease Detection Model
   ↓
Disease Prediction + Confidence
   ↓
Farmer-Friendly Recommendation
   ↓
History / AI Assistant / Crop Reminders
```

The first implementation phase focuses specifically on **Tomato disease
classification**. Additional crops can be integrated later without
redesigning the complete application architecture.

------------------------------------------------------------------------

## 🎯 Objectives

-   Detect crop diseases from leaf images using deep learning.
-   Start with a focused **Tomato disease detection** model.
-   Use **MobileViT** for an efficient and lightweight vision model.
-   Provide disease predictions with confidence scores.
-   Present results through a clean and farmer-friendly mobile
    interface.
-   Maintain detection history for authenticated users.
-   Provide an AI assistant for general crop-health guidance.
-   Provide smart crop-calendar and reminder features.
-   Design the system so additional crops can be added in future phases.

------------------------------------------------------------------------

## 🚀 Current Development Scope

### Phase 1 --- Tomato Disease Detection

The initial model is trained only on classes beginning with:

``` text
Tomato___
```

All other crop classes are ignored during the first training phase.

This allows the project to establish and evaluate the complete pipeline
using one crop before expanding to other crops.

### Planned Expansion

Future versions can add:

-   Potato
-   Apple
-   Corn
-   Grape
-   Pepper
-   Other supported crops

The model-training pipeline will be designed so that new crop classes
can be added systematically.

------------------------------------------------------------------------

## 🧠 AI / Machine Learning

### Model

**MobileViT Small**

MobileViT is selected because the project targets a mobile-oriented
application where model efficiency is important.

### Training Approach

The project uses:

-   PyTorch
-   `timm`
-   Transfer Learning
-   Image Classification
-   AdamW optimizer
-   Cross Entropy Loss
-   Cosine Annealing learning-rate scheduling
-   GPU acceleration when available

### Initial Training Configuration

  Parameter           Configuration
  ------------------- ---------------------------------
  Model               MobileViT Small
  Framework           PyTorch
  Model Library       timm
  Input Size          224 × 224
  Batch Size          32
  Epochs              20
  Optimizer           AdamW
  Learning Rate       0.0001
  Loss Function       CrossEntropyLoss
  Scheduler           CosineAnnealingLR
  Training Strategy   Transfer Learning + Fine-tuning

### Image Augmentation

Training images use transformations such as:

-   Random Horizontal Flip
-   Random Rotation
-   Color Jitter
-   Image Normalization
-   Resize to 224 × 224

------------------------------------------------------------------------

## 📊 Model Evaluation

The training pipeline is intended to evaluate the model using:

-   Training Loss
-   Validation Loss
-   Training Accuracy
-   Validation Accuracy
-   Precision
-   Recall
-   F1 Score
-   Confusion Matrix
-   Classification Report

Training visualizations include:

``` text
Accuracy Plot
Loss Plot
Confusion Matrix
```

The best-performing model is saved separately from the latest training
checkpoint.

------------------------------------------------------------------------

## 📁 Dataset Structure

The dataset follows an `ImageFolder`-compatible structure:

``` text
Dataset/
│
├── train/
│   ├── Tomato___Class_1/
│   ├── Tomato___Class_2/
│   ├── Tomato___Class_3/
│   └── ...
│
└── valid/
    ├── Tomato___Class_1/
    ├── Tomato___Class_2/
    ├── Tomato___Class_3/
    └── ...
```

During the first phase, only directories beginning with:

``` text
Tomato___
```

are selected.

------------------------------------------------------------------------

## 🏗️ System Architecture

``` text
                    ┌─────────────────────┐
                    │      Farmer         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Mobile Interface  │
                    │   Image Capture      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Image Validation &  │
                    │   Preprocessing      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     MobileViT       │
                    │ Disease Classifier  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Prediction Result   │
                    │ Disease + Confidence│
                    └──────────┬──────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
          ┌────────────┐ ┌───────────┐ ┌─────────────┐
          │ Detection  │ │ AI        │ │ Crop        │
          │ History    │ │ Assistant │ │ Reminders   │
          └────────────┘ └───────────┘ └─────────────┘
```

------------------------------------------------------------------------

## 💻 Application Technology Stack

### Frontend

-   **Next.js**
-   **TypeScript**
-   Responsive mobile-first UI
-   Modern component-based architecture

### Backend / Cloud

-   **Supabase**
-   Supabase Authentication
-   PostgreSQL database
-   Row Level Security (RLS)
-   Storage where required

### AI / ML

-   Python
-   PyTorch
-   timm
-   MobileViT
-   Google Colab for initial model training

### Development

-   Git
-   GitHub
-   VS Code
-   Google Colab

------------------------------------------------------------------------

## 🔐 Authentication

Supabase Authentication is used for application authentication.

Planned authentication flow:

``` text
Signup
  ↓
Supabase Authentication
  ↓
Login
  ↓
Authenticated Dashboard
  ↓
Crop Disease Detection
```

Supported account operations include:

-   Sign Up
-   Email/Password Login
-   Logout
-   Session Management

User-specific application data can be associated with the authenticated
Supabase user ID.

> **Security:** Supabase secret keys and private credentials must never
> be committed to GitHub.

------------------------------------------------------------------------

## 🤖 AI Assistant

The application is planned to include an **AI Crop Assistant** that acts
as a farmer-friendly assistant.

Potential capabilities include:

-   Explain detected diseases in simple language.
-   Provide general crop-care guidance.
-   Answer crop-related questions.
-   Explain prevention practices.
-   Help farmers understand detection results.
-   Provide guidance based on crop growth stages.

The assistant is intended to complement the disease-classification model
rather than replace professional agricultural advice.

------------------------------------------------------------------------

## 📅 Smart Crop Calendar & Reminders

A planned feature of AI Crop Doctor is a crop calendar designed around
farming activities.

The calendar can help organize information such as:

-   Crop growing period
-   Expected harvest period
-   Suitable growing months
-   Crop-care reminders
-   Important farming activities
-   Disease-monitoring reminders

Example:

``` text
                 CROP CALENDAR

January     → Suitable crop / preparation
February    → Planting period
March       → Growth monitoring
April       → Disease monitoring
May         → Harvest period
```

The exact recommendations will depend on crop and location data added to
the system.

------------------------------------------------------------------------

## 🔬 Disease Detection Workflow

``` text
1. User captures/uploads leaf image
             ↓
2. Validate image
             ↓
3. Resize to 224 × 224
             ↓
4. Apply preprocessing
             ↓
5. Pass image to MobileViT
             ↓
6. Generate class probabilities
             ↓
7. Select highest-probability disease
             ↓
8. Display disease + confidence
             ↓
9. Store detection history
```

The prediction interface is planned to display:

``` text
Disease Name
Confidence Score
Top 3 Predictions
```

------------------------------------------------------------------------

## 🧪 Model Outputs

The training pipeline is intended to produce:

``` text
best_model.pth
last_model.pth
class_names.json
```

These files can be used by the prediction/inference component.

Example prediction:

``` text
Disease:
Tomato___Early_blight

Confidence:
94.32%

Top 3 Predictions:
1. Tomato___Early_blight     94.32%
2. Tomato___Late_blight       3.91%
3. Tomato___Healthy           1.77%
```

*The values above are an example format, not actual model results.*

------------------------------------------------------------------------

## 📂 Suggested Repository Structure

``` text
AI_Crop_Doctor/
│
├── app/                         # Next.js application
│   ├── page.tsx
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   └── ...
│
├── components/                 # Reusable UI components
│
├── lib/
│   └── supabase/               # Supabase client/configuration
│
├── ml/                         # Machine learning components
│   ├── training/
│   ├── inference/
│   ├── models/
│   └── evaluation/
│
├── public/                     # Static assets
│
├── notebooks/                  # Google Colab/Jupyter notebooks
│
├── .env.local                  # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

------------------------------------------------------------------------

## ⚙️ Local Development

### 1. Clone the repository

``` bash
git clone https://github.com/Roni23bhai/AI_Crop_Doctor.git
cd AI_Crop_Doctor
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create:

``` text
.env.local
```

Example:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit `.env.local`.

### 4. Start the development server

``` bash
npm run dev
```

Then open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## 🧠 Model Training

The initial MobileViT training can be performed in Google Colab using a
GPU.

Dataset preparation:

``` text
Google Drive
      ↓
Dataset ZIP / Dataset Folder
      ↓
Google Colab
      ↓
Extract Dataset
      ↓
Select Tomato___ Classes
      ↓
Train MobileViT
      ↓
Evaluate
      ↓
Save Best Model
```

The training pipeline is intentionally separated from the application so
that model development can be performed independently.

------------------------------------------------------------------------

## 📈 Evaluation Strategy

The model will be evaluated using both quantitative and visual metrics.

### Classification Metrics

-   Accuracy
-   Precision
-   Recall
-   F1 Score

### Diagnostic Visualization

-   Confusion Matrix
-   Training vs Validation Accuracy
-   Training vs Validation Loss
-   Classification Report

These results will help determine whether the model generalizes
effectively to validation images.

------------------------------------------------------------------------

## 🔮 Future Scope

The project can be extended with:

-   Multi-crop disease detection
-   More crop datasets
-   Improved image validation
-   Multilingual farmer interface
-   Voice-based assistance
-   Location-aware crop recommendations
-   Advanced crop calendars
-   Personalized reminders
-   Disease history analytics
-   Cloud model inference
-   Model optimization for mobile/edge deployment

------------------------------------------------------------------------

## ⚠️ Important Disclaimer

AI Crop Doctor is an academic/project prototype intended to assist with
preliminary crop disease identification.

Predictions should not be treated as a definitive agricultural
diagnosis. Farmers should consult qualified agricultural experts when
significant crop damage or uncertainty is involved.

------------------------------------------------------------------------

## 👨‍💻 Project

**Project Name:** AI Crop Doctor

**Core ML Project:** Mobile-Based Crop Disease Detection Using MobileViT

**Initial Crop:** Tomato

**Primary AI Model:** MobileViT Small

**Repository:** `Roni23bhai/AI_Crop_Doctor`

------------------------------------------------------------------------

## 📜 License

This project is currently intended for academic and educational
purposes.

A formal open-source license can be added when the project is ready for
public distribution.

------------------------------------------------------------------------

## ⭐ Project Vision

> **"Making AI-powered crop health assistance simple, accessible, and
> farmer-friendly."**

AI Crop Doctor aims to bridge the gap between modern computer vision
technology and practical agricultural assistance through a lightweight,
scalable, and easy-to-use application.

# 🌾 AI Crop Doctor — AI-Powered Smart Agriculture & Crop Pathology Suite

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E7CC3?logo=google)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-MobileViT_Small-EE4C2C?logo=pytorch)](https://pytorch.org/)

**AI Crop Doctor** is a modern, full-stack smart agricultural application designed to empower farmers, agriculturalists, and researchers with instant crop leaf disease diagnosis, disease severity staging, cloud-synced diagnosis history, an intelligent AI crop assistant, and custom crop calendars.

---

## 🌟 Key Features

### 🍃 1. MobileViT Leaf Disease Classification
- **Deep Learning Inference**: Powered by **MobileViT Small (PyTorch)** trained on multi-class crop datasets (Tomato, Potato, Corn, Apple, etc.).
- **Real-Time Classification**: Instantly detects diseases such as *Early Blight*, *Late Blight*, *Apple Cedar Rust*, *Apple Scab*, *Corn Common Rust*, *Tomato Yellow Leaf Curl Virus*, and *Healthy Foliage*.
- **Confidence Indicators**: Displays exact confidence percentages and model precision ratings.

### 🔍 2. Image Quality Verification Gate
- **Pre-Diagnostic Quality Scanner**: Validates leaf image quality before sending frames to the ML model.
- **Automated Checks**: Evaluates sharpness (blur detection), brightness (exposure check), leaf framing, and object distance.
- **Simulated Quality Failure Mode**: Interactive debug selector allowing testers to simulate blurry, dark, or misframed inputs.

### 📊 3. Disease Severity Staging (G0–G3)
- **Lesion Area Analysis**: Quantifies damaged leaf surface area to assign severity stages:
  - **G0 (Healthy)** — 0% lesion area.
  - **G1 (Early / Mild)** — 1% to 15% lesion area.
  - **G2 (Moderate)** — 16% to 40% lesion area.
  - **G3 (Severe)** — > 40% lesion area (triggers emergency alert guidance).
- **Stage-Specific Recommendations**: Tailored action plans and treatment steps for each specific disease stage.

### 🤖 4. Crop Coach AI Assistant (Powered by Google Gemini 3.6 Flash)
- **Conversational Agronomy AI**: Integrated with **Google Gemini API (`gemini-3.6-flash`)**.
- **RAW Text Responses**: Formatted in clean, natural raw text with simple bullet points (`•`) and readable headers.
- **Agronomic Expertise**: Answers queries about plant health, fertilizer dosage, irrigation schedules, pesticide application, and regional crop suitability.

### ☁️ 5. Supabase Cloud Synchronization
- **Authentication Guard**: Protects application routes and mandates user authentication.
- **User Profiles Table (`public.profiles`)**: Automatically creates and syncs farmer details, location, preferred crops, and language settings.
- **Diagnosis History Table (`public.diagnosis_history`)**: Persists diagnosis results, severity stage, confidence score, image URLs, and timestamps with Row Level Security (RLS).

### 📅 6. Smart Crop Calendar & Reminders
- **Growth Stage Calculation**: Calculates exact stage timelines (Sowing, Flowering, Fruiting, Harvest) based on planting dates.
- **Automated & Custom Reminders**: Tracks watering, fertilizer application, disease re-inspection, and harvest windows.

### 🔊 7. Voice Guidance & Accessibility
- **Text-To-Speech (TTS)**: Reads out diagnosis results, treatment steps, and AI assistant answers using browser-native Web Speech API.
- **Speech-To-Text (STT)**: Enables voice dictation for asking questions to Crop Coach.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide React Icons, Framer Motion |
| **AI Assistant** | Google Gemini API (`gemini-3.6-flash`) |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Auth Services) |
| **Machine Learning** | PyTorch, MobileViT Small, OpenCV, PIL |
| **Testing** | Pytest (Python ML tests), TypeScript Strict Check (`tsc`) |

---

## 📁 Repository Directory Structure

```
AI_Crop_Doctor/
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # Auth portal (Sign In / Register)
│   │   ├── assistant/           # Crop Coach AI Assistant (Google Gemini)
│   │   ├── calendar/            # Crop calendar & watering reminders
│   │   ├── crops/               # Crop & disease knowledgebase database
│   │   ├── diagnose/            # Leaf photo scanner & live webcam modal
│   │   ├── history/             # Cloud-synced diagnosis history (Supabase)
│   │   ├── home/                # Main farmer dashboard
│   │   ├── profile/             # User settings & location profile
│   │   ├── result/              # Diagnosis result & G0–G3 stage panel
│   │   ├── layout.tsx           # Global app layout & font definitions
│   │   └── page.tsx             # Root redirect & auth route guard
│   ├── assets/                  # 3D assets & avatar images
│   ├── components/              # Reusable UI components & App Shell
│   ├── data/                    # Crop database definitions & diseases
│   ├── lib/                     # Supabase client, store, i18n & utilities
│   └── services/                # API service abstraction & Gemini client
├── backend/
│   ├── supabase_schema.sql      # Supabase DDL table definitions
│   └── migration_profiles_diagnosis_history.sql # RLS policies & fixes
├── ml/
│   ├── image_verification.py    # Image quality check pipeline
│   ├── severity_estimation.py   # Lesion percentage & stage computer
│   ├── treatment_recommendations.py # Agronomic treatment lookup
│   ├── train_mobilevit.py       # MobileViT PyTorch training script
│   └── tests/                   # Pytest automated test suite
├── public/
│   └── demo/                    # High-res crop leaf disease demo images
├── .env.example                 # Environment variables template
├── tsconfig.json                # TypeScript compiler config
└── package.json                 # Node.js project dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Bun**: v1.0.0 or higher (`bun --version`)
- **Node.js**: v18.0.0 or higher (optional fallback)
- **Python**: v3.10+ (for running ML pipeline scripts or tests)

### 2. Environment Setup
Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Fill in your environment credentials inside `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Supabase Database Migration
Execute the SQL migration script in your **Supabase SQL Editor**:

1. Open **Supabase Dashboard** -> **SQL Editor**.
2. Run the code inside [`backend/migration_profiles_diagnosis_history.sql`](backend/migration_profiles_diagnosis_history.sql):

```sql
-- 1. Table defaults setup
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now(), ALTER COLUMN full_name SET DEFAULT '';
ALTER TABLE public.diagnosis_history ALTER COLUMN user_id DROP NOT NULL;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_history ENABLE ROW LEVEL SECURITY;

-- 3. Apply RLS Policies
CREATE POLICY "Allow select for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert for profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for diagnosis_history" ON public.diagnosis_history FOR SELECT USING (true);
CREATE POLICY "Allow insert for diagnosis_history" ON public.diagnosis_history FOR INSERT WITH CHECK (true);
```

### 4. Running the Web Application

Install Node.js dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Machine Learning Tests

To verify the Python ML verification, severity estimation, and treatment pipeline:

```bash
cd ml
pip install -r requirements.txt
pytest tests/
```

---

## 🤝 Contributing & License

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.

**License**: MIT License © 2025 AI Crop Doctor Team.

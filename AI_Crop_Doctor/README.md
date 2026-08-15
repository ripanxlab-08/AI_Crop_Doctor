# Field Guardian

Build a modern, clean, professional farmer-focused mobile application UI/UX for my Final Year Project.

PROJECT NAME:
AI Crop Doctor

PROJECT PURPOSE:
The application helps farmers identify crop diseases from leaf images using a lightweight MobileViT deep-learning model and provides understandable guidance to the farmer.

IMPORTANT:
This is an Application-Based academic project.

For the first implementation, focus on TOMATO only. The architecture must be designed so that additional crops such as potato, rice, corn, etc. can be added later without redesigning the entire application.

The application should feel like a real production-quality agricultural AI assistant, not a generic student dashboard.

==================================================

DESIGN STYLE
==================================================

Create a clean, modern, premium mobile UI.

Use:

Minimal interface

Soft rounded cards

Clear typography

Large touch-friendly buttons

Subtle 3D depth

Soft shadows

Modern agricultural visual language

Clean icons

Smooth animations

Professional spacing

Accessible contrast

Farmer-friendly language

Use a subtle 3D/modern visual style, but DO NOT make the interface visually complicated.

The UI should remain lightweight and fast.

Use a natural agricultural visual identity.

Avoid:

Excessive gradients

Excessive glassmorphism

Crowded dashboards

Tiny text

Complicated charts

Too many colors

Gaming-style UI

The application should look suitable for a real agricultural technology product.

Create a bottom navigation bar with:

Home

Diagnose

Calendar

Assistant

Profile

Use clean modern icons.

Create a premium splash screen.

Show:

Application logo

Leaf/crop-inspired AI icon

Application name

Short tagline

Example:

"Smart Crop Care with AI"

Animation:

Subtle leaf movement

Soft AI scanning effect

Smooth transition to onboarding

Create 3 onboarding screens.

Screen 1:

"Detect Crop Diseases"

Explain that the farmer can capture or upload a crop leaf image and receive an AI-based disease prediction.

Screen 2:

"Get Smart Crop Guidance"

Explain that the application provides disease information, prevention and treatment guidance.

Screen 3:

"Never Miss Important Crop Activities"

Explain the crop calendar, sowing period, growth timeline and harvest reminders.

Include:

Skip

Next

Get Started

The home screen should be the main farmer dashboard.

Top:

"Good Morning, Farmer"

Below:

"How can I help your crop today?"

Create a large primary card:

"AI Crop Diagnosis"

Buttons:

"Capture Leaf"

"Upload Image"

Use a subtle 3D leaf illustration.

Below this show:

"Your Crops"

For the current prototype show:

Tomato

Status:

"Growing"

Show a compact crop-progress indicator.

Example:

Sowing → Growth → Flowering → Fruiting → Harvest

Highlight the current stage.

Below:

"Upcoming"

Show upcoming crop-related reminders.

Example:

"Tomato harvest expected in 18 days"

"Watering reminder tomorrow"

"Favorable planting period for another crop starts next month"

Below:

"AI Assistant"

Small assistant card:

"Ask me anything about your crops"

Button:

"Talk to AI Assistant"

This is the MOST IMPORTANT screen.

Create a beautiful image-capture interface.

Title:

"Diagnose Your Crop"

Instruction:

"Capture a clear photo of the leaf"

Provide:

Camera

Gallery

Upload Image

After selecting the image show a preview.

Include a clean scanning animation:

"Analyzing leaf..."

Use a subtle AI scanning line around the leaf.

Before sending the image to MobileViT, show an image-quality verification stage.

This is part of my project.

Display:

"Checking image quality..."

Check:

Leaf visibility

Image sharpness

Brightness

Image quality

Suitable crop image

If valid:

"Image looks good"

Continue to AI diagnosis.

If invalid:

"Please capture another image"

Give understandable reason:

"Image is too blurry"

or

"Leaf is too dark"

or

"Please move closer to the leaf"

The UI must make this simple for farmers.

After analysis show:

"Diagnosis Result"

Display:

Leaf image

Crop:

Tomato

Disease:

Tomato Early Blight

Confidence:

94.6%

Use a clear confidence visualization.

Example:

94.6%
High Confidence

Also show:

"Top Predictions"

Early Blight — 94.6%

Late Blight — 2.7%

Leaf Mold — 1.4%

Do not overload the screen.

Create a detailed but easy-to-understand result page.

Sections:

Disease Name

What is it?

Symptoms

Possible Cause

What to do now

Prevention

Treatment Guidance

Use simple language suitable for farmers.

Include:

"Listen to this"

button.

The application should be designed so the information can later be converted to speech.

Create a section for:

"Estimated Disease Severity"

For the current prototype, keep this module prepared but clearly mark it as:

"Coming in the next model update"

Possible future states:

Mild

Moderate

Severe

Do not pretend that severity is available if the backend does not provide it.

The UI should already be designed so the module can be connected later.

Create a dedicated AI chatbot called:

"AgriCoach"

or

"Crop Coach"

The assistant should feel like a friendly agricultural AI coach.

UI:

AI avatar using a simple 3D leaf/robot character.

Welcome message:

"Hi! I'm your Crop Coach. Ask me about your crop, disease, watering, planting or harvesting."

Provide suggested questions:

"Is my tomato leaf healthy?"

"When should I harvest?"

"What should I do for Early Blight?"

"Which crop is suitable this month?"

"How long does tomato take to grow?"

"What should I do after disease detection?"

The chatbot should support:

Text input

Microphone button

Voice response

Suggested questions

Chat history

The assistant should use the application's crop/disease knowledge database when answering agricultural questions.

IMPORTANT:
Do not make the assistant hallucinate agricultural recommendations.

Use structured crop information from the application's database whenever possible.

Create a dedicated "Crop Calendar" screen.

This is an important feature of my project.

The calendar should help farmers understand:

Suitable sowing periods

Crop growth duration

Expected harvesting period

Current crop stage

Upcoming crop activities

Important reminders

Favorable months for different crops

Create a beautiful monthly calendar.

Example:

AUGUST 2026

Show crop-related events.

Example:

Tomato

Sowing:
August 5

Vegetative Growth:
August 6 – August 25

Flowering:
August 26 – September 10

Fruiting:
September 11 – September 30

Expected Harvest:
October 1 – October 15

Use color-coded timeline indicators but keep the colors accessible and not excessive.

Create reminder cards connected to the crop calendar.

Examples:

"Tomato harvest window begins in 7 days"

"Tomato is currently in the flowering stage"

"Recommended time to monitor for disease"

"Planting period for [crop] begins this month"

"Expected harvest period is approaching"

Allow:

Add Reminder

Edit Reminder

Delete Reminder

Enable/disable notifications

The system should calculate reminders based on:

Sowing date

Crop type

Expected growth duration

Growth stage

Expected harvest period

Do NOT randomly generate agricultural dates.

Use crop-specific data stored in the application database.

Create a future-ready crop database screen.

Initially show:

Tomato

Later allow:

Potato

Rice

Corn

Chilli

Cotton

etc.

For each crop display:

Crop name

Growing duration

Suitable planting months

Growth stages

Expected harvest period

Common diseases

Basic care information

The architecture must allow new crops to be added through data/database changes rather than redesigning the UI.

Create a diagnosis history section.

Show:

Date

Crop

Disease

Confidence

Image thumbnail

Severity if available

Example:

August 13

Tomato

Early Blight

94.6%

Allow the farmer to open previous diagnosis details.

Create a simple farmer profile.

Fields:

Name

Location/Region

Preferred Language

Crops

Notification preferences

Voice settings

Units/preferences

Keep the profile simple.

The UI should be designed for future multilingual support.

Initially use English.

Prepare the architecture for languages such as:

English

Hindi

Tamil

Telugu

Malayalam

Kannada

Do not hardcode UI text in a way that makes future translation difficult.

Add microphone and speaker icons throughout relevant screens.

The future system should support:

Speech-to-text for asking AgriCoach questions.

Text-to-speech for:

Disease result

Treatment guidance

Crop reminders

Calendar information

Important warnings

The UI should be prepared for this functionality.

Create notification cards for:

Crop reminders

Harvest reminders

Disease follow-up

Calendar events

AI recommendations

Example:

"Your tomato crop is approaching its expected harvest window."

"Check your tomato leaves for disease symptoms."

The frontend should be designed to communicate with a REST API.

Planned architecture:

Flutter Application
↓
REST API
↓
FastAPI Backend
↓
Image Verification
↓
MobileViT Model
↓
Prediction
↓
FastAPI
↓
Flutter Application

The UI must therefore use clean service/API abstraction instead of hardcoding prediction results into components.

The current AI model is:

MobileViT Small

Framework:

PyTorch

Current model:

Tomato disease classification

The frontend should be prepared to receive API response such as:

{
"crop": "Tomato",
"disease": "Early Blight",
"confidence": 0.946,
"top_predictions": [],
"severity": null
}

If severity is null, display:

"Severity estimation will be available in a future update."

Do not fabricate results.

Design professional error states for:

No internet

Camera permission denied

Invalid image

Blurry image

Low brightness

No leaf detected

Model unavailable

Server unavailable

Low-confidence prediction

Unknown crop

Upload failure

Create beautiful but lightweight loading animations.

For AI diagnosis:

"Scanning leaf..."

"Checking image quality..."

"Running AI diagnosis..."

"Preparing your crop guidance..."

Use a subtle agricultural AI animation.

The primary target is mobile.

Design for:

Android phones

Small screens

Medium screens

Large screens

Use responsive layouts.

All important controls should be easy to tap.

Avoid tiny text.

Create reusable components.

Suggested components:

AppHeader

BottomNavigation

CropCard

DiagnosisCard

DiseaseResultCard

ConfidenceIndicator

CropTimeline

CropCalendar

ReminderCard

AIChatBubble

AssistantInput

VoiceButton

ImageCaptureCard

LoadingScanner

NotificationCard

The final application should communicate:

"Simple enough for a farmer, intelligent enough to feel like an AI crop expert."

It should NOT look like:

A generic hospital app

A generic chatbot

A generic admin dashboard

A generic AI template

It should clearly feel like an agricultural AI product.

For the prototype, prioritize:

Home

Camera/Upload

Image Verification UI

Tomato Disease Diagnosis

Disease Result

AgriCoach

Crop Calendar

Reminders

History

Profile

Advanced modules such as:

Severity estimation

Multiple crops

Advanced recommendations

Full voice assistant

On-device MobileViT inference

should be designed for future integration and should not be falsely represented as completed functionality.

Create the complete mobile-first UI/UX prototype with realistic navigation and realistic sample Tomato data.

Make every screen visually connected and consistent.

Use realistic farmer-oriented content.

Do not create a generic dashboard.

The final prototype should be suitable for demonstrating my Application-Based Final Year Project to my project guide.

The architecture must be scalable so that the current Tomato disease detection module can later be expanded to additional crops and additional AI modules without redesigning the application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fe869b1d-7157-4a6a-95ac-f8347c8894f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

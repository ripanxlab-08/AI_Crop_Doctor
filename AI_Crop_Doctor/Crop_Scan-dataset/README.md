# BioScan
This repository contains the implementation of a deep learning model built using TensorFlow and Keras for classifying plant diseases. The model employs a Convolutional Neural Network (CNN) architecture to identify various plant diseases based on images from the "New Plant Diseases Dataset," sourced from Kaggle.

This model will be deployed within a local application, enabling users to classify plant diseases directly on their own devices without needing an internet connection.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Dependencies](#dependencies)
- [Dataset](#dataset)
- [Model Architecture](#model-architecture)
- [Training the Model](#training-the-model)
- [Model Evaluation](#model-evaluation)
- [Accuracy Visualization](#accuracy-visualization)
- [Confusion Matrix](#confusion-matrix)
- [Saving the Model](#saving-the-model)
- [Local App Deployment](#local-app-deployment)

## Overview

This project aims to develop an efficient deep learning model for classifying images of plant diseases using Convolutional Neural Networks (CNNs). The dataset contains photos of various plant diseases, which are preprocessed and fed into a CNN model for training. Once trained, this model can be deployed within a local application, allowing users to classify plant diseases directly on their devices.

## Getting Started
Follow the steps below to run this project on your local machine.

# Clone this repository:


```bash
git clone https://github.com/SanjaiPG/BioScan.git
```

## Dependencies:

```bash
pip install -r requirements.txt
```
| Library       | Purpose                     |
|---------------|-----------------------------|
| TensorFlow    | Deep learning framework     |
| Matplotlib    | Data visualization          |
| Pandas        | Data manipulation           |
| Seaborn       | Statistical visualization   |

## Dataset

This dataset has been generated through offline augmentation of the original image collection. It comprises approximately 87,000 RGB images of healthy and diseased crop leaves, categorized into 38 distinct classes. The dataset is partitioned into training and validation sets in an 80/20 ratio, while maintaining the original directory structure. Additionally, a separate directory containing 33 test images has been created for evaluation and prediction purposes.

Download the dataset from Kaggle:

DataSet link
=======
```bash
https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
```


Ensure that you have set up your Kaggle credentials (username and key) in your environment variables.
=======
## Model Architecture
The model follows a VGG-style architecture, composed of stacked convolutional and pooling layers, designed for robust feature extraction and classification.

Input Layer
Input shape: 128 × 128 × 3 (RGB images)

Images are resized and normalized using TensorFlow.

Convolutional Blocks
| Block | Layers                       | Filters | Kernel Size | Activation | Notes                            |
| ----- | ---------------------------- | ------- | ----------- | ---------- | -------------------------------- |
| 1     | Conv2D, Conv2D, MaxPooling2D | 32      | 3×3         | ReLU       | `padding='same'` for first layer |
| 2     | Conv2D, Conv2D, MaxPooling2D | 64      | 3×3         | ReLU       |                                  |
| 3     | Conv2D, Conv2D, MaxPooling2D | 128     | 3×3         | ReLU       |                                  |
| 4     | Conv2D, Conv2D, MaxPooling2D | 256     | 3×3         | ReLU       |                                  |
| 5     | Conv2D, Conv2D, MaxPooling2D | 512     | 3×3         | ReLU       |                                  |

Fully Connected Layers
| Layer        | Units | Activation | Notes                    |
| ------------ | ----- | ---------- | ------------------------ |
| Dropout      | —     | —          | rate = 0.25              |
| Flatten      | —     | —          | Flattens conv output     |
| Dense        | 1500  | ReLU       | Fully connected layer    |
| Dropout      | —     | —          | rate = 0.4               |
| Output Dense | 38    | Softmax    | 38 plant disease classes |

Model Compilation
* Optimizer: Adam with a learning rate of 0.0001
* Loss Function: Categorical Crossentropy (used for one-hot encoded labels)
* Evaluation Metric: Accuracy

Training & Evaluation
* Epochs: 10
* Batch Size: 32

Metrics Tracked
* Training Accuracy
* Validation Accuracy
* Loss

Visualization Tools
* Training & validation accuracy trends plotted using Matplotlib
* Confusion matrix visualized using Seaborn

Output
* Trained Model: model.keras
* Training History: trainingHistory.json

Evaluation Reports
* Classification Report (via scikit-learn)
* Confusion Matrix

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; // This handles the backend initialization
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';

const modelJson = require('../assets/ai-model/model.json');
const modelWeights = require('../assets/ai-model/weights.bin');
const metadata = require('../assets/ai-model/metadata.json');
const IMAGE_SIZE = 224;

export const useReportAI = () => {
    const [model, setModel] = useState<tf.LayersModel | null>(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
                setModel(loadedModel);
                console.log("✅ AI Model Loaded Successfully (on-device).");
            } catch (error) {
                console.error("❌ Failed to load on-device AI model:", error);
                Alert.alert("Error", "Could not load the AI model.");
            }
        };
        loadModel();
    }, []);

    const analyzeImage = async (uri: string): Promise<string | null> => {
        if (!model) {
            Alert.alert("AI Not Ready", "The AI model is still loading.");
            return null;
        }
        try {
            // 🔧 FIX: Use the string literal 'base64' which is more robust
            const imgB64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
            const raw = new Uint8Array(imgBuffer);
            
            const tensor = tf.tidy(() => {
                const imageTensor = decodeJpeg(raw);
                const resized = tf.image.resizeBilinear(imageTensor, [IMAGE_SIZE, IMAGE_SIZE]);
                const normalized = resized.div(tf.scalar(255.0));
                return normalized.expandDims(0);
            });

            const predictions = await (model.predict(tensor) as tf.Tensor).data();
            tf.dispose(tensor);

            const topPredictionIndex = predictions.indexOf(Math.max(...predictions));
            const predictedLabel = metadata.labels[topPredictionIndex];

            let finalCategory = 'Other';
            if (predictedLabel.toLowerCase().includes('potholes')) finalCategory = 'Pothole';
            else if (predictedLabel.toLowerCase().includes('garbage')) finalCategory = 'Garbage';
            else if (predictedLabel.toLowerCase().includes('streetlight')) finalCategory = 'Streetlight';
            
            return finalCategory;
        } catch (error) {
            console.error("Error during on-device prediction:", error);
            Alert.alert("Analysis Failed", "Could not analyze the image.");
            return null;
        }
    };

    return { isModelLoading: !model, analyzeImage };
};

import { GoogleGenAI, Modality } from "@google/genai";
import { GreetingVibe } from "../types";

const API_KEY = process.env.API_KEY || '';

export const generateGreetingText = async (vibe: GreetingVibe, language: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Write a unique and creative "Hello World" greeting in the style of "${vibe}" and the language "${language}". The response should ONLY contain the greeting text itself. Be expressive but concise.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.9,
      topP: 0.95,
    }
  });

  return response.text || "Hello World!";
};

export const generateGreetingImage = async (greeting: string, vibe: GreetingVibe): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `A highly detailed, cinematic, and artistic visual representation of the greeting: "${greeting}". The style should be strictly "${vibe}". Professional lighting, 4k, masterpiece quality.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
  return undefined;
};

export const generateGreetingAudio = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this with emotion: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Failed to generate audio:", error);
  }
  return undefined;
};

// PCM Decoding helpers
export const decodeBase64Audio = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const decodeAudioDataToBuffer = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

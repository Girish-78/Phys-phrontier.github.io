
import { GoogleGenAI, Type } from "@google/genai";

export const generateLearningOutcomes = async (title: string, category: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As a physics expert, generate 3 clear learning outcomes for a resource titled "${title}" in the category "${category}". Description: ${description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 3 learning outcomes."
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    return ["Understand the core concepts of " + title, "Apply theory to practical problems", "Analyze results effectively"];
  }
};

export const generateThumbnail = async (title: string, description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `A clean, professional 3D laboratory visualization for a physics simulation titled "${title}". 
                  The style should be modern, educational, and high-tech. 
                  Subject matter: ${description}. 
                  No text in the image. High contrast, laboratory aesthetic.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    },
  });

  // Iterate through parts to find the image
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64Data = part.inlineData.data;
      return `data:image/png;base64,${base64Data}`;
    }
  }
  
  return null;
};

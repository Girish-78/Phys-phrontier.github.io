import { GoogleGenAI, Type } from "@google/genai";

export const generateLearningOutcomes = async (title: string, category: string, description: string) => {
  // Fix: Use process.env.API_KEY directly as required by @google/genai coding guidelines
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
    // Fix: Use the .text property directly (not a method) as per current SDK standards
    return JSON.parse(response.text.trim());
  } catch (e) {
    return ["Understand the core concepts of " + title, "Apply theory to practical problems", "Analyze results effectively"];
  }
};
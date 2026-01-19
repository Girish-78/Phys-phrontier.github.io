
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { task, title, description, category } = await request.json();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    if (task === 'outcomes') {
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
      return new Response(response.text, { headers: { 'Content-Type': 'application/json' } });
    }

    if (task === 'thumbnail') {
      const prompt = `A clean, professional 3D laboratory visualization for a physics simulation titled "${title}". 
                      Modern, high-tech educational aesthetic. 
                      Subject matter: ${description}. 
                      No text. High contrast, cinematic laboratory lighting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return new Response(JSON.stringify({ data: part.inlineData.data }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response('Task not found', { status: 400 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

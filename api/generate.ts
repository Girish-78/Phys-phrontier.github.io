
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Ensure API Key exists
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_KEY is missing in environment variables.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { task, title, description, category } = await request.json();
  const ai = new GoogleGenAI({ apiKey: apiKey });

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
      // Use a more descriptive but safe prompt
      const prompt = `A professional, 3D high-tech laboratory illustration representing the physics concept: "${title}". 
                      Subject details: ${description}. 
                      Style: Modern, cinematic lighting, educational laboratory aesthetic, clean composition. 
                      No text or labels. 1:1 aspect ratio.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { aspectRatio: "1:1" }
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Gemini returned no image candidates.");
      }

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      
      if (part && part.inlineData) {
        return new Response(JSON.stringify({ data: part.inlineData.data }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error("No image data found in response parts.");
      }
    }

    return new Response('Task not found', { status: 400 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred during AI generation' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

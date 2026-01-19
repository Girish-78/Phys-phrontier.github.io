
import { GoogleGenAI } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'System configuration error: API Key missing.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { task, title, description } = await request.json();
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (task === 'thumbnail') {
      // Simplified prompt to avoid safety filters and speed up generation
      const prompt = `A professional 3D scientific visualization of: ${title}. ${description}. Laboratory aesthetic, bright cinematic lighting, high-tech, 1:1 ratio, no text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { aspectRatio: "1:1" }
        },
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
          return new Response(JSON.stringify({ data: imagePart.inlineData.data }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      throw new Error("Gemini produced no valid image data.");
    }

    return new Response('Invalid Task', { status: 400 });
  } catch (error: any) {
    console.error("AI Node Error:", error);
    return new Response(JSON.stringify({ error: error.message || "AI Generation Timeout" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

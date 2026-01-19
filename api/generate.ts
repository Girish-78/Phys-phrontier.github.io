
import { GoogleGenAI } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Config error' }), { status: 500 });
  }

  try {
    const { task, title, category } = await request.json();
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (task === 'thumbnail') {
      // Stripped down prompt for maximum speed and safety
      const prompt = `A clean, professional 3D scientific 3D illustration: ${title} in the context of ${category}. High-tech laboratory style, cinematic lighting, 1:1 ratio, no text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { aspectRatio: "1:1" }
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return new Response(JSON.stringify({ data: imagePart.inlineData.data }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw new Error("No image generated");
    }

    return new Response('Invalid Task', { status: 400 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "AI Busy" }), { status: 500 });
  }
}

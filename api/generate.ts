
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'API Key not configured in Vercel' }), { status: 500 });

  try {
    const { task, title, category } = await request.json();
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (task === 'outcomes') {
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a JSON array of 3 physics learning objectives for: ${title} in the domain of ${category}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      // Sanitize: Gemini often wraps response in markdown backticks
      const cleanText = res.text.replace(/```json|```/g, '').trim();
      return new Response(cleanText, { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (task === 'thumbnail') {
      const prompt = `Professional 3D scientific visual: ${title}, ${category}. 1:1 ratio, high quality.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        return new Response(JSON.stringify({ data: imagePart.inlineData.data }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw new Error("AI busy");
    }

    return new Response(JSON.stringify({ error: 'Invalid task' }), { status: 400 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "AI logic busy" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'nodejs';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'System config error' }), { status: 500 });

  try {
    const { task, title, category } = await request.json();
    // Initialize Google GenAI with API key from environment
    const ai = new GoogleGenAI({ apiKey: apiKey });

    if (task === 'outcomes') {
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a 3-item JSON string array of physics learning outcomes for: ${title} (${category}). Keep it short.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      // Safely access the .text property (not a method) from the response
      const outputText = res.text || '[]';
      const cleanText = outputText.replace(/```json|```/g, '').trim();
      return new Response(cleanText, { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ error: 'Task obsolete' }), { status: 400 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "AI Congestion" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

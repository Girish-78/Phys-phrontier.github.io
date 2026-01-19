
import { kv } from '@vercel/kv';
import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KV_KEY = 'phrontier_global_v2';

export default async function handler(request: Request) {
  const { method, url } = request;
  const urlObj = new URL(url);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    if (method === 'GET') {
      const resources = await kv.get(KV_KEY);
      return new Response(JSON.stringify(resources || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' || method === 'PATCH') {
      const payload = await request.json();
      
      // Fast Learning Outcome Generation (Server-side)
      if (!payload.learningOutcomes || payload.learningOutcomes.length === 0) {
        try {
          const aiRes = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Briefly list 3 physics targets for: ${payload.title}.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          });
          payload.learningOutcomes = JSON.parse(aiRes.text);
        } catch (e) {
          payload.learningOutcomes = ["Understand " + payload.title, "Analyze physics data", "Apply principles"];
        }
      }

      let current: any[] = (await kv.get(KV_KEY)) || [];
      if (method === 'POST') {
        current = [payload, ...current];
      } else {
        current = current.map((item: any) => item.id === payload.id ? payload : item);
      }
      
      await kv.set(KV_KEY, current);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id');
      let current: any[] = (await kv.get(KV_KEY)) || [];
      await kv.set(KV_KEY, current.filter((item: any) => item.id !== id));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


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
      
      // Enforce payload size sanity to prevent Sync Failures
      const payloadSize = JSON.stringify(payload).length;
      if (payloadSize > 800000) { // ~800KB limit for KV stability
        return new Response(JSON.stringify({ error: "Payload too large. Use smaller descriptions or ensure images are mirrored to Blob storage." }), { status: 413 });
      }

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
          
          // Clean JSON string in case Gemini adds markdown backticks
          const cleanJson = aiRes.text.replace(/```json|```/g, '').trim();
          payload.learningOutcomes = JSON.parse(cleanJson);
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
    console.error("KV Sync Error:", error);
    return new Response(JSON.stringify({ error: "Cloud database sync failed: " + error.message }), { status: 500 });
  }
}

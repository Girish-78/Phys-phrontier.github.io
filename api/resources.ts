
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KV_KEY = 'phrontier_global_v2';
const MAX_ITEMS = 20;

export default async function handler(request: Request) {
  const { method } = request;

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return new Response(JSON.stringify({ error: "Cloud database configuration missing." }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (method === 'GET') {
      const resources = await kv.get(KV_KEY);
      return new Response(JSON.stringify(resources || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    if (method === 'POST' || method === 'PATCH') {
      const payload = await request.json();
      
      // Sanitization to prevent DB bloat
      if (payload.thumbnailUrl && payload.thumbnailUrl.length > 5000) {
        payload.thumbnailUrl = ''; // Strip large failed strings
      }

      let current: any[] = (await kv.get(KV_KEY)) || [];
      
      if (method === 'POST') {
        current = [payload, ...current].slice(0, MAX_ITEMS);
      } else {
        current = current.map((item: any) => item.id === payload.id ? payload : item);
      }
      
      await kv.set(KV_KEY, current);
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (method === 'DELETE') {
      const urlObj = new URL(request.url);
      const id = urlObj.searchParams.get('id');
      let current: any[] = (await kv.get(KV_KEY)) || [];
      await kv.set(KV_KEY, current.filter((item: any) => item.id !== id));
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  } catch (error: any) {
    console.error("KV Node.js Error:", error);
    return new Response(JSON.stringify({ error: "Cloud sync failed: " + (error.message || "Internal Server Error") }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

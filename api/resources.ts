
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KV_KEY = 'phrontier_global_v2';
const MAX_ITEMS = 20; // Keep the library fast and light

export default async function handler(request: Request) {
  const { method } = request;

  // Check for KV connection strings
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return new Response(JSON.stringify({ error: "Cloud database configuration missing (KV_REST_API_URL)." }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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
      
      // Safety: Never allow massive data strings into the DB
      if (payload.thumbnailUrl && payload.thumbnailUrl.length > 5000) {
        payload.thumbnailUrl = 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=800';
      }

      let current: any[] = (await kv.get(KV_KEY)) || [];
      
      if (method === 'POST') {
        // Add new and prune old to prevent 504 Timeouts on large lists
        current = [payload, ...current].slice(0, MAX_ITEMS);
      } else {
        current = current.map((item: any) => item.id === payload.id ? payload : item);
      }
      
      await kv.set(KV_KEY, current);
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'DELETE') {
      const urlObj = new URL(request.url);
      const id = urlObj.searchParams.get('id');
      let current: any[] = (await kv.get(KV_KEY)) || [];
      await kv.set(KV_KEY, current.filter((item: any) => item.id !== id));
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  } catch (error: any) {
    console.error("KV Sync Error:", error);
    return new Response(JSON.stringify({ error: "Cloud sync failed: " + (error.message || "Internal Server Error") }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

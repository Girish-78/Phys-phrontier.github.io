
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KV_KEY = 'phrontier_global_v2'; // Incremented version for a fresh sync

export default async function handler(request: Request) {
  const { method, url } = request;
  const urlObj = new URL(url);

  try {
    // GET: Fetch all resources with aggressive no-cache headers
    if (method === 'GET') {
      const resources = await kv.get(KV_KEY);
      return new Response(JSON.stringify(resources || []), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    // POST/PATCH: Save or update resource
    if (method === 'POST' || method === 'PATCH') {
      const payload = await request.json();
      let current: any[] = (await kv.get(KV_KEY)) || [];
      
      if (method === 'POST') {
        current = [payload, ...current];
      } else {
        current = current.map((item: any) => item.id === payload.id ? payload : item);
      }
      
      await kv.set(KV_KEY, current);
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DELETE: Remove resource
    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id');
      if (!id) return new Response('Missing Resource ID', { status: 400 });
      
      let current: any[] = (await kv.get(KV_KEY)) || [];
      current = current.filter((item: any) => item.id !== id);
      
      await kv.set(KV_KEY, current);
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (error: any) {
    console.error("KV Global Sync Error:", error);
    return new Response(JSON.stringify({ error: 'Global Database Sync Failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

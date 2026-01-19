
import { put } from '@vercel/blob';

// Edge runtime is used for speed, but we consume the buffer to ensure stability
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Vercel injects this automatically when you link the store
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ 
      error: 'CRITICAL: Blob Storage Token not found. Please redeploy your Vercel project.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rawFilename = request.headers.get('x-filename') || 'sync-file-' + Date.now();
    const filename = decodeURIComponent(rawFilename);
    const contentType = request.headers.get('x-content-type') || 'application/octet-stream';
    
    // Consume the body as an ArrayBuffer first to avoid stream-hang issues in Edge
    const buffer = await request.arrayBuffer();
    
    if (!buffer || buffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'Sync failed: Payload was empty.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct upload to the global CDN via Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: contentType,
      token: token
    });

    return new Response(JSON.stringify({ 
      success: true,
      url: blob.url 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
    });
  } catch (error: any) {
    console.error("Vercel Edge Sync Error:", error);
    return new Response(JSON.stringify({ 
      error: 'The cloud vault is currently busy or unreachable. Details: ' + (error.message || 'Unknown Error')
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

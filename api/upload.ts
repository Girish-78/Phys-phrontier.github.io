
import { put } from '@vercel/blob';

// Forced to Node.js runtime for maximum compatibility with SDKs
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Token is automatically injected by Vercel
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ 
      error: 'CRITICAL: Blob Storage Token not found. Please check your Vercel Environment Variables.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const rawFilename = request.headers.get('x-filename') || `sync-file-${Date.now()}`;
    const filename = decodeURIComponent(rawFilename);
    const contentType = request.headers.get('x-content-type') || 'application/octet-stream';
    
    // Using standard web-api ArrayBuffer for cross-runtime safety
    const buffer = await request.arrayBuffer();
    
    if (!buffer || buffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'Sync failed: Payload was empty.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fix: Using ArrayBuffer directly instead of Buffer.from() to resolve 'Cannot find name Buffer'
    // Upload using the Vercel Blob SDK
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
    console.error("Vercel Node.js Upload Error:", error);
    return new Response(JSON.stringify({ 
      error: 'The cloud storage system encountered an error: ' + (error.message || 'Unknown Error')
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

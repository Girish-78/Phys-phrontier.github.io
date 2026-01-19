
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing storage token.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get metadata from custom headers
    const filename = request.headers.get('x-filename') || 'upload-' + Date.now();
    const contentType = request.headers.get('x-content-type') || 'application/octet-stream';
    
    // Read the body as an ArrayBuffer (Direct binary stream)
    const arrayBuffer = await request.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'Empty file body provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload directly to Vercel Blob
    const blob = await put(filename, arrayBuffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: contentType,
      token: token
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Critical Upload Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'The server encountered an error during cloud synchronization.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

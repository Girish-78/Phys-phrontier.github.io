
import { put } from '@vercel/blob';

// Edge runtime handles binary Request bodies much better than Node.js for streaming
export const runtime = 'edge';
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
    return new Response(JSON.stringify({ 
      error: 'CRITICAL: BLOB_READ_WRITE_TOKEN is not configured in Vercel Environment Variables.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Standardize metadata from headers
    const rawFilename = request.headers.get('x-filename') || 'unnamed-file';
    const filename = decodeURIComponent(rawFilename);
    const contentType = request.headers.get('x-content-type') || 'application/octet-stream';
    
    // Read the binary stream directly from the request
    const body = request.body;
    
    if (!body) {
      return new Response(JSON.stringify({ error: 'No file content found in request body.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Direct upload to Vercel Blob via Edge Stream
    const blob = await put(filename, body, {
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Vercel Edge Upload Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Cloud Sync Failure' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

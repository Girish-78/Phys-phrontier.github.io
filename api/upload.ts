import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Check for the required token to prevent silent hangs
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN environment variable.");
    return new Response(JSON.stringify({ 
      error: 'Server Configuration Error: Missing storage token.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No valid file provided' }), { status: 400 });
    }

    // Convert file to ArrayBuffer for more reliable transmission in Node.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Fix: Remove Buffer usage as the global Buffer may not be available in all contexts.
    // @vercel/blob's put function accepts ArrayBuffer directly.
    const blob = await put(file.name, arrayBuffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Vercel Blob Upload Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal upload failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
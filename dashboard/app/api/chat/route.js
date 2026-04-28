import { NextResponse } from 'next/server';
import { generateStream } from '../../../../shared/lib/gemini.js';

export async function POST(req) {
  try {
    const { question, system = '' } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini not configured' }, { status: 503 });
    }

    const prompt = `${system}\n\nUser: ${question}\nAssistant:`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateStream(prompt)) {
            if (chunk) {
              const encoded = new TextEncoder().encode(chunk);
              controller.enqueue(encoded);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Chat stream failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { generate } from '../../../../shared/lib/gemini.js';

export async function POST(req) {
  try {
    const { disruption, headlines = [] } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini not configured' }, { status: 503 });
    }

    const prompt = `You are a concise predictive analyst. Given the resolved disruption and these recent headlines, give a one-sentence prediction of the next likely disruption (mention location or corridor) and a probability estimate as a percentage (e.g. "AI predicts 67% chance of Port of LA congestion in the next 48h based on current LA labor news.").\n\nResolved disruption:\n${JSON.stringify(disruption || {}, null, 2)}\n\nRecent headlines:\n${headlines.slice(0,10).map(h => `- ${h}`).join('\n')}`;

    const resp = await generate(prompt);
    if (!resp) return NextResponse.json({ error: 'No prediction from AI' }, { status: 502 });
    // Keep the response as-is; frontend displays the sentence.
    return NextResponse.json({ prediction: resp });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Prediction failed' }, { status: 500 });
  }
}

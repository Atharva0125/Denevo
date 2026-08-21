import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { person, action, tone = 'polite' } = await req.json();

    if (!person || !action) {
      return NextResponse.json({ error: 'Person and action are required' }, { status: 400 });
    }

    const prompt = `Write a short, professional, and friendly follow-up message to ${person}. Topic/action: "${action}". Tone: ${tone}. Keep it concise (1-2 sentences), ready to send on WhatsApp. Do not include placeholders or quotes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an assistant crafting quick, natural follow-up messages. Return ONLY the message text without greetings or preamble.',
      },
    });

    const message = (response.text || '').trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.error('Follow-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate follow-up' },
      { status: 500 }
    );
  }
}
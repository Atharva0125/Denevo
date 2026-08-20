import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const prompt = `Extract commitment details from: "${text}".
Reference Date: ${todayDate}.
Default time if unspecified: "10:00".
Default priority if unspecified: "medium".
Return ONLY raw JSON matching the requested schema without any markdown formatting, preamble, or explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an extraction API that outputs ONLY valid JSON objects. Never include introductory text, explanations, or Markdown backticks.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            person: { type: Type.STRING, description: 'Name of person or entity' },
            action: { type: Type.STRING, description: 'The task or commitment' },
            due_date: { type: Type.STRING, description: 'YYYY-MM-DD date' },
            due_time: { type: Type.STRING, description: 'HH:MM 24-hr time' },
            priority: {
              type: Type.STRING,
              enum: ['low', 'medium', 'high'],
              description: 'Urgency level',
            },
          },
          required: ['person', 'action', 'due_date', 'priority'],
        },
      },
    });

    let rawOutput = response.text || '{}';

    // Strip markdown code fences if present
    rawOutput = rawOutput.replace(/```json/gi, '').replace(/```/g, '').trim();

    // Extract inner JSON if wrapped with prose
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : rawOutput;

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract promise' },
      { status: 500 }
    );
  }
}
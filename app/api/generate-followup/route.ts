import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { person = 'there', action = 'our commitment', dueDate = '', status = 'upcoming', tone = 'polite' } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Deterministic 3-option fallbacks
    const getLocalSuggestions = (selectedTone: string, st: string, p: string, act: string) => {
      const isOverdue = st === 'overdue';
      const isToday = st === 'due_today';

      if (selectedTone === 'casual') {
        if (isOverdue) {
          return [
            `Hey ${p}, quick check-in about ${act}. Sorry for the delay, will share an update shortly!`,
            `Hey ${p}, just following up on ${act}. Apologies for running behind on this, getting back to you soon.`,
            `Hey ${p}, sorry about the delay regarding ${act} — will sort this out for you shortly.`
          ];
        }
        if (isToday) {
          return [
            `Hey ${p}, just checking in about ${act}. Aiming to get this sorted today!`,
            `Hey ${p}, quick ping regarding ${act}. Will make sure to get this across today.`,
            `Hey ${p}, touching base on ${act} — on track for today!`
          ];
        }
        return [
          `Hey ${p}, just checking in about ${act}. Let me know when you get a chance.`,
          `Hey ${p}, quick check-in regarding ${act}. Catch you soon!`,
          `Hey ${p}, wanted to touch base on ${act}. Let me know your thoughts.`
        ];
      }

      if (selectedTone === 'urgent') {
        if (isOverdue) {
          return [
            `Hi ${p}, following up urgently regarding ${act}. Please let me know when we can connect as this is overdue.`,
            `Hi ${p}, urgent follow-up on ${act}. Apologies for the delay — please let me know your availability ASAP.`,
            `Hi ${p}, checking in urgently on ${act}. Please review as soon as possible so we can proceed.`
          ];
        }
        if (isToday) {
          return [
            `Hi ${p}, following up on ${act}. Please let me know as soon as possible so we can wrap this up today.`,
            `Hi ${p}, urgent check-in regarding ${act} due today. Please let me know if you need anything from my end.`,
            `Hi ${p}, following up on ${act} — hoping to close this out today. Please let me know if you're ready.`
          ];
        }
        return [
          `Hi ${p}, following up urgently on ${act}. Please let me know as soon as possible if you need anything from my side.`,
          `Hi ${p}, high-priority check-in regarding ${act}. Please let me know your status at your earliest convenience.`,
          `Hi ${p}, following up on ${act}. Please let me know ASAP so we can stay on schedule.`
        ];
      }

      // Default: Polite
      if (isOverdue) {
        return [
          `Hi ${p}, I wanted to follow up regarding ${act}. Apologies for the slight delay — I will get back to you shortly.`,
          `Hi ${p}, I'm following up on ${act}. Please accept my apologies for the delay; I will share an update soon.`,
          `Hi ${p}, checking in regarding ${act}. Sincere apologies for the delay — I am attending to this right away.`
        ];
      }
      if (isToday) {
        return [
          `Hi ${p}, I wanted to follow up regarding ${act}. I'll make sure to get this across to you today.`,
          `Hi ${p}, just following up on ${act}. Looking forward to completing this today.`,
          `Hi ${p}, I am writing to check in regarding ${act} scheduled for today. Please let me know if you need anything.`
        ];
      }
      return [
        `Hi ${p}, I wanted to follow up regarding ${act}. Please let me know if you need anything further from my side.`,
        `Hi ${p}, I hope you're well. Just following up on ${act} at your convenience.`,
        `Hi ${p}, following up on our commitment regarding ${act}. Please let me know when you have a moment.`
      ];
    };

    if (!apiKey) {
      return NextResponse.json({ suggestions: getLocalSuggestions(tone, status, person, action) });
    }

    const promptText = `
Role: You are Denevo AI, an executive assistant drafting 3 distinct follow-up variations.

Input Data:
- Recipient: "${person}"
- Action: "${action}"
- Status: "${status}"
- Target Tone: "${tone.toUpperCase()}"
- Due Date: "${dueDate}"

Requirements:
1. Generate exactly 3 distinct single-sentence follow-up options suitable for ${tone.toUpperCase()} tone.
2. If status is overdue, acknowledge the delay without making up excuses.
3. If status is due_today, mention closing it today.
4. STRICT: Output only a valid JSON array of 3 strings: ["option 1", "option 2", "option 3"]. No extra text or markdown code blocks.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250
          }
        })
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return NextResponse.json({ suggestions: parsed.slice(0, 3) });
      }
    } catch {
      // Fallback if format is not raw JSON
    }

    return NextResponse.json({ suggestions: getLocalSuggestions(tone, status, person, action) });
  } catch (error: any) {
    console.error('Follow-up API error:', error);
    return NextResponse.json({
      suggestions: [
        'Hi, following up regarding our commitment. Let me know when you get a chance.',
        'Hey, just checking in on our discussion. Catch you soon!',
        'Hi, following up on our commitment as soon as possible.'
      ]
    });
  }
}
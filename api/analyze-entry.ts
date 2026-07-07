import { handleGetEmissionFactor } from '../src/mcp/emissionServer';

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed', usedFallback: true });
  }

  try {
    const { entryText, category, mood } = req.body || {};
    
    // Simple validation of required parameters
    if (typeof entryText !== 'string' || typeof category !== 'string') {
      console.error('Invalid request payload: entryText and category must be strings');
      return res.status(200).json({ usedFallback: true });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not defined');
      return res.status(200).json({ usedFallback: true });
    }

    // 1. Look up the emission factor using the imported logic
    const lookupResult = handleGetEmissionFactor(category, entryText);

    // 2. Build the system prompt using the emission database results
    const systemPrompt = `You are an expert environmental science AI that analyzes journal entries related to personal carbon footprints and environmental actions. Evaluate the real-world impact of the user's journal entry.

We have queried an emission database for activities matching this entry.
The matched/fallback emission factor context is:
- CO2e impact estimate: ${lookupResult.co2eKg} kg of CO2e (negative indicates savings/positive impact, positive indicates emissions/negative impact)
- Context/Note: ${lookupResult.note}
- Direct Match in Database: ${lookupResult.matched ? "Yes" : "No"}

Using this emission factor context, the text of the entry, and the user's mood, you must reason about the environmental impact.
Return strict JSON matching this schema:
{
  "score": number (between -10 and 10. Use co2eKg as primary indicator: negative co2eKg represents carbon savings so should give a positive score; positive co2eKg represents emissions so should give a negative score),
  "impactType": "positive" | "negative" | "neutral" (must match the sign of score),
  "worldEffect": "sky" | "trees" | "water" | "flowers" (flowers is reserved for high-impact actions with score >= 5),
  "reflection": string (1-2 sentence encouraging, factual reflection highlighting the carbon impact, e.g. mentioning the co2eKg impact value where appropriate)
}`;

    const userPrompt = `User's Journal Entry: "${entryText}"
User's Mood: "${mood || 'neutral'}"
Category: "${category}"`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "NUMBER" },
            impactType: { type: "STRING", enum: ["positive", "negative", "neutral"] },
            worldEffect: { type: "STRING", enum: ["sky", "trees", "water", "flowers"] },
            reflection: { type: "STRING" }
          },
          required: ["score", "impactType", "worldEffect", "reflection"]
        }
      }
    };

    // 8-second timeout mechanism
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      throw new Error(`Gemini API returned status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    const generatedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Gemini API response did not contain text content');
    }

    const parsedResult = JSON.parse(generatedText.trim());

    // Validate structure of parsedResult
    if (
      typeof parsedResult.score !== 'number' ||
      !['positive', 'negative', 'neutral'].includes(parsedResult.impactType) ||
      !['sky', 'trees', 'water', 'flowers'].includes(parsedResult.worldEffect) ||
      typeof parsedResult.reflection !== 'string'
    ) {
      throw new Error('Parsed result does not conform to the expected schema');
    }

    // Success response
    return res.status(200).json({
      score: parsedResult.score,
      impactType: parsedResult.impactType,
      worldEffect: parsedResult.worldEffect,
      reflection: parsedResult.reflection,
      usedFallback: false
    });

  } catch (error) {
    console.error('Error in analyze-entry Vercel function:', error);
    return res.status(200).json({ usedFallback: true });
  }
}

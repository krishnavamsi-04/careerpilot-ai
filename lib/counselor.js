
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
// If the main model is busy (503) or unavailable, try these in order.
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.7-flash,gemini-3.8-flash')
  .split(',').map(name => name.trim()).filter(Boolean);

// Free-tier keys have small daily limits, so a model that just failed is skipped for a while.
const skipUntil = new Map();
const skipModel = (model, minutes) => skipUntil.set(model, Date.now() + minutes * 60 * 1000);

export async function counselorReply(message, profile, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }

  const systemPrompt = `
You are CareerPilot, an intelligent AI career counselor
designed for Indian college students.

Your responsibilities:
1. Help students choose suitable careers.
2. Create personalized learning roadmaps.
3. Recommend technical skills and projects.
4. Guide students about internships and placements.
5. Help with resumes and interview preparation.
6. Explain complex technical concepts simply.

Student profile:
Name: ${profile?.name || 'Not provided'}
Education: ${profile?.education || 'Not provided'}
Branch: ${profile?.branch || 'Not provided'}
Interests: ${(profile?.interests || []).join(', ')}
Skills: ${(profile?.skills || []).join(', ')}
Career goals: ${(profile?.goals || []).join(', ')}

Instructions:
- Keep replies under 120 words. If the student asks for a detailed plan or roadmap, keep it under 250 words.
- Use simple English and short sentences.
- Write plain text only. Do NOT use markdown: no #, no **, no tables, no lines made of dashes.
- If you list items, use at most 4 short lines starting with 1., 2., 3.
- Do not list every possible path. Pick the best one or two for this student and say why.
- Give the most useful suggestion first, then ask at most one short follow-up question.
- Personalize your answer using the student profile.
- Avoid inventing student achievements.
- Be friendly and supportive.
`;

  const contents = [
    ...history
      .filter(item =>
        item &&
        ['user', 'assistant'].includes(item.role) &&
        typeof item.text === 'string' &&
        item.text.trim()
      )
      .slice(-10)
      .map(item => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.text.slice(0, 2000) }]
      })),
    {
      role: 'user',
      parts: [{ text: message }]
    }
  ];

  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents,
    generationConfig: {
      // Gemini 3.x: low thinking level gives fast chat replies
      thinkingConfig: { thinkingLevel: 'low' },
      maxOutputTokens: 2000
    }
  });

  let lastError = new Error('Gemini API request failed');

  for (const model of [GEMINI_MODEL, ...FALLBACK_MODELS]) {
    if ((skipUntil.get(model) || 0) > Date.now()) continue;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          signal: AbortSignal.timeout(15000),
          body: requestBody
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`Gemini API error (${model}):`, data?.error?.status || response.status, data?.error?.message || '');
        // A bad or blocked key will fail on every model, so stop right away.
        if (response.status === 401 || response.status === 403) throw new Error('Gemini API key was rejected');
        // quota used up (429) or model missing (404): skip for an hour; busy (503): skip briefly
        skipModel(model, response.status === 429 || response.status === 404 ? 60 : 2);
        lastError = new Error('Gemini API request failed');
        continue; // busy, quota, or model not available: try the next model
      }

      const reply = data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

      if (!reply) {
        lastError = new Error('Gemini returned an empty response');
        continue;
      }

      console.log(`Gemini answered with ${model}`);
      return reply;
    } catch (error) {
      if (error.message === 'Gemini API key was rejected') throw error;
      console.error(`Gemini request failed (${model}):`, error.message);
      skipModel(model, 2);
      lastError = error; // timeout or network problem: try the next model
    }
  }

  throw lastError;
}

// Simple built-in answers, used ONLY when the Gemini API cannot be reached.
export function fallbackReply(text, profile) {
  const lower = text.toLowerCase();
  let answer;
  if (lower.includes('skill')) answer = 'Start with Python, data structures, SQL, and machine learning fundamentals. Build one small project after each skill so your learning becomes visible.';
  else if (lower.includes('data')) answer = 'AI/ML Engineering and Data Science overlap. If you enjoy building systems and experimenting with models, AI/ML may fit. If you enjoy finding patterns and answering questions with data, Data Science could be a strong path.';
  else if (lower.includes('plan') || lower.includes('6')) answer = 'For the next six months: strengthen Python, practise data structures, learn SQL, study core ML concepts, and ship two portfolio projects. Reserve one week each month for reflection and feedback.';
  else {
    const interests = profile?.interests?.slice(0, 2).join(' and ') || 'technology';
    const goal = profile?.goals?.[0]?.toLowerCase() || 'grow with confidence';
    answer = `Based on your interests in ${interests} and your goal to ${goal}, AI/ML Engineering could be a strong direction. Start with Python, data structures, mathematics for ML, and one small project.`;
  }
  return `Note: the AI service could not be reached, so this is a basic built-in answer.\n\n${answer}`;
}

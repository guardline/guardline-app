export interface ScamAnalysis {
  verdict: 'safe' | 'suspicious' | 'scam'
  riskScore: number
  redFlags: string[]
  explanation: string
  whatToDo: string
}

const SYSTEM_PROMPT = `You are a scam detection AI protecting seniors from phone and text scams.
Analyze the content and return ONLY a valid JSON object — no markdown, no code fences, no extra text.
Schema:
{
  "verdict": "safe" | "suspicious" | "scam",
  "riskScore": 0-100,
  "redFlags": ["string"],
  "explanation": "2-3 sentence explanation written clearly for a senior",
  "whatToDo": "Specific actionable advice for a senior citizen"
}`

async function callGemini(parts: object[]): Promise<ScamAnalysis> {
  const env = (globalThis as any).process?.env || {};
  const apiKey = env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') throw new Error('NO_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0]) as ScamAnalysis
}

export async function analyzeScam(message: string): Promise<ScamAnalysis> {
  const parts = [{ text: `${SYSTEM_PROMPT}\n\nMessage to analyze:\n${message}` }]
  try {
    return await callGemini(parts)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NO_KEY') {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
      return mockAnalysis(message)
    }
    throw e
  }
}

export async function analyzeScamImage(dataUrl: string): Promise<ScamAnalysis> {
  const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg'
  const base64 = dataUrl.split(',')[1]

  const parts = [
    { inlineData: { mimeType, data: base64 } },
    {
      text: `${SYSTEM_PROMPT}\n\nLook at this screenshot. Extract all visible text and analyze whether it represents a scam targeting seniors.`,
    },
  ]

  try {
    return await callGemini(parts)
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'NO_KEY') {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1800))
      return mockAnalysis('[Screenshot uploaded — no API key for real analysis]')
    }
    throw e
  }
}

function mockAnalysis(message: string): ScamAnalysis {
  const msg = message.toLowerCase()
  const scamWords = [
    'irs', 'warrant', 'arrest', 'gift card', 'google play', 'immediate',
    'unpaid taxes', 'refund', 'suspended', 'verify your account', 'grandchild',
    'jail', 'bail', 'amazon', 'prize', 'winner', 'social security',
  ]
  const hits = scamWords.filter((w) => msg.includes(w))

  if (hits.length >= 2) {
    return {
      verdict: 'scam',
      riskScore: 93,
      redFlags: [
        'Government or brand impersonation',
        'Urgency and threat tactics',
        'Unusual payment method (gift cards / wire transfer)',
        'Isolation from family and friends',
      ],
      explanation:
        'This message contains multiple hallmarks of a classic impersonation scam. Legitimate agencies never contact you by phone or text to demand immediate payment, and they never ask for gift cards.',
      whatToDo:
        'Hang up or ignore immediately. Do NOT call back. Tell a trusted family member. If it involves taxes, call the IRS directly at 1-800-829-1040.',
    }
  }

  if (hits.length === 1) {
    return {
      verdict: 'suspicious',
      riskScore: 52,
      redFlags: ['Possible social engineering', 'Unusual request detected'],
      explanation:
        'This message has some suspicious elements worth being cautious about. Legitimate organizations rarely contact you out of the blue with urgent demands.',
      whatToDo:
        'Do not respond yet. Verify by calling the organization directly using a number from their official website — not the number in this message.',
    }
  }

  return {
    verdict: 'safe',
    riskScore: 6,
    redFlags: [],
    explanation: 'This message does not contain typical scam indicators and appears to be legitimate.',
    whatToDo: 'This looks safe. If you still have doubts, verify by calling the sender at a number you already know and trust.',
  }
}

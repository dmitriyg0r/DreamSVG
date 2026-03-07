const POLZA_API_BASE_URL =
  import.meta.env.VITE_POLZA_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/polza' : 'https://polza.ai/api/v1')

const DEFAULT_MODEL = import.meta.env.VITE_POLZA_AI_MODEL || 'openai/gpt-4o'

function getApiKey() {
  const apiKey = import.meta.env.VITE_POLZA_AI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_POLZA_AI_API_KEY is missing')
  }

  return apiKey
}

function sanitizeSvgResponse(content) {
  const cleaned = content
    .replace(/^```(?:svg|xml)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const startIndex = cleaned.indexOf('<svg')
  const endIndex = cleaned.lastIndexOf('</svg>')

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Model did not return valid SVG markup')
  }

  return cleaned.slice(startIndex, endIndex + 6)
}

export async function generateSvgFromPrompt(prompt, currentSvg = '') {
  if (!prompt.trim()) {
    throw new Error('Prompt is empty')
  }

  const response = await fetch(`${POLZA_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You generate clean SVG icons. Return only raw SVG markup, no markdown and no explanation. Use a single <svg> root, keep viewBox="0 0 128 128", prefer simple geometric paths, and make the result valid XML suitable for direct rendering.',
        },
        {
          role: 'user',
          content: currentSvg
            ? `Update this SVG icon according to the prompt.\n\nPrompt: ${prompt}\n\nCurrent SVG:\n${currentSvg}`
            : `Create a new SVG icon.\n\nPrompt: ${prompt}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI request failed with status ${response.status}`)
  }

  const completion = await response.json()
  const content = completion.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from model')
  }

  return sanitizeSvgResponse(content)
}

export { DEFAULT_MODEL }

const POLZA_API_BASE_URL =
  import.meta.env.VITE_POLZA_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/polza' : 'https://polza.ai/api/v1')

const DEFAULT_MODEL = import.meta.env.VITE_POLZA_AI_MODEL || 'openai/gpt-4o'

const SVG_SYSTEM_PROMPT = `You generate clean SVG icons for a code-based icon editor.

Rules:
- Return only raw SVG markup.
- Do not use markdown fences.
- Do not explain anything.
- Output must be valid XML.
- Use exactly one <svg> root element.
- Always include viewBox="0 0 128 128".
- Keep the icon visually centered in the canvas.
- Prefer simple geometric construction.
- Avoid unnecessary groups and excessive node count.
- Do not use raster images, foreignObject, or embedded base64 content.
- Do not use CSS stylesheets or <style> tags.
- Prefer presentation attributes directly on elements.
- Keep the icon suitable for small-size rendering.
- Make the design clear at 24x24.
- If possible, keep the element count low.
- Preserve symmetry when it helps readability.
- Use rounded joins/caps when appropriate for icon quality.

Output requirements:
- The result must start with <svg and end with </svg>.
- The SVG should be directly renderable in a browser.
- No text before or after the SVG.

Behavior:
- Decide from the user request whether to create a new icon or edit the current SVG.
- If the user clearly asks for a new icon, create a new SVG.
- If the user asks to refine, simplify, recolor, resize, or adjust details, modify the current SVG instead.
- If the intent is ambiguous, prefer editing the current SVG while preserving the overall concept.
- Keep edits minimal unless the user explicitly asks for a redesign.`

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

function buildSvgUserPrompt(prompt, currentSvg) {
  return `User request:
${prompt}

Current SVG:
${currentSvg || 'No current SVG provided.'}

Task:
- Infer whether the user wants a new icon or a modification of the current icon.
- Return only the final SVG.`
}

export async function generateSvgFromPrompt({
  prompt,
  currentSvg = '',
}) {
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
          content: SVG_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildSvgUserPrompt(prompt, currentSvg),
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

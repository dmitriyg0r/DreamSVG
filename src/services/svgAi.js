const POLZA_API_BASE_URL =
  import.meta.env.VITE_POLZA_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/polza' : 'https://polza.ai/api/v1')

const DEFAULT_MODEL = import.meta.env.VITE_POLZA_AI_MODEL || 'openai/gpt-4o'

/* ------------------------------------------------------------------ */
/*  System prompt with few-shot examples and style guidance            */
/* ------------------------------------------------------------------ */

const SVG_SYSTEM_PROMPT = `You are DreamSVG — an expert SVG icon designer. You create beautiful, clean, production-ready SVG icons.

# Core rules
- Return ONLY raw SVG markup — no markdown, no explanation, no text before or after.
- Output must be valid XML starting with <svg and ending with </svg>.
- Always use viewBox="0 0 128 128".
- Keep icons visually centered and balanced.
- Design must be crisp and clear at 24×24 px display size.
- Do NOT use: raster images, foreignObject, base64, <style>, CSS classes, <text> (unless explicitly requested).
- Use presentation attributes directly on elements (fill, stroke, stroke-width, etc.).
- Prefer rounded stroke-linecap="round" and stroke-linejoin="round" for icon quality.
- Keep element count low — prefer elegant paths over many shapes.
- Ensure consistent stroke widths within an icon (typically 8–10 for 128 viewBox).

# Style guide
When the user does not specify a style, default to "outline" style.
Recognize and apply these styles:

**outline** — clean strokes, no fills (or fill="none"), uniform stroke-width.
**filled** — solid filled shapes, minimal or no strokes, bold silhouette.
**duotone** — two tones: a muted background shape + a prominent foreground element.
**minimal** — fewest possible elements, ultra-simple geometry, abstract.
**detailed** — richer details, gradients allowed, more complex composition.

# Color guidance
- For outline style: use currentColor or a single accent color.
- For filled/duotone: use a cohesive 2–3 color palette.
- Avoid pure black (#000000) — prefer softer darks like #111827 or #1e293b.
- Popular accent palettes: orange (#F97316 + #FDE68A), blue (#3B82F6 + #93C5FD), emerald (#10B981 + #6EE7B7), violet (#8B5CF6 + #C4B5FD).

# Behavior
- Understand prompts in ANY language (Russian, English, etc.).
- Decide from context: create NEW icon vs. EDIT current SVG.
- If user says "создай", "нарисуй", "новая иконка", "сделай иконку" → create new.
- If user says "измени", "перекрась", "упрости", "добавь", "убери", "скругли" → edit current.
- If ambiguous → prefer editing current SVG, preserving the concept.
- Keep edits minimal unless user asks for redesign.

# Few-shot examples

## Example 1: "иконка сердца" (outline)
<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M64 108C64 108 16 76 16 44C16 28 28 16 44 16C53 16 60 20 64 28C68 20 75 16 84 16C100 16 112 28 112 44C112 76 64 108 64 108Z" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

## Example 2: "иконка дома" (filled)
<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 64L64 20L108 64V108H80V80H48V108H20V64Z" fill="#111827"/>
  <rect x="52" y="44" width="24" height="20" rx="4" fill="#F97316"/>
</svg>

## Example 3: "иконка молнии" (duotone)
<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="24" width="80" height="80" rx="24" fill="#EEF2FF"/>
  <path d="M68 32L44 72H60L56 96L84 56H66L68 32Z" fill="#6366F1"/>
</svg>

## Example 4: editing — "сделай углы более скруглёнными"
When user asks to round corners, increase rx/ry values on rects and smooth path curves — preserve all other attributes.

## Example 5: editing — "перекрась в синий"
When user asks to recolor, map the existing palette to the requested hue — preserve structure, shapes, and proportions.`

/* ------------------------------------------------------------------ */
/*  API helpers                                                        */
/* ------------------------------------------------------------------ */

function getApiKey() {
  const apiKey = import.meta.env.VITE_POLZA_AI_API_KEY

  if (!apiKey) {
    throw new Error('VITE_POLZA_AI_API_KEY is missing')
  }

  return apiKey
}

function sanitizeSvgResponse(content) {
  const cleaned = content
    .replace(/^```(?:svg|xml|html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const startIndex = cleaned.indexOf('<svg')
  const endIndex = cleaned.lastIndexOf('</svg>')

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Модель не вернула корректную SVG-разметку')
  }

  return cleaned.slice(startIndex, endIndex + 6)
}

function detectIntent(prompt) {
  const createPatterns = /\b(создай|нарисуй|сгенерируй|новая|новый|новое|нарисуй|make|create|generate|draw|new)\b/i
  const editPatterns = /\b(измени|перекрась|упрости|добавь|убери|удали|скругли|увеличь|уменьши|поверни|отрази|поменяй|сделай|fix|edit|change|modify|adjust|simplify|recolor|rotate|flip|remove|add)\b/i

  if (createPatterns.test(prompt)) return 'create'
  if (editPatterns.test(prompt)) return 'edit'
  return 'auto'
}

function buildSvgUserPrompt(prompt, currentSvg) {
  const intent = detectIntent(prompt)

  let instruction
  if (intent === 'create') {
    instruction = 'Create a NEW icon based on the description. Ignore the current SVG.'
  } else if (intent === 'edit') {
    instruction = 'EDIT the current SVG according to the request. Preserve the overall structure and concept.'
  } else {
    instruction = 'Decide whether to create a new icon or edit the current one based on context.'
  }

  return `User request: ${prompt}

Current SVG:
${currentSvg || '<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>'}

Intent: ${instruction}
Return only the final SVG.`
}

/* ------------------------------------------------------------------ */
/*  Main generation function with retry                                */
/* ------------------------------------------------------------------ */

const MAX_RETRIES = 2

export async function generateSvgFromPrompt({
  prompt,
  currentSvg = '',
}) {
  if (!prompt.trim()) {
    throw new Error('Промпт не может быть пустым')
  }

  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${POLZA_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: attempt === 0 ? 0.3 : 0.5 + attempt * 0.1,
          max_tokens: 2048,
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
        throw new Error(errorText || `Запрос к AI завершился с ошибкой ${response.status}`)
      }

      const completion = await response.json()
      const content = completion.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('Модель вернула пустой ответ')
      }

      return sanitizeSvgResponse(content)
    } catch (error) {
      lastError = error

      // Don't retry on auth/quota errors
      if (error.message?.includes('401') || error.message?.includes('429')) {
        break
      }

      // Don't retry on last attempt
      if (attempt === MAX_RETRIES) break
    }
  }

  throw lastError
}

export { DEFAULT_MODEL }

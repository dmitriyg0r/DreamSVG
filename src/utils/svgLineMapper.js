/**
 * Maps a hovered SVG DOM element back to its source line number.
 *
 * Strategy: build a "fingerprint" from the element's unique geometric
 * attributes, then scan the SVG source line-by-line for a match.
 *
 * Works best with formatted SVG (one element per line), which is the
 * default after the user clicks "Format".
 */

/**
 * Returns a short, unique substring derived from the element's attributes
 * that we can search for in the raw source text.
 */
function getFingerprint(el) {
  // <path> — the d attribute is the most unique
  const d = el.getAttribute('d')
  if (d) return d.slice(0, 20).trim()

  // <circle> / <ellipse>
  const cx = el.getAttribute('cx')
  const cy = el.getAttribute('cy')
  if (cx !== null && cy !== null) return `cx="${cx}"`

  // <rect>
  const width = el.getAttribute('width')
  const height = el.getAttribute('height')
  if (width !== null && height !== null) return `width="${width}"`

  // <line>
  const x1 = el.getAttribute('x1')
  if (x1 !== null) return `x1="${x1}"`

  // <polygon> / <polyline>
  const points = el.getAttribute('points')
  if (points) return points.slice(0, 15).trim()

  // <use>
  const href = el.getAttribute('href') || el.getAttribute('xlink:href')
  if (href) return `href="${href}"`

  // Fallback — fill or stroke
  const fill = el.getAttribute('fill')
  if (fill && fill !== 'none') return `fill="${fill}"`

  const stroke = el.getAttribute('stroke')
  if (stroke) return `stroke="${stroke}"`

  return null
}

/**
 * Given a hovered SVG DOM element and the raw SVG source string,
 * returns the 1-based line number that corresponds to that element,
 * or null if it cannot be determined.
 */
export function findElementLine(el, svgSource) {
  if (!el || !svgSource) return null

  const tag = el.tagName?.toLowerCase()

  // Skip the SVG root and non-element nodes
  if (!tag || tag === 'svg' || tag === 'defs' || tag === '#text') return null

  const lines = svgSource.split('\n')
  const fingerprint = getFingerprint(el)
  const openTag = `<${tag}`

  // First pass: tag + fingerprint (precise match)
  if (fingerprint) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(openTag) && lines[i].includes(fingerprint)) {
        return i + 1
      }
    }
  }

  // Second pass: multi-line element — fingerprint might be on a different line
  // Find the tag opening, then check the next few lines for the fingerprint
  if (fingerprint) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(openTag)) {
        const block = lines.slice(i, i + 6).join(' ')
        if (block.includes(fingerprint)) return i + 1
      }
    }
  }

  // Third pass: first occurrence of the tag (last resort for <g>, <defs>)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(openTag)) return i + 1
  }

  return null
}

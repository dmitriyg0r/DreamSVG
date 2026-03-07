import DOMPurify from 'dompurify'

/**
 * Sanitize SVG markup to prevent XSS attacks.
 *
 * Removes dangerous elements (`<script>`, `<foreignObject>`) and
 * event-handler attributes (`onload`, `onclick`, etc.) while keeping
 * all legitimate SVG constructs — filters, gradients, animations, masks.
 */
export function sanitizeSvg(rawMarkup) {
    return DOMPurify.sanitize(rawMarkup, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
    })
}

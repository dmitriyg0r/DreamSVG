/**
 * Parse SVG markup and extract metadata (validity, viewBox, dimensions, shape count).
 */
export function getSvgMeta(markup) {
    try {
        const parser = new DOMParser()
        const document = parser.parseFromString(markup, 'image/svg+xml')
        const parserError = document.querySelector('parsererror')

        if (parserError) {
            return {
                isValid: false,
                error: 'SVG содержит синтаксическую ошибку. Проверь теги и атрибуты.',
            }
        }

        const svg = document.documentElement

        if (svg?.tagName !== 'svg') {
            return {
                isValid: false,
                error: 'Корневой элемент должен быть <svg>.',
            }
        }

        const viewBox = svg.getAttribute('viewBox') || 'Не указан'
        const width = svg.getAttribute('width') || 'auto'
        const height = svg.getAttribute('height') || 'auto'
        const shapes = svg.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line, g').length

        return {
            isValid: true,
            error: '',
            viewBox,
            width,
            height,
            shapes,
        }
    } catch {
        return {
            isValid: false,
            error: 'Не удалось обработать SVG.',
        }
    }
}

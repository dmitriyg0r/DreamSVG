const JSX_ATTRIBUTE_MAP = {
    'clip-path': 'clipPath',
    'clip-rule': 'clipRule',
    'fill-opacity': 'fillOpacity',
    'fill-rule': 'fillRule',
    'mask-type': 'maskType',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity',
    'stroke-width': 'strokeWidth',
    'text-anchor': 'textAnchor',
    'xlink:href': 'xlinkHref',
    xmlnsXlink: 'xmlnsXlink',
}

/**
 * Convert SVG/HTML attribute names to their JSX equivalents.
 */
export function toJsxAttributes(markup) {
    return markup
        .replace(/\bclass=/g, 'className=')
        .replace(/\bfor=/g, 'htmlFor=')
        .replace(/\b([a-z]+:[a-z-]+)=/gi, (match, attribute) => {
            const jsxName = JSX_ATTRIBUTE_MAP[attribute] || attribute.replace(/:([a-z])/g, (_, char) => char.toUpperCase())
            return `${jsxName}=`
        })
        .replace(/\b([a-z]+(?:-[a-z]+)+)=/gi, (match, attribute) => {
            const jsxName = JSX_ATTRIBUTE_MAP[attribute] || attribute.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
            return `${jsxName}=`
        })
}

/**
 * Build a React/JSX functional component from raw SVG markup.
 */
export function buildJsxComponent(svgMarkup) {
    const jsxSvg = toJsxAttributes(svgMarkup)
    return `export default function SvgIcon(props) {
  return (
    ${jsxSvg.replace('<svg', '<svg {...props}')}
  )
}
`
}

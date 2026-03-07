import { useEffect, useMemo, useState } from 'react'
import formatXml from 'xml-formatter'
import AiPanel from './components/AiPanel'
import SvgCodeEditor from './components/SvgCodeEditor'
import { DEFAULT_MODEL, generateSvgFromPrompt } from './services/svgAi'
import './App.css'

const STORAGE_KEYS = {
  editorMode: 'dreamsvg.editorMode',
  svgCode: 'dreamsvg.svgCode',
}

const INITIAL_SVG = `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="18" width="92" height="92" rx="28" fill="#111827"/>
  <path d="M64 28L74.5 53.5L100 64L74.5 74.5L64 100L53.5 74.5L28 64L53.5 53.5L64 28Z" fill="#F97316"/>
  <circle cx="64" cy="64" r="14" fill="#FDE68A"/>
</svg>`

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

function getSvgMeta(markup) {
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

function toJsxAttributes(markup) {
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

function buildJsxComponent(svgMarkup) {
  const jsxSvg = toJsxAttributes(svgMarkup)
  return `export default function SvgIcon(props) {
  return (
    ${jsxSvg.replace('<svg', '<svg {...props}')}
  )
}
`
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

function App() {
  const [svgCode, setSvgCode] = useState(() => {
    const savedCode = localStorage.getItem(STORAGE_KEYS.svgCode)
    return savedCode || INITIAL_SVG
  })
  const [editorMode, setEditorMode] = useState(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.editorMode)
    return savedMode === 'ai' ? 'ai' : 'code'
  })
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiPrompt, setAiPrompt] = useState('minimal outline camera icon')
  const [formatError, setFormatError] = useState('')

  const svgMeta = useMemo(() => getSvgMeta(svgCode), [svgCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.svgCode, svgCode)
  }, [svgCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.editorMode, editorMode)
  }, [editorMode])

  const handleFormatSvg = () => {
    try {
      const formattedSvg = formatXml(svgCode, {
        collapseContent: true,
        indentation: '  ',
        lineSeparator: '\n',
      })

      setSvgCode(formattedSvg)
      setFormatError('')
    } catch {
      setFormatError('Не удалось отформатировать SVG. Сначала исправь синтаксис.')
    }
  }

  const handleGenerateWithAi = async () => {
    setAiBusy(true)
    setAiError('')

    try {
      const nextSvg = await generateSvgFromPrompt({
        prompt: aiPrompt,
        currentSvg: svgCode,
      })
      setSvgCode(formatXml(nextSvg, {
        collapseContent: true,
        indentation: '  ',
        lineSeparator: '\n',
      }))
      setAiPrompt('')
      setEditorMode('code')
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : 'AI request failed',
      )
    } finally {
      setAiBusy(false)
    }
  }

  const handleDownloadSvg = () => {
    downloadFile('dreamsvg-icon.svg', svgCode, 'image/svg+xml;charset=utf-8')
  }

  const handleDownloadJsx = () => {
    downloadFile(
      'DreamSvgIcon.jsx',
      buildJsxComponent(svgCode),
      'text/jsx;charset=utf-8',
    )
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div className="workspace-header-spacer" aria-hidden="true" />
          <h1>DreamSVG editor</h1>
          <div className="workspace-meta">
            <span>{svgMeta.isValid ? 'Valid' : 'Error'}</span>
            <span>{svgMeta.isValid ? `${svgMeta.shapes} nodes` : '—'}</span>
            <span>{svgMeta.isValid ? `viewBox ${svgMeta.viewBox}` : '—'}</span>
          </div>
        </header>

        <article className="panel panel-editor">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Редактор</span>
              <h2>{editorMode === 'code' ? 'SVG код' : 'AI prompt'}</h2>
            </div>

            <div className="editor-actions">
              <div className="mode-switch" aria-label="Editor mode">
                <button
                  type="button"
                  className={editorMode === 'code' ? 'active' : ''}
                  onClick={() => setEditorMode('code')}
                >
                  Code
                </button>
                <button
                  type="button"
                  className={editorMode === 'ai' ? 'active' : ''}
                  onClick={() => setEditorMode('ai')}
                >
                  AI
                </button>
              </div>
            </div>
          </div>

          {editorMode === 'code' ? (
            <SvgCodeEditor
              value={svgCode}
              onChange={setSvgCode}
              onFormat={handleFormatSvg}
              error={formatError}
            />
          ) : (
            <AiPanel
              busy={aiBusy}
              error={aiError}
              model={DEFAULT_MODEL}
              onGenerate={handleGenerateWithAi}
              prompt={aiPrompt}
              setPrompt={setAiPrompt}
            />
          )}
        </article>

        <article className="panel panel-preview">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Предпросмотр</span>
              <h2>Живой рендер</h2>
            </div>
          </div>

          <div className="preview-stage">
            {svgMeta.isValid ? (
              <div
                className="preview-canvas"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
            ) : (
              <div className="preview-error">
                <strong>Предпросмотр недоступен</strong>
                <p>{svgMeta.error}</p>
              </div>
            )}
          </div>

          <div className="inspector">
            <button
              type="button"
              className="export-button"
              onClick={handleDownloadSvg}
              disabled={!svgMeta.isValid}
            >
              Download SVG
            </button>
            <button
              type="button"
              className="export-button export-button-primary"
              onClick={handleDownloadJsx}
              disabled={!svgMeta.isValid}
            >
              Download JSX
            </button>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import './App.css'

const STORAGE_KEYS = {
  activeTemplate: 'dreamsvg.activeTemplate',
  svgCode: 'dreamsvg.svgCode',
}

const templates = {
  spark: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="18" width="92" height="92" rx="28" fill="#111827"/>
  <path d="M64 28L74.5 53.5L100 64L74.5 74.5L64 100L53.5 74.5L28 64L53.5 53.5L64 28Z" fill="#F97316"/>
  <circle cx="64" cy="64" r="14" fill="#FDE68A"/>
</svg>`,
  grid: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="30" fill="#0F172A"/>
  <rect x="24" y="24" width="32" height="32" rx="10" fill="#22C55E"/>
  <rect x="72" y="24" width="32" height="32" rx="10" fill="#38BDF8"/>
  <rect x="24" y="72" width="32" height="32" rx="10" fill="#F59E0B"/>
  <path d="M72 72H104V104H72L88 88L72 72Z" fill="#F43F5E"/>
</svg>`,
  orbit: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="30" fill="#172554"/>
  <circle cx="64" cy="64" r="12" fill="#E0E7FF"/>
  <ellipse cx="64" cy="64" rx="42" ry="18" stroke="#A78BFA" stroke-width="8"/>
  <ellipse cx="64" cy="64" rx="18" ry="42" stroke="#60A5FA" stroke-width="8"/>
  <circle cx="28" cy="64" r="7" fill="#F9A8D4"/>
  <circle cx="92" cy="39" r="7" fill="#FDE68A"/>
</svg>`,
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

function App() {
  const [svgCode, setSvgCode] = useState(() => {
    const savedCode = localStorage.getItem(STORAGE_KEYS.svgCode)
    return savedCode || templates.spark
  })
  const [activeTemplate, setActiveTemplate] = useState(() => {
    const savedTemplate = localStorage.getItem(STORAGE_KEYS.activeTemplate)
    return templates[savedTemplate] ? savedTemplate : 'spark'
  })

  const svgMeta = useMemo(() => getSvgMeta(svgCode), [svgCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.svgCode, svgCode)
  }, [svgCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeTemplate, activeTemplate)
  }, [activeTemplate])

  const handleTemplateChange = (templateKey) => {
    setActiveTemplate(templateKey)
    setSvgCode(templates[templateKey])
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="workspace-header">
          <div>
            <span className="panel-kicker">DreamSVG Studio</span>
            <h1>SVG icon editor</h1>
          </div>
          <div className="workspace-meta">
            <span>{svgMeta.isValid ? 'SVG готов' : 'Ошибка в коде'}</span>
            <span>{svgMeta.isValid ? `${svgMeta.shapes} фигур` : '—'}</span>
            <span>{svgMeta.isValid ? svgMeta.viewBox : '—'}</span>
          </div>
        </header>

        <article className="panel panel-editor">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Редактор</span>
              <h2>SVG код</h2>
            </div>

            <div className="template-switcher" aria-label="SVG templates">
              {Object.keys(templates).map((templateKey) => (
                <button
                  key={templateKey}
                  type="button"
                  className={templateKey === activeTemplate ? 'active' : ''}
                  onClick={() => handleTemplateChange(templateKey)}
                >
                  {templateKey}
                </button>
              ))}
            </div>
          </div>

          <label className="editor-frame">
            <span className="editor-label">Вставь или измени SVG-разметку</span>
            <CodeMirror
              value={svgCode}
              onChange={(value) => setSvgCode(value)}
              extensions={[xml()]}
              basicSetup={{
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                foldGutter: false,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                lineNumbers: true,
              }}
              className="code-editor-shell"
            />
          </label>
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
            <div className="inspector-row">
              <span>Размер</span>
              <strong>
                {svgMeta.isValid ? `${svgMeta.width} × ${svgMeta.height}` : '—'}
              </strong>
            </div>
            <div className="inspector-row">
              <span>ViewBox</span>
              <strong>{svgMeta.isValid ? svgMeta.viewBox : '—'}</strong>
            </div>
            <div className="inspector-row">
              <span>Состояние</span>
              <strong className={svgMeta.isValid ? 'status-ok' : 'status-error'}>
                {svgMeta.isValid ? 'Валидный SVG' : 'Ошибка'}
              </strong>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App

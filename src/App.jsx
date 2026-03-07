import { useEffect, useMemo, useState } from 'react'
import formatXml from 'xml-formatter'
import SvgCodeEditor from './components/SvgCodeEditor'
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
    return savedCode || INITIAL_SVG
  })
  const [editorMode, setEditorMode] = useState(() => {
    const savedMode = localStorage.getItem(STORAGE_KEYS.editorMode)
    return savedMode === 'ai' ? 'ai' : 'code'
  })
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
            <div className="editor-frame ai-panel">
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="editor-label">AI mode</span>
                  <p className="ai-placeholder-title">Логика генерации пока не подключена</p>
                  <p className="ai-placeholder-text">
                    Здесь можно будет добавить твой собственный AI flow, промпты и
                    генерацию SVG без изменения структуры интерфейса.
                  </p>
                </div>
              </div>
            </div>
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

import { useCallback, useEffect, useMemo, useState } from 'react'
import formatXml from 'xml-formatter'
import AiPanel from './components/AiPanel'
import AppLogo from './components/AppLogo'
import SvgCodeEditor from './components/SvgCodeEditor'
import { useDebounce } from './hooks/useDebounce'
import { useSvgHistory } from './hooks/useSvgHistory'
import { DEFAULT_MODEL, generateSvgFromPrompt } from './services/svgAi'
import { downloadFile } from './utils/download'
import { buildJsxComponent } from './utils/jsxConverter'
import { sanitizeSvg } from './utils/sanitize'
import { getSvgMeta } from './utils/svgMeta'
import './App.css'

const STORAGE_KEYS = {
  editorMode: 'dreamsvg.editorMode',
  svgCode: 'dreamsvg.svgCode',
  theme: 'dreamsvg.theme',
}

const INITIAL_SVG = `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="18" width="92" height="92" rx="28" fill="#111827"/>
  <path d="M64 28L74.5 53.5L100 64L74.5 74.5L64 100L53.5 74.5L28 64L53.5 53.5L64 28Z" fill="#F97316"/>
  <circle cx="64" cy="64" r="14" fill="#FDE68A"/>
</svg>`

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
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme)
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const { canUndo, pushSnapshot, undo } = useSvgHistory()

  const debouncedCode = useDebounce(svgCode, 300)
  const svgMeta = useMemo(() => getSvgMeta(debouncedCode), [debouncedCode])
  const safeSvg = useMemo(() => sanitizeSvg(debouncedCode), [debouncedCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.svgCode, svgCode)
  }, [svgCode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.editorMode, editorMode)
  }, [editorMode])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

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
    pushSnapshot(svgCode)
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

  const handleUndo = useCallback(() => {
    const previous = undo()
    if (previous) setSvgCode(previous)
  }, [undo])

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = svgCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
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
          <div className="workspace-brand">
            <AppLogo className="app-logo" />
            <h1>DreamSVG editor</h1>
          </div>
          <div className="workspace-links">
            <a
              className="workspace-github"
              href="https://github.com/dmitriyg0r/DreamSVG"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub repository"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.59 2 12.24C2 16.76 4.87 20.59 8.84 21.94C9.34 22.03 9.52 21.72 9.52 21.45C9.52 21.2 9.51 20.37 9.5 19.49C6.73 20.11 6.14 18.28 6.14 18.28C5.68 17.08 5.03 16.76 5.03 16.76C4.12 16.13 5.1 16.14 5.1 16.14C6.1 16.21 6.63 17.19 6.63 17.19C7.52 18.76 8.97 18.31 9.54 18.05C9.63 17.39 9.89 16.94 10.18 16.68C7.97 16.42 5.65 15.53 5.65 11.57C5.65 10.44 6.04 9.52 6.69 8.8C6.59 8.54 6.24 7.5 6.79 6.09C6.79 6.09 7.63 5.81 9.5 7.11C10.3 6.88 11.15 6.77 12 6.76C12.85 6.77 13.7 6.88 14.5 7.11C16.37 5.81 17.21 6.09 17.21 6.09C17.76 7.5 17.41 8.54 17.31 8.8C17.96 9.52 18.35 10.44 18.35 11.57C18.35 15.54 16.02 16.42 13.8 16.67C14.17 17 14.5 17.64 14.5 18.62C14.5 20.03 14.49 21.13 14.49 21.45C14.49 21.72 14.67 22.04 15.18 21.94C19.14 20.59 22 16.76 22 12.24C22 6.59 17.52 2 12 2Z" />
              </svg>
            </a>
            <a
              className="workspace-donate"
              href="https://www.donationalerts.com/r/dmitriygor"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 69 80" fill="currentColor" aria-hidden="true">
                <path d="M34.8586103,46.5882227 L29.4383109,46.5882227 C29.1227896,46.5896404 28.8214241,46.4709816 28.6091788,46.2617625 C28.3969336,46.0525435 28.2937566,45.7724279 28.325313,45.4910942 L28.8039021,40.6038855 C28.8504221,40.0844231 29.3353656,39.684617 29.9168999,39.6862871 L35.3371993,39.6862871 C35.6527206,39.6848694 35.9540862,39.8035282 36.1663314,40.0127473 C36.3785767,40.2219663 36.4817536,40.5020819 36.4501972,40.7834156 L35.9716081,45.6706244 C35.9250881,46.1900867 35.4401446,46.5898928 34.8586103,46.5882227 Z M35.7273704,37.0196078 L30.2062624,37.0196078 C29.5964177,37.0196078 29.1020408,36.5436108 29.1020408,35.9564386 L30.6037822,19.445421 C30.6711655,18.9085577 31.1463683,18.5059261 31.7080038,18.5098321 L37.2291117,18.5098321 C37.8389565,18.5098321 38.3333333,18.9858292 38.3333333,19.5730013 L36.7874231,36.0946506 C36.71732,36.6114677 36.2684318,37.0031485 35.7273704,37.0196078 Z M68.1907868,17.7655375 C68.7783609,18.4477209 69.0654113,19.3359027 68.9874243,20.2304671 L66.8294442,44.7595227 C66.7602449,45.5618649 66.4022166,46.3125114 65.8210422,46.8737509 L48.1740082,63.9078173 C47.5440361,64.5136721 46.7011436,64.8515656 45.8244317,64.849701 L27.0379034,64.849701 L10.5001116,80 L11.780782,64.8396809 L3.37070981,64.8396809 C2.42614186,64.8404154 1.52467299,64.4469919 0.886144518,63.7553546 C0.247616048,63.0637173 -0.0692823639,62.1374374 0.0127313353,61.2024067 L5.14549723,3.00601995 C5.32162283,1.29571214 6.77326374,-0.00377492304 8.50347571,8.23911697e-06 L51.3303063,8.23911697e-06 C52.3155567,-0.000274507348 53.2515294,0.428127083 53.8916472,1.17235281 L68.1907868,17.7655375 Z M55.1118136,40.0801644 L56.4832402,24.9398854 C56.5364472,24.0422509 56.2238954,23.1611024 55.6160145,22.4949959 L47.548799,13.2364798 C46.9095165,12.5050105 45.982605,12.084699 45.0076261,12.0841753 L19.5958971,12.0841753 C17.8656851,12.0803922 16.4140442,13.3798792 16.2379186,15.090187 L13.2127128,49.1583198 C13.1430685,50.0904539 13.4642119,51.0097453 14.1001037,51.6985265 C14.7359954,52.3873077 15.6300918,52.7843324 16.5706913,52.795594 L41.5588914,52.795594 C42.4258216,52.7976549 43.2601656,52.4674704 43.8882999,51.8737504 L54.1034116,42.2044127 C54.6867718,41.6406314 55.0449815,40.8860452 55.1118136,40.0801644 Z" />
              </svg>
              <span>Donation</span>
            </a>
          </div>
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
              {canUndo && (
                <button
                  type="button"
                  className="undo-button"
                  onClick={handleUndo}
                  aria-label="Undo last AI generation"
                >
                  <svg
                    className="button-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4.5 8.5L2 6L4.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2.5 6H12C14.7614 6 17 8.23858 17 11C17 13.7614 14.7614 16 12 16H6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
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
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <svg className="theme-toggle-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="theme-toggle-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
              <span className="theme-toggle-track" />
            </button>
          </div>

          <div className="preview-stage">
            {svgMeta.isValid ? (
              <div
                className="preview-canvas"
                dangerouslySetInnerHTML={{ __html: safeSvg }}
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
              className={`export-button export-button-copy${copied ? ' export-button-copied' : ''}`}
              onClick={handleCopySvg}
              disabled={!svgMeta.isValid}
            >
              {copied ? '✓ Copied!' : 'Copy SVG'}
            </button>
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

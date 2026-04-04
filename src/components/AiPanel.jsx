import { useEffect, useRef } from 'react'

const MAX_PROMPT_LENGTH = 500

function AiPanel({
  busy,
  error,
  model,
  onGenerate,
  prompt,
  setPrompt,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!busy && prompt.trim()) onGenerate()
      }
    }
    const el = textareaRef.current
    if (el) el.addEventListener('keydown', handler)
    return () => { if (el) el.removeEventListener('keydown', handler) }
  }, [busy, prompt, onGenerate])

  const remaining = MAX_PROMPT_LENGTH - prompt.length
  const isOverLimit = remaining < 0

  return (
    <div className="editor-frame ai-panel">
      <div className="ai-panel-header">
        <div>
          <span className="editor-label">AI запрос</span>
          <p className="ai-placeholder-title">Опиши иконку — AI создаст или доработает SVG</p>
        </div>
        <span className="ai-model-badge">{model}</span>
      </div>

      <div className="ai-prompt-wrapper">
        <textarea
          ref={textareaRef}
          className="ai-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX_PROMPT_LENGTH + 50))}
          placeholder="Например: иконка камеры, ракета в стиле duotone, перекрась в синий, скругли углы"
        />
        <span className={`ai-prompt-counter${isOverLimit ? ' ai-prompt-counter-over' : remaining < 50 ? ' ai-prompt-counter-warn' : ''}`}>
          {remaining}
        </span>
      </div>

      <button
        type="button"
        className="ai-generate-button"
        onClick={onGenerate}
        disabled={busy || !prompt.trim() || isOverLimit}
        title="Сгенерировать SVG (Ctrl+Enter)"
      >
        {busy ? 'Генерирую…' : 'Сгенерировать SVG'}
      </button>

      {!busy && (
        <p className="ai-shortcut-hint">Ctrl+Enter для быстрой генерации</p>
      )}

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default AiPanel

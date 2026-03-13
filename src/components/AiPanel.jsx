function AiPanel({
  busy,
  error,
  model,
  onGenerate,
  prompt,
  setPrompt,
}) {
  return (
    <div className="editor-frame ai-panel">
      <div className="ai-panel-header">
        <div>
          <span className="editor-label">AI запрос</span>
          <p className="ai-placeholder-title">Сгенерируй или доработай SVG с помощью AI</p>
        </div>
        <span className="ai-model-badge">{model}</span>
      </div>

      <textarea
        className="ai-prompt-input"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Например: создай новую минималистичную иконку камеры или скругли углы у текущей иконки"
      />

      <button
        type="button"
        className="ai-generate-button"
        onClick={onGenerate}
        disabled={busy || !prompt.trim()}
      >
        {busy ? 'Генерирую…' : 'Сгенерировать SVG'}
      </button>

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default AiPanel

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
          <span className="editor-label">AI prompt</span>
          <p className="ai-placeholder-title">Generate or refine SVG with AI</p>
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
        {busy ? 'Generating…' : 'Generate SVG'}
      </button>

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default AiPanel

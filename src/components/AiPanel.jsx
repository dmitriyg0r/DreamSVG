function AiPanel({
  busy,
  error,
  model,
  onGenerate,
  prompt,
  setPrompt,
}) {
  const suggestions = [
    'minimal outline camera icon',
    'rounded folder icon with soft corners',
    'bold lightning bolt icon',
    'play button inside circle',
  ]

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
        placeholder="Например: minimal monochrome folder icon with rounded corners"
      />

      <div className="ai-suggestion-list">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="ai-suggestion-chip"
            onClick={() => setPrompt(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

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

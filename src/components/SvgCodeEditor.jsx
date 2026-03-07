import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'

const editorExtensions = [xml()]

const editorSetup = {
  autocompletion: true,
  bracketMatching: true,
  closeBrackets: true,
  foldGutter: false,
  highlightActiveLine: true,
  highlightSelectionMatches: true,
  lineNumbers: true,
}

function SvgCodeEditor({ value, onChange, onFormat, error }) {
  return (
    <div className="editor-frame">
      <div className="editor-label-row">
        <span className="editor-label">Вставь или измени SVG-разметку</span>
        <button
          type="button"
          className="format-button"
          onClick={onFormat}
          aria-label="Format SVG"
        >
          <svg
            className="button-icon"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 5H12M4 10H16M4 15H11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M13.5 13.5L15 15L17.5 12.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="code-editor-shell">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={editorExtensions}
          basicSetup={editorSetup}
        />
      </div>

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default SvgCodeEditor

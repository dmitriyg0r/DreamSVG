import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import { indentWithTab } from '@codemirror/commands'
import { keymap, EditorView } from '@codemirror/view'

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '0.94rem',
  },
  '.cm-content': {
    caretColor: '#0f172a',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeft: '2px solid #0f172a',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
  },
})

const editorExtensions = [xml(), EditorView.lineWrapping, keymap.of([indentWithTab]), editorTheme]

const editorSetup = {
  autocompletion: true,
  bracketMatching: true,
  closeBrackets: true,
  defaultKeymap: true,
  foldGutter: false,
  highlightActiveLine: true,
  highlightSelectionMatches: true,
  indentOnInput: true,
  lineNumbers: true,
  lintKeymap: true,
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
          className="svg-code-editor"
        />
      </div>

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default SvgCodeEditor

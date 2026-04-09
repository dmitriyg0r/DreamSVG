import { useEffect, useRef } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { xml } from '@codemirror/lang-xml'
import { indentWithTab } from '@codemirror/commands'
import { keymap, EditorView } from '@codemirror/view'
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration } from '@codemirror/view'

/* ------------------------------------------------------------------ */
/*  Line highlight decoration (CodeMirror 6)                           */
/* ------------------------------------------------------------------ */

const setHighlightEffect = StateEffect.define()

const highlightLineField = StateField.define({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightEffect)) {
        if (effect.value === null) return Decoration.none
        try {
          const line = tr.state.doc.line(effect.value)
          return Decoration.set([
            Decoration.line({ class: 'cm-preview-highlight' }).range(line.from),
          ])
        } catch {
          return Decoration.none
        }
      }
    }
    // Keep decorations in sync when document changes
    return decorations.map(tr.changes)
  },
  provide: (field) => EditorView.decorations.from(field),
})

/* ------------------------------------------------------------------ */
/*  Editor theme                                                        */
/* ------------------------------------------------------------------ */

const editorTheme = EditorView.theme({
  '&': { fontSize: '0.94rem' },
  '.cm-content': { caretColor: '#0f172a' },
  '.cm-cursor, .cm-dropCursor': { borderLeft: '2px solid #0f172a' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
})

const editorExtensions = [
  xml(),
  EditorView.lineWrapping,
  keymap.of([indentWithTab]),
  editorTheme,
  highlightLineField,
]

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

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

function SvgCodeEditor({ value, onChange, onFormat, error, highlightLine }) {
  const viewRef = useRef(null)

  // Dispatch highlight decoration whenever the prop changes
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    view.dispatch({ effects: setHighlightEffect.of(highlightLine ?? null) })

    // Scroll to the highlighted line without jarring jumps
    if (highlightLine !== null && highlightLine !== undefined) {
      try {
        const pos = view.state.doc.line(highlightLine).from
        view.dispatch({
          effects: EditorView.scrollIntoView(pos, { y: 'nearest', x: 'nearest' }),
        })
      } catch {
        // line number out of range — ignore
      }
    }
  }, [highlightLine])

  return (
    <div className="editor-frame">
      <div className="editor-label-row">
        <span className="editor-label">Вставь или измени SVG-разметку</span>
        <button
          type="button"
          className="format-button"
          onClick={onFormat}
          aria-label="Отформатировать SVG"
          title="Форматировать SVG"
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
          onCreateEditor={(view) => {
            viewRef.current = view
          }}
        />
      </div>

      {error ? <p className="editor-feedback">{error}</p> : null}
    </div>
  )
}

export default SvgCodeEditor

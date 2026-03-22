import { useCallback, useState } from 'react'

const MAX_HISTORY = 50

/**
 * Undo/redo history hook for SVG code.
 *
 * Call `pushSnapshot(code)` before any destructive action to save current state.
 * Call `undo()` to restore the previous snapshot (moves current to redo stack).
 * Call `redo()` to re-apply the next snapshot.
 *
 * Returns `{ canUndo, canRedo, pushSnapshot, undo, redo }`.
 */
export function useSvgHistory() {
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  const pushSnapshot = useCallback((code) => {
    setUndoStack((prev) => {
      const next = [...prev, code]
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
    })
    // Any new action clears the redo stack
    setRedoStack([])
  }, [])

  const undo = useCallback((currentCode) => {
    let restored = null

    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      restored = prev[prev.length - 1]
      return prev.slice(0, -1)
    })

    if (currentCode !== undefined) {
      setRedoStack((prev) => [...prev, currentCode])
    }

    return restored
  }, [])

  const redo = useCallback((currentCode) => {
    let restored = null

    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      restored = prev[prev.length - 1]
      return prev.slice(0, -1)
    })

    if (currentCode !== undefined) {
      setUndoStack((prev) => [...prev, currentCode])
    }

    return restored
  }, [])

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pushSnapshot,
    undo,
    redo,
  }
}

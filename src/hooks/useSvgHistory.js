import { useCallback, useState } from 'react'

const MAX_HISTORY = 50

/**
 * Simple undo-history hook for SVG code.
 *
 * Call `pushSnapshot(code)` before an AI generation or any destructive action
 * to save the current state. Call `undo()` to restore the last snapshot.
 *
 * Returns `{ history, canUndo, pushSnapshot, undo }`.
 */
export function useSvgHistory() {
    const [history, setHistory] = useState([])

    const pushSnapshot = useCallback((code) => {
        setHistory((prev) => {
            const next = [...prev, code]
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
        })
    }, [])

    const undo = useCallback(() => {
        let restored = null

        setHistory((prev) => {
            if (prev.length === 0) return prev
            restored = prev[prev.length - 1]
            return prev.slice(0, -1)
        })

        return restored
    }, [])

    return {
        history,
        canUndo: history.length > 0,
        pushSnapshot,
        undo,
    }
}

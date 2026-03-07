import { useEffect, useState } from 'react'

/**
 * Debounce a value — returns the latest value only after it has been
 * stable (unchanged) for `delay` milliseconds.
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

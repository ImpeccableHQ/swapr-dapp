import { useCallback, useRef } from 'react'

export function useAbortController() {
  const abortControllerRef = useRef<AbortController>()

  const getAbortSignal = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    return abortControllerRef.current.signal
  }, [])

  return { getAbortSignal }
}

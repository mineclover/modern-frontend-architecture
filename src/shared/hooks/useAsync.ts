import { useState, useEffect, useCallback } from 'react'
import { AsyncState } from '@/common/types'

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): AsyncState<T> & { execute: () => Promise<void>, reset: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: 'idle'
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: 'loading', error: null }))
    
    try {
      const data = await asyncFunction()
      setState({ data, error: null, loading: 'success' })
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: 'error'
      })
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: 'idle'
    })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute, reset }
}
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseHotkeysReturn {
  startKey: string
  stopKey: string
  listeningFor: 'start' | 'stop' | null
  setStartKey: (key: string) => void
  setStopKey: (key: string) => void
  startListening: (type: 'start' | 'stop') => void
  stopListening: () => void
}

export function useHotkeys(
  initialStart: string,
  initialStop: string,
  onSave: (type: 'start' | 'stop', key: string) => void
): UseHotkeysReturn {
  const [startKey, setStartKey] = useState(initialStart)
  const [stopKey, setStopKey] = useState(initialStop)
  const [listeningFor, setListeningFor] = useState<'start' | 'stop' | null>(null)
  const keyBufferRef = useRef<string>('')

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const key = e.key.toUpperCase()
    const validKeys = [
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'CONTROL', 'ALT', 'SHIFT', 'ESCAPE', 'ENTER', 'SPACE', 'TAB',
      'DELETE', 'INSERT', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]

    if (validKeys.includes(key)) {
      if (listeningFor === 'start') {
        setStartKey(key)
        onSave('start', key)
      } else if (listeningFor === 'stop') {
        setStopKey(key)
        onSave('stop', key)
      }
      setListeningFor(null)
    }
  }, [listeningFor, onSave])

  useEffect(() => {
    if (listeningFor) {
      window.addEventListener('keydown', handleKeyDown, true)
      return () => window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [listeningFor, handleKeyDown])

  const startListening = useCallback((type: 'start' | 'stop') => {
    setListeningFor(type)
  }, [])

  const stopListening = useCallback(() => {
    setListeningFor(null)
  }, [])

  return {
    startKey,
    stopKey,
    listeningFor,
    setStartKey,
    setStopKey,
    startListening,
    stopListening
  }
}

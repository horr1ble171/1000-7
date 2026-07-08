import { Play, Square } from 'lucide-react'
import type { AppStatus } from '@/types'

interface ControlsProps {
  onStart: () => void
  onStop: () => void
  status: AppStatus
}

export function Controls({ onStart, onStop, status }: ControlsProps) {
  const isRunning = status === 'running'

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={onStart}
        disabled={isRunning}
        className="btn"
        style={{ flex: 1, opacity: isRunning ? 0.25 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
      >
        <Play size={13} style={{ fill: 'currentcolor' }} />
        <span>Старт</span>
      </button>
      <button
        onClick={onStop}
        disabled={!isRunning}
        className="btn btn-stop"
        style={{ flex: 1, opacity: !isRunning ? 0.25 : 1, cursor: !isRunning ? 'not-allowed' : 'pointer' }}
      >
        <Square size={13} />
        <span>Стоп</span>
      </button>
    </div>
  )
}

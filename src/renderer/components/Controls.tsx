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
    <div className="flex gap-3">
      <button
        onClick={onStart}
        disabled={isRunning}
        className="btn-primary"
        style={{ opacity: isRunning ? 0.3 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
      >
        <Play size={14} style={{ fill: 'currentcolor' }} />
        <span>Старт</span>
      </button>

      <button
        onClick={onStop}
        disabled={!isRunning}
        className="btn-primary btn-stop"
        style={{ opacity: !isRunning ? 0.3 : 1, cursor: !isRunning ? 'not-allowed' : 'pointer' }}
      >
        <Square size={14} />
        <span>Стоп</span>
      </button>
    </div>
  )
}

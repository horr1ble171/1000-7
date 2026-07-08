import { useState, useRef, useEffect } from 'react'
import { Timer } from 'lucide-react'

interface SpeedControlProps {
  duration: number
  onChange: (seconds: number) => void
  disabled?: boolean
}

const SLIDER_MIN = 25
const SLIDER_MAX = 300

export function SpeedControl({ duration, onChange, disabled }: SpeedControlProps) {
  const [inputValue, setInputValue] = useState(String(duration))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(String(duration))
  }, [duration])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= SLIDER_MIN) {
      onChange(num)
    }
  }

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10)
    if (isNaN(num) || num < SLIDER_MIN) {
      setInputValue(String(duration))
    } else {
      setInputValue(String(num))
      onChange(num)
    }
  }

  const progress = Math.min(((duration - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100, 100)

  const formatTime = (s: number) => {
    if (s < 60) return `${s}с`
    const m = Math.floor(s / 60)
    const sec = s % 60
    return sec > 0 ? `${m}м ${sec}с` : `${m}м`
  }

  return (
    <div className="glass-card">
      <div className="flex items-center gap-2 mb-3">
        <Timer size={12} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Длительность
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }} className="tabular-nums">
          ~{formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative flex-1 h-5 flex items-center">
          <div className="absolute inset-x-0 h-[2px] rounded-full" style={{ background: 'var(--progress-bg)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--progress-fill)' }} />
          </div>
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            value={Math.min(duration, SLIDER_MAX)}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className="scale-slider"
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          style={{
            width: 56,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontWeight: 600,
            outline: 'none',
            opacity: disabled ? 0.3 : 1
          }}
        />
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>сек</span>
      </div>
    </div>
  )
}

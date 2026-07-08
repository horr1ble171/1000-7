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
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!dragging) setInputValue(String(duration))
  }, [duration, dragging])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setInputValue(raw)
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= SLIDER_MIN) onChange(num)
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
    return s % 60 > 0 ? `${m}м ${s % 60}с` : `${m}м`
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Timer size={11} style={{ color: 'var(--text-muted)' }} />
        <span className="card-label" style={{ marginBottom: 0 }}>Длительность</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
          {formatTime(duration)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: 'var(--progress-bg)', borderRadius: 4 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--progress-fill)', borderRadius: 4 }} />
          </div>
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            value={Math.min(duration, SLIDER_MAX)}
            onChange={(e) => { setDragging(true); onChange(Number(e.target.value)) }}
            onMouseUp={() => setDragging(false)}
            onTouchEnd={() => setDragging(false)}
            disabled={disabled}
            style={{
              position: 'absolute', inset: 0, opacity: 0, cursor: disabled ? 'not-allowed' : 'pointer',
              width: '100%', margin: 0
            }}
          />
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          style={{
            width: 48, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 6, padding: '4px 6px', fontSize: 11, color: 'var(--text-secondary)',
            textAlign: 'center', fontWeight: 600, outline: 'none', flexShrink: 0,
            opacity: disabled ? 0.3 : 1
          }}
        />
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'

interface CounterProps {
  current: number
  total: number
}

export function Counter({ current, total }: CounterProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Отправлено
        </span>
        <motion.span
          key={`${current}-${total}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}
          className="tabular-nums"
        >
          {current} / {total}
        </motion.span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

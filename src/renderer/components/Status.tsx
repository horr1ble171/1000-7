import { motion, AnimatePresence } from 'framer-motion'
import type { AppStatus } from '@/types'

interface StatusProps {
  status: AppStatus
  text: string
}

export function Status({ status, text }: StatusProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center w-2 h-2">
        <motion.div
          className={`glow-dot ${status === 'running' ? '' : 'inactive'}`}
          animate={status === 'running' ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={status === 'running' ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
        {status === 'running' && (
          <motion.div
            className="absolute inset-0 w-2 h-2 rounded-full"
            style={{ background: 'var(--accent)' }}
            animate={{ scale: [1, 3], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

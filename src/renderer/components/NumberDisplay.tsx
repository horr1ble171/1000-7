import { motion, AnimatePresence } from 'framer-motion'

interface NumberDisplayProps {
  number: string
}

export function NumberDisplay({ number }: NumberDisplayProps) {
  return (
    <div className="number-glass">
      <div className="orb w-48 h-48 orb-red -top-20 -right-16" />
      <div className="orb w-40 h-40 orb-white -bottom-16 -left-12" />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={number}
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="number-value">{number}</div>
          <div className="number-label">Текущее число</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

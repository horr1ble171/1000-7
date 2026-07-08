import { motion, AnimatePresence } from 'framer-motion'

interface NumberDisplayProps {
  number: string
}

export function NumberDisplay({ number }: NumberDisplayProps) {
  return (
    <div className="number-card">
      <div className="orb w-44 h-44 orb-red -top-16 -right-16" />
      <div className="orb w-36 h-36 orb-white -bottom-12 -left-12" />
      <AnimatePresence mode="popLayout">
        <motion.div
          key={number}
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="number-value">{number}</div>
          <div className="number-sublabel">Текущее число</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

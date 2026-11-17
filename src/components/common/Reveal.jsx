import { motion, useReducedMotion } from 'framer-motion'

/**
 * Elemen yang muncul halus saat masuk viewport.
 * Menghormati prefers-reduced-motion — bila aktif, konten langsung terlihat.
 */
export default function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as] ?? motion.div

  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

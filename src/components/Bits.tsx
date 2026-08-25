import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * A blank in a sentence. Empty it is a ruled space waiting to be written on;
 * filled it is the family's own words, marked so you can still see the seam.
 */
export function Blank({ value, width = '7ch' }: { value?: string; width?: string }) {
  if (!value?.trim()) {
    return (
      <span
        className="mx-[0.12em] inline-block translate-y-[0.1em] border-b-[1.5px] border-[var(--color-rule-strong)]"
        style={{ width }}
        aria-label="blank"
      >
        &nbsp;
      </span>
    )
  }
  /* Filled, the words sit on the same ruled line the blank drew — the form
     is being written on, not replaced by a highlighted box. */
  return (
    <span className="box-decoration-clone border-b-[1.5px] border-[var(--color-ochre)] bg-[color-mix(in_srgb,var(--color-ochre)_11%,transparent)] px-[0.08em]">
      {value.trim()}
    </span>
  )
}

/**
 * Progress as one continuous bar rather than a row of separate ticks — a
 * single line filling is easier to read at a glance than counting segments.
 */
export function Ticks({ total, index }: { total: number; index: number }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (index / total) * 100)) : 0
  return (
    <div
      className="h-[3px] w-28 overflow-hidden rounded-full bg-[var(--color-rule-strong)]"
      role="progressbar"
      aria-valuenow={index}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div
        className="h-full rounded-full bg-[var(--color-ochre)] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * Hand the phone over.
 *
 * The whole first activity depends on the device physically moving across a
 * table, so the instruction gets a full stop of its own rather than a line
 * of helper text somebody scrolls past.
 */
export function Handoff({ to, asking }: { to: string; asking: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="surface-raised mx-1 px-6 py-7 text-center"
    >
      <svg width="40" height="40" viewBox="0 0 44 44" fill="none" className="mx-auto mb-4" aria-hidden="true">
        <rect x="14" y="4" width="16" height="27" rx="3.5" stroke="var(--color-blue-ink)" strokeWidth="1.2" />
        <line x1="19" y1="8.5" x2="25" y2="8.5" stroke="var(--color-blue-ink)" strokeWidth="1.2" />
        <path d="M8 38 Q22 30 36 38" stroke="var(--color-ochre)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M32 34.5 L36 38 L31.5 40" stroke="var(--color-ochre)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="type-eyebrow mb-2">Hand the phone to</p>
      <p className="type-h2 mb-3">{to}</p>
      <p className="type-caption mx-auto max-w-[26ch]">{asking}</p>
    </motion.div>
  )
}

export function Eyebrow({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <p className="type-eyebrow" style={tone ? { color: tone } : undefined}>
      {children}
    </p>
  )
}

/** Small circular icon button — back, forward, close. */
export function IconButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-rule-strong)] text-[var(--color-ink)] transition-all duration-200 hover:bg-[var(--color-paper-dark)] active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

export const ArrowLeft = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3.5 L5 9 L11 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowRight = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M7 3.5 L13 9 L7 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Close = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4 L14 14 M14 4 L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const Check = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.5 9.5 L7 13 L14.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Cross = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4.5 4.5 L13.5 13.5 M13.5 4.5 L4.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const Lock = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 7 V5 a2.5 2.5 0 0 1 5 0 V7" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Text that arrives rather than appears.
 *
 * Reveals whole words, not characters — character-by-character reads like a
 * typewriter effect, word-by-word reads like something composing a sentence.
 *
 * Progress is stamped with the text it belongs to, so a new sentence starts
 * from zero by derivation rather than by resetting state inside an effect.
 */
export function StreamingText({
  text,
  speed = 34,
  className = '',
  onDone,
  enabled = true,
}: {
  text: string
  speed?: number
  className?: string
  onDone?: () => void
  enabled?: boolean
}) {
  const words = useMemo(() => text.split(' '), [text])
  const [reduce] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const instant = !enabled || reduce

  const [progress, setProgress] = useState({ key: text, n: 0 })
  const revealed = instant ? words.length : progress.key === text ? progress.n : 0

  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  })

  useEffect(() => {
    if (instant) {
      doneRef.current?.()
      return
    }
    let i = 0
    const tick = window.setInterval(() => {
      i += 1
      setProgress({ key: text, n: i })
      if (i >= words.length) {
        window.clearInterval(tick)
        doneRef.current?.()
      }
    }, speed)
    return () => window.clearInterval(tick)
  }, [text, speed, instant, words.length])

  const shown = words.slice(0, revealed).join(' ')
  const streaming = revealed < words.length

  return (
    <span className={className}>
      {shown}
      {streaming && (
        <span
          aria-hidden="true"
          className="ml-[2px] inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-[var(--color-ochre)]"
          style={{ animation: 'ff-blink 1s steps(1) infinite' }}
        />
      )}
    </span>
  )
}

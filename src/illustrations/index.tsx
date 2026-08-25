/* ==========================================================================
   Instrument plates
   --------------------------------------------------------------------------
   Engraved line-work, drawn in Blue Ink, marked in Ochre. A family
   constitution is a navigational instrument: it does not tell you where you
   are, it tells you how to find out.
   ========================================================================== */

const BLUE = 'var(--color-blue-ink)'
const OCHRE = 'var(--color-ochre)'

type Progress = { portrait: boolean; practices: boolean; constitution: boolean }

/** Evenly spaced tick marks around a circle. */
function ticks(cx: number, cy: number, r: number, len: number, count: number, every = 1) {
  const out: React.ReactElement[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2
    const long = i % every === 0
    const l = long ? len : len * 0.5
    out.push(
      <line
        key={i}
        x1={cx + Math.cos(a) * r}
        y1={cy + Math.sin(a) * r}
        x2={cx + Math.cos(a) * (r - l)}
        y2={cy + Math.sin(a) * (r - l)}
        stroke={BLUE}
        strokeWidth={long ? 1.1 : 0.7}
        opacity={long ? 0.85 : 0.5}
      />,
    )
  }
  return out
}

/**
 * The cover plate. Three rings, one per section of the document; each closes
 * in ochre as its section is finished, so the instrument assembles itself
 * over the course of the three sessions.
 */
export function Astrolabe({
  progress,
  size = 232,
}: {
  progress: Progress
  size?: number
}) {
  const c = 120
  const rings: { r: number; done: boolean }[] = [
    { r: 100, done: progress.constitution },
    { r: 74, done: progress.practices },
    { r: 48, done: progress.portrait },
  ]
  const all = progress.portrait && progress.practices && progress.constitution

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      role="img"
      aria-label="Instrument plate showing how much of the document is finished"
    >
      <defs>
        <radialGradient id="plate" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="var(--color-paper)" />
          <stop offset="100%" stopColor="var(--color-paper-deep)" />
        </radialGradient>
      </defs>

      <circle cx={c} cy={c} r={112} fill="url(#plate)" stroke={BLUE} strokeWidth={1.4} />
      {ticks(c, c, 112, 7, 72, 6)}
      <circle cx={c} cy={c} r={104} stroke={BLUE} strokeWidth={0.7} opacity={0.55} />

      {rings.map(({ r, done }) => (
        <g key={r}>
          <circle
            cx={c}
            cy={c}
            r={r}
            stroke={done ? OCHRE : BLUE}
            strokeWidth={done ? 2.4 : 1.1}
            opacity={done ? 1 : 0.62}
            strokeDasharray={done ? undefined : '2.5 6'}
          />
          {done && (
            <circle
              cx={c + r * Math.cos(-Math.PI / 4)}
              cy={c + r * Math.sin(-Math.PI / 4)}
              r={3.4}
              fill={OCHRE}
            />
          )}
        </g>
      ))}

      {/* Rete — the pierced overlay that turns a plate into an instrument. */}
      <g stroke={BLUE} fill="none">
        <line x1={c} y1={c - 104} x2={c} y2={c + 104} strokeWidth={0.7} opacity={0.45} />
        <line x1={c - 104} y1={c} x2={c + 104} y2={c} strokeWidth={0.7} opacity={0.45} />
        {/* The ecliptic: off-center, which is the whole trick of the instrument. */}
        <circle cx={c} cy={c - 22} r={62} strokeWidth={1} opacity={0.7} />
        {/* Star pointers. */}
        <path
          d={`M ${c - 62} ${c + 62} L ${c - 30} ${c + 26}`}
          strokeWidth={1}
          opacity={0.6}
          strokeLinecap="round"
        />
        <path
          d={`M ${c + 60} ${c + 58} L ${c + 32} ${c + 24}`}
          strokeWidth={1}
          opacity={0.6}
          strokeLinecap="round"
        />
      </g>
      <circle cx={c - 62} cy={c + 62} r={2.2} fill={BLUE} opacity={0.75} />
      <circle cx={c + 60} cy={c + 58} r={2.2} fill={BLUE} opacity={0.75} />

      <circle cx={c} cy={c} r={all ? 6 : 3.6} fill={all ? OCHRE : BLUE} opacity={all ? 1 : 0.7} />
      {all && <circle cx={c} cy={c} r={11} stroke={OCHRE} strokeWidth={1} opacity={0.5} />}
    </svg>
  )
}

/** Portrait — a plumb line. Where a thing hangs from tells you what it is. */
export function PlumbMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <line x1="16" y1="3" x2="16" y2="19" stroke={BLUE} strokeWidth="1.1" />
      <line x1="8" y1="3" x2="24" y2="3" stroke={BLUE} strokeWidth="1.1" />
      <path d="M16 19 L20 24 L16 30 L12 24 Z" stroke={BLUE} strokeWidth="1.1" fill="none" />
      <circle cx="16" cy="24" r="1.5" fill={OCHRE} />
    </svg>
  )
}

/** Practices — an escapement. The part of a clock that decides what passes. */
export function EscapementMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="19" r="10" stroke={BLUE} strokeWidth="1.1" />
      <circle cx="16" cy="19" r="4" stroke={BLUE} strokeWidth="0.8" opacity="0.6" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <line
            key={i}
            x1={16 + Math.cos(a) * 10}
            y1={19 + Math.sin(a) * 10}
            x2={16 + Math.cos(a) * 13}
            y2={19 + Math.sin(a) * 13}
            stroke={BLUE}
            strokeWidth="1"
          />
        )
      })}
      <path d="M6 6 L16 12 L26 6" stroke={OCHRE} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Constitution — a compass rose. A direction chosen, not a place arrived at. */
export function RoseMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke={BLUE} strokeWidth="1.1" />
      <path d="M16 2 L19 16 L16 30 L13 16 Z" stroke={BLUE} strokeWidth="0.9" fill="none" />
      <path d="M2 16 L16 13 L30 16 L16 19 Z" stroke={BLUE} strokeWidth="0.9" fill="none" />
      <path d="M16 2 L19 16 L13 16 Z" fill={OCHRE} opacity="0.85" />
      <circle cx="16" cy="16" r="1.6" fill={BLUE} />
    </svg>
  )
}

/** The finished document — a seal. */
export function SealMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="14" r="9" stroke={BLUE} strokeWidth="1.1" />
      <circle cx="16" cy="14" r="5.5" stroke={OCHRE} strokeWidth="1.2" />
      <path d="M11 22 L9 31 L16 27 L23 31 L21 22" stroke={BLUE} strokeWidth="1.1" fill="none" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The assistant working. A dial searching for a reading — two rings turning
 * against each other, which is what an instrument does before it settles.
 */
export function Dial({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="29" stroke={BLUE} strokeWidth="0.8" opacity="0.3" />
      <g style={{ transformOrigin: '32px 32px', animation: 'ff-rotate 3.2s linear infinite' }}>
        <circle
          cx="32"
          cy="32"
          r="23"
          stroke={OCHRE}
          strokeWidth="1.6"
          strokeDasharray="30 115"
          strokeLinecap="round"
        />
        <circle cx="32" cy="9" r="2.4" fill={OCHRE} />
      </g>
      <g style={{ transformOrigin: '32px 32px', animation: 'ff-counter-rotate 5s linear infinite' }}>
        <circle
          cx="32"
          cy="32"
          r="15"
          stroke={BLUE}
          strokeWidth="1.2"
          strokeDasharray="18 76"
          strokeLinecap="round"
        />
      </g>
      <circle cx="32" cy="32" r="2" fill={BLUE} opacity="0.7" />
    </svg>
  )
}

/** A hairline rule with a small instrument tick at its center. */
export function RuleWithTick({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="9" viewBox="0 0 300 9" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="4.5" x2="140" y2="4.5" stroke="var(--color-rule-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <line x1="160" y1="4.5" x2="300" y2="4.5" stroke="var(--color-rule-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx="150" cy="4.5" r="2.4" fill={OCHRE} />
    </svg>
  )
}

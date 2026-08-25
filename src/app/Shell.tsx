import type { ReactNode } from 'react'

/**
 * The stage.
 *
 * On a phone this is simply the screen. On a laptop it becomes a held
 * device on a darker sheet of paper, so the thing can be reviewed at a desk
 * without pretending to be a desktop app. Nothing about the app's own
 * layout changes between the two.
 */
export function Shell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="app-stage flex min-h-full w-full flex-col items-center bg-[var(--color-paper-deep)] md:justify-center md:py-8">
      <div
        className="
          app-frame paper-grain relative flex w-full flex-col overflow-hidden bg-[var(--color-paper)]
          min-h-[100dvh]
          md:h-[min(880px,92dvh)] md:min-h-0 md:w-[430px] md:rounded-[34px]
          md:border md:border-[var(--color-rule-strong)]
          md:shadow-[0_2px_0_0_rgba(37,35,33,0.08),0_40px_90px_-50px_rgba(37,35,33,0.85)]
        "
      >
        {children}
      </div>
      {aside && <div className="hidden w-[430px] pt-4 md:block">{aside}</div>}
    </div>
  )
}

/** A screen inside the stage: scrolls independently, footer pinned. */
export function Screen({
  children,
  footer,
  className = '',
}: {
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <div className="relative z-1 flex min-h-0 flex-1 flex-col">
      <div className={`scroll-quiet min-h-0 flex-1 overflow-y-auto ${className}`}>{children}</div>
      {footer && (
        <div className="relative z-1 shrink-0 border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </div>
  )
}

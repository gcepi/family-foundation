import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Honest stubs.
 *
 * Buttons that will one day send, save, or sync do nothing yet — but they
 * say what they will do rather than failing silently. Reviewers should be
 * able to tell the difference between "not built" and "broken".
 */
const StubContext = createContext<(message: string) => void>(() => {})

export function StubProvider({ children }: { children: ReactNode }) {
  const [note, setNote] = useState<{ id: number; message: string } | null>(null)

  const stub = useCallback((message: string) => {
    const id = Date.now()
    setNote({ id, message })
    window.setTimeout(() => setNote((n) => (n?.id === id ? null : n)), 3400)
  }, [])

  return (
    <StubContext.Provider value={stub}>
      {children}
      <AnimatePresence>
        {note && (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-x-5 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50"
            role="status"
          >
            <div className="surface-raised flex items-start gap-3 px-4 py-3">
              <span className="mt-[3px] shrink-0">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.6" stroke="var(--color-blue-ink)" strokeWidth="1.2" />
                  <path d="M8 4.8 v4" stroke="var(--color-blue-ink)" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.85" fill="var(--color-blue-ink)" />
                </svg>
              </span>
              <p className="type-caption text-[var(--color-ink)]">{note.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StubContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStub = () => useContext(StubContext)

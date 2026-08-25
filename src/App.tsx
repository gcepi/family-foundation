import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { StoreProvider, useStore } from '~/app/store'
import { StubProvider } from '~/components/Stub'
import { Shell } from '~/app/Shell'
import { Cover } from '~/app/Cover'
import { Setup } from '~/app/Setup'
import { Document } from '~/document/Document'
import { PracticesPopup } from '~/activities/PracticesPopup'
import { ValuesPopup } from '~/activities/ValuesPopup'

/**
 * Two stages and an overlay.
 *
 * Cover and document are not two screens in a stack — they are the outside
 * and the inside of the same object, so they trade places rather than
 * sliding past each other.
 */
function Stages() {
  const { nav } = useStore()

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col">
      <AnimatePresence initial={false}>
        {nav.stage === 'cover' && (
          <motion.div
            key="cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col"
          >
            <Cover />
          </motion.div>
        )}

        {nav.stage === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col"
          >
            <Setup />
          </motion.div>
        )}

        {nav.stage === 'document' && (
          <motion.div
            key="document"
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.985 }}
            transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col"
          >
            <Document />
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {nav.activity === 'practices' && <PracticesPopup key="a-practices" />}
        {nav.activity === 'values' && <ValuesPopup key="a-values" />}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    /* reducedMotion="user" hands the whole app over to the operating
       system setting — the CSS media query alone cannot reach animations
       framer-motion drives in JavaScript. */
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <Shell>
          <StubProvider>
            <Stages />
          </StubProvider>
        </Shell>
      </StoreProvider>
    </MotionConfig>
  )
}

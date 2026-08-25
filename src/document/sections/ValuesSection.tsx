import { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { useStore } from '~/app/store'
import { AssistantReveal } from '~/components/Assistant'
import { InlineEdit } from '~/components/InlineEdit'
import { ArrowRight } from '~/components/Bits'
import { valueById } from '~/data/values'
import { composeTelos, think } from '~/lib/assistant'

/**
 * After the sort, the values come home to the document.
 *
 * The sorting experience does not live here — it happened once, in its own
 * card, and what remains is the result: a list the family can still argue
 * about by dragging, and a paragraph they can edit.
 */
export function ValuesSection() {
  const { doc, dispatch, openActivity } = useStore()

  if (!doc.valueRanking.length) {
    return (
      <div>
        <p className="type-caption mb-5 max-w-[34ch]">
          Two values at a time. Choose the one that matters more, and keep choosing until they
          are all in order.
        </p>
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => openActivity('values')}
        >
          Sort your values
          <ArrowRight />
        </button>
      </div>
    )
  }

  return (
    <div>
      <SortedList />
      <TelosBlock />
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'setRanking', ranking: [] })
          dispatch({ type: 'setTelos', telos: '' })
          openActivity('values')
        }}
        className="type-caption mt-6 underline decoration-[var(--color-rule-strong)] underline-offset-4 transition-colors hover:text-[var(--color-ink)]"
      >
        Sort again
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function SortedList() {
  const { doc, dispatch } = useStore()

  return (
    <Reorder.Group
      axis="y"
      values={doc.valueRanking}
      onReorder={(next) => dispatch({ type: 'setRanking', ranking: next })}
      className="flex list-none flex-col gap-2"
    >
      {doc.valueRanking.map((id, i) => (
        <ValueRow key={id} id={id} isTop={i < 3} />
      ))}
    </Reorder.Group>
  )
}

function ValueRow({ id, isTop }: { id: string; isTop: boolean }) {
  const controls = useDragControls()
  const v = valueById(id)
  if (!v) return null

  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: isTop ? 'var(--color-ochre-wash)' : 'var(--color-paper-dark)',
        border: `1px solid ${
          isTop ? 'color-mix(in srgb, var(--color-ochre) 40%, transparent)' : 'var(--color-rule)'
        }`,
        borderRadius: 'var(--radius-card)',
      }}
    >
      <span className="min-w-0 flex-1">
        <span className="type-h3 block leading-snug">{v.title}</span>
      </span>
      <button
        type="button"
        aria-label={`Move ${v.title}`}
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab touch-none px-1 py-1 text-[var(--color-muted)] opacity-50 transition-opacity hover:opacity-100 active:cursor-grabbing"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
          <path d="M1 3h12M1 9h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </Reorder.Item>
  )
}

/* -------------------------------------------------------------------------- */

/**
 * Written once, when the sort finishes, and never again on its own. Dragging
 * the list afterwards is the family's edit to make, not the machine's — so
 * there is no regenerate button here.
 */
function TelosBlock() {
  const { doc, dispatch } = useStore()
  const [pending, setPending] = useState(!doc.telosSummary)

  useEffect(() => {
    if (doc.telosSummary || !doc.valueRanking.length) return
    let live = true
    think(() => composeTelos(doc.valueRanking, doc.origin.familyName), 2200).then((text) => {
      if (!live) return
      dispatch({ type: 'setTelos', telos: text })
      setPending(false)
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!pending && !doc.telosSummary) return null

  return (
    <div className="mt-8">
      {pending ? (
        <AssistantReveal
          pending
          text=""
          eyebrow="Your top three, read back"
          thinkingLabel="Looking at the order you chose"
        />
      ) : (
        <div className="relative pl-4">
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-0 w-[2px] rounded-full bg-[var(--color-blue-ink)] opacity-30"
          />
          <p className="type-eyebrow mb-2" style={{ color: 'var(--color-blue-ink)' }}>
            Your top three, read back
          </p>
          <p className="prose-editorial">
            <InlineEdit
              value={doc.telosSummary}
              onChange={(v) => dispatch({ type: 'setTelos', telos: v })}
              label="Your telos"
            />
          </p>
        </div>
      )}
    </div>
  )
}

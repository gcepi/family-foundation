import { useEffect, useRef, useState } from 'react'
import { useStore } from '~/app/store'
import { PracticeCards } from '~/document/PracticeCards'
import { FoodForThought } from '~/components/FoodForThought'
import { composeBargain, composePracticesReflection, think } from '~/lib/assistant'

const uid = () => Math.random().toString(36).slice(2, 10)

/**
 * The practices, back in the document.
 *
 * The cards are the record of what the family weighed. The reading beneath
 * them is the assistant's, and the button under that is how it becomes the
 * family's Praxis — once, as text they then own.
 */
export function PracticesSection({ onApplyToPraxis }: { onApplyToPraxis: () => void }) {
  const { doc, openActivity } = useStore()

  if (!doc.practices.length || !doc.completed.practices) {
    return (
      <button
        type="button"
        className="btn btn-primary w-full"
        onClick={() => openActivity('practices')}
      >
        {doc.practices.length ? 'Continue' : 'Start Activity'}
      </button>
    )
  }

  return (
    <div>
      <PracticeCards />
      <AddPractice />
      <div className="mt-8">
        <Reading onApplyToPraxis={onApplyToPraxis} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

/** Beyond the one-per-participant round, families keep thinking of more. */
function AddPractice() {
  const { dispatch, openActivity } = useStore()
  const [open, setOpen] = useState(false)
  const [thing, setThing] = useState('')
  const [relief, setRelief] = useState('')

  const ready = thing.trim() && relief.trim()

  const add = () => {
    /* No participant is attached to a practice added by hand. The assistant
       falls back to language that does not assume who is speaking. */
    const practice = {
      id: uid(),
      participantId: '',
      thing: thing.trim(),
      relief: relief.trim(),
      bargain: null,
      decision: 'pending' as const,
    }
    dispatch({ type: 'addPractice', practice: { ...practice, bargain: composeBargain(practice) } })
    setThing('')
    setRelief('')
    setOpen(false)
    openActivity('practices')
  }

  if (!open) {
    /* Two ways back in. Quick add is for a family that already knows the
       shape of the bargain and just thought of another one; Learn more is
       for the one that wants to read the teaching again — one page, and
       straight back here. */
    return (
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-ghost flex-1 !py-2.5 !text-[0.85rem]"
        >
          Quick add
        </button>
        <button
          type="button"
          onClick={() => openActivity('practices', 'primer')}
          className="btn btn-ghost flex-1 !py-2.5 !text-[0.85rem]"
        >
          Learn more
        </button>
      </div>
    )
  }

  return (
    <div className="surface mt-4 flex flex-col gap-4 p-4">
      <div>
        <label className="type-eyebrow mb-1.5 block">I want to automate…</label>
        <textarea
          className="field-area"
          rows={2}
          value={thing}
          onChange={(e) => setThing(e.target.value)}
        />
      </div>

      <div>
        <label className="type-eyebrow mb-1.5 block">So I'll no longer have to…</label>
        <textarea
          className="field-area"
          rows={2}
          value={relief}
          onChange={(e) => setRelief(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-ghost flex-1 !py-2.5 !text-[0.85rem]"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary flex-1 !py-2.5 !text-[0.85rem]"
          disabled={!ready}
          onClick={add}
        >
          Consider tradeoffs
        </button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function Reading({ onApplyToPraxis }: { onApplyToPraxis: () => void }) {
  const { doc, dispatch } = useStore()
  const [pending, setPending] = useState(!doc.practicesReflection)

  /**
   * The reading follows the cards.
   *
   * Add a bargain or change one from kept to refused and this is no longer
   * about the same thing, so it is written again. Keyed on what the cards
   * actually are rather than on mounting, because a family coming back
   * through the activity never leaves this part of the page.
   */
  const signature = doc.practices.map((p) => `${p.id}:${p.decision}`).join('|')
  const wroteFor = useRef<string | null>(doc.practicesReflection ? signature : null)

  useEffect(() => {
    if (!doc.practices.length || wroteFor.current === signature) return
    wroteFor.current = signature
    setPending(true)
    let live = true
    think(
      () => composePracticesReflection(doc.practices, doc.participants, doc.origin.familyName),
      2000,
    ).then((text) => {
      if (!live) return
      dispatch({ type: 'setPracticesReflection', text })
      setPending(false)
    })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  return (
    <FoodForThought
      pending={pending}
      text={doc.practicesReflection}
      onChange={(v) => dispatch({ type: 'setPracticesReflection', text: v })}
      thinkingLabel="Reading back what you kept and refused"
      actions={
        <button
          type="button"
          className="btn btn-ghost !py-2 !text-[0.82rem]"
          onClick={() => {
            dispatch({ type: 'setPraxis', text: doc.practicesReflection })
            onApplyToPraxis()
          }}
        >
          Apply to Praxis
        </button>
      }
    />
  )
}

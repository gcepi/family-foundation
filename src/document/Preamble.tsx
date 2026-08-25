import { useStore } from '~/app/store'
import { Blank } from '~/components/Bits'
import { InlineEdit } from '~/components/InlineEdit'

type Field = 'familyName' | 'startedWhere' | 'startedWhen' | 'startedWhy' | 'livesIn'

/**
 * One filled space in the origin sentence.
 *
 * Declared out here rather than inside Preamble on purpose: a component
 * created during render is a new component every render, which would remount
 * the editable span on every keystroke and throw the caret back to the start.
 */
function Slot({
  value,
  width,
  onChange,
  label,
  editable,
}: {
  value: string
  width: string
  onChange: (v: string) => void
  label: string
  editable: boolean
}) {
  if (editable && value.trim()) {
    return <InlineEdit value={value} onChange={onChange} label={label} />
  }
  return <Blank value={value} width={width} />
}

/**
 * The origin sentence.
 *
 * Read-only while the family is still answering the questions; editable once
 * it is theirs, so correcting a word is a matter of tapping it rather than
 * reopening the activity that produced it.
 */
export function Preamble({ editable = false }: { editable?: boolean }) {
  const { doc, dispatch } = useStore()
  const o = doc.origin
  const names = o.memberNames

  const set = (field: Field) => (value: string) =>
    dispatch({ type: 'patchOrigin', patch: { [field]: value } })

  const setName = (i: number) => (value: string) => {
    const next = [...names]
    next[i] = value
    dispatch({ type: 'patchOrigin', patch: { memberNames: next } })
  }

  return (
    <p className="prose-editorial !text-[1.2rem] !leading-[1.75]">
      The{' '}
      <Slot
        editable={editable}
        value={o.familyName}
        width="8ch"
        onChange={set('familyName')}
        label="Family name"
      />{' '}
      family began in{' '}
      <Slot
        editable={editable}
        value={o.startedWhere}
        width="9ch"
        onChange={set('startedWhere')}
        label="Where the family started"
      />{' '}
      when{' '}
      <Slot
        editable={editable}
        value={o.startedWhen}
        width="11ch"
        onChange={set('startedWhen')}
        label="When the family started"
      />
      . Together, they started a family because{' '}
      <Slot
        editable={editable}
        value={o.startedWhy}
        width="13ch"
        onChange={set('startedWhy')}
        label="Why the family started"
      />
      . Today,{' '}
      {names.length ? (
        names.map((n, i) => (
          <span key={i}>
            {i > 0 && ', '}
            <Slot
              editable={editable}
              value={n}
              width="6ch"
              onChange={setName(i)}
              label={`Family member ${i + 1}`}
            />
          </span>
        ))
      ) : (
        <>
          <Blank width="6ch" />, <Blank width="6ch" />, <Blank width="6ch" />
        </>
      )}{' '}
      live in{' '}
      <Slot
        editable={editable}
        value={o.livesIn}
        width="9ch"
        onChange={set('livesIn')}
        label="Where the family lives"
      />
      .
    </p>
  )
}

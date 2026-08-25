import { useEffect, useRef } from 'react'

/**
 * A word in a sentence the family can write over.
 *
 * The refusal statement is a sentence the assistant drafted and the family
 * has to sign. Editing it inside the sentence — rather than in a form under
 * it — keeps the fact that these are their words, not the machine's, in
 * front of them while they change them.
 */
export function InlineEdit({
  value,
  onChange,
  placeholder = '…',
  label,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  label?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  /* Written once on mount and whenever a new draft arrives from outside.
     Never on every keystroke — that would fight the caret. */
  useEffect(() => {
    const el = ref.current
    if (el && el.textContent !== value && document.activeElement !== el) {
      el.textContent = value
    }
  }, [value])

  return (
    <span
      ref={ref}
      role="textbox"
      tabIndex={0}
      aria-label={label}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      className="inline-edit"
      onInput={(e) => onChange(e.currentTarget.textContent ?? '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).blur()
        }
      }}
    />
  )
}

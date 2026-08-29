import { useRef } from 'react'
import { useStore } from '~/app/store'

/** Longest edge after downscaling. Enough for a cover at 3x, small enough
    that a photo does not fill the browser's storage quota on its own. */
const MAX_EDGE = 1200
const QUALITY = 0.72

/**
 * The family, on the day.
 *
 * `capture` asks a phone for the camera rather than the photo library, so
 * the family takes the picture in the room instead of hunting for an old
 * one. Everything is downscaled and re-encoded before it is stored — a
 * modern phone photo is several megabytes and would blow the storage quota.
 */
export function FamilyPhoto() {
  const { doc, dispatch } = useStore()
  const input = useRef<HTMLInputElement>(null)

  const receive = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        dispatch({ type: 'setPhoto', photo: canvas.toDataURL('image/jpeg', QUALITY) })
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative">
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Add a family photo"
        onChange={(e) => {
          receive(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {doc.photo ? (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-rule-strong)]">
          <img src={doc.photo} alt="The family" className="block aspect-[4/3] w-full object-cover" />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="absolute right-2.5 bottom-2.5 rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper)] px-3 py-1.5 text-[0.75rem] font-medium shadow-sm transition-colors hover:bg-[var(--color-paper-dark)]"
          >
            Retake
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-rule-strong)] bg-[var(--color-paper-dark)] transition-colors hover:border-[var(--color-ochre)]"
        >
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect
              x="2.5"
              y="8"
              width="27"
              height="19"
              rx="3"
              stroke="var(--color-blue-ink)"
              strokeWidth="1.4"
            />
            <path
              d="M11 8l1.6-3h6.8L21 8"
              stroke="var(--color-blue-ink)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="17.5" r="5.5" stroke="var(--color-blue-ink)" strokeWidth="1.4" />
            <circle cx="16" cy="17.5" r="1.8" fill="var(--color-ochre)" />
          </svg>
          <span className="type-caption font-medium text-[var(--color-ink)]">Add a photo</span>
        </button>
      )}
    </div>
  )
}

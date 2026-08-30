import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import {
  emptyDocument,
  type FamilyDocument,
  type PanelId,
  type Participant,
  type Practice,
  type SectionId,
} from '~/lib/types'

/* Bumped whenever the document shape changes underneath it — a draft in the
   old shape would otherwise half-load into the new one. */
const STORAGE_KEY = 'family-foundation.draft.v3'

/* ==========================================================================
   Actions
   ========================================================================== */

type Action =
  | { type: 'setParticipants'; participants: Participant[]; familyName: string }
  | { type: 'setPhoto'; photo: string | null }
  | { type: 'patchOrigin'; patch: Partial<FamilyDocument['origin']> }
  | { type: 'setOriginStep'; step: number }
  | { type: 'completeOrigin' }
  | { type: 'setPractices'; practices: Practice[] }
  | { type: 'addPractice'; practice: Practice }
  | { type: 'patchPractice'; id: string; patch: Partial<Practice> }
  | { type: 'setPracticeOrder'; order: string[] }
  | { type: 'completePractices' }
  | { type: 'setPracticesReflection'; text: string }
  | { type: 'setValuesReflection'; text: string }
  | { type: 'setPraxis'; text: string }
  | { type: 'setTelos'; text: string }
  | { type: 'setRanking'; ranking: string[] }
  | { type: 'completeValues' }
  | { type: 'completeDocument' }
  | { type: 'setPrompt'; id: string; text: string }
  | { type: 'setSignature'; id: string; name: string }
  | { type: 'setCreatedOn'; date: string }
  | { type: 'togglePanel'; panel: PanelId }
  | { type: 'openPanel'; panel: PanelId }
  | { type: 'focusPanel'; open: PanelId[] }
  | { type: 'collapseAllExcept'; keep: PanelId[] }
  | { type: 'reset' }

function reducer(state: FamilyDocument, action: Action): FamilyDocument {
  switch (action.type) {
    case 'setParticipants':
      return {
        ...state,
        participants: action.participants,
        origin: { ...state.origin, familyName: action.familyName },
        completed: { ...state.completed, setup: action.participants.length > 0 },
      }
    case 'setPhoto':
      return { ...state, photo: action.photo }
    case 'patchOrigin':
      return { ...state, origin: { ...state.origin, ...action.patch } }
    case 'setOriginStep':
      return { ...state, originStep: action.step }
    case 'completeOrigin':
      return { ...state, completed: { ...state.completed, origin: true } }
    /* The reading is about the cards. New cards make the old reading wrong,
       so it is cleared and written again rather than left standing. */
    case 'setPractices':
      return {
        ...state,
        practices: action.practices,
        practiceOrder: action.practices.map((p) => p.id),
        practicesReflection: '',
      }
    case 'addPractice':
      return {
        ...state,
        practices: [...state.practices, action.practice],
        practiceOrder: [...state.practiceOrder, action.practice.id],
        practicesReflection: '',
      }
    case 'patchPractice':
      return {
        ...state,
        practices: state.practices.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      }
    case 'setPracticeOrder':
      return { ...state, practiceOrder: action.order }
    case 'completePractices':
      return { ...state, completed: { ...state.completed, practices: true } }
    case 'setPracticesReflection':
      return { ...state, practicesReflection: action.text }
    case 'setValuesReflection':
      return { ...state, valuesReflection: action.text }
    case 'setPraxis':
      return { ...state, praxisStatement: action.text }
    case 'setTelos':
      return { ...state, telosStatement: action.text }
    case 'setRanking':
      return { ...state, valueRanking: action.ranking }
    case 'completeValues':
      return { ...state, completed: { ...state.completed, values: true } }
    case 'completeDocument':
      return { ...state, completed: { ...state.completed, document: true } }
    case 'setPrompt':
      return { ...state, prompts: { ...state.prompts, [action.id]: action.text } }
    case 'setSignature':
      return { ...state, signatures: { ...state.signatures, [action.id]: action.name } }
    case 'setCreatedOn':
      return { ...state, createdOn: action.date }
    case 'togglePanel':
      return {
        ...state,
        expanded: state.expanded.includes(action.panel)
          ? state.expanded.filter((p) => p !== action.panel)
          : [...state.expanded, action.panel],
      }
    /* Navigation between sections collapses everything and opens exactly
       what was asked for — a sub-section and the parent it lives inside, or
       a whole section on its own. Manual chevrons are untouched by this. */
    case 'focusPanel':
      return { ...state, expanded: [...new Set(action.open)] }
    case 'collapseAllExcept':
      return { ...state, expanded: state.expanded.filter((p) => action.keep.includes(p)) }
    case 'openPanel':
      return {
        ...state,
        expanded: state.expanded.includes(action.panel)
          ? state.expanded
          : [...state.expanded, action.panel],
      }
    case 'reset':
      return emptyDocument()
    default:
      return state
  }
}

/* ==========================================================================
   Navigation
   --------------------------------------------------------------------------
   Two stages, and they are deliberately not the same surface. The cover is
   a place you leave; the document is a place you are inside of. Going back
   to the cover is not scrolling to the top of the document.
   ========================================================================== */

export type Stage = 'cover' | 'setup' | 'document' | 'prompts'

/** Each session's activity takes the screen as its own card. */
export type ActivityId = 'origin' | 'practices' | 'values' | null

/** 'primer' opens the teaching page on its own, with nothing to complete. */
export type ActivityMode = 'run' | 'primer'

/** The document, shown as the family will take it away. */
export type SheetId = 'text' | 'pdf' | null

type Nav = {
  stage: Stage
  /** Where the document should land when it opens. Consumed once. */
  jumpTo: SectionId | null
  activity: ActivityId
  /** Which take-away sheet is open over everything, if any. */
  sheet: SheetId
  /**
   * How the activity opens.
   *
   * "Learn more" is a request to read the teaching again, not to redo the
   * activity, so it opens a single page and closes back to where it came
   * from without touching the family's answers.
   */
  activityMode: ActivityMode
}

/* ==========================================================================
   Context
   ========================================================================== */

type Store = {
  doc: FamilyDocument
  dispatch: React.Dispatch<Action>
  nav: Nav
  goCover: () => void
  goSetup: () => void
  goPrompts: () => void
  openDocument: (section?: SectionId) => void
  clearJump: () => void
  openActivity: (id: Exclude<ActivityId, null>, mode?: ActivityMode) => void
  openSheet: (id: Exclude<SheetId, null>) => void
  closeSheet: () => void
  closeActivity: () => void
  unlocked: (section: SectionId) => boolean
  isOpen: (panel: PanelId) => boolean
  participantName: (id: string) => string
}

const StoreContext = createContext<Store | null>(null)

function load(): FamilyDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDocument()
    const parsed = JSON.parse(raw)
    const base = emptyDocument()
    return { ...base, ...parsed, completed: { ...base.completed, ...parsed.completed } }
  } catch {
    return emptyDocument()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [doc, dispatch] = useReducer(reducer, undefined, load)
  const [nav, setNav] = useState<Nav>({
    stage: 'cover',
    jumpTo: null,
    activity: null,
    activityMode: 'run',
    sheet: null,
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
    } catch {
      /* A full or private-mode storage is not worth interrupting a session over. */
    }
  }, [doc])

  const goCover = useCallback(
    () => setNav((n) => ({ ...n, stage: 'cover', activity: null, jumpTo: null })),
    [],
  )
  const goSetup = useCallback(() => setNav((n) => ({ ...n, stage: 'setup', activity: null })), [])
  const goPrompts = useCallback(() => setNav((n) => ({ ...n, stage: 'prompts', activity: null })), [])
  const openDocument = useCallback(
    (section?: SectionId) =>
      setNav((n) => ({ ...n, stage: 'document', jumpTo: section ?? null, activity: null })),
    [],
  )
  const clearJump = useCallback(() => setNav((n) => ({ ...n, jumpTo: null })), [])
  const openActivity = useCallback((id: Exclude<ActivityId, null>, mode: ActivityMode = 'run') => {
    /* Everything else folds away while an activity runs, so closing it
       returns the family to one open section rather than the whole page.
       Reading the teaching again is not running the activity, so the page
       underneath is left exactly as it was. */
    if (mode === 'run') dispatch({ type: 'collapseAllExcept', keep: [] })
    setNav((n) => ({ ...n, activity: id, activityMode: mode }))
  }, [])
  const closeActivity = useCallback(() => setNav((n) => ({ ...n, activity: null })), [])
  const openSheet = useCallback(
    (id: Exclude<SheetId, null>) => setNav((n) => ({ ...n, sheet: id })),
    [],
  )
  const closeSheet = useCallback(() => setNav((n) => ({ ...n, sheet: null })), [])

  const unlocked = useCallback(
    (section: SectionId) => {
      switch (section) {
        case 'portrait':
          return doc.completed.setup
        case 'practices':
          return doc.completed.origin
        case 'values':
          return doc.completed.practices
        /* The signatures epilogue is never shown greyed. It is not a locked
           section the family scrolls past — it simply appears once earned. */
        case 'signatures':
          return doc.completed.values
        default:
          return false
      }
    },
    [doc.completed],
  )

  const isOpen = useCallback((panel: PanelId) => doc.expanded.includes(panel), [doc.expanded])

  const participantName = useCallback(
    (id: string) => doc.participants.find((p) => p.id === id)?.name ?? 'Someone',
    [doc.participants],
  )

  const value = useMemo<Store>(
    () => ({
      doc,
      dispatch,
      nav,
      goCover,
      goSetup,
      goPrompts,
      openDocument,
      clearJump,
      openActivity,
      closeActivity,
      openSheet,
      closeSheet,
      unlocked,
      isOpen,
      participantName,
    }),
    [
      doc,
      nav,
      goCover,
      goSetup,
      goPrompts,
      openDocument,
      clearJump,
      openActivity,
      closeActivity,
      openSheet,
      closeSheet,
      unlocked,
      isOpen,
      participantName,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

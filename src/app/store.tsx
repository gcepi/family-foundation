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
  type Participant,
  type Practice,
  type SectionId,
} from '~/lib/types'

const STORAGE_KEY = 'family-foundation.draft.v1'

/* ==========================================================================
   Actions
   ========================================================================== */

type Action =
  | { type: 'setParticipants'; participants: Participant[]; familyName: string }
  | { type: 'patchOrigin'; patch: Partial<FamilyDocument['origin']> }
  | { type: 'completeOrigin' }
  | { type: 'setPractices'; practices: Practice[] }
  | { type: 'patchPractice'; id: string; patch: Partial<Practice> }
  | { type: 'setPracticeOrder'; order: string[] }
  | { type: 'completePractices' }
  | { type: 'setPraxis'; reflection?: string; statement?: string }
  | { type: 'completePraxis' }
  | { type: 'setRanking'; ranking: string[] }
  | { type: 'setTelos'; telos: string }
  | { type: 'completeConstitution' }
  | { type: 'reset' }
  | { type: 'hydrate'; doc: FamilyDocument }

function reducer(state: FamilyDocument, action: Action): FamilyDocument {
  switch (action.type) {
    case 'setParticipants':
      return {
        ...state,
        participants: action.participants,
        origin: { ...state.origin, familyName: action.familyName },
        completed: { ...state.completed, setup: action.participants.length > 0 },
      }
    case 'patchOrigin':
      return { ...state, origin: { ...state.origin, ...action.patch } }
    case 'completeOrigin':
      return { ...state, completed: { ...state.completed, origin: true } }
    case 'setPractices':
      return {
        ...state,
        practices: action.practices,
        practiceOrder: action.practices.map((p) => p.id),
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
    case 'setPraxis':
      return {
        ...state,
        praxisReflection: action.reflection ?? state.praxisReflection,
        praxisStatement: action.statement ?? state.praxisStatement,
      }
    case 'completePraxis':
      return { ...state, completed: { ...state.completed, praxis: true } }
    case 'setRanking':
      return { ...state, valueRanking: action.ranking }
    case 'setTelos':
      return { ...state, telosSummary: action.telos }
    case 'completeConstitution':
      return { ...state, completed: { ...state.completed, constitution: true } }
    case 'reset':
      return emptyDocument()
    case 'hydrate':
      return action.doc
    default:
      return state
  }
}

/* ==========================================================================
   Navigation
   --------------------------------------------------------------------------
   Two stages, and they are deliberately not the same surface. The cover is
   a place you leave; the document is a place you are inside of. Going back
   to the cover is not scrolling to the top of the document — the PRD is
   emphatic about that separation and the whole app is built around it.
   ========================================================================== */

export type Stage = 'cover' | 'setup' | 'document'

export type ActivityId =
  | 'origin'
  | 'brainstorm'
  | 'practices'
  | 'bargains'
  | 'arrange'
  | 'praxis'
  | 'values'
  | null

type Nav = {
  stage: Stage
  /** Where the document should land when it opens. Consumed once. */
  jumpTo: SectionId | null
  activity: ActivityId
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
  openDocument: (section?: SectionId) => void
  clearJump: () => void
  openActivity: (id: Exclude<ActivityId, null>) => void
  closeActivity: () => void
  /** Prototype affordance: ignore sequential locking so any screen is reviewable. */
  freeNav: boolean
  setFreeNav: (v: boolean) => void
  unlocked: (section: SectionId) => boolean
  participantName: (id: string) => string
}

const StoreContext = createContext<Store | null>(null)

function load(): FamilyDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDocument()
    const parsed = JSON.parse(raw)
    return { ...emptyDocument(), ...parsed, completed: { ...emptyDocument().completed, ...parsed.completed } }
  } catch {
    return emptyDocument()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [doc, dispatch] = useReducer(reducer, undefined, load)
  const [nav, setNav] = useState<Nav>({ stage: 'cover', jumpTo: null, activity: null })
  const [freeNav, setFreeNav] = useState(false)

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
  const goSetup = useCallback(
    () => setNav((n) => ({ ...n, stage: 'setup', activity: null })),
    [],
  )
  const openDocument = useCallback(
    (section?: SectionId) =>
      setNav((n) => ({ ...n, stage: 'document', jumpTo: section ?? null, activity: null })),
    [],
  )
  const clearJump = useCallback(() => setNav((n) => ({ ...n, jumpTo: null })), [])
  const openActivity = useCallback(
    (id: Exclude<ActivityId, null>) => setNav((n) => ({ ...n, activity: id })),
    [],
  )
  const closeActivity = useCallback(() => setNav((n) => ({ ...n, activity: null })), [])

  const unlocked = useCallback(
    (section: SectionId) => {
      if (freeNav) return true
      switch (section) {
        case 'portrait':
          return doc.completed.setup
        case 'practices':
          return doc.completed.origin
        case 'constitution':
          return doc.completed.practices
        case 'covenant':
          return doc.completed.constitution
        default:
          return false
      }
    },
    [doc.completed, freeNav],
  )

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
      openDocument,
      clearJump,
      openActivity,
      closeActivity,
      freeNav,
      setFreeNav,
      unlocked,
      participantName,
    }),
    [doc, nav, goCover, goSetup, openDocument, clearJump, openActivity, closeActivity, freeNav, unlocked, participantName],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

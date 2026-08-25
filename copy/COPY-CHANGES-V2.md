# Copy changes since COPY.md was generated

Read this next to the copy map you're editing. Your edits still apply — most
strings are untouched. This lists only what moved, vanished, or is new, so you
don't lose work reconciling it.

---

## Gone — don't spend time editing these

| Anchor | Was | Why |
| --- | --- | --- |
| `#cover-prototype-eyebrow` | Prototype | Section removed entirely |
| `#cover-freenav-label` | Review mode — open every section… | Removed |
| `#cover-startover-link` | Start over | Removed |
| `#cover-startover-confirm` | Clear everything this family has written…? | Removed |
| `#doc-praxis-locked` / `#doc-telos-locked` | Not yet. This one is written later. | Locked parts now grey out with no message |
| `#doc-practices-lockednote` etc. | Finish the Origin activity first. | Locked sections collapse to a bare heading |
| `#doc-origin-revisit` | Tell it again | Origin is edited in place now |
| `#doc-praxis-revisit` | Rewrite it | Same |
| `#finished-closing-note` | Nothing here is final. Families change… | Removed |
| `#telos-regenerate-btn` | Regenerate | AI writes once, by design |
| `#telos-edit-btn` | Edit | Text is directly editable, so no mode toggle |
| `#values-instruction` | Send one up to claim a place near the top… | Bottom help text removed |
| `#values-prompt-repeat` | And now? | Replaced by a constant instruction |
| `#praxis-stem` | Our family will hand over ______ so that… | Replaced by four questions (below) |
| `#origin-intro-h2` / `#origin-intro-p1` / `#origin-intro-p2` / `#origin-intro-instr-*` | The Origin intro screen | The intro screen is gone; Origin starts at the questions |
| `#practices-done-h2` / `#practices-done-caption` / `#practices-done-btn` | What you decided… | The card grid moved to the document |

---

## Reworded — your edits to these may need a second look

| Anchor | Was | Now |
| --- | --- | --- |
| `#origin-handoff-next-btn` | They have it | **Continue** |
| `#origin-who-next-btn`, `#origin-beginnings-next-btn` | Next | **Next** (unchanged) |
| `#origin-preamble-finish-btn` | Write it into the document | **Save** |
| `#practices-brainstorm-next-btn` | Everyone has their favorite | **Continue** |
| `#practices-input-done-btn` | Everyone has answered | **Next** |
| `#practices-primer-next-btn` | Show us the rest of the bargain | **Continue** |
| `#practices-timer-done` | Time. Everyone circle one. | **Time's up.** |
| `#practices-decide-decline-btn` | No deal | **Refuse** |
| `#practices-decide-accept-btn` | We'll take it | **Accept** |
| `#practices-refuse-confirm-btn` | That's ours | **Save** |
| `#card-detail-taken-status` | Taken · {name} | **Accepted · {name}** |
| `#doc-origin-begin-btn` | Start the Origin activity | **Start** |
| `#doc-practices-begin-btn` | Start the Practices activity | **Start** / **Continue** |
| `#telos-finish-btn` | Write it into the document | *(gone — the sort saves itself)* |
| `#finished-save-btn` | Save a copy | **Download PDF** |
| `#finished-send-btn` | Send it home | **Email to the family** |
| `#doc-portrait-blurb` | A portrait needs three things: where the subject came from… | **Where the family came from, how it carries itself, and what it is looking at.** |
| `#doc-practices-blurb` | …These are the trades you looked at squarely, and what you decided about each one. | *(dropped "squarely")* |
| `#doc-constitution-blurb` | Self-direction is only one of the things worth protecting. Here is where your family says which ones… | **Which values your family would protect when protecting them costs something.** |

---

## New — needs your prose

### Values sort
- **Instruction, always at the top** `#values-instruction-top` → Sort the following values into priority order using the arrows on each card.
- **Line hovering above the card pair** *(dynamic)* `#values-hover-line` → When engaging with technology like AI, the {familyName} family values:
- **Card control, above each card** `#values-arrow-more` → More
- **Card control, below each card** `#values-arrow-less` → Less

*(I shortened "Matters more/Matters less" to "More/Less" because the buttons
now sit above and below narrow side-by-side cards. If you want the longer
phrasing back, the cards will need to be wider or the type smaller.)*

### Origin — sentence-preview help
Each question now shows the sentence it is completing, live, with the family's
own words in it. This is what fixes the tense problem: nobody writes "the
summer of 2009" into a "began in ___ when ___" slot once they can see the slot.

- **Where started, preview** `#origin-preview-where` → The {familyName} family began in {answer}.
- **When started, help text** `#origin-when-help` → Finish the sentence below — it needs something that happened, not a date on its own.
- **When started, preview** `#origin-preview-when` → …began in {startedWhere} when {answer}.
- **Why started, preview** `#origin-preview-why` → Together, they started a family because {answer}.
- **Where they live, preview** `#origin-preview-livesin` → Today, {names} live in {answer}.

**Note the question order changed:** "Where did our family start?" now comes
*before* "When did our family start?", so the "when" preview can show the real
place instead of a blank.

### Praxis — four questions instead of one stem
- **Question** `#praxis-q1` → What will your family hand over?
- **Question** `#praxis-q2` → So that you can what?
- **Question** `#praxis-q3` → What will your family not hand over?
- **Question** `#praxis-q4` → Because why?
- **Waiting state** `#praxis-incomplete` → Answer all four to see the sentence.
- **Assembled sentence heading** `#praxis-assembled-eyebrow` → Your praxis
- **Assembled sentence** *(dynamic)* `#praxis-assembled` → Our family will hand over {q1} so that we can {q2}. We will not hand over {q3}, because {q4}.

*(The four questions are the real copy problem here — "So that you can what?"
and "Because why?" are clumsy. They're written to make the assembled sentence
grammatical, which constrains them. If you rewrite them, keep each one a
question whose answer slots into the sentence above.)*

### Downloads
- **Contents page button** `#cover-download-btn` → Download
- **Finished document** `#finished-download-md` → Download Markdown

### Value card blurbs — all ten rewritten
Flagged as poor, and side-by-side cards need them short. Each is now one
phrase. Replace freely; keep them short enough to read in one breath.

| Value | New blurb |
| --- | --- |
| Thinking for ourselves | Making up our own minds. |
| Trying new things | Adventure, and the nerve to take it on. |
| Enjoying life | Delight in an ordinary day. |
| Getting good at things | Skill worth putting our name on. |
| Having a say in what happens to us | A hand on the wheel of our own life. |
| Feeling safe and steady | A home that holds when things shake. |
| Not letting people down | Keeping our word. |
| Keeping what we were handed | The customs passed down to us. |
| Taking care of our people | Showing up for the ones closest to us. |
| Looking out for everyone, not just us | Care that reaches past our own door. |

**The titles are untouched.** They're the thing being compared, and I didn't
want to move them under you while you're editing.

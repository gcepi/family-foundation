# Revision brief — Aug 26 walkthrough feedback

Cleaned up from a rough voice transcription of Graham demoing the current build to himself. Organized by screen, in the order he moved through the app. Written as an implementation checklist for whoever picks this up next.

Three things to read before touching anything:

1. **"This a piece of family" = "the [family last name] family."** The transcript mangles this recurring phrase throughout (it's confirmed cleanly later as "the blank family began in..."). Wherever you see it below already resolved, that's what happened — it's not a real term.
2. **Origin reverts to a separate full-screen activity.** Yesterday's rebuild made Origin and Praxis write inline into the document. Graham wants Origin back to a dedicated activity screen (like Practices and Values already are). **Praxis stays inline** — its fix is different (see the Praxis section) — don't pop it out into a popup too.
3. **One open design question needs a recommendation, not a silent implementation.** The values-sort ranking mechanic has a real correctness flaw Graham identified himself. See "Needs a decision" below before writing that code.

---

## Needs a decision (surface these, don't just pick one)

- **Values-sort ranking algorithm.** Graham wants a "reigning challenger" pairwise mechanic (spec'd in detail below), but he flagged it himself: a card that wins early and locks into the ranked list never gets rematched against a stronger card that shows up later, so the final order isn't guaranteed correct. He explicitly asked for options + a recommendation on comparison count/UX before this gets built as-is. Options he floated: (a) ship the simple version and rely on the existing drag-to-reorder as a manual fix-up pass; (b) a tournament bracket for a more rigorous order at the cost of more taps; (c) cap the number of values compared, bracket that subset. Bring back a comparison-count estimate for the current value-set size and a recommendation.
- **Scope of "Family Constitution" → "Family Values" rename.** Graham says the third document section should say "Family Values" instead of "Family Constitution." Unclear whether that also applies to the Cover/contents page's row label and the activity popup's title, since he referred to "family constitution" unprompted in both those other places without correcting himself. Recommend applying it everywhere for consistency, but confirm before touching the Cover row specifically.

---

## Global rules

- **Every "insert text" field should be a full textbox**, not a single-line input — stated explicitly for one field, but called out as a rule that should apply everywhere in the app.
- **Live sentence-preview help text is the standard**, not a redundant second hint. Where a field builds toward a sentence, show the sentence assembling in real time as the sole guidance — don't also stack a generic instruction like "finish the sentence below" on top of it.
- **Remove the small icon next to every session eyebrow** in the document (Session One / Two / Three) — stated three times, applies uniformly.
- **Every document section should default to collapsed** the first time someone arrives at the page (Notion-style, small arrow toggle to expand) — this includes the Family Practices top-level section and the Origin / Praxis / Telos subsections under Family Portrait. Locked/unlocked logic doesn't change, only the default expanded state.

---

## Setup screen ("Who is here")

- Header: "Who is here?" → **"List all participants"**
- Subtext: "Just the people in the room today…" → **"These names will be referenced in the interactive activities."** (That's the complete replacement — nothing more.)
- Label "The family name" → **"Family last name"**
- Label "The people" → **"Participants"**
- Remove the divider/rule line next to the "Participants" label.
- No changes to: the grown-up/kid toggle, name fields, "Add a grown-up" / "Add a kid" buttons — confirmed fine as-is.

---

## Cover / contents page

- **Remove the astrolabe/instrument SVG graphic** (the circles, geometric lines, bullseye) entirely.
- **Replace it with a photo placeholder** — a simple "add a photo" icon from the design library, ideally opening the device camera directly so the family can take a group photo on the spot. Square or landscape aspect ratio.
- "Contents" label: keep the word, **remove the divider line** next to it.
- **Remove the small icon** shown to the left of each of the three section rows. Leave that space empty — *or*, as an experiment Graham wants to see (not a firm requirement), try moving the existing green "done" checkmark into that spot instead of its current position.
- **Remove "In the room"** — the row of participant-name pills — entirely.
- **Remove "The Finished Document"** as a fourth listed row. Only three: Family Portrait, Family Practices, Family Constitution (see naming-scope question above).
- **Fix "Start over"** — reported not working. *Note: a working Start Over control was implemented and tested earlier in this same session — verify against the latest build before re-diagnosing; this feedback may predate that fix.*
- **H1 title**, two lines: line one **"[Family Last Name] Family"** (dynamic), line two **"AI Constitution"** — explicit line break between them. Replaces the current single-line "The [Name] Family."
- **Remove the subtitle** under the H1 ("Three sessions, one document, and nothing in it is finished until you say so.") entirely.

---

## Document page — Family Portrait section (Session 1)

- Remove the description text under the "Family Portrait" heading ("A portrait needs three things…") entirely. Graham will write replacement copy later — leave blank for now.

### Origin — structural change

**Revert to a separate full-screen activity** (matching how Family Practices and Family Constitution already work), rather than writing inline into the document. Button stays labeled **"Start Activity."**

Remove all current support text under the "Origin" heading on the document page itself ("Where your family began.") — completely gone, in both the collapsed heading and once written.

### Origin activity — overall interaction model

Not a step-by-step wizard. A single scrollable Notion-style document:

- As questions are answered, they render as an **editable outline** — bulleted, no icons, same typography weight as body text.
- **You can scroll up** to any already-answered question and edit it inline at any time.
- **You cannot scroll down** into a question that hasn't been unlocked yet — sequence still progresses top to bottom.

### Origin activity — question by question

- **"Who is in our family?"** — remove current support text ("Everyone, not only the people in this room"). Replace with: **"Include everyone, not just the people in this room."** Answers render as a bulleted, editable list (this is the one question that should look like a short bullet + fill-in-the-blank, distinct from the sentence-completion styling below).
- **"Where does our family live?"** — keep the live sentence-preview help text as-is; Graham specifically likes it.
- **Hand-off card** ("Hand the phone to…") — remove the phrase "ask the grown-ups" from the instruction copy; keep the rest.
- **Reorder the remaining two questions**: "When did our family start?" should come **before** "Where did our family start?" (currently the reverse).
- The live sentence-preview for the "began in [placeholder]" text should **drop the baked-in preposition** — render as **"[Family] family began ___"**, not "…began in ___," since the answer could be "at," "in," or something else entirely.
- Remove the specific example placeholder text currently shown in that field ("a rented apartment in Cleveland").
- *Do not* use Graham's own spoken example ("Mom met Dad at a company party in Fort Worth") as placeholder or help copy anywhere — he was illustrating intent only.
- **"Why did our family start?"** — its answer field currently uses a different size/style than the other fields. Make it **visually consistent** with "When did our family start?," "Where did our family start?," and "Where does our family live?" (same box, same size, same effects).
- Remove any redundant clarifying line stacked on top of the sentence-preview (e.g. "needs to be something that happened, not a date on its own") — the live sentence preview is sufficient on its own.

### "Your Preamble" review screen

- Make the assembled preamble text **click-to-edit in place** — Graham hit a real bug (a double period) that needed immediate inline correction and currently can't fix it here.
- On save, returns to the document (current behavior, keep) — the approved text shown under "Origin" must also remain live-editable there. Highlight styling on filled blanks: no change, confirmed liked.

### Praxis subsection — copy

- Description text: "What your family does, over and over." → **"Practices, habits, and behaviors that shape us over time."**

### Praxis subsection — structural change (does NOT get its own activity popup)

- **Remove the current 4-blank template** entirely ("What will your family hand over so that you can ___? What will your family not hand over because ___?").
- Replaced by a free-form **editable paragraph**, seeded via an "Apply to Praxis" button that lives under the new Family Practices "Food for Thought" callout (see Family Practices section below). This is a **one-time paste-in**, not a live sync — once applied, the Praxis text is independently editable.
- Add a **"Revisit Family Practices"** link under this subsection that scrolls back down to the Family Practices section.

### Telos subsection — copy

- Description text: "The end your family is aiming at." → **"The type of family that we are becoming."** (Graham talked through a couple of drafts out loud before landing here — use this final line only.)

### Telos subsection — structural change

- Should **not** display the ranked value-card list — prose paragraph only.
- Text must be fully editable in place.
- Seeded via an **"Apply to Telos"** button under the Family Values section's "Food for Thought" callout (see that section below) — same one-time-paste, independently-editable pattern as Praxis.
- Add a **"Revisit Family Values"** link that scrolls back down to the Family Values/Constitution section.

---

## Document page — Session 2 header

- Remove the icon next to the "Session Two" eyebrow.
- Eyebrow text, divider line: no change, confirmed fine.
- Description text above the "Start Activity" button: **outstanding — Graham will supply this later.** Leave blank, do not invent copy.
- Button label: **"Start Activity"** (confirmed, unchanged).

---

## Family Practices activity (popup)

- Popup entrance animation: acceptable as-is; open to a more polished/standard transition if there's an easy, well-established pattern — offer options if so, otherwise leave alone. Not a required change.
- Popup title: "Family Practices" → **"Family Practices Activity."**
- Header "Everything you'd hand over" → **"Brainstorm things to automate."**
- Description paragraph, rewritten as complete sentences: **"Take two minutes to brainstorm things your family would automate, or would like to outsource to technology, if it could. No need to be realistic — we will analyze the trade-offs together."**
- Timer animation: keep the circular timer concept, but change the mechanic — instead of the ring outline shrinking, make it a **clockwise-depleting pie/clock wedge** in ochre, full at the start, empty at 2:00.
- "If you get stuck" label → **"Categories to consider."**
- Domain list — **Home**: no change (Grocery shopping, Cooking, Cleaning, Laundry). **Work**: replace with **Commuting, Homework, Chores** (down from the current four items — flagged below, worth a quick gut-check since "homework" is also used as a running example elsewhere in the flow). **Administrative**: no change.
- Closing line before the timer/continue button, as a complete sentence: **"When the time is up, each family member circles one favorite. You can access this activity at any time for other examples."**
- Continue button: label as **"Continue."**

### Per-participant input screen

- Remove the "[Name]'s turn" eyebrow entirely.
- Put the participant's name **directly in the question header**: **"[Name], what do you want to automate?"**
- Support text under that header → **"Type one example from the list."**
- Field should be a full textbox, not a single-line input (global rule, restated here).
- **"So you'll no longer have to…"** — final decision after some live back-and-forth: keep the support text as the simple, static **"Finish the sentence."** No dynamic text, no reference back to the previous answer. Apply this exact same pattern (dynamic name in header, same description style, textbox, "Finish the sentence.") to whatever question follows it.

### The Bargain (primer screen)

- Header "The Bargain": no change.
- **Rewrite the description** — this is Graham's live first draft, not polished; preserve the structure and beats, light grammar cleanup only, expect him to revise further:
  - Opening line stays: *"Every automation, every invention, every technology has trade-offs."*
  - Then: *"First, something new is made possible — something is made possible to relieve a burden. But every technology has a bargain. Some call this externalities; others call it unintended consequences. But most people don't think beyond what a new technology allows them to do. Read the example below:"*
  - Then a concrete callout: **"Now you can: [insert the original Andy Crouch / automobile example]."** *(Flagged below — need to source the exact original example text.)*
  - Then: *"Sometimes the innovation bargain is one we're willing to make — the positive outcome outweighs the negative. Other times, what we're sacrificing for the incremental gain does not outweigh the cost — the incremental gain in productivity or time doesn't outweigh the sacrifice in critical thinking, or in some cases, formation."*
  - Then a transition line: *"The next part of this activity will ask you to reassess the things you decided to automate in the previous section."*
  - Button: **"Continue."**

### Decision card (per practice)

- Support text "Is this trade worth it?": no change, confirmed liked.
- Card eyebrow label → possessive format: **"[Name]'s Automation"** (e.g. "Graham's Automation"). *Flagged below — Graham explicitly said he's not sure "automation" is the right word and expects to revisit it. This same word appears in the next bullet too.*
- Graham plans to hand-edit some AI-generated bargain copy himself going forward — not a UI change, no action needed.

### Reopening a decided card (from the document grid)

- **Remove the flip/rotation transition** entirely — open as a plain full-screen modal, consistent with the app's other full-screen pop-ups.
- Copy: "Now you can hand it over" → **"Now you can automate [item]"** (e.g. "Now you can automate laundry"). Same "automation" word-choice flag as above.

---

## Document page — Family Practices section (after the activity)

- Section defaults to **collapsed** (Notion-style arrow toggle) the first time it's unlocked — see global rule above.
- **Add an "Add" button** to let the family add more practice/automation cards manually, beyond the one-per-participant flow from the activity.
- Rename "What the assistant noticed" (currently inside the Praxis-related callout) → **"Food for Thought."** Same rename applies to the equivalent Family Values callout below.
- **Add a "Food for Thought" AI callout to this section** (doesn't currently exist here) — this is the reflection on what the family kept/refused. Under it:
  - An **"Apply to Praxis"** button that scrolls up to the Praxis subsection and seeds its (now editable) text.
  - This callout's own text must be user-editable in place.
- *Backlog note, not a copy edit:* the AI reflection output itself needs tone/content guardrails — flagged for a follow-up pass on the prompt, not new copy to write now.

---

## Document page — Session 3 header

- Remove the icon next to the "Session Three" eyebrow.
- Description text: **outstanding — Graham will supply later.**
- Button label: **"Start Activity"** (confirmed).
- **Add a new intro/instruction screen** before the value-sorting screen begins (currently jumps straight into sorting) — see below.
- Section heading name: see "Family Constitution → Family Values" scope question at the top.

### Section-level description (on the document page, before "Start Activity")

Graham's dictation trails off here — flagged below as incomplete, implement literally and expect a follow-up:

> "To an extent, the things we value and the things we love point toward the aim, or goal, of our lives. This activity —"

---

## Family Constitution / Values activity (popup)

- Popup title: "Family Constitution · Values" → **"Family Constitution Activity"** (matches the "[Section] Activity" pattern used for Family Practices).
- Currently the intro/instruction content reads as too sparse — tighten vertical spacing generally on this screen.

### New intro screen (add before sorting starts)

- Description: *"This activity presents two values at a time and asks you to decide what matters more and what matters less. Since this is an activity for engaging with technology, we've provided a short sentence to help frame the decision:"*
- Framing quote, shown as an illustrative frame (not something the user fills in at this step): **"When engaging with AI, our family values ___."**
- Final instruction line leading into the sort: **"Read each value and decide which matters more. Swipe up to choose."**

### Sorting screen — banner

Pull the contextual/philosophical framing line out of being embedded in the sort UI and into a **persistent banner pinned at the top** of the sorting screen, styled consistent with other instructional banners in the app. Consolidated into one sentence:

> "Sort the following values into priority order by swiping or tapping the card that matters more, when engaging with technology like AI."

### Sorting mechanic — full rework

Remove the current "Matters more / Matters less" two-button-per-card scheme (four buttons total across the two cards). Replace with:

- **One action per card**: swipe up (or tap) to say "this one matters more." No explicit "matters less" control.
- **Two fixed slots, Left and Right.** Each holds one card.
- When a slot's card is chosen as the winner, it animates **out and up** into a small, greyed "ranked" preview grid accumulating at the top of the screen (left-to-right, top-row-first, shrinking as it fills — size the grid sensibly for the total value count, e.g. two rows of four for eight values).
- The **winner's now-empty slot refills** with the next card from the pool.
- The **losing card stays in its slot**, unchanged, and becomes the reigning card compared against the next new challenger.
- Continue until the pool is exhausted.
- **Keep the existing final step** — the completed ranking as a draggable, reorderable list. Graham confirmed he likes the drag interaction; no change there.

*(See "Needs a decision" at the top — this exact mechanic has a known ranking-correctness gap Graham flagged himself. Don't implement without bringing back the requested recommendation.)*

---

## Document page — Family Values section (after sorting)

- Rename "Your top 3, read back" → **"Food for Thought"** (same pattern as Praxis).
- *Backlog note:* Graham wants this AI output to draw more visibly on the actual published Schwartz values-index research/diagram — a prompt-quality improvement, not literal copy to insert.
- Text must be editable in place.
- Add an **"Apply to Telos"** button under the callout (see Telos subsection above for behavior).
- Add a **"Regenerate"** button near the callout, so the family can request a new pass after reordering.

---

## Finished Document → Signatures epilogue

- **Remove "The Finished Document"** as its own gated/locked contents row entirely.
- Instead, once **Family Values is fully complete**, automatically reveal an **ungated** epilogue at the bottom of the document (never shown greyed/locked — just appears once earned) containing:
  - Signature lines for each participant (existing UI, keep as-is).
  - The three action buttons Graham says already "look great" visually — keep the design, update labels to: **"Download PDF"** (rename from the current "Save a copy" / print action), **"Download Markdown"** (unchanged), **"Email to the Family"** (rename from the current "Send it home" stub).

---

## Explicitly deferred by Graham — do not act on these yet

- Editability of AI-generated bargain-card output (he wants it, but said not for this pass).
- Reworking the AI reflection prompts/tone for "guardrails" — flagged as future work, not new copy.
- Session 2 and Session 3 description text above "Start Activity" — he'll write these.
- Cover page section-row blurb text — not mentioned as changing.
- Final word choice for "automation" / "Automation" — used provisionally per this brief, expect a rename later.
- Whether to actually move the checkmark into the icon slot on the Cover page — described as wanting to "see what that looks like," not a firm requirement.

---

## Needs Graham's confirmation (manual review)

1. **"Family Constitution" → "Family Values" rename scope.** Confirm whether this applies only to the document's third section heading, or also to the Cover page's row label and the activity popup's title. (Full context at top of this brief.)
2. **The Andy Crouch / automobile "Now you can" example** referenced in the Bargain primer — need the original text sourced from wherever it was previously provided (referenced in the project's PRD as an external article) before that screen can ship.
3. **The Family Values section's document-page description is cut off mid-sentence** ("…point toward the aim, or goal, of our lives. This activity —"). Confirm whether that's intentionally a lead-in fragment or needs finishing.
4. **Values-sort ranking algorithm** — see "Needs a decision" at the top. This is the highest-priority open item in the whole brief.
5. **"Homework" moving into the Work brainstorm category** (Commuting, Homework, Chores) — flagged only because "homework" is also used as a recurring example elsewhere in the flow (Origin, the bargain walkthrough). Likely intentional, just worth a quick yes/no.

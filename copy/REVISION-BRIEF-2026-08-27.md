# Revision brief — Aug 27 walkthrough feedback

Cleaned up from a rough voice transcription of Graham demoing the current build with his wife. Her commentary and the small talk are cut; only Graham's directives and confirmed answers to her questions are kept. Organized by screen, in the order he moved through the app.

Two things to read before touching anything:

1. **Dictation mangled several phrases badly.** "This abuse of family" / "Peace family" / "So piece of family" all mean **"the [family name] family."** "Recipes family" also means the same thing. Where the brief below already resolves a mangled phrase, that's what happened — none of these are real terms.
2. **One item is genuinely ambiguous in the dictation itself**, not just mangled by transcription — the Origin "when/where" sentence logic. Flagged in its own section below with a reconstruction attempt. Don't guess past what's flagged; ask Graham.

---

## Needs a decision or clarification (surface these, don't just pick one)

- **Origin "when" and "where" sentence logic.** See the dedicated section below — Graham corrected himself several times in the dictation and the final intent isn't fully resolved on the page. Confirm before changing the sentence-assembly logic.
- **"We value ___" pattern for value-card descriptions.** Graham gave one fully worked example (Thinking for Ourselves) and said every other card's description should follow the same pattern — a complete sentence starting "We value," specific to engaging with technology, one or two examples. He did **not** dictate the other nine descriptions. Whoever picks this up needs to draft the remaining nine following the pattern below, flagged for his review rather than shipped silently.
- **AI-generated reflection quality (both "Consider this" callouts).** Graham was explicit this pass is about structure and UI, not prompt quality — he called the current output "horrible" and said fixing it is later work. Don't rewrite the reflection prompts in this pass beyond what's specified below; just don't make it worse.

---

## Confirmed — no change needed

- **A child with a different last name from the parents.** Graham's wife asked whether this breaks the Origin flow (blended-family case). Graham confirmed the existing behavior is fine as written: the assembled sentence is "The [family name] family began... and consists of [first names]" — first names only, no per-person last names needed. **Do not build anything for this**, it was a question, not a request.

---

## Global rules

- **No bullet points, anywhere.** This reverses an earlier ask (some prior pass added document-style bullet markers next to text fields and list items). Graham is explicit and repeats it multiple times: remove every bullet dot in the app. A text box is sufficient UI on its own to separate fields; a bulleted list under "Now you can / So we'll no longer have to / etc." also loses its bullets. This applies to the Origin activity's "Who is in our family" list, "Where does our family live," the Bargain primer's four-part list, and anywhere else a bullet currently appears.
- **Text should always wrap full-width.** Audit every line of body/support text across the app — several currently stop short and leave a ragged right edge instead of wrapping to fill the container (named explicitly: the Setup page's support text, and the "Complete the Origin and Family Practices Activity to unlock this section" line, which currently breaks awkwardly before "Activity"). Fix globally, not just the named instances.
- **Padlock icon for locked sections.** Add a lock icon next to the section name in the collapsed header (e.g. next to "Praxis") while it's locked, *and* the same icon inline in the unlock-condition sentence at the bottom of that section's description (e.g. right before or next to "Complete the Origin and Family Practices Activity..."). The two icons should visually read as the same referent — the reader connects the lock in the header to the reason given in the text. Apply consistently to every gated section (Praxis, Telos, and anywhere else gating already exists).
- **Checkmarks on the Table of Contents page: green, not yellow/ochre.** Completed-section checkmarks should be green.

---

## Cover page

- Too much empty space at the bottom of the page below the contents list — needs the vertical rhythm recalibrated so it doesn't trail off into dead space. (Confirmed liked: the photo affordance, and the "[Family] Family / AI Constitution" title — no change to either.)

---

## Setup screen ("List all participants")

- Support text doesn't wrap full width — see global text-wrap rule above.
- (Blended-family last-name question — see "Confirmed, no change needed" above.)

---

## Family Portrait section — Praxis (collapsed description)

Reformat as a dictionary-style definition entry. Structure:

1. **"PRAX·IS"** — syllable-dotted term, styled as a headword.
2. **noun** — part of speech, small/label style.
3. *In italics:* "the process by which theory, lessons, and ideas are put into practice"
4. Then, in regular body text: "Our family practice consists of commitments, habits, and behaviors that shape us over time."
5. Then: "Complete the Origin and Family Practices Activity to unlock this section." — apply the global text-wrap fix here specifically (currently breaks oddly before "Activity") and the padlock icon per the global rule.

---

## Family Portrait section — Telos (collapsed description)

Same dictionary-entry format:

1. **"TE·LOS"** — syllable-dotted, headword style.
2. **noun**
3. *In italics:* "the ultimate goal, end, or vision of the good life that we aim to live toward"
4. Then: "Our family Telos is informed by our deepest desires and affections."
5. Then: "Complete the Praxis section and the Family Values Activity to unlock this section." (+ padlock icon)

---

## Family Portrait section — Origin (collapsed description)

Same dictionary-entry format — this section didn't have one before, it's new:

1. **"OR·I·GIN"** — syllable-dotted, headword style.
2. **noun**
3. *In italics:* "the point or place where something begins"
4. Then, as placeholder body text Graham expects to revise later: "Our family origin informs who we are today. Though it is not everything, knowing where we come from contributes to who we are."

"Start Activity" button below this: confirmed, no change.

---

## Family Portrait Activity (Origin popup)

- Remove bullets next to "Who is in our family?" and "Where does our family live?" (global rule).
- "Who is in our family?" support text → **"List everyone in your immediate family, not just the people in this room."** (Confirms the intent is immediate family, not extended family — his wife's question, resolved this way.)
- "Where does our family live?" — the live sentence preview needs correct list grammar with "and" before the last name: **"Today, [First] live in ___"** for one person, **"Today, [First] and [Second] live in ___"** for two, **"Today, [First], [Second], and [Third] live in ___"** for three or more. Currently missing "and" entirely — reads as a flat comma list.
- Add grey/faint placeholder help text inside the "Where does our family live?" text box — invented example text, not literal copy to use, e.g. "Atlanta, Georgia" or "A yellow house on Glenwood Avenue." Write something in that spirit; Graham's own example during the walkthrough was "A yellow house in Grant Park" but he wasn't dictating final copy, just demonstrating tone.
- **Hand-off card ("Hand the phone to [Name]"):**
  - Body copy → **"Ask the following questions out loud, and listen to the answers. Once you hear the story, write them down in the fields below."** Graham flagged this as placeholder/directional, expects to revise further, but wants the "AI speak" tone of the current copy gone now.
  - **Remove the arrow icon** underneath the phone icon. Keep the phone icon itself.
- **"When did our family start?"** — remove bullet; live sentence preview should read **"The [family] family began in [date/time phrase]"** (e.g. "in October 2025," "in the summer of 2019") — i.e. the preview uses "in" before the answer, not "when."
- **"Where did our family start?" and the when/where relationship — see flagged ambiguity below. Do not implement without confirming.**
- **"Why did our family start?"** — remove bullet; sentence logic unchanged ("Together, they started a family because ___").
- **Preamble review screen:** reduce (don't eliminate) the vertical gap between the "Your preamble" label and the assembled sentence below it — currently reads as stacked with too much air, should sit tighter.
- **Bug — cannot re-enter a cleared field.** If a family member deletes the text in an Origin field, the field becomes unclickable/unfocusable and can't be typed into again. Graham calls this out as a hard blocker ("point blank") because these fields feed the rest of the document. Needs a real fix, not a workaround.
- **Missing — no way to restart the Origin activity.** Once complete, there's currently no path to redo it. Needs one.

### ⚠️ Flagged: Origin "when" / "where" sentence construction — needs confirmation

Graham talked through this live and corrected himself multiple times; the transcript doesn't cleanly resolve to one final sentence structure. What's clear: the "when" preview should use **"began in [date]"** rather than **"began when [date]"** (see above — this part is confirmed). What's *not* clear: how the "where" answer combines with it. His own example answer was **"at our wedding in October 2025"** for "Where did our family start?" — which folds a date back into the *where* answer, even though "when" is asked as a separate question with its own date. Two readings are possible:

- **(a)** The two questions stay independent and the assembled sentence is something like *"The [family] family began [where] in [when]"* — e.g. "The Alvarez family began at our wedding in October 2025" — and his spoken example was just him folding both pieces into one spoken answer out of habit, not a request to change the field structure.
- **(b)** He wants the "where" field itself to optionally carry a date reference, decoupling it further from "when."

**Recommendation: implement (a)** — it matches the existing two-field structure and his own example sentence reads correctly under it — but confirm with Graham before building, per his own instruction not to guess through an open question like this.

---

## Family Practices Activity — brainstorm intro

- Copy → **"Take two minutes to brainstorm things your family would like to automate or outsource to technology. No need to be realistic. We will consider the trade-offs together."** (Drops the comma before "if it could" by dropping "if it could" entirely; "analyze" → "consider.")
- **Timer direction:** the ochre wedge/clock face is liked ("my favorite") but currently depletes **counter-clockwise** — needs to deplete **clockwise**, like an actual clock.
- **Categories to consider:**
  - Move **Homework** out of Home, into **Work**.
  - Remove **Chores** from Work.
  - Add **Applications** (as in college applications) to Work — Graham explicitly wants this brainstorm list to also make sense to a teenager (referenced high-schoolers, Salt & Light youth). Final **Work** list: Commuting, Email, Homework, Applications.
  - **Home** and **Administrative** categories: no change.
  - The "Categories to consider" support paragraph is currently left-aligned/narrow — apply the global text-wrap-full-width fix here.
- Final sentence under the categories → **"You can access this activity at any time."** (period; drop the "for other examples" tail.)
- **Backlog, not this pass:** the timer should do something (visually/functionally) when it hits zero. Graham explicitly deferred this to a future version — don't build it now, just don't block on it either.

---

## Family Practices Activity — per-participant input

- The dynamic name field should **not** reappear in the second question. Currently: "[Name], so you'll no longer have to…" — remove the leading name, just **"So you'll no longer have to…"** (The first question, "[Name], what do you want to automate?", keeps the name — only the second one drops it.)

---

## The Bargain (primer screen)

- "Every automation, every invention, every technology has trade-offs." → change **"invention"** to **"innovation."**
- Restructure the opening: **"First, something is made possible to relieve a burden, but every technology has a bargain."** Then go straight into the example callout box — **cut** the "some call this externalities, others call it unintended consequences" sentence entirely; Graham said it reads as "too heady." Graham says he'll come back and edit this copy further later — these are directional fixes, not final copy.
- Remove bullets from the four-row "Now you can / So we'll no longer have to / We will no longer be able to / Now we will have to" list (global rule). The actual row copy/content itself is confirmed good — "really good output," no change to the row text or structure, only the bullet markers.

---

## "Consider this" — Family Practices (post-decision reflection)

- Confirmed working as intended structurally: it's AI-generated, editable, and "Apply to Praxis" correctly seeds the Praxis section. The transition/interaction on apply is confirmed liked.
- **Content quality is explicitly out of scope for this pass** — Graham called the current generated text "horrible" and says fixing it is later work. For now it should read between the lines of what was and wasn't automated and gesture at what kind of family this is becoming — the existing direction is fine as a placeholder, don't polish the prompt now.
- Section-collapse behavior on "Apply to Praxis" and "Revisit Family Practices" — **see the dedicated Collapsing Sections rule below**, this is where it applies.

---

## Family Values section (collapsed description, on the document page)

- Remove **"to an extent"** from the opening.
- New opening line: **"The things we value and the things we love point toward a vision of the good life."**
- Section description on the document/homepage → **"This activity presents two values at a time and asks you to decide what matters more."**
- The activity's own intro popup screen (before sorting starts) — first line should read **"Since this is an activity for engaging with technology, we've provided a short sentence to help frame the decision."** Everything else on that intro screen is confirmed good, no other changes.

---

## Family Values Activity — the sort itself

- **The framing callout ("When engaging with AI, our family values ___") needs to persist onto the sorting screen**, not just the intro screen before it. Same exact callout box and text, shown pinned above the value cards while the family is actively comparing them — currently it only appears on the intro page and Graham wants it carried through.
- **Value cards are too tall.** Too much empty vertical space above and below the text inside each card. Shrink significantly — tighten padding to the content — but don't change the card's width/shape, and don't compress it so tight that it looks cramped either. Read this as: match padding to content, no more, no less.
- **Value card description text — new pattern, one worked example given:**
  - Every description should be a complete sentence starting with **"We value…"**
  - Specific to engaging with technology — not generic, not "corny." One or two concrete examples.
  - **Worked example, for the "Thinking for Ourselves" card:** *"We value critical thinking and independent thought, uninfluenced by algorithms and the opinions of others."* This is the model for tone, length, and structure.
  - **The other nine cards' descriptions were not dictated** — see "Needs a decision" at the top. Draft them following this pattern and flag for Graham's review; don't invent silently and ship.
  - AI can continue to generate/suggest this text going forward; Graham expects to review and adjust.
- **Rename two value card titles:**
  - "Feeling safe and steady" → **"Feeling safe"**
  - "Taking care of our people" → **"Taking care of people we know"**
  - (No change to "Looking out for everyone, not just people we know" or "Thinking for ourselves" as titles — only their description text follows the new pattern above.)

---

## Family Values section — after sorting (Telos application)

- **"Consider this" reflection text (post-sort) needs to be substantively rewritten/restructured** — should speak to the direction/aim (Telos) the family is heading, based specifically on their top three ranked values. Same caveat as the Practices reflection: prompt-quality work is a later pass, but the structural intent (top-3-driven, forward-looking, aim-oriented) should guide whatever placeholder logic exists now.
- **"Regenerate" button visibility — new rule.** It should **not** show by default and should **not** show on every reorder. It should appear **only when the top 3 ranked values change** — either because one of the current top 3 gets bumped out, or a new value enters the top 3. Reordering *within* the top 3, or reordering anything below the top 3, does not trigger it. (He talked through several wrong versions of this rule out loud before landing here — this final version is the one to build.)

---

## Collapsing sections — new default navigation rule (document page)

This is a structural rule, applies wherever "Apply to X" / "Revisit Y" links exist (currently: Praxis ↔ Family Practices, Telos ↔ Family Values):

- Tapping **"Apply to Praxis"** or **"Apply to Telos"**: scroll up to the Family Portrait section, **and collapse the section you're leaving** (Family Practices or Family Values respectively) so only the destination is expanded.
- Tapping **"Revisit Family Practices"** or **"Revisit Family Values"**: expand that target section, **and collapse the Family Portrait section** you're leaving.
- General rule: any of these navigation actions collapses everything except the destination, so the destination becomes the sole focus. This is *only* about the automatic behavior of these specific navigation links — manual expand/collapse via the chevrons stays fully user-controlled and unaffected.
- Confirmed as already working correctly: the padlock disappearing from Praxis once Origin + Practices are done, and from Telos once Values are applied. No change needed there beyond adding the icon itself per the global rule above.

---

## Divider / rule line cleanup (document page)

- Under a collapsed section (called out specifically for Family Values, but treat as universal), there's currently a **confusing double line** — one under the section's H1 header, and a second one that separates the three sessions from the "Agreed to by" block below. This reads as messy.
- **Keep:** one line directly beneath each section's H1/dropdown header, always, regardless of expand/collapse state.
- **Remove:** the separate dividing line currently marking the boundary between the three collapsible sessions and the "Agreed to by" signature section — no line should sit directly above "Agreed to by."

---

## "Agreed to by" (signatures section)

- The name lines are currently static/inactive (visual underline only, not interactive). **Change them to real text input boxes**, matching the boxed-field style used everywhere else in the app.
- Each box should carry grey placeholder text showing that participant's name (e.g. Graham's box shows placeholder "Graham," Aubrey's shows placeholder "Aubrey").
- "Download PDF" and "Download Markdown" buttons: confirmed, no change.
- Graham says he'll work separately on what the final signed/downloaded output should actually contain/look like — not an ask for this pass beyond making the fields real inputs.

# Family Foundation — copy map

Every string in the app, in the order you'll meet it on screen, grouped by
screen and component. Edit the text after each `→`. Leave the file path and
the `#anchor` alone — that's how this gets back into the code.

**How to use this alongside the app:** open the app in one monitor, this file
in the other. Each heading names the screen; each bolded label names the
exact element (button, heading, placeholder...) so you can always tell what
you're looking at without hunting for it.

**Placeholders** (grey text inside an empty field) are marked *(placeholder)*
— they vanish the moment someone types, so treat them as a hint, not a label.

**Dynamic text** — anything assembled from what the family typed — is marked
*(dynamic)* and shown with its template, e.g. `{familyName}`.

---

## Cover — the front cover / table of contents
`src/app/Cover.tsx`

- **Masthead eyebrow** `#cover-masthead` → Family Foundation
- **"Who's here" link** (only shown once setup is done) `#cover-whos-here` → Who's here
- **Page title** *(dynamic — shows "Your Family" until a family name is set)* `#cover-h1` → Your Family / The {familyName} Family
- **Subhead** `#cover-subhead` → Three sessions, one document, and nothing in it is finished until you say so.
- **Primary button** (before setup is done) `#cover-begin-btn` → Begin — who is here today?
- **Contents eyebrow** (after setup) `#cover-contents-eyebrow` → Contents

### Contents rows
- **Row 1 title** `#cover-row-portrait-title` → Family Portrait
- **Row 1 blurb** `#cover-row-portrait-blurb` → Where you began, how you practice, what you are aiming at.
- **Row 1 sub-labels** `#cover-row-portrait-parts` → Origin · Praxis · Telos
- **Row 2 title** `#cover-row-practices-title` → Family Practices
- **Row 2 blurb** `#cover-row-practices-blurb` → What your family will hand over, and what it will keep.
- **Row 3 title** `#cover-row-constitution-title` → Family Constitution
- **Row 3 blurb** `#cover-row-constitution-blurb` → The values you would protect when they cost something.
- **Row 4 title** `#cover-row-covenant-title` → The Finished Document
- **Row 4 blurb** `#cover-row-covenant-blurb` → Everything you wrote, in one piece, to take home.

### "In the room" (shown once people are added)
- **Eyebrow** `#cover-inroom-eyebrow` → In the room

### Prototype controls (not part of the real experience — bottom of the cover only)
- **Eyebrow** `#cover-prototype-eyebrow` → Prototype
- **Toggle label** `#cover-freenav-label` → Review mode — open every section regardless of progress
- **Reset link** `#cover-startover-link` → Start over
- **Confirm dialog** `#cover-startover-confirm` → Clear everything this family has written and start over?

---

## Setup — "Who is here?"
`src/app/Setup.tsx`

- **Back button label** *(icon only, screen-reader text)* `#setup-back-aria` → Back to contents
- **Page title** `#setup-h1` → Who is here?
- **Subhead** `#setup-subhead` → Just the people in the room today. The phone will move between them, so it needs to know their names.
- **Field label** `#setup-familyname-label` → The family name
- **Field placeholder** *(placeholder)* `#setup-familyname-placeholder` → Whatever you call yourselves
- **Section eyebrow** `#setup-people-eyebrow` → The people
- **Name field placeholder** *(placeholder, repeats per person)* `#setup-name-placeholder` → First name
- **Standing toggle** `#setup-standing-grownup` → Grown-up
- **Standing toggle** `#setup-standing-kid` → Kid
- **Remove button** *(screen-reader text)* `#setup-remove-aria` → Remove {name / "this person"}
- **Add button** `#setup-add-grownup-btn` → Add a grown-up
- **Add button** `#setup-add-kid-btn` → Add a kid
- **Footer button** *(before first save)* `#setup-footer-first` → Open the document
- **Footer button** *(returning to edit)* `#setup-footer-return` → Save

---

## Document — the long, continuous page
`src/document/Document.tsx`

- **Header** *(dynamic, sticky top bar while inside the document)* `#doc-header-familyname` → Your Family / The {familyName} Family

### Section: Family Portrait
- **Eyebrow** `#doc-portrait-eyebrow` → Session one
- **Title** `#doc-portrait-title` → Family Portrait
- **Blurb** `#doc-portrait-blurb` → A portrait needs three things: where the subject came from, how they carry themselves, and what they are looking at.

  **Part — Origin**
  - **Title** `#doc-origin-title` → Origin
  - **Note** `#doc-origin-note` → Where your family began.
  - *(before started)* **Blurb** `#doc-origin-begin-blurb` → Four angles — who, where, when, and why. One of you asks, the other answers out loud, and then it goes on the page.
  - *(before started)* **Button** `#doc-origin-begin-btn` → Start the Origin activity
  - *(after finished)* **Revisit link** `#doc-origin-revisit` → Tell it again

  **Part — Praxis** *(greyed out until Family Practices is finished)*
  - **Title** `#doc-praxis-title` → Praxis
  - **Note** `#doc-praxis-note` → What your family does, over and over.
  - **Locked note** `#doc-praxis-locked` → Not yet. This one is written later.
  - *(before started)* **Blurb** `#doc-praxis-begin-blurb` → Your practices are decided. Now name the pattern underneath them.
  - *(before started)* **Button** `#doc-praxis-begin-btn` → Write your praxis
  - *(after finished)* **Revisit link** `#doc-praxis-revisit` → Rewrite it

  **Part — Telos** *(greyed out until Family Constitution is finished)*
  - **Title** `#doc-telos-title` → Telos
  - **Note** `#doc-telos-note` → The end your family is aiming at.
  - **Locked note** `#doc-telos-locked` → Not yet. This one is written later.
  - **Revisit link** `#doc-telos-revisit` → Sort the values again

### Section: Family Practices
- **Eyebrow** `#doc-practices-eyebrow` → Session two
- **Title** `#doc-practices-title` → Family Practices
- **Blurb** `#doc-practices-blurb` → Everything a family hands over is a trade. These are the trades you looked at squarely, and what you decided about each one.
- **Locked note** *(shown until Origin is finished)* `#doc-practices-lockednote` → Finish the Origin activity first.
- *(before started)* **Blurb** `#doc-practices-begin-blurb` → Brainstorm everything you would automate. Then everyone picks one, and the assistant shows you the rest of the bargain.
- *(before started)* **Button** `#doc-practices-begin-btn` → Start the Practices activity
- *(partially done)* **Blurb** `#doc-practices-continue-blurb` → Some of these are still waiting on a decision.
- *(partially done)* **Button** `#doc-practices-continue-btn` → Keep going

### Section: Family Constitution
- **Eyebrow** `#doc-constitution-eyebrow` → Session three
- **Title** `#doc-constitution-title` → Family Constitution
- **Blurb** `#doc-constitution-blurb` → Self-direction is only one of the things worth protecting. Here is where your family says which ones it would protect when protecting them costs something.
- **Locked note** *(shown until Family Practices is finished)* `#doc-constitution-lockednote` → Finish the Family Practices activity first.
- *(before started)* **Blurb** `#doc-constitution-begin-blurb` → Two values at a time. Choose the one that matters more, and keep choosing until they are all in order.
- *(before started)* **Button** `#doc-constitution-begin-btn` → Sort your values
- *(after sorted)* **Revisit link** `#doc-constitution-revisit` → Sort them again

### Section: The Finished Document
- **Eyebrow** `#doc-covenant-eyebrow` → Take it home
- **Title** `#doc-covenant-title` → The Finished Document
- **Blurb** `#doc-covenant-blurb` → Every part of it, in one piece, in your own words.
- **Locked note** *(shown until all three sessions are finished)* `#doc-covenant-lockednote` → Finish all three sessions first.
  *(content of this section is the Finished Document below)*

---

## Activity: Origin
`src/activities/OriginActivity.tsx`
*Sheet title (shown in the small top bar of every activity): "Family Portrait · Origin"*

### Step 1 — Intro
- **Heading** `#origin-intro-h2` → Origin
- **Body paragraph 1** `#origin-intro-p1` → This activity examines your family identity from four angles: Who, Where, When, and Why.
- **Body paragraph 2** `#origin-intro-p2` → Some families assume answers to these questions are common knowledge, others don't bother to think about them. The truth is, the beginning is the most important part of any story. This activity is an invitation to share the origin story if it's for the first time or the hundredth.
- **Instructions eyebrow** `#origin-intro-instr-eyebrow` → Instructions
- **Instructions body** `#origin-intro-instr-body` → When asked a question, share the answer with your family first, then fill in the text field.
- **Footer button** `#origin-intro-next-btn` → Next

### Step 2 — Who + Where
- **Eyebrow** *(dynamic)* `#origin-who-eyebrow` → {grown-up name(s), or "Grown-ups"} — ask the kids
- **Heading** `#origin-who-h2` → Who is in our family?
- **Sub-caption** `#origin-who-caption` → Everyone. Not only the people in this room.
- **Field placeholder** *(placeholder, repeats)* `#origin-who-name-placeholder` → First name
- **Add button** `#origin-who-add-btn` → Add someone
- **Heading** `#origin-where-h2` → Where does our family live?
- **Field placeholder** *(placeholder)* `#origin-where-placeholder` → A town, a street, a house
- **Footer button** `#origin-who-next-btn` → Next

### Step 3 — Handoff
- **Eyebrow** *(fixed, part of the Handoff component)* `#origin-handoff-eyebrow` → Hand the phone to
- **Recipient name** *(dynamic)* `#origin-handoff-to` → {kid name(s), or "the kids"}
- **Instruction body** `#origin-handoff-asking` → Three questions for the grown-ups. Ask them out loud, listen to the answer, then write it down.
- **Footer button** `#origin-handoff-next-btn` → They have it

### Step 4 — Beginnings
- **Eyebrow** *(dynamic)* `#origin-beginnings-eyebrow` → {kid name(s), or "Kids"} — ask the grown-ups
- **Heading** `#origin-when-h2` → When did our family start?
- **Field placeholder** *(placeholder)* `#origin-when-placeholder` → A year, a season, a day everybody remembers
- **Heading** `#origin-where2-h2` → Where did our family start?
- **Field placeholder** *(placeholder)* `#origin-where2-placeholder` → A city, a church, a kitchen
- **Heading** `#origin-why-h2` → Why did our family start?
- **Field placeholder** *(placeholder)* `#origin-why-placeholder` → Take your time with this one
- **Footer button** `#origin-beginnings-next-btn` → Next

### Step 5 — Preamble
- **Eyebrow** `#origin-preamble-eyebrow` → Your preamble
- **The preamble itself** *(dynamic — this exact template is also reused verbatim in the Document and the Finished Document)* `#origin-preamble-template` →
  > The **{family name}** family began in **{where started}** when **{when started}**. Together, they started a family because **{why started}**. Today, **{member names, comma-separated}** live in **{lives in}**.
- **Closing note** `#origin-preamble-note` → This opens your family constitution. You can change any part of it later.
- **Footer button** `#origin-preamble-finish-btn` → Write it into the document

---

## Activity: Family Practices
`src/activities/PracticesActivity.tsx`
*Sheet title: "Family Practices"*

### Phase 1 — Brainstorm
- **Heading** `#practices-brainstorm-h2` → Everything you'd hand over
- **Body paragraph 1** `#practices-brainstorm-p1` → Two minutes. Write down anything and everything your family would automate if it could. The sky is the limit — this is not limited to what is possible today.
- **Body paragraph 2** `#practices-brainstorm-p2` → No hedging. Nothing gets judged yet. Write it all on paper.
- **Timer label** *(before starting)* `#practices-timer-idle` → Tap to start
- **Timer label** *(while running)* `#practices-timer-running` → Tap to pause
- **Timer label** *(at zero)* `#practices-timer-done` → Time. Everyone circle one.
- **"If you get stuck" eyebrow** `#practices-stuck-eyebrow` → If you get stuck
  - **Domain card** `#practices-domain-home` → Home — Grocery shopping · Cooking · Cleaning · Laundry
  - **Domain card** `#practices-domain-work` → Work — Commuting · Emailing · Texting · Phone calls
  - **Domain card** `#practices-domain-admin` → Administrative — Budgeting · Family calendar · Meal planning
- **Closing caption** `#practices-brainstorm-closing` → When time is up, everyone circles one favorite. You can come back to the rest.
- **Footer button** `#practices-brainstorm-next-btn` → Everyone has their favorite

### Phase 2 — Input (repeats once per person)
- **Eyebrow** *(dynamic — first person)* `#practices-input-eyebrow-first` → {name}'s turn
- **Eyebrow** *(dynamic — subsequent people)* `#practices-input-eyebrow-handoff` → Hand the phone to {name}
- **Heading** `#practices-input-h2-thing` → What do you want to automate?
- **Caption** `#practices-input-caption-thing` → Your one favorite from the list. Just the thing itself.
- **Field placeholder** *(placeholder)* `#practices-input-thing-placeholder` → Homework, laundry, the drive to school…
- **Heading** `#practices-input-h2-relief` → So you'll no longer have to…
- **Caption** `#practices-input-caption-relief` → Finish the sentence. What does it get you out of?
- **Field placeholder** *(placeholder)* `#practices-input-relief-placeholder` → …spend an hour every night at the kitchen table
- **Footer button** *(not last person)* `#practices-input-next-btn` → Next
- **Footer button** *(last person)* `#practices-input-done-btn` → Everyone has answered

### Phase 3 — The bargain (primer, explains what's about to happen)
- **Heading** `#practices-primer-h2` → The bargain
- **Intro body** `#practices-primer-intro` → Every tool a family adopts is a trade, and the trade has four parts. Two of them get advertised. Two of them do not.
- **Row 1 label** `#practices-primer-row1-label` → Now you can…
- **Row 1 note** `#practices-primer-row1-note` → the new ability — the reason anyone wants it
- **Row 2 label** `#practices-primer-row2-label` → You'll no longer have to…
- **Row 2 note** `#practices-primer-row2-note` → the burden it lifts
- **Row 3 label** `#practices-primer-row3-label` → You're no longer able to…
- **Row 3 note** `#practices-primer-row3-note` → the ability quietly handed over with it
- **Row 4 label** `#practices-primer-row4-label` → Now you'll have to…
- **Row 4 note** `#practices-primer-row4-note` → the new obligation that arrives in its place
- **Closing body** `#practices-primer-closing` → You have already named the first two for yourselves. The assistant's only job is to name the other two — not to talk you out of anything. What you do with them is your family's call.
- **Footer button** `#practices-primer-next-btn` → Show us the rest of the bargain

### Phase 4 — Composing (loading state)
- **Caption under the thinking indicator** `#practices-composing-caption` → Every bargain has four parts. You named two of them.
- **Thinking indicator rotating labels** *(shared across the app, see "Assistant thinking labels" below)*

### Phase 5 — Decide (one bargain at a time)
- **Eyebrow** *(dynamic)* `#practices-decide-eyebrow` → {name} chose
- **Queue note** *(dynamic, shown when more are waiting)* `#practices-decide-queue` → {n} more after this
- **Bargain row 1 label** `#practices-decide-row1-label` → Now you can
- **Bargain row 1 text** *(fixed)* `#practices-decide-row1-text` → hand it over
- **Bargain row 2 label** `#practices-decide-row2-label` → You'll no longer have to
- **Bargain row 2 text** *(dynamic, from what the family typed)* `#practices-decide-row2-text` → {relief}
- **Bargain row 3 label** `#practices-decide-row3-label` → You're no longer able to
- **Bargain row 3 text** *(dynamic, assistant-generated)* `#practices-decide-row3-text` → {noLongerAble}
- **Bargain row 4 label** `#practices-decide-row4-label` → Now you'll have to
- **Bargain row 4 text** *(dynamic, assistant-generated)* `#practices-decide-row4-text` → {nowHaveTo}
- **Prompt caption** `#practices-decide-prompt` → Talk it over as a family. Is the trade worth it?
- **Decline button** `#practices-decide-decline-btn` → No deal
- **Accept button** `#practices-decide-accept-btn` → We'll take it

### Phase 5b — Refusing (shown after "No deal")
- **Eyebrow** `#practices-refuse-eyebrow` → Turning it down
- **Assistant thinking label** `#practices-refuse-thinking` → Putting your refusal into words
- **Intro caption** `#practices-refuse-intro` → A draft, in your voice. Change any part of it — these have to be your words before you move on.
- **The refusal statement itself** *(dynamic, four editable blanks the family types over — this exact template is reused in the practice-card detail and the Finished Document)* `#practices-refuse-template` →
  > We will not **{willNot}**, and will still have to **{willStillHaveTo}**, so we will still be able to **{soStillAble}**, and be able to **{andAble}**.
- **Back button** `#practices-refuse-back-btn` → Back
- **Confirm button** `#practices-refuse-confirm-btn` → That's ours

### Phase 6 — Done (all decided)
- **Heading** `#practices-done-h2` → What you decided
- **Caption** `#practices-done-caption` → Everything you weighed, kept and refused alike. Put them in whatever order your family thinks is right.
- **Footer button** `#practices-done-btn` → Write them into the document
  *(the cards themselves are documented under "Practice cards" below)*

---

## Practice cards (used inside the activity and in the Document)
`src/document/PracticeCards.tsx`

- **Helper caption below the grid** `#cards-helper` → Tap a card to read it. Drag the handle to move it.
- **Card detail — accepted, status line** *(dynamic)* `#card-detail-taken-status` → Taken · {name}
- **Card detail — accepted, row labels** *(identical to the four bargain rows above)* → Now you can / You'll no longer have to / You're no longer able to / Now you'll have to
- **Card detail — refused, status line** *(dynamic)* `#card-detail-refused-status` → Refused · {name}
- **Card detail — refused body** *(same refusal template as above)*
- **Close button** `#card-detail-close-btn` → Close
- **Drag-handle screen-reader label** *(dynamic)* `#cards-drag-aria` → Move {thing}. Use the left and right arrow keys.

---

## Activity: Praxis
`src/activities/PraxisActivity.tsx`
*Sheet title: "Family Portrait · Praxis"*

- **Heading** `#praxis-h2` → Praxis
- **Intro body** `#praxis-intro` → Practice, or pattern. Not what your family believes — what your family actually does, over and over, until it stops being a decision.
- **Assistant block eyebrow** `#praxis-assistant-eyebrow` → What the assistant noticed
- **Assistant thinking label** `#praxis-thinking-label` → Reading back what you kept and refused
- **The reflection itself** *(dynamic, assistant-generated — several variants depending on what the family decided; see `src/lib/assistant.ts` → `composePraxisReflection`)*
- **Your-words eyebrow** `#praxis-yourwords-eyebrow` → Now say it in your own words
- **Your-words caption** `#praxis-yourwords-caption` → Type over the blanks. Change the sentence entirely if it is not yours.
- **The fill-in-the-blank stem** *(placeholder text pre-filled into the textarea; the family types over it)* `#praxis-stem` → Our family will hand over ______ so that we can ______. We will not hand over ______, because ______.
- **Footer button** `#praxis-finish-btn` → Write it into the document

---

## Activity: Values (the sort)
`src/activities/ValuesActivity.tsx`
*Sheet title: "Family Constitution · Values"*

### The sort itself
- **Prompt** *(first pair)* `#values-prompt-first` → Which of these matters more to your family?
- **Prompt** *(every pair after)* `#values-prompt-repeat` → And now?
- **Bottom instruction** `#values-instruction` → Send one up to claim a place near the top, or down to send it to the bottom.
- **Card action — down** `#values-card-less-btn` → Matters less
- **Card action — up** `#values-card-more-btn` → Matters more
- **Card screen-reader label** *(dynamic)* `#values-card-aria` → {value title} — matters more

### The ten value cards
`src/data/values.ts` — title is what's read aloud/compared; blurb is the smaller supporting line on the card.

1. **own-minds** `#value-own-minds` → **Thinking for ourselves** — Making up our own minds. Choosing, exploring, working it out on our own.
2. **new-things** `#value-new-things` → **Trying new things** — Adventure, surprise, a real challenge — and the nerve to take it on.
3. **enjoying-life** `#value-enjoying-life` → **Enjoying life** — Delight, warmth, savoring the good parts of a day while they are here.
4. **getting-good** `#value-getting-good` → **Getting good at things** — Skill, craft, practice. Work we would be glad to put our name on.
5. **a-say** `#value-a-say` → **Having a say in what happens to us** — Standing, influence, a hand on the wheel of our own life.
6. **safe-and-steady** `#value-safe-and-steady` → **Feeling safe and steady** — Calm, stability, a home that holds when everything else shakes.
7. **not-letting-down** `#value-not-letting-down` → **Not letting people down** — Restraint, consideration, keeping our word to the people counting on us.
8. **what-we-were-handed** `#value-what-we-were-handed` → **Keeping what we were handed** — Roots, inheritance, the customs and convictions passed down to us.
9. **our-people** `#value-our-people` → **Taking care of our people** — Loyalty, kindness, showing up for the ones closest to us.
10. **everyone** `#value-everyone` → **Looking out for everyone, not just us** — Fairness, and care for strangers and for the world we all share.

### After the sort — Telos screen
- **Header eyebrow** `#telos-header-eyebrow` → Family Constitution · Values
- **"Sort again" link** `#telos-sortagain-btn` → Sort again
- **Heading** `#telos-h1` → Telos
- **Intro body** `#telos-intro` → The end, or the goal. Not who your family is on a good week — who your family intends to become.
- **Assistant block eyebrow** `#telos-assistant-eyebrow` → Your top three, read back
- **Assistant thinking label** `#telos-thinking-label` → Looking at the order you chose
- **The telos summary itself** *(dynamic, assistant-generated from the top 3 ranked values; see `src/lib/assistant.ts` → `composeTelos`)*
- **Edit link** `#telos-edit-btn` → Edit
- **Regenerate link** `#telos-regenerate-btn` → Regenerate
- **List eyebrow** `#telos-list-eyebrow` → Your values, in order
- **Scroll hint** *(only shown when scrolled below the summary)* `#telos-scrollhint` → scroll up for the summary
- **Footer button** `#telos-finish-btn` → Write it into the document

---

## The Finished Document
`src/document/FinishedDocument.tsx`
*(this is the content shown inside "The Finished Document" section of the Document, and also what prints)*

- **Document heading** *(dynamic)* `#finished-h2` → The Constitution of the {family name} Family
- **Clause label 1** `#finished-clause-preamble` → Preamble
  *(body = the preamble template, see Origin step 5 above)*
- **Clause label 2** *(only if something was kept)* `#finished-clause-kept` → What we will hand over
  - **Per-item sentence** *(dynamic)* `#finished-kept-sentence` → We will hand over **{thing}**, so we will no longer have to {relief} — knowing we will no longer {noLongerAble}, and will now have to {nowHaveTo}.
- **Clause label 3** *(only if something was refused)* `#finished-clause-refused` → What we will not hand over
  - **Per-item sentence** *(dynamic — same refusal template as the activity)* `#finished-refused-sentence` → We will not {willNot}, and will still have to {willStillHaveTo}, so we will still be able to {soStillAble}, and be able to {andAble}.
- **Clause label 4** `#finished-clause-praxis` → Our praxis
  *(body = the family's own praxis statement)*
- **Clause label 5** `#finished-clause-telos` → Our telos
  *(body = the telos summary)*
- **Ranking caption** *(dynamic)* `#finished-telos-ranking` → In order: {value 1} · {value 2} · {value 3}
- **Signature eyebrow** `#finished-signature-eyebrow` → Agreed to by
  *(followed by a blank signature line per participant, and today's date)*
- **Primary button** `#finished-save-btn` → Save a copy
- **Secondary button** `#finished-send-btn` → Send it home
- **Stub notice** *(appears briefly when "Send it home" is tapped — nothing is actually sent yet)* `#finished-send-stub` → This will email the finished document to everyone who signed it.
- **Closing note** `#finished-closing-note` → Nothing here is final. Families change, and so does what they would hand over.

---

## Shared / cross-cutting copy

### Assistant "thinking" indicator
`src/components/Assistant.tsx` — rotating labels shown while the assistant is "working," unless a screen supplies its own specific label (Praxis, Telos, and the refusal draft each override this with something more specific — see above).

- `#assistant-thinking-1` → Reading what you wrote
- `#assistant-thinking-2` → Weighing the trade
- `#assistant-thinking-3` → Looking for what it costs
- `#assistant-thinking-4` → Putting it in plain words
- **Default eyebrow on any assistant-written block** `#assistant-eyebrow-default` → The assistant

### The "Innovation Bargain" framing
`src/lib/assistant.ts` — not shown verbatim on screen today (it's the internal frame the stubbed responses are built from), but the four-line structure is what became the Practices "bargain primer" screen above. Flagging it here in case you want to pull any of this language forward once the assistant is wired to a real model:

> Now you can … the new ability
> You'll no longer have to … the burden lifted
> You're no longer able to … the ability quietly given up
> Now you'll have to … the new obligation taken on

---

## Not visible copy (skip these — internal/dev only)

For completeness, these exist in the code but a family never sees them: the four AI prompt specifications in `src/lib/assistant.ts` (`PROMPT_BARGAIN`, `PROMPT_REFUSAL`, `PROMPT_PRAXIS`, `PROMPT_TELOS`) are instructions to a future model, not on-screen text. Screen-reader-only `aria-label`s not already called out above (icon buttons like Back/Close) are functional, not prose — leave them unless you want to sharpen them for accessibility.

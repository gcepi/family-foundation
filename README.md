# Family Foundation — companion app prototype

The mobile companion to the in-person Family Foundation program. Three sessions,
one continuous document: **Family Portrait**, **Family Practices**, **Family
Constitution** — ending in a finished constitution the family takes home.

This is a front-end prototype. Every screen is real and clickable; nothing is
saved to a server and no model is called.

---

## Running it

```bash
npm install && npm run dev
```

Then open the printed URL. It is mobile-first: on a phone it fills the screen,
on a laptop it renders inside a held device on a darker sheet so you can review
it at a desk.

```bash
npm run build
```

Outputs a static site to `dist/`. Drag that folder onto Netlify Drop, or run
`npx vercel deploy --prod dist`, to get a link friends and family can open on
their phones. There is no backend to stand up.

```bash
npm run build:single
```

Folds the whole app — fonts and all — into one portable `family-foundation.html`
you can open by double-clicking or hand to someone directly. `node
scripts/artifact.mjs` then repackages that same bundle as `artifact.html` for
publishing.

---

## What is real, and what is waiting

**Real:** every screen, transition, gesture and piece of state. Answers persist
in `localStorage`, so a family can close the tab and come back. "Save a copy"
genuinely prints — it strips the phone frame and lays the constitution out as a
document, so Save-as-PDF produces something worth keeping.

**Stubbed:** the assistant. `src/lib/assistant.ts` returns the exact shape the
real call will return, composed from what the family actually typed, after a
deliberate pause. Each stub sits next to the prompt it will eventually send
(`PROMPT_BARGAIN`, `PROMPT_REFUSAL`, `PROMPT_PRAXIS`, `PROMPT_TELOS`) — keeping
the prompt beside the stub is what will hold responses consistent once it is
wired up. Swapping in a real model means replacing four function bodies.

**Also stubbed:** "Send it home" — it says what it will do rather than failing
silently. Every not-yet-wired button behaves this way.

---

## Where things are

```
src/
  app/          Shell (the held device), Cover (contents), Setup, store
  document/     The long document, its right-edge scrubber, the practice
                cards, and the assembled finished constitution
  activities/   Origin · Practices · Praxis · Values — the four sheets that
                rise over the document
  components/   Streaming text, assistant blocks, inline editing, stub notices
  illustrations/ Engraved instrument line-work (astrolabe, plumb, escapement,
                compass rose, seal)
  data/         The values index and the brainstorm domains
  lib/          Types and the assistant stubs
  design/       theme.css — the whole design system
```

### The two ideas the structure rests on

**One document, not a stack of screens.** Opening a "module" from the contents
does not open a screen — it drops you at a point in one continuous page. You can
always scroll up to what you already wrote or down to what you have not written
yet. Sections you have not unlocked are greyed, not hidden.

**The cover is not the top of the document.** Going back to the contents is a
separate place, not a scroll to the top. Inside the document you move between
sections by pressing the right edge and sliding your thumb, the way you would
with a thick handout.

---

## Design

Type: **Fraunces** for anything editorial or constitutional, **Inter** for
functional UI. Both are bundled — no external font requests, so it works offline
and on any host.

| Token | Value | Used for |
| --- | --- | --- |
| Paper | `#F3EEDF` | the ground, everywhere |
| Paper Dark | `#E8E0CF` | quiet surfaces |
| Ink | `#252321` | primary text |
| Ochre | `#D7B65A` | the family's own words, completion marks, focus |
| Blue Ink | `#557B91` | illustrations, and anything the assistant said |
| Muted | `#77736C` | secondary text |

Two colors were derived because the program needs them and the palette has no
green or red: `--color-affirm` `#5F7D5A` and `--color-decline` `#A6503F`. Both
are mixed toward the paper so they read unmistakably as yes and no without
leaving the same stock as everything else.

The visual idea is a letterpress field manual crossed with a navigational
instrument — a family constitution does not tell you where you are, it tells you
how to find out. The astrolabe on the cover is the progress indicator: one ring
per session, closing in ochre as each is finished.

No numbered naming anywhere. Sessions and steps are named or ticked, never
counted.

# Open Loops UX

Status: Draft v1.0
Last Updated: 2026-07-22
Owner: Founder / Design

## Purpose

Define the user experience principles, canonical MVP UI reference, and interaction model for Open Loops.

## UI Reference

Open Loops UX Vision 0.1, [UX_Vision_0.1.png](UI_REFERENCE/UX_Vision_0.1.png), is the current canonical UX direction for the Open Loops MVP.

The same reference is also available as [HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png) for implementation readability.

It is not pixel-perfect artwork, but it is a design north star. Future refinements are expected, but all implementations should preserve the underlying interaction model, visual hierarchy, and philosophy unless intentionally revised.

Do not faithfully reproduce the mockup pixel-for-pixel. Preserve the philosophy behind the layout. The implementation should feel organic, calm, spacious, and alive while remaining technically practical.

The annotated reference, [UX_Vision_0.1_annotated.svg](UI_REFERENCE/UX_Vision_0.1_annotated.svg), explains the key callouts and the reasoning behind them. Use the annotated version when translating the mockup into implementation tasks.

Each meaningful design leap should create a new UX Vision version such as `UX Vision 0.2`, `UX Vision 0.3`, and eventually `UX Vision 1.0`. See [UX Vision History](UI_REFERENCE/UX_VISION_HISTORY.md).

## Canonical Home Screen Model

The Version 1 Home Screen should preserve these core elements:

- Personalized Lumi greeting
- Calm first impression
- Prominent Talk to Lumi input
- Visible Lumi character presence
- Open Loops bubble workspace
- Bubbles representing evolving thought subjects
- Bubble size and color communicating state, depth, or activity
- Connection lines between related loops
- Bubbles/List view toggle
- New Loop action
- Lumi insight card
- Recent Thought card
- Open Loop Spotlight card
- Bottom navigation with Home, Loops, Lumi, Universe, and Me

## Numbered UX Callouts

1. Lumi Bubble: not human, not alien; represents listening and curiosity.
2. Talk to Lumi: primary CTA; always the most prominent action.
3. Open Loops Bubble Workspace: organic thought clusters; no folders, no file tree.
4. Insight Card: AI-generated observations; never prescriptive, always curiosity-based.
5. Navigation: Home, Loops, Lumi, Universe, Me.

## Interaction Philosophy

The interface should feel like it helps the user think, not like it asks the user to organize information.

Open Loops should feel:

- Spacious
- Calm
- Organic
- Alive
- Curious
- Personal
- Light enough to enter quickly

## Visual Hierarchy

The Home Screen hierarchy should be:

1. Relationship with Lumi
2. Immediate thought capture
3. Open Loops as living subjects
4. Suggested connection or insight
5. Recent activity and spotlighted continuation
6. Navigation to deeper areas

## Lumi Presence

Lumi should appear intelligent and comforting without pretending to be human.

The MVP direction is a glowing thought bubble wearing headphones. The headphones symbolize listening. The bubble symbolizes consciousness, curiosity, thoughts, and imagination.

## Bubble Workspace

The bubble workspace is a defining UX direction for Open Loops.

It should resemble constellations or molecules rather than folders, dashboards, databases, or productivity boards.

## Implementation Guidance

Implementations may adjust spacing, layout, responsiveness, copy, and visual polish as needed.

The goal is not to copy the static mockup exactly. The goal is to translate its intent into a usable product interface that preserves the same feeling, hierarchy, and interaction model.

Implementations should not casually remove or reinterpret:

- Lumi as the relationship entry point
- Talk to Lumi as the primary action
- Open Loops as bubbles
- Visual relationships between loops
- The calm, luminous, spacious tone
- The bottom navigation model
- The distinction between Home, Loops, Lumi, Universe, and Me

### Business DNA Continuity Card

When no calibration exists, Home presents Business DNA as a clear starting action. After the first session begins, that entry becomes a compact continuity card driven by saved session state. It shows whether the calibration is in progress, ready for feedback, or complete; gives the relevant continuation action; and exposes saved-session count without turning Home into a dense administrative dashboard.

The completed profile is the payoff of calibration. It should open without artificial vertical delay, lead with a saved-state summary, and present the ten canonical sections as a readable narrative before the collapsed evidence and provenance record.

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved UX decisions, including the July 2, 2026 canonical Home Screen reference decision.

## Related Documents

- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [User Journey](USER_JOURNEY.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Home Screen Notes](UI_REFERENCE/HomeScreen_notes.md)
- [UX Vision History](UI_REFERENCE/UX_VISION_HISTORY.md)

## Open Questions

- Which visual details are essential to preserve across mobile and desktop?
- How should the bubble workspace adapt on smaller screens?
- How much animation should be present in Version 1?
- Should the first MVP ship with both Bubbles and List views, or should one be primary during early testing?

## Version 1 Boundaries

- The mockup is not a pixel-perfect implementation spec.
- Version 1 should not overbuild the Universe view.
- Version 1 should not expose advanced Emotional DNA visuals.
- Version 1 should not introduce dense dashboard, folder, or database-style UI patterns.

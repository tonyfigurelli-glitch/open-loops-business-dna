# Open Loops Product

Status: Draft v1.0
Last Updated: 2026-07-05
Owner: Founder / Product

## Purpose

Define the customer experience and the core product philosophy for Open Loops.

## Product Definition

Open Loops is a personal understanding platform.

It combines journaling, reflection, pattern recognition, and long-term memory to help people better understand themselves and, over time, better understand the people around them.

It is a new category of software whose purpose is to help people capture thoughts, connect ideas, and gradually discover patterns within their own thinking.

Open Loops is not a chatbot.

Open Loops is not a diary.

Open Loops is not therapy.

It is a relationship that grows through conversation.

Open Loops does not organize information.

Open Loops organizes thinking.

## The Product Promise

Every meaningful interaction should leave the user feeling one of three things:

- I learned something about myself.
- I saw another perspective.
- I asked a better question than I would have yesterday.

If none of these happen, the interaction should be considered incomplete.

## Version 1 Goal

Create the first digital experience that genuinely becomes more valuable as it gets to know its user.

The first version should prove one idea:

**Accumulated understanding creates extraordinary value.**

## The First-Time User Experience

A new user downloads Open Loops because they are curious.

They are not asked to complete a long personality assessment.

Instead, they begin with a simple journal entry or conversation.

The system learns naturally through ongoing interaction.

Understanding is earned, not assumed.

## The Core Experience

The product revolves around four continuous activities.

### 1. Journal

The user records thoughts, observations, experiences, memories, or questions.

Entries may be typed, spoken, or uploaded through supported input methods.

### 2. Reflect

The system responds with thoughtful questions rather than immediate conclusions.

Its purpose is to encourage deeper thinking and help users notice patterns they might otherwise overlook.

### 3. Discover

As conversations accumulate, Open Loops identifies recurring emotional and behavioral patterns.

Insights become increasingly personalized and increasingly accurate.

### 4. Understand

Over time, the application develops an Emotional DNA profile.

Eventually, this foundation enables perspective translation between people.

## Product Positioning

Do not market Open Loops as:

- AI companion
- AI journal
- Therapy app

Instead, position it as:

**The most beautiful way to capture and connect your thoughts.**

The deeper AI capabilities should feel discovered rather than advertised.

## Lumi

Lumi is not human.

Lumi is not an alien.

Lumi is a glowing thought bubble wearing headphones.

The headphones symbolize listening.

The bubble symbolizes consciousness, curiosity, thoughts, and imagination.

The character should feel intelligent and comforting without pretending to be a person.

## Open Loops

Open Loops replace the traditional concept of a journal.

Instead of chronological entries, each Open Loop represents one evolving subject.

Examples include:

- Financial Freedom
- Andrew
- Restaurant Consulting
- Health
- Podcast
- Book Ideas
- Travel
- Emotional DNA

Each loop accumulates:

- Conversations
- Voice notes
- Thoughts
- Observations
- AI insights

Everything connected to that idea remains together.

## Open Loop Lifecycle

Thought -> Open Loop -> Growing Open Loop -> Project -> Completed Project -> Knowledge

Users never need to decide immediately whether something is important.

Ideas naturally mature.

## Bubble Interface

Open Loops appear as floating bubbles.

Each bubble represents one evolving subject.

Bubble size reflects depth or activity.

Bubbles gently drift.

Clusters naturally emerge.

Bubbles can slowly move toward each other.

Lumi may suggest:

> "These two Open Loops have been getting closer."

The user may merge them, connect them, or keep them separate.

The interface should resemble constellations or molecules rather than folders.

## Home Screen

The Home screen should remain intentionally simple:

- Greeting from Lumi
- Large Talk to Lumi button
- One personalized insight
- One Open Loop spotlight
- Minimal navigation

The goal is to enter relationship first and discover functionality later.

The current canonical Home Screen UX reference is [HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png). Implementations should preserve the interaction model, visual hierarchy, and philosophy shown there unless intentionally revised.

## Primary Entry Modes

Open Loops has two primary entry modes. They should remain conceptually separate.

### Enter a Thought

Enter a Thought is quick capture.

It captures and stores a dated thought, memory, question, feeling, idea, reflection, or possible Open Loop.

It does not require Lumi to respond conversationally.

It behaves more like journaling or lightweight capture. These thoughts should eventually be reviewable by date, and a thought can eventually become or connect to an Open Loop.

### Chat with Lumi

Chat with Lumi is true conversational mode.

It opens or continues a Chat Session, stores ordered Chat Messages, and must eventually allow Lumi to respond to normal conversational input.

Chat with Lumi must preserve context within the active chat session. Follow-up questions should be interpreted through prior messages in that same session.

Chat with Lumi must not treat every user message as a disconnected new thought, and Lumi must not simply repeat or rehash the previous response.

Chat Sessions can later connect to Open Loops, recurring themes, prior thoughts, or prior chats.

Do not fully implement Lumi intelligence until a milestone explicitly asks for it, but preserve the product architecture so this conversational behavior can be implemented cleanly later.

## Navigation

Current navigation direction:

- Home
- Loops
- Lumi
- Universe
- Me

### Home

Daily greeting, today's insight, and quick entry point.

### Loops

Bubble workspace where ideas are captured and managed.

### Lumi

Dedicated conversation mode with no distractions.

### Universe

Zoomed-out visualization showing long-term evolution of thoughts and constellations of life themes.

Emotional DNA eventually appears here.

### Me

Settings, profile, subscriptions, and personal preferences.

## Universe View

Universe is not simply another bubble screen.

It is a zoomed-out perspective.

Instead of individual thoughts, users see their life themes.

Instead of activity, they see patterns.

Instead of notes, they see growth.

Universe is reflective rather than operational.

## AI Behavior

Lumi should constantly look for:

- Pattern recognition
- Repeated thoughts
- Emerging themes
- Relationships between Open Loops
- Contradictions
- Growth
- Possible emotional insights

Lumi should never be overly authoritative.

Instead, Lumi should use language like:

- "I wonder..."
- "I've noticed..."
- "This reminds me..."
- "You've returned to this several times."

Curiosity over certainty.

## Product Evolution

The customer journey is intentionally progressive.

Stage One: Journal

Stage Two: Reflection

Stage Three: Pattern Recognition

Stage Four: Emotional DNA

Stage Five: Self Understanding

Stage Six: Perspective Translation

Stage Seven: Relationship Understanding

The application should never rush users toward later stages.

Every stage earns the next.

## Progressive Feature Discovery

Avoid overwhelming users.

Do not expose every feature immediately.

Feature discovery should progress through:

1. Basic thoughts
2. Open Loops
3. Connections
4. Projects
5. Universe
6. Emotional DNA
7. Relationship Translation

The software should mature alongside the user.

## Premium Philosophy

The free experience must be genuinely useful.

Premium does not unlock a smarter AI.

Premium preserves continuity.

Subscribers receive:

- Persistent memory
- Emotional DNA growth
- Long-term pattern recognition
- Life timeline
- Relationship history
- Deeper personalization

Premium is the continuation of a relationship, not the removal of restrictions.

## Product Principles

Every feature should satisfy at least one of these principles.

### Curiosity

Encourage thoughtful questions.

### Reflection

Help users pause before reacting.

### Growth

Allow understanding to deepen over time.

### Trust

Never manipulate.

Always explain.

Always allow user control.

### Simplicity

The experience should feel calm, focused, and free of unnecessary complexity.

## What Open Loops Is Not

The product should avoid becoming:

- A social media platform
- A productivity app
- A generic AI assistant
- A mood tracker
- A personality test
- A replacement for professional mental health care

Its unique purpose is to help people understand themselves and each other.

## Success Metric

Version 1 succeeds when users consistently say:

> "I've never had an app notice something about me that felt this accurate."

That moment of recognition is the product's first emotional milestone.

## Decision References

- See [DECISIONS.md](DECISIONS.md) for approved product decisions, including Decision Log 001 from July 1, 2026.

## Related Documents

- [Open Loops Vision](OPEN_LOOPS_VISION.md)
- [User Journey](USER_JOURNEY.md)
- [UX](UX.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Open Loops Constitution](AGENTS.md)

## Open Questions

- What is the ideal onboarding length before the first journal entry?
- How should voice journaling and text journaling coexist?
- When should Emotional DNA first become visible to the user?
- What is the confidence threshold before the system begins offering perspective translation?
- What is the optimal point in the customer journey to introduce Premium?

## Version 1 Boundaries

Version 1 intentionally excludes:

- Emotional DNA
- Relationship Translation
- Advanced analytics
- Couple-to-couple translation
- Family sharing
- Enterprise collaboration
- Healthcare integrations
- Public social features
- Marketplace functionality
- Third-party developer platform

These remain future roadmap opportunities once the core experience has been validated.

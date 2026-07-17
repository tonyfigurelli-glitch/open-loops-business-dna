# Open Loops Reconstruction Brief

Status: Draft
Last Updated: 2026-07-09
Owner: Founder / Product

## Purpose

Provide a ChatGPT-ready reconstruction packet for rebuilding or rehydrating understanding of the Open Loops app after data loss.

This brief summarizes the known product vision, Version 1 scope, UX direction, data model, implementation state, and approved decisions from the Open Loops project documentation and current prototype.

## ChatGPT Prompt

Use the following context to reconstruct the Open Loops app, product direction, and implementation plan. Preserve the approved decisions, avoid inventing unapproved features, and keep Version 1 simple.

Open Loops exists to help people better understand themselves and each other.

The mission is not to make people agree. The mission is to help people understand.

Open Loops is not positioned as an AI company. AI is the enabling technology. Understanding is the product.

Open Loops does not organize information. Open Loops organizes thinking.

The official tagline is:

**Understanding Begins Here.**

The product one-liner is:

**The most beautiful way to capture and connect your thoughts.**

The long-term vision is to become a Universal Emotional Translator through Emotional DNA, long-term relationship memory, accumulated personal understanding, and perspective translation. The Version 1 product should not lead with that deeper capability. Version 1 should first prove that Open Loops can help a user capture thoughts, create Open Loops, talk to Lumi, and organize thinking through a calm bubble-based interface.

## Product Definition

Open Loops is a personal understanding platform.

It combines journaling, reflection, pattern recognition, and long-term memory to help people better understand themselves and, over time, better understand the people around them.

Open Loops is not:

- A chatbot
- A diary
- A therapy app
- An AI companion
- An AI journal
- A note-taking app

It is a relationship that grows through conversation.

Every meaningful interaction should leave the user feeling one of three things:

- I learned something about myself.
- I saw another perspective.
- I asked a better question than I would have yesterday.

If none of those happen, the interaction is incomplete.

## Core Philosophy

- Understanding over certainty
- Curiosity over judgment
- Build for humans, not technology
- Version 1 simplicity
- No feature without understanding
- Organize thinking, not information
- Curiosity before certainty
- Trust is essential
- Users own their stories

Lumi should ask before assuming. Confidence should grow only through accumulated interactions.

## User Journey

The long-term journey is:

1. Journal
2. Reflection
3. Pattern Recognition
4. Emotional DNA Development
5. Self Understanding
6. Perspective Translation
7. Relationship Understanding

The Version 1 journey begins with almost no barrier to entry:

- Day One: The app feels calm. Lumi greets the user. The obvious actions are Talk to Lumi and Capture a Thought.
- Week One: The user collects thoughts. Thoughts begin living inside Open Loops instead of isolated diary entries.
- Month One: Lumi begins noticing repeated themes and possible connections.
- Several Months: Open Loops connect, ideas mature, and some loops may become projects.

The product should mature alongside the user.

## Version 1 Scope

Version 1 should focus on:

- Authentication
- Home Screen
- Talk to Lumi
- Capture Thought
- Create Open Loop
- Bubble Interface
- List View
- Add Thought to Existing Loop
- Basic AI categorization
- Persistent storage

Version 1 should exclude:

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

## Lumi

Lumi is not human.

Lumi is not an alien.

Lumi is a glowing thought bubble wearing headphones.

The headphones symbolize listening. The bubble symbolizes consciousness, curiosity, thoughts, and imagination.

Lumi should feel intelligent and comforting without pretending to be a person.

Lumi should use curiosity-first language:

- "I wonder..."
- "I've noticed..."
- "This reminds me..."
- "You've returned to this several times."

Lumi should never be overly authoritative.

## Primary Entry Modes

Open Loops has two primary entry modes. They must remain conceptually separate.

### Enter a Thought

Enter a Thought is quick capture.

It creates a dated Thought record for a thought, memory, question, feeling, idea, reflection, or possible Open Loop.

It does not require Lumi to respond conversationally.

Thoughts can later connect to Open Loops, Chat Sessions, recurring themes, prior thoughts, or other records.

### Chat with Lumi

Chat with Lumi is true conversational mode.

It opens or continues a Chat Session.

It stores ordered Chat Messages.

It preserves context within the active Chat Session.

Future Lumi responses should be able to use prior messages in that same session, interpret follow-up questions, and avoid simply repeating the previous response.

Chat Messages should not be treated as disconnected standalone Thoughts by default.

Do not implement full Lumi intelligence until explicitly scoped, but preserve the architecture for it.

## Open Loops

Open Loops replace the traditional concept of a journal entry.

Instead of chronological entries, each Open Loop represents one evolving subject.

Example loops:

- Financial Freedom
- Family
- Health
- Lumi Podcast
- Book Idea
- Past Reflections
- Andrew
- Restaurant Consulting
- Travel
- Emotional DNA

Each Open Loop may accumulate:

- Conversations
- Voice notes
- Thoughts
- Observations
- AI insights

Open Loop lifecycle:

Thought -> Open Loop -> Growing Open Loop -> Project -> Completed Project -> Knowledge

Users should not need to decide immediately whether something is important. Ideas should be allowed to mature.

## Bubble Interface

Open Loops appear as floating bubbles.

Each bubble represents one evolving thought subject.

Bubble size can reflect depth or activity.

Bubble color can communicate state, tone, or lifecycle.

Bubbles gently drift and can form clusters.

Connections between loops can appear as lines, resembling constellations or molecules rather than folders, dashboards, databases, or productivity boards.

Lumi may suggest:

> "These two Open Loops have been getting closer."

The user may merge, connect, view, or keep them separate.

## Navigation

The current navigation model is:

- Home
- Loops
- Lumi
- Universe
- Me

Home is the daily greeting, today's insight, and quick entry point.

Loops is the bubble workspace where ideas are captured and managed.

Lumi is the dedicated conversation mode.

Universe is a future zoomed-out visualization showing long-term evolution, life themes, patterns, and eventually Emotional DNA. It is reflective, not operational.

Me is settings, profile, subscriptions, and personal preferences.

## Home Screen UX

The canonical Version 1 UX reference is:

- `UI_REFERENCE/HomeScreen_v1.png`
- Also preserved as `UI_REFERENCE/UX_Vision_0.1.png`
- Annotated references: `UI_REFERENCE/HomeScreen_v1_annotated.svg` and `UI_REFERENCE/UX_Vision_0.1_annotated.svg`

The mockup is a design north star, not pixel-perfect artwork. Preserve the philosophy, interaction model, visual hierarchy, and feeling, while allowing practical implementation choices.

The Home Screen should include:

- Personalized Lumi greeting
- Calm first impression
- Prominent Talk to Lumi input or entry path
- Visible Lumi character presence
- Open Loops bubble workspace
- Bubbles representing evolving thought subjects
- Bubble size and color communicating state, depth, or activity
- Connection lines between related loops
- Bubbles/List view toggle where appropriate
- New Loop action
- Lumi insight card
- Recent Thought card
- Open Loop Spotlight card
- Bottom navigation with Home, Loops, Lumi, Universe, Me

The visual hierarchy is:

1. Relationship with Lumi
2. Immediate thought capture
3. Open Loops as living subjects
4. Suggested connection or insight
5. Recent activity and spotlighted continuation
6. Navigation to deeper areas

The experience should feel spacious, calm, organic, alive, curious, personal, and light enough to enter quickly.

Do not turn the interface into dense folders, a database, a dashboard, or a productivity board.

## Conceptual Data Model

Core entities:

- User
- Thought
- Open Loop
- Chat Session
- Chat Message
- Loop Connection
- AI Insight
- Loop Status
- Timeline Event

Thought:

- A dated quick-capture record.
- Distinct from Chat Messages.
- Can connect to Open Loops, Chat Sessions, Timeline Events, themes, and other thoughts.

Chat Session:

- A contextual Lumi conversation.
- Contains ordered Chat Messages.
- Preserves enough continuity for future Lumi behavior.

Chat Message:

- An ordered user or Lumi message inside a Chat Session.
- Not a standalone Thought by default.

Open Loop:

- An evolving subject that can collect thoughts, conversations, observations, voice notes, and insights.

Loop Connection:

- Represents a relationship between two loops, supported by thoughts, chat sessions, tags, themes, and a confidence level.

AI Insight:

- A curiosity-first observation surfaced by Lumi or the system.
- Should not sound prescriptive or overconfident.

Data principles:

- Preserve continuity.
- Support accumulated understanding.
- Keep Version 1 simple.
- Avoid modeling full Emotional DNA before the MVP foundation is validated.

## Current Prototype Implementation

The current prototype is a Vite React TypeScript app.

Package setup:

- React 19
- React DOM 19
- TypeScript 5.8
- Vite 7
- No backend yet
- Prototype persistence through browser `localStorage`

Primary source files:

- `src/App.tsx`
- `src/domain/models.ts`
- `src/data/seed.ts`
- `src/storage/prototypeStorage.ts`
- `src/screens/Home.tsx`
- `src/screens/Loops.tsx`
- `src/screens/Lumi.tsx`
- `src/screens/ThoughtCapture.tsx`
- `src/screens/ThoughtLibrary.tsx`
- `src/screens/Me.tsx`
- `src/components/BubbleWorkspace.tsx`
- `src/components/ChatComposer.tsx`
- `src/components/ChatMessageList.tsx`
- `src/domain/lumiMockResponse.ts`
- `src/styles.css`

Existing app surfaces:

- Home
- Loops
- Lumi
- Universe placeholder
- Me
- Thought Capture
- Thought Library

Current prototype behaviors:

- Home shows greeting, Lumi presence, entry paths, bubble workspace, connection insight, recent thought, and spotlight loop.
- Enter Thought creates a dated Thought and stores it in local prototype state.
- Thought Library searches thoughts, edits thought text, and connects thoughts to Open Loops.
- Loops screen creates Open Loops, toggles bubble/list view, selects loop detail, and links thoughts to loops.
- Lumi screen supports multiple chat sessions, ordered messages, and local mock Lumi responses.
- Chat with Lumi keeps messages inside Chat Sessions and does not save them as Thoughts.
- Me screen supports resetting prototype data.
- Universe is currently a placeholder.

Current localStorage key:

`open-loops.prototype-state.v1`

## Current TypeScript Model Shape

Source type:

- `thought`
- `chat`
- `manual`
- `system`

Loop status:

- `new`
- `active`
- `growing`
- `ready`
- `archived`

Confidence level:

- `low`
- `medium`
- `high`

Bubble tone:

- `violet`
- `blue`
- `green`
- `orange`
- `silver`

Bubble size:

- `large`
- `medium`
- `small`

Thought fields:

- id
- title
- body
- createdAt
- updatedAt
- sourceType
- relatedThoughtIds
- relatedLoopIds
- relatedChatSessionIds
- tags
- themes

OpenLoop fields:

- id
- title
- description
- status
- createdAt
- updatedAt
- thoughtCount
- relatedThoughtIds
- relatedLoopIds
- relatedChatSessionIds
- tags
- themes
- bubble: tone, size, x, y

ChatSession fields:

- id
- title
- createdAt
- updatedAt
- relatedThoughtIds
- relatedLoopIds
- relatedChatSessionIds
- tags
- themes

ChatMessage fields:

- id
- chatSessionId
- role: user or lumi
- content
- createdAt
- sourceType
- relatedThoughtIds
- relatedLoopIds
- tags
- themes

LoopConnection fields:

- id
- loopIds
- connectionReason
- confidenceLevel
- createdAt
- updatedAt
- relatedThoughtIds
- relatedChatSessionIds
- tags
- themes

Insight fields:

- id
- title
- body
- createdAt
- sourceType
- confidenceLevel
- relatedThoughtIds
- relatedLoopIds
- relatedChatSessionIds
- connectionId
- tags
- themes

TimelineEvent fields:

- id
- title
- body
- createdAt
- sourceType
- relatedThoughtIds
- relatedLoopIds
- relatedChatSessionIds
- tags
- themes

## Prototype Seed Data

User:

- First name: Tony
- Greeting: Good morning, Tony
- Lumi prompt: What shall we explore?

Entry paths:

- Enter Thought: Capture something.
- Chat with Lumi: Talk it through.

Seed thoughts:

- Simplifying my life
- Health routine

Seed Open Loops:

- Financial Freedom: growing, 31 thoughts
- Family: active, 24 thoughts
- Health: growing, 16 thoughts
- Lumi Podcast: active, 22 thoughts
- Book Idea: ready, 18 thoughts
- Past Reflections: archived, 9 thoughts

Seed chat sessions:

- Freedom and health
- Lumi voice

Seed insight:

- Financial Freedom and Health: "These two loops have been getting closer."

Seed connection:

- Financial Freedom + Health, because both keep returning to energy, autonomy, and simplicity.

## Approved Decisions To Preserve

2026-07-01:

- Company name is Open Loops.
- Tagline is Understanding Begins Here.
- Mission is to help people better understand themselves and each other.
- Open Loops is not positioned as an AI company.
- Understanding is the product.
- Emotional DNA is foundational long-term technology.
- Premium is based on continuity, not smarter AI.
- Journaling is the entry strategy.
- Version 1 should make a user say: "This app understands me better than anything I've ever used."
- Markdown docs and a permanent decision log are the project documentation system.
- AGENTS.md is the project constitution.

2026-07-02:

- MVP direction is the most intuitive and visually beautiful way to capture, organize, and evolve thoughts.
- Version 1 excludes Emotional DNA, Relationship Translation, and advanced analytics.
- Lumi is a glowing thought bubble wearing headphones.
- Open Loops are evolving subjects, not diary entries.
- Bubble interface resembles constellations or molecules, not folders.
- Home screen is simple: Lumi greeting, Talk to Lumi, one insight, one spotlight, minimal navigation.
- Navigation is Home, Loops, Lumi, Universe, Me.
- Universe is a reflective zoomed-out view.

2026-07-02:

- `UI_REFERENCE/HomeScreen_v1.png` is the official Version 1 UX reference.

2026-07-03:

- The Home Screen mockup is a design direction, not a pixel-perfect spec.
- Preserve UX philosophy over exact reproduction.
- UX artifacts should be versioned.
- Do not overwrite historical UX Vision artifacts.

2026-07-05:

- Chat with Lumi must be true conversational mode.
- Enter a Thought is quick dated capture.
- Chat with Lumi opens or continues a Chat Session, stores ordered Chat Messages, preserves active-session context, and eventually supports contextual follow-ups and non-repetitive Lumi responses.

## Reconstruction Priorities

If rebuilding from scratch, prioritize in this order:

1. Restore the documentation structure and decision log.
2. Recreate the React/Vite/TypeScript prototype shell.
3. Implement the conceptual data model.
4. Implement local prototype persistence.
5. Build Home around Lumi, entry paths, bubble workspace, insight, recent thought, and spotlight loop.
6. Implement Enter a Thought as quick capture.
7. Implement Thought Library search, edit, and connect-to-loop.
8. Implement Loops with create loop, bubble/list toggle, loop detail, and thought linking.
9. Implement Lumi as ordered Chat Sessions and Chat Messages with mock responses.
10. Keep Universe as a placeholder until the core Home and Loops workflows are validated.

## Important Boundaries

Do not make Open Loops feel like:

- A generic AI chatbot
- A generic journal
- A therapy app
- A note-taking database
- A productivity dashboard
- A social network

Do not expose Emotional DNA or Relationship Translation in Version 1.

Do not overbuild graph physics, advanced analytics, or long-term AI systems before thought capture and Open Loops are usable.

Do not collapse Enter a Thought and Chat with Lumi into the same behavior.

Do not treat Lumi as human.

Do not overwrite UX history artifacts.

## Related Documents

- [Open Loops Constitution](AGENTS.md)
- [Open Loops Vision](OPEN_LOOPS_VISION.md)
- [Product Vision](PRODUCT_VISION.md)
- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [UX](UX.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [User Journey](USER_JOURNEY.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Architecture](ARCHITECTURE.md)
- [Data Model](DATA_MODEL.md)
- [MVP Tasks](MVP_TASKS.md)
- [Investor Pitch](INVESTOR_PITCH.md)
- [Decisions](DECISIONS.md)
- [Home Screen Notes](UI_REFERENCE/HomeScreen_notes.md)
- [UX Vision History](UI_REFERENCE/UX_VISION_HISTORY.md)

## Open Questions

- Which backend/storage architecture should replace prototype localStorage?
- Which fields are required for production-ready Thought, Open Loop, Chat Session, and Chat Message records?
- What is the first scoped milestone for real Lumi intelligence?
- How should basic AI categorization be implemented without overbuilding Emotional DNA?
- How should account recovery, privacy, export, and deletion work?

## Version 1 Boundaries

- Preserve thought capture, Open Loops, Lumi chat sessions, bubble/list navigation, and persistent storage as the MVP core.
- Keep Emotional DNA, Relationship Translation, advanced analytics, and Universe depth deferred.
- Keep design calm, organic, spacious, alive, and centered on understanding.

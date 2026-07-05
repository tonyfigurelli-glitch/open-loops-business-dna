# Decisions

Status: Approved
Last Updated: 2026-07-03
Owner: TBD

## Purpose

Maintain the permanent chronological history of approved Open Loops product, design, technical, documentation, and business decisions.

## Document Use

Use this file only for decisions that have been finalized or explicitly approved. Exploratory ideas belong in the relevant project document as placeholders or open questions until they become decisions.

Every entry should include:

- Date
- Decision summary
- Rationale or context
- Affected file references
- Follow-up items, if any

## Entry Template

### YYYY-MM-DD: Decision Title

**Decision:** TBD

**Rationale:** TBD

**Affected Files:**

- TBD

**Follow-Up:** TBD

## Log

### 2026-07-03: Version UX Vision Artifacts

**Decision:** The current Home Screen visual direction will be preserved as **Open Loops UX Vision 0.1**. Meaningful future design leaps should create new visual versions such as `UX Vision 0.2`, `UX Vision 0.3`, and eventually `UX Vision 1.0`.

**Rationale:** The constellation interface is a milestone in the product's evolution: the moment Open Loops began to become its own category rather than simply being interpreted as an AI app. Versioning UX artifacts preserves the visual history of that evolution and prevents future refinements from erasing important design lineage.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/UX_VISION_HISTORY.md](UI_REFERENCE/UX_VISION_HISTORY.md)
- [UI_REFERENCE/UX_Vision_0.1.png](UI_REFERENCE/UX_Vision_0.1.png)
- [UI_REFERENCE/UX_Vision_0.1_annotated.svg](UI_REFERENCE/UX_Vision_0.1_annotated.svg)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Do not overwrite historical UX Vision artifacts. When the product makes a meaningful design leap, add a new versioned visual reference and update the UX Vision History.

### 2026-07-03: Preserve UX Philosophy Over Pixel-Perfect Mockup Reproduction

**Decision:** The Home Screen mockup should not be reproduced pixel-for-pixel. It is a design direction, not a finished visual design. Implementations should preserve the philosophy behind the layout: organic, calm, spacious, alive, visually clear, and technically practical.

**Rationale:** Treating the mockup as a literal artifact would risk overfitting to one static image instead of building a usable product. The mockup should align teams around interaction model, hierarchy, tone, and product philosophy while still allowing practical implementation decisions.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UI implementation work should cite the mockup for intent and hierarchy, not exact pixels, unless a later approved design spec explicitly requires pixel-level fidelity.

### 2026-07-03: Add Annotated HomeScreen v1 UX Reference

**Decision:** Open Loops will maintain an annotated version of the canonical Home Screen mockup at `UI_REFERENCE/HomeScreen_v1_annotated.svg`, with numbered callouts explaining the purpose behind Lumi, Talk to Lumi, the bubble workspace, the insight card, and navigation.

**Rationale:** The unannotated mockup shows what the MVP should feel like. The annotated reference explains why the key elements exist, reducing ambiguity for engineers, designers, and AI coding agents when translating the visual direction into implementation.

**Affected Files:**

- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_v1_annotated.svg](UI_REFERENCE/HomeScreen_v1_annotated.svg)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UI reference updates should include both visual changes and updated annotations when the rationale changes.

### 2026-07-02: Approve HomeScreen v1 As Canonical MVP UX Reference

**Decision:** `UI_REFERENCE/HomeScreen_v1.png` is the official Version 1 UX reference for the Open Loops MVP. It is a design north star, not pixel-perfect artwork. Future implementations should preserve the underlying interaction model, visual hierarchy, and philosophy unless intentionally revised.

**Rationale:** Engineers, designers, and AI coding agents may interpret prose differently, but a shared visual reference communicates dozens of UX decisions more consistently. The mockup anchors the MVP around Lumi, Talk to Lumi, Open Loops as bubbles, connection insights, recent thoughts, Open Loop spotlight, and the Home / Loops / Lumi / Universe / Me navigation model.

**Affected Files:**

- [PRODUCT_VISION.md](PRODUCT_VISION.md)
- [UX.md](UX.md)
- [UI_REFERENCE/HomeScreen_v1.png](UI_REFERENCE/HomeScreen_v1.png)
- [UI_REFERENCE/HomeScreen_notes.md](UI_REFERENCE/HomeScreen_notes.md)
- [DATA_MODEL.md](DATA_MODEL.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [MVP_TASKS.md](MVP_TASKS.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future UX refinements should update the reference image or notes deliberately and add a new decision entry when the canonical direction changes.

### 2026-07-02: Add MVP Vision And Product Direction To Core Structure

**Decision:** Open Loops will enter the market as the most intuitive and visually beautiful way to capture, organize, and evolve thoughts, while preserving the long-term vision of becoming a Universal Emotional Translator.

**Rationale:** The MVP should not lead with the deepest long-term AI capabilities. It should first prove that Open Loops helps people think by capturing thoughts, connecting ideas, and gradually discovering patterns. The AI relationship should develop naturally from that foundation.

**Approved Direction:**

- Open Loops is not another AI chatbot, journaling app, note-taking app, AI companion, AI journal, or therapy app.
- Open Loops organizes thinking, not information.
- Product positioning: the most beautiful way to capture and connect your thoughts.
- Version 1 should focus on authentication, Home Screen, Talk to Lumi, Capture Thought, Create Open Loop, Bubble Interface, List View, Add Thought to Existing Loop, Basic AI categorization, and persistent storage.
- Version 1 should not include Emotional DNA, Relationship Translation, or advanced analytics.
- Lumi is a glowing thought bubble wearing headphones, symbolizing listening, consciousness, curiosity, thoughts, and imagination.
- Open Loops replace traditional journal entries with evolving subjects that accumulate conversations, voice notes, thoughts, observations, and AI insights.
- The bubble interface is a defining innovation and should resemble constellations or molecules rather than folders.
- The Home screen should remain simple: Lumi greeting, Talk to Lumi, one personalized insight, one Open Loop spotlight, and minimal navigation.
- Navigation direction: Home, Loops, Lumi, Universe, Me.
- Universe is a reflective, zoomed-out perspective for life themes, patterns, growth, and eventually Emotional DNA.
- Lumi should use curiosity-first language and avoid sounding overly authoritative.
- Progressive feature discovery should mature alongside the user.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Keep Emotional DNA and Relationship Translation visible as long-term direction, but out of Version 1 until the core thought-capture and Open Loop foundation is validated.

### 2026-07-01: Define Open Loops Product Draft v1.0

**Decision:** `OPEN_LOOPS_PRODUCT.md` was updated to Draft v1.0, owned by Founder / Product, defining Open Loops as a personal understanding platform with a core experience built around journaling, reflection, discovery, and understanding.

**Rationale:** The product document now clarifies the customer experience and core product philosophy for Version 1: accumulated understanding creates extraordinary value, the product should grow through conversation, Premium should preserve continuity, and the experience should remain focused on curiosity, reflection, growth, trust, and simplicity.

**Affected Files:**

- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Related user journey, Emotional DNA, roadmap, technical, and investor documents should remain aligned with this product definition as they are updated.

### 2026-07-01: Add Open Questions And Version 1 Boundaries To Every Document

**Decision:** Every Open Loops markdown document will end with `Open Questions` and `Version 1 Boundaries`.

**Rationale:** These sections preserve unresolved ideas without allowing them to distract from Version 1. They make intentional uncertainty visible while protecting the project from scope creep.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future documentation updates should keep these two sections as the final sections of every project markdown file.

### 2026-07-01: Define Open Loops Vision Draft v1.0

**Decision:** `OPEN_LOOPS_VISION.md` was updated to Draft v1.0, owned by the Founder, defining the long-term vision, mission, problem framing, belief system, solution direction, core principles, user journey, and long-term ambition for Open Loops.

**Rationale:** The project needs a coherent vision document that anchors future product, design, technical, and business decisions around human understanding, curiosity before certainty, accumulated understanding, trust, simplicity, and technology in service of human relationships.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Related product, Emotional DNA, journey, roadmap, investor, and technical documents should continue to align with this vision as they are updated.

### 2026-07-01: Decision Log 001 - Foundational Company And Product Direction

**Decision:** Open Loops approved its foundational company and product direction, including the company name, official tagline, mission, brand philosophy, product vision, customer journey, product hook, Emotional DNA direction, premium strategy, discovery phase, business philosophy, competitive advantage, branding direction, documentation strategy, development workflow, and Version 1 guiding principle.

**Rationale:** This session marked the transition of Open Loops from a conceptual idea into the foundation of a product company. The focus shifted away from brainstorming individual features toward establishing the permanent architecture, philosophy, branding, monetization strategy, and development workflow that will guide Version 1.

**Approved Decisions:**

- Company name: Open Loops.
- Official tagline: Understanding Begins Here.
- Mission: Open Loops exists to help people better understand themselves and each other.
- Mission boundary: The mission is not to make people agree. The mission is to help people understand.
- Brand philosophy: Open Loops is not positioned as an AI company. AI is the enabling technology. Understanding is the product.
- Product vision: The application is designed to become increasingly valuable as it learns the individual over time.
- Product concept: Open Loops is currently envisioned as the world's first Universal Emotional Translator through the development of Emotional DNA and long-term relationship memory.
- Customer journey: Journal, Reflection, Pattern Recognition, Emotional DNA Development, Self Understanding, Perspective Translation, Relationship Understanding.
- Product hook: Come for the journal. Stay for the understanding. Change through the translation.
- Entry strategy: Journaling is the primary customer acquisition strategy because it is already familiar behavior for millions of people.
- Emotional DNA: Emotional DNA remains the foundational technology behind Open Loops.
- Emotional model behavior: Confidence should increase only through accumulated interactions; the application should prefer curiosity over certainty; questions should become progressively more confident as understanding improves.
- Premium strategy: Premium is not based on smarter AI. Premium is based on continuity.
- Premium value: Subscription value comes from long-term memory, Emotional DNA growth, relationship history, pattern recognition over time, life timeline, and accumulated understanding.
- Discovery phase: The application should first earn trust before asking users to subscribe.
- Business philosophy: Understanding is not purchased. It is built.
- Competitive moat: The moat consists of Emotional DNA, long-term relationship memory, accumulated personal understanding, trust, proprietary methods, and historical context developed over years.
- Branding direction: The logo direction is two open loops, two perspectives, connection through translation, curiosity before certainty, and clean timeless design.
- Branding boundary: Avoid visual references that make the company appear to be exclusively a journaling application; the journal is a product feature rather than the company's visual identity.
- Documentation strategy: Open Loops will be developed using permanent Markdown documentation.
- Development workflow: ChatGPT supports product vision, strategy, UX philosophy, branding, business model, founder discussions, and architecture decisions. Codex maintains documentation, updates Markdown files, implements architecture, builds software, and maintains the codebase.
- Version 1 guiding principle: The objective of Version 1 is not to build every envisioned capability. The objective is to create an application that causes a user to say, "This app understands me better than anything I've ever used."

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Continue to update the appropriate project document and this decisions log whenever a product, design, technical, documentation, or business decision is finalized.

### 2026-07-01: Initialize Documentation Framework

**Decision:** Open Loops will use a structured markdown documentation system with defined purposes, status metadata, placeholders, cross references, and a permanent decisions log.

**Rationale:** The project needs a disciplined knowledge system where each insight has a home, every approved decision is recorded, and future conversations can move the project forward without repeatedly redesigning settled ideas.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future finalized decisions should update both the appropriate project document and this decisions log.

### 2026-07-01: Define AGENTS.md As The Open Loops Constitution

**Decision:** `AGENTS.md` will define the project mission, documentation workflow, coding philosophy, development workflow, and instructions for maintaining documentation when decisions are finalized.

**Rationale:** Future Codex conversations need a shared operating constitution so documentation and implementation work remain aligned with the project's mission and decision history.

**Affected Files:**

- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** Future Open Loops work should review `AGENTS.md` before making documentation or implementation changes.

### 2026-07-01: Establish Document Status Metadata

**Decision:** Every Open Loops markdown file will begin with `Status`, `Last Updated`, and `Owner`.

**Rationale:** Status metadata clarifies whether a document is draft or approved, who owns it, and when it last changed.

**Affected Files:**

- [OPEN_LOOPS_VISION.md](OPEN_LOOPS_VISION.md)
- [OPEN_LOOPS_PRODUCT.md](OPEN_LOOPS_PRODUCT.md)
- [EMOTIONAL_DNA.md](EMOTIONAL_DNA.md)
- [USER_JOURNEY.md](USER_JOURNEY.md)
- [VERSION1_ROADMAP.md](VERSION1_ROADMAP.md)
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- [INVESTOR_PITCH.md](INVESTOR_PITCH.md)
- [AGENTS.md](AGENTS.md)
- [DECISIONS.md](DECISIONS.md)

**Follow-Up:** When a document is approved, update its `Status` to `Approved` only when explicitly requested.

## Related Documents

- [Open Loops Vision](OPEN_LOOPS_VISION.md)
- [Open Loops Product](OPEN_LOOPS_PRODUCT.md)
- [Emotional DNA](EMOTIONAL_DNA.md)
- [User Journey](USER_JOURNEY.md)
- [Version 1 Roadmap](VERSION1_ROADMAP.md)
- [Technical Architecture](TECHNICAL_ARCHITECTURE.md)
- [Investor Pitch](INVESTOR_PITCH.md)
- [Open Loops Constitution](AGENTS.md)

## Open Questions

- TBD

## Version 1 Boundaries

- TBD

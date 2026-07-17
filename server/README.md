# Open Loops Version 1 API

Status: Approved Working Implementation
Last Updated: 2026-07-17
Owner: TBD

## Purpose

Document the minimum co-located API used for authenticated calibration storage and secure model generation. This server is part of the Open Loops application; it is not a separate Business DNA product.

## Local Operation

Run `pnpm run server:dev` and `pnpm run dev` in separate terminals. Vite proxies `/api` to the local API on port `8787`.

The development authentication route is available only when `OPEN_LOOPS_ALLOW_DEVELOPMENT_AUTH=true` and is rejected when `NODE_ENV=production`.

## Configuration

- `OPEN_LOOPS_DATABASE_PATH`: required SQLite file path.
- `OPEN_LOOPS_SESSION_SECRET`: required encryption secret for opaque, authenticated HttpOnly session cookies.
- `OPEN_LOOPS_ALLOW_DEVELOPMENT_AUTH`: optional local-only identity adapter.
- `OPEN_LOOPS_PUBLIC_ORIGIN`: required HTTPS origin in production.
- `OPEN_LOOPS_AUTH_MODE`: must be `external` in production after an identity adapter is approved.
- `MODEL_PROVIDER_URL`: optional approved structured-generation endpoint. Its absence activates deterministic fallback.
- `MODEL_PROVIDER_API_KEY`: required when a model-provider URL is configured; server-only.
- `MODEL_IDENTIFIER`: required when a model-provider URL is configured.
- `MODEL_PROVIDER_NAME`: optional provenance label.
- `MODEL_PROVIDER_TYPE`: `openai_responses` or `configured_http`; defaults to the vendor-neutral HTTP adapter.
- `PORT`: optional API port; defaults to `8787`.

Production must supply an approved authentication adapter or gateway identity and must not enable development authentication. The current SQLite implementation requires a persistent single-instance filesystem. A multi-instance or serverless deployment should replace the storage adapter with hosted PostgreSQL while preserving the same ownership and immutability contracts.

Production startup intentionally fails until the approved external identity adapter is installed. Required production secrets must come from the deployment secret manager, and the database path must be absolute and persistent.

## Pilot Operations

The operator-only `server/pilotOperations.mjs` command supports SQLite backup, complete participant export, and confirmed participant deletion. Deletion requires `OPEN_LOOPS_CONFIRM_DELETE` to equal the exact target user ID. The evaluation harness stores reviewer scores and manually supplied comparison outputs in a separate table.

## Security Boundary

Every data route authenticates the request and scopes database access by user ID. Generation accepts only the exact canonical current-session evidence package, reconstructs it server-side, rejects mismatches, loads instructions on the server, size-limits JSON requests, validates structured output, retries once, and falls back deterministically. The API does not accept arbitrary prompts or prior-chat context.

## Related Documents

- [Technical Architecture](../TECHNICAL_ARCHITECTURE.md)
- [Data Model](../DATA_MODEL.md)
- [Business DNA Instructions](../Business%20DNA/AGENTS.md)
- [Decisions Log](../DECISIONS.md)
- [Pilot readiness](../Business%20DNA/calibrations/small-business-owner/PILOT_READINESS.md)
- [Pilot acceptance test](../Business%20DNA/calibrations/small-business-owner/PILOT_ACCEPTANCE_TEST.md)

## Open Questions

- Which production identity provider and deployment platform will be approved?
- Will production use a persistent single instance or require hosted PostgreSQL?

## Version 1 Boundaries

- No general-purpose model endpoint is exposed.
- No cross-session context, prior chats, outside research, or unrelated account data enters calibration generation.
- Development authentication is not a production identity system.

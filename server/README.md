# Open Loops Version 1 API

Status: Approved Working Implementation
Last Updated: 2026-07-18
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
- `OPEN_LOOPS_AUTH_MODE`: must be `external` in production.
- `OPEN_LOOPS_TRUSTED_PROXY_SECRET`: required high-entropy production secret injected by the authenticated reverse proxy; never sent by browser code.
- `OPEN_LOOPS_TRUSTED_USER_HEADER`: identity header injected by the authenticated reverse proxy; defaults to `x-open-loops-user-id`.
- `OPEN_LOOPS_STATIC_ROOT`: built frontend directory; defaults to `dist`.
- `MODEL_PROVIDER_URL`: optional approved structured-generation endpoint. Its absence activates deterministic fallback.
- `MODEL_PROVIDER_API_KEY`: required when a model-provider URL is configured; server-only.
- `MODEL_IDENTIFIER`: required when a model-provider URL is configured.
- `MODEL_PROVIDER_NAME`: optional provenance label.
- `MODEL_PROVIDER_TYPE`: `openai_responses` or `configured_http`; defaults to the vendor-neutral HTTP adapter.
- `MODEL_PROVIDER_TIMEOUT_MS`: per-attempt provider timeout from `30000` through `600000` milliseconds; defaults to `180000` for the full ten-section strict structured result.
- `PORT`: optional API port; defaults to `8787`.
- `HOST`: bind address; defaults to `127.0.0.1`, while the container sets `0.0.0.0`.

Production must run behind an approved identity-aware reverse proxy or gateway. The proxy must authenticate the user, strip client-supplied identity/proxy-secret headers, and inject the stable user ID plus `x-open-loops-proxy-secret` over a private upstream connection. Requests missing either value receive HTTP 401. The Node service must not be exposed through a route that bypasses the proxy. Development authentication remains disabled in production.

The current SQLite implementation requires one service instance and a mounted persistent filesystem. A multi-instance or serverless deployment should replace the storage adapter with hosted PostgreSQL while preserving the same ownership and immutability contracts. Production startup fails when HTTPS origin, absolute database path, session secret, external auth mode, trusted proxy secret, provider settings, host, port, or timeout settings are invalid. Required secrets must come from the deployment secret manager.

## Production Operation

`npm run start:production` builds Vite and starts Node. Node serves the resulting `dist` files, returns `index.html` for extensionless SPA routes, and serves `/api` from the same origin. `GET /api/health` returns only `{"status":"ok"}`. The Docker image performs the build in a separate stage and starts the same Node entrypoint.

Mount a volume and set an absolute path such as `OPEN_LOOPS_DATABASE_PATH=/data/open-loops.sqlite`. Supply environment variables from [.env.example](../.env.example); do not copy a populated environment file into the image. See the root [README](../README.md) for commands and judge workflow.

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

- Which production identity proxy and deployment platform will be approved?
- Will production use a persistent single instance or require hosted PostgreSQL?

## Version 1 Boundaries

- No general-purpose model endpoint is exposed.
- No cross-session context, prior chats, outside research, or unrelated account data enters calibration generation.
- Development authentication is not a production identity system.

import { sessionCookie } from "./auth.mjs";
import { validateCanonicalSession } from "./database.mjs";

const MAX_BODY_BYTES = 256 * 1024;

export function createApi({
  database, auth, generationService, canonical, allowDevelopmentAuth = false, diagnostics,
}) {
  return async function handle(request) {
    let pathname = "unknown";
    try {
      const url = new URL(request.url);
      pathname = url.pathname;
      if (request.method === "GET" && url.pathname === "/api/health") {
        return json({ status: "ok" });
      }
      if (request.method === "POST" && url.pathname === "/api/auth/development") {
        if (!allowDevelopmentAuth) return json({ error: "Not found." }, 404);
        const body = await readJson(request);
        if (!body.userId || typeof body.userId !== "string" || body.userId.length > 100) {
          return json({ error: "A valid development user ID is required." }, 400);
        }
        const signedIn = await auth.signIn({ userId: body.userId });
        return json({ authenticated: true }, 200, {
          "set-cookie": sessionCookie(signedIn.token, process.env.NODE_ENV === "production"),
        });
      }

      if (request.method === "POST" && url.pathname === "/api/auth/sign-out") {
        return json({ authenticated: false }, 200, {
          "set-cookie": auth.signOut({ secure: process.env.NODE_ENV === "production" }).clearCookie,
        });
      }

      const userId = auth.restore(request);
      if (!userId) return json({ error: "Authentication required." }, 401);
      if (request.method === "GET" && url.pathname === "/api/auth/session") {
        return json({ authenticated: true, userId });
      }
      if (url.pathname === "/api/calibration-sessions" && request.method === "GET") {
        return json({ sessions: database.listSessions(userId) });
      }
      if (url.pathname === "/api/calibration-sessions" && request.method === "POST") {
        const body = await readJson(request);
        validateCanonicalSession(body, canonical);
        return json({ session: database.createSession(userId, body) }, 201);
      }
      if (url.pathname === "/api/calibration-sessions/import" && request.method === "POST") {
        const body = await readJson(request);
        if (!Array.isArray(body.sessions) || body.sessions.length > 100) {
          return json({ error: "Invalid import." }, 400);
        }
        return json(database.importSessions(userId, body.sessions, canonical));
      }
      if (url.pathname === "/api/calibrations/generate" && request.method === "POST") {
        return json(await generationService.generate(await readJson(request)));
      }
      const retryMatch = url.pathname.match(/^\/api\/calibration-sessions\/([^/]+)\/retry-generation$/);
      if (retryMatch && request.method === "POST") {
        const sessionId = decodeURIComponent(retryMatch[1]);
        const session = database.getSession(userId, sessionId);
        const result = await generationService.retryStoredSession(session);
        return json({ attempt: database.createGenerationAttempt(userId, sessionId, result) });
      }
      const sessionMatch = url.pathname.match(/^\/api\/calibration-sessions\/([^/]+)$/);
      if (sessionMatch && request.method === "GET") {
        return json({ session: database.getSession(userId, decodeURIComponent(sessionMatch[1])) });
      }
      if (sessionMatch && request.method === "PUT") {
        const body = await readJson(request);
        if (body.id !== decodeURIComponent(sessionMatch[1])) return json({ error: "Session ID mismatch." }, 400);
        validateCanonicalSession(body, canonical);
        try {
          return json({ session: database.saveSession(userId, body) });
        } catch (error) {
          if (error?.status !== 404) throw error;
          return json({ session: database.createSession(userId, body) }, 201);
        }
      }
      const recordMatch = url.pathname.match(/^\/api\/business-dna-records\/([^/]+)$/);
      if (recordMatch && request.method === "GET") {
        return json({ record: database.getBusinessDNARecord(userId, decodeURIComponent(recordMatch[1])) });
      }
      return json({ error: "Not found." }, 404);
    } catch (error) {
      const status = Number(error?.status) || 500;
      const code = safeApiErrorCode(pathname, status);
      diagnostics?.({ route: safeApiRoute(pathname), status, code });
      return json({
        error: status >= 500 ? "The server could not complete the request." : error.message,
        code,
      }, status);
    }
  };
}

function safeApiErrorCode(pathname, status) {
  if (/^\/api\/calibration-sessions\/[^/]+\/retry-generation$/.test(pathname)) {
    if (status === 404) return "retry_session_not_found";
    if (status === 409) return "retry_not_eligible";
    if (status === 429) return "retry_rate_limited";
    return status >= 500 ? "retry_internal_failure" : "retry_request_rejected";
  }
  if (status === 404) return "resource_not_found";
  if (status === 409) return "immutable_state_conflict";
  return status >= 500 ? "internal_failure" : "request_rejected";
}

function safeApiRoute(pathname) {
  if (/^\/api\/calibration-sessions\/[^/]+\/retry-generation$/.test(pathname)) {
    return "calibration_retry";
  }
  if (/^\/api\/calibration-sessions\/[^/]+$/.test(pathname)) return "calibration_session";
  if (pathname === "/api/calibration-sessions") return "calibration_sessions";
  if (pathname === "/api/calibrations/generate") return "calibration_generate";
  return "other";
}

async function readJson(request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) throw Object.assign(new Error("Request is too large."), { status: 413 });
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw Object.assign(new Error("Request is too large."), { status: 413 });
  try { return text ? JSON.parse(text) : {}; }
  catch { throw Object.assign(new Error("Invalid JSON request."), { status: 400 }); }
}

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

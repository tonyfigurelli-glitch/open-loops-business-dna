import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export class TokenAuthService {
  constructor(secret) {
    if (!secret || secret.length < 16) throw new Error("A session secret of at least 16 characters is required.");
    this.key = createHash("sha256").update(secret).digest();
  }

  issue(userId) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify({
      userId,
      issuedAt: Date.now(),
      nonce: randomBytes(16).toString("base64url"),
    }), "utf8"), cipher.final()]);
    return `${iv.toString("base64url")}.${encrypted.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
  }

  async signIn({ userId }) {
    if (!userId || typeof userId !== "string") return null;
    return { userId, token: this.issue(userId) };
  }

  signOut({ secure = false } = {}) { return { clearCookie: clearSessionCookie(secure) }; }

  restore(request) { return this.authenticate(request); }

  authenticate(request) {
    const authorization = request.headers.get("authorization") ?? "";
    const bearer = authorization.match(/^Bearer (.+)$/i)?.[1];
    const cookie = request.headers.get("cookie") ?? "";
    const sessionCookie = cookie.match(/(?:^|;\s*)open_loops_session=([^;]+)/)?.[1];
    const token = bearer ?? sessionCookie;
    if (!token) return null;
    const [ivValue, encryptedValue, tagValue] = token.split(".");
    if (!ivValue || !encryptedValue || !tagValue) return null;
    try {
      const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivValue, "base64url"));
      decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
      const cleartext = Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, "base64url")),
        decipher.final(),
      ]).toString("utf8");
      const parsed = JSON.parse(cleartext);
      if (typeof parsed.userId !== "string" || Date.now() - parsed.issuedAt > 2_592_000_000) return null;
      return parsed.userId;
    } catch { return null; }
  }
}

export class TrustedProxyAuthService {
  constructor({ secret, userHeader = "x-open-loops-user-id" }) {
    if (!secret || secret.length < 32) {
      throw new Error("A trusted proxy secret of at least 32 characters is required.");
    }
    if (!/^[a-z0-9-]+$/.test(userHeader)) throw new Error("A valid trusted user header is required.");
    this.secret = Buffer.from(secret);
    this.userHeader = userHeader;
  }

  authenticate(request) {
    const suppliedSecret = Buffer.from(request.headers.get("x-open-loops-proxy-secret") ?? "");
    if (suppliedSecret.length !== this.secret.length || !timingSafeEqual(suppliedSecret, this.secret)) return null;
    const userId = request.headers.get(this.userHeader)?.trim();
    return userId && /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,199}$/.test(userId) ? userId : null;
  }

  restore(request) { return this.authenticate(request); }

  async signIn() { return null; }

  signOut({ secure = true } = {}) { return { clearCookie: clearSessionCookie(secure) }; }
}

export function assertAuthenticationAdapter(adapter) {
  for (const method of ["authenticate", "restore", "signIn", "signOut"]) {
    if (typeof adapter?.[method] !== "function") {
      throw new Error(`Authentication adapter must implement ${method}().`);
    }
  }
  return adapter;
}

export function sessionCookie(token, secure = false) {
  return `open_loops_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie(secure = false) {
  return `open_loops_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

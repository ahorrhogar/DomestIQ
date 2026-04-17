const SESSION_STORAGE_KEY = "homara.analytics.session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface SessionRecord {
  id: string;
  createdAt: number;
}

let serverFallbackSessionId: string | null = null;

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(36).slice(2, 11);
  return `sid-${Date.now()}-${randomPart}`;
}

function safeParseSessionRecord(raw: string): SessionRecord | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SessionRecord>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (typeof parsed.id !== "string" || !parsed.id) {
      return null;
    }

    if (typeof parsed.createdAt !== "number" || !Number.isFinite(parsed.createdAt)) {
      return null;
    }

    return {
      id: parsed.id,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

function getServerFallbackSessionId(): string {
  if (!serverFallbackSessionId) {
    serverFallbackSessionId = createSessionId();
  }

  return serverFallbackSessionId;
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") {
    return getServerFallbackSessionId();
  }

  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const record = raw ? safeParseSessionRecord(raw) : null;

    if (record && now - record.createdAt <= SESSION_MAX_AGE_MS) {
      return record.id;
    }

    const nextRecord: SessionRecord = {
      id: createSessionId(),
      createdAt: now,
    };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextRecord));
    return nextRecord.id;
  } catch {
    return getServerFallbackSessionId();
  }
}

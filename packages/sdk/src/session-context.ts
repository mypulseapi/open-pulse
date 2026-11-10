import type { GeoInfo, DeviceInfo } from "./signals"

/**
 * The visitor's context, captured once and kept for the life of the session.
 *
 * Device, IP and location are **properties of the session, not of the page**. They cannot
 * change between one page and the next, so capturing them on every page load was work with a
 * guaranteed-identical answer: two external HTTP calls, each with a 3s timeout, on the critical
 * path before the first inference could run.
 *
 * Keyed by session id rather than stored loose, so the cache cannot outlive the thing it describes:
 * a new session means a new visitor as far as the engine is concerned, and reusing the previous
 * visitor's city would be worse than the round trip it saved.
 */

const STORAGE_KEY = "pulse_session_context"

export interface SessionContext {
  /** The session this was captured for. A mismatch invalidates the whole entry. */
  sessionId: string
  /** When the context was captured, epoch ms. */
  capturedAt: number
  device?: DeviceInfo
  geo?: GeoInfo | null
}

function safeParse(raw: string | null): SessionContext | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as SessionContext
    return v && typeof v.sessionId === "string" ? v : null
  } catch {
    return null
  }
}

/** The cached context for this session, or null if there is none / it belongs to another session. */
export function readSessionContext(sessionId: string): SessionContext | null {
  if (typeof localStorage === "undefined") return null
  try {
    const v = safeParse(localStorage.getItem(STORAGE_KEY))
    return v && v.sessionId === sessionId ? v : null
  } catch {
    return null
  }
}

/** Merge fields into this session's context. Writing is best-effort: a full quota must not throw. */
export function writeSessionContext(sessionId: string, patch: Partial<SessionContext>): void {
  if (typeof localStorage === "undefined") return
  try {
    const existing = readSessionContext(sessionId)
    const next: SessionContext = {
      ...(existing ?? { sessionId, capturedAt: Date.now() }),
      ...patch,
      sessionId,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // A private-mode or quota-exceeded localStorage means no caching, not a broken page.
  }
}

export function clearSessionContext(): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

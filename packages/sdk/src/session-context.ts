import type { GeoInfo, WeatherInfo, DeviceInfo } from "./signals"

/**
 * The visitor's context, captured once and kept for the life of the session.
 *
 * Device, IP, location and weather are **properties of the session, not of the page**. They cannot
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
  weather?: WeatherInfo | null
  /** When the weather reading was taken — it is the one field that goes stale inside a session. */
  weatherAt?: number
}

/**
 * Weather is re-read after this long even within one session.
 *
 * Everything else here is immutable for the session — the device does not change, the IP will not
 * move — but a 30-minute session can outlast a rain shower, and `weather:rain` driving a
 * recommendation after the sun came out is the demo being confidently wrong.
 */
export const WEATHER_TTL_MS = 10 * 60 * 1000

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

/** Is the cached weather still worth trusting? */
export function isWeatherFresh(ctx: SessionContext | null, now = Date.now()): boolean {
  return Boolean(ctx?.weather && ctx.weatherAt && now - ctx.weatherAt < WEATHER_TTL_MS)
}

export function clearSessionContext(): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// ponytail: one runnable check, plain assertions.
//   node --experimental-strip-types -e "import('./src/session-context.ts').then(m => m.demo())"
export function demo(): void {
  const now = 1_700_000_000_000
  const fresh: SessionContext = {
    sessionId: "s1",
    capturedAt: now,
    weather: { condition: "rain", description: "", temp: 30, humidity: 70 } as WeatherInfo,
    weatherAt: now - 60_000,
  }
  console.assert(isWeatherFresh(fresh, now), "a one-minute-old reading is fresh")
  console.assert(
    !isWeatherFresh({ ...fresh, weatherAt: now - WEATHER_TTL_MS - 1 }, now),
    "past the TTL it is stale — a 30-minute session outlasts a shower",
  )
  console.assert(!isWeatherFresh({ ...fresh, weather: null }, now), "no reading is never fresh")
  console.assert(!isWeatherFresh(null, now), "no context is never fresh")
  console.assert(
    !isWeatherFresh({ sessionId: "s1", capturedAt: now, weather: fresh.weather }, now),
    "a reading with no timestamp cannot be trusted — unknown age is not freshness",
  )
  console.log("session-context: ok")
}

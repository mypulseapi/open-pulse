import { generateId } from "./utils"

const STORAGE_KEY = "pulse_session_id"
const STORAGE_TS_KEY = "pulse_session_ts"
const DEFAULT_TTL = 30 * 60 * 1000

export function getOrCreateSessionId(ttlMs = DEFAULT_TTL): string {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return `pulse_${generateId()}`
  }

  try {
    const id = localStorage.getItem(STORAGE_KEY)
    const ts = localStorage.getItem(STORAGE_TS_KEY)

    if (id && ts && Date.now() - parseInt(ts, 10) < ttlMs) {
      localStorage.setItem(STORAGE_TS_KEY, Date.now().toString())
      return id
    }

    const newId = `pulse_${generateId()}`
    localStorage.setItem(STORAGE_KEY, newId)
    localStorage.setItem(STORAGE_TS_KEY, Date.now().toString())
    return newId
  } catch {
    return `pulse_${generateId()}`
  }
}

export function clearSession(): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_TS_KEY)
  } catch {
    // ignore
  }
}

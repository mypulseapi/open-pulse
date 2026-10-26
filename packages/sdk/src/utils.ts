/**
 * Generate a UUID v4
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * POST request with timeout
 */
export async function request<T>(
  url: string,
  body: unknown,
  apiKey?: string,
  timeoutMs = 10000,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`PULSE SDK: HTTP ${response.status}`)
    }

    const json = await response.json()

    // Gateway/services wrap responses in { success, data }
    if (json && typeof json === "object" && "data" in json) {
      return json.data as T
    }

    return json as T
  } finally {
    clearTimeout(timeout)
  }
}

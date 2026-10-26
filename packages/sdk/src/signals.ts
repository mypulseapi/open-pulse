import type { Signal } from "./types"

// =============================================================================
// Device Detection — extract specific model, OS, chip from User-Agent
// =============================================================================

interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop"
  model: string       // e.g. "MacBook Pro M1", "iPhone 15 Pro", "Samsung Galaxy S24"
  os: string          // e.g. "macOS 14", "iOS 17", "Windows 11", "Android 14"
  browser: string     // e.g. "Chrome 120", "Safari 17", "Firefox 121"
  chip?: string       // e.g. "Apple M1", "Apple M2", "Snapdragon"
}

function parseUserAgent(ua: string): DeviceInfo {
  const info: DeviceInfo = { type: "desktop", model: "Unknown", os: "Unknown", browser: "Unknown" }

  // ── Device Type ──
  if (/iPad|Tablet/i.test(ua)) info.type = "tablet"
  else if (/Mobi|Android|iPhone|iPod/i.test(ua)) info.type = "mobile"

  // ── OS Detection ──
  const macMatch = ua.match(/Mac OS X[\s_]?([\d._]+)?/)
  const winMatch = ua.match(/Windows NT ([\d.]+)/)
  const iosMatch = ua.match(/(?:iPhone|iPad|iPod).*?OS ([\d_]+)/)
  const androidMatch = ua.match(/Android ([\d.]+)/)
  const linuxMatch = /Linux/.test(ua) && !androidMatch

  if (iosMatch) {
    info.os = `iOS ${iosMatch[1]?.replace(/_/g, ".") || ""}`
  } else if (androidMatch) {
    info.os = `Android ${androidMatch[1]}`
  } else if (macMatch) {
    const ver = macMatch[1]?.replace(/_/g, ".") || ""
    info.os = `macOS ${ver}`
  } else if (winMatch) {
    const ntMap: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" }
    info.os = `Windows ${ntMap[winMatch[1]] || winMatch[1]}`
  } else if (linuxMatch) {
    info.os = "Linux"
  }

  // ── Chip / Architecture ──
  if (/Apple\s?M[1-9]/i.test(ua)) {
    const chipMatch = ua.match(/Apple\s?(M[1-9]\s?\w*)/i)
    info.chip = chipMatch ? `Apple ${chipMatch[1]}` : "Apple Silicon"
  } else if (/ARM64|aarch64/i.test(ua) && /Mac/i.test(ua)) {
    info.chip = "Apple Silicon"
  }

  // ── Device Model (Mobile) ──
  if (info.type === "mobile" || info.type === "tablet") {
    // iPhone models
    const iphoneModel = ua.match(/iPhone(\d+),(\d+)/)
    if (iphoneModel) {
      const gen = parseInt(iphoneModel[1])
      if (gen >= 17) info.model = "iPhone 16 Pro"
      else if (gen >= 15) info.model = "iPhone 15 Pro"
      else if (gen >= 14) info.model = "iPhone 14"
      else if (gen >= 13) info.model = "iPhone 13"
      else info.model = `iPhone (gen ${gen})`
    } else if (/iPhone/i.test(ua)) {
      info.model = "iPhone"
    }

    // iPad models
    if (/iPad/i.test(ua)) {
      if (/iPad Pro/i.test(ua) || /iPad\d+,\d+/i.test(ua)) info.model = "iPad Pro"
      else info.model = "iPad"
    }

    // Samsung models
    const samsungMatch = ua.match(/SM-([A-Z]\d{2,4}\w*)/i)
    if (samsungMatch) {
      const code = samsungMatch[1].toUpperCase()
      if (code.startsWith("S9")) info.model = "Samsung Galaxy S24 Ultra"
      else if (code.startsWith("S23") || code.startsWith("S24")) info.model = `Samsung Galaxy ${code.startsWith("S24") ? "S24" : "S23"}`
      else if (code.startsWith("A")) info.model = `Samsung Galaxy A${code.slice(1, 3)}`
      else info.model = `Samsung ${code}`
    }

    // Google Pixel
    const pixelMatch = ua.match(/Pixel (\d+\w*)/i)
    if (pixelMatch) info.model = `Google Pixel ${pixelMatch[1]}`

    // OnePlus
    const oneplusMatch = ua.match(/(?:OnePlus|ONEPLUS)\s?(\w+)/i)
    if (oneplusMatch) info.model = `OnePlus ${oneplusMatch[1]}`

    // Xiaomi / Redmi / POCO
    if (/Redmi/i.test(ua)) { const m = ua.match(/Redmi\s?([\w\s]+?)(?:[;)])/i); info.model = m ? `Redmi ${m[1].trim()}` : "Redmi" }
    if (/POCO/i.test(ua)) { const m = ua.match(/POCO\s?([\w]+)/i); info.model = m ? `POCO ${m[1]}` : "POCO" }

    // Nubia / Red Magic
    const nubiaMatch = ua.match(/NX(\d+\w*)/i)
    if (nubiaMatch) info.model = `Nubia Red Magic (${nubiaMatch[1]})`
    if (/Red\s?Magic/i.test(ua)) { const m = ua.match(/Red\s?Magic\s?(\d+\w*)/i); info.model = m ? `Nubia Red Magic ${m[1]}` : "Nubia Red Magic" }

    // Huawei
    if (/HUAWEI/i.test(ua)) { const m = ua.match(/HUAWEI\s?([\w-]+)/i); info.model = m ? `Huawei ${m[1]}` : "Huawei" }

    // OPPO / Vivo / Realme
    if (/OPPO/i.test(ua)) info.model = "OPPO"
    if (/vivo/i.test(ua)) info.model = "Vivo"
    if (/realme/i.test(ua)) { const m = ua.match(/RMX(\d+)/i); info.model = m ? `Realme (${m[1]})` : "Realme" }
  }

  // ── Device Model (Desktop/Laptop) ──
  if (info.type === "desktop") {
    if (/Macintosh|Mac OS/i.test(ua)) {
      if (info.chip?.includes("M1")) info.model = "MacBook (Apple M1)"
      else if (info.chip?.includes("M2")) info.model = "MacBook (Apple M2)"
      else if (info.chip?.includes("M3")) info.model = "MacBook (Apple M3)"
      else if (info.chip?.includes("M4")) info.model = "MacBook (Apple M4)"
      else if (info.chip) info.model = `Mac (${info.chip})`
      else if (/Intel/i.test(ua)) info.model = "Mac (Intel)"
      else info.model = "Mac"
    } else if (/Windows/i.test(ua)) {
      if (/ARM64/i.test(ua)) info.model = "Windows on ARM"
      else info.model = "Windows PC"
    } else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
      info.model = "Linux PC"
    } else if (/CrOS/i.test(ua)) {
      info.model = "Chromebook"
    }
  }

  // ── Browser ──
  const edgeMatch = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/)
  const chromeMatch = ua.match(/Chrome\/([\d.]+)/)
  const firefoxMatch = ua.match(/Firefox\/([\d.]+)/)
  const safariMatch = ua.match(/Version\/([\d.]+).*Safari/)
  const operaMatch = ua.match(/OPR\/([\d.]+)/)
  const braveMatch = /Brave/i.test(ua)

  if (braveMatch) info.browser = "Brave"
  else if (edgeMatch) info.browser = `Edge ${edgeMatch[1].split(".")[0]}`
  else if (operaMatch) info.browser = `Opera ${operaMatch[1].split(".")[0]}`
  else if (firefoxMatch) info.browser = `Firefox ${firefoxMatch[1].split(".")[0]}`
  else if (safariMatch) info.browser = `Safari ${safariMatch[1].split(".")[0]}`
  else if (chromeMatch) info.browser = `Chrome ${chromeMatch[1].split(".")[0]}`

  return info
}

/**
 * Capture device signal with detailed model info in metadata.
 * Uses User-Agent Client Hints API (navigator.userAgentData) for accurate
 * detection on Chromium browsers, since Chrome freezes the UA string to
 * "Intel Mac OS X 10_15_7" regardless of actual chip/OS version.
 */
export function captureDeviceSignal(): Signal | null {
  if (typeof navigator === "undefined") return null
  const ua = navigator.userAgent
  if (!ua) return null

  const device = parseUserAgent(ua)

  return {
    type: "device",
    value: device.type,
    metadata: {
      model: device.model,
      os: device.os,
      browser: device.browser,
      chip: device.chip,
    },
  }
}

/**
 * Async version that uses Client Hints for accurate chip/OS detection.
 * Chrome freezes UA to "Intel Mac OS X 10_15_7" — Client Hints returns
 * the real architecture ("arm" for M1/M2/M3) and OS version.
 */
export async function captureDeviceInfoAsync(): Promise<DeviceInfo> {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  const base = parseUserAgent(ua)

  // Try Client Hints API (Chromium browsers only)
  if (typeof navigator !== "undefined" && "userAgentData" in navigator) {
    try {
      const uaData = navigator.userAgentData as {
        platform?: string
        getHighEntropyValues?: (hints: string[]) => Promise<{
          platform?: string
          platformVersion?: string
          architecture?: string
          model?: string
          fullVersionList?: Array<{ brand: string; version: string }>
        }>
      }

      if (uaData.getHighEntropyValues) {
        const hints = await uaData.getHighEntropyValues([
          "platform",
          "platformVersion",
          "architecture",
          "model",
          "fullVersionList",
        ])

        // Fix OS version (Chrome lies in UA string)
        if (hints.platform === "macOS" && hints.platformVersion) {
          const majorVer = parseInt(hints.platformVersion.split(".")[0] || "0")
          // macOS versions: 15=Tahoe, 14=Sonoma, 13=Ventura, 12=Monterey
          const versionNames: Record<number, string> = {
            15: "Tahoe", 14: "Sonoma", 13: "Ventura", 12: "Monterey",
            11: "Big Sur", 10: "Catalina",
          }
          const name = versionNames[majorVer] || ""
          base.os = `macOS ${hints.platformVersion}${name ? ` ${name}` : ""}`
        } else if (hints.platform === "Windows" && hints.platformVersion) {
          const majorVer = parseInt(hints.platformVersion.split(".")[0] || "0")
          base.os = majorVer >= 13 ? `Windows 11` : `Windows 10`
        } else if (hints.platform && hints.platformVersion) {
          base.os = `${hints.platform} ${hints.platformVersion}`
        }

        // Fix chip/architecture (Chrome says "Intel" in UA even on ARM)
        if (hints.architecture === "arm" || hints.architecture === "arm64") {
          if (hints.platform === "macOS") {
            // ARM Mac = Apple Silicon (M1/M2/M3/M4)
            base.chip = "Apple Silicon"
            base.model = "Mac (Apple Silicon)"
          } else {
            base.chip = "ARM"
          }
        } else if (hints.architecture === "x86" || hints.architecture === "x86_64") {
          if (hints.platform === "macOS") {
            base.chip = "Intel"
            base.model = "Mac (Intel)"
          }
        }

        // Get actual browser version from fullVersionList
        if (hints.fullVersionList) {
          for (const entry of hints.fullVersionList) {
            if (entry.brand === "Google Chrome") {
              base.browser = `Chrome ${entry.version.split(".")[0]}`
              break
            }
            if (entry.brand === "Microsoft Edge") {
              base.browser = `Edge ${entry.version.split(".")[0]}`
              break
            }
            if (entry.brand === "Brave") {
              base.browser = "Brave"
              break
            }
          }
        }
      }
    } catch {
      // Client Hints not available, keep UA-parsed values
    }
  }

  return base
}

// =============================================================================
// Referrer Detection
// =============================================================================

export function captureReferrerSignal(): Signal | null {
  if (typeof document === "undefined") return null
  const ref = document.referrer
  if (!ref) return { type: "referrer", value: "direct" }

  const mappings: Array<[RegExp, string]> = [
    [/tiktok/i, "tiktok"],
    [/instagram/i, "instagram"],
    [/facebook|fb\.com/i, "facebook"],
    [/pinterest/i, "pinterest"],
    [/youtube|youtu\.be/i, "youtube"],
    [/twitter|x\.com/i, "twitter"],
    [/snapchat|snap\.com/i, "snapchat"],
    [/linkedin/i, "linkedin"],
    [/reddit/i, "reddit"],
    [/google/i, "google"],
    [/bing/i, "bing"],
    [/email|mailchi|klaviyo/i, "email"],
  ]

  for (const [pattern, value] of mappings) {
    if (pattern.test(ref)) {
      return { type: "referrer", value }
    }
  }

  return null
}

// =============================================================================
// Time Detection
// =============================================================================

export function captureTimeSignal(): Signal {
  const hour = new Date().getHours()
  let value: string

  if (hour >= 5 && hour < 8) value = "early_morning"
  else if (hour >= 8 && hour < 12) value = "morning"
  else if (hour >= 12 && hour < 14) value = "lunch"
  else if (hour >= 14 && hour < 18) value = "afternoon"
  else if (hour >= 18 && hour < 22) value = "evening"
  else value = "late_night"

  return { type: "time", value }
}

// =============================================================================
// Geo / IP Detection
// =============================================================================

export interface GeoInfo {
  ip: string
  country: string
  countryCode: string
  city: string
  region: string
  timezone: string
  lat?: number
  lon?: number
}

/**
 * Capture user's geo location from IP address.
 * Uses free ip-api.com service (no API key required).
 * This is async and may take 100-300ms.
 */
export async function captureGeoInfo(): Promise<GeoInfo | null> {
  if (typeof fetch === "undefined") return null

  try {
    const res = await fetch("http://ip-api.com/json/?fields=status,query,country,countryCode,regionName,city,timezone,lat,lon", {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null

    const data = await res.json()
    if (data.status !== "success") return null

    return {
      ip: data.query || "",
      country: data.country || "",
      countryCode: data.countryCode || "",
      city: data.city || "",
      region: data.regionName || "",
      timezone: data.timezone || "",
      lat: data.lat,
      lon: data.lon,
    }
  } catch {
    return null
  }
}

/**
 * Convert geo info to signals for the inference engine
 */
export function geoToSignals(geo: GeoInfo): Signal[] {
  const signals: Signal[] = []

  if (geo.country) {
    signals.push({
      type: "geo",
      value: geo.countryCode.toLowerCase(),
      metadata: { country: geo.country, city: geo.city, region: geo.region },
    })
  }

  // Urban detection (cities with large populations)
  if (geo.city) {
    signals.push({ type: "geo", value: "urban" })
  }

  return signals
}

// =============================================================================
// Weather Detection (OpenWeatherMap)
// =============================================================================

export interface WeatherInfo {
  condition: string        // "rain", "clear", "clouds", "snow", "thunderstorm"
  description: string      // "heavy rain", "light rain", "clear sky"
  temp: number             // Celsius
  humidity: number
  uvIndex?: number
  windSpeed?: number
}

/**
 * Capture weather at user's location using OpenWeatherMap API.
 * Requires lat/lon from captureGeoInfo(). Free tier: 1000 calls/day.
 * Returns null if no API key provided or request fails.
 */
export async function captureWeatherInfo(
  lat: number,
  lon: number,
  apiKey?: string,
): Promise<WeatherInfo | null> {
  if (typeof fetch === "undefined" || !apiKey) return null

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null

    const data = await res.json()
    const weather = data.weather?.[0]

    return {
      condition: weather?.main?.toLowerCase() || "unknown",
      description: weather?.description || "",
      temp: data.main?.temp ?? 0,
      humidity: data.main?.humidity ?? 0,
      uvIndex: undefined, // UV requires separate One Call API
      windSpeed: data.wind?.speed,
    }
  } catch {
    return null
  }
}

/**
 * Convert weather info to signals for the inference engine.
 */
export function weatherToSignals(weather: WeatherInfo): Signal[] {
  const signals: Signal[] = []

  // Rain signals
  if (weather.condition === "rain" || weather.condition === "drizzle") {
    const isHeavy = weather.description.includes("heavy") || weather.description.includes("extreme")
    signals.push({
      type: "geo",
      value: isHeavy ? "weather_heavy_rain" : "weather_rainy",
      metadata: { description: weather.description, temp: weather.temp },
    })
  }

  // Thunderstorm = heavy rain
  if (weather.condition === "thunderstorm") {
    signals.push({
      type: "geo",
      value: "weather_heavy_rain",
      metadata: { description: weather.description, temp: weather.temp },
    })
  }

  // Snow / cold
  if (weather.condition === "snow" || weather.temp < 10) {
    signals.push({ type: "geo", value: "weather_cold", metadata: { temp: weather.temp } })
  }

  // Hot weather
  if (weather.temp > 32) {
    signals.push({ type: "geo", value: "weather_hot", metadata: { temp: weather.temp } })
  }

  // Sunny / clear with high temp = UV risk
  if ((weather.condition === "clear" || weather.condition === "clouds") && weather.temp > 28) {
    signals.push({ type: "geo", value: "weather_sunny", metadata: { temp: weather.temp } })
  }

  // Extreme UV (approximate from clear + high temp midday)
  if (weather.condition === "clear" && weather.temp > 33) {
    signals.push({ type: "geo", value: "uv_extreme", metadata: { temp: weather.temp } })
  }

  return signals
}

// =============================================================================
// Cultural Calendar Detection
// =============================================================================

interface CulturalEvent {
  signal: string        // e.g., "tet_season", "christmas_season"
  name: string
}

/**
 * Detect active cultural/seasonal events based on country and current date.
 * Returns time signals for active cultural seasons.
 */
export function captureCulturalCalendar(countryCode: string): Signal[] {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()
  const signals: Signal[] = []

  const events: CulturalEvent[] = []

  // Lunar New Year / Tet (Vietnam, China, Korea) — ~3 weeks before (varies by year)
  // Approximate: Jan 15 - Feb 15
  if (["VN", "CN", "KR", "TW", "SG", "MY"].includes(countryCode.toUpperCase())) {
    if ((month === 1 && day >= 10) || (month === 2 && day <= 15)) {
      events.push({ signal: "tet_season", name: "Lunar New Year" })
    }
  }

  // Christmas (Western + global) — Dec 1-25
  if (month === 12 && day <= 25) {
    events.push({ signal: "christmas_season", name: "Christmas" })
  }

  // Diwali (India) — Approximate Oct 15 - Nov 15
  if (["IN", "NP", "LK", "BD"].includes(countryCode.toUpperCase())) {
    if ((month === 10 && day >= 15) || (month === 11 && day <= 15)) {
      events.push({ signal: "diwali_season", name: "Diwali" })
    }
  }

  // Ramadan (varies by year, approximate) — shifts ~11 days earlier each year
  // For 2026: approximately Feb 18 - Mar 19
  if (["SA", "AE", "ID", "MY", "PK", "BD", "EG", "TR"].includes(countryCode.toUpperCase())) {
    if ((month === 2 && day >= 10) || (month === 3 && day <= 25)) {
      events.push({ signal: "ramadan_season", name: "Ramadan" })
    }
  }

  // General holiday season fallback
  if (events.length > 0) {
    signals.push({ type: "time", value: "holiday_season", metadata: { events: events.map((e) => e.name) } })
  }

  for (const event of events) {
    signals.push({ type: "time", value: event.signal, metadata: { name: event.name } })
  }

  return signals
}

// =============================================================================
// Enhanced Referrer Detection
// =============================================================================

/**
 * Capture additional referrer signals beyond basic domain matching.
 * Detects beauty blogs, fashion influencers, tech review sites.
 */
export function captureEnhancedReferrerSignals(): Signal[] {
  if (typeof document === "undefined") return []
  const ref = document.referrer?.toLowerCase() || ""
  if (!ref) return []

  const signals: Signal[] = []

  // Beauty / skincare / lifestyle blogs
  const beautyPatterns = ["beauty", "skincare", "cosmetic", "makeup", "lifestyle", "wellness", "glow", "glamour"]
  if (beautyPatterns.some((p) => ref.includes(p))) {
    signals.push({ type: "referrer", value: "beauty_blog", metadata: { url: ref } })
  }

  // Fashion influencer patterns
  const influencerPatterns = ["chau.bui", "fashionista", "ootd", "streetstyle", "lookbook", "fashion.blogger", "style.diary"]
  if (influencerPatterns.some((p) => ref.includes(p))) {
    signals.push({ type: "referrer", value: "fashion_influencer", metadata: { url: ref } })
  }

  return signals
}

// =============================================================================
// Auto-capture all signals
// =============================================================================

export function captureAutoSignals(): Signal[] {
  const signals: Signal[] = []

  const device = captureDeviceSignal()
  if (device) signals.push(device)

  const referrer = captureReferrerSignal()
  if (referrer) signals.push(referrer)

  signals.push(captureTimeSignal())

  const day = new Date().getDay()
  if (day === 0 || day === 6) {
    signals.push({ type: "time", value: "weekend" })
  }

  return signals
}

export { parseUserAgent, type DeviceInfo }

export { PulseClient } from "./client"
export {
  parseUserAgent,
  /*
   * The locally-computed signals: device class, referrer, time of day.
   *
   * Exported because `init()` sends them exactly once and swallows its own failure — a host app
   * that wants them re-asserted on later page loads needs to be able to ask for them. They cost no
   * network, so re-sending is cheaper than the cliff a single dropped request creates: measured on
   * a live session whose init failed, two signals ever arrived and it carried 4 personas for life,
   * against 33 for a session whose init succeeded.
   */
  captureAutoSignals,
  captureDeviceSignal,
  captureReferrerSignal,
  captureTimeSignal,
  captureDeviceInfoAsync,
  captureGeoInfo,
  geoToSignals,
  captureWeatherInfo,
  weatherToSignals,
  captureCulturalCalendar,
  captureEnhancedReferrerSignals,
} from "./signals"
export type { DeviceInfo, GeoInfo, WeatherInfo } from "./signals"
export type {
  PulseConfig,
  Signal,
  ProductInput,
  SearchOptions,
  ScoreBreakdown,
  TrackResponse,
  MatchedSignal,
  SearchResponse,
  SearchResult,
  EventData,
  EventResponse,
  SessionResponse,
  OnPersonaUpdate,
  RankedCatalogItem,
  RankedCatalogResponse,
} from "./types"

// Session-scoped context cache: device/geo/weather are captured once per session, not per page.
export {
  readSessionContext,
  writeSessionContext,
  isWeatherFresh,
  clearSessionContext,
  WEATHER_TTL_MS,
  type SessionContext,
} from "./session-context"

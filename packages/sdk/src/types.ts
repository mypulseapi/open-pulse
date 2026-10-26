// =============================================================================
// Configuration
// =============================================================================

export interface PulseConfig {
  /**
   * Merchant publishable key, always `pk_live_` followed by base64url randomness.
   *
   * **There is no `pk_test_` key** and no sandbox. Use a separate key for development and revoke
   * it afterwards.
   *
   * It is publishable by design: it can send signals and read rankings, and nothing else.
   */
  apiKey: string;
  /**
   * A stable label for this visitor, carried on every track call.
   *
   * **It is an identity field and never a signal.** Nothing in the signal graph matches on it, so
   * it cannot reach inference: it says whose session a row belongs to without changing what the
   * engine concludes.
   */
  anonymousId?: string;
  /** Organization ID from PULSE dashboard */
  organizationId: string;
  /** PULSE API Gateway endpoint. Defaults to https://api.thepulseapi.com */
  endpoint?: string;
  /** Auto-capture device/referrer/time signals on init. Default: true */
  autoTrack?: boolean;
  /** Session TTL in milliseconds. Default: 30 minutes */
  sessionTtlMs?: number;
  /** Enable debug logging. Default: false */
  debug?: boolean;
}

// =============================================================================
// Signals
// =============================================================================

export interface Signal {
  type: string;
  value: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// Track
// =============================================================================

export interface TrackRequest {
  sessionId: string;
  organizationId: string;
  userId?: string;
  anonymousId?: string;
  signals?: Signal[];
}

export interface MatchedSignal {
  signalType: string;
  signalKey: string;
  signalValue?: string;
  weights: Array<{
    personaSlug: string;
    weight: number;
    certainty: number;
  }>;
  certainty: number;
  matchConfidence: number;
}

export interface TrackResponse {
  sessionId: string;
  personas: Record<string, number>;
  topPersonas: Array<{ slug: string; score: number; name?: string }>;
  newSignals: string[];
  matchedSignals: MatchedSignal[];
  /**
   * The population base rate each mutually exclusive persona started from.
   *
   * Needed to tell "we have learned nothing" from "we measured this". Gender's prior is the
   * visitor's own population, so it is NOT a fixed number: Vietnam opens near 48.0/50.0 and Ho Chi
   * Minh City near 47.6/50.4. Comparing `personas` against a hardcoded 49/49 therefore reports a
   * base rate as an observation. Compare against this instead.
   *
   * Optional so an older engine response still parses.
   */
  priors?: Record<string, number>;
  confidence: number;
  processingTimeMs: number;
}

// =============================================================================
// Search
// =============================================================================

export interface ProductInput {
  id: string;
  /**
   * Optional when the product is already in your PULSE catalog.
   *
   * Send `{ id }` alone and the server fills in the rest from the catalog you synced — the ranking
   * is identical and your page does not have to carry its own product data to the browser just to
   * send it back. Include the fields only for products PULSE has never seen.
   */
  title?: string;
  categorySlug?: string;
  brandSlug?: string;
  price?: number;
  /**
   * Intrinsic quality. Optional, and unknown when absent — never treated as zero.
   *
   * Without these the ranker cannot tell a 4.8-star bestseller from an unreviewed listing, so a
   * cold-start ranking has nothing but price to order by.
   */
  ratingAverage?: number;
  reviewCount?: number;
  quantitySold?: number;
  /** Original price, when the product is discounted. Used as a deal signal, not as the price. */
  compareAtPrice?: number;
  /**
   * Return history. Delivered orders, and the returns among them a product fact could have
   * prevented (wrong size, not as described), never transit damage or failed delivery. Optional:
   * without it ranking is unchanged.
   */
  deliveredOrders?: number;
  evidenceReturns?: number;
  /** Evidence returns per reason family (size, compatibility, colour, material, capacity). */
  returnsByFamily?: Record<string, number>;
  /**
   * Your own economics per order, same currency for every product: what a kept order contributes,
   * and what a return costs. With both, retention ranks on expected retained value.
   */
  margin?: number;
  returnCost?: number;
  attributes?: Record<string, unknown>;
  baseScore?: number;
}

export interface ScoreBreakdown {
  baseScore: number;
  personaBoost: number;
  /**
   * Ratings, reviews and units sold.
   */
  qualityBoost: number;
  affinityBoost: number;
  priceBoost: number;
}

export interface SearchResult {
  product: ProductInput;
  score: number;
  breakdown?: ScoreBreakdown;
}

export interface SearchOptions {
  query?: string;
  categorySlug?: string;
  limit?: number;
  includeBreakdown?: boolean;
}

export interface ExposureItem {
  productId: string;
  /** 1-based position in the returned order. */
  rank: number;
  /** True once the product entered the viewport, not merely the DOM. */
  visible: boolean;
}

export interface ExposureResponse {
  accepted: number;
  dropped: number;
}

export interface SearchResponse {
  /** Identifies the ranking decision. Quote it back on exposures and events. */
  decisionId: string;
  results: SearchResult[];
  personas: Record<string, number>;
  topPersonas: Array<{ slug: string; score: number }>;
  processingTimeMs: number;
  totalResults: number;
  /**
   * True when this session is in the control arm: the products came back in the order you sent
   * them, unranked, and every `score` is 0.
   *
   * Check it before showing a score to a shopper. `personas` is still populated — inference runs
   * for a held-back session, it just does not act on it — so zero scores beside rich personas mean
   * "control arm", not "matched nothing". Treating them as a match percentage puts `0% match` on
   * every product for the share of traffic the holdback assigns here.
   */
  heldBack: boolean;
}

// =============================================================================
// Events
// =============================================================================

export interface EventData {
  /** The ranking this outcome belongs to. Omit when the action did not come from one. */
  decisionId?: string;
  /** 1-based position in that ranking. */
  rank?: number;
  /**
   * Your order id, on a purchase. `POST /outcomes` reports the order's fate under the same id, so a
   * return weeks later joins back to this purchase and its ranking.
   */
  orderId?: string;
  productId?: string;
  revenue?: number;
  query?: string;
  resultsCount?: number;
  eventData?: Record<string, unknown>;
}

export interface EventResponse {
  success: boolean;
}

// =============================================================================
// Session
// =============================================================================

export interface SessionResponse {
  found: boolean;
  session?: {
    sessionId: string;
    personas: Record<string, number>;
    topPersonas: Array<{ slug: string; score: number }>;
    signalCount: number;
    signalsReceived: string[];
  };
}

// =============================================================================
// Callbacks
// =============================================================================

export type OnPersonaUpdate = (
  personas: Record<string, number>,
  topPersonas: Array<{ slug: string; score: number }>,
) => void;

/** One product in a server-ranked catalog page. Ids and score only — the caller has the rows. */
export interface RankedCatalogItem {
  productId: string;
  merchantProductId: string;
  slug: string;
  score: number;
  /** Present when `includeBreakdown` was requested — the same shape `search()` returns. */
  breakdown?: ScoreBreakdown;
}

export interface RankedCatalogResponse {
  items: RankedCatalogItem[];
  /**
   * How many products were SCORED, not how many came back. The gap between this and `items.length`
   * is the whole point of the endpoint: the page is a window over a fully-ranked category.
   */
  totalRanked: number;
  page: number;
  limit: number;
  totalPages: number;
  personasUsed: number;
  processingTimeMs: number;
  /**
   * Top picks from OUTSIDE the requested category, when `recommendCount` asked for them.
   *
   * A "recommended for you" strip above a personalised category grid otherwise shows the same
   * products twice — the grid is already ranked, so its first row IS the strip. These come from the
   * rest of the catalog, ranked for the same session, so the strip answers a different question.
   */
  recommendations: RankedCatalogItem[];
  /** True when this session is in the control group: the catalog's own order, every score 0. */
  heldBack: boolean;
  /** The personas this ranking used, after any signals sent with the request. */
  personas: Record<string, number>;
  topPersonas: Array<{ slug: string; score: number }>;
  /** Quote this back on exposures and events so an outcome attaches to the ranking that caused it. */
  decisionId: string;
}

import type {
  PulseConfig,
  Signal,
  ProductInput,
  SearchOptions,
  TrackResponse,
  SearchResponse,
  EventData,
  EventResponse,
  SessionResponse,
  OnPersonaUpdate,
  ExposureItem,
  ExposureResponse,
  RankedCatalogResponse,
} from "./types";
import { getOrCreateSessionId, clearSession } from "./session";
import { captureAutoSignals } from "./signals";
import { request } from "./utils";

export class PulseClient {
  private config!: PulseConfig & { endpoint: string };
  private sessionId = "";
  /** Buffered exposures, keyed by decision then product, so duplicates collapse before sending. */
  private pendingExposures = new Map<string, Map<string, ExposureItem>>();
  private exposureTimer: number | null = null;
  private personaCallback?: OnPersonaUpdate;
  private initialized = false;

  /**
   * Initialize the SDK. Must be called before any other method.
   * Auto-captures device, referrer, and time signals by default.
   */
  async init(config: PulseConfig): Promise<TrackResponse | null> {
    this.config = {
      ...config,
      endpoint: config.endpoint || "https://api.thepulseapi.com",
    };
    this.sessionId = getOrCreateSessionId(config.sessionTtlMs);
    this.initialized = true;

    this.log("init", { sessionId: this.sessionId });

    if (config.autoTrack !== false) {
      const signals = captureAutoSignals();
      if (signals.length > 0) {
        return this.track(signals);
      }
    }

    return null;
  }

  /**
   * Send signals and run Bayesian inference.
   * Returns updated persona scores.
   */
  async track(signals: Signal[]): Promise<TrackResponse> {
    this.assertInit();
    const res = await request<TrackResponse>(
      `${this.config.endpoint}/api/v1/track`,
      {
        sessionId: this.sessionId,
        organizationId: this.config.organizationId,
        // Identity, not evidence. The engine stores it on the session and never matches on it.
        anonymousId: this.config.anonymousId,
        signals,
      },
      this.config.apiKey,
    );
    this.notify(res.personas, res.topPersonas);
    this.log("track", { matched: res.matchedSignals.length, ms: res.processingTimeMs });
    return res;
  }

  /**
   * Rank an entire category server-side and return one page of it.
   *
   * The difference from `search()` is who decides what is eligible. `search()` scores the candidate
   * list the caller passes in, so a storefront that sends the first hundred products has capped
   * personalization at those hundred — a slice taken before scoring, identical for every visitor.
   * Here the server holds the catalog, ranks all of it against the session, and pages the result,
   * so which products a shopper sees is decided by their personas rather than by catalog order.
   *
   * Returns ids and scores only; the caller already has the product rows.
   */
  async rankedCatalog(
    options: {
      categorySlug?: string;
      query?: string;
      page?: number;
      limit?: number;
      /**
       * Signals describing this moment, recorded before the ranking they inform.
       *
       * Sending them here rather than calling `track()` first turns three serial round trips into
       * one — measured at ~0.45s saved per navigation on a local network, and more wherever the round
       * trip itself is the cost.
       */
      signals?: Signal[];
      /** Ask for per-factor score breakdowns, for a storefront that explains its ranking. */
      includeBreakdown?: boolean;
      /**
       * Also return this many picks from OUTSIDE the requested category.
       *
       * For the strip above a category grid: without it the strip and the grid's first row are the
       * same products, because both are the same ranking.
       */
      recommendCount?: number;
    } = {},
  ): Promise<RankedCatalogResponse> {
    this.assertInit();
    const res = await request<RankedCatalogResponse>(
      `${this.config.endpoint}/api/v1/catalog/ranked`,
      {
        sessionId: this.sessionId,
        organizationId: this.config.organizationId,
        categorySlug: options.categorySlug,
        query: options.query,
        page: options.page ?? 1,
        limit: options.limit ?? 50,
        signals: options.signals,
        includeBreakdown: options.includeBreakdown,
        recommendCount: options.recommendCount,
      },
      this.config.apiKey,
    );
    // The ranking also reports the personas it used, so a caller that sends signals here does not
    // need a separate track() to learn what they produced.
    this.notify(res.personas, res.topPersonas);
    this.log("catalog/ranked", {
      ranked: res.totalRanked,
      returned: res.items.length,
      ms: res.processingTimeMs,
    });
    return res;
  }

  /**
   * Send products for persona-aware re-ranking.
   */
  async search(products: ProductInput[], options?: SearchOptions): Promise<SearchResponse> {
    this.assertInit();
    const res = await request<SearchResponse>(
      `${this.config.endpoint}/api/v1/search`,
      {
        sessionId: this.sessionId,
        organizationId: this.config.organizationId,
        products,
        query: options?.query,
        categorySlug: options?.categorySlug,
        limit: options?.limit,
        includeBreakdown: options?.includeBreakdown ?? true,
      },
      this.config.apiKey,
    );
    this.notify(res.personas, res.topPersonas);
    this.log("search", { results: res.results.length, ms: res.processingTimeMs });
    return res;
  }

  /**
   * Record which products the shopper actually saw, for a ranking decision.
   *
   * **Batched and flushed, never one request per product.** A shopper scrolling a long grid
   * generates hundreds of these; sending each one would cost more than the ranking it reports on.
   * Call it as products enter the viewport — the SDK coalesces and flushes on a short timer.
   *
   * Fire-and-forget by design: it never throws and never blocks rendering. Losing an exposure costs
   * one training example; blocking a scroll costs the sale.
   */
  exposure(decisionId: string, items: ExposureItem[]): void {
    if (!this.initialized || !decisionId || items.length === 0) return;
    const pending = this.pendingExposures.get(decisionId) ?? new Map<string, ExposureItem>();
    for (const item of items) {
      // Last write wins: a product that scrolls in, out and back in was still seen once, and
      // `visible: true` must not be overwritten by a later `false`.
      const existing = pending.get(item.productId);
      pending.set(item.productId, existing?.visible ? existing : item);
    }
    this.pendingExposures.set(decisionId, pending);

    if (this.exposureTimer !== null) return;
    this.exposureTimer = setTimeout(() => {
      this.exposureTimer = null;
      void this.flushExposures();
    }, 500) as unknown as number;
  }

  /** Send everything buffered. Safe to call at any time; also runs on the flush timer. */
  async flushExposures(): Promise<void> {
    const batches = [...this.pendingExposures.entries()];
    this.pendingExposures.clear();
    for (const [decisionId, items] of batches) {
      try {
        await request<ExposureResponse>(
          `${this.config.endpoint}/api/v1/exposure`,
          {
            sessionId: this.sessionId,
            organizationId: this.config.organizationId,
            decisionId,
            items: [...items.values()],
          },
          this.config.apiKey,
        );
      } catch {
        // Analytics must never surface to a shopper. Dropped, counted by the server.
      }
    }
  }

  /**
   * Log a conversion event (click, add_to_cart, purchase).
   */
  async event(eventType: string, data?: EventData): Promise<EventResponse> {
    this.assertInit();
    // Flush first, so the exposure that preceded a click is recorded before the click itself.
    // Out of order, the loop sees an outcome with no impression behind it.
    await this.flushExposures();
    return request<EventResponse>(
      `${this.config.endpoint}/api/v1/event`,
      {
        sessionId: this.sessionId,
        organizationId: this.config.organizationId,
        eventType,
        ...data,
      },
      this.config.apiKey,
    );
  }

  /**
   * Get current session state from the server.
   */
  async getSession(): Promise<SessionResponse> {
    this.assertInit();
    return request<SessionResponse>(
      `${this.config.endpoint}/api/v1/session`,
      { sessionId: this.sessionId },
      this.config.apiKey,
    );
  }

  /** Subscribe to persona score updates */
  onPersona(callback: OnPersonaUpdate): void {
    this.personaCallback = callback;
  }

  /** Get the current session ID */
  getSessionId(): string {
    return this.sessionId;
  }

  /** Clear session and start fresh */
  resetSession(): void {
    clearSession();
    this.sessionId = getOrCreateSessionId(this.config?.sessionTtlMs);
    this.log("reset", { sessionId: this.sessionId });
  }

  private assertInit(): void {
    if (!this.initialized) {
      throw new Error("PULSE SDK: call init() first");
    }
  }

  private notify(
    personas: Record<string, number>,
    topPersonas: Array<{ slug: string; score: number }>,
  ): void {
    this.personaCallback?.(personas ?? {}, Array.isArray(topPersonas) ? topPersonas : []);
  }

  private log(label: string, data?: unknown): void {
    if (this.config?.debug) {
      console.log(`[PULSE] ${label}`, data ?? "");
    }
  }
}

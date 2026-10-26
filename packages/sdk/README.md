# @thepulseapi/sdk

[![website](https://img.shields.io/badge/thepulseapi.com-6366f1)](https://thepulseapi.com/en)
[![npm](https://img.shields.io/npm/v/@thepulseapi/sdk?color=6366f1)](https://www.npmjs.com/package/@thepulseapi/sdk)
[![license](https://img.shields.io/npm/l/@thepulseapi/sdk)](./LICENSE)
[![bundle](https://img.shields.io/badge/gzipped-3.2%20KB-6366f1)](https://cdn.thepulseapi.com/sdk/v0/pulse.iife.js)
[![dependencies](https://img.shields.io/badge/dependencies-0-6366f1)](./package.json)

**The browser SDK for [PULSE](https://thepulseapi.com/en): rank your e-commerce catalogue for each
shopper, explain every score, and favour the purchases that stay bought.**

PULSE is a service for online merchants. It measures whether your product catalogue can answer the
questions shoppers ask before they buy, tells you which missing information costs the most
decisions, and proves whether each fix worked. This package is the client for the live half: it
sends what a shopper does on your storefront and gets your catalogue back ranked for that visit,
with the reason behind every score.

It infers from behaviour, not identity. No login to warm up, no purchase history, no cookie to
match: a first-time anonymous visitor is ranked within their first session. What leaves the browser
is a session id and a list of signals. Not names, not emails, not payment data.

**3.2 KB gzipped. No runtime dependencies. No framework.**

> **For PULSE merchants.** The SDK is free and MIT licensed, but it talks to the PULSE Decision
> API, which needs a **PULSE merchant account with an active subscription**. Your API key comes from
> your account's dashboard. No account yet?
> **[See the plans](https://thepulseapi.com/en/pricing)** and
> **[create an account](https://thepulseapi.com/en/signup)**, or start with a
> **[free Decision Audit](https://thepulseapi.com/en/contact)**, which needs no account at all.

🌐 **[thepulseapi.com](https://thepulseapi.com/en)** &nbsp;·&nbsp;
📘 [Developer docs](https://developer.thepulseapi.com) &nbsp;·&nbsp;
[Pricing](https://thepulseapi.com/en/pricing) &nbsp;·&nbsp;
[Create an account](https://thepulseapi.com/en/signup) &nbsp;·&nbsp;
[Dashboard](https://app.thepulseapi.com)

## Who this is for

Merchants who run their own storefront and want it to rank for each visitor, and the developers
they bring in to connect it. The full guide, every endpoint and the framework recipes are in the
**[developer documentation](https://developer.thepulseapi.com)**, which starts with the same three
steps: create a merchant account, choose a subscription, create an API key.

**The client is open, the service is a subscription.** Pulse sells decisions and repair cycles, not
the code that calls them. A script that runs on every product page should be auditable by the
person who put it there, so this package is MIT and published in full. The ranking it calls is the
paid PULSE service.

## Table of contents

- [The problem this solves](#the-problem-this-solves)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting your API key](#getting-your-api-key)
- [Environments](#environments)
- [Quick start](#quick-start)
- [Framework guides](#framework-guides)
- [API reference](#api-reference)
- [Return history and order outcomes](#return-history-and-order-outcomes)
- [Configuration](#configuration)
- [What leaves the browser](#what-leaves-the-browser)
- [Versioning and the CDN](#versioning-and-the-cdn)
- [Pricing](#pricing)
- [About Pulse](#about-pulse)
- [Enterprise](#enterprise)
- [For AI agents / LLM tools](#for-ai-agents--llm-tools)
- [Support](#support)

---

## The problem this solves

**Every search and recommendation tool answers, because answering is all they can do.** They will
rank something for any query, including the queries your catalogue has no data to resolve. The
shopper gets a confident list that cannot be filtered, and nobody finds out why they left.

Pulse measures whether an answer is supported at all. When it is not, it says what is missing and
what it would cost to record it.

The part people get wrong is which gap to fix. **Pulse ranks the product data your catalogue is
missing by how many shoppers need it, not by how empty a field is.** Those two rankings disagree,
and the disagreement is expensive. On a measured shelf of **216 laptops**, the field missing from
the most products was `processor`, absent on **162** of them, and it appeared in **2 of 32** stated
buying requirements. `memory` was missing on only 60, and appeared in **15**. Fixing the emptier
field touches nearly three times as many products and changes what almost nobody can choose.

### Where this SDK fits

| | |
| --- | --- |
| **[Decision Audit](https://thepulseapi.com/en/product/decision-audit)** | Rank which missing fields to fix first. One category export, no account. Free |
| **[Decision Verification](https://thepulseapi.com/en/product/decision-verification)** | Recompute after the repair and see exactly what moved |
| **[Decision Monitor](https://thepulseapi.com/en/product/decision-monitor)** | Get told when a shelf slips, and why |
| **[Return Verification](https://thepulseapi.com/en/product/return-verification)** | See which missing facts go with returns, and whether a repair moved them |
| **[Decision API](https://thepulseapi.com/en/product/decision-api)** | Serve those decisions live, per shopper, per session. **This package is its browser client**, for merchants with a subscription |

It is not a PIM, and it replaces nothing you already run. The audit needs a CSV or JSON export, no
system access and no tagging. This SDK is the step after that, for merchants serving decisions on
a live storefront.

---

## Features

- ⚡ **3.2 KB gzipped**, zero runtime dependencies. It loads on storefront pages whose owners measure Core Web Vitals
- 🧠 **Ranks on inferred persona**, not on purchase history, so a first-time anonymous visitor is served immediately
- 🔍 **Explains itself**. Every result carries a score breakdown and the signals that matched it
- 🌐 **Framework-free core**. React, Next.js, Vue, Nuxt, Angular, Astro, Alpine, Laravel, or a plain `<script>` tag
- 🖥️ **Server-safe**. Every browser API sits behind a `typeof` guard, so importing during SSR does not throw
- 📡 **Automatic signals**. Device class, referrer and time of day captured once per session
- 🧾 **Exposure tracking**. Record what was actually shown, which is how ranking quality gets graded
- 📦 **ESM, CJS and IIFE** builds, with full TypeScript types

---

## Prerequisites

| | |
| --- | --- |
| **A PULSE merchant account with an active subscription** | For an organization id and an API key. [Create an account](https://thepulseapi.com/en/signup), [choose a plan](https://thepulseapi.com/en/pricing), then see [Getting your API key](#getting-your-api-key) |
| **A browser** | Any environment with `fetch`. Evergreen browsers, or Node 18+ for server-side use |
| **Node** (only for bundler use) | 20 or newer, matching the `engines` field |
| **TypeScript** (optional) | 5.0+ if you want the shipped types |

No build tooling is required. The `<script>` tag works on a plain HTML page.

---

## Installation

```bash
pnpm add @thepulseapi/sdk
# or
npm install @thepulseapi/sdk
# or
yarn add @thepulseapi/sdk
# or
bun add @thepulseapi/sdk
```

### Or use the script tag

No bundler, no install. This is what the WordPress, Shopify, Alpine and Laravel integrations use.

```html
<script
  src="https://cdn.thepulseapi.com/sdk/v0/pulse.iife.js"
  integrity="sha384-8o8zF5vok1TbaihZxMFcN9NxA0qVIoF5Lv9G6j3xv5g9FHMsRpbEZ3/ZJwkBdcmq"
  crossorigin="anonymous"
></script>
```

The script tag exposes the client as the global `Pulse`, so `Pulse.init(...)` works directly.

> The `integrity` hash above pins the exact bytes of **0.2.0**. If you load the floating
> `/sdk/v0/` path, which receives patches, omit `integrity` or pin the exact version instead. See
> [Versioning and the CDN](#versioning-and-the-cdn).

---

## Getting your API key

1. **Create a merchant account** at **<https://thepulseapi.com/en/signup>** with your work email.
   Your organization is reviewed before it is activated, and you get an email when it is approved.
2. **Choose a subscription.** Compare the plans at **<https://thepulseapi.com/en/pricing>**, then
   subscribe from **Settings → Billing** in the [dashboard](https://app.thepulseapi.com/settings/billing).
3. In the dashboard, open **[Integration → API keys](https://app.thepulseapi.com/integration/api-keys)**
   and choose **Create key**. Name it for where it will run, for example `storefront-production`.
4. **Copy the key immediately.** The full value is returned once, at creation, and only its hash
   is stored. If you lose it, revoke it and create another.
5. Your **organization id** is on the same page. The SDK needs both.

The [developer documentation](https://developer.thepulseapi.com) walks through the same three
steps.

Keys look like this:

```
pk_live_0000000000000000000000000000000000
```

| | |
| --- | --- |
| **Publishable** | `pk_live_` keys are designed to be visible in browser code. They can send signals and read rankings, nothing else |
| **Scoped** | Every key belongs to one organization and cannot read another's data |
| **Revocable** | Revoke from the same page. Revocation takes effect immediately |
| **Expiring** | A key can be given an expiry date at creation |

> **What must stay on your server.** The publishable key belongs in the browser. Anything that
> administers your account does not. In a server-rendered app such as Laravel or Next.js, inject
> the publishable key into the page and keep everything else server-side.

---

## Environments

There is **one hosted environment** today. There is no separate sandbox, and keys are not split
into test and live: every issued key is a `pk_live_` key scoped to your organization.

| Environment | Endpoint | |
| --- | --- | --- |
| **Production** | `https://api.thepulseapi.com` | The default. Omit `endpoint` to use it |
| **Local development** | `http://localhost:4000` | Only when running the PULSE stack yourself |

```js
await pulse.init({
  apiKey: "pk_live_...",
  organizationId: "org_...",
  endpoint: "http://localhost:4000", // omit in production
});
```

To keep experiments out of your reporting, create a **separate key** for development and revoke
it when you are finished. That is the supported way to isolate traffic until a sandbox exists.

---

## Quick start

```js
import { PulseClient } from "@thepulseapi/sdk";

const pulse = new PulseClient();

// 1. Start a session. Also captures device, referrer and time of day, once.
await pulse.init({
  apiKey: "pk_live_...",
  organizationId: "org_...",
});

// 2. Tell it what the shopper did.
await pulse.track([
  { type: "category_view", value: "helmets-safety" },
  { type: "price_filter", value: "500000-1500000" },
]);

// 3. Rank your products against the session.
const { results } = await pulse.search(products);

results[0].scoreBreakdown; // why this one came first
```

`init()` is the only call that needs a browser. Everything else is a plain HTTPS request.

---

## Framework guides

The client is plain TypeScript with no framework coupling, so it works anywhere JavaScript runs.
Dedicated adapter packages for React, Vue and Angular are planned; until then the core works
directly in all of them.

### React and Next.js

Create the client once and share it. In Next.js, the component that calls `init()` must be a
client component, because the session lives in the browser.

```tsx
"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { PulseClient } from "@thepulseapi/sdk";

const PulseContext = createContext(null);
export const usePulse = () => useContext(PulseContext);

export function PulseProvider({ children }) {
  const pulse = useRef(new PulseClient());

  useEffect(() => {
    pulse.current.init({
      apiKey: process.env.NEXT_PUBLIC_PULSE_API_KEY,
      organizationId: process.env.NEXT_PUBLIC_PULSE_ORG_ID,
    });
  }, []);

  return <PulseContext.Provider value={pulse.current}>{children}</PulseContext.Provider>;
}
```

Server Components and SSR are fine. The import is side-effect free and every browser API is
guarded, so only `init()` needs the browser.

### Vue and Nuxt

```js
import { PulseClient } from "@thepulseapi/sdk";

export default {
  install(app) {
    const pulse = new PulseClient();
    if (!import.meta.env.SSR) {
      pulse.init({ apiKey: "pk_live_...", organizationId: "org_..." });
    }
    app.provide("pulse", pulse);
  },
};
```

### Angular

```ts
import { Injectable } from "@angular/core";
import { PulseClient } from "@thepulseapi/sdk";

@Injectable({ providedIn: "root" })
export class PulseService extends PulseClient {}
```

Call `init()` from `APP_INITIALIZER`, or from the first component that runs in the browser.

### Astro

Astro ships whichever island framework you use, so for islands follow the React or Vue section.
For a plain Astro page, this is the whole integration:

```astro
<script>
  import { PulseClient } from "@thepulseapi/sdk";
  new PulseClient().init({ apiKey: "pk_live_...", organizationId: "org_..." });
</script>
```

### Alpine

Use the script tag build and the global.

```html
<script src="https://cdn.thepulseapi.com/sdk/v0/pulse.iife.js"></script>
<script>
  Pulse.init({ apiKey: "pk_live_...", organizationId: "org_..." });
</script>

<button x-on:click="Pulse.track([{ type: 'product_view', value: 'sku-123' }])">
  View
</button>
```

### Laravel

Laravel renders on the server, so the browser half is the script tag, usually in a Blade layout.

```blade
<script src="https://cdn.thepulseapi.com/sdk/v0/pulse.iife.js"></script>
<script>
  Pulse.init({
    apiKey: "{{ config('services.pulse.key') }}",
    organizationId: "{{ config('services.pulse.org') }}",
  });
</script>
```

```php
// config/services.php
'pulse' => [
    'key' => env('PULSE_PUBLISHABLE_KEY'),
    'org' => env('PULSE_ORGANIZATION_ID'),
],
```

To call PULSE from PHP itself, use the REST API rather than this package.

---

## API reference

### Session

| Method | Returns | |
| --- | --- | --- |
| `init(config)` | `TrackResponse \| null` | Start a session and send the automatic signals once |
| `getSession()` | `SessionResponse` | Current session and the personas inferred so far |
| `getSessionId()` | `string` | The current session id |
| `resetSession()` | `void` | Clear the session and start fresh |
| `onPersona(cb)` | `void` | Subscribe to persona updates |

### Signals and ranking

| Method | Returns | |
| --- | --- | --- |
| `track(signals)` | `TrackResponse` | Send shopper signals |
| `search(products, options?)` | `SearchResponse` | Rank products you supply, with a score breakdown per result |
| `rankedCatalog(options?)` | `RankedCatalogResponse` | Rank the catalogue already synced to PULSE |
| `event(type, data?)` | `EventResponse` | Record a named event. On a purchase, send `{ decisionId, orderId }` so a later return can be traced to it |

### Exposure

Ranking cannot be graded without knowing what was actually shown.

| Method | Returns | |
| --- | --- | --- |
| `exposure(decisionId, items)` | `void` | Record what was rendered, buffered |
| `flushExposures()` | `void` | Send buffered exposures now |

### Return history and order outcomes

The ranking includes a `retention` factor: how often a product comes back for a reason the listing
could have prevented, such as wrong size or not as described. It is **off until there is return
history**, and ranking is unchanged without it. Give it history in either of two ways:

- **From your server,** report each order line's fate to
  [`POST /outcomes`](https://developer.thepulseapi.com/api/v1/outcomes): kept, returned, refunded,
  cancelled. Send the purchase with its `orderId` first:

  ```js
  await pulse.event("purchase", { decisionId, orderId: "SO-10442" });
  ```

- **On the products you rank,** send totals you computed yourself:

  ```js
  await pulse.search([
    { id: "sku-123", deliveredOrders: 1840, evidenceReturns: 37, margin: 180000, returnCost: 45000 },
  ]);
  ```

`evidenceReturns` counts only returns better product information could have prevented, never
transit damage or a refused delivery. With your own `margin` and `returnCost`, it ranks on the value
a purchase keeps after returns, not the return rate alone. More in
[Return Verification](https://developer.thepulseapi.com/concepts/return-verification).

### Signal helpers

`init()` sends these once and swallows its own failure, so they are exported for a host app that
wants them re-asserted on a later page load. They cost no network.

```js
import {
  captureAutoSignals,
  captureDeviceSignal,
  captureReferrerSignal,
  captureTimeSignal,
  captureGeoInfo,
  captureWeatherInfo,
  captureCulturalCalendar,
  parseUserAgent,
} from "@thepulseapi/sdk";
```

---

## Configuration

| Key | Default | |
| --- | --- | --- |
| `apiKey` | **required** | Your publishable key, `pk_live_...` |
| `organizationId` | **required** | From the dashboard |
| `endpoint` | `https://api.thepulseapi.com` | Override only for local development |
| `autoTrack` | `true` | Capture device, referrer and time on `init()` |
| `sessionTtlMs` | 30 minutes | How long a session survives inactivity |
| `anonymousId` | none | A stable label for the visitor. **Identity only, never a signal:** nothing in the engine matches on it, so it cannot change what is inferred |
| `debug` | `false` | Verbose logging |

---

## What leaves the browser

Signals and a session id. **Not names, not emails, not payment data.**

`anonymousId` is carried if you set it, and the engine cannot match on it, so labelling a session
never changes what the engine concludes about it. That separation is deliberate: it is what makes
it possible to attribute a session without contaminating the inference.

You remain the data controller for anything you choose to send. Send signals, not identities.

---

## Versioning and the CDN

The CDN serves two paths for every release:

| Path | Cache | Use it when |
| --- | --- | --- |
| `/sdk/v0/pulse.iife.js` | 5 minutes | You want patches automatically. This is what the quick-start shows |
| `/sdk/v0.2.0/pulse.iife.js` | 1 year, immutable | You need the bytes to never change, for example to publish an SRI hash |

The floating path is cached for only five minutes on purpose: a quick-start snippet gets copied
once and never revisited, so a long cache there would make "you get patches" untrue.

This package follows semantic versioning. While the major is `0`, minor versions may contain
breaking changes, and they will be called out in the release notes.

---

## Pricing

Full detail at **[thepulseapi.com/pricing](https://thepulseapi.com/en/pricing)**. The SDK itself
is free; the Decision API it calls needs a PULSE merchant subscription.

| | |
| --- | --- |
| **Decision Audit** | **Free.** One category, one export, no account. [Request one](https://thepulseapi.com/en/contact) |
| **Repair plan and verification** | Per cycle |
| **Decision Monitor** | Recurring |
| **Decision API** | Per decision, served after a pilot. **This SDK is its client** |

**There is no published per-seat price, deliberately.** What a pilot is worth depends on your
catalogue, your traffic and what you are trying to decide, and a per-seat number would be one we
invented to look established.

One limit worth stating before any invoice: verification shows your catalogue can answer a
question it could not answer before. It does not show that anyone bought anything. Measuring that
needs your traffic and a held-back group.

---

## About Pulse

Pulse is a decision layer for e-commerce catalogues. We started from a measurement rather than a
product idea: that most catalogue quality work is prioritised by which field looks emptiest, and
that this is almost never the field a shopper needed.

What we publish, we publish with the evidence attached. The shelf in
[The problem this solves](#the-problem-this-solves) is a real measured category, and the numbers
on the site are linked to their sources. Where we cannot show a number, we say so instead of
estimating one.

- **Product:** <https://thepulseapi.com/en/product>
- **Return Verification:** <https://thepulseapi.com/en/product/return-verification>
- **Pricing:** <https://thepulseapi.com/en/pricing>
- **Developer docs:** <https://developer.thepulseapi.com>
- **About us:** <https://thepulseapi.com/en/about>
- **Blog:** <https://thepulseapi.com/en/blog>
- **Request a Decision Audit:** <https://thepulseapi.com/en/contact>

---

## Enterprise

**Hosting and data residency.** The hosted API runs in `ap-southeast-1`. Self-hosting the engine
is available for merchants who need data to stay in a specific jurisdiction.

**Data protection.** The SDK transmits behavioural signals and a session identifier. It collects
no direct identifiers, so it does not transmit personal data unless you choose to supply an
`anonymousId` that is personal to you. Under GDPR you are the controller and PULSE is the
processor. A DPA is available.

**Deletion and retention.** Session data is deleted on request, by session id or by
`anonymousId`. Retention windows are configurable per organization.

**Content Security Policy.** If your storefront sets a CSP, allow:

```
script-src  https://cdn.thepulseapi.com
connect-src https://api.thepulseapi.com
```

**Subresource Integrity.** Pin an exact version and use the `integrity` attribute, as shown in
[Installation](#installation). The publish tooling prints the hash for every release.

**Availability.** Service levels, uptime commitments and support response times are covered by
the commercial agreement rather than by this package. Ask your account contact.

**Key rotation.** Create the replacement key, deploy it, then revoke the old one. Revocation is
immediate, so revoking first causes an outage.

---

## For AI agents / LLM tools

Concise, accurate facts for code generation. Prefer these over guessing.

**Package:** `@thepulseapi/sdk` · **Dependencies:** none · **Builds:** ESM, CJS, IIFE · **Types:** included.

**Setup is two required fields and one call:**
```typescript
import { PulseClient } from "@thepulseapi/sdk";
const pulse = new PulseClient();
await pulse.init({ apiKey: "pk_live_...", organizationId: "org_..." });
```

**Account:** the Decision API needs a PULSE merchant account with an active subscription
(<https://thepulseapi.com/en/signup>, <https://thepulseapi.com/en/pricing>). Keys come from
<https://app.thepulseapi.com/integration/api-keys>. Full docs: <https://developer.thepulseapi.com>.

**Rules and gotchas:**
- `PulseClient` is a **named** export. There is no default export; `require("@thepulseapi/sdk").default` is `undefined` by design.
- The `<script>` build is different: the global `Pulse` **is** the client instance, so call `Pulse.init(...)`, not `Pulse.default.init(...)`.
- `apiKey` and `organizationId` are both required. There is no inference from the domain.
- Keys are always `pk_live_`. **There is no `pk_test_` key and no sandbox environment.** Use a separate key for development.
- The full key is returned **only at creation**. It cannot be read back later.
- `endpoint` defaults to `https://api.thepulseapi.com`. Set it only for local development.
- `init()` is the only call that needs a browser. Importing the package during SSR is safe; calling `init()` on the server is not useful.
- In Next.js, the component calling `init()` needs `"use client"`.
- `search(products)` ranks products **you pass in**. `rankedCatalog()` ranks the catalogue already synced to PULSE. They are not interchangeable.
- `anonymousId` is an identity label, never a signal. It cannot influence ranking.
- Call `exposure(decisionId, items)` with what was actually rendered, otherwise ranking quality cannot be measured.
- On a purchase, call `event("purchase", { decisionId, orderId })`; order outcomes (`POST /outcomes`) are sent from the merchant's server, never the browser.
- `deliveredOrders`, `evidenceReturns`, `margin` and `returnCost` on a product are optional; without them the `retention` factor is simply off.

---

## Support

- **Website:** <https://thepulseapi.com/en>
- **Developer docs:** <https://developer.thepulseapi.com>
- **Create an account:** <https://thepulseapi.com/en/signup>
- **Product:** <https://thepulseapi.com/en/product>
- **Pricing:** <https://thepulseapi.com/en/pricing>
- **Dashboard and API keys:** <https://app.thepulseapi.com>
- **Request a Decision Audit:** <https://thepulseapi.com/en/contact>

Licensed [MIT](./LICENSE).

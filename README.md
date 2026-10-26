# Open Pulse

The open-source half of [PULSE](https://thepulseapi.com), by Resolve Labs: an MCP server that gives
AI agents grounded decisions, the browser SDK, and runnable examples. MIT licensed.

**PULSE is a decision call: requirements and evidence in, a verdict out.** For every option, does
the evidence show it meets each requirement, fails it, or not say at all? It works for any
industry and any category where options have attributes: products, suppliers, hotels, plans,
parts, vendors. It is built to be called by AI agents such as Claude, ChatGPT, Claude Code and
Codex, as well as by your own code.

> [!IMPORTANT]
> This repository is the **client side**: code that runs on your machine or your site. The decision
> engine runs behind the [PULSE API](https://developer.thepulseapi.com/api) and is not here. Nothing
> in this repository claims a conversion, revenue or returns effect: no live experiment has produced
> one, and we will not print a number nobody measured.

## The idea

Language models are built to answer. Ask one which supplier meets your spec and it will pick one,
even when the datasheet never stated the rating you asked for. PULSE gives an agent a third answer
besides yes and no: **"the evidence does not say."**

```text
   what is needed                       the options and their evidence
   "IP67, 24V, within 14 days"          fields, titles, descriptions
            │                                       │
            ▼                                       ▼
     requirements ───────────────┐      evidence per attribute
     ip_rating  = IP67           │      a stated field beats text read off the page
     voltage    = 24V            │                  │
     lead_time <= 14             ▼                  ▼
                        ┌───────────────────────────────┐
                        │          POST /decide         │
                        └───────────────────────────────┘
                          │             │              │
                          ▼             ▼              ▼
                        fits          fails       cannot_tell
                                                  + what is missing
```

Three things follow from that one rule:

- **An agent stops guessing.** It can say "the listing does not state the breakfast policy"
  instead of inventing one.
- **Every unknown is a to-do.** `missing` is exactly the information the option's owner should
  publish.
- **The answer is typed.** A verdict is one of three values with the evidence behind it, never
  prose to parse.

PULSE started in e-commerce, where it also ranks storefronts and audits promotions. The decision
call underneath is domain-free.

How this relates to typed-decision models such as TypeSafe AI's Jev: [docs/jev-and-open-pulse.md](docs/jev-and-open-pulse.md).

## Decision evidence

Commerce has plenty of product data and very little decision data. A catalogue knows the title,
brand, price and colour. A buyer is asking whether the sofa fits through the door, whether the
charger works with their laptop, and what is in the box. Those are **decision requirements**, and
answering them takes evidence, not more fields.

```text
Requirement        what needs to be known
    ↓
Product evidence   the facts recorded, and where each came from
    ↓
Visible evidence   what a shopper or an agent can actually see
    ↓
Decision           whether the evidence is enough
    ↓
Outcome            what happened afterwards
```

A product can have data and still have an evidence problem: a fact in the supplier feed that never
reaches the page, a specification stated twice with two values, a photograph that hides the feature
that matters. On our own 2,176-product demonstration catalogue, 52.6% of recorded values repeat
what the photograph already shows ([the research](https://thepulseapi.com/en/research)).

**Abstention is a feature.** If the package size is not recorded, an agent should not infer from
the assembled width that a sofa fits through a door. `/decide` reports each requirement as
`meets`, `fails`, `unknown` or `conflicting`, and the option as `fits`, `fails` or `cannot_tell`.

**Generate presentation. Never generate an unverified product fact.** AI can restructure, summarise
and explain verified evidence. It must not invent dimensions, materials, compatibility,
certifications, what is in the box or warranty terms.

### Planned: a shared vocabulary

Not in this repository yet. Proposed as part of the shared evidence formats, and open for
discussion in issues:

| Evidence state | Meaning | | Repair | Meaning |
| --- | --- | --- | --- | --- |
| `MISSING` | Not recorded | | `RECORD` | Capture a missing fact |
| `BURIED` | Exists, hard to find | | `SHOW` | Expose evidence that already exists |
| `INVISIBLE` | Known internally, not shown where the decision is made | | `RECONCILE` | Resolve sources that disagree |
| `UNRESOLVED` | Some information, not enough to answer | | `GENERATE` | Present verified evidence better |
| `CONFLICTING` | Sources disagree | | `ASK` | Request it from the merchant, supplier or buyer |
| `NOT_OBSERVABLE` | The evidence cannot answer it | | `COMPUTE` | Derive it safely from verified inputs |
| | | | `ABSTAIN` | Do not answer without evidence |
| | | | `DONT_FIX` | Accept that a gap is not worth fixing |

The last two repairs matter most: a trustworthy system can say "I don't know", and a sensible one
can say "this is not worth fixing".

## Open and paid

**Open Pulse describes the evidence. PULSE decides what is worth doing about it.**

| Open Pulse (this repository) | PULSE (the API) |
| --- | --- |
| Browser SDK, MCP server, examples, agent guide | Decision Audit: which gap matters most |
| Planned: requirement and evidence formats, the vocabulary above, category packs, validators, connectors | Repair prioritisation, Decision Verification, Decision Monitor |
| | Return Verification, Promotion Audit, the Decision API in production, learning from outcomes |

## What is here

| Package | What it is | Status |
| --- | --- | --- |
| [`@thepulseapi/mcp`](packages/mcp) | MCP server: agents call `resolve_products` for verdicts, and search the PULSE docs | [npm](https://www.npmjs.com/package/@thepulseapi/mcp) |
| [`@thepulseapi/sdk`](packages/sdk) | Browser SDK for storefronts: signals, live ranking, exposure. About 3 KB gzipped, no runtime dependencies | [npm 0.2.0](https://www.npmjs.com/package/@thepulseapi/sdk) |
| [`examples/`](examples) | Runnable examples for developers and for AI agents | |
| [`AGENTS.md`](AGENTS.md) | How an AI agent should call PULSE and answer from it | |

## Use it from an AI agent

Add the MCP server to Claude Code, Claude Desktop, Cursor or Codex ([details](examples/agents)):

```json
{ "mcpServers": { "pulse": { "command": "npx", "args": ["-y", "@thepulseapi/mcp"],
  "env": { "PULSE_API_KEY": "pk_live_..." } } } }
```

Then tell the agent: *"Before recommending an option, call resolve_products, and never state an
attribute it marked unknown."*

## Use it from code

Any option with attributes, any domain:

```js
const res = await fetch("https://api.thepulseapi.com/api/v1/decide", {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": process.env.PULSE_API_KEY },
  body: JSON.stringify({
    requirements: [
      { attribute: "voltage", op: "eq", value: "24V" },
      { attribute: "ip_rating", op: "eq", value: "IP67" },
      { attribute: "lead_time_days", op: "lte", value: 14 },
    ],
    products: [
      { id: "acme", attributes: { voltage: "24V", ip_rating: "IP67", lead_time_days: 10 } },
      { id: "borealis", attributes: { voltage: "24V", ip_rating: "IP54", lead_time_days: 7 } },
      { id: "corvid", attributes: { voltage: "24V", lead_time_days: 21 } },
    ],
  }),
});
// acme      fits
// borealis  fails
// corvid    fails, and missing: ip_rating
```

That output was produced by PULSE's decision code on this input.

- `op` is `lte`, `gte`, `eq` or `neq`. Numbers compare as numbers; text compares case-insensitively.
- `products` is the list of options, whatever they are. Up to 50 per call, 20 requirements.
- A `query` in plain words adds a budget it finds ("under $180") as a price requirement.

## Examples

| Example | Shows | For |
| --- | --- | --- |
| [`agents/`](examples/agents) | The MCP server in Claude, Cursor and Codex, and how an agent should answer | AI agents |
| [`decide-any-domain.mjs`](examples/decide-any-domain.mjs) | Suppliers and hotels: fits, fails, cannot tell | Any developer |
| [`decide.mjs`](examples/decide.mjs) | The same for a shopper's laptop request, with facts read from descriptions | Commerce |
| [`promotion-audit.mjs`](examples/promotion-audit.mjs) | Which offers paid for themselves after returns | Commerce |
| [`landed-price.mjs`](examples/landed-price.mjs) | What a shopper really pays across marketplaces | Commerce |
| [`browser-sdk.html`](examples/browser-sdk.html) | Live storefront ranking from the CDN | Storefronts |

## Notes

- **A verdict is only as good as the evidence.** `cannot_tell` is the call working, not failing.
  Never fill it in.
- **Structured attributes work in every domain today.** Reading facts out of free text (titles,
  descriptions) is narrower: laptop facets only (`ram`, `storage`, `screen`, `cpu`). Elsewhere, send
  the fields.
- **Grounded is not the same as true.** The verdict reflects what the evidence says, which can be
  wrong. A stated field always wins over text read off the page.
- **Do not use it to decide about people.** Hiring, lending and similar decisions about individuals
  need safeguards this call does not provide.

## Roadmap

Released items are in this repository today. Everything else is planned; none of it has a date.

- [x] `/decide` and the MCP tool, domain-free
- [x] Browser SDK on npm and the CDN
- [ ] Shared formats for requirements, evidence and outcomes, with the evidence states and repairs above
- [ ] Category packs: the requirements that matter per kind of product, and the evidence each needs
- [ ] Validators for malformed, contradictory or incomplete evidence
- [ ] Connectors for commerce platforms, PIMs and feeds
- [ ] A remote MCP endpoint, for ChatGPT and other clients that cannot run a local server
- [ ] A query parser that turns plain requests into requirements, beyond budgets
- [ ] Free-text fact reading beyond laptops, declared per category

## What Open Pulse is not

Not a recommendation engine, a product description generator, a replacement for a PIM, a cart, a
payment protocol or a marketplace. Not a promise that every missing field matters, and not a system
that answers when the evidence is not enough. More product data is not automatically better product
data.

## Contributing

You do not need to work on machine learning to contribute. Useful contributions include a real
buying requirement a category is missing, a connector, examples, better agent tooling, clearer
docs, and a report that a model is wrong: "this is not how buyers choose this product" is a good
issue.

**Domain experts are contributors too.** Someone who knows furniture, electronics, beauty or
industrial parts may know the evidence a decision needs better than the people writing the code.
**AI agents can propose, with review:** an agent that meets a requirement no model covers can
propose it, and people review it before anything changes.

Open an issue first, and read [CONTRIBUTING.md](CONTRIBUTING.md); contributions are accepted under
the [Contributor License Agreement](CLA.md).

## Links

[thepulseapi.com/opensource](https://thepulseapi.com/opensource) ·
[Developer docs](https://developer.thepulseapi.com) ·
[API reference](https://developer.thepulseapi.com/api) ·
[llms.txt](https://developer.thepulseapi.com/llms.txt)

## Licence

[MIT](LICENSE). Copyright (c) 2026 Resolve Labs.

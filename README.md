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

## What is here

| Package | What it is | Status |
| --- | --- | --- |
| [`@thepulseapi/mcp`](packages/mcp) | MCP server: agents call `resolve_products` for verdicts, and search the PULSE docs | npm 0.2.0, awaiting release approval |
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

## Todo

- [x] `/decide` and the MCP tool, domain-free
- [x] Browser SDK on npm and the CDN
- [ ] A remote MCP endpoint, for ChatGPT and other clients that cannot run a local server
- [ ] A query parser that turns plain requests into requirements, beyond budgets
- [ ] Free-text fact reading beyond laptops, declared per category
- [ ] Shared formats for requirements, evidence and outcomes

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first; contributions
are accepted under the [Contributor License Agreement](CLA.md).

## Links

[thepulseapi.com/opensource](https://thepulseapi.com/opensource) ·
[Developer docs](https://developer.thepulseapi.com) ·
[API reference](https://developer.thepulseapi.com/api) ·
[llms.txt](https://developer.thepulseapi.com/llms.txt)

## Licence

[MIT](LICENSE). Copyright (c) 2026 Resolve Labs.

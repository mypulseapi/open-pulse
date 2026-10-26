# Examples

Each one runs as it stands. The Node examples need Node 20 or later and a key in `PULSE_API_KEY`,
which you create in the PULSE dashboard under Integration, API keys.

| Example | What it shows | Who it is for |
| --- | --- | --- |
| [`browser-sdk.html`](browser-sdk.html) | The SDK from the CDN: start a session, send signals, rank, record what was shown | Storefront developers |
| [`decide.mjs`](decide.mjs) | `POST /decide`: which products fit, fail, or cannot be told, and why | Developers and agent builders |
| [`promotion-audit.mjs`](promotion-audit.mjs) | `POST /interventions/audit`: which offers paid for themselves after returns | Sellers' engineers and analysts |
| [`landed-price.mjs`](landed-price.mjs) | `POST /interventions/landed`: the real price across marketplaces | Pricing and marketplace teams |
| [`agents/`](agents) | The MCP server for Claude, Cursor and Codex, and how an agent should answer | AI agents and the people wiring them |

The expected output quoted at the end of each Node example was produced by PULSE's own decision
code on the same input.

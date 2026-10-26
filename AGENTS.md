# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor and others) working with this
repository or calling PULSE from code you write.

## What PULSE is, in one line

**Shopper requirements and product evidence in, a verdict per product out: fits, fails, or cannot
tell, with what is missing.** Plus the Promotion Audit: offers judged on orders kept after returns
and failed deliveries, against doing nothing.

## Calling the API

- Base URL `https://api.thepulseapi.com/api/v1`, header `x-api-key: pk_live_...`.
- `POST /decide`, `POST /interventions/audit`, `POST /interventions/decide`,
  `POST /interventions/landed`: stateless, nothing stored, no session needed.
- Full reference: <https://developer.thepulseapi.com/api>. Machine-readable index:
  <https://developer.thepulseapi.com/llms.txt>.
- Copy the request shapes from [`examples/`](examples); they match the API exactly.

## Rules that keep answers honest

1. **Never fill in an attribute PULSE marked unknown.** `cannot_tell` means the listing does not
   say; report that.
2. **Never present a held-back result's scores.** `heldBack: true` means the products came back in
   your order, unranked, on purpose.
3. **Never invent economics.** The Promotion Audit refuses a call without the merchant's own margin
   per kept order; do not supply a made-up one to get past it.
4. **No keys, customer data or personal data in code, tests, examples or commits.** Publishable
   keys are visible by design, but still come from configuration, not source.

## Working in this repository

- `npm install`, then `npm run ci` (build, type-check, syntax-check) before every pull request.
- The SDK ships to every storefront: no new runtime dependencies.
- Contributions are accepted under the [CLA](CLA.md); see [CONTRIBUTING.md](CONTRIBUTING.md).

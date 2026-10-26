// Which of these products fit the shopper's request, which fail, and which can the listing not tell?
//
//   PULSE_API_KEY=pk_live_... node examples/decide.mjs
//
// Node 20+. No dependencies. Calls POST /decide, the call the MCP tool `resolve_products` makes.

const API = process.env.PULSE_API_URL ?? "https://api.thepulseapi.com/api/v1";
const KEY = process.env.PULSE_API_KEY;
if (!KEY) throw new Error("Set PULSE_API_KEY (dashboard: Integration, API keys).");

const res = await fetch(`${API}/decide`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": KEY },
  body: JSON.stringify({
    // The shopper's words. A budget in them becomes a price requirement.
    query: "laptop for my daughter, under $1,500",
    // Requirements an agent states explicitly: op is lte, gte, eq or neq.
    requirements: [{ attribute: "ram", op: "gte", value: 16 }],
    // Up to 50 candidates, with whatever fields and text you hold.
    products: [
      { id: "a", title: "Dell XPS 15 1TB 32GB RAM", price: 1700 },
      { id: "b", title: "Lenovo IdeaPad Slim 5", price: 1100 },
      { id: "c", title: "ASUS Vivobook 14", description: "16GB RAM, 512GB SSD", price: 1200 },
    ],
  }),
});
if (!res.ok) throw new Error(`PULSE answered ${res.status}: ${await res.text()}`);
const r = await res.json();

for (const p of r.products) console.log(p.id, p.verdict, p.missing.length ? `missing: ${p.missing.join(", ")}` : "");
// a fails                  (32GB RAM, but 1,700 is over the 1,500 budget)
// b cannot_tell missing: ram   (the listing never states it: say so, do not guess)
// c fits                   (16GB found in the description, 1,200 within budget)

// /decide is not a shopping endpoint. Anything with options and attributes works: suppliers,
// hotels, plans, vendors, parts. "products" is just the list of candidates.
//
//   PULSE_API_KEY=pk_live_... node examples/decide-any-domain.mjs

const API = process.env.PULSE_API_URL ?? "https://api.thepulseapi.com/api/v1";
const KEY = process.env.PULSE_API_KEY;
if (!KEY) throw new Error("Set PULSE_API_KEY.");

async function decide(body) {
  const res = await fetch(`${API}/decide`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PULSE answered ${res.status}: ${await res.text()}`);
  return (await res.json()).products.map((p) => `${p.id} ${p.verdict}${p.missing.length ? ` (missing ${p.missing.join(", ")})` : ""}`);
}

// Procurement: which suppliers meet the spec?
console.log(
  await decide({
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
);
// [ 'acme fits', 'borealis fails', 'corvid fails (missing ip_rating)' ]

// Travel: which hotels fit, from a request in plain words plus two hard requirements?
console.log(
  await decide({
    query: "hotel near the venue under $180",
    requirements: [
      { attribute: "distance_km", op: "lte", value: 2 },
      { attribute: "breakfast", op: "eq", value: "included" },
    ],
    products: [
      { id: "harbour", price: 165, attributes: { distance_km: 1.2, breakfast: "included" } },
      { id: "summit", price: 210, attributes: { distance_km: 0.5, breakfast: "included" } },
      { id: "lotus", price: 140, attributes: { distance_km: 1.8 } },
    ],
  }),
);
// [ 'harbour fits', 'summit fails', 'lotus cannot_tell (missing breakfast)' ]

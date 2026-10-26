// Which promotions paid for themselves after returns and failed deliveries, against doing nothing?
//
//   PULSE_API_KEY=pk_live_... node examples/promotion-audit.mjs
//
// One row per group of shoppers and offer you ran, including the periods with no offer ("none").
// Rates are counted from your history, never estimated.

const API = process.env.PULSE_API_URL ?? "https://api.thepulseapi.com/api/v1";
const KEY = process.env.PULSE_API_KEY;
if (!KEY) throw new Error("Set PULSE_API_KEY.");

const arm = (kind, visitors, orders, failedDeliveries, size, transit, costPerOrder) => ({
  cohort: "provinces",
  kind,
  visitors,
  orders,
  failedDeliveries,
  costPerOrder,
  // "too small" is a fact the listing could have given; "damaged in transit" is not.
  returns: [
    { reason: "too small", count: size },
    { reason: "damaged in transit", count: transit },
  ],
});

const res = await fetch(`${API}/interventions/audit`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": KEY },
  body: JSON.stringify({
    // Your margin per kept order has no default. Return and failed-delivery costs fall back to
    // defaults when left out, and the response says which values were yours.
    economics: { contribution: 120000 },
    cohortSize: { provinces: 200000 },
    arms: [
      arm("none", 100000, 2000, 200, 30, 20, 0),
      arm("shipping", 100000, 3000, 300, 45, 30, 25228),
      arm("voucher", 100000, 2300, 230, 35, 23, 20000),
    ],
  }),
});
if (!res.ok) throw new Error(`PULSE answered ${res.status}: ${await res.text()}`);
const r = await res.json();

for (const c of r.cohorts) {
  console.log(c.cohort, "->", c.choice, `(${c.reason})`, c.test ? `test: ${c.test}` : "");
  for (const o of c.options) console.log("  ", o.kind.padEnd(9), "gain per shopper:", Math.round(o.miv));
}
console.log("configuration:", r.configuration);
// provinces -> shipping (beats_doing_nothing)
//    shipping  gain per shopper: 231
//    none      gain per shopper: 0
//    voucher   gain per shopper: -164

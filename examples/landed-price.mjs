// What does the shopper actually pay on each marketplace, after vouchers and shipping?
//
//   PULSE_API_KEY=pk_live_... node examples/landed-price.mjs

const API = process.env.PULSE_API_URL ?? "https://api.thepulseapi.com/api/v1";
const KEY = process.env.PULSE_API_KEY;
if (!KEY) throw new Error("Set PULSE_API_KEY.");

const res = await fetch(`${API}/interventions/landed`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-api-key": KEY },
  body: JSON.stringify({
    own: { marketplace: "tiki", price: 2490000, shipping: 45000, voucher: 100000 },
    rivals: [{ marketplace: "shopee", price: 2450000, voucher: 30000 }],
  }),
});
if (!res.ok) throw new Error(`PULSE answered ${res.status}: ${await res.text()}`);
console.log(await res.json());
// { own: 2435000, cheapest: { marketplace: 'shopee', landed: 2420000 }, gap: 15000, stickerGap: 40000, ... }
// A 40,000 sticker gap is a 15,000 gap at the till.

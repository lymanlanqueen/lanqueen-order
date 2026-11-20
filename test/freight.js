"use strict";
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Math, Number, Object, Array, Set, JSON, String, Intl };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/lq.js"), "utf8") + "\nthis.LQ = LQ;", ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/sheet.js"), "utf8"), ctx);
const LQ = ctx.LQ;
const LQSheet = ctx.LQSheet;
const freight = JSON.parse(fs.readFileSync(path.join(root, "data/freight.json"), "utf8"));
const rates = JSON.parse(fs.readFileSync(path.join(root, "data/rates.json"), "utf8"));
const usd = rates.rates.find((rate) => rate.currency === "USD");
let failed = 0;
function check(name, ok) {
  if (!ok) { failed += 1; console.error("FAIL", name); }
  else console.log("ok", name);
}
const au = LQ.quoteFreight("Australia", 2, "CNY", null, freight);
check("Australia 2 kg is 100 CNY and not in the total", au.status === "reference" && au.cny === 100 && au.inOrderTotal === false && au.cnyPerKg === 50);
const usa = LQ.quoteFreight("USA", 1, "USD", usd, freight);
check("USA converts at the reference rate", usa.cny === 60 && Math.abs(usa.foreign - Math.round((60 / usd.rateCny) * 100) / 100) < 0.001);
const canada = LQ.quoteFreight("Canada", null, "CNY", null, freight);
check("Canada without weight shows the per-kg rate", canada.status === "rate" && canada.cnyPerKg === 60 && canada.cny == null);
const other = LQ.quoteFreight("France", 3, "CNY", null, freight);
check("other countries are to be quoted", other.status === "quote" && other.cny == null);
check("freight notes are present", au.notes.some((note) => /remote/i.test(note)) && au.notes.some((note) => /volumetric/i.test(note)) && au.label === LQ.FREIGHT_NOTE);
const grommet = LQ.computeWindow({
  name: "W", heading: "grommet", orientation: "fixed-height", lining: "none", topFinish: "none",
  width: 2, height: 2.6, unit: "m", fabricPerPleat: 22, draw: "single-left", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
}, null, LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
check("grommet film stays 30", grommet.fabricPerPleat === 30 && grommet.totalRings === grommet.totalCount * 2);
const html = LQSheet.sheetsHtml({
  number: "LQ-F", currency: "CNY", cnyTotal: 10, freightNote: LQ.FREIGHT_NOTE, freight: au,
  customer: { name: "Dealer", country: "Australia", city: "City", address: "1 St", tradeTerm: "FOB", shippingMethod: "fedex", deliveryDate: "2026-12-01" },
  windows: [{ input: { name: "W", heading: "grommet", draw: "single-left", hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, width: 2, height: 2.6, unit: "m" }, result: grommet, fabric: { model: "Diva", version: "B01", widthCm: 280, priceCnyPerM: 1, fabricPriceCnyPerM: 1 } }]
});
const customer = html.split("<article")[1] || "";
check("grommet sheet says film 30 cm fixed", customer.includes("30 cm (fixed)"));
check("reference freight is outside the goods total", customer.includes(LQ.FREIGHT_NOTE) && customer.includes("Not included in the order total") && customer.includes("¥100.00") && customer.indexOf("Total CNY") < customer.indexOf("Not included in the order total"));
if (failed) { console.error(failed + " freight checks failed"); process.exit(1); }
console.log("freight checks passed");

"use strict";
// Anonymised checks. Dimensions only — no customer names, addresses, POs or prices.
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
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const rules = Object.assign({}, LQ.DEFAULT_RULES, { catalog });
const prices = LQ.DEFAULT_HARDWARE_PRICES;
const face = LQ.findFabric(catalog, "Diva", null);
let failed = 0;
function check(name, ok) {
  if (!ok) { failed += 1; console.error("FAIL", name); }
  else console.log("ok", name);
}
check("mm and cm", LQ.toCm(2850, "mm") === 285 && LQ.toCm(30, "cm") === 30 && LQ.toCm(2.8, "m") === 280);
check("draw aliases", LQ.normaliseDraw("one way right") === "single-right" && LQ.normaliseDraw("Centre Opening") === "double" && LQ.normaliseDraw("ONE WAY LEFT") === "single-left");
const base = {
  name: "W", headingFamily: "ripple", rippleTape: "rivet", orientation: "fixed-height", lining: "none",
  topFinish: "none", unit: "mm", fabricPerPleat: 24, gliderPitch: 5.4, draw: "double", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
};
// Published unequal centre-open shape: 2850 + 2245 mm at 54 mm pitch, one-way each side.
const split = LQ.computeWindow(Object.assign({}, base, { width: 5095, leftWidth: 2850, rightWidth: 2245, height: 2400 }), face, rules, prices);
check("unequal runners", split.unequal === true && split.runnersPerPanel[0] === 56 && split.runnersPerPanel[1] === 44 && split.totalGliders === 100);
check("runners are 2:1 on S-Wave", split.runnersPerPanel[0] === split.panels[0].count * 2);
const equal = LQ.computeWindow(Object.assign({}, base, { width: 3000, height: 2400, unit: "mm", draw: "Centre open" }), face, rules, prices);
check("equal centre open keeps the double formula", equal.totalGliders % 4 === 0 && equal.runnersPerPanel[0] === equal.totalGliders / 2);
const pinch = LQ.computeWindow({
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
}, face, rules, prices);
check("non-S-Wave runners are 1:1 with folds", pinch.runnersPerPanel.every((count, index) => count === pinch.panels[index].count));
check("making hooks stay folds+2 and do not change the price", pinch.makingHooksPerPanel[0] === pinch.panels[0].count + 2 && pinch.pricing.curtainCny === Math.round(pinch.usageMetersPriced * face.priceCnyPerM * 100) / 100);
const pricedBefore = pinch.pricing.curtainCny;
const overridden = LQ.computeWindow(Object.assign({}, {
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 10, overlapCm: 8, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "finished", runnerCount: 10
}), face, rules, prices);
check("finished width does not add return again", overridden.excessCm === 0);
check("runner mismatch warns and does not reprice", overridden.runnerOverride === true && overridden.warnings.some((warning) => warning.code === "runner-diff") && !overridden.errors.some((error) => error.code === "runner-diff") && overridden.pricing.curtainCny === pricedBefore);
const trackExcess = LQ.computeWindow(Object.assign({}, {
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 10, overlapCm: 8, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
}), face, rules, prices);
check("track width still adds excess", trackExcess.excessCm === 16 && trackExcess.pricing.curtainCny > pricedBefore);
const stated = LQ.computeWindow(Object.assign({}, {
  name: "W", headingFamily: "ripple", rippleTape: "rivet", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 550, height: 258, unit: "cm", fabricPerPleat: 24, gliderPitch: 6, draw: "double",
  hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, orderedFullness: 1.8
}), face, rules, prices);
check("fullness is 1 decimal", Math.abs(stated.fullnessDisplay * 10 - Math.round(stated.fullnessDisplay * 10)) < 1e-9);
check("fullness tolerance warns", stated.orderedFullness === 1.8 && stated.warnings.some((warning) => warning.code === "fullness-tol"));
check("only finish height is used", stated.heightCm === 258 && LQ.computeWindow(Object.assign({}, {
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, openHeight: 9, hookHeight: 9
}), face, rules, prices).heightCm === 260);
const com = LQ.computeWindow({
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  fabricSource: "com", comModel: "COM cloth", comWidthCm: 280, topFinish: "none", width: 3, height: 2.6, unit: "m",
  fabricPerPleat: 24, draw: "double", hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1
}, null, rules, prices);
check("COM is quoted not priced", com.warnings.some((warning) => warning.code === "com-quote") && com.pricing.curtainCny === 0 && com.pricing.priceQuoted === false);
const rates = JSON.parse(fs.readFileSync(path.join(root, "data/rates.json"), "utf8"));
check("CAD is a dated Bank of China rate", rates.rates.some((rate) => rate.currency === "CAD" && rate.placeholder === false && rate.basis === "中行折算价" && rate.rateCny === 4.6671));
check("courier default list", LQ.DEFAULT_RULES.shippingMethods[0].id === "fedex" && LQ.DEFAULT_RULES.shippingMethods.some((method) => method.id === "sea"));
const order = {
  number: "LQ-TEST", createdAt: "2026-11-20", currency: "CAD", freightCny: 0, freightNote: LQ.FREIGHT_NOTE,
  presentation: { englishOnly: true, hideLogo: true },
  customer: { name: "Dealer", country: "CA", city: "City", address: "1 St", email: "a@example.com", po: "PO-1", endClient: "Site", tradeTerm: "FOB", shippingMethod: "fedex", deliveryDate: "2026-12-01", freightCny: 0 },
  settlement: LQ.settle(split.pricing.lineCny, "CAD", rates.rates.find((rate) => rate.currency === "CAD"), null),
  cnyTotal: split.pricing.lineCny,
  windows: [{ input: Object.assign({}, base, { location: "Room 1", colourName: "Cloud", supplier: "House", fabricId: "diva", width: 5095, leftWidth: 2850, rightWidth: 2245, height: 2400 }), result: split, fabric: face }]
};
const html = LQSheet.sheetsHtml(order);
const text = LQSheet.orderToText(order);
check("white label customer copy", html.includes("Order confirmation") && html.includes("Room 1") && html.includes("Cloud") && html.includes(LQ.FREIGHT_NOTE) && html.includes("PO-1"));
check("email carries the new fields", text.includes("PO-1") && text.includes("Room 1") && text.includes(LQ.FREIGHT_NOTE) && text.includes(LQ.ESTIMATE_MARK));
const customerArticle = html.split("<article")[1] || "";
const factoryArticle = html.split("<article")[2] || "";
check("english customer sheet hides the logo", !customerArticle.includes("LAN QUEEN") && factoryArticle.includes("LAN QUEEN"));
const customerOnly = customerArticle;
const factoryOnly = factoryArticle;
check("factory sheet has no selling prices", !factoryOnly.includes(LQ.CUT_FABRIC_LABEL) && !/¥|CNY [0-9]/.test(factoryOnly) && factoryOnly.includes("cm") && factoryOnly.includes("Cut width"));
check("customer sheet keeps cut price and separate lines", customerOnly.includes(LQ.CUT_FABRIC_LABEL) && customerOnly.includes("Curtain making") && customerOnly.includes("Track / hardware") && customerOnly.includes(LQ.DEFAULTS_NOTE));
const missingBasis = LQ.computeWindow(Object.assign({}, base, { widthBasis: "", width: 2000, height: 2400 }), face, rules, prices);
check("width basis is required", missingBasis.errors.some((error) => error.code === "width-basis") && missingBasis.excessCm === 0);
const comSheet = LQSheet.sheetsHtml({ number: "LQ-COM", currency: "CNY", cnyTotal: 0, freightNote: LQ.FREIGHT_NOTE, customer: order.customer, windows: [{ input: Object.assign({}, base, { fabricSource: "com", location: "Room 9" }), result: Object.assign({}, split, { pricing: Object.assign({}, split.pricing, { priceQuoted: false, curtainCny: 0 }) }), fabric: { model: "COM cloth", version: "COM", widthCm: 280, source: "com", fabricPriceCnyPerM: null, priceCnyPerM: null } }] });
check("COM shipping note", comSheet.includes(LQ.COM_NOTE));
if (failed) { console.error(failed + " step3 checks failed"); process.exit(1); }
console.log("step3 checks passed");

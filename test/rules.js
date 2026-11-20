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
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const { buildCatalog } = require("../tools/build_catalog.js");
const built = buildCatalog(fs.readFileSync(path.join(root, "tools/pricelist_full.txt"), "utf8"));
let failed = 0;
function check(name, ok) {
  if (!ok) { failed += 1; console.error("FAIL", name); }
  else console.log("ok", name);
}
const by = (category) => catalog.filter((row) => row.category === category);
const versions = (category) => [...new Set(by(category).map((row) => row.version))];
check("catalog regenerated", JSON.stringify(built) === JSON.stringify(catalog));
check("fabric count", by("fabric").length === 54);
check("blackout count", by("blackout").length === 6);
check("sheer count", by("sheer").length === 117);
check("F01-F45", LQ.CATALOG_PLAN.categories.fabric.versions.every((code) => versions("fabric").includes(code)));
check("B01-B05", ["B01", "B02", "B03", "B04", "B05"].every((code) => versions("blackout").includes(code)));
check("sheer versions in the sheet", ["S01", "S12", "S15", "S17"].every((code) => versions("sheer").includes(code)) && !versions("sheer").includes("S13") && !versions("sheer").includes("S14"));
const masal = catalog.find((row) => row.model === "Masal");
check("Masal", masal.version === "F01" && masal.widthM === 2.8 && masal.finishedPriceCnyPerM === 102 && masal.fabricPriceCnyPerM === 68);
const alda = catalog.find((row) => row.model === "Alda");
const alda4 = LQ.resolveFabric(alda, 4);
const alda6 = LQ.resolveFabric(alda, "6");
const alda7 = LQ.resolveFabric(alda, 7);
check("Alda tiers", alda4.priceCnyPerM === 97 && alda4.fabricPriceCnyPerM === 64.8 && alda6.priceCnyPerM === 101 && alda6.fabricPriceCnyPerM === 69 && alda7.unresolved === true);
const diva = catalog.find((row) => row.id === "diva");
const endura = catalog.find((row) => row.id === "endura");
check("Diva", diva.version === "B01" && diva.widthM === 2.9 && diva.finishedPriceCnyPerM === 104.5 && diva.fabricPriceCnyPerM === 73);
check("Endura", endura.version === "B01" && endura.widthM === 2.8 && endura.finishedPriceCnyPerM === 82.5 && endura.fabricPriceCnyPerM === 52);
check("HB inherits F15", catalog.find((row) => row.model === "HB").version === "F15");
const rules = Object.assign({}, LQ.DEFAULT_RULES, { catalog });
const prices = LQ.DEFAULT_HARDWARE_PRICES;
const ripple = {
  name: "T", headingFamily: "ripple", rippleTape: "rivet", orientation: "fixed-height", lining: "endura-white",
  topFinish: "none", width: 2, height: 2.6, unit: "m", fabricPerPleat: 24, gliderPitch: 6, draw: "single-left",
  hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
};
const face = LQ.resolveFabric(diva, null);
const lined = LQ.computeWindow(ripple, face, rules, prices);
check("lining 4.47 x 82.5", lined.usageMetersPerPiece === 4.47 && lined.lining.usageMeters === 4.47 && lined.lining.rate === 82.5 && lined.pricing.liningCny === 368.78);
check("lining in the line total", lined.pricing.lineCny === Math.round((lined.pricing.curtainCny + 368.78) * 100) / 100);
check("cut price stays out of the curtain", lined.pricing.curtainCny === Math.round(4.47 * 104.5 * 100) / 100 && lined.pricing.cutFabricCnyPerM === 73);
check("rate comes from catalog", lined.lining.cloth.fromCatalog === true);
const tweaked = catalog.map((row) => row.id === "endura" ? Object.assign({}, row, { finishedPriceCnyPerM: 100, priceCnyPerM: 100 }) : row);
const tweakedRules = Object.assign({}, LQ.DEFAULT_RULES, { catalog: tweaked });
const tweakedResult = LQ.computeWindow(ripple, face, tweakedRules, prices);
check("catalog Endura price drives the fee", tweakedResult.lining.rate === 100 && tweakedResult.pricing.liningCny === 447);
const noneBasis = Object.assign({}, LQ.DEFAULT_RULES, { catalog, liningPricing: Object.assign({}, LQ.LINING_PRICING, { priceBasis: "none" }) });
const unpriced = LQ.computeWindow(ripple, face, noneBasis, prices);
check("basis none adds no fee", unpriced.lining.priced === false && unpriced.pricing.liningCny === 0 && unpriced.pricing.lineCny === unpriced.pricing.curtainCny);
const cutBasis = Object.assign({}, LQ.DEFAULT_RULES, { catalog, liningPricing: Object.assign({}, LQ.LINING_PRICING, { priceBasis: "cut" }) });
check("basis cut", LQ.computeWindow(ripple, face, cutBasis, prices).pricing.liningCny === Math.round(4.47 * 52 * 100) / 100);
const factorBasis = Object.assign({}, LQ.DEFAULT_RULES, { catalog, liningPricing: Object.assign({}, LQ.LINING_PRICING, { usageMode: "factor", usageFactor: 0.5 }) });
const halved = LQ.computeWindow(ripple, face, factorBasis, prices);
check("usage factor", halved.lining.usageMeters === 2.235 && halved.pricing.liningCny === Math.round(2.235 * 82.5 * 100) / 100);
check("no lining", LQ.computeWindow(Object.assign({}, ripple, { lining: "none" }), face, rules, prices).pricing.liningCny === 0);
const beige = LQ.computeWindow(Object.assign({}, ripple, { lining: "endura-beige", quantity: 2 }), face, rules, prices);
check("qty multiplies lining", beige.lining.usageMetersPriced === 8.94 && beige.pricing.liningCny === Math.round(8.94 * 82.5 * 100) / 100);
const pinch = Object.assign({}, ripple, { headingFamily: "pinch", pinchStyle: "double-pinch", lining: "none", width: 2, draw: "single-left" });
const at10 = LQ.computeWindow(Object.assign({}, pinch, { hookSpacingCm: 10 }), face, rules, prices);
const at12 = LQ.computeWindow(Object.assign({}, pinch, { hookSpacingCm: 12 }), face, rules, prices);
check("hook spacing locked", at10.totalCount === at12.totalCount && at10.usageMetersPerPiece === at12.usageMetersPerPiece && at10.hookSpacingCm === 10);
const fullnessRow = LQ.computeWindow(Object.assign({}, pinch, { draw: "double", width: 3 }), face, rules, prices);
check("actual fullness excludes side hems", fullnessRow.fullnessDisplay === Math.round(((fullnessRow.cutWidthCm - fullnessRow.allowanceCm) / fullnessRow.widthCm) * 10) / 10 && fullnessRow.usageMetersPerPiece * 100 > fullnessRow.cutWidthCm - fullnessRow.allowanceCm);
const wide = LQ.computeWindow(Object.assign({}, pinch, { draw: "double", width: 3, height: 2.8, hem: "8+8" }), LQ.resolveFabric(endura, null), rules, prices);
const block = wide.errors.find((error) => error.code === "fixed-height");
check("width check blocks", !!block && !wide.warnings.some((warning) => warning.code === "fixed-height") && /fixed-width/.test(block.en) && /定宽/.test(block.zh));
check("width range", LQ.computeWindow(Object.assign({}, pinch, { width: 0.2 }), face, rules, prices).errors.some((error) => error.code === "width-range"));
check("width 0.3 passes", !LQ.computeWindow(Object.assign({}, pinch, { width: 0.3 }), face, rules, prices).errors.some((error) => error.field === "width"));
check("width 13 blocks", LQ.computeWindow(Object.assign({}, pinch, { width: 13 }), face, rules, prices).errors.some((error) => error.code === "width-range"));
check("inch too small", LQ.computeWindow(Object.assign({}, pinch, { width: 10, unit: "in" }), face, rules, prices).errors.some((error) => error.code === "width-range" && /in/.test(error.en)));
check("12 inches passes", !LQ.computeWindow(Object.assign({}, pinch, { width: 12, height: 96, unit: "in" }), face, rules, prices).errors.some((error) => error.code === "width-range" || error.code === "height-range"));
check("return 31", LQ.computeWindow(Object.assign({}, pinch, { returnCm: 31 }), face, rules, prices).errors.some((error) => error.code === "return"));
check("overlap 31 double", LQ.computeWindow(Object.assign({}, pinch, { draw: "double", width: 3, overlapCm: 31 }), face, rules, prices).errors.some((error) => error.code === "overlap"));
check("qty 100", LQ.computeWindow(Object.assign({}, pinch, { quantity: 100 }), face, rules, prices).errors.some((error) => error.code === "qty"));
check("limits live in one object", LQ.INPUT_LIMITS.widthM.max === 12 && LQ.INPUT_LIMITS.heightM.max === 6 && LQ.DEFAULT_RULES.inputLimits === LQ.INPUT_LIMITS);
const grommet = Object.assign({}, ripple, { headingFamily: "grommet", lining: "none", fabricPerPleat: 22, width: 1.9, draw: "single-left" });
const g1 = LQ.computeWindow(grommet, LQ.resolveFabric(endura, null), rules, prices);
check("grommet folds are half the rings", g1.totalRings === 20 && g1.totalCount === 10 && g1.pureFabricCm === 300 && g1.cutWidthCm === 315);
const sheer = LQ.resolveFabric(catalog.find((row) => row.id === "ls243-58cloud"), null);
const within = LQ.computeWindow(Object.assign({}, grommet, { width: 7.9, height: 3 }), sheer, rules, prices);
const over = LQ.computeWindow(Object.assign({}, grommet, { width: 11, height: 3 }), sheer, rules, prices);
check("30cm limit uses folds", !within.warnings.some((warning) => warning.code === "machine") && over.warnings.some((warning) => warning.code === "machine") && over.totalCount === 55);
const single = LQ.computeWindow(Object.assign({}, pinch, { returnCm: 5 }), face, rules, prices);
const doubled = LQ.computeWindow(Object.assign({}, pinch, { draw: "double", width: 3, returnCm: 5, overlapCm: 5 }), face, rules, prices);
check("allowance 15 per panel", single.cutWidthCm - single.pureFabricCm === 15 && doubled.cutWidthCm - doubled.pureFabricCm === 30);
const order = {
  number: "LQ-TEST", createdAt: "2026-11-20T00:00:00.000Z", currency: "USD",
  customer: { name: "A", country: "AU", city: "Melbourne", address: "1 St", email: "a@example.com", tradeTerm: "FOB", shippingMethod: "sea", deliveryDate: "2026-12-01" },
  windows: [{ input: Object.assign({}, ripple, { fabricId: "diva" }), result: lined, fabric: face }]
};
order.cnyTotal = lined.pricing.lineCny;
order.settlement = LQ.settle(order.cnyTotal, "USD", { currency: "USD", rateCny: 6.766, rateDate: "2026-06-01", source: "Bank of China" }, null);
const html = LQSheet.sheetsHtml(order);
const text = LQSheet.orderToText(order);
check("sheets show cut price and lining", html.includes(LQ.CUT_FABRIC_LABEL) && html.includes("73") && html.includes("368.78") && html.includes("里布用料") && html.includes(LQ.ESTIMATE_MARK));
check("email shows the same", text.includes(LQ.CUT_FABRIC_LABEL) && text.includes("368.78") && text.includes(LQ.ESTIMATE_MARK) && text.includes(LQ.NOT_A_QUOTE.en));
check("pending lining label is gone", !html.includes("里布价格待确认") && !text.includes("里布价格待确认") && !fs.readFileSync(path.join(root, "js/lq.js"), "utf8").includes("里布价格待确认"));
const tampered = JSON.parse(JSON.stringify(order));
tampered.windows[0].result.pricing.curtainCny = 1;
tampered.windows[0].result.pricing.lineCny = 1;
tampered.cnyTotal = 1;
const checked = LQ.recomputeOrder(tampered, catalog, { rates: [{ currency: "USD", rateCny: 6.766, rateDate: "2026-06-01", source: "Bank of China" }] });
check("print recompute", checked.diffs.some((diff) => diff.field === "curtainCny") && checked.order.windows[0].result.pricing.curtainCny === lined.pricing.curtainCny && checked.order.windows[0].result.pricing.liningCny === 368.78);
const warned = LQSheet.sheetsHtml(checked.order);
check("mismatch is visible", warned.includes("do not match the pasted JSON") && warned.includes(String(lined.pricing.curtainCny)));
check("hook field removed", !fs.readFileSync(path.join(root, "js/order.js"), "utf8").includes("data-w='hookSpacingCm'"));
check("lining choices", LQ.LINING_LABEL["endura-white"].en.includes("White") && LQ.LINING_LABEL["endura-beige"].zh.includes("米"));
if (failed) { console.error(failed + " rule checks failed"); process.exit(1); }
console.log("rule checks passed");

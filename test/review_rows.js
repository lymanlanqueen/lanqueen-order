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
const endura = LQ.resolveFabric(catalog.find((row) => row.id === "endura"), null);
const rules = Object.assign({}, LQ.DEFAULT_RULES, { catalog });
const prices = LQ.DEFAULT_HARDWARE_PRICES;
let failed = 0;
function check(name, ok) {
  if (!ok) { failed += 1; console.error("FAIL", name); }
  else console.log("ok", name);
}
function row(over) {
  return Object.assign({
    name: "W", heading: "double_pinch", orientation: "fixed-height", lining: "none", topFinish: "none",
    width: 2, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "single-left", hem: "8+2",
    returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "finished"
  }, over);
}
function run(over, fabric) {
  const input = row(over);
  return { input, result: LQ.computeWindow(input, fabric === undefined ? endura : fabric, rules, prices) };
}
const version = LQ.matchModel(catalog, "F01");
const bad = run({ fabricId: "F01" }, null);
const badLine = { fabric: null, input: bad.input, result: bad.result };
const shownFabric = badLine.fabric || { model: badLine.input.fabricId || "—", version: "" };
const badIssues = LQ.reviewIssues(bad.input, bad.result, null, "", catalog);
check("review of a version code does not throw", shownFabric.model === "F01" && Array.isArray(badIssues));
check("version code is called out in English and Chinese", version.status === "version" && badIssues.some((issue) => issue.en === "use the fabric model name, e.g. Masal" && issue.zh === "请填写面料型号，例如 Masal"));
const missing = run({ fabricPerPleat: NaN });
const missingIssues = LQ.reviewIssues(missing.input, missing.result, endura, "", catalog);
const good = run({});
const total = [missing.result, good.result].reduce((sum, result) => {
  const money = Number.isFinite(result.pricing.lineCny) && !result.errors.some((error) => error.code === "fpp") ? result.pricing.lineCny : 0;
  return sum + money;
}, 0);
check("missing film is named and kept out of the total", missingIssues.some((issue) => issue.en === "Please select film" && issue.zh === "请选纸膜") && !Number.isFinite(missing.result.pricing.lineCny) && total === good.result.pricing.lineCny);
check("missing film blocks submit", missing.result.errors.some((error) => error.code === "fpp"));
const one = run({ orientation: "fixed-width", width: 0.8, height: 2.6, unit: "m", draw: "single-left" });
const dropsOne = one.result.panels.reduce((sum, panel) => sum + panel.drops, 0);
check("one fixed-width is height plus 30 cm", dropsOne === 1 && one.result.usageMetersPerPiece === 2.9);
const metres = run({ orientation: "fixed-width", width: 2, height: 2.6, unit: "m", draw: "single-left" });
const many = run({ orientation: "fixed-width", width: 6, height: 2.5, unit: "m", draw: "single-left" });
const dropsMany = many.result.panels.reduce((sum, panel) => sum + panel.drops, 0);
check("several fixed-widths multiply height plus 30 cm", dropsMany > 1 && Math.abs(many.result.usageMetersPerPiece - dropsMany * 2.8) < 0.001);
const mm = run({ orientation: "fixed-width", width: 2000, height: 2600, unit: "mm", draw: "single-left" });
const cm = run({ orientation: "fixed-width", width: 200, height: 260, unit: "cm", draw: "single-left" });
check("fixed-width mm and cm match", mm.result.usageMetersPerPiece === cm.result.usageMetersPerPiece && mm.result.usageMetersPerPiece === metres.result.usageMetersPerPiece);
const priced = run({ orientation: "fixed-width", width: 2, height: 2.6, unit: "m", draw: "single-left", quantity: 2 });
check("fixed-width price is usage times unit price times quantity", priced.result.pricing.curtainCny === Math.round(priced.result.usageMetersPerPiece * endura.priceCnyPerM * 2 * 100) / 100);
check("fullness excludes side hems and usage still includes them", one.result.fullnessDisplay === Math.round(((one.result.cutWidthCm - one.result.allowanceCm) / one.result.widthCm) * 10) / 10 && one.result.usageMetersPerPiece > (one.result.cutWidthCm - one.result.allowanceCm) / 100);
const knife = run({ heading: "knife", fabricPerPleat: 22 });
const evo = run({ heading: "evo" });
const inverted = run({ heading: "inverted" });
const plain = run({ heading: "double_pinch" });
check("knife and EVO stay confirmed", !knife.result.warnings.some((warning) => /pending/i.test(warning.code + warning.en)) && !evo.result.warnings.some((warning) => /pending/i.test(warning.code + warning.en)) && knife.result.usageMetersPerPiece === 4.55 && evo.result.totalCount === inverted.result.totalCount && inverted.result.totalCount === plain.result.totalCount + 1);
function sheet(item) {
  return LQSheet.sheetsHtml({
    number: "LQ-T", currency: "CNY", cnyTotal: item.result.pricing.lineCny, freightNote: LQ.FREIGHT_NOTE,
    customer: { name: "Dealer", country: "Australia", city: "City", address: "1 St", tradeTerm: "FOB", shippingMethod: "fedex", deliveryDate: "2026-12-01" },
    windows: [{ input: item.input, result: item.result, fabric: endura }]
  });
}
const fixedSheet = sheet(one);
const knifeSheet = sheet(knife);
const evoSheet = sheet(evo);
check("fixed-width sheets hide fullness", !/Fullness \(actual\)/.test(fixedSheet) && /Fullness \(actual\)/.test(sheet(good)));
const knifeText = (knifeSheet + evoSheet + LQSheet.orderToText({
  number: "LQ-T", currency: "CNY", cnyTotal: knife.result.pricing.lineCny, freightNote: LQ.FREIGHT_NOTE,
  customer: { name: "Dealer", country: "Australia", city: "City", address: "1 St", tradeTerm: "FOB", shippingMethod: "fedex", deliveryDate: "2026-12-01" },
  windows: [{ input: knife.input, result: knife.result, fabric: endura }, { input: evo.input, result: evo.result, fabric: endura }]
})).split(LQ.ESTIMATE_MARK).join("");
check("knife and EVO sheets are not marked pending", !/Pending confirmation|待确认/.test(knifeText));
check("reference price wording", LQ.NOT_A_QUOTE.en + " / " + LQ.NOT_A_QUOTE.zh === "Reference price (BOC conversion rate) / 参考价（中行折算价）");
if (failed) { console.error(failed + " review-row checks failed"); process.exit(1); }
console.log("review-row checks passed");

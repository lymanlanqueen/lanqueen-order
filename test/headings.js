"use strict";
// Official heading names and aliases. No customer names, addresses, POs or prices.
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
const official = [
  ["x_pleat", "X-Pleat", "交叉褶（十字褶）"],
  ["double_pinch", "Double Pinch Pleat", "双褶"],
  ["triple_pinch", "Triple Pinch Pleat", "三褶"],
  ["euro_double", "Euro Double Pleat", "欧式双褶"],
  ["euro_triple", "Euro Triple Pleat", "欧式三褶"],
  ["inverted", "Inverted Pleat", "工字褶"],
  ["goblet", "Goblet Pleat", "酒杯褶"],
  ["ripple_fold", "Ripple Fold", "蛇形"],
  ["grommet", "Grommet / Eyelet", "打孔"]
];
check("eight pleats plus grommet", LQ.HEADING_ORDER.join(",") === official.map((row) => row[0]).join(","));
official.forEach((row) => {
  const label = LQ.HEADING_LABEL[row[0]];
  check("label " + row[0], label && label.en === row[1] && label.zh === row[2]);
});
function keyOf(value) {
  return LQ.normaliseHeading({ heading: value }).key;
}
check("韩褶 is X-Pleat", keyOf("韩褶") === "x_pleat" && keyOf("交叉褶") === "x_pleat" && keyOf("十字褶") === "x_pleat" && keyOf("X-Pleat") === "x_pleat");
check("S-Wave and S-Fold are Ripple Fold", keyOf("S-Wave") === "ripple_fold" && keyOf("S-Fold") === "ripple_fold" && keyOf("蛇形") === "ripple_fold");
check("legacy pinch styles", keyOf("double-pinch") === "double_pinch" && keyOf("triple-pinch") === "triple_pinch" && keyOf("euro-double") === "euro_double" && keyOf("euro-triple") === "euro_triple" && keyOf("x-pleat") === "x_pleat" && keyOf("goblet") === "goblet");
check("EVO keeps the inverted rule", LQ.normaliseHeading({ pinchStyle: "evo" }).key === "inverted" && LQ.normaliseHeading({ pinchStyle: "evo" }).extraPleat === true);
check("eyelet is grommet", keyOf("eyelet") === "grommet" && LQ.normaliseHeading({ headingFamily: "grommet" }).key === "grommet");
const bare = LQ.normaliseHeading({ headingFamily: "pinch" });
check("bare pinch is not double pinch", bare.key === null && bare.pending === "bare-pinch");
const page = {
  name: "W", orientation: "fixed-height", lining: "none", topFinish: "none", width: 2, height: 2.6, unit: "m",
  fabricPerPleat: 24, draw: "single-left", hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer",
  quantity: 1, widthBasis: "track", gliderPitch: 6, rippleTape: "rivet"
};
function run(extra) {
  return LQ.computeWindow(Object.assign({}, page, extra), face, rules, prices);
}
const shared = run({ heading: "double_pinch" });
["x_pleat", "triple_pinch", "euro_double", "euro_triple", "goblet"].forEach((key) => {
  const result = run({ heading: key });
  check(key + " uses the shared pleat rule", result.calcRule === "pleat-shared" && result.totalCount === shared.totalCount && result.pureFabricCm === shared.pureFabricCm && result.fabricPerPleat === 24 && result.runnersPerPanel[0] === result.panels[0].count);
});
const inverted = run({ heading: "inverted" });
check("inverted keeps the existing plus-one pleat", inverted.calcRule === "pleat-plus-1" && inverted.totalCount === shared.totalCount + 1 && inverted.runnersPerPanel[0] === inverted.panels[0].count);
const evo = run({ headingFamily: "pinch", pinchStyle: "evo" });
check("EVO count matches inverted", evo.totalCount === inverted.totalCount && evo.heading.key === "inverted");
const ripple = run({ heading: "ripple_fold" });
check("ripple stays 2:1", ripple.calcRule === "ripple-2to1" && ripple.runnersPerPanel[0] === ripple.panels[0].count * 2);
const grommet = run({ heading: "grommet", fabricPerPleat: 22 });
check("grommet rule unchanged", grommet.calcRule === "grommet" && grommet.fabricPerPleat === 30 && grommet.totalRings === grommet.totalCount * 2);
const bareResult = run({ headingFamily: "pinch" });
check("bare pinch is flagged", bareResult.heading.key === null && bareResult.errors.some((error) => error.code === "pinch"));
const knife = run({ headingFamily: "knife" });
check("knife is pending and not renamed", knife.heading.key === null && knife.heading.pending === "knife" && knife.warnings.some((warning) => warning.code === "heading-pending") && knife.totalCount === shared.totalCount && knife.calcRule === "knife-same-count-as-double-pinch");
const summary = LQ.headingSummary({ heading: "x_pleat" });
check("summary uses the chart", summary.en === "X-Pleat" && summary.zh === "交叉褶（十字褶）");
const rippleName = LQ.headingSummary({ heading: "ripple_fold", rippleTape: "rivet" });
check("ripple summary", rippleName.en === "Ripple Fold · Rivet tape" && rippleName.zh === "蛇形 · 铆钉带");
const order = {
  number: "LQ-HEAD", createdAt: "2026-11-20", currency: "CNY", freightCny: 0, freightNote: LQ.FREIGHT_NOTE,
  customer: { name: "Dealer", country: "AU", city: "City", address: "1 St", email: "a@example.com", tradeTerm: "FOB", shippingMethod: "fedex", deliveryDate: "2026-12-01" },
  cnyTotal: shared.pricing.lineCny,
  windows: [{ input: Object.assign({}, page, { heading: "euro_double", name: "Room" }), result: run({ heading: "euro_double" }), fabric: face }]
};
const html = LQSheet.sheetsHtml(order);
const text = LQSheet.orderToText(order);
check("sheets and email show the official name and key", html.includes("Euro Double Pleat") && html.includes("欧式双褶") && html.includes("euro_double") && text.includes("Heading: Euro Double Pleat / 欧式双褶  key: euro_double"));
if (failed) { console.error(failed + " heading checks failed"); process.exit(1); }
console.log("heading checks passed");

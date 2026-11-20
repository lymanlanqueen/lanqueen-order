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
  ["evo", "EVO Pleat", "EVO褶 (Inverted Pleat variant)"],
  ["knife", "Knife Pleat", "刀型褶"],
  ["grommet", "Grommet / Eyelet", "打孔"]
];
check("eight pleats plus EVO, Knife and grommet", LQ.HEADING_ORDER.join(",") === official.map((row) => row[0]).join(","));
official.forEach((row) => {
  const label = LQ.HEADING_LABEL[row[0]];
  check("label " + row[0], label && label.en === row[1] && label.zh === row[2]);
});
function keyOf(value) {
  return LQ.normaliseHeading({ heading: value }).key;
}
check("韩褶 is X-Pleat", keyOf("韩褶") === "x_pleat" && keyOf("交叉褶") === "x_pleat" && keyOf("十字褶") === "x_pleat" && keyOf("X-Pleat") === "x_pleat");
check("工字褶 is Inverted Pleat", keyOf("工字褶") === "inverted" && keyOf("Inverted Pleat") === "inverted");
["S-Wave", "S Wave", "S WAVE", "SWave", "S-Fold", "S Fold"].forEach((alias) => {
  check(alias + " is Ripple Fold", keyOf(alias) === "ripple_fold" && LQ.normaliseHeading({ heading: alias }).pending == null);
});
const sky = LQ.normaliseHeading({ heading: "天 际 帘" });
check("天际帘 is Ripple Fold", sky.key === "ripple_fold" && sky.pending == null);
check("鸡目环 is grommet", keyOf("鸡目环") === "grommet" && keyOf("鸡 目 环") === "grommet");
check("knife aliases", keyOf("刀型褶") === "knife" && keyOf("刀褶") === "knife" && keyOf("Knife pleat") === "knife");
check("legacy pinch styles", keyOf("double-pinch") === "double_pinch" && keyOf("triple-pinch") === "triple_pinch" && keyOf("euro-double") === "euro_double" && keyOf("euro-triple") === "euro_triple" && keyOf("x-pleat") === "x_pleat" && keyOf("goblet") === "goblet");
check("EVO is its own heading", LQ.normaliseHeading({ heading: "EVO" }).key === "evo" && LQ.normaliseHeading({ heading: "EVO" }).extraPleat === true);
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
check("inverted extra fold changes usage only", inverted.calcRule === "pleat-plus-1" && inverted.totalCount === shared.totalCount + 1 && inverted.runnersPerPanel[0] === shared.runnersPerPanel[0]);
const evo = run({ heading: "evo" });
check("EVO matches inverted usage and not its runner count", evo.totalCount === inverted.totalCount && evo.runnersPerPanel[0] === inverted.runnersPerPanel[0] && evo.heading.key === "evo");
const ripple = run({ heading: "ripple_fold" });
check("ripple stays 2:1", ripple.calcRule === "ripple-2to1" && ripple.runnersPerPanel[0] === ripple.panels[0].count * 2);
const grommet = run({ heading: "grommet", fabricPerPleat: 22 });
check("grommet rule unchanged", grommet.calcRule === "grommet" && grommet.fabricPerPleat === 30 && grommet.totalRings === grommet.totalCount * 2);
const bareResult = run({ headingFamily: "pinch" });
check("bare pinch is flagged", bareResult.heading.key === null && bareResult.errors.some((error) => error.code === "pinch"));
function knifeAt(film) {
  return LQ.computeWindow({
    name: "W", heading: "knife", orientation: "fixed-height", lining: "none", topFinish: "none",
    width: 2, height: 2.6, unit: "m", fabricPerPleat: film, draw: "single-left", hem: "8+2",
    returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "finished"
  }, face, rules, prices);
}
const knife22 = knifeAt(22);
const knife30 = knifeAt(30);
check("knife 2.2x uses 4.55 m", knife22.usageMetersPerPiece === 4.55 && knife22.pureFabricCm === 440 && knife22.allowanceCm === 15 && knife22.runnersPerPanel[0] == null && knife22.panels[0].hooks == null && !knife22.warnings.some((warning) => warning.code === "knife-pending"));
check("knife 3.0x uses 6.15 m", knife30.usageMetersPerPiece === 6.15 && knife30.knifeMultiplier === 3);
check("knife rejects 24 cm", knifeAt(24).errors.some((error) => error.code === "fpp"));
check("knife actual fullness is usage over width", knife22.fullnessDisplay === Math.round((knife22.usageMetersPerPiece / 2) * 10) / 10);
const noted = run({ heading: "double_pinch", remarks: "80钩 / 89钩", hookSpec: "89钩", hookHeight: "35mm" });
const quiet = run({ heading: "double_pinch" });
check("hook spec and notes do not change runners or price", noted.runnersPerPanel.join() === quiet.runnersPerPanel.join() && noted.usageMetersPerPiece === quiet.usageMetersPerPiece && noted.pricing.curtainCny === quiet.pricing.curtainCny && noted.hookHeightMm === 35 && noted.hookSpec === "89钩");
const pasted = LQ.parsePaste("Location\tWidth\tHeight\tUnit\tDraw\tModel\tColour No.\tWidth basis\tQuantity\tHook Height\tHook spec\nRoom\t2\t2.6\tm\tdouble\tMasal\t\t\t2\t3.5cm\t80钩", { catalog, orderWidthBasis: "track", orderFilm: "24" });
check("paste columns keep quantity and do not treat 80钩 as a count", pasted.errors.length === 0 && pasted.rows[0].quantity === "2" && pasted.rows[0].widthBasis === "track" && pasted.rows[0].hookSpec === "80钩" && pasted.rows[0].hookHeight === "3.5cm" && pasted.rows.length === 1);
const versionOnly = LQ.matchModel(catalog, "F01");
check("version code is not a model", versionOnly.status === "version" && versionOnly.en === "use the fabric model name, e.g. Masal");
check("model match ignores case and hyphens", LQ.matchModel(catalog, "masal").status === "ok");
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

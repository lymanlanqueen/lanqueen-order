"use strict";
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Math, Number, Object, Array, Set, JSON, String };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/lq.js"), "utf8") + "\nthis.LQ = LQ;", ctx);
const LQ = ctx.LQ;
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const endura = LQ.resolveFabric(catalog.find((row) => row.id === "endura"), null);
const rules = Object.assign({}, LQ.DEFAULT_RULES, { catalog });
const base = {
  name: "T", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, hookSpacingCm: 10, draw: "double",
  hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, fabricId: "endura", widthBasis: "track"
};
const run = (over) => LQ.computeWindow(Object.assign({}, base, over), endura, rules, LQ.DEFAULT_HARDWARE_PRICES);
let failed = 0;
function check(name, ok) {
  if (!ok) { failed += 1; console.error("FAIL", name); }
  else console.log("ok", name);
}
const plain = run({});
const lined = run({ lining: "endura-white" });
check("lining adds Endura finished fee", lined.pricing.liningCny === Math.round(plain.usageMetersPriced * 82.5 * 100) / 100 && lined.pricing.lineCny === Math.round((plain.pricing.curtainCny + lined.pricing.liningCny) * 100) / 100);
check("lining none is zero", plain.pricing.liningCny === 0 && plain.lining.usageMeters === 0);
check("height does not change fixed-height usage", run({ height: 2 }).pricing.curtainCny === run({ height: 2.6 }).pricing.curtainCny);
check("tall fixed-height blocks", run({ height: 2.79 }).errors.some((error) => error.code === "fixed-height"));
check("comma decimal", run({ width: "2,5" }).widthCm === 250);
check("bad number", run({ width: "2,5,1" }).errors.some((error) => error.code === "width"));
check("manual track priced", run({ hardware: "manual-track" }).pricing.trackCny > 0);
check("single ignores overlap", run({ draw: "single-left", width: 2, overlapCm: 10 }).excessCm === run({ draw: "single-left", width: 2, overlapCm: 5 }).excessCm);
check("return excess per panel", run({ draw: "single-left", width: 2, returnCm: 10 }).excessCm === 5);
check("qty scales curtain", run({ quantity: 2 }).pricing.curtainCny === Math.round(plain.pricing.curtainCny * 2 * 100) / 100);
check("toCm", LQ.toCm(1, "in") === 2.54 && LQ.toCm(1, "yd") === 91.44 && LQ.toCm(1, "m") === 100);
const fixed = run({ orientation: "fixed-width", width: 2, height: 2.6, draw: "single-left" });
const fixedDrops = fixed.panels.reduce((sum, panel) => sum + panel.drops, 0);
check("fixed-width is widths times height plus 30 cm", Math.abs(fixed.usageMetersPerPiece - fixedDrops * (260 + 30) / 100) < 0.001);
check("fixed-width top fold does not change usage", fixed.usageMetersPerPiece === run({ orientation: "fixed-width", width: 2, height: 2.6, draw: "single-left", topFinish: "fold-8" }).usageMetersPerPiece);
if (failed) { console.error(failed + " extra checks failed"); process.exit(1); }
console.log("extra checks passed");

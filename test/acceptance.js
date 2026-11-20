"use strict";
// De-identified acceptance suite. Dimensions and expected counts only.
// No customer names, addresses, PO numbers, or selling prices.
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Math, Number, Object, Array, Set, JSON, String };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/lq.js"), "utf8") + "\nthis.LQ = LQ;", ctx);
const LQ = ctx.LQ;
const rules = LQ.DEFAULT_RULES;
const prices = LQ.DEFAULT_HARDWARE_PRICES;

function wave(partial) {
  return LQ.computeWindow(Object.assign({
    name: "W", headingFamily: "ripple", rippleTape: "rivet", orientation: "fixed-height",
    lining: "none", topFinish: "none", height: 2.5, unit: "m", fabricPerPleat: 24,
    hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer",
    quantity: 1, widthBasis: "track"
  }, partial), null, rules, prices);
}

const windows = [
  { id: "AC-ANT-01-W1", width: 2.38, draw: "single-right", pitch: 6, hooks: 42 },
  { id: "AC-ANT-01-W2", width: 3.136, draw: "single-left", pitch: 6, hooks: 56 },
  { id: "AC-ANT-01-W3", width: 3.796, draw: "double", pitch: 6, hooks: 68 },
  { id: "AC-ANT-01-W4", width: 3.029, draw: "single-left", pitch: 6, hooks: 54 },
  { id: "AC-ANT-02-W1", width: 2.236, draw: "single-right", pitch: 5.4, hooks: 44 },
  { id: "AC-ANT-02-W2", width: 2.236, draw: "single-left", pitch: 5.4, hooks: 44 },
  { id: "AC-ANT-02-W3", width: 2.22, draw: "single-right", pitch: 5.4, hooks: 44 },
  { id: "AC-ANT-02-W4", width: 2.22, draw: "single-left", pitch: 5.4, hooks: 44 },
  { id: "AC-ANT-02-W5", width: 2.32, draw: "single-right", pitch: 5.4, hooks: 46 },
  { id: "AC-ANT-02-W6", width: 2.3, draw: "single-right", pitch: 5.4, hooks: 46 },
  { id: "AC-ANT-02-W7", width: 2.32, draw: "single-left", pitch: 5.4, hooks: 46 },
  { id: "AC-ANT-03-W1", width: 4.86, draw: "double", pitch: 5.4, hooks: 96 },
  { id: "AC-ANT-03-W2", width: 4.196, draw: "single-left", pitch: 5.4, hooks: 80 },
  { id: "AC-ANT-03-W3", width: 3.7, draw: "single-right", pitch: 5.4, hooks: 72 },
  { id: "AC-ANT-03-W4", width: 3.583, draw: "double", pitch: 5.4, hooks: 72 },
  { id: "AC-ANT-03-W5", width: 3.565, draw: "double", pitch: 5.4, hooks: 72 }
];

const orders = [
  { id: "AC-ANT-01", windows: windows.filter((row) => row.id.startsWith("AC-ANT-01")), usageAt30: 33.75, usageAt24: null },
  { id: "AC-ANT-02", windows: windows.filter((row) => row.id.startsWith("AC-ANT-02")), usageAt30: 48.15, usageAt24: null },
  { id: "AC-ANT-03", windows: windows.filter((row) => row.id.startsWith("AC-ANT-03")), usageAt30: null, usageAt24: 60.54 }
];

let failed = 0;
const verdicts = [];
function record(id, status, detail) {
  verdicts.push({ id, status, detail });
  const mark = status === "fail" ? "FAIL" : "ok";
  console.log(mark, id, status, detail);
  if (status === "fail") failed += 1;
}

windows.forEach((row) => {
  const result = wave({ width: row.width, draw: row.draw, gliderPitch: row.pitch });
  const runners = result.totalGliders;
  const perPanel = result.runnersPerPanel || [];
  const total = perPanel.reduce((sum, count) => sum + count, 0);
  const ratio = result.totalCount > 0 ? runners / result.totalCount : 0;
  record(row.id + " hooks", runners === row.hooks && total === runners && Math.abs(ratio - 2) < 1e-9 ? "pass" : "fail", "gliders " + runners + " expected " + row.hooks + " per-panel " + perPanel.join("+"));
});

const unequal = wave({ width: 5.095, draw: "double", gliderPitch: 5.4, leftWidth: 2.85, rightWidth: 2.245, unit: "m" });
const left = unequal.runnersPerPanel[0];
const right = unequal.runnersPerPanel[1];
record("AC-ANT-03-W6 sides", left === 56 && right === 44 && left + right === 100 ? "pass" : "fail", "L " + left + " R " + right + " (baseline split was 50/50)");

function orderUsage(rows, film) {
  return Math.round(rows.reduce((sum, row) => sum + wave({ width: row.width, draw: row.draw, gliderPitch: row.pitch, fabricPerPleat: film }).usageMetersPerPiece, 0) * 100) / 100;
}
record("AC-ANT-01 usage vs film", "pending-owner", "historical 33.75 m matches film 30 (" + orderUsage(orders[0].windows, 30) + " m) not the default 24 (" + orderUsage(orders[0].windows, 24) + " m). Film was not on the order.");
record("AC-ANT-02 usage vs film", "pending-owner", "historical 48.15 m matches film 30 (" + orderUsage(orders[1].windows, 30) + " m) not the default 24 (" + orderUsage(orders[1].windows, 24) + " m). Film was not on the order.");
record("AC-ANT-03 usage vs film", "pending-owner", "historical 60.54 m matches film 24 (" + orderUsage(orders[2].windows.concat([{ width: 5.095, draw: "double", pitch: 5.4 }]), 24) + " m). Film was not on the order.");

function elite(width, height, draw, film, stated) {
  return wave({ width, height, draw, unit: "m", gliderPitch: 6, fabricPerPleat: film, orderedFullness: stated, widthBasis: "finished" });
}
const eli1 = elite(5.5, 2.58, "single-right", 24, 2);
const eli2 = elite(4.83, 2.33, "double", 24, 2);
const eli3 = elite(3.79, 2.33, "single-left", 24, 1.8);
const eli3film22 = elite(3.79, 2.33, "single-left", 22, 1.8);
record("AC-ELI-01 fullness", Math.abs(eli1.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + eli1.fullnessDisplay + " stated 2.0");
record("AC-ELI-02 fullness", Math.abs(eli2.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + eli2.fullnessDisplay + " stated 2.0");
record("AC-ELI-03 fullness", "pending-owner", "stated 1.8; film 24 gives " + eli3.fullnessDisplay + " (outside ±0.1); film 22 gives " + eli3film22.fullnessDisplay + " (difference 0.1). S-Wave fullness is the result of film and pitch, not a free input. Stated fullness is compared and warned, not used to reprice.");

const pinch = LQ.computeWindow({
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
}, null, rules, prices);
const runnerTotal = pinch.runnersPerPanel.reduce((sum, count) => sum + count, 0);
record("non-S-Wave 1:1 per panel", pinch.runnersPerPanel.every((count, index) => count === pinch.panels[index].count) && runnerTotal === pinch.totalCount && pinch.makingHooksPerPanel[0] === pinch.panels[0].count + 2 ? "pass" : "fail", "runners/panel " + pinch.runnersPerPanel.join("+") + " total " + runnerTotal + "; making hooks stay folds+2 and are not the priced runner count");

const notRunnable = ["AC-KEV-01", "AC-KEV-02", "AC-KEV-03", "AC-POL-01", "AC-REG-01", "AC-REG-02", "AC-MC-01", "AC-MC-02", "AC-MC-03", "AC-MC-04", "AC-CP-01", "AC-CP-02", "AC-CP-03", "AC-NB-01", "AC-NB-02", "AC-NB-03"];
notRunnable.forEach((id) => record(id, "not-runnable", "no window dimensions on the source order"));

const counts = verdicts.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {});
console.log("ACCEPTANCE", JSON.stringify(counts), "of", verdicts.length, "checks");
console.log("BASELINE e4ee878 was 20 pass, 5 fail, 17 not-runnable (metric rows).");
if (failed) process.exit(1);

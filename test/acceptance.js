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
  { id: "AC-A-01-W1", width: 2.38, draw: "single-right", pitch: 6, hooks: 42 },
  { id: "AC-A-01-W2", width: 3.136, draw: "single-left", pitch: 6, hooks: 56 },
  { id: "AC-A-01-W3", width: 3.796, draw: "double", pitch: 6, hooks: 68 },
  { id: "AC-A-01-W4", width: 3.029, draw: "single-left", pitch: 6, hooks: 54 },
  { id: "AC-A-02-W1", width: 2.236, draw: "single-right", pitch: 5.4, hooks: 44 },
  { id: "AC-A-02-W2", width: 2.236, draw: "single-left", pitch: 5.4, hooks: 44 },
  { id: "AC-A-02-W3", width: 2.22, draw: "single-right", pitch: 5.4, hooks: 44 },
  { id: "AC-A-02-W4", width: 2.22, draw: "single-left", pitch: 5.4, hooks: 44 },
  { id: "AC-A-02-W5", width: 2.32, draw: "single-right", pitch: 5.4, hooks: 46 },
  { id: "AC-A-02-W6", width: 2.3, draw: "single-right", pitch: 5.4, hooks: 46 },
  { id: "AC-A-02-W7", width: 2.32, draw: "single-left", pitch: 5.4, hooks: 46 },
  { id: "AC-A-03-W1", width: 4.86, draw: "double", pitch: 5.4, hooks: 96 },
  { id: "AC-A-03-W2", width: 4.196, draw: "single-left", pitch: 5.4, hooks: 80 },
  { id: "AC-A-03-W3", width: 3.7, draw: "single-right", pitch: 5.4, hooks: 72 },
  { id: "AC-A-03-W4", width: 3.583, draw: "double", pitch: 5.4, hooks: 72 },
  { id: "AC-A-03-W5", width: 3.565, draw: "double", pitch: 5.4, hooks: 72 }
];

const orders = [
  { id: "AC-A-01", windows: windows.filter((row) => row.id.startsWith("AC-A-01")), usageAt30: 33.75, usageAt24: null },
  { id: "AC-A-02", windows: windows.filter((row) => row.id.startsWith("AC-A-02")), usageAt30: 48.15, usageAt24: null },
  { id: "AC-A-03", windows: windows.filter((row) => row.id.startsWith("AC-A-03")), usageAt30: null, usageAt24: 60.54 }
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
record("AC-A-03-W6 sides", left === 56 && right === 44 && left + right === 100 ? "pass" : "fail", "L " + left + " R " + right + " (baseline split was 50/50)");

function orderUsage(rows, film) {
  return Math.round(rows.reduce((sum, row) => sum + wave({ width: row.width, draw: row.draw, gliderPitch: row.pitch, fabricPerPleat: film }).usageMetersPerPiece, 0) * 100) / 100;
}
record("AC-A-01 usage vs film", "pending-owner", "historical 33.75 m matches film 30 (" + orderUsage(orders[0].windows, 30) + " m) not the default 24 (" + orderUsage(orders[0].windows, 24) + " m). Film was not on the order.");
record("AC-A-02 usage vs film", "pending-owner", "historical 48.15 m matches film 30 (" + orderUsage(orders[1].windows, 30) + " m) not the default 24 (" + orderUsage(orders[1].windows, 24) + " m). Film was not on the order.");
record("AC-A-03 usage vs film", "pending-owner", "historical 60.54 m matches film 24 (" + orderUsage(orders[2].windows.concat([{ width: 5.095, draw: "double", pitch: 5.4 }]), 24) + " m). Film was not on the order.");

function custB(width, height, draw, film, stated) {
  return wave({ width, height, draw, unit: "m", gliderPitch: 6, fabricPerPleat: film, orderedFullness: stated, widthBasis: "finished" });
}
const b01 = custB(5.5, 2.58, "single-right", 24, 2);
const b02 = custB(4.83, 2.33, "double", 24, 2);
const b03 = custB(3.79, 2.33, "single-left", 24, 1.8);
const b03film22 = custB(3.79, 2.33, "single-left", 22, 1.8);
record("AC-B-01 fullness", Math.abs(b01.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + b01.fullnessDisplay + " stated 2.0");
record("AC-B-02 fullness", Math.abs(b02.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + b02.fullnessDisplay + " stated 2.0");
record("AC-B-03 fullness", "pending-owner", "stated 1.8; film 24 gives " + b03.fullnessDisplay + " (outside ±0.1); film 22 gives " + b03film22.fullnessDisplay + " (difference 0.1). S-Wave fullness is the result of film and pitch, not a free input. Stated fullness is compared and warned, not used to reprice.");

const pinch = LQ.computeWindow({
  name: "W", headingFamily: "pinch", pinchStyle: "double-pinch", orientation: "fixed-height", lining: "none",
  topFinish: "none", width: 3, height: 2.6, unit: "m", fabricPerPleat: 24, draw: "double", hem: "8+2",
  returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track"
}, null, rules, prices);
const runnerTotal = pinch.runnersPerPanel.reduce((sum, count) => sum + count, 0);
record("non-S-Wave 1:1 per panel", pinch.runnersPerPanel.every((count, index) => count === pinch.panels[index].count) && runnerTotal === pinch.totalCount && pinch.makingHooksPerPanel[0] === pinch.panels[0].count + 2 ? "pass" : "fail", "runners/panel " + pinch.runnersPerPanel.join("+") + " total " + runnerTotal + "; making hooks stay folds+2 and are not the priced runner count");

const notRunnable = ["AC-C-01", "AC-C-02", "AC-C-03", "AC-D-01", "AC-E-01", "AC-E-02", "AC-F-01", "AC-F-02", "AC-F-03", "AC-F-04", "AC-G-01", "AC-G-02", "AC-G-03", "AC-H-01", "AC-H-02", "AC-H-03"];
notRunnable.forEach((id) => record(id, "not-runnable", "no window dimensions on the source order"));

const counts = verdicts.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {});
console.log("ACCEPTANCE", JSON.stringify(counts), "of", verdicts.length, "checks");
console.log("BASELINE e4ee878 was 20 pass, 5 fail, 17 not-runnable (metric rows).");
if (failed) process.exit(1);

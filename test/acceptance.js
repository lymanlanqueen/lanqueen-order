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
    name: "W", heading: "S-Fold", rippleTape: "rivet", orientation: "fixed-height",
    lining: "none", topFinish: "none", height: 2.5, unit: "m", fabricPerPleat: 24,
    hem: "8+2", returnCm: 5, overlapCm: 5, tieback: "none", hardware: "customer",
    quantity: 1, widthBasis: "track"
  }, partial), null, rules, prices);
}

const windows = [
  { id: "AC-A-01-W1", order: "AC-A-01", width: 2.38, draw: "single-right", pitch: 6, hooks: 42, alias: "S-Fold" },
  { id: "AC-A-01-W2", order: "AC-A-01", width: 3.136, draw: "single-left", pitch: 6, hooks: 56, alias: "S-Fold" },
  { id: "AC-A-01-W3", order: "AC-A-01", width: 3.796, draw: "double", pitch: 6, hooks: 68, alias: "S-Fold" },
  { id: "AC-A-01-W4", order: "AC-A-01", width: 3.029, draw: "single-left", pitch: 6, hooks: 54, alias: "S-Fold" },
  { id: "AC-A-02-W1", order: "AC-A-02", width: 2.236, draw: "single-right", pitch: 5.4, hooks: 44, alias: "S-Fold" },
  { id: "AC-A-02-W2", order: "AC-A-02", width: 2.236, draw: "single-left", pitch: 5.4, hooks: 44, alias: "S-Fold" },
  { id: "AC-A-02-W3", order: "AC-A-02", width: 2.22, draw: "single-right", pitch: 5.4, hooks: 44, alias: "S-Fold" },
  { id: "AC-A-02-W4", order: "AC-A-02", width: 2.22, draw: "single-left", pitch: 5.4, hooks: 44, alias: "S-Fold" },
  { id: "AC-A-02-W5", order: "AC-A-02", width: 2.32, draw: "single-right", pitch: 5.4, hooks: 46, alias: "S-Fold" },
  { id: "AC-A-02-W6", order: "AC-A-02", width: 2.3, draw: "single-right", pitch: 5.4, hooks: 46, alias: "S-Fold" },
  { id: "AC-A-02-W7", order: "AC-A-02", width: 2.32, draw: "single-left", pitch: 5.4, hooks: 46, alias: "S-Fold" },
  { id: "AC-A-03-W1", order: "AC-A-03", width: 4.86, draw: "double", pitch: 5.4, hooks: 96, alias: "S-Fold" },
  { id: "AC-A-03-W2", order: "AC-A-03", width: 4.196, draw: "single-left", pitch: 5.4, hooks: 80, alias: "S-Fold" },
  { id: "AC-A-03-W3", order: "AC-A-03", width: 3.7, draw: "single-right", pitch: 5.4, hooks: 72, alias: "S-Fold" },
  { id: "AC-A-03-W4", order: "AC-A-03", width: 3.583, draw: "double", pitch: 5.4, hooks: 72, alias: "S-Fold" },
  { id: "AC-A-03-W5", order: "AC-A-03", width: 3.565, draw: "double", pitch: 5.4, hooks: 72, alias: "S-Fold" },
  { id: "AC-A-03-W6", order: "AC-A-03", width: 5.095, draw: "double", pitch: 5.4, hooks: 100, alias: "S-Fold", leftWidth: 2.85, rightWidth: 2.245, left: 56, right: 44 }
];

let failed = 0;
const verdicts = [];
function record(id, status, detail) {
  verdicts.push({ id, status, detail });
  console.log(status === "fail" ? "FAIL" : "ok", id, status, detail);
  if (status === "fail") failed += 1;
}

function orderUsage(rows, film) {
  return Math.round(rows.reduce((sum, row) => sum + wave({ width: row.width, draw: row.draw, gliderPitch: row.pitch, fabricPerPleat: film, heading: row.alias }).usageMetersPerPiece, 0) * 100) / 100;
}

windows.forEach((row) => {
  const heading = LQ.normaliseHeading({ heading: row.alias });
  const result = wave({
    width: row.width, draw: row.draw, gliderPitch: row.pitch, heading: row.alias,
    leftWidth: row.leftWidth, rightWidth: row.rightWidth
  });
  record(row.id + " hooks", result.totalGliders === row.hooks ? "pass" : "fail", "gliders " + result.totalGliders + " expected " + row.hooks);
  record(row.id + " heading", heading.key === "ripple_fold" && heading.pending == null ? "pass" : "fail", "alias " + row.alias + " -> " + heading.key);
});

const w6 = windows[windows.length - 1];
const unequal = wave({ width: w6.width, draw: "double", gliderPitch: w6.pitch, heading: "S-Fold", leftWidth: w6.leftWidth, rightWidth: w6.rightWidth });
record("AC-A-03-W6 left", unequal.runnersPerPanel[0] === 56 ? "pass" : "fail", "L " + unequal.runnersPerPanel[0] + " expected 56");
record("AC-A-03-W6 right", unequal.runnersPerPanel[1] === 44 ? "pass" : "fail", "R " + unequal.runnersPerPanel[1] + " expected 44");

const a1 = windows.filter((row) => row.order === "AC-A-01");
const a2 = windows.filter((row) => row.order === "AC-A-02");
const a3 = windows.filter((row) => row.order === "AC-A-03");
const a1at24 = orderUsage(a1, 24);
const a1at30 = orderUsage(a1, 30);
const a2at24 = orderUsage(a2, 24);
const a2at30 = orderUsage(a2, 30);
const a3at24 = orderUsage(a3, 24);
record("AC-A-01 usage", "pending-owner", "historical 33.75 m matches film 30 (" + a1at30 + " m) not the default 24 (" + a1at24 + " m). Film was not on the order.");
record("AC-A-02 usage", "pending-owner", "historical 48.15 m matches film 30 (" + a2at30 + " m) not the default 24 (" + a2at24 + " m). Film was not on the order.");
record("AC-A-03 usage", Math.abs(a3at24 - 60.54) <= 0.05 ? "pass" : "fail", "default film 24 gives " + a3at24 + " m, historical 60.54 m. Film was not written on the order; the default reproduces it.");

function custB(width, height, draw, film, stated) {
  return wave({ width, height, draw, unit: "m", gliderPitch: 6, fabricPerPleat: film, orderedFullness: stated, widthBasis: "finished", heading: "S WAVE" });
}
const b01 = custB(5.5, 2.58, "single-right", 24, 2);
const b02 = custB(4.83, 2.33, "double", 24, 2);
const b03 = custB(3.79, 2.33, "single-left", 24, 1.8);
const b03film22 = custB(3.79, 2.33, "single-left", 22, 1.8);
const bHeading = LQ.normaliseHeading({ heading: "S WAVE" });
record("AC-B-01 fullness", Math.abs(b01.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + b01.fullnessDisplay + " stated 2.0");
record("AC-B-02 fullness", Math.abs(b02.fullnessDisplay - 2) <= 0.1 + 1e-9 ? "pass" : "fail", "display " + b02.fullnessDisplay + " stated 2.0");
record("AC-B-03 fullness", "pending-owner", "stated 1.8; film 24 gives " + b03.fullnessDisplay + " (outside ±0.1); film 22 gives " + b03film22.fullnessDisplay + " (difference 0.1). S-Wave fullness is a result of film and pitch, not a free input.");
["AC-B-01", "AC-B-02", "AC-B-03"].forEach((id) => {
  record(id + " heading", bHeading.key === "ripple_fold" && bHeading.pending == null ? "pass" : "fail", "S WAVE -> " + bHeading.key);
});

function styleRow(id, alias, key, pending) {
  const heading = LQ.normaliseHeading({ heading: alias });
  const mapped = heading.key === key && (pending ? heading.pending === pending : heading.pending == null);
  record(id + " heading", mapped ? (pending ? "pending-owner" : "pass") : "fail", alias + " -> " + heading.key + (heading.pending ? " (" + heading.pending + ")" : ""));
}
styleRow("AC-F-01", "工字褶", "inverted");
styleRow("AC-F-02", "工字褶", "inverted");
styleRow("AC-F-03", "工字褶", "inverted");
styleRow("AC-F-04", "韩褶", "x_pleat");
styleRow("AC-D-01", "天际帘", "ripple_fold", "provisional-ripple");
styleRow("AC-G-03", "天际帘", "ripple_fold", "provisional-ripple");

const notRunnable = [
  ["AC-C-01", "no curtain width; not a made-to-measure window"],
  ["AC-C-02", "no window dimensions"],
  ["AC-B-01 amount", "no dimensions-plus-catalog line to price; amount omitted from the test"],
  ["AC-B-02 amount", "no dimensions-plus-catalog line to price; amount omitted from the test"],
  ["AC-B-03 amount", "no dimensions-plus-catalog line to price; amount omitted from the test"],
  ["AC-E-01", "no window dimensions"],
  ["AC-E-02", "no window dimensions"],
  ["AC-F-01 hooks", "hook count recorded, but no width, so the 1:1 check cannot run"],
  ["AC-F-01 amount", "no window dimensions; amount omitted from the test"],
  ["AC-F-02 amount", "no window dimensions; amount omitted from the test"],
  ["AC-F-03 hooks", "hook count recorded, but no width, so the 1:1 check cannot run"],
  ["AC-F-03 amount", "no window dimensions; amount omitted from the test"],
  ["AC-G-01", "no window dimensions"],
  ["AC-G-02", "no window dimensions"],
  ["AC-H-01", "no window dimensions"],
  ["AC-H-02", "no window dimensions"],
  ["AC-H-03", "no window dimensions"]
];
notRunnable.forEach((row) => record(row[0], "not-runnable", row[1]));

const counts = verdicts.reduce((acc, row) => { acc[row.status] = (acc[row.status] || 0) + 1; return acc; }, {});
console.log("ACCEPTANCE", JSON.stringify(counts), "of", verdicts.length, "checks");
console.log("BASELINE e4ee878 on this case set was 40 pass, 5 fail, 23 not-runnable.");
if (failed) process.exit(1);

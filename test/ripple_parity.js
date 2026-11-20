"use strict";
// Parity with the owner's calculator:
// https://lymanlanqueen.github.io/lanqueen-tools/ (index.html).
// PR #1 on that repo only renames pleats to folds. The glider steps are unchanged.
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Math, Number, Object, Array, Set, JSON, String };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/lq.js"), "utf8") + "\nthis.LQ = LQ;", ctx);
const LQ = ctx.LQ;

function ownerGliders(lengthCm, isDouble, pitch) {
  const n0 = Math.ceil(lengthCm / pitch);
  const n1 = isDouble ? n0 + 3 : n0 + 2;
  if (isDouble) {
    const base = n1 % 2 === 0 ? n1 : n1 + 1;
    const total = Math.floor(base / 2) % 2 === 0 ? base : base + 2;
    return { total, half: total / 2, folds: total / 2 };
  }
  const total = n1 % 2 === 0 ? n1 : n1 + 1;
  return { total, half: null, folds: total / 2 };
}
function round1(n) { return Math.round(n * 10) / 10; }

const pitches = [5.4, 6, 7, 8, 9, 10];
const films = [22, 24, 30];
let rows = 0;
let gliderDiffs = 0;
let usageDiffs = 0;
let fullnessDiffs = 0;
const samples = [];
for (let width = 50; width <= 1000; width += 1) {
  pitches.forEach((pitch) => {
    films.forEach((film) => {
      [false, true].forEach((isDouble) => {
        rows += 1;
        const owner = ownerGliders(width, isDouble, pitch);
        const loss = isDouble ? 30 : 15;
        const pure = owner.folds * film;
        const wf = pure + loss;
        const ownerFullness = width > 0 ? round1(pure / width) : 0;
        const ours = LQ.computeWindow({
          name: "W", heading: "ripple_fold", rippleTape: "rivet", orientation: "fixed-height", lining: "none",
          topFinish: "none", width, height: 260, unit: "cm", fabricPerPleat: film, gliderPitch: pitch,
          draw: isDouble ? "double" : "single-left", hem: "8+2", returnCm: 5, overlapCm: 5,
          tieback: "none", hardware: "customer", quantity: 1, widthBasis: "track", equalSplitConfirmed: true
        }, null, LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
        const runnerSum = (ours.runnersPerPanel || []).reduce((sum, count) => sum + Number(count || 0), 0);
        const gliderOk = ours.totalGliders === owner.total && ours.totalCount === owner.folds && runnerSum === owner.total && (!isDouble || (ours.runnersPerPanel[0] === owner.half && ours.runnersPerPanel[1] === owner.half));
        const usageOk = Math.abs(ours.cutWidthCm - wf) < 0.02 && Math.abs(ours.usageMetersPerPiece - wf / 100) < 0.0005;
        const ourFullness = round1(ours.usageMetersPerPiece / (width / 100));
        if (!gliderOk) gliderDiffs += 1;
        if (!usageOk) usageDiffs += 1;
        if (ours.fullnessDisplay !== ownerFullness) fullnessDiffs += 1;
        if ((!gliderOk || !usageOk || ours.fullnessDisplay !== ourFullness) && samples.length < 5) {
          samples.push({ width, pitch, film, isDouble, owner: owner.total, ours: ours.totalGliders, wf, cut: ours.cutWidthCm, ownerFullness, ourFullness: ours.fullnessDisplay });
        }
      });
    });
  });
}
console.log("RIPPLE PARITY", JSON.stringify({ rows, gliderDiffs, usageDiffs, fullnessDiffs, stepCm: 1, widths: "50-1000" }));
if (samples.length) console.error("samples", samples);
if (gliderDiffs || usageDiffs) {
  console.error("Ripple glider or usage differs from the owner calculator");
  process.exit(1);
}
console.log("Ripple folds, runners (2:1) and usage match the owner calculator. Fullness differs on " + fullnessDiffs + " of " + rows + " rows because that calculator uses pure fabric ÷ width, while this form uses usage ÷ finished width (the +15 cm per panel allowance is included). That owner rule is kept.");

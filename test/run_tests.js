"use strict";
// Reviewer cases, adapted to the confirmed rules. Ripple gliders follow
// https://lymanlanqueen.github.io/lanqueen-tools/ (N0 = ceil(width / pitch)).
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Math, Number, Object, Array, Set, JSON, String };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/lq.js"), "utf8") + "\nthis.LQ = LQ;", ctx);
const LQ = ctx.LQ;
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/catalog.json"), "utf8"));
const fab = (id) => LQ.resolveFabric(catalog.find((row) => row.id === id), null);
const base = {
  name: "T", rippleTape: "rivet", orientation: "fixed-height", lining: "none", topFinish: "none",
  fabricPerPleat: 24, gliderPitch: 6, hookSpacingCm: 10, hem: "8+2", returnCm: 5, overlapCm: 5,
  tieback: "none", hardware: "customer", quantity: 1, fabricId: "endura"
};
const HEM = { "8+2": 10, "8+8": 16, "7+7": 14, "2+2": 4, lead: 0 };
const round1 = (n) => Math.round(n * 10) / 10;
const roundCm = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
function ownerGliders(lengthCm, isDouble, pitch) {
  const n0 = Math.ceil(lengthCm / pitch);
  const n1 = isDouble ? n0 + 3 : n0 + 2;
  if (isDouble) {
    const even = n1 % 2 === 0 ? n1 : n1 + 1;
    const total = Math.floor(even / 2) % 2 === 0 ? even : even + 2;
    return { total, half: total / 2 };
  }
  const total = n1 % 2 === 0 ? n1 : n1 + 1;
  return { total, half: null };
}
function ref(c) {
  const W = c.wCm;
  const H = c.hCm;
  const dbl = c.draw === "double";
  const pan = dbl ? 2 : 1;
  const ret = Math.max(0, (c.returnCm ?? 5) - 5);
  const ovl = dbl ? Math.max(0, (c.overlapCm ?? 5) - 5) : 0;
  const excessEach = ret + ovl;
  let pleats;
  let runners;
  let perPanel;
  let fpp = c.fabricPerPleat;
  if (c.family === "ripple") {
    const gliders = ownerGliders(W, dbl, c.gliderPitch);
    runners = gliders.total;
    pleats = gliders.total / 2;
    perPanel = pleats / pan;
  } else if (c.family === "grommet") {
    fpp = 30;
    const raw = Math.ceil(+(W / pan / 10).toFixed(9));
    const ringsPer = raw <= 0 ? 0 : raw % 2 === 0 ? raw : raw + 1;
    perPanel = ringsPer / 2;
    pleats = perPanel * pan;
    runners = ringsPer * pan;
  } else {
    const extra = ["evo", "inverted"].includes(c.pinchStyle) ? 1 : 0;
    perPanel = Math.ceil(+(W / pan / 10).toFixed(9)) - 1 + extra;
    pleats = perPanel * pan;
    runners = (perPanel + 2) * pan;
  }
  const pure = pleats * fpp;
  const cut = pure + 15 * pan + excessEach * pan;
  let usageCm = cut;
  let drops = null;
  if (c.orientation === "fixed-width") {
    const cutDrop = H + HEM[c.hem] + (c.topFinish === "fold-8" ? 8 : 0);
    const bolt = fab(c.fabricId).widthCm;
    const perPanelCut = cut / pan;
    drops = Math.ceil(+(perPanelCut / bolt).toFixed(9)) * pan;
    usageCm = drops * cutDrop;
  }
  return {
    pleats, runners, pure, cut, full: W > 0 ? round1((+roundCm(usageCm) / 100) / (W / 100)) : 0,
    usageM: +roundCm(usageCm) / 100, drops
  };
}
function page(c) {
  const input = Object.assign({}, base, c, {
    headingFamily: c.family,
    widthBasis: c.widthBasis || "track",
    width: c.unitRaw ? c.unitRaw.w : c.wCm / 100,
    height: c.unitRaw ? c.unitRaw.h : c.hCm / 100,
    unit: c.unitRaw ? c.unitRaw.u : "m"
  });
  const rules = Object.assign({}, LQ.DEFAULT_RULES, { catalog });
  const result = LQ.computeWindow(input, fab(input.fabricId), rules, LQ.DEFAULT_HARDWARE_PRICES);
  return {
    pleats: result.totalCount,
    runners: result.totalGliders != null ? result.totalGliders : result.totalRings != null ? result.totalRings : result.totalHooks,
    pure: result.pureFabricCm,
    cut: result.cutWidthCm,
    full: result.fullnessDisplay,
    usageM: result.usageMetersPerPiece,
    errors: result.errors.map((error) => error.code),
    warnings: result.warnings.map((warning) => warning.code)
  };
}
const cases = [
  { id: "R1", family: "ripple", draw: "single-left", wCm: 200, hCm: 260, fabricPerPleat: 24, gliderPitch: 6 },
  { id: "R2", family: "ripple", draw: "double", wCm: 420, hCm: 320, fabricPerPleat: 22, gliderPitch: 6, errors: ["fixed-height"] },
  { id: "R3", family: "ripple", draw: "single-left", wCm: 600, hCm: 380, fabricPerPleat: 30, gliderPitch: 6, fabricId: "ls233-8cloud", errors: ["fixed-height"] },
  { id: "R4", family: "ripple", draw: "double", wCm: 60, hCm: 240, fabricPerPleat: 24, gliderPitch: 8 },
  { id: "R5", family: "ripple", draw: "double", wCm: 300, hCm: 260, fabricPerPleat: 24, gliderPitch: 6, returnCm: 10, overlapCm: 8 },
  { id: "P1", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 300, hCm: 260 },
  { id: "P2", family: "pinch", pinchStyle: "triple-pinch", draw: "single-left", wCm: 150, hCm: 250, fabricPerPleat: 30 },
  { id: "P3", family: "pinch", pinchStyle: "euro-double", draw: "double", wCm: 240, hCm: 270 },
  { id: "P4", family: "pinch", pinchStyle: "euro-triple", draw: "single-right", wCm: 180, hCm: 250 },
  { id: "P5", family: "pinch", pinchStyle: "x-pleat", draw: "double", wCm: 350, hCm: 280, errors: ["fixed-height"] },
  { id: "P6", family: "pinch", pinchStyle: "inverted", draw: "double", wCm: 201, hCm: 260 },
  { id: "P7", family: "pinch", pinchStyle: "evo", draw: "single-left", wCm: 160, hCm: 250 },
  { id: "P8", family: "pinch", pinchStyle: "goblet", draw: "single-left", wCm: 120, hCm: 240, fabricPerPleat: 30 },
  { id: "P9", family: "pinch", pinchStyle: "double-pinch", draw: "single-left", wCm: 25, hCm: 200, errors: ["width-range"] },
  { id: "P10", family: "pinch", pinchStyle: "double-pinch", draw: "single-left", wCm: 9, hCm: 200, errors: ["width-range", "narrow"] },
  { id: "P11", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 300, hCm: 260, fabricPerPleat: 22 },
  { id: "P12", family: "pinch", pinchStyle: "double-pinch", draw: "single-left", wCm: 200, hCm: 260, hookSpacingCm: 12 },
  { id: "G1", family: "grommet", draw: "single-left", wCm: 190, hCm: 250, fabricPerPleat: 30 },
  { id: "G2", family: "grommet", draw: "double", wCm: 300, hCm: 260, fabricPerPleat: 30 },
  { id: "G3", family: "grommet", draw: "single-left", wCm: 200, hCm: 250, fabricPerPleat: 30 },
  { id: "W1", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 800, hCm: 260, orientation: "fixed-width" },
  { id: "W2", family: "ripple", draw: "single-left", wCm: 600, hCm: 300, fabricPerPleat: 24, gliderPitch: 6, orientation: "fixed-width", fabricId: "diva" },
  { id: "W3", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 500, hCm: 260, orientation: "fixed-width", repeatCm: 64 },
  { id: "U1", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 254, hCm: 243.84, unitRaw: { w: 100, h: 96, u: "in" } },
  { id: "U2", family: "ripple", draw: "single-left", wCm: 274.32, hCm: 274.32, fabricPerPleat: 24, gliderPitch: 6, unitRaw: { w: 3, h: 3, u: "yd" }, errors: ["fixed-height"] },
  { id: "U3", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 2500, hCm: 260, unitRaw: { w: 25, h: 2.6, u: "m" }, errors: ["width-range"] },
  { id: "H1", family: "pinch", pinchStyle: "double-pinch", draw: "double", wCm: 300, hCm: 280, hem: "8+8", errors: ["fixed-height"] }
];
let failed = 0;
cases.forEach((c0) => {
  const c = Object.assign({ orientation: "fixed-height", fabricId: "endura" }, base, c0);
  const got = page(c);
  const expect = ref(c);
  const keys = ["pleats", "runners", "pure", "cut", "full", "usageM"];
  const diff = keys.filter((key) => Math.abs((got[key] || 0) - (expect[key] || 0)) > 1e-6);
  const missing = (c0.errors || []).filter((code) => !got.errors.includes(code));
  const oneDecimal = Math.abs(got.full * 10 - Math.round(got.full * 10)) < 1e-9;
  if (diff.length || missing.length || !oneDecimal) {
    failed += 1;
    console.error("FAIL", c0.id, "diff", diff, "missing", missing, "got", got, "expect", expect);
  } else {
    console.log("ok", c0.id, got.pleats + "/" + got.runners + "/" + got.pure + "/" + got.cut + "/" + got.full + "/" + got.usageM);
  }
});
if (failed) {
  console.error(failed + " failed of " + cases.length);
  process.exit(1);
}
console.log(cases.length + " reviewer cases passed");

"use strict";
var LQ = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/static-entry.ts
  var static_entry_exports = {};
  __export(static_entry_exports, {
    CATEGORY_LABEL: () => CATEGORY_LABEL,
    DEFAULT_HARDWARE_PRICES: () => DEFAULT_HARDWARE_PRICES,
    DEFAULT_RULES: () => DEFAULT_RULES,
    DRAW_LABEL: () => DRAW_LABEL,
    FAMILY_LABEL: () => FAMILY_LABEL,
    FX_NOTE: () => FX_NOTE,
    HARDWARE_LABEL: () => HARDWARE_LABEL,
    HEM_LABEL: () => HEM_LABEL,
    LINING_LABEL: () => LINING_LABEL,
    ORIENTATION_LABEL: () => ORIENTATION_LABEL,
    PINCH_GROUP: () => PINCH_GROUP,
    PINCH_LABEL: () => PINCH_LABEL,
    ROD_LABEL: () => ROD_LABEL,
    SEED_FABRICS: () => SEED_FABRICS,
    SEED_RATES: () => SEED_RATES,
    TAPE_LABEL: () => TAPE_LABEL,
    TIEBACK_LABEL: () => TIEBACK_LABEL,
    TOP_LABEL: () => TOP_LABEL,
    UNIT_LABEL: () => UNIT_LABEL,
    computeWindow: () => computeWindow,
    headingSummary: () => headingSummary,
    settle: () => settle,
    toCm: () => toCm
  });

  // lib/utils.ts
  function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
  function round3(n) {
    return Math.round((n + Number.EPSILON) * 1e3) / 1e3;
  }
  function roundCm(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
  function excelRoundUp(value, digits = 0) {
    if (!Number.isFinite(value)) return value;
    const sign = value < 0 ? -1 : 1;
    const m = 10 ** digits;
    const n = Math.abs(value) * m;
    const snapped = Math.round(n * 1e8) / 1e8;
    return sign * Math.ceil(snapped - 1e-10) / m;
  }

  // lib/calc/ripple.ts
  var MAX_FOLDS_LIMIT = {
    22: [
      { maxHeight: 300, maxFolds: 71 },
      { maxHeight: 350, maxFolds: 50 },
      { maxHeight: Infinity, maxFolds: 32 }
    ],
    24: [
      { maxHeight: 300, maxFolds: 82 },
      { maxHeight: 350, maxFolds: 38 },
      { maxHeight: Infinity, maxFolds: 32 }
    ],
    30: [
      { maxHeight: 360, maxFolds: 52 },
      { maxHeight: Infinity, maxFolds: 34 }
    ]
  };
  function round1(x) {
    return Math.round(x * 10) / 10;
  }
  function getMaxFoldsLimit(foldMat, height, isDouble) {
    const limits = MAX_FOLDS_LIMIT[foldMat];
    if (!limits) return Infinity;
    for (let i = 0; i < limits.length; i++) {
      if (height <= limits[i].maxHeight) {
        return isDouble ? limits[i].maxFolds * 2 : limits[i].maxFolds;
      }
    }
    const last = limits[limits.length - 1];
    return isDouble ? last.maxFolds * 2 : last.maxFolds;
  }
  function calcN0(lengthCm, pitch) {
    return Math.ceil(lengthCm / pitch);
  }
  function calcGliders(lengthCm, isDouble, pitch) {
    const n0 = calcN0(lengthCm, pitch);
    const n1 = isDouble ? n0 + 3 : n0 + 2;
    if (isDouble) {
      const base = n1 % 2 === 0 ? n1 : n1 + 1;
      const total2 = Math.floor(base / 2) % 2 === 0 ? base : base + 2;
      return { n0, n1, total: total2, half: total2 / 2 };
    }
    const total = n1 % 2 === 0 ? n1 : n1 + 1;
    return { n0, n1, total, half: null };
  }

  // lib/calc/window.ts
  var EXTRA_PLEAT = ["evo", "inverted"];
  var PITCHES = /* @__PURE__ */ new Set([5.4, 6, 7, 8, 9, 10]);
  var FOLDS = /* @__PURE__ */ new Set([22, 24, 30]);
  function toCm(value, unit) {
    const factor = unit === "m" ? 100 : unit === "in" ? 2.54 : 91.44;
    return roundCm(value * factor);
  }
  function nominalFullness(fabricPerPleat) {
    if (fabricPerPleat === 22) return 1.9;
    if (fabricPerPleat === 24) return 2.2;
    if (fabricPerPleat === 30) return 2.8;
    return null;
  }
  function msg(code, en, zh, field) {
    return { code, en, zh, field };
  }
  function limitFromRules(rules, fabricPerPleat, heightCm, isDouble) {
    const tiers = rules.machineLimits[String(fabricPerPleat)];
    if (!tiers?.length) {
      return getMaxFoldsLimit(fabricPerPleat, heightCm, isDouble);
    }
    for (const tier of tiers) {
      const cap = tier.maxHeight === null ? Infinity : tier.maxHeight;
      if (heightCm <= cap) return isDouble ? tier.maxFolds * 2 : tier.maxFolds;
    }
    const last = tiers[tiers.length - 1];
    return isDouble ? last.maxFolds * 2 : last.maxFolds;
  }
  function sideFor(draw, index) {
    if (draw !== "double") return "single";
    return index === 0 ? "left" : "right";
  }
  function computeWindow(input, fabric, rules, prices) {
    const errors = [];
    const warnings = [];
    const widthCm = toCm(Number(input.width) || 0, input.unit);
    const heightCm = toCm(Number(input.height) || 0, input.unit);
    const isDouble = input.draw === "double";
    const panelCount = isDouble ? 2 : 1;
    const panelWidthCm = panelCount > 0 ? roundCm(widthCm / panelCount) : 0;
    const family = input.headingFamily;
    const fabricPerPleat = family === "grommet" ? rules.grommetFabricPerPleat : Number(input.fabricPerPleat);
    const hookSpacing = family === "ripple" ? null : Number(input.hookSpacingCm ?? rules.hookSpacingDefaultCm);
    const pitch = family === "ripple" ? Number(input.gliderPitch ?? 6) : null;
    const hemUsageCm = rules.hemUsageCm[input.hem] ?? 0;
    const topUsageCm = input.topFinish === "fold-8" ? rules.topFoldCm : 0;
    const returnExcess = Math.max(0, roundCm((Number(input.returnCm) || 0) - rules.returnBaselineCm));
    const overlapExcess = isDouble ? Math.max(0, roundCm((Number(input.overlapCm) || 0) - rules.overlapBaselineCm)) : 0;
    if (!(widthCm > 0)) errors.push(msg("width", "Enter a finished width.", "\u8BF7\u586B\u5199\u6210\u54C1\u5BBD\u5EA6\u3002", "width"));
    if (!(heightCm > 0)) errors.push(msg("height", "Enter a finished height.", "\u8BF7\u586B\u5199\u6210\u54C1\u9AD8\u5EA6\u3002", "height"));
    if (widthCm > 3e3) {
      errors.push(msg("width-range", "Width is above 30 m. Check the unit.", "\u5BBD\u5EA6\u8D85\u8FC7 30 \u7C73\uFF0C\u8BF7\u6838\u5BF9\u5355\u4F4D\u3002", "width"));
    }
    if (heightCm > 800) {
      errors.push(msg("height-range", "Height is above 8 m. Check the unit.", "\u9AD8\u5EA6\u8D85\u8FC7 8 \u7C73\uFF0C\u8BF7\u6838\u5BF9\u5355\u4F4D\u3002", "height"));
    }
    if (!input.name?.trim()) {
      errors.push(msg("name", "Name this window (room or location).", "\u8BF7\u586B\u5199\u7A97\u4F4D\u540D\u79F0\uFF08\u623F\u95F4\u6216\u4F4D\u7F6E\uFF09\u3002", "name"));
    }
    if (!fabric) errors.push(msg("fabric", "Choose a fabric model.", "\u8BF7\u9009\u62E9\u9762\u6599\u578B\u53F7\u3002", "fabricId"));
    if (family === "pinch" && !input.pinchStyle) {
      errors.push(msg("pinch", "Choose a pinch style.", "\u8BF7\u9009\u62E9\u634F\u8936\u6837\u5F0F\u3002", "pinchStyle"));
    }
    if (family === "ripple" && !input.rippleTape) {
      errors.push(msg("tape", "Choose rivet tape or mesh tape.", "\u8BF7\u9009\u62E9\u94C6\u9489\u5E26\u6216\u7F51\u683C\u5E26\u3002", "rippleTape"));
    }
    if (family === "ripple" && (pitch === null || !PITCHES.has(pitch))) {
      errors.push(msg("pitch", "Choose a glider pitch.", "\u8BF7\u9009\u62E9\u6ED1\u8F6E\u95F4\u8DDD\u3002", "gliderPitch"));
    }
    if (family !== "grommet" && !FOLDS.has(fabricPerPleat)) {
      errors.push(msg("fpp", "Fabric per pleat must be 22, 24 or 30 cm.", "\u8936\u7528\u6599\u53EA\u80FD\u662F 22\u300124 \u6216 30 \u5398\u7C73\u3002", "fabricPerPleat"));
    }
    if (family !== "ripple" && hookSpacing !== null) {
      if (hookSpacing < rules.hookSpacingMinCm || hookSpacing > rules.hookSpacingMaxCm) {
        errors.push(
          msg(
            "spacing",
            `Hook spacing must be ${rules.hookSpacingMinCm}\u2013${rules.hookSpacingMaxCm} cm.`,
            `\u6302\u94A9\u95F4\u8DDD\u987B\u5728 ${rules.hookSpacingMinCm}\u2013${rules.hookSpacingMaxCm} \u5398\u7C73\u3002`,
            "hookSpacingCm"
          )
        );
      }
    }
    if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
      errors.push(msg("qty", "Quantity must be a whole number from 1 to 99.", "\u6570\u91CF\u987B\u4E3A 1\u201399 \u7684\u6574\u6570\u3002", "quantity"));
    }
    if (input.tieback === "custom" && !input.tiebackRemark?.trim()) {
      errors.push(msg("tieback", "Describe the custom tieback.", "\u5B9A\u5236\u7ED1\u5E26\u8BF7\u586B\u5199\u8BF4\u660E\u3002", "tiebackRemark"));
    }
    if ((Number(input.returnCm) || 0) < 0) {
      errors.push(msg("return", "Return cannot be negative.", "\u5305\u8FB9\u4E0D\u80FD\u4E3A\u8D1F\u6570\u3002", "returnCm"));
    }
    if ((Number(input.overlapCm) || 0) < 0) {
      errors.push(msg("overlap", "Overlap cannot be negative.", "\u91CD\u53E0\u4E0D\u80FD\u4E3A\u8D1F\u6570\u3002", "overlapCm"));
    }
    if (!rules.enabledFamilies.includes(family)) {
      errors.push(msg("family", "This heading is not offered.", "\u8BE5\u5E18\u5934\u6682\u4E0D\u63A5\u53D7\u4E0B\u5355\u3002", "headingFamily"));
    }
    if (family === "pinch" && input.pinchStyle && !rules.enabledPinch.includes(input.pinchStyle)) {
      errors.push(msg("pinch-off", "This pinch style is not offered.", "\u8BE5\u634F\u8936\u6837\u5F0F\u6682\u4E0D\u63A5\u53D7\u4E0B\u5355\u3002", "pinchStyle"));
    }
    if (family === "ripple" && input.rippleTape && !rules.enabledRippleTapes.includes(input.rippleTape)) {
      errors.push(msg("tape-off", "This tape is not offered.", "\u8BE5\u86C7\u5F62\u5E26\u6682\u4E0D\u63A5\u53D7\u4E0B\u5355\u3002", "rippleTape"));
    }
    if (input.hardware === "roman-rod" && !["black", "white", "champagne"].includes(input.rodColor ?? "")) {
      errors.push(msg("rod", "Choose a Roman rod colour.", "\u8BF7\u9009\u62E9\u7F57\u9A6C\u6746\u989C\u8272\u3002", "rodColor"));
    }
    if (input.hardware === "electric-track") {
      if (input.motorSide !== "left" && input.motorSide !== "right") {
        errors.push(msg("motor", "Choose the motor side.", "\u8BF7\u9009\u62E9\u7535\u673A\u4FA7\u3002", "motorSide"));
      }
      if (!input.plugStandard || !rules.plugStandards.includes(input.plugStandard)) {
        errors.push(msg("plug", "Choose the plug standard.", "\u8BF7\u9009\u62E9\u63D2\u5934\u6807\u51C6\u3002", "plugStandard"));
      }
    }
    if (family === "grommet" && Number(input.fabricPerPleat) !== rules.grommetFabricPerPleat) {
      warnings.push(
        msg(
          "grommet-lock",
          `Grommet fullness is locked to ${rules.grommetFabricPerPleat} cm per ring.`,
          `\u6253\u5B54\u73AF\u4E30\u6EE1\u5EA6\u9501\u5B9A\u4E3A\u6BCF\u73AF ${rules.grommetFabricPerPleat} \u5398\u7C73\u3002`,
          "fabricPerPleat"
        )
      );
    }
    const allowanceEach = isDouble ? roundCm(rules.allowanceDoubleCm / 2) : rules.allowanceSingleCm;
    let gliders = null;
    let counts = [];
    if (family === "ripple" && pitch && widthCm > 0) {
      const g = calcGliders(widthCm, isDouble, pitch);
      gliders = { n0: g.n0, n1: g.n1, total: g.total, half: g.half };
      const foldsEach = g.total / 2 / panelCount;
      counts = Array.from({ length: panelCount }, () => foldsEach);
    } else if (family === "grommet" && hookSpacing && panelWidthCm > 0) {
      const raw = excelRoundUp(panelWidthCm / hookSpacing);
      const rings = raw <= 0 ? raw : raw % 2 === 0 ? raw : raw + 1;
      counts = Array.from({ length: panelCount }, () => rings);
    } else if (hookSpacing && panelWidthCm > 0) {
      let pleats = excelRoundUp(panelWidthCm / hookSpacing) - 1;
      if (family === "pinch" && input.pinchStyle && EXTRA_PLEAT.includes(input.pinchStyle)) pleats += 1;
      counts = Array.from({ length: panelCount }, () => pleats);
    } else {
      counts = Array.from({ length: panelCount }, () => 0);
    }
    if (widthCm > 0 && counts.some((c) => c < 1)) {
      errors.push(
        msg("narrow", "This window is too narrow for the chosen heading.", "\u7A97\u5BBD\u8FC7\u7A84\uFF0C\u65E0\u6CD5\u6309\u6240\u9009\u5E18\u5934\u5206\u8936\u3002", "width")
      );
    }
    const panels = counts.map((count, index) => {
      const cutWidthCm2 = roundCm(count * fabricPerPleat + allowanceEach + returnExcess + overlapExcess);
      let drops = null;
      let cutDropCm = null;
      let usageCm2 = cutWidthCm2;
      if (input.orientation === "fixed-width") {
        cutDropCm = roundCm(heightCm + hemUsageCm + topUsageCm);
        const bolt = fabric?.widthCm ?? 0;
        drops = bolt > 0 ? excelRoundUp(cutWidthCm2 / bolt) : 0;
        usageCm2 = roundCm(drops * cutDropCm);
      }
      const glidersEach = family === "ripple" && gliders ? isDouble ? gliders.half : gliders.total : null;
      return {
        index: index + 1,
        side: sideFor(input.draw, index),
        widthCm: panelWidthCm,
        count,
        hooks: family === "pinch" || family === "knife" ? count + 2 : null,
        rings: family === "grommet" ? count : null,
        gliders: glidersEach,
        allowanceCm: allowanceEach,
        returnExcessCm: returnExcess,
        overlapExcessCm: overlapExcess,
        cutWidthCm: cutWidthCm2,
        drops,
        cutDropCm,
        usageCm: usageCm2
      };
    });
    const totalCount = panels.reduce((s, p) => s + p.count, 0);
    const pureFabricCm = roundCm(totalCount * fabricPerPleat);
    const allowanceCm = roundCm(panels.reduce((s, p) => s + p.allowanceCm, 0));
    const excessCm = roundCm(panels.reduce((s, p) => s + p.returnExcessCm + p.overlapExcessCm, 0));
    const cutWidthCm = roundCm(panels.reduce((s, p) => s + p.cutWidthCm, 0));
    const usageCm = panels.reduce((s, p) => s + p.usageCm, 0);
    const usageMetersPerPiece = round3(usageCm / 100);
    const qty = Number.isInteger(input.quantity) && input.quantity > 0 ? input.quantity : 0;
    const usageMetersPriced = round3(usageMetersPerPiece * qty);
    const fullness = widthCm > 0 ? pureFabricCm / widthCm : 0;
    const fullnessDisplay = family === "ripple" ? widthCm > 0 ? round1(pureFabricCm / widthCm) : 0 : round2(fullness);
    let actualSpacingCm = null;
    if (family !== "ripple" && panels[0] && panels[0].count > 0) {
      const spaces = family === "grommet" ? Math.max(panels[0].count - 1, 1) : panels[0].count + 1;
      actualSpacingCm = roundCm(panelWidthCm / spaces);
      if (hookSpacing !== null && (actualSpacingCm < rules.hookSpacingMinCm || actualSpacingCm > rules.hookSpacingMaxCm)) {
        warnings.push(
          msg(
            "spacing-result",
            `Resulting spacing is ${actualSpacingCm} cm, outside ${rules.hookSpacingMinCm}\u2013${rules.hookSpacingMaxCm} cm.`,
            `\u5B9E\u9645\u95F4\u8DDD ${actualSpacingCm} \u5398\u7C73\uFF0C\u8D85\u51FA ${rules.hookSpacingMinCm}\u2013${rules.hookSpacingMaxCm} \u5398\u7C73\u3002`
          )
        );
      }
    }
    const maxCount = limitFromRules(rules, fabricPerPleat, heightCm, isDouble);
    const withinLimit = !(totalCount > maxCount);
    if (heightCm > 0 && !withinLimit) {
      warnings.push(
        msg(
          "machine",
          `Exceeds the machine limit (${totalCount} vs max ${maxCount} for ${fabricPerPleat} cm at this drop).`,
          `\u8D85\u51FA\u8BBE\u5907\u52A0\u5DE5\u9650\u5236\uFF08${fabricPerPleat} \u5398\u7C73\u3001\u5F53\u524D\u9AD8\u5EA6\uFF0C\u8BA1\u7B97 ${totalCount}\uFF0C\u4E0A\u9650 ${maxCount}\uFF09\u3002`
        )
      );
    }
    let fixedHeight = null;
    if (input.orientation === "fixed-height" && fabric) {
      const requiredCm = roundCm(heightCm + hemUsageCm + topUsageCm);
      const exceeds = requiredCm > fabric.widthCm;
      fixedHeight = { requiredCm, fabricWidthCm: fabric.widthCm, exceeds };
      if (exceeds) {
        warnings.push(
          msg(
            "fixed-height",
            "exceeds fabric width, switch to fixed-width orientation, vertical seams will occur",
            "\u8D85\u51FA\u9762\u6599\u95E8\u5E45\uFF0C\u8BF7\u6539\u4E3A\u5B9A\u5BBD\uFF0C\u5C06\u51FA\u73B0\u7EB5\u5411\u62FC\u7F1D",
            "orientation"
          )
        );
      }
    }
    if (input.orientation === "fixed-width" && fabric && fabric.widthCm <= 0) {
      errors.push(msg("bolt", "This fabric has no usable width on file.", "\u8BE5\u9762\u6599\u6CA1\u6709\u53EF\u7528\u95E8\u5E45\u3002", "fabricId"));
    }
    const priceCnyPerM = fabric?.priceCnyPerM ?? 0;
    const widthM = round3(widthCm / 100);
    const trackRate = input.hardware === "manual-track" ? prices.manualTrackPerM : input.hardware === "roman-rod" ? prices.romanRodPerM : input.hardware === "electric-track" ? prices.electricTrackPerM : 0;
    const trackM = round3(widthM * qty);
    const curtainCny = round2(usageMetersPriced * priceCnyPerM);
    const trackCny = round2(trackM * trackRate);
    const motorCny = input.hardware === "electric-track" ? round2(prices.motorUnit * qty) : 0;
    const tiebackUnit = input.tieback === "none" ? 0 : prices.tieback[input.tieback] ?? 0;
    const tiebackCny = round2(tiebackUnit * qty);
    const lineCny = round2(curtainCny + trackCny + motorCny + tiebackCny);
    const trace = buildTrace({
      family,
      isDouble,
      pitch,
      gliders,
      fabricPerPleat,
      pureFabricCm,
      allowanceCm,
      excessCm,
      cutWidthCm,
      widthCm,
      fullnessDisplay,
      usageMetersPerPiece,
      usageBasis: input.orientation === "fixed-width" ? "drop-length" : "cut-width",
      priceCnyPerM,
      curtainPerPiece: qty > 0 ? round2(usageMetersPerPiece * priceCnyPerM) : 0,
      panels
    });
    return {
      widthCm,
      heightCm,
      panelCount,
      panels,
      fabricPerPleat,
      hookSpacingCm: hookSpacing,
      gliderPitch: pitch,
      totalCount,
      totalHooks: panels.every((p) => p.hooks !== null) ? panels.reduce((s, p) => s + (p.hooks ?? 0), 0) : null,
      totalRings: family === "grommet" ? totalCount : null,
      totalGliders: gliders?.total ?? null,
      gliders,
      pureFabricCm,
      allowanceCm,
      excessCm,
      cutWidthCm,
      fullness,
      fullnessDisplay,
      nominalFullness: nominalFullness(fabricPerPleat),
      actualSpacingCm,
      usageMetersPerPiece,
      usageMetersPriced,
      usageBasis: input.orientation === "fixed-width" ? "drop-length" : "cut-width",
      hemUsageCm,
      topUsageCm,
      fixedHeight,
      machine: { maxCount, withinLimit },
      pricing: { widthM, trackM, curtainCny, trackCny, motorCny, tiebackCny, lineCny, priceCnyPerM },
      errors,
      warnings,
      trace
    };
  }
  function buildTrace(p) {
    const lines = [];
    if (p.family === "ripple" && p.gliders && p.pitch) {
      const folds = p.gliders.total / 2;
      lines.push({
        en: `N\u2080 = ceil(${p.widthCm} / ${p.pitch}) = ${p.gliders.n0}`,
        zh: `N\u2080 = \u5411\u4E0A\u53D6\u6574(${p.widthCm} / ${p.pitch}) = ${p.gliders.n0}`
      });
      lines.push({
        en: `N\u2081 = N\u2080 + ${p.isDouble ? 3 : 2} = ${p.gliders.n1}`,
        zh: `N\u2081 = N\u2080 + ${p.isDouble ? 3 : 2} = ${p.gliders.n1}`
      });
      lines.push({
        en: p.isDouble ? `Gliders = ${p.gliders.total} (${p.gliders.half} each side), folds = ${folds}` : `Gliders = ${p.gliders.total} (even), folds = ${folds}`,
        zh: p.isDouble ? `\u6ED1\u8F6E ${p.gliders.total} \u9897\uFF08\u5DE6\u53F3\u5404 ${p.gliders.half}\uFF09\uFF0C\u8936\u6570 ${folds}` : `\u6ED1\u8F6E ${p.gliders.total} \u9897\uFF08\u5076\u6570\uFF09\uFF0C\u8936\u6570 ${folds}`
      });
    } else {
      const label = p.family === "grommet" ? "Rings" : "Pleats";
      const zh = p.family === "grommet" ? "\u73AF\u6570" : "\u8936\u6570";
      lines.push({
        en: `${label} = ${p.panels.map((x) => x.count).join(" + ")} = ${p.panels.reduce((s, x) => s + x.count, 0)}`,
        zh: `${zh} = ${p.panels.map((x) => x.count).join(" + ")} = ${p.panels.reduce((s, x) => s + x.count, 0)}`
      });
    }
    lines.push({
      en: `Cut width = pure ${p.pureFabricCm} + allowance ${p.allowanceCm} + return/overlap excess ${p.excessCm} = ${p.cutWidthCm} cm`,
      zh: `\u88C1\u5BBD = \u51C0\u6599 ${p.pureFabricCm} + \u635F\u8017 ${p.allowanceCm} + \u5305\u8FB9\u91CD\u53E0\u8D85\u51FA ${p.excessCm} = ${p.cutWidthCm} \u5398\u7C73`
    });
    lines.push({
      en: `Fullness = pure \xF7 finished width = ${p.pureFabricCm} \xF7 ${p.widthCm} = ${p.fullnessDisplay}x (allowance excluded)`,
      zh: `\u4E30\u6EE1\u5EA6 = \u51C0\u6599 \xF7 \u6210\u54C1\u5BBD = ${p.pureFabricCm} \xF7 ${p.widthCm} = ${p.fullnessDisplay} \u500D\uFF08\u4E0D\u542B\u635F\u8017\uFF09`
    });
    if (p.usageBasis === "drop-length") {
      lines.push({
        en: `Fixed-width usage = ${p.panels.map((x) => `${x.drops} drop \xD7 ${x.cutDropCm} cm`).join(" + ")} = ${p.usageMetersPerPiece} m`,
        zh: `\u5B9A\u5BBD\u7528\u6599 = ${p.panels.map((x) => `${x.drops} \u5E45 \xD7 ${x.cutDropCm} \u5398\u7C73`).join(" + ")} = ${p.usageMetersPerPiece} \u7C73`
      });
    } else {
      lines.push({
        en: `Fixed-height usage = cut width ${p.cutWidthCm} cm = ${p.usageMetersPerPiece} m`,
        zh: `\u5B9A\u9AD8\u7528\u6599 = \u88C1\u5BBD ${p.cutWidthCm} \u5398\u7C73 = ${p.usageMetersPerPiece} \u7C73`
      });
    }
    lines.push({
      en: `Curtain = ${p.usageMetersPerPiece} m \xD7 ${p.priceCnyPerM} CNY/m = ${p.curtainPerPiece} CNY per piece`,
      zh: `\u7A97\u5E18 = ${p.usageMetersPerPiece} \u7C73 \xD7 ${p.priceCnyPerM} \u5143/\u7C73 = \u6BCF\u5957 ${p.curtainPerPiece} \u5143`
    });
    return lines;
  }

  // lib/calc/money.ts
  function settle(cny, currency, latest, locked) {
    if (currency === "CNY") {
      return {
        currency,
        cny: round2(cny),
        foreign: null,
        rateCny: null,
        rateDate: null,
        source: null,
        locked: false,
        remittanceDate: null
      };
    }
    if (locked && locked.rateCny > 0) {
      return {
        currency,
        cny: round2(cny),
        foreign: round2(cny / locked.rateCny),
        rateCny: locked.rateCny,
        rateDate: locked.remittanceDate,
        source: locked.source ?? "Bank of China",
        locked: true,
        remittanceDate: locked.remittanceDate
      };
    }
    if (latest && latest.rateCny > 0) {
      return {
        currency,
        cny: round2(cny),
        foreign: round2(cny / latest.rateCny),
        rateCny: latest.rateCny,
        rateDate: latest.rateDate,
        source: latest.source,
        locked: false,
        remittanceDate: null
      };
    }
    return {
      currency,
      cny: round2(cny),
      foreign: null,
      rateCny: null,
      rateDate: null,
      source: null,
      locked: false,
      remittanceDate: null
    };
  }
  var FX_NOTE_EN = "Final amount converted at the Bank of China rate on the day of remittance";
  var FX_NOTE_ZH = "\u6700\u7EC8\u91D1\u989D\u6309\u6C47\u6B3E\u5F53\u65E5\u4E2D\u56FD\u94F6\u884C\u724C\u4EF7\u6362\u7B97";
  var FX_NOTE = `${FX_NOTE_EN} / ${FX_NOTE_ZH}`;

  // lib/calc/defaults.ts
  var DEFAULT_RULES = {
    hookSpacingDefaultCm: 10,
    hookSpacingMinCm: 8,
    hookSpacingMaxCm: 12,
    returnBaselineCm: 5,
    overlapBaselineCm: 5,
    allowanceSingleCm: 15,
    allowanceDoubleCm: 30,
    hemUsageCm: {
      "8+2": 10,
      "8+8": 16,
      "7+7": 14,
      "2+2": 4,
      lead: 0
    },
    topFoldCm: 8,
    grommetFabricPerPleat: 30,
    machineLimits: {
      "22": MAX_FOLDS_LIMIT[22].map((t) => ({
        maxHeight: Number.isFinite(t.maxHeight) ? t.maxHeight : null,
        maxFolds: t.maxFolds
      })),
      "24": MAX_FOLDS_LIMIT[24].map((t) => ({
        maxHeight: Number.isFinite(t.maxHeight) ? t.maxHeight : null,
        maxFolds: t.maxFolds
      })),
      "30": MAX_FOLDS_LIMIT[30].map((t) => ({
        maxHeight: Number.isFinite(t.maxHeight) ? t.maxHeight : null,
        maxFolds: t.maxFolds
      }))
    },
    enabledFamilies: ["pinch", "ripple", "knife", "grommet"],
    enabledPinch: [
      "double-pinch",
      "euro-double",
      "triple-pinch",
      "euro-triple",
      "evo",
      "inverted",
      "x-pleat",
      "goblet"
    ],
    enabledRippleTapes: ["rivet", "mesh"],
    tradeTerms: ["EXW", "FOB", "DDP"],
    shippingMethods: [
      { id: "sea", en: "Sea freight", zh: "\u6D77\u8FD0" },
      { id: "air", en: "Air freight", zh: "\u7A7A\u8FD0" },
      { id: "courier", en: "Express courier", zh: "\u5FEB\u9012" },
      { id: "customer", en: "Customer arranged", zh: "\u5BA2\u6237\u5B89\u6392" }
    ],
    plugStandards: ["AU", "EU", "UK", "US", "CN"]
  };
  var DEFAULT_HARDWARE_PRICES = {
    manualTrackPerM: 68,
    romanRodPerM: 128,
    electricTrackPerM: 160,
    motorUnit: 680,
    tieback: { standard: 0, japanese: 0, custom: 0 }
  };

  // lib/catalog/seed-fabrics.ts
  function cloth(model, version, category, widthM, finishedCny, fabricCny) {
    return {
      id: model.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      model,
      nameEn: model,
      nameZh: model,
      version,
      widthCm: Math.round(widthM * 100),
      priceCnyPerM: finishedCny,
      fabricPriceCnyPerM: fabricCny
    };
  }
  var SEED_FABRICS = [
    cloth("Diva", "B01", "blackout", 2.9, 104.5, 73),
    cloth("Endura", "B01", "blackout", 2.8, 82.5, 52),
    cloth("Elba", "B02", "blackout", 2.8, 104.5, 75),
    cloth("Noire", "B03", "blackout", 2.9, 129, 95.8),
    cloth("Vital", "B04", "blackout", 2.9, 130, 96),
    cloth("Poren", "B05", "blackout", 2.9, 102.8, 71.8),
    cloth("LS223-2Cloud", "S01", "sheer", 2.9, 116, 81),
    cloth("LS233-9Cloud", "S01", "sheer", 2.9, 122, 86.5),
    cloth("HS238-1Cloud", "S01", "sheer", 3, 61.5, 32.8),
    cloth("LS248-7Cloud", "S01", "sheer", 2.8, 69, 39),
    cloth("Solune-21Beige", "S01", "sheer", 3, 88, 57),
    cloth("Twine-01Cloud", "S01", "sheer", 3, 65, 36),
    cloth("Twine-02Beige", "S01", "sheer", 3, 65, 36),
    cloth("DF240305Beige", "S01", "sheer", 3, 75, 45),
    cloth("LS233-8Cloud", "S02", "sheer", 2.8, 62, 33),
    cloth("LS243-58Cloud", "S02", "sheer", 3.2, 92, 60)
  ];

  // lib/catalog/seed-rates.ts
  var SEED_RATES = [
    { currency: "USD", rateCny: 6.766, rateDate: "2026-06-01", source: "Bank of China" },
    { currency: "AUD", rateCny: 4.8592, rateDate: "2026-06-01", source: "Bank of China" }
  ];

  // lib/catalog/labels.ts
  var FAMILY_LABEL = {
    pinch: { en: "Pinch pleat", zh: "\u634F\u8936" },
    ripple: { en: "Ripple Fold", zh: "\u86C7\u5F62\u5E18" },
    knife: { en: "Knife pleat", zh: "\u5200\u8936" },
    grommet: { en: "Grommet", zh: "\u6253\u5B54" }
  };
  var PINCH_GROUP = [
    { zh: "\u53CC\u8936", en: "Two-finger", styles: ["double-pinch", "euro-double"] },
    { zh: "\u4E09\u8936", en: "Three-finger", styles: ["triple-pinch", "euro-triple"] },
    { zh: "\u5DE5\u5B57\u8936", en: "Box pleat", styles: ["evo", "inverted"] },
    { zh: "X-Pleat", en: "X-Pleat", styles: ["x-pleat"] },
    { zh: "Goblet", en: "Goblet", styles: ["goblet"] }
  ];
  var PINCH_LABEL = {
    "double-pinch": { en: "Double Pinch", zh: "\u53CC\u8936" },
    "euro-double": { en: "Euro Double", zh: "\u6B27\u5F0F\u53CC\u8936" },
    "triple-pinch": { en: "Triple Pinch", zh: "\u4E09\u8936" },
    "euro-triple": { en: "Euro Triple", zh: "\u6B27\u5F0F\u4E09\u8936" },
    evo: { en: "EVO", zh: "\u5DE5\u5B57\u8936 EVO" },
    inverted: { en: "Inverted", zh: "\u5012\u7F6E\u5DE5\u5B57\u8936" },
    "x-pleat": { en: "X-Pleat", zh: "X \u8936" },
    goblet: { en: "Goblet", zh: "\u676F\u72B6\u8936" }
  };
  var TAPE_LABEL = {
    rivet: { en: "Rivet tape", zh: "\u94C6\u9489\u5E26" },
    mesh: { en: "Mesh tape", zh: "\u7F51\u683C\u5E26" }
  };
  var ORIENTATION_LABEL = {
    "fixed-height": { en: "Fixed height", zh: "\u5B9A\u9AD8" },
    "fixed-width": { en: "Fixed width", zh: "\u5B9A\u5BBD" }
  };
  var CATEGORY_LABEL = {
    blackout: { en: "Drape / Blackout", zh: "\u5E03\u5E18/\u906E\u5149\u5E18" },
    sheer: { en: "Sheer", zh: "\u7EB1\u5E18" }
  };
  var LINING_LABEL = {
    none: { en: "No lining", zh: "\u65E0\u91CC\u5E03" },
    "full-blackout": { en: "Full blackout lining", zh: "\u5168\u906E\u5149\u91CC\u5E03" },
    standard: { en: "Standard lining", zh: "\u666E\u901A\u91CC\u5E03" }
  };
  var TOP_LABEL = {
    none: { en: "No top fold", zh: "\u4E0A\u53E3\u4E0D\u6253\u6298" },
    "fold-8": { en: "8 cm top fold", zh: "\u4E0A\u53E3\u6298 8 \u5398\u7C73" }
  };
  var DRAW_LABEL = {
    "single-left": { en: "Single, stack left", zh: "\u5355\u5F00\u5411\u5DE6" },
    "single-right": { en: "Single, stack right", zh: "\u5355\u5F00\u5411\u53F3" },
    double: { en: "Double", zh: "\u53CC\u5F00" }
  };
  var HEM_LABEL = {
    "8+2": { en: "8+2 cm", zh: "\u4E0B\u6446 8+2" },
    "8+8": { en: "8+8 cm", zh: "\u4E0B\u6446 8+8" },
    "7+7": { en: "7+7 cm", zh: "\u4E0B\u6446 7+7" },
    "2+2": { en: "2+2 double fold", zh: "2+2 \u53CC\u6298" },
    lead: { en: "Lead cord", zh: "\u94C5\u7EF3" }
  };
  var TIEBACK_LABEL = {
    none: { en: "None", zh: "\u65E0\u7ED1\u5E26" },
    standard: { en: "Standard", zh: "\u666E\u901A\u7ED1\u5E26" },
    japanese: { en: "Japanese", zh: "\u65E5\u5F0F\u7ED1\u5E26" },
    custom: { en: "Custom", zh: "\u5B9A\u5236\u7ED1\u5E26" }
  };
  var HARDWARE_LABEL = {
    customer: { en: "Customer-supplied track", zh: "\u5BA2\u6237\u81EA\u5907\u8F68\u9053" },
    "manual-track": { en: "LAN QUEEN manual track, white only", zh: "\u5170\u5BA2\u5385\u624B\u52A8\u8F68\uFF0C\u4EC5\u767D\u8272" },
    "roman-rod": { en: "Roman rod, manual", zh: "\u7F57\u9A6C\u6746\uFF0C\u4EC5\u624B\u52A8" },
    "electric-track": { en: "Motorized white track, remote only", zh: "\u7535\u52A8\u767D\u8F68\uFF0C\u4EC5\u9065\u63A7" }
  };
  var ROD_LABEL = {
    black: { en: "Black", zh: "\u9ED1\u8272" },
    white: { en: "White", zh: "\u767D\u8272" },
    champagne: { en: "Champagne gold", zh: "\u9999\u69DF\u91D1" }
  };
  var UNIT_LABEL = {
    m: { en: "Metre", zh: "\u7C73" },
    in: { en: "Inch", zh: "\u82F1\u5BF8" },
    yd: { en: "Yard", zh: "\u7801" }
  };
  function headingSummary(input) {
    if (input.headingFamily === "pinch" && input.pinchStyle) return PINCH_LABEL[input.pinchStyle];
    if (input.headingFamily === "ripple" && input.rippleTape) {
      return {
        en: `Ripple Fold \xB7 ${TAPE_LABEL[input.rippleTape].en}`,
        zh: `\u86C7\u5F62\u5E18 \xB7 ${TAPE_LABEL[input.rippleTape].zh}`
      };
    }
    return FAMILY_LABEL[input.headingFamily];
  }
  return __toCommonJS(static_entry_exports);
})();

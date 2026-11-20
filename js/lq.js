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
    CATALOG_PLAN: () => CATALOG_PLAN,
    CUT_FABRIC_LABEL: () => CUT_FABRIC_LABEL,
    ESTIMATE_MARK: () => ESTIMATE_MARK,
    INPUT_LIMITS: () => INPUT_LIMITS,
    NOT_A_QUOTE: () => NOT_A_QUOTE,
    computeWindow: () => computeWindow,
    HEADING_LABEL: () => HEADING_LABEL,
    HEADING_ORDER: () => HEADING_ORDER,
    headingSummary: () => headingSummary,
    normaliseHeading: () => normaliseHeading,
    LINING_PRICING: () => LINING_PRICING,
    parseColorSpec: () => parseColorSpec,
    COM_NOTE: () => COM_NOTE,
    DEFAULTS_NOTE: () => DEFAULTS_NOTE,
    FREIGHT_NOTE: () => FREIGHT_NOTE,
    PASTE_COLUMNS: () => PASTE_COLUMNS,
    REFERENCE_MARK: () => REFERENCE_MARK,
    WIZARD_STEP_FIELDS: () => WIZARD_STEP_FIELDS,
    findFabric: () => findFabric,
    matchModel: () => matchModel,
    normaliseDraw: () => normaliseDraw,
    parseHookHeight: () => parseHookHeight,
    FREIGHT_NOTES: () => FREIGHT_NOTES,
    parsePaste: () => parsePaste,
    quoteFreight: () => quoteFreight,
    reviewIssues: () => reviewIssues,
    parseDecimal: () => parseDecimal,
    recomputeOrder: () => recomputeOrder,
    resolveFabric: () => resolveFabric,
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
  var HEADING_LABEL = {
    x_pleat: { en: "X-Pleat", zh: "\u4EA4\u53C9\u8936\uFF08\u5341\u5B57\u8936\uFF09", rule: "pleat", extraPleat: false },
    double_pinch: { en: "Double Pinch Pleat", zh: "\u53CC\u8936", rule: "pleat", extraPleat: false },
    triple_pinch: { en: "Triple Pinch Pleat", zh: "\u4E09\u8936", rule: "pleat", extraPleat: false },
    euro_double: { en: "Euro Double Pleat", zh: "\u6B27\u5F0F\u53CC\u8936", rule: "pleat", extraPleat: false },
    euro_triple: { en: "Euro Triple Pleat", zh: "\u6B27\u5F0F\u4E09\u8936", rule: "pleat", extraPleat: false },
    inverted: { en: "Inverted Pleat", zh: "\u5DE5\u5B57\u8936", rule: "pleat", extraPleat: true },
    goblet: { en: "Goblet Pleat", zh: "\u9152\u676F\u8936", rule: "pleat", extraPleat: false },
    ripple_fold: { en: "Ripple Fold", zh: "\u86C7\u5F62", rule: "ripple", extraPleat: false },
    evo: { en: "EVO Pleat", zh: "EVO\u8936 (Inverted Pleat variant)", rule: "pleat", extraPleat: true },
    knife: { en: "Knife Pleat", zh: "\u5200\u578B\u8936", rule: "knife", extraPleat: false },
    grommet: { en: "Grommet / Eyelet", zh: "\u6253\u5B54", rule: "grommet", extraPleat: false }
  };
  var HEADING_ORDER = ["x_pleat", "double_pinch", "triple_pinch", "euro_double", "euro_triple", "inverted", "goblet", "ripple_fold", "evo", "knife", "grommet"];
  var HEADING_ALIAS = {
    xpleat: "x_pleat",
    "\u4EA4\u53C9\u8936": "x_pleat",
    "\u5341\u5B57\u8936": "x_pleat",
    "\u4EA4\u53C9\u8936\u5341\u5B57\u8936": "x_pleat",
    "\u97E9\u8936": "x_pleat",
    "\u97E9\u6298": "x_pleat",
    koreanpleat: "x_pleat",
    doublepinch: "double_pinch",
    doublepinchpleat: "double_pinch",
    "\u53CC\u8936": "double_pinch",
    twofinger: "double_pinch",
    triplepinch: "triple_pinch",
    triplepinchpleat: "triple_pinch",
    "\u4E09\u8936": "triple_pinch",
    threefinger: "triple_pinch",
    eurodouble: "euro_double",
    eurodoublepleat: "euro_double",
    "\u6B27\u5F0F\u53CC\u8936": "euro_double",
    eurotriple: "euro_triple",
    eurotriplepleat: "euro_triple",
    "\u6B27\u5F0F\u4E09\u8936": "euro_triple",
    inverted: "inverted",
    invertedpleat: "inverted",
    "\u5DE5\u5B57\u8936": "inverted",
    "\u5012\u7F6E\u5DE5\u5B57\u8936": "inverted",
    boxpleat: "inverted",
    goblet: "goblet",
    gobletpleat: "goblet",
    "\u9152\u676F\u8936": "goblet",
    "\u676F\u72B6\u8936": "goblet",
    ripple: "ripple_fold",
    ripplefold: "ripple_fold",
    swave: "ripple_fold",
    sfold: "ripple_fold",
    "\u86C7\u5F62": "ripple_fold",
    "\u86C7\u5F62\u5E18": "ripple_fold",
    "\u5929\u9645\u5E18": "ripple_fold",
    grommet: "grommet",
    grommeteyelet: "grommet",
    eyelet: "grommet",
    eyelets: "grommet",
    "\u6253\u5B54": "grommet",
    "\u9E21\u76EE\u73AF": "grommet",
    evo: "evo",
    knife: "knife",
    knifepleat: "knife",
    "\u5200\u8936": "knife",
    "\u5200\u578B\u8936": "knife"
  };
  function headingToken(value) {
    return String(value || "").replace(/[\s\u3000\u00A0]+/g, "").replace(/[()（）【】\[\]{}，,。．.、·・/\\_\-—–~～'"`]+/g, "").toLowerCase();
  }
  function classifyHeading(value) {
    if (value == null || String(value).trim() === "") return { type: "empty" };
    if (HEADING_LABEL[value]) return { type: "key", key: value, source: String(value) };
    const token = headingToken(value);
    const raw = String(value);
    if (!token) return { type: "empty" };
    if (HEADING_ALIAS[token]) return { type: "key", key: HEADING_ALIAS[token], source: raw };
    if (token.indexOf("\u5929\u9645\u5E18") !== -1) return { type: "key", key: "ripple_fold", source: raw };
    if (token.indexOf("\u9E21\u76EE\u73AF") !== -1) return { type: "key", key: "grommet", source: raw };
    if (token === "pinch" || token === "pinchpleat" || token === "\u634F\u8936") return { type: "bare-pinch" };
    return { type: "unknown", source: raw };
  }
  function normaliseHeading(input) {
    const source = input || {};
    const fromHeading = classifyHeading(source.heading);
    const fromStyle = classifyHeading(source.pinchStyle);
    const fromFamily = classifyHeading(source.headingFamily);
    const picked = fromHeading.type === "key" ? fromHeading : fromStyle.type === "key" ? fromStyle : fromFamily.type === "key" ? fromFamily : null;
    if (picked) {
      const spec = HEADING_LABEL[picked.key];
      return { key: picked.key, en: spec.en, zh: spec.zh, rule: spec.rule, extraPleat: !!spec.extraPleat, pending: null, source: picked.source };
    }
    const bare = fromHeading.type === "bare-pinch" || fromFamily.type === "bare-pinch" || fromStyle.type === "bare-pinch";
    if (bare) return { key: null, en: null, zh: null, rule: "pleat", extraPleat: false, pending: "bare-pinch", source: source.heading || source.headingFamily || "pinch" };
    return { key: null, en: null, zh: null, rule: null, extraPleat: false, pending: "unknown", source: String(source.heading || source.pinchStyle || source.headingFamily || "") };
  }
  var PITCHES = /* @__PURE__ */ new Set([5.4, 6, 7, 8, 9, 10]);
  var FOLDS = /* @__PURE__ */ new Set([22, 24, 30]);
  var UNIT_TO_CM = { mm: 0.1, cm: 1, m: 100, in: 2.54, yd: 91.44 };
  function toCm(value, unit) {
    const factor = UNIT_TO_CM[unit];
    if (!factor || !Number.isFinite(value)) return NaN;
    return roundCm(value * factor);
  }
  function normaliseDraw(value) {
    if (value === "single-left" || value === "single-right" || value === "double") return value;
    const text = String(value || "").trim().toLowerCase().replace(/[_/,-]+/g, " ").replace(/\s+/g, " ");
    if (text === "one way left" || text === "oneway left" || text === "left") return "single-left";
    if (text === "one way right" || text === "oneway right" || text === "right") return "single-right";
    if (text === "centre open" || text === "center open" || text === "centre opening" || text === "center opening" || text === "centre" || text === "center" || text === "double") return "double";
    return value;
  }
  function parseDecimal(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (value == null) return null;
    let text = String(value).trim().replace(/\s+/g, "");
    if (text === "") return null;
    if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) text = text.replace(/,/g, "");
    else if (/^[+-]?\d+,\d+$/.test(text)) text = text.replace(",", ".");
    if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return NaN;
    return Number(text);
  }
  var INPUT_LIMITS = {
    widthM: { min: 0.3, max: 12 },
    heightM: { min: 0.3, max: 6 },
    returnCm: { min: 0, max: 30 },
    overlapCm: { min: 0, max: 30 },
    quantity: { min: 1, max: 99 },
    colorNumber: { min: 1, max: 99 }
  };
  function formatLimit(n) {
    return String(Math.round(n * 100) / 100);
  }
  function limitsInUnit(rangeM, unit) {
    const toUnit = unit === "mm" ? 1000 : unit === "cm" ? 100 : unit === "in" ? 1 / 0.0254 : unit === "yd" ? 1 / 0.9144 : 1;
    return { min: formatLimit(rangeM.min * toUnit), max: formatLimit(rangeM.max * toUnit), toUnit };
  }
  var FREIGHT_NOTE = "Reference freight, subject to actual quote / \u53C2\u8003\u8FD0\u8D39\uFF0C\u4EE5\u5B9E\u9645\u62A5\u4EF7\u4E3A\u51C6";
  var FREIGHT_NOTES = [
    "Remote areas carry an extra remote-area surcharge. / \u504F\u8FDC\u5730\u533A\u53E6\u52A0\u504F\u8FDC\u9644\u52A0\u8D39\u3002",
    "Packaging weight is included. / \u5305\u88C5\u91CD\u91CF\u5DF2\u8BA1\u5165\u3002",
    "Sheers are light and are charged by volumetric weight. / \u7EB1\u5E18\u8F83\u8F7B\uFF0C\u6309\u4F53\u79EF\u91CD\u91CF\u8BA1\u8D39\u3002"
  ];
  var DEFAULTS_NOTE = "Defaults applied, please confirm";
  var COM_NOTE = "Ship fabric after order confirmation; label parcel with order no. + location; lead time starts after fabric inspection; shortage/defects are the sender's responsibility.";
  function modelKey(value) {
    return String(value || "").trim().toLowerCase().replace(/[\s\u3000\u00A0_\-]+/g, "");
  }
  function matchModel(list, query) {
    const key = modelKey(query);
    if (!key) return { status: "empty" };
    const models = list || [];
    const hits = models.filter((item) => modelKey(item.model) === key || modelKey(item.id) === key);
    if (hits.length === 1) return { status: "ok", entry: hits[0] };
    if (hits.length > 1) return { status: "ambiguous" };
    const versions = models.filter((item) => modelKey(item.version) === key);
    if (versions.length) return { status: "version", en: "use the fabric model name, e.g. Masal", zh: "\u8BF7\u586B\u5199\u9762\u6599\u578B\u53F7\uFF0C\u4F8B\u5982 Masal" };
    return { status: "missing" };
  }
  function findFabric(list, model, colorNumber) {
    const matched = matchModel(list, model);
    if (!matched || matched.status !== "ok") return null;
    return resolveFabric(matched.entry, colorNumber);
  }
  function parseHookHeight(value, unit) {
    if (value == null || value === "") return { mm: null, entered: "" };
    const text = String(value).trim();
    const matched = text.match(/^([+-]?(?:\d+(?:[.,]\d+)?|\.\d+))\s*(mm|cm|\u6BEB\u7C73|\u5398\u7C73)?$/i);
    if (!matched) return { mm: null, entered: text };
    const n = parseDecimal(matched[1]);
    if (!Number.isFinite(n)) return { mm: null, entered: text };
    const chosen = String(matched[2] || unit || "mm").toLowerCase();
    const mm = chosen === "cm" || chosen === "\u5398\u7C73" ? Math.round(n * 1000) / 100 : n;
    return { mm, entered: text };
  }
  var PASTE_COLUMNS = [
    { key: "location", header: "Location" },
    { key: "width", header: "Width" },
    { key: "height", header: "Height" },
    { key: "unit", header: "Unit" },
    { key: "draw", header: "Draw" },
    { key: "model", header: "Model" },
    { key: "colourNo", header: "Colour No." },
    { key: "widthBasis", header: "Width basis" },
    { key: "quantity", header: "Quantity" },
    { key: "hookHeight", header: "Hook Height" },
    { key: "hookSpec", header: "Hook spec" }
  ];
  var WIZARD_STEP_FIELDS = [
    ["name", "fabricId", "colorNumber", "quantity"],
    ["width", "height", "unit", "widthBasis"],
    ["heading"],
    ["draw"],
    ["fabricPerPleat"],
    ["hem"],
    ["return", "overlap"],
    ["tieback", "hardware"]
  ];
  function normaliseBasis(value) {
    const text = String(value || "").trim().toLowerCase();
    if (text === "track" || text === "\u8F68\u9053" || text === "\u8F68\u9053\u5BBD") return "track";
    if (text === "finished" || text === "\u6210\u54C1" || text === "\u6210\u54C1\u5BBD") return "finished";
    return "";
  }
  function parsePaste(text, options) {
    const opts = options || {};
    const header = PASTE_COLUMNS.map((column) => column.header).join("\t");
    const example = "Living room\t2.4\t2.6\tm\tdouble\tMasal\t\ttrack\t1\t35mm\t89\u94A9";
    const errors = [];
    if (opts.orderWidthBasis !== "track" && opts.orderWidthBasis !== "finished") {
      errors.push({ code: "order-width-basis", en: "Choose Track or Finished width for the order before pasting.", zh: "\u7C98\u8D34\u524D\u8BF7\u5148\u9009\u62E9\u6574\u5355\u7684\u8F68\u9053\u5BBD\u6216\u6210\u54C1\u5BBD\u3002" });
      return { rows: [], errors, header, example };
    }
    const rows = [];
    String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
      const cells = line.split("\t");
      if (String(cells[0] || "").trim().toLowerCase() === "location") return;
      const get = (index) => cells[index] == null ? "" : String(cells[index]).trim();
      const modelText = get(5);
      const matched = matchModel(opts.catalog || [], modelText);
      rows.push({
        location: get(0),
        name: get(0) || "Window",
        width: get(1),
        height: get(2),
        unit: get(3) || "mm",
        draw: normaliseDraw(get(4) || "double"),
        fabricId: matched.status === "ok" ? matched.entry.id : (matched.status === "version" ? "" : modelText),
        modelError: matched.status === "version" ? matched.en : "",
        colorNumber: get(6),
        widthBasis: normaliseBasis(get(7)) || opts.orderWidthBasis,
        quantity: get(8) || "1",
        hookHeight: get(9),
        hookSpec: get(10),
        fabricPerPleat: opts.orderFilm || ""
      });
    });
    return { rows, errors, header, example };
  }
  function reviewIssues(input, result, fabric, modelError, catalog) {
    const issues = [];
    let note = modelError || "";
    if (!note && input && input.fabricId && !fabric) {
      const matched = catalog ? matchModel(catalog, input.fabricId) : null;
      note = matched && matched.en ? matched.en : "use the fabric model name, e.g. Masal";
    }
    if (note) issues.push({ en: note, zh: note === "use the fabric model name, e.g. Masal" ? "\u8BF7\u586B\u5199\u9762\u6599\u578B\u53F7\uFF0C\u4F8B\u5982 Masal" : "\u8BF7\u4FEE\u6B63\u8FD9\u4E00\u884C" });
    if (!result) {
      issues.push({ en: "Enter width and height", zh: "\u8BF7\u586B\u5199\u5BBD\u548C\u9AD8" });
      return issues;
    }
    (result.errors || []).forEach((error) => {
      if (error.code === "fpp") issues.push({ en: "Please select film", zh: "\u8BF7\u9009\u7EB8\u819C" });
      else issues.push({ en: error.en, zh: error.zh });
    });
    if (!(result.pricing && Number.isFinite(result.pricing.lineCny)) && !issues.some((issue) => issue.en === "Please select film")) {
      issues.push({ en: "Please select film", zh: "\u8BF7\u9009\u7EB8\u819C" });
    }
    return issues;
  }
  function quoteFreight(country, weightKg, currency, rate, table) {
    const book = table || { rates: [] };
    const key = String(country || "").trim().toLowerCase();
    const band = (book.rates || []).find((row) => (row.match || []).some((name) => String(name).trim().toLowerCase() === key));
    const notes = book.notes || FREIGHT_NOTES;
    const label = book.label || FREIGHT_NOTE;
    if (!band) {
      return { status: "quote", label, notes, cnyPerKg: null, cny: null, foreign: null, inOrderTotal: false };
    }
    const weight = weightKg == null || weightKg === "" ? null : Number(weightKg);
    if (!(weight > 0)) {
      return { status: "rate", label, notes, cnyPerKg: band.cnyPerKg, cny: null, foreign: null, inOrderTotal: false };
    }
    const cny = round2(weight * band.cnyPerKg);
    const rateCny = rate && rate.rateCny ? Number(rate.rateCny) : null;
    const foreign = currency && currency !== "CNY" && rateCny ? round2(cny / rateCny) : null;
    return { status: "reference", label, notes, cnyPerKg: band.cnyPerKg, weightKg: weight, cny, foreign, currency: currency || "CNY", inOrderTotal: false };
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
  var CUT_FABRIC_LABEL = "\u6563\u526A\u9762\u6599\u4EF7 Cut Fabric Price";
  var ESTIMATE_MARK = "\u5F85\u786E\u8BA4/\u4F30\u7B97 To be confirmed / estimate";
  var REFERENCE_MARK = "Reference only / \u53C2\u8003\u4EF7";
  var NOT_A_QUOTE = {
    en: "Reference price (BOC conversion rate)",
    zh: "\u53C2\u8003\u4EF7\uFF08\u4E2D\u884C\u6298\u7B97\u4EF7\uFF09"
  };
  var LINING_PRICING = {
    usageMode: "same-as-face",
    usageFactor: 1,
    priceBasis: "finished",
    catalogId: "endura",
    fixedCnyPerM: 0,
    cloth: {
      model: "Endura",
      version: "B01",
      widthM: 2.8,
      widthCm: 280,
      finishedCNY: 82.5,
      fabricCNY: 52,
      blackout: "100%",
      colours: ["white", "beige"]
    }
  };
  var LINING_IDS = ["none", "endura-white", "endura-beige"];
  function versionSpan(prefix, from, to) {
    const list = [];
    for (let i = from; i <= to; i++) list.push(prefix + String(i).padStart(2, "0"));
    return list;
  }
  var CATALOG_PLAN = {
    shape: "{ version, model, category, widthM, colorTiers: [{ colors, finishedCNY, fabricCNY }] }",
    categories: {
      fabric: { en: "Fabric", zh: "\u9762\u6599", versions: versionSpan("F", 1, 45) },
      blackout: { en: "Blackout", zh: "\u906E\u5149", versions: versionSpan("B", 1, 5) },
      sheer: { en: "Sheer", zh: "\u7EB1", versions: versionSpan("S", 1, 17) }
    }
  };
  function parseColorSpec(spec) {
    const out = [];
    String(spec == null ? "" : spec).split(/[,，]/).forEach((part) => {
      const text = part.trim();
      if (!text) return;
      const range = text.match(/^(\d+)\s*[-–—~到至]\s*(\d+)$/);
      if (range) {
        let a = Number(range[1]);
        let b = Number(range[2]);
        if (a > b) {
          const swap = a;
          a = b;
          b = swap;
        }
        for (let i = a; i <= b; i++) if (!out.includes(i)) out.push(i);
        return;
      }
      if (/^\d+$/.test(text)) {
        const n = Number(text);
        if (!out.includes(n)) out.push(n);
      }
    });
    return out;
  }
  function resolveFabric(entry, colorNumber) {
    if (!entry) return null;
    const category = String(entry.category || "").toLowerCase();
    const widthM = entry.widthM != null ? Number(entry.widthM) : (Number(entry.widthCm) || 0) / 100;
    const widthCm = entry.widthCm != null ? Number(entry.widthCm) : Math.round(widthM * 100);
    const model = entry.model || entry.nameEn || entry.id;
    const base = {
      id: entry.id || String(model || "fabric").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      category,
      model,
      nameEn: entry.nameEn || model,
      nameZh: entry.nameZh || model,
      version: entry.version || "",
      widthCm,
      widthM
    };
    const tiers = Array.isArray(entry.colorTiers) ? entry.colorTiers : null;
    if (tiers && tiers.length) {
      const parsed = parseDecimal(colorNumber);
      if (parsed == null || !Number.isFinite(parsed)) {
        return Object.assign({}, base, {
          colorTiers: tiers,
          unresolved: true,
          reason: "missing",
          priceCnyPerM: null,
          finishedPriceCnyPerM: null,
          fabricPriceCnyPerM: null,
          colorNumber: null,
          colorTier: null
        });
      }
      const tier = tiers.find((item) => parseColorSpec(item.colors).includes(parsed));
      if (!tier) {
        return Object.assign({}, base, {
          colorTiers: tiers,
          unresolved: true,
          reason: "nomatch",
          priceCnyPerM: null,
          finishedPriceCnyPerM: null,
          fabricPriceCnyPerM: null,
          colorNumber: parsed,
          colorTier: null
        });
      }
      const tierWidthM = tier.widthM != null ? Number(tier.widthM) : widthM;
      return Object.assign({}, base, {
        widthM: tierWidthM,
        widthCm: tier.widthCm != null ? Number(tier.widthCm) : Math.round(tierWidthM * 100),
        colorTiers: tiers,
        unresolved: false,
        reason: null,
        colorNumber: parsed,
        colorTier: tier.colors,
        priceCnyPerM: Number(tier.finishedCNY),
        finishedPriceCnyPerM: Number(tier.finishedCNY),
        fabricPriceCnyPerM: tier.fabricCNY == null ? null : Number(tier.fabricCNY)
      });
    }
    const finished = entry.finishedPriceCnyPerM != null ? entry.finishedPriceCnyPerM : entry.priceCnyPerM;
    const colorParsed = colorNumber == null || colorNumber === "" ? null : parseDecimal(colorNumber);
    return Object.assign({}, base, {
      colorTiers: null,
      unresolved: false,
      reason: null,
      colorNumber: Number.isFinite(colorParsed) ? colorParsed : null,
      colorTier: null,
      priceCnyPerM: finished == null ? null : Number(finished),
      finishedPriceCnyPerM: finished == null ? null : Number(finished),
      fabricPriceCnyPerM: entry.fabricPriceCnyPerM == null ? null : Number(entry.fabricPriceCnyPerM)
    });
  }
  function liningSettings(rules) {
    const cfg = Object.assign({}, LINING_PRICING, rules && rules.liningPricing || {});
    const cloth = Object.assign({}, LINING_PRICING.cloth, cfg.cloth || {});
    const list = rules && rules.catalog;
    if (Array.isArray(list)) {
      const row = list.find((item) => item.id === (cfg.catalogId || "endura") || item.model === "Endura" && String(item.category || "").toLowerCase() === "blackout");
      if (row) {
        const resolved = resolveFabric(row, null);
        if (resolved && resolved.finishedPriceCnyPerM != null) {
          cloth.finishedCNY = Number(resolved.finishedPriceCnyPerM);
          if (resolved.fabricPriceCnyPerM != null) cloth.fabricCNY = Number(resolved.fabricPriceCnyPerM);
          cloth.widthM = resolved.widthM;
          cloth.widthCm = resolved.widthCm;
          cloth.version = resolved.version || cloth.version;
          cloth.model = resolved.model || cloth.model;
          cloth.fromCatalog = true;
        }
      }
    }
    return { cfg, cloth };
  }
  function quoteLining(input, faceMetersPerPiece, qty, rules) {
    const settings = liningSettings(rules);
    const cfg = settings.cfg;
    const cloth = settings.cloth;
    const id = input.lining || "none";
    if (id === "none") {
      return {
        id: "none",
        usageMeters: 0,
        usageMetersPriced: 0,
        cny: 0,
        cnyPerPiece: 0,
        pending: false,
        priced: false,
        basis: "none",
        rate: null,
        label: null,
        cloth
      };
    }
    const factor = cfg.usageMode === "factor" ? Number(cfg.usageFactor) : 1;
    const usageMeters = round3((Number(faceMetersPerPiece) || 0) * (Number.isFinite(factor) ? factor : 1));
    const usageMetersPriced = round3(usageMeters * (qty > 0 ? qty : 0));
    const basis = cfg.priceBasis || "none";
    if (basis === "none") {
      return {
        id,
        usageMeters,
        usageMetersPriced,
        cny: 0,
        cnyPerPiece: 0,
        pending: true,
        priced: false,
        basis,
        rate: null,
        label: null,
        cloth
      };
    }
    let rate = 0;
    if (basis === "finished") rate = Number(cloth.finishedCNY) || 0;
    else if (basis === "cut") rate = Number(cloth.fabricCNY) || 0;
    else if (basis === "fixed") rate = Number(cfg.fixedCnyPerM) || 0;
    return {
      id,
      usageMeters,
      usageMetersPriced,
      cny: round2(usageMetersPriced * rate),
      cnyPerPiece: round2(usageMeters * rate),
      pending: false,
      priced: true,
      basis,
      rate,
      label: null,
      cloth
    };
  }
  function recomputeOrder(order, catalog, ratesOrFile) {
    const rates = Array.isArray(ratesOrFile) ? ratesOrFile : ratesOrFile && ratesOrFile.rates || [];
    const diffs = [];
    function compare(index, field, next, prev) {
      if (prev == null || next == null) return;
      const a = Number(next);
      const b = Number(prev);
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        if (String(next) !== String(prev)) diffs.push({ index, field, pasted: prev, recomputed: next });
        return;
      }
      if (Math.abs(a - b) > 0.001) diffs.push({ index, field, pasted: prev, recomputed: next });
    }
    const windows = (order.windows || []).map((item, index) => {
      const input = item.input || {};
      const entry = (catalog || []).find((row) => row.id === input.fabricId);
      const fabric = resolveFabric(entry, input.colorNumber);
      const result = computeWindow(input, fabric, Object.assign({}, DEFAULT_RULES, { catalog: catalog || [] }), DEFAULT_HARDWARE_PRICES);
      const pasted = item.result || {};
      const pastedPrice = pasted.pricing || {};
      compare(index, "usageMetersPerPiece", result.usageMetersPerPiece, pasted.usageMetersPerPiece);
      compare(index, "usageMetersPriced", result.usageMetersPriced, pasted.usageMetersPriced);
      compare(index, "cutWidthCm", result.cutWidthCm, pasted.cutWidthCm);
      compare(index, "fullnessDisplay", result.fullnessDisplay, pasted.fullnessDisplay);
      compare(index, "curtainCny", result.pricing.curtainCny, pastedPrice.curtainCny);
      compare(index, "trackCny", result.pricing.trackCny, pastedPrice.trackCny);
      compare(index, "motorCny", result.pricing.motorCny, pastedPrice.motorCny);
      compare(index, "tiebackCny", result.pricing.tiebackCny, pastedPrice.tiebackCny);
      compare(index, "liningCny", result.pricing.liningCny, pastedPrice.liningCny);
      compare(index, "lineCny", result.pricing.lineCny, pastedPrice.lineCny);
      if (item.fabric && fabric) {
        compare(index, "finishedPriceCnyPerM", fabric.priceCnyPerM, item.fabric.priceCnyPerM != null ? item.fabric.priceCnyPerM : item.fabric.finishedPriceCnyPerM);
        compare(index, "cutFabricCnyPerM", fabric.fabricPriceCnyPerM, item.fabric.fabricPriceCnyPerM);
      }
      if (!entry) diffs.push({ index, field: "fabric", pasted: input.fabricId || null, recomputed: null });
      return { input, result, fabric };
    });
    const cnyTotal = round2(windows.reduce((sum, item) => sum + (item.result.pricing.lineCny || 0), 0));
    compare(-1, "cnyTotal", cnyTotal, order.cnyTotal);
    const currency = order.currency || order.customer && order.customer.currency || "CNY";
    const quote = rates.find((rate) => rate.currency === currency) || null;
    const settlement = settle(cnyTotal, currency, quote, null);
    if (order.settlement && order.settlement.foreign != null && settlement.foreign != null) {
      compare(-1, "foreign", settlement.foreign, order.settlement.foreign);
    }
    return { order: Object.assign({}, order, { cnyTotal, settlement, windows, recomputeDiffs: diffs }), diffs };
  }
  function computeWindow(input, fabric, rules, prices) {
    const errors = [];
    const warnings = [];
    const limits = rules.inputLimits || INPUT_LIMITS;
    if (fabric && Array.isArray(fabric.colorTiers) && fabric.colorTiers.length && fabric.unresolved == null && fabric.priceCnyPerM == null) {
      fabric = resolveFabric(fabric, input.colorNumber);
    }
    const unitOk = Object.prototype.hasOwnProperty.call(UNIT_TO_CM, input.unit);
    const widthBasis = input.widthBasis === "finished" || input.widthBasis === "track" ? input.widthBasis : "";
    const draw = normaliseDraw(input.draw);
    const widthValue = parseDecimal(input.width);
    const heightValue = parseDecimal(input.height);
    const leftValue = parseDecimal(input.leftWidth);
    const rightValue = parseDecimal(input.rightWidth);
    const returnValue = parseDecimal(input.returnCm);
    const overlapValue = parseDecimal(input.overlapCm);
    const qtyValue = parseDecimal(input.quantity);
    const isDouble = draw === "double";
    const panelCount = isDouble ? 2 : 1;
    const split = isDouble && Number.isFinite(leftValue) && Number.isFinite(rightValue) && leftValue > 0 && rightValue > 0;
    let widthCm = 0;
    let panelWidths = [0];
    if (unitOk && split) {
      panelWidths = [toCm(leftValue, input.unit), toCm(rightValue, input.unit)];
      widthCm = roundCm(panelWidths[0] + panelWidths[1]);
    } else if (unitOk && Number.isFinite(widthValue)) {
      widthCm = toCm(widthValue, input.unit);
      panelWidths = isDouble ? [roundCm(widthCm / 2), roundCm(widthCm / 2)] : [widthCm];
    } else {
      panelWidths = Array.from({ length: panelCount }, () => 0);
    }
    const unequal = split && Math.abs(panelWidths[0] - panelWidths[1]) > 0.05;
    if (isDouble && !split && widthCm > 0 && !input.equalSplitConfirmed) {
      warnings.push(msg("equal-split", "Equal split? Enter L/R widths if unequal.", "\u5BF9\u534A\u5F00\uFF1F\u4E0D\u7B49\u5206\u8BF7\u586B\u5199\u5DE6\u53F3\u5BBD\u3002", "leftWidth"));
    }
    const panelWidthCm = panelWidths[0] || 0;
    const heightCm = unitOk && Number.isFinite(heightValue) ? toCm(heightValue, input.unit) : 0;
    const heading = normaliseHeading(input);
    const family = heading.rule === "grommet" ? "grommet" : heading.rule === "ripple" ? "ripple" : heading.rule === "knife" ? "knife" : heading.rule === "pleat" ? "pinch" : (input.headingFamily || "");
    const fabricPerPleat = family === "grommet" ? rules.grommetFabricPerPleat : Number(input.fabricPerPleat);
    const hookSpacing = family === "ripple" || family === "knife" ? null : rules.hookSpacingDefaultCm;
    const pitch = family === "ripple" ? Number(input.gliderPitch ?? 6) : null;
    const hemUsageCm = rules.hemUsageCm[input.hem] ?? 0;
    const topUsageCm = input.topFinish === "fold-8" ? rules.topFoldCm : 0;
    const returnCm = Number.isFinite(returnValue) ? returnValue : 0;
    const overlapCm = Number.isFinite(overlapValue) ? overlapValue : 0;
    const includeExcess = widthBasis === "track";
    if (!widthBasis) {
      errors.push(msg("width-basis", "Choose Track width or Finished width for this row.", "\u8BF7\u4E3A\u8FD9\u4E00\u884C\u9009\u62E9\u8F68\u9053\u5BBD\u6216\u6210\u54C1\u5BBD\u3002", "widthBasis"));
    }
    const returnExcess = includeExcess ? Math.max(0, roundCm(returnCm - rules.returnBaselineCm)) : 0;
    const overlapExcess = includeExcess && isDouble ? Math.max(0, roundCm(overlapCm - rules.overlapBaselineCm)) : 0;
    if (!unitOk) {
      errors.push(msg("unit", "Choose mm, cm, metres, inches or yards.", "\u8BF7\u9009\u62E9\u6BEB\u7C73\u3001\u5398\u7C73\u3001\u7C73\u3001\u82F1\u5BF8\u6216\u7801\u3002", "unit"));
    } else {
      const widthBounds = limitsInUnit(limits.widthM, input.unit);
      const heightBounds = limitsInUnit(limits.heightM, input.unit);
      const widthWord = input.unit === "mm" ? ["mm", "\u6BEB\u7C73"] : input.unit === "cm" ? ["cm", "\u5398\u7C73"] : input.unit === "in" ? ["in", "\u82F1\u5BF8"] : input.unit === "yd" ? ["yd", "\u7801"] : ["m", "\u7C73"];
      const heightWord = widthWord;
      if (!split && (widthValue == null || !Number.isFinite(widthValue))) {
        errors.push(msg("width", widthBasis === "track" ? "Enter a track width." : "Enter a finished width.", widthBasis === "track" ? "\u8BF7\u586B\u5199\u8F68\u9053\u5BBD\u5EA6\u3002" : "\u8BF7\u586B\u5199\u6210\u54C1\u5BBD\u5EA6\u3002", "width"));
      } else if (widthCm < limits.widthM.min * 100 - 0.02 || widthCm > limits.widthM.max * 100 + 0.02) {
        errors.push(msg("width-range", `Width must be between ${widthBounds.min} and ${widthBounds.max} ${widthWord[0]}.`, `\u5BBD\u5EA6\u987B\u5728 ${widthBounds.min}\u2013${widthBounds.max} ${widthWord[1]}\u4E4B\u95F4\u3002`, "width"));
      }
      if (heightValue == null || !Number.isFinite(heightValue)) {
        errors.push(msg("height", "Enter a finished height.", "\u8BF7\u586B\u5199\u6210\u54C1\u9AD8\u5EA6\u3002", "height"));
      } else if (heightCm < limits.heightM.min * 100 - 0.02 || heightCm > limits.heightM.max * 100 + 0.02) {
        errors.push(msg("height-range", `Height must be between ${heightBounds.min} and ${heightBounds.max} ${heightWord[0]}.`, `\u9AD8\u5EA6\u987B\u5728 ${heightBounds.min}\u2013${heightBounds.max} ${heightWord[1]}\u4E4B\u95F4\u3002`, "height"));
      }
    }
    if (!input.name?.trim()) {
      errors.push(msg("name", "Name this window (room or location).", "\u8BF7\u586B\u5199\u7A97\u4F4D\u540D\u79F0\uFF08\u623F\u95F4\u6216\u4F4D\u7F6E\uFF09\u3002", "name"));
    }
    const com = input.fabricSource === "com";
    if (com) {
      const comWidth = parseDecimal(input.comWidthCm);
      fabric = {
        id: null,
        model: input.comModel || "Customer-supplied",
        nameEn: input.comModel || "Customer-supplied",
        nameZh: input.comModel || "\u5BA2\u4F9B\u9762\u6599",
        version: "COM",
        category: "com",
        widthCm: Number.isFinite(comWidth) ? comWidth : fabric && fabric.widthCm || 0,
        widthM: Number.isFinite(comWidth) ? comWidth / 100 : fabric && fabric.widthM || 0,
        priceCnyPerM: null,
        fabricPriceCnyPerM: null,
        unresolved: false,
        source: "com"
      };
      if (!(fabric.widthCm > 0)) errors.push(msg("com-width", "Enter the customer fabric width in centimetres.", "\u8BF7\u586B\u5199\u5BA2\u4F9B\u9762\u6599\u95E8\u5E45\uFF08\u5398\u7C73\uFF09\u3002", "comWidthCm"));
    } else if (!fabric) errors.push(msg("fabric", "Choose a fabric model.", "\u8BF7\u9009\u62E9\u9762\u6599\u578B\u53F7\u3002", "fabricId"));
    if (heading.pending === "bare-pinch") {
      errors.push(msg("pinch", "Choose a heading. Pinch on its own is not a style.", "\u8BF7\u9009\u62E9\u5E18\u5934\u3002\u5355\u72EC\u7684\u634F\u8936\u4E0D\u662F\u4E00\u79CD\u6837\u5F0F\u3002", "heading"));
    }
    if (family === "ripple" && !input.rippleTape) {
      errors.push(msg("tape", "Choose rivet tape or mesh tape.", "\u8BF7\u9009\u62E9\u94C6\u9489\u5E26\u6216\u7F51\u683C\u5E26\u3002", "rippleTape"));
    }
    if (family === "ripple" && (pitch === null || !PITCHES.has(pitch))) {
      errors.push(msg("pitch", "Choose a glider pitch.", "\u8BF7\u9009\u62E9\u6ED1\u8F6E\u95F4\u8DDD\u3002", "gliderPitch"));
    }
    const knifeMultiplier = fabricPerPleat === 22 ? 2.2 : fabricPerPleat === 30 ? 3 : null;
    if (family === "knife" && knifeMultiplier == null) {
      errors.push(msg("fpp", "Knife Pleat must use 22 cm (2.2\u00D7) or 30 cm (3.0\u00D7). There is no default.", "\u5200\u578B\u8936\u53EA\u80FD\u9009 22 \u5398\u7C73\uFF082.2 \u500D\uFF09\u6216 30 \u5398\u7C73\uFF083.0 \u500D\uFF09\uFF0C\u6CA1\u6709\u9ED8\u8BA4\u3002", "fabricPerPleat"));
    } else if (family !== "grommet" && family !== "knife" && !FOLDS.has(fabricPerPleat)) {
      errors.push(msg("fpp", "Fabric per fold must be 22, 24 or 30 cm. Choose one. There is no default.", "\u8936\u7528\u6599\u5FC5\u987B\u9009\u62E9 22\u300124 \u6216 30 \u5398\u7C73\uFF0C\u6CA1\u6709\u9ED8\u8BA4\u3002", "fabricPerPleat"));
    }
    if (qtyValue == null || !Number.isFinite(qtyValue) || !Number.isInteger(qtyValue) || qtyValue < limits.quantity.min || qtyValue > limits.quantity.max) {
      errors.push(msg("qty", `Quantity must be a whole number from ${limits.quantity.min} to ${limits.quantity.max}.`, `\u6570\u91CF\u987B\u4E3A ${limits.quantity.min}\u2013${limits.quantity.max} \u7684\u6574\u6570\u3002`, "quantity"));
    }
    if (returnValue != null && !Number.isFinite(returnValue)) {
      errors.push(msg("return", "Enter the return in centimetres.", "\u8BF7\u586B\u5199\u5305\u8FB9\uFF08\u5398\u7C73\uFF09\u3002", "return"));
    } else if (Number.isFinite(returnValue) && (returnValue < limits.returnCm.min || returnValue > limits.returnCm.max)) {
      errors.push(msg("return", `Return must be between ${limits.returnCm.min} and ${limits.returnCm.max} cm.`, `\u5305\u8FB9\u987B\u5728 ${limits.returnCm.min}\u2013${limits.returnCm.max} \u5398\u7C73\u4E4B\u95F4\u3002`, "return"));
    }
    if (isDouble && overlapValue != null && !Number.isFinite(overlapValue)) {
      errors.push(msg("overlap", "Enter the overlap in centimetres.", "\u8BF7\u586B\u5199\u91CD\u53E0\uFF08\u5398\u7C73\uFF09\u3002", "overlap"));
    } else if (isDouble && Number.isFinite(overlapValue) && (overlapValue < limits.overlapCm.min || overlapValue > limits.overlapCm.max)) {
      errors.push(msg("overlap", `Overlap must be between ${limits.overlapCm.min} and ${limits.overlapCm.max} cm.`, `\u91CD\u53E0\u987B\u5728 ${limits.overlapCm.min}\u2013${limits.overlapCm.max} \u5398\u7C73\u4E4B\u95F4\u3002`, "overlap"));
    }
    const colorValue = input.colorNumber == null || input.colorNumber === "" ? null : parseDecimal(input.colorNumber);
    if (colorValue != null && (!Number.isFinite(colorValue) || !Number.isInteger(colorValue) || colorValue < limits.colorNumber.min || colorValue > limits.colorNumber.max)) {
      errors.push(msg("color", `Colour number must be a whole number from ${limits.colorNumber.min} to ${limits.colorNumber.max}.`, `\u8272\u53F7\u987B\u4E3A ${limits.colorNumber.min}\u2013${limits.colorNumber.max} \u7684\u6574\u6570\u3002`, "colorNumber"));
    }
    if (fabric && fabric.unresolved) {
      errors.push(fabric.reason === "missing"
        ? msg("color", "Enter a colour number for this fabric.", "\u8BF7\u586B\u5199\u8BE5\u9762\u6599\u7684\u8272\u53F7\u3002", "colorNumber")
        : msg("color", "That colour number is not in a priced tier.", "\u8BE5\u8272\u53F7\u4E0D\u5728\u4EF7\u6863\u5185\u3002", "colorNumber"));
    }
    if (input.lining && !LINING_IDS.includes(input.lining)) {
      errors.push(msg("lining", "Choose a lining.", "\u8BF7\u9009\u62E9\u91CC\u5E03\u3002", "lining"));
    }
    if (input.tieback === "custom" && !input.tiebackRemark?.trim()) {
      errors.push(msg("tieback", "Describe the custom tieback.", "\u5B9A\u5236\u7ED1\u5E26\u8BF7\u586B\u5199\u8BF4\u660E\u3002", "tiebackRemark"));
    }
    if (!rules.enabledFamilies.includes(family)) {
      errors.push(msg("family", "This heading is not offered.", "\u8BE5\u5E18\u5934\u6682\u4E0D\u63A5\u53D7\u4E0B\u5355\u3002", "headingFamily"));
    }
    if (family === "pinch" && input.pinchStyle && !heading.key && !rules.enabledPinch.includes(input.pinchStyle)) {
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
    const allowanceEach = rules.allowancePerPanelCm ?? rules.allowanceSingleCm ?? 15;
    let gliders = null;
    let counts = [];
    function foldsFor(panelCm) {
      if (family === "grommet") {
        const raw = excelRoundUp(panelCm / rules.hookSpacingDefaultCm);
        const rings = raw <= 0 ? 0 : raw % 2 === 0 ? raw : raw + 1;
        return { folds: rings / 2, rings };
      }
      let pleats = excelRoundUp(panelCm / hookSpacing) - 1;
      if (heading.extraPleat) pleats += 1;
      return { folds: pleats, rings: null };
    }
    const ringCounts = [];
    if (family === "knife" && widthCm > 0 && knifeMultiplier) {
      counts = Array.from({ length: panelCount }, () => null);
    } else if (family === "ripple" && pitch && widthCm > 0) {
      if (unequal) {
        const sides = panelWidths.map((panelCm) => calcGliders(panelCm, false, pitch));
        gliders = { n0: null, n1: null, total: sides[0].total + sides[1].total, half: null, perPanel: sides.map((side) => side.total) };
        counts = sides.map((side) => side.total / 2);
      } else {
        const g = calcGliders(widthCm, isDouble, pitch);
        gliders = { n0: g.n0, n1: g.n1, total: g.total, half: g.half, perPanel: isDouble ? [g.half, g.half] : [g.total] };
        const foldsEach = g.total / 2 / panelCount;
        counts = Array.from({ length: panelCount }, () => foldsEach);
      }
    } else if ((family === "grommet" || hookSpacing) && panelWidths.some((panelCm) => panelCm > 0)) {
      panelWidths.forEach((panelCm) => {
        const folded = foldsFor(panelCm);
        counts.push(folded.folds);
        ringCounts.push(folded.rings);
      });
    } else {
      counts = Array.from({ length: panelCount }, () => 0);
    }
    if (family !== "knife" && widthCm > 0 && counts.some((c) => c < 1)) {
      errors.push(
        msg("narrow", "This window is too narrow for the chosen heading.", "\u7A97\u5BBD\u8FC7\u7A84\uFF0C\u65E0\u6CD5\u6309\u6240\u9009\u5E18\u5934\u5206\u8936\u3002", "width")
      );
    }
    const panels = counts.map((count, index) => {
      const knifeShare = family === "knife" && knifeMultiplier ? roundCm(widthCm * knifeMultiplier / panelCount) : null;
      const cutWidthCm2 = family === "knife" ? roundCm((knifeShare || 0) + allowanceEach + returnExcess + overlapExcess) : roundCm(count * fabricPerPleat + allowanceEach + returnExcess + overlapExcess);
      let drops = null;
      let cutDropCm = null;
      let usageCm2 = cutWidthCm2;
      if (input.orientation === "fixed-width") {
        cutDropCm = roundCm(heightCm + (rules.fixedWidthAddCm ?? 30));
        const bolt = fabric?.widthCm ?? 0;
        drops = bolt > 0 ? excelRoundUp(cutWidthCm2 / bolt) : 0;
        usageCm2 = roundCm(drops * cutDropCm);
      }
      const glidersEach = family === "ripple" && gliders && gliders.perPanel ? gliders.perPanel[index] : null;
      const runnersEach = family === "ripple" ? glidersEach : (heading.extraPleat ? Math.max(count - 1, 0) : count);
      return {
        index: index + 1,
        side: sideFor(draw, index),
        widthCm: panelWidths[index] || 0,
        count,
        hooks: family === "pinch" ? count + 2 : null,
        rings: family === "grommet" ? ringCounts[index] || 0 : null,
        gliders: glidersEach,
        runners: family === "knife" ? null : runnersEach,
        allowanceCm: allowanceEach,
        returnExcessCm: returnExcess,
        overlapExcessCm: overlapExcess,
        cutWidthCm: cutWidthCm2,
        drops,
        cutDropCm,
        usageCm: usageCm2
      };
    });
    const totalCount = family === "knife" ? null : panels.reduce((s, p) => s + p.count, 0);
    const pureFabricCm = family === "knife" && knifeMultiplier ? roundCm(widthCm * knifeMultiplier) : roundCm((totalCount || 0) * fabricPerPleat);
    const allowanceCm = roundCm(panels.reduce((s, p) => s + p.allowanceCm, 0));
    const excessCm = roundCm(panels.reduce((s, p) => s + p.returnExcessCm + p.overlapExcessCm, 0));
    const cutWidthCm = roundCm(panels.reduce((s, p) => s + p.cutWidthCm, 0));
    const usageCm = panels.reduce((s, p) => s + p.usageCm, 0);
    const usageMetersPerPiece = round3(usageCm / 100);
    const qty = Number.isInteger(qtyValue) && qtyValue > 0 ? qtyValue : 0;
    const usageMetersPriced = round3(usageMetersPerPiece * qty);
    const widthMetres = widthCm / 100;
    const measurableCm = roundCm(cutWidthCm - allowanceCm);
    const fullness = widthCm > 0 ? measurableCm / widthCm : 0;
    const fullnessDisplay = widthCm > 0 ? round1(measurableCm / widthCm) : 0;
    const statedFullness = parseDecimal(input.orderedFullness);
    if (statedFullness != null && Number.isFinite(statedFullness) && Math.abs(fullnessDisplay - round1(statedFullness)) > 0.1 + 1e-9) {
      warnings.push(msg("fullness-tol", "stated fullness differs, please confirm (possible input error)", "\u5BA2\u6237\u586B\u5199\u7684\u4E30\u6EE1\u5EA6\u4E0E\u5B9E\u9645\u4E0D\u540C\uFF0C\u8BF7\u786E\u8BA4\uFF08\u53EF\u80FD\u662F\u586B\u5199\u6709\u8BEF\uFF09", "orderedFullness"));
    }
    const hookHeight = parseHookHeight(input.hookHeight, input.hookHeightUnit);
    const hookSpec = input.hookSpec == null ? "" : String(input.hookSpec);
    const calculatedRunners = panels.map((panel) => panel.runners);
    let suppliedRunners = null;
    if (Array.isArray(input.runnerCount)) suppliedRunners = input.runnerCount.map((value) => parseDecimal(value));
    else if (input.runnerCount != null && input.runnerCount !== "") {
      const one = parseDecimal(input.runnerCount);
      if (Number.isFinite(one)) suppliedRunners = panels.map(() => one);
    }
    if (input.leftRunnerCount != null && input.leftRunnerCount !== "" || input.rightRunnerCount != null && input.rightRunnerCount !== "") {
      const leftRunner = parseDecimal(input.leftRunnerCount);
      const rightRunner = parseDecimal(input.rightRunnerCount);
      suppliedRunners = [leftRunner, rightRunner];
    }
    const runnerOverride = !!(suppliedRunners && suppliedRunners.some((value, index) => Number.isFinite(value) && value !== calculatedRunners[index]));
    if (runnerOverride) {
      warnings.push(msg("runner-diff", "The runner count you entered does not match the calculated count. The fabric price is unchanged.", "\u586B\u5199\u7684\u6ED1\u8F66\u6570\u4E0E\u8BA1\u7B97\u503C\u4E0D\u540C\uFF0C\u4E0D\u6539\u9762\u6599\u4EF7\u3002", "runnerCount"));
    }
    let actualSpacingCm = null;
    const spacingCount = family === "grommet" ? panels[0] && panels[0].rings || 0 : panels[0] && panels[0].count || 0;
    if (family !== "ripple" && spacingCount > 0) {
      const spaces = family === "grommet" ? Math.max(spacingCount - 1, 1) : panels[0].count + 1;
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
        errors.push(
          msg(
            "fixed-height",
            "Height plus hem and top fold exceeds the fabric width. Switch to fixed-width orientation (vertical seams).",
            "\u9AD8\u5EA6\u52A0\u4E0B\u6446\u548C\u5E03\u9876\u5DF2\u8D85\u51FA\u9762\u6599\u95E8\u5E45\u3002\u8BF7\u6539\u4E3A\u5B9A\u5BBD\uFF08\u7EB5\u5411\u62FC\u7F1D\uFF09\u3002",
            "orientation"
          )
        );
      }
    }
    if (input.orientation === "fixed-width" && fabric && fabric.widthCm <= 0) {
      errors.push(msg("bolt", "This fabric has no usable width on file.", "\u8BE5\u9762\u6599\u6CA1\u6709\u53EF\u7528\u95E8\u5E45\u3002", "fabricId"));
    }
    let priceCnyPerM = fabric?.priceCnyPerM ?? 0;
    let priceQuoted = true;
    if (com) {
      const making = rules.makingPricing || { mode: "none" };
      if (making.mode === "per-m" && Number(making.cnyPerM) > 0) priceCnyPerM = Number(making.cnyPerM);
      else {
        priceCnyPerM = 0;
        priceQuoted = false;
        warnings.push(msg("com-quote", "Price to be quoted.", "\u4EF7\u683C\u5F85\u62A5\u4EF7", "fabricId"));
      }
    }
    const cutFabricCnyPerM = fabric?.fabricPriceCnyPerM ?? null;
    const widthM = round3(widthCm / 100);
    const trackRate = input.hardware === "manual-track" ? prices.manualTrackPerM : input.hardware === "roman-rod" ? prices.romanRodPerM : input.hardware === "electric-track" ? prices.electricTrackPerM : 0;
    const trackM = round3(widthM * qty);
    const curtainCny = round2(usageMetersPriced * priceCnyPerM);
    const trackCny = round2(trackM * trackRate);
    const motorCny = input.hardware === "electric-track" ? round2(prices.motorUnit * qty) : 0;
    const tiebackUnit = input.tieback === "none" ? 0 : prices.tieback[input.tieback] ?? 0;
    const tiebackCny = round2(tiebackUnit * qty);
    const lining = quoteLining(input, usageMetersPerPiece, qty, rules);
    const liningCny = lining.priced ? lining.cny : 0;
    const lineCny = round2(curtainCny + trackCny + motorCny + tiebackCny + liningCny);
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
      widthMetres: widthM,
      usageBasis: input.orientation === "fixed-width" ? "drop-length" : "cut-width",
      priceCnyPerM,
      cutFabricCnyPerM,
      curtainPerPiece: qty > 0 ? round2(usageMetersPerPiece * priceCnyPerM) : 0,
      panels
    });
    return {
      widthCm,
      heightCm,
      widthBasis,
      draw,
      unequal,
      panelCount,
      panels,
      fabricPerPleat,
      hookSpacingCm: hookSpacing,
      gliderPitch: pitch,
      totalCount,
      totalHooks: panels.every((p) => p.hooks !== null) ? panels.reduce((s, p) => s + (p.hooks ?? 0), 0) : null,
      totalRings: family === "grommet" ? panels.reduce((s, p) => s + (p.rings || 0), 0) : null,
      totalGliders: gliders?.total ?? null,
      gliders,
      pureFabricCm,
      allowanceCm,
      excessCm,
      cutWidthCm,
      fullness,
      fullnessDisplay,
      nominalFullness: family === "knife" ? knifeMultiplier : nominalFullness(fabricPerPleat),
      knifeMultiplier: family === "knife" ? knifeMultiplier : null,
      actualSpacingCm,
      usageMetersPerPiece,
      usageMetersPriced,
      usageBasis: input.orientation === "fixed-width" ? "drop-length" : "cut-width",
      hemUsageCm,
      topUsageCm,
      fixedHeight,
      machine: { maxCount, withinLimit },
      lining,
      runnersPerPanel: calculatedRunners,
      suppliedRunners,
      runnerOverride,
      makingHooksPerPanel: panels.map((panel) => panel.hooks),
      orderedFullness: statedFullness != null && Number.isFinite(statedFullness) ? round1(statedFullness) : null,
      hookHeightMm: hookHeight.mm,
      hookHeightEntered: hookHeight.entered,
      hookSpec,
      heading,
      calcRule: family === "knife" ? "knife-multiplier" : heading.rule === "ripple" ? "ripple-2to1" : heading.rule === "grommet" ? "grommet" : heading.extraPleat ? "pleat-plus-1" : heading.rule === "pleat" ? "pleat-shared" : null,
      pricing: { widthM, trackM, curtainCny, trackCny, motorCny, tiebackCny, liningCny, lineCny, priceCnyPerM, cutFabricCnyPerM, priceQuoted },
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
    } else if (p.family === "grommet") {
      const rings = p.panels.reduce((s, x) => s + (x.rings || 0), 0);
      const folds = p.panels.reduce((s, x) => s + x.count, 0);
      lines.push({
        en: `Rings ${p.panels.map((x) => x.rings).join(" + ")} = ${rings} (even per panel), folds = rings \xF7 2 = ${folds}`,
        zh: `\u73AF\u6570 ${p.panels.map((x) => x.rings).join(" + ")} = ${rings}\uFF08\u6BCF\u7247\u53D6\u5076\u6570\uFF09\uFF0C\u8936\u4F4D\u6570 = \u73AF\u6570 \xF7 2 = ${folds}`
      });
    } else {
      lines.push({
        en: `Pleats = ${p.panels.map((x) => x.count).join(" + ")} = ${p.panels.reduce((s, x) => s + x.count, 0)}`,
        zh: `\u8936\u6570 = ${p.panels.map((x) => x.count).join(" + ")} = ${p.panels.reduce((s, x) => s + x.count, 0)}`
      });
    }
    lines.push({
      en: `Cut width = pure ${p.pureFabricCm} + allowance ${p.allowanceCm} + return/overlap excess ${p.excessCm} = ${p.cutWidthCm} cm`,
      zh: `\u88C1\u5BBD = \u51C0\u6599 ${p.pureFabricCm} + \u635F\u8017 ${p.allowanceCm} + \u5305\u8FB9\u91CD\u53E0\u8D85\u51FA ${p.excessCm} = ${p.cutWidthCm} \u5398\u7C73`
    });
    lines.push({
      en: `Fullness (actual) = (usage \u2212 side hems) \xF7 finished width = ${p.fullnessDisplay}`,
      zh: `\u5B9E\u9645\u4E30\u6EE1\u5EA6 = \uFF08\u7528\u6599 \u2212 \u5DE6\u53F3\u5377\u8FB9\uFF09\xF7 \u6210\u54C1\u5BBD = ${p.fullnessDisplay}`
    });
    if (p.usageBasis === "drop-length") {
      lines.push({
        en: `Fixed-width usage = ${p.panels.map((x) => `${x.drops} width \xD7 (finished height + 30 cm)`).join(" + ")} = ${p.usageMetersPerPiece} m`,
        zh: `\u5B9A\u5BBD\u7528\u6599 = ${p.panels.map((x) => `${x.drops} \u5E45 \xD7 \uFF08\u6210\u54C1\u9AD8 + 30 \u5398\u7C73\uFF09`).join(" + ")} = ${p.usageMetersPerPiece} \u7C73`
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
    if (p.cutFabricCnyPerM != null) {
      lines.push({
        en: `${CUT_FABRIC_LABEL} ${p.cutFabricCnyPerM} CNY/m is not part of the curtain total.`,
        zh: `${CUT_FABRIC_LABEL} ${p.cutFabricCnyPerM} \u5143/\u7C73\uFF0C\u4E0D\u8BA1\u5165\u7A97\u5E18\u5408\u8BA1\u3002`
      });
    }
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
    allowancePerPanelCm: 15,
    allowanceSingleCm: 15,
    allowanceDoubleCm: 30,
    inputLimits: INPUT_LIMITS,
    liningPricing: LINING_PRICING,
    hemUsageCm: {
      "8+2": 10,
      "8+8": 16,
      "7+7": 14,
      "2+2": 4,
      lead: 0
    },
    topFoldCm: 8,
    fixedWidthAddCm: 30,
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
      { id: "fedex", en: "FedEx", zh: "FedEx \u5FEB\u9012" },
      { id: "dhl", en: "DHL", zh: "DHL \u5FEB\u9012" },
      { id: "ups", en: "UPS", zh: "UPS \u5FEB\u9012" },
      { id: "sea", en: "Sea freight", zh: "\u6D77\u8FD0" }
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
    ripple: { en: "S-Wave / Ripple Fold", zh: "\u86C7\u5F62\u5E18" },
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
    fabric: { en: "Fabric", zh: "\u9762\u6599" },
    blackout: { en: "Blackout", zh: "\u906E\u5149" },
    sheer: { en: "Sheer", zh: "\u7EB1" }
  };
  var LINING_LABEL = {
    none: { en: "None", zh: "\u65E0\u91CC\u5E03" },
    "endura-white": { en: "Endura blackout lining \u2013 White", zh: "Endura \u5168\u906E\u5149\u91CC\u5E03 \u2013 \u767D" },
    "endura-beige": { en: "Endura blackout lining \u2013 Beige", zh: "Endura \u5168\u906E\u5149\u91CC\u5E03 \u2013 \u7C73" }
  };
  var TOP_LABEL = {
    none: { en: "No top fold", zh: "\u4E0A\u53E3\u4E0D\u6253\u6298" },
    "fold-8": { en: "8 cm top fold", zh: "\u4E0A\u53E3\u6298 8 \u5398\u7C73" }
  };
  var DRAW_LABEL = {
    "single-left": { en: "One way left", zh: "\u5355\u5F00\u5411\u5DE6" },
    "single-right": { en: "One way right", zh: "\u5355\u5F00\u5411\u53F3" },
    double: { en: "Centre open", zh: "\u53CC\u5F00" }
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
    mm: { en: "Millimetre", zh: "\u6BEB\u7C73" },
    cm: { en: "Centimetre", zh: "\u5398\u7C73" },
    m: { en: "Metre", zh: "\u7C73" },
    in: { en: "Inch", zh: "\u82F1\u5BF8" },
    yd: { en: "Yard", zh: "\u7801" }
  };
  function headingSummary(input) {
    const heading = normaliseHeading(input);
    if (heading.key && HEADING_LABEL[heading.key]) {
      const label = HEADING_LABEL[heading.key];
      if (heading.key === "ripple_fold" && input.rippleTape && TAPE_LABEL[input.rippleTape]) {
        return { en: label.en + " \xB7 " + TAPE_LABEL[input.rippleTape].en, zh: label.zh + " \xB7 " + TAPE_LABEL[input.rippleTape].zh };
      }
      return { en: label.en, zh: label.zh };
    }
    if (heading.pending === "knife") return { en: heading.en, zh: heading.zh };
    return { en: "Heading", zh: "\u5E18\u5934" };
  }
  return __toCommonJS(static_entry_exports);
})();

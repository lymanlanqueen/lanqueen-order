/* Customer order form for GitHub Pages. No build step. */
(function () {
  const MAIL = "https://formsubmit.co/ajax/28318330@qq.com";
  const STEPS = [
    ["Cloth", "面料"],
    ["Size", "尺寸"],
    ["Heading", "帘头"],
    ["Draw", "开合"],
    ["Fullness", "丰满度"],
    ["Hem", "下摆"],
    ["Return", "包边"],
    ["Tieback & hardware", "绑带五金"],
  ];
  let lang = localStorage.getItem("lq-lang") || "en";
  let catalog = [];
  let rates = [];
  let phase = "customer";
  let step = 0;
  let editIndex = null;
  let problems = [];
  let busy = false;
  let customer = blankCustomer();
  let windows = [];
  let draft = null;
  let sentNote = "";
  let revealErrors = false;

  function blankCustomer() {
    return { name: "", country: "", city: "", address: "", email: "", messenger: "", deliveryDate: "", currency: "USD", tradeTerm: "FOB", shippingMethod: "fedex", freightCny: "0", po: "", endClient: "", shipSeparate: false, shipAddress: "", shipCity: "", shipCountry: "", unbranded: false, sheetEnglishOnly: false, remarks: "" };
  }
  function blankWindow() {
    return {
      name: "", heading: "double_pinch", headingFamily: "pinch", pinchStyle: "double-pinch", rippleTape: "rivet",
      orientation: "fixed-height", lining: "none", topFinish: "none", width: "", height: "", unit: "m",
      fabricPerPleat: 24, gliderPitch: 6, hookSpacingCm: 10, draw: "double", hem: "8+2",
      returnCm: "5", overlapCm: "5", tieback: "none", tiebackRemark: "", hardware: "customer",
      rodColor: "white", motorSide: "left", plugStandard: "AU", quantity: "1", fabricId: "", colorNumber: "", remarks: "", category: "blackout",
      widthBasis: "", leftWidth: "", rightWidth: "", location: "", colourName: "", supplier: "LAN QUEEN",
      fabricSource: "catalog", comModel: "", comWidthCm: "", runnerCount: "", leftRunnerCount: "", rightRunnerCount: "", orderedFullness: "",
    };
  }
  function t(en, zh) { return lang === "zh" ? zh : en; }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }
  function bi(en, zh) {
    const primary = lang === "zh" ? zh : en;
    const secondary = lang === "zh" ? en : zh;
    return "<span>" + esc(primary) + "</span><span class='sub'>" + esc(secondary) + "</span>";
  }
  function field(en, zh, inner) {
    return "<label class='field'>" + bi(en, zh) + inner + "</label>";
  }
  function choice(selected, attrs, inner) {
    return "<button type='button' class='choice" + (selected ? " on" : "") + "' " + attrs + ">" + inner + "</button>";
  }
  function rules() {
    return Object.assign({}, LQ.DEFAULT_RULES, { catalog: catalog });
  }
  function toInput(source) {
    const colorRaw = source.colorNumber;
    return {
      name: source.name, heading: LQ.normaliseHeading(source).key, headingFamily: source.headingFamily, pinchStyle: source.pinchStyle, rippleTape: source.rippleTape,
      orientation: source.orientation, lining: source.lining, topFinish: source.topFinish,
      width: LQ.parseDecimal(source.width), height: LQ.parseDecimal(source.height), unit: source.unit,
      fabricPerPleat: LQ.normaliseHeading(source).rule === "grommet" ? 30 : Number(source.fabricPerPleat),
      gliderPitch: Number(source.gliderPitch), hookSpacingCm: LQ.DEFAULT_RULES.hookSpacingDefaultCm,
      draw: LQ.normaliseDraw(source.draw), hem: source.hem, returnCm: LQ.parseDecimal(source.returnCm), overlapCm: LQ.parseDecimal(source.overlapCm),
      widthBasis: source.widthBasis === "finished" || source.widthBasis === "track" ? source.widthBasis : "",
      leftWidth: LQ.parseDecimal(source.leftWidth), rightWidth: LQ.parseDecimal(source.rightWidth),
      location: source.location || "", colourName: source.colourName || "", supplier: source.supplier || "",
      fabricSource: source.fabricSource === "com" ? "com" : "catalog",
      comModel: source.comModel || "", comWidthCm: LQ.parseDecimal(source.comWidthCm),
      runnerCount: source.runnerCount === "" || source.runnerCount == null ? null : LQ.parseDecimal(source.runnerCount),
      leftRunnerCount: source.leftRunnerCount === "" || source.leftRunnerCount == null ? null : LQ.parseDecimal(source.leftRunnerCount),
      rightRunnerCount: source.rightRunnerCount === "" || source.rightRunnerCount == null ? null : LQ.parseDecimal(source.rightRunnerCount),
      orderedFullness: source.orderedFullness === "" || source.orderedFullness == null ? null : LQ.parseDecimal(source.orderedFullness),
      tieback: source.tieback, tiebackRemark: source.tiebackRemark, hardware: source.hardware,
      rodColor: source.hardware === "roman-rod" ? source.rodColor : undefined,
      motorSide: source.hardware === "electric-track" ? source.motorSide : undefined,
      plugStandard: source.hardware === "electric-track" ? source.plugStandard : undefined,
      quantity: LQ.parseDecimal(source.quantity), fabricId: source.fabricId,
      colorNumber: colorRaw === "" || colorRaw == null ? null : LQ.parseDecimal(colorRaw),
      remarks: source.remarks,
    };
  }
  function fabricById(id, colorNumber) {
    const row = catalog.find((item) => item.id === id) || catalog.find((item) => item.model === id);
    if (!row) return null;
    return LQ.resolveFabric(row, colorNumber);
  }
  function computeDraft(source) {
    if (!source || (source.width === "" && source.height === "")) return null;
    return LQ.computeWindow(toInput(source), fabricById(source.fabricId, source.colorNumber), rules(), LQ.DEFAULT_HARDWARE_PRICES);
  }
  function shownErrors(result, force) {
    if (!result || !draft) return [];
    return result.errors.filter((error) => {
      if (error.code === "fixed-height") return true;
      if (force || revealErrors) return true;
      const key = { width: "width", height: "height", return: "returnCm", overlap: "overlapCm", quantity: "quantity", colorNumber: "colorNumber", name: "name", fabricId: "fabricId" }[error.field] || error.field;
      const raw = draft[key];
      return raw !== "" && raw != null;
    });
  }
  function inline(field) {
    const result = draft ? computeDraft(draft) : null;
    const list = result ? shownErrors(result).filter((error) => error.field === field) : [];
    return "<div class='err-inline' data-for='" + field + "'>" + list.map((error) => esc(error.en) + " / " + esc(error.zh)).join("<br>") + "</div>";
  }
  function categoriesPresent() {
    const order = ["fabric", "blackout", "sheer"];
    const present = [];
    catalog.forEach((item) => { if (!present.includes(item.category)) present.push(item.category); });
    return order.filter((id) => present.includes(id)).concat(present.filter((id) => !order.includes(id)));
  }
  function enduraRate() {
    const row = catalog.find((item) => item.id === "endura");
    return row && row.finishedPriceCnyPerM != null ? row.finishedPriceCnyPerM : LQ.LINING_PRICING.cloth.finishedCNY;
  }
  function orderNumber() {
    const now = new Date();
    const p = (n) => String(n).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "LQ-" + now.getFullYear() + p(now.getMonth() + 1) + p(now.getDate()) + "-" + p(now.getHours()) + p(now.getMinutes()) + p(now.getSeconds()) + "-" + rand;
  }
  function rateFor(currency) {
    return rates.find((rate) => rate.currency === currency) || null;
  }
  function buildOrder() {
    const lines = windows.map((item) => {
      const fabric = fabricById(item.fabricId, item.colorNumber);
      const result = LQ.computeWindow(toInput(item), fabric, rules(), LQ.DEFAULT_HARDWARE_PRICES);
      return { input: toInput(item), result, fabric };
    });
    const freightCny = Math.round((LQ.parseDecimal(customer.freightCny) || 0) * 100) / 100;
    const cnyTotal = Math.round((lines.reduce((sum, line) => sum + line.result.pricing.lineCny, 0) + freightCny) * 100) / 100;
    const quote = rateFor(customer.currency);
    const settlement = LQ.settle(cnyTotal, customer.currency, quote, null);
    return {
      number: orderNumber(),
      createdAt: new Date().toISOString(),
      channel: "overseas-pages",
      customer: { ...customer },
      currency: customer.currency,
      cnyTotal,
      freightCny,
      freightNote: LQ.FREIGHT_NOTE,
      presentation: { englishOnly: customer.sheetEnglishOnly === true || customer.sheetEnglishOnly === "true", hideLogo: customer.unbranded === true || customer.unbranded === "true" },
      settlement,
      windows: lines,
    };
  }
  function customerErrors() {
    const errors = [];
    if (!customer.name.trim()) errors.push(t("Enter a name or company.", "请填写姓名或公司。"));
    if (!customer.country.trim()) errors.push(t("Enter a country.", "请填写国家。"));
    if (!customer.city.trim()) errors.push(t("Enter a city.", "请填写城市。"));
    if (!customer.address.trim()) errors.push(t("Enter a shipping address.", "请填写收货地址。"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) errors.push(t("Enter an email so we can reply.", "请填写可回复的邮箱。"));
    if (!customer.deliveryDate) errors.push(t("Choose a desired delivery date.", "请选择期望交期。"));
    if (customer.currency !== "CNY" && !rateFor(customer.currency)) errors.push(t("No rate is published for that currency.", "该币种没有牌价。"));
    return errors;
  }

  function render() {
    document.body.dataset.lang = lang;
    const root = document.querySelector("#app");
    const calc = document.querySelector("#calc");
    if (phase === "confirm") {
    root.innerHTML = confirmView();
    calc.innerHTML = "";
    document.querySelector("#bar").style.display = "none";
    const raw = sessionStorage.getItem("lq-confirm");
    const link = document.querySelector("#json-link");
    if (link && raw) {
      link.href = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
      link.download = JSON.parse(raw).number + ".json";
    }
    return;
  }
    document.querySelector("#bar").style.display = "";
    root.innerHTML = phase === "customer" ? customerView() : phase === "list" ? listView() : phase === "table" ? tableView() : phase === "edit" ? editView() : reviewView();
    calc.innerHTML = calcView();
    const bar = document.querySelector("#bar-inner");
    const err = problems[0] ? "<p class='err'>" + esc(problems[0]) + "</p>" : "";
    let next = "";
    if (phase === "customer") next = "<button class='btn' type='button' data-act='windows'>" + t("Windows", "填写窗位") + "</button>";
    if (phase === "list" || phase === "table") next = "<button class='btn' type='button' data-act='review'" + (windows.length ? "" : " disabled") + ">" + t("Review order", "核对订单") + "</button>";
    if (phase === "edit") next = "<button class='btn' type='button' data-act='next'>" + (step < STEPS.length - 1 ? t("Next", "下一步") : t("Save window", "保存窗位")) + "</button>";
    if (phase === "review") next = "<button class='btn' type='button' data-act='submit'" + (busy ? " disabled" : "") + ">" + (busy ? t("Sending…", "提交中…") : t("Submit order", "提交订单")) + "</button>";
    const backDisabled = phase === "customer" ? " disabled" : "";
    bar.innerHTML = err + "<div class='row' style='display:flex;justify-content:space-between;gap:12px'><button class='btn alt' type='button' data-act='back'" + backDisabled + ">" + t("Back", "上一步") + "</button>" + next + "</div>";
    document.querySelectorAll(".lang button").forEach((button) => button.classList.toggle("on", button.dataset.lang === lang));
  }

  function customerView() {
    const currencies = ["CNY"].concat(rates.map((rate) => rate.currency));
    return "<h1>" + t("Who is this order for?", "您的联系与收货信息") + "</h1><p class='lede'>" + t("English first, Chinese alongside. A foreign-currency total stays an estimate until you remit.", "英文为主，中文对照。外币金额在汇款前都是估算。") + "</p><div class='grid2'>" +
      field("Name / company", "姓名 / 公司", "<input data-c='name' value='" + esc(customer.name) + "'>") +
      field("Country", "国家", "<input data-c='country' value='" + esc(customer.country) + "'>") +
      field("City", "城市", "<input data-c='city' value='" + esc(customer.city) + "'>") +
      field("Desired delivery", "期望交期", "<input type='date' data-c='deliveryDate' value='" + esc(customer.deliveryDate) + "'>") +
      "</div>" + field("Shipping address", "收货地址", "<textarea data-c='address'>" + esc(customer.address) + "</textarea>") +
      "<div class='grid2'>" + field("Email", "邮箱", "<input type='email' data-c='email' value='" + esc(customer.email) + "'>") +
      field("WhatsApp / WeChat", "WhatsApp / 微信", "<input data-c='messenger' value='" + esc(customer.messenger) + "'>") +
      field("Customer PO / Job No.", "客户单号", "<input data-c='po' value='" + esc(customer.po) + "'>") +
      field("End client (optional)", "终端客户（选填）", "<input data-c='endClient' value='" + esc(customer.endClient) + "'>") +
      field("Freight CNY", "运费（人民币）", "<input data-c='freightCny' inputmode='decimal' value='" + esc(customer.freightCny) + "'>") + "</div>" +
      "<p class='note'>" + esc(LQ.FREIGHT_NOTE) + "</p>" +
      "<p><label><input type='checkbox' data-c='shipSeparate'" + (customer.shipSeparate ? " checked" : "") + "> Separate ship-to / drop-ship address / 另填收货地址</label></p>" +
      (customer.shipSeparate ? field("Ship-to address", "收货地址", "<textarea data-c='shipAddress'>" + esc(customer.shipAddress) + "</textarea>") + "<div class='grid2'>" + field("Ship-to city", "收货城市", "<input data-c='shipCity' value='" + esc(customer.shipCity) + "'>") + field("Ship-to country", "收货国家", "<input data-c='shipCountry' value='" + esc(customer.shipCountry) + "'>") + "</div>" : "") +
      "<p><label><input type='checkbox' data-c='sheetEnglishOnly'" + (customer.sheetEnglishOnly ? " checked" : "") + "> English-only customer sheet / 客户单仅英文</label></p>" +
      "<p><label><input type='checkbox' data-c='unbranded'" + (customer.unbranded ? " checked" : "") + "> Unbranded packaging & documents / 无牌包装和单据</label></p>" +
      "<p class='field'>" + bi("Currency", "结算币种") + "</p><div class='choices'>" + currencies.map((code) => {
        const rate = rateFor(code);
        return choice(customer.currency === code, "data-cset='currency' data-value='" + code + "'", code + (rate ? "<small>1 = " + rate.rateCny + " CNY · " + esc(LQ.ESTIMATE_MARK) + "</small>" : "<small>人民币</small>"));
      }).join("") + "</div><p class='note'>" + esc(LQ.NOT_A_QUOTE.en) + " / " + esc(LQ.NOT_A_QUOTE.zh) + "</p><div class='grid2' style='margin-top:12px'><div><p class='field'>" + bi("Trade term", "贸易术语") + "</p><div class='choices'>" +
      LQ.DEFAULT_RULES.tradeTerms.map((term) => choice(customer.tradeTerm === term, "data-cset='tradeTerm' data-value='" + term + "'", term)).join("") +
      "</div></div><div><p class='field'>" + bi("Shipping method", "运输方式") + "</p><div class='choices one'>" +
      LQ.DEFAULT_RULES.shippingMethods.map((method) => choice(customer.shippingMethod === method.id, "data-cset='shippingMethod' data-value='" + method.id + "'", bi(method.en, method.zh))).join("") +
      "</div></div></div>" + field("Notes for the studio", "给工作室的备注", "<textarea data-c='remarks'>" + esc(customer.remarks) + "</textarea>") + errorList();
  }

  function listView() {
    const cards = windows.map((item, index) => {
      const fabric = fabricById(item.fabricId);
      const head = LQ.headingSummary(toInput(item));
      return "<article class='card'><p class='note'>" + t("Window", "窗位") + " " + (index + 1) + "</p><h2 style='margin:4px 0'>" + esc(item.name || t("Untitled", "未命名")) + "</h2><p>" + (fabric ? esc(fabric.model) + " · " + esc(fabric.version) : t("No fabric", "未选面料")) + " · " + esc(item.width || "—") + " × " + esc(item.height || "—") + " " + esc(item.unit) + " · ×" + esc(item.quantity) + "</p><p>" + esc(head.en) + " / " + esc(head.zh) + "</p><button class='btn alt' type='button' data-act='edit' data-index='" + index + "'>" + t("Edit", "修改") + "</button> <button class='btn alt' type='button' data-act='dup' data-index='" + index + "'>" + t("Clone", "复制") + "</button> <button class='btn alt' type='button' data-act='expand' data-index='" + index + "'>" + t("Expand quantity", "按数量拆行") + "</button> <button class='btn alt' type='button' data-act='remove' data-index='" + index + "'>" + t("Remove", "删除") + "</button></article>";
    }).join("");
    return "<h1>" + t("Windows", "窗位") + "</h1><p class='lede'>" + t("One card per window. Use quantity when several windows are identical.", "每个窗户单独做一条。相同规格可以填数量。") + "</p>" +
      (windows.length ? cards : "<p class='card'>" + t("No windows yet. Start with the living room or the main bedroom.", "还没有窗位。从客厅或主卧开始。") + "</p>") +
      "<p><button class='btn brass' type='button' data-act='add'>" + t("Add a window", "添加窗位") + "</button> <button class='btn alt' type='button' data-act='table'>" + t("Table", "表格") + "</button></p>" + errorList();
  }

  function editView() {
    const rules = LQ.DEFAULT_RULES;
    let body = "<p class='note'>WINDOW · " + (step + 1) + "/" + STEPS.length + "</p><h1>" + t(STEPS[step][0], STEPS[step][1]) + "</h1><div class='steps'>" + STEPS.map((_, index) => "<i class='" + (index === step ? "on" : index < step ? "done" : "") + "'></i>").join("") + "</div>";
    if (step === 2) {
      body += field("Window name", "窗位名称", "<input data-w='name' placeholder='" + t("Living room", "客厅") + "' value='" + esc(draft.name) + "'>");
      const headingNow = draft.heading || LQ.normaliseHeading(draft).key || "";
      body += "<div class='choices'>" + LQ.HEADING_ORDER.map((key) => choice(headingNow === key, "data-wset='heading' data-value='" + key + "'", bi(LQ.HEADING_LABEL[key].en, LQ.HEADING_LABEL[key].zh))).join("") + "</div>";
      if (headingNow === "ripple_fold") {
        body += "<div class='choices'>" + rules.enabledRippleTapes.map((tape) => choice(draft.rippleTape === tape, "data-wset='rippleTape' data-value='" + tape + "'", bi(LQ.TAPE_LABEL[tape].en, LQ.TAPE_LABEL[tape].zh))).join("") + "</div>";
      }
      body += "<div class='choices'>" + Object.keys(LQ.ORIENTATION_LABEL).map((key) => choice(draft.orientation === key, "data-wset='orientation' data-value='" + key + "'", bi(LQ.ORIENTATION_LABEL[key].en, LQ.ORIENTATION_LABEL[key].zh))).join("") + "</div>";
      body += "<div class='choices'>" + Object.keys(LQ.LINING_LABEL).map((key) => choice(draft.lining === key, "data-wset='lining' data-value='" + key + "'", bi(LQ.LINING_LABEL[key].en, LQ.LINING_LABEL[key].zh))).join("") + "</div>";
      body += "<p class='note'>Endura 100% blackout, 2.8 m. Lining fee = face-fabric usage × ¥" + enduraRate() + "/m × quantity. / Endura 全遮光，门幅 2.8 米。里布费 = 面料用料 × ¥" + enduraRate() + "/米 × 数量。</p>";
      body += inline("orientation");
      body += "<div class='choices'>" + Object.keys(LQ.TOP_LABEL).map((key) => choice(draft.topFinish === key, "data-wset='topFinish' data-value='" + key + "'", bi(LQ.TOP_LABEL[key].en, LQ.TOP_LABEL[key].zh))).join("") + "</div>";
    }
    if (step === 1) {
      body += "<p class='note'>" + t("Height is measured from the top of the fabric down to the finished hem.", "高度从面料上沿量到成品下沿。") + "</p>";
      body += "<div class='choices'>" + Object.keys(LQ.UNIT_LABEL).map((unit) => choice(draft.unit === unit, "data-wset='unit' data-value='" + unit + "'", bi(LQ.UNIT_LABEL[unit].en, LQ.UNIT_LABEL[unit].zh))).join("") + "</div>";
      body += inline("unit");
      body += "<p class='note'>Width basis is required on every window. / 每一窗都必须选择宽度基准。</p>";
      body += "<div class='choices'>" + choice(draft.widthBasis === "track", "data-wset='widthBasis' data-value='track'", bi("Track width", "轨道宽")) + choice(draft.widthBasis === "finished", "data-wset='widthBasis' data-value='finished'", bi("Finished width", "成品宽")) + "</div>";
      body += inline("widthBasis");
      body += "<p class='note'>" + (draft.widthBasis === "finished" ? "Returns and overlap are already included in a finished width, so they are not added again. / 成品宽已含回边和搭接，不再另加。" : draft.widthBasis === "track" ? "Extra return or overlap over 5 cm is added to the cut, per panel. / 回边或搭接超出 5 厘米的部分，每片加进裁宽。" : "Choose Track width or Finished width before the cloth is calculated. / 先选择轨道宽或成品宽，再计算用料。") + "</p>";
      body += "<p class='note'>Finished height is the drop as ordered. Clearance and puddle are already included. Nothing is deducted. / 高度就是下单成品高，已含离地或堆地，系统不扣减。</p>";
      body += "<div class='grid2'>" + field(draft.widthBasis === "finished" ? "Finished width" : "Track width", draft.widthBasis === "finished" ? "成品宽" : "轨道宽", "<input data-w='width' inputmode='decimal' value='" + esc(draft.width) + "'>") + field("Finished height", "成品高", "<input data-w='height' inputmode='decimal' value='" + esc(draft.height) + "'>") + "</div>";
      if (draft.draw === "double") body += "<div class='grid2'>" + field("Left width", "左片宽", "<input data-w='leftWidth' inputmode='decimal' value='" + esc(draft.leftWidth) + "'>") + field("Right width", "右片宽", "<input data-w='rightWidth' inputmode='decimal' value='" + esc(draft.rightWidth) + "'>") + "</div><p class='note'>Leave both blank to split the width equally. Fill both for an unequal pair. / 两格都空则对半。都填则按不等分双开。</p>";
      body += inline("width") + inline("height");
    }
    if (step === 4) {
      if (LQ.normaliseHeading(draft).rule === "ripple") {
        body += "<p class='note'>" + t("Glider pitch. 6 cm is the usual choice.", "滑轮间距，6 厘米为推荐。") + "</p><div class='choices'>" + [5.4, 6, 7, 8, 9, 10].map((pitch) => choice(Number(draft.gliderPitch) === pitch, "data-wset='gliderPitch' data-value='" + pitch + "'", pitch + " cm" + (pitch === 6 ? " ★" : ""))).join("") + "</div>";
      } else {
        body += "<p class='note'>Hook spacing is fixed at 10 cm. / 挂钩间距固定为 10 厘米。</p>";
      }
      if (LQ.normaliseHeading(draft).rule === "grommet") {
        body += "<p class='note'>Grommet film is fixed at 30 cm. Folds = ring count ÷ 2. / 打孔纸膜固定 30 厘米。褶位数 = 环数 ÷ 2。</p>";
      } else {
        body += "<p class='note'>" + t("Fabric per pleat. 24 cm is about 2.2× and is the default.", "褶用料。24 厘米约 2.2 倍，为默认。") + "</p><div class='choices'>";
        [[22, "≈1.9×"], [24, "≈2.2×"], [30, "≈2.8×"]].forEach((item) => {
          body += choice(Number(draft.fabricPerPleat) === item[0], "data-wset='fabricPerPleat' data-value='" + item[0] + "'", item[0] + " cm " + item[1] + (item[0] === 24 ? " ★" : ""));
        });
        body += "</div>";
      }
    }
    if (step === 3) {
      body += "<div class='choices one'>" + Object.keys(LQ.DRAW_LABEL).map((key) => choice(draft.draw === key, "data-wset='draw' data-value='" + key + "'", bi(LQ.DRAW_LABEL[key].en, LQ.DRAW_LABEL[key].zh))).join("") + "</div>";
      body += field("Runner count per panel", "每片滑车数", "<input data-w='runnerCount' inputmode='numeric' value='" + esc(draft.runnerCount) + "'>");
      body += "<p class='note'>Leave blank to use the calculated count. A different number is kept and flagged; it does not change the fabric price. / 留空则用计算值。填了不同的数会保留并标出，不改面料价。</p>";
      body += "<p class='note'><b>" + esc(LQ.DEFAULTS_NOTE) + "</b><br>Hem 8+2 · return 5 cm · overlap 5 cm · hook spacing 10 cm · runner count from the heading rule, until you change them. / 下摆 8+2、包边 5 厘米、搭接 5 厘米、钩距 10 厘米、滑车数按帘头规则，除非你改掉。</p>";
      body += field("Stated fullness", "客户丰满度", "<input data-w='orderedFullness' inputmode='decimal' value='" + esc(draft.orderedFullness) + "'>");
    }
    if (step === 5) body += "<div class='choices one'>" + Object.keys(LQ.HEM_LABEL).map((key) => choice(draft.hem === key, "data-wset='hem' data-value='" + key + "'", bi(LQ.HEM_LABEL[key].en, LQ.HEM_LABEL[key].zh))).join("") + "</div>";
    if (step === 6) {
      body += "<p class='note'>Each panel adds 15 cm allowance. A double draw is two panels, 30 cm in total. Only return or overlap above 5 cm is added, on every panel. / 每片加 15 厘米损耗。双开两片，合计 30 厘米。包边或重叠超出 5 厘米的部分，每片再加。</p>";
      body += field("Return (cm)", "包边（厘米）", "<input data-w='returnCm' inputmode='decimal' value='" + esc(draft.returnCm) + "'>") + inline("return");
      body += draft.draw === "double" ? field("Overlap (cm)", "重叠（厘米）", "<input data-w='overlapCm' inputmode='decimal' value='" + esc(draft.overlapCm) + "'>") + inline("overlap") : "<p class='note'>" + t("Overlap is not used on a single draw.", "单开不计重叠。") + "</p>";
    }
    if (step === 7) {
      const prices = LQ.DEFAULT_HARDWARE_PRICES;
      const hardwareHint = { customer: "", "manual-track": "¥" + prices.manualTrackPerM + "/m", "roman-rod": "¥" + prices.romanRodPerM + "/m", "electric-track": "¥" + prices.electricTrackPerM + "/m + ¥" + prices.motorUnit };
      body += "<div class='choices'>" + Object.keys(LQ.TIEBACK_LABEL).map((key) => choice(draft.tieback === key, "data-wset='tieback' data-value='" + key + "'", bi(LQ.TIEBACK_LABEL[key].en, LQ.TIEBACK_LABEL[key].zh))).join("") + "</div>";
      if (draft.tieback === "custom") body += field("Describe the tieback", "绑带说明", "<textarea data-w='tiebackRemark'>" + esc(draft.tiebackRemark) + "</textarea>");
      body += "<p class='estimate'>" + esc(LQ.ESTIMATE_MARK) + "</p><p class='note'>" + esc(LQ.NOT_A_QUOTE.en) + " / " + esc(LQ.NOT_A_QUOTE.zh) + "</p>";
      body += "<div class='choices one'>" + Object.keys(LQ.HARDWARE_LABEL).map((key) => choice(draft.hardware === key, "data-wset='hardware' data-value='" + key + "'", bi(LQ.HARDWARE_LABEL[key].en, LQ.HARDWARE_LABEL[key].zh) + (hardwareHint[key] ? "<small>" + hardwareHint[key] + " · " + esc(LQ.ESTIMATE_MARK) + "</small>" : ""))).join("") + "</div>";
      if (draft.hardware === "roman-rod") body += "<div class='choices'>" + Object.keys(LQ.ROD_LABEL).map((key) => choice(draft.rodColor === key, "data-wset='rodColor' data-value='" + key + "'", bi(LQ.ROD_LABEL[key].en, LQ.ROD_LABEL[key].zh))).join("") + "</div>";
      if (draft.hardware === "electric-track") {
        body += "<p class='note'>" + t("Motorized orders use the white electric track and a remote only.", "电动只配白色专用轨道，控制方式只有遥控。") + "</p><div class='choices'>" +
          choice(draft.motorSide === "left", "data-wset='motorSide' data-value='left'", bi("Motor left", "电机在左")) +
          choice(draft.motorSide === "right", "data-wset='motorSide' data-value='right'", bi("Motor right", "电机在右")) + "</div><div class='choices'>" +
          rules.plugStandards.map((plug) => choice(draft.plugStandard === plug, "data-wset='plugStandard' data-value='" + plug + "'", plug)).join("") + "</div>";
      }
    }
    if (step === 0) {
      body += "<div class='choices'>" + categoriesPresent().map((category) => choice(draft.category === category, "data-wset='category' data-value='" + category + "'", bi((LQ.CATEGORY_LABEL[category] || { en: category, zh: category }).en, (LQ.CATEGORY_LABEL[category] || { en: category, zh: category }).zh))).join("") + "</div>";
      const models = catalog.filter((item) => item.category === draft.category);
      body += "<label class='field'>" + bi("Model", "型号") + "<select data-w='fabricId'><option value=''>" + t("Choose a model", "选择型号") + "</option>" + models.map((fabric) => "<option value='" + fabric.id + "'" + (draft.fabricId === fabric.id ? " selected" : "") + ">" + esc(fabric.version) + " · " + esc(fabric.model) + "</option>").join("") + "</select></label>";
      body += inline("fabricId");
      const selected = catalog.find((item) => item.id === draft.fabricId);
      if (selected && selected.colorTiers && selected.colorTiers.length) {
        body += field("Colour number", "色号", "<input data-w='colorNumber' inputmode='numeric' value='" + esc(draft.colorNumber) + "'>");
        body += "<div class='choices one'>" + selected.colorTiers.map((tier) => {
          const nums = LQ.parseColorSpec(tier.colors);
          const on = nums.includes(Number(draft.colorNumber));
          return choice(on, "data-wset='colorNumber' data-value='" + nums[0] + "'", esc(tier.colors) + "<small>" + t("Finished", "成品") + " ¥" + tier.finishedCNY + "/m · " + esc(LQ.CUT_FABRIC_LABEL) + " ¥" + tier.fabricCNY + "/m</small>");
        }).join("") + "</div>";
        body += inline("colorNumber");
      }
      const resolved = selected ? LQ.resolveFabric(selected, draft.colorNumber) : null;
      if (resolved && resolved.finishedPriceCnyPerM != null) {
        body += "<p class='note'>" + t("Finished price, used for the curtain", "窗帘按成品价") + " ¥" + resolved.finishedPriceCnyPerM + "/m · " + resolved.widthM + " m</p>";
        if (resolved.fabricPriceCnyPerM != null) body += "<p class='note'>" + esc(LQ.CUT_FABRIC_LABEL) + " ¥" + resolved.fabricPriceCnyPerM + "/m · not included in the curtain total / 不计入窗帘合计</p>";
      }
      body += "<div class='choices'>" + choice(draft.fabricSource !== "com", "data-wset='fabricSource' data-value='catalog'", bi("LAN QUEEN catalog", "兰客厅面料")) + choice(draft.fabricSource === "com", "data-wset='fabricSource' data-value='com'", bi("Customer-supplied", "客供")) + "</div>";
      if (draft.fabricSource === "com") {
        body += field("COM fabric name", "客供面料名", "<input data-w='comModel' value='" + esc(draft.comModel) + "'>");
        body += field("COM width (cm)", "客供门幅（厘米）", "<input data-w='comWidthCm' inputmode='decimal' value='" + esc(draft.comWidthCm) + "'>");
      }
      body += field("Location / window no.", "位置 / 窗号", "<input data-w='location' value='" + esc(draft.location) + "'>");
      body += field("Colour name", "颜色名", "<input data-w='colourName' value='" + esc(draft.colourName) + "'>");
      body += field("Supplier", "供应商", "<input data-w='supplier' value='" + esc(draft.supplier) + "'>");
      body += field("Quantity", "数量", "<input data-w='quantity' inputmode='numeric' value='" + esc(draft.quantity) + "'>") + inline("quantity");
      body += field("Remarks for this window", "本窗备注", "<textarea data-w='remarks'>" + esc(draft.remarks) + "</textarea>");
    }
    return body + errorList();
  }

  function tableView() {
    const head = "<tr><th>Model</th><th>Width</th><th>Height</th><th>Unit</th><th>Heading</th><th>L</th><th>R</th><th>Open</th><th>Basis</th><th>Location</th><th>Qty</th><th></th></tr>";
    const body = windows.map((item, index) => {
      const result = computeDraft(item);
      const warn = result ? result.warnings.map((warning) => warning.en).join("; ") : "";
      const err = result ? result.errors.map((error) => error.en).join("; ") : "";
      return "<tr><td><input data-row='" + index + "' data-field='fabricId' value='" + esc(item.fabricId) + "' placeholder='model'></td>" +
        "<td><input data-row='" + index + "' data-field='width' value='" + esc(item.width) + "'></td>" +
        "<td><input data-row='" + index + "' data-field='height' value='" + esc(item.height) + "'></td>" +
        "<td><select data-row='" + index + "' data-field='unit'>" + Object.keys(LQ.UNIT_LABEL).map((unit) => "<option value='" + unit + "'" + (item.unit === unit ? " selected" : "") + ">" + unit + "</option>").join("") + "</select></td>" +
        "<td><select data-row='" + index + "' data-field='heading'>" + LQ.HEADING_ORDER.map((key) => "<option value='" + key + "'" + ((item.heading || LQ.normaliseHeading(item).key) === key ? " selected" : "") + ">" + esc(LQ.HEADING_LABEL[key].en) + " " + esc(LQ.HEADING_LABEL[key].zh) + "</option>").join("") + "</select></td>" +
        "<td><input data-row='" + index + "' data-field='leftWidth' value='" + esc(item.leftWidth) + "'></td>" +
        "<td><input data-row='" + index + "' data-field='rightWidth' value='" + esc(item.rightWidth) + "'></td>" +
        "<td><select data-row='" + index + "' data-field='draw'>" + Object.keys(LQ.DRAW_LABEL).map((key) => "<option value='" + key + "'" + (item.draw === key ? " selected" : "") + ">" + LQ.DRAW_LABEL[key].en + "</option>").join("") + "</select></td>" +
        "<td><select data-row='" + index + "' data-field='widthBasis'><option value=''" + (!item.widthBasis ? " selected" : "") + ">Choose</option><option value='track'" + (item.widthBasis === "track" ? " selected" : "") + ">Track</option><option value='finished'" + (item.widthBasis === "finished" ? " selected" : "") + ">Finished</option></select></td>" +
        "<td><input data-row='" + index + "' data-field='location' value='" + esc(item.location || item.name) + "'></td>" +
        "<td><input data-row='" + index + "' data-field='quantity' value='" + esc(item.quantity) + "'></td>" +
        "<td><button type='button' class='btn alt' data-act='dup' data-index='" + index + "'>Clone</button> <button type='button' class='btn alt' data-act='expand' data-index='" + index + "'>Expand</button> <button type='button' class='btn alt' data-act='remove' data-index='" + index + "'>Del</button></td></tr>" +
        "<tr><td colspan='12' class='note'>" + esc(result ? result.usageMetersPerPiece + " m · ¥" + result.pricing.lineCny.toFixed(2) : "") + (warn ? " · " + esc(warn) : "") + (err ? " · " + esc(err) : "") + "</td></tr>";
    }).join("");
    const total = windows.reduce((sum, item) => { const result = computeDraft(item); return sum + (result ? result.pricing.lineCny : 0); }, 0);
    return "<h1>" + t("Table", "表格") + "</h1><p class='lede'>" + t("One row per window. Paste tab-separated rows below: location, width, height, unit, draw, model id, quantity.", "一行一窗。可粘贴制表符分隔：位置、宽、高、单位、开合、型号、数量。") + "</p>" +
      "<div style='overflow:auto'><table class='grid'>" + head + body + "</table></div>" +
      "<p><button class='btn brass' type='button' data-act='add-row'>" + t("Add row", "加一行") + "</button></p>" +
      "<label class='field'>" + bi("Paste from Excel", "从 Excel 粘贴") + "<textarea id='paste'></textarea></label>" +
      "<p><button class='btn alt' type='button' data-act='paste'>" + t("Import rows", "导入") + "</button></p>" +
      "<p><b>CNY ¥" + total.toFixed(2) + "</b> · " + esc(LQ.FREIGHT_NOTE) + " · " + esc(LQ.ESTIMATE_MARK) + "</p>";
  }

  function reviewView() {
    const preview = buildOrder();
    preview.number = t("Assigned on submit", "提交时生成");
    const cards = preview.windows.map((line, index) => {
      const lining = line.result.lining && line.result.lining.id !== "none" ? "<p>" + t("Lining", "里布") + " " + line.result.lining.usageMeters + " m × " + line.input.quantity + " × ¥" + line.result.lining.rate + " = ¥" + line.result.pricing.liningCny.toFixed(2) + "</p>" : "";
      const cut = line.fabric && line.fabric.fabricPriceCnyPerM != null ? "<p>" + esc(LQ.CUT_FABRIC_LABEL) + " ¥" + line.fabric.fabricPriceCnyPerM + "/m · not included in the curtain total / 不计入窗帘合计</p>" : "";
      return "<article class='card'><h2 style='margin:0 0 6px'>" + (index + 1) + ". " + esc(line.input.name) + "</h2><p>" + esc(LQ.headingSummary(line.input).en) + " · " + line.result.widthCm + " × " + line.result.heightCm + " cm · ×" + line.input.quantity + "</p><p>" + esc(line.fabric.model) + " " + esc(line.fabric.version) + "</p>" + cut + "<p>" + t("Curtain", "窗帘") + " " + line.result.usageMetersPerPiece + " m × " + line.input.quantity + " × ¥" + line.result.pricing.priceCnyPerM + " = ¥" + line.result.pricing.curtainCny.toFixed(2) + "</p>" + lining + "<p>" + t("Line", "本窗") + " ¥" + line.result.pricing.lineCny.toFixed(2) + "</p>" + line.result.warnings.map((warning) => "<p class='warn'>" + esc(warning.en) + " / " + esc(warning.zh) + "</p>").join("") + "</article>";
    }).join("");
    const hardwareCny = preview.windows.reduce((sum, line) => sum + line.result.pricing.trackCny + line.result.pricing.motorCny + line.result.pricing.tiebackCny, 0);
    const foreign = preview.settlement.foreign != null ? "<p class='estimate'>" + esc(LQ.ESTIMATE_MARK) + "</p><p>" + preview.currency + " " + preview.settlement.foreign.toFixed(2) + "</p>" : "";
    return "<h1>" + t("Review and send", "核对后提交") + "</h1><p>" + esc(customer.name) + " · " + esc(customer.city) + ", " + esc(customer.country) + "<br>" + esc(customer.tradeTerm) + " · " + esc(customer.currency) + " · " + esc(customer.deliveryDate) + "</p>" + cards +
      "<div class='card' style='background:#1e3a34;color:#f7f3ea'><p>" + t("Total in CNY", "人民币合计") + " ¥" + preview.cnyTotal.toFixed(2) + "</p><p>" + t("Hardware in that total", "其中五金") + " ¥" + hardwareCny.toFixed(2) + " · " + esc(LQ.ESTIMATE_MARK) + "</p>" + foreign + "<p class='note'>" + esc(LQ.NOT_A_QUOTE.en) + " / " + esc(LQ.NOT_A_QUOTE.zh) + "</p><p class='note'>" + esc(LQ.FX_NOTE) + "</p></div>" + errorList();
  }

  function confirmView() {
    const raw = sessionStorage.getItem("lq-confirm");
    const order = raw ? JSON.parse(raw) : null;
    if (!order) return "<p>" + t("No order on this page yet.", "这一页还没有订单。") + "</p>";
    return "<div class='no-print'><h1>" + t("Order received", "订单已记下") + "</h1><p class='lede'>" + esc(order.number) + "</p><p>" + esc(sentNote) + "</p><p><button class='btn' type='button' onclick='window.print()'>" + t("Print / Save PDF", "打印 / 存 PDF") + "</button> <a class='btn alt' style='display:inline-block;text-decoration:none' id='json-link'>" + t("Download JSON", "下载 JSON") + "</a></p></div><div id='print-root'>" + LQSheet.sheetsHtml(order) + "</div>";
  }

  function errorList() {
    if (!problems.length) return "";
    return "<ul class='errors'>" + problems.map((problem) => "<li>" + esc(problem) + "</li>").join("") + "</ul>";
  }

  function calcView() {
    const active = phase === "edit" ? draft : null;
    const result = active ? computeDraft(active) : null;
    const saved = windows.reduce((sum, item) => {
      const computed = computeDraft(item);
      return sum + (computed ? computed.pricing.lineCny : 0);
    }, 0);
    const settlement = LQ.settle(Math.round(saved * 100) / 100, customer.currency, rateFor(customer.currency), null);
    let html = "<p class='k'>CALCULATION</p>";
    if (result) {
      const blocked = result.errors.find((error) => error.code === "fixed-height");
      if (blocked) html += "<div class='errors' data-block='fixed-height'><b>" + esc(blocked.en) + "</b><br>" + esc(blocked.zh) + "<br>This window cannot be submitted. / 此窗无法提交。</div>";
      html += "<p class='big'>" + result.usageMetersPerPiece.toFixed(3) + " m</p><p class='note'>" + t("Face fabric used for the curtain price, per piece", "窗帘成品价按此用料") + "</p>";
      html += "<p>" + t("Cut width", "裁宽") + " " + result.cutWidthCm + " cm · " + t("Fullness", "丰满度") + " " + Number(result.fullnessDisplay).toFixed(1) + "x</p>";
      html += "<p>" + (result.totalGliders ? t("Gliders", "滑轮") + " " + result.totalGliders + " · " + t("Folds", "褶") + " " + result.totalCount : result.totalRings ? t("Rings", "环") + " " + result.totalRings + " · " + t("Folds", "褶") + " " + result.totalCount : t("Pleats", "褶") + " " + result.totalCount + " · " + t("Hooks", "钩") + " " + result.totalHooks) + "</p>";
      if (active.fabricId && result.pricing.priceCnyPerM) html += "<p>" + t("Curtain", "窗帘") + " ¥" + result.pricing.curtainCny.toFixed(2) + "</p>";
      if (result.pricing.cutFabricCnyPerM != null) html += "<p class='note'>" + esc(LQ.CUT_FABRIC_LABEL) + " ¥" + result.pricing.cutFabricCnyPerM + "/m · not included in the curtain total / 不计入窗帘合计</p>";
      if (result.lining && result.lining.id !== "none") html += "<p>" + t("Lining", "里布") + " " + result.lining.usageMeters + " m × ¥" + result.lining.rate + " = ¥" + result.pricing.liningCny.toFixed(2) + "</p>";
      if (result.pricing.trackCny || result.pricing.motorCny) html += "<p class='estimate'>" + esc(LQ.ESTIMATE_MARK) + " · " + t("Hardware", "五金") + " ¥" + (result.pricing.trackCny + result.pricing.motorCny).toFixed(2) + "</p>";
      if (active.fabricId) html += "<p>" + t("This window", "本窗") + " ¥" + result.pricing.lineCny.toFixed(2) + "</p>";
      shownErrors(result).filter((error) => error.code !== "fixed-height").forEach((error) => { html += "<p class='warn'>" + esc(error.en) + " / " + esc(error.zh) + "</p>"; });
      result.warnings.forEach((warning) => { html += "<p class='warn'>" + esc(warning.en) + " / " + esc(warning.zh) + "</p>"; });
    } else html += "<p class='note'>" + t("Enter width and height to see the cloth usage.", "填好宽高后，这里会显示用料。") + "</p>";
    html += "<p style='border-top:1px solid var(--line);padding-top:8px'>" + t("Saved windows", "已保存窗位") + " " + windows.length + "</p>";
    if (!windows.length) html += "<p class='note'>" + t("The CNY total appears after a window is saved.", "保存窗位后这里显示人民币合计。") + "</p>";
    else {
      html += "<p><b>CNY ¥" + saved.toFixed(2) + "</b></p>";
      if (settlement.foreign != null) html += "<p class='estimate'>" + esc(LQ.ESTIMATE_MARK) + "</p><p>" + customer.currency + " " + settlement.foreign.toFixed(2) + "</p>";
    }
    html += "<p class='note'>" + esc(LQ.NOT_A_QUOTE.en) + " / " + esc(LQ.NOT_A_QUOTE.zh) + "</p>";
    if (customer.currency !== "CNY") html += "<p class='note'>" + esc(LQ.FX_NOTE) + "</p>";
    return html;
  }

  function readInputs() {
    document.querySelectorAll("[data-c]").forEach((el) => { customer[el.dataset.c] = el.type === "checkbox" ? el.checked : el.value; });
    if (draft) document.querySelectorAll("[data-w]").forEach((el) => { draft[el.dataset.w] = el.value; });
    document.querySelectorAll("[data-row]").forEach((el) => {
      const row = windows[Number(el.dataset.row)];
      if (row) row[el.dataset.field] = el.value;
    });
  }
  function persist() {
    localStorage.setItem("lq-static-draft", JSON.stringify({ customer, windows }));
    localStorage.setItem("lq-lang", lang);
  }
  function saveWindow() {
    const fabric = fabricById(draft.fabricId, draft.colorNumber);
    const result = LQ.computeWindow(toInput(draft), fabric, rules(), LQ.DEFAULT_HARDWARE_PRICES);
    if (result.errors.length) {
      revealErrors = true;
      problems = result.errors.map((error) => error.en + " / " + error.zh);
      return;
    }
    if (editIndex === null) windows.push({ ...draft });
    else windows[editIndex] = { ...draft };
    draft = null;
    phase = "list";
    problems = [];
    persist();
  }
  async function submit() {
    problems = customerErrors();
    windows.forEach((item, index) => {
      const result = LQ.computeWindow(toInput(item), fabricById(item.fabricId, item.colorNumber), rules(), LQ.DEFAULT_HARDWARE_PRICES);
      result.errors.forEach((error) => problems.push(t("Window", "窗位") + " " + (index + 1) + ": " + error.en + " / " + error.zh));
    });
    if (!windows.length) problems.push(t("Add at least one window.", "请至少添加一个窗位。"));
    if (problems.length) { render(); return; }
    const order = buildOrder();
    busy = true;
    render();
    const html = LQSheet.orderToDocument(order);
    const json = JSON.stringify(order, null, 2);
    const body = new FormData();
    body.append("_subject", "LAN QUEEN Order " + order.number + " - " + customer.name);
    body.append("_replyto", customer.email.trim());
    body.append("_template", "box");
    body.append("_captcha", "false");
    body.append("email", customer.email.trim());
    body.append("order_number", order.number);
    body.append("customer_name", customer.name);
    body.append("message", LQSheet.orderToText(order));
    body.append("order_sheet", new Blob([html], { type: "text/html" }), order.number + ".html");
    body.append("order_json", new Blob([json], { type: "application/json" }), order.number + ".json");
    body.append("_honey", "");
    let note = t("A copy was sent to LAN QUEEN. Keep this page or print it.", "已发送给兰客厅。请保存或打印本页。");
    try {
      const response = await fetch(MAIL, { method: "POST", headers: { Accept: "application/json" }, body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "FormSubmit " + response.status);
      if (data.message) note += " " + data.message;
    } catch (error) {
      note = t("The mailbox did not accept the order yet. Your summary is still on this page — print it and send the JSON to the studio.", "邮箱暂时没有收下订单。本页仍可打印，也可把 JSON 发给工作室。") + " (" + error.message + ")";
    }
    sessionStorage.setItem("lq-confirm", JSON.stringify(order));
    sentNote = note;
    busy = false;
    phase = "confirm";
    location.hash = "confirm";
    render();
    const link = document.querySelector("#json-link");
    if (link) {
      link.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      link.download = order.number + ".json";
    }
  }

  document.addEventListener("click", (event) => {
    const langButton = event.target.closest("[data-lang]");
    if (langButton && langButton.closest(".lang")) {
      lang = langButton.dataset.lang;
      persist();
      render();
      return;
    }
    const choiceButton = event.target.closest("[data-cset],[data-wset]");
    if (choiceButton) {
      readInputs();
      if (choiceButton.dataset.cset) customer[choiceButton.dataset.cset] = choiceButton.dataset.value;
      if (choiceButton.dataset.wset && draft) {
        const numeric = choiceButton.dataset.wset === "gliderPitch" || choiceButton.dataset.wset === "fabricPerPleat" || choiceButton.dataset.wset === "colorNumber";
        draft[choiceButton.dataset.wset] = numeric ? Number(choiceButton.dataset.value) : choiceButton.dataset.value;
        if (choiceButton.dataset.wset === "heading") {
          draft.heading = choiceButton.dataset.value;
          if (LQ.HEADING_LABEL[draft.heading] && LQ.HEADING_LABEL[draft.heading].rule === "grommet") draft.fabricPerPleat = 30;
        }
        if (choiceButton.dataset.wset === "category") {
          const row = catalog.find((item) => item.id === draft.fabricId);
          if (!row || row.category !== draft.category) draft.fabricId = "";
          draft.colorNumber = "";
        }
      }
      persist();
      render();
      return;
    }
    const act = event.target.closest("[data-act]");
    if (!act) return;
    readInputs();
    const action = act.dataset.act;
    if (action === "back") {
      problems = [];
      if (phase === "edit") { if (step > 0) step -= 1; else phase = "list"; }
      else if (phase === "table") phase = "list";
      else if (phase === "list") phase = "customer";
      else if (phase === "review") phase = "list";
    }
    if (action === "windows") {
      problems = customerErrors();
      if (!problems.length) phase = "list";
    }
    if (action === "add") { draft = blankWindow(); editIndex = null; step = 0; phase = "edit"; problems = []; }
    if (action === "table") phase = "table";
    if (action === "add-row") windows.push(blankWindow());
    if (action === "dup") windows.splice(Number(act.dataset.index) + 1, 0, JSON.parse(JSON.stringify(windows[Number(act.dataset.index)])));
    if (action === "expand") {
      const index = Number(act.dataset.index);
      const item = windows[index];
      const count = Math.max(1, Math.round(Number(item.quantity) || 1));
      if (count > 1) {
        const copies = [];
        for (let i = 0; i < count; i++) {
          const copy = JSON.parse(JSON.stringify(item));
          copy.quantity = "1";
          const label = item.location || item.name || "Window";
          copy.location = label + " " + (i + 1);
          copy.name = copy.location;
          copies.push(copy);
        }
        windows.splice(index, 1, ...copies);
      }
    }
    if (action === "paste") {
      const raw = (document.querySelector("#paste") || {}).value || "";
      raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
        const cells = line.split("\t");
        if (/location/i.test(cells[0])) return;
        const row = blankWindow();
        row.location = cells[0] || "";
        row.name = row.location || "Window";
        row.width = cells[1] || "";
        row.height = cells[2] || "";
        row.unit = cells[3] || "mm";
        row.draw = LQ.normaliseDraw(cells[4] || "double");
        const model = LQ.findFabric(catalog, cells[5] || "", cells[6] || null);
        row.fabricId = model ? model.id : (cells[5] || "");
        row.colorNumber = cells[6] || "";
        row.quantity = cells[7] || "1";
        windows.push(row);
      });
    }
    if (action === "edit") { editIndex = Number(act.dataset.index); draft = { ...windows[editIndex] }; step = 0; phase = "edit"; problems = []; }
    if (action === "remove") windows.splice(Number(act.dataset.index), 1);
    if (action === "review") phase = "review";
    if (action === "next") {
      const stepFields = { 0: ["fabricId", "colorNumber"], 1: ["width", "height", "unit"], 6: ["return", "overlap"] };
      if (step < STEPS.length - 1) {
        const result = draftResultSafe();
        const fields = stepFields[step] || [];
        const bad = result ? result.errors.filter((error) => fields.includes(error.field)) : [];
        if (bad.length) {
          revealErrors = true;
          problems = bad.map((error) => error.en + " / " + error.zh);
        } else {
          step += 1;
          problems = [];
        }
      } else saveWindow();
    }
    if (action === "submit") { submit(); return; }
    persist();
    render();
  });
  function draftResultSafe() {
    return draft ? LQ.computeWindow(toInput(draft), fabricById(draft.fabricId, draft.colorNumber), rules(), LQ.DEFAULT_HARDWARE_PRICES) : null;
  }
  function paintInline() {
    const result = draftResultSafe();
    document.querySelectorAll(".err-inline").forEach((el) => {
      const list = result ? shownErrors(result).filter((error) => error.field === el.dataset.for) : [];
      el.innerHTML = list.map((error) => esc(error.en) + " / " + esc(error.zh)).join("<br>");
    });
  }
  document.addEventListener("input", (event) => {
    const previousFabric = draft ? draft.fabricId : "";
    readInputs();
    if (draft && event.target && event.target.dataset.w === "fabricId" && draft.fabricId !== previousFabric) draft.colorNumber = "";
    if (phase === "edit" || phase === "customer") {
      persist();
      const calc = document.querySelector("#calc");
      if (calc) calc.innerHTML = calcView();
      if (phase === "edit") paintInline();
    }
  });

  const saved = localStorage.getItem("lq-static-draft");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      customer = { ...blankCustomer(), ...(parsed.customer || {}) };
      windows = Array.isArray(parsed.windows) ? parsed.windows : [];
    } catch (error) { /* ignore a broken draft */ }
  }

  Promise.all([fetch("data/catalog.json").then((r) => r.json()), fetch("data/rates.json").then((r) => r.json())]).then(([fabrics, rateFile]) => {
    catalog = fabrics;
    rates = rateFile.rates;
    if (location.hash === "#confirm" && sessionStorage.getItem("lq-confirm")) phase = "confirm";
    render();
  }).catch(() => {
    document.querySelector("#app").innerHTML = "<p>Could not load the fabric list. Open this page over http, not as a loose file. / 面料库没有加载。请通过网页打开，不要直接双击文件。</p>";
  });
})();

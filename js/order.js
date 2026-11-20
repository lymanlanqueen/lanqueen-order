/* Customer order form for GitHub Pages. No build step. */
(function () {
  const MAIL = "https://formsubmit.co/ajax/28318330@qq.com";
  const STEPS = [
    ["Heading", "帘头"],
    ["Size", "尺寸"],
    ["Fullness", "丰满度"],
    ["Draw", "开合"],
    ["Hem", "下摆"],
    ["Return", "包边"],
    ["Tieback", "绑带"],
    ["Cloth & hardware", "面料五金"],
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

  function blankCustomer() {
    return { name: "", country: "", city: "", address: "", email: "", messenger: "", deliveryDate: "", currency: "USD", tradeTerm: "FOB", shippingMethod: "sea", remarks: "" };
  }
  function blankWindow() {
    return {
      name: "", headingFamily: "pinch", pinchStyle: "double-pinch", rippleTape: "rivet",
      orientation: "fixed-height", lining: "none", topFinish: "none", width: "", height: "", unit: "m",
      fabricPerPleat: 24, gliderPitch: 6, hookSpacingCm: 10, draw: "double", hem: "8+2",
      returnCm: "5", overlapCm: "5", tieback: "none", tiebackRemark: "", hardware: "customer",
      rodColor: "white", motorSide: "left", plugStandard: "AU", quantity: "1", fabricId: "", remarks: "", category: "blackout",
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
  function toInput(source) {
    return {
      name: source.name, headingFamily: source.headingFamily, pinchStyle: source.pinchStyle, rippleTape: source.rippleTape,
      orientation: source.orientation, lining: source.lining, topFinish: source.topFinish,
      width: Number(source.width), height: Number(source.height), unit: source.unit,
      fabricPerPleat: source.headingFamily === "grommet" ? 30 : Number(source.fabricPerPleat),
      gliderPitch: Number(source.gliderPitch), hookSpacingCm: Number(source.hookSpacingCm),
      draw: source.draw, hem: source.hem, returnCm: Number(source.returnCm), overlapCm: Number(source.overlapCm),
      tieback: source.tieback, tiebackRemark: source.tiebackRemark, hardware: source.hardware,
      rodColor: source.hardware === "roman-rod" ? source.rodColor : undefined,
      motorSide: source.hardware === "electric-track" ? source.motorSide : undefined,
      plugStandard: source.hardware === "electric-track" ? source.plugStandard : undefined,
      quantity: Number(source.quantity), fabricId: source.fabricId, remarks: source.remarks,
    };
  }
  function fabricById(id) {
    const row = catalog.find((item) => item.id === id);
    if (!row) return null;
    return {
      id: row.id, category: row.category, model: row.model, nameEn: row.nameEn, nameZh: row.nameZh,
      version: row.version, widthCm: row.widthCm, priceCnyPerM: row.priceCnyPerM, fabricPriceCnyPerM: row.fabricPriceCnyPerM,
    };
  }
  function computeDraft(source) {
    if (source.width === "" || source.height === "") return null;
    return LQ.computeWindow(toInput(source), fabricById(source.fabricId), LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
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
      const fabric = fabricById(item.fabricId);
      const result = LQ.computeWindow(toInput(item), fabric, LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
      return { input: toInput(item), result, fabric };
    });
    const cnyTotal = Math.round(lines.reduce((sum, line) => sum + line.result.pricing.lineCny, 0) * 100) / 100;
    const quote = rateFor(customer.currency);
    const settlement = LQ.settle(cnyTotal, customer.currency, quote, null);
    return {
      number: orderNumber(),
      createdAt: new Date().toISOString(),
      channel: "overseas-pages",
      customer: { ...customer },
      currency: customer.currency,
      cnyTotal,
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
    root.innerHTML = phase === "customer" ? customerView() : phase === "list" ? listView() : phase === "edit" ? editView() : reviewView();
    calc.innerHTML = calcView();
    const bar = document.querySelector("#bar-inner");
    const err = problems[0] ? "<p class='err'>" + esc(problems[0]) + "</p>" : "";
    let next = "";
    if (phase === "customer") next = "<button class='btn' type='button' data-act='windows'>" + t("Windows", "填写窗位") + "</button>";
    if (phase === "list") next = "<button class='btn' type='button' data-act='review'" + (windows.length ? "" : " disabled") + ">" + t("Review order", "核对订单") + "</button>";
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
      field("WhatsApp / WeChat", "WhatsApp / 微信", "<input data-c='messenger' value='" + esc(customer.messenger) + "'>") + "</div>" +
      "<p class='field'>" + bi("Currency", "结算币种") + "</p><div class='choices'>" + currencies.map((code) => {
        const rate = rateFor(code);
        return choice(customer.currency === code, "data-cset='currency' data-value='" + code + "'", code + (rate ? "<small>1 = " + rate.rateCny + " CNY</small>" : "<small>人民币</small>"));
      }).join("") + "</div><div class='grid2' style='margin-top:12px'><div><p class='field'>" + bi("Trade term", "贸易术语") + "</p><div class='choices'>" +
      LQ.DEFAULT_RULES.tradeTerms.map((term) => choice(customer.tradeTerm === term, "data-cset='tradeTerm' data-value='" + term + "'", term)).join("") +
      "</div></div><div><p class='field'>" + bi("Shipping method", "运输方式") + "</p><div class='choices one'>" +
      LQ.DEFAULT_RULES.shippingMethods.map((method) => choice(customer.shippingMethod === method.id, "data-cset='shippingMethod' data-value='" + method.id + "'", bi(method.en, method.zh))).join("") +
      "</div></div></div>" + field("Notes for the studio", "给工作室的备注", "<textarea data-c='remarks'>" + esc(customer.remarks) + "</textarea>") + errorList();
  }

  function listView() {
    const cards = windows.map((item, index) => {
      const fabric = fabricById(item.fabricId);
      const head = LQ.headingSummary(toInput(item));
      return "<article class='card'><p class='note'>" + t("Window", "窗位") + " " + (index + 1) + "</p><h2 style='margin:4px 0'>" + esc(item.name || t("Untitled", "未命名")) + "</h2><p>" + esc(head.en) + " / " + esc(head.zh) + " · " + esc(item.width || "—") + " × " + esc(item.height || "—") + " " + esc(item.unit) + " · ×" + esc(item.quantity) + "</p><p>" + (fabric ? esc(fabric.model) + " · " + esc(fabric.version) : t("No fabric", "未选面料")) + "</p><button class='btn alt' type='button' data-act='edit' data-index='" + index + "'>" + t("Edit", "修改") + "</button> <button class='btn alt' type='button' data-act='remove' data-index='" + index + "'>" + t("Remove", "删除") + "</button></article>";
    }).join("");
    return "<h1>" + t("Windows", "窗位") + "</h1><p class='lede'>" + t("One card per window. Use quantity when several windows are identical.", "每个窗户单独做一条。相同规格可以填数量。") + "</p>" +
      (windows.length ? cards : "<p class='card'>" + t("No windows yet. Start with the living room or the main bedroom.", "还没有窗位。从客厅或主卧开始。") + "</p>") +
      "<p><button class='btn brass' type='button' data-act='add'>" + t("Add a window", "添加窗位") + "</button></p>" + errorList();
  }

  function editView() {
    const rules = LQ.DEFAULT_RULES;
    let body = "<p class='note'>WINDOW · " + (step + 1) + "/" + STEPS.length + "</p><h1>" + t(STEPS[step][0], STEPS[step][1]) + "</h1><div class='steps'>" + STEPS.map((_, index) => "<i class='" + (index === step ? "on" : index < step ? "done" : "") + "'></i>").join("") + "</div>";
    if (step === 0) {
      body += field("Window name", "窗位名称", "<input data-w='name' placeholder='" + t("Living room", "客厅") + "' value='" + esc(draft.name) + "'>");
      body += "<div class='choices'>" + rules.enabledFamilies.map((family) => choice(draft.headingFamily === family, "data-wset='headingFamily' data-value='" + family + "'", bi(LQ.FAMILY_LABEL[family].en, LQ.FAMILY_LABEL[family].zh))).join("") + "</div>";
      if (draft.headingFamily === "pinch") {
        LQ.PINCH_GROUP.forEach((group) => {
          const styles = group.styles.filter((style) => rules.enabledPinch.includes(style));
          if (!styles.length) return;
          body += "<p class='note'>" + esc(group.zh) + " / " + esc(group.en) + "</p><div class='choices'>" + styles.map((style) => choice(draft.pinchStyle === style, "data-wset='pinchStyle' data-value='" + style + "'", bi(LQ.PINCH_LABEL[style].en, LQ.PINCH_LABEL[style].zh))).join("") + "</div>";
        });
      }
      if (draft.headingFamily === "ripple") {
        body += "<div class='choices'>" + rules.enabledRippleTapes.map((tape) => choice(draft.rippleTape === tape, "data-wset='rippleTape' data-value='" + tape + "'", bi(LQ.TAPE_LABEL[tape].en, LQ.TAPE_LABEL[tape].zh))).join("") + "</div>";
      }
      body += "<div class='choices'>" + Object.keys(LQ.ORIENTATION_LABEL).map((key) => choice(draft.orientation === key, "data-wset='orientation' data-value='" + key + "'", bi(LQ.ORIENTATION_LABEL[key].en, LQ.ORIENTATION_LABEL[key].zh))).join("") + "</div>";
      body += "<div class='choices'>" + Object.keys(LQ.LINING_LABEL).map((key) => choice(draft.lining === key, "data-wset='lining' data-value='" + key + "'", bi(LQ.LINING_LABEL[key].en, LQ.LINING_LABEL[key].zh))).join("") + "</div>";
      body += "<div class='choices'>" + Object.keys(LQ.TOP_LABEL).map((key) => choice(draft.topFinish === key, "data-wset='topFinish' data-value='" + key + "'", bi(LQ.TOP_LABEL[key].en, LQ.TOP_LABEL[key].zh))).join("") + "</div>";
    }
    if (step === 1) {
      body += "<p class='note'>" + t("Height is measured from the top of the fabric down to the finished hem.", "高度从面料上沿量到成品下沿。") + "</p>";
      body += "<div class='choices'>" + Object.keys(LQ.UNIT_LABEL).map((unit) => choice(draft.unit === unit, "data-wset='unit' data-value='" + unit + "'", bi(LQ.UNIT_LABEL[unit].en, LQ.UNIT_LABEL[unit].zh))).join("") + "</div>";
      body += "<div class='grid2'>" + field("Finished width", "成品宽", "<input data-w='width' inputmode='decimal' value='" + esc(draft.width) + "'>") + field("Finished height", "成品高", "<input data-w='height' inputmode='decimal' value='" + esc(draft.height) + "'>") + "</div>";
    }
    if (step === 2) {
      if (draft.headingFamily === "ripple") {
        body += "<p class='note'>" + t("Glider pitch. 6 cm is the usual choice.", "滑轮间距，6 厘米为推荐。") + "</p><div class='choices'>" + [5.4, 6, 7, 8, 9, 10].map((pitch) => choice(Number(draft.gliderPitch) === pitch, "data-wset='gliderPitch' data-value='" + pitch + "'", pitch + " cm" + (pitch === 6 ? " ★" : ""))).join("") + "</div>";
      } else {
        body += field("Hook spacing 8–12 cm", "挂钩间距 8–12 厘米", "<input data-w='hookSpacingCm' inputmode='decimal' value='" + esc(draft.hookSpacingCm) + "'>");
      }
      body += "<p class='note'>" + t("Fabric per pleat. 24 cm is about 2.2× and is the default. Grommets are locked to 30 cm.", "褶用料。24 厘米约 2.2 倍，为默认。打孔锁定 30 厘米。") + "</p><div class='choices'>";
      [[22, "≈1.9×"], [24, "≈2.2×"], [30, "≈2.8×"]].forEach((item) => {
        const current = draft.headingFamily === "grommet" ? 30 : Number(draft.fabricPerPleat);
        body += choice(current === item[0], "data-wset='fabricPerPleat' data-value='" + item[0] + "'", item[0] + " cm " + item[1] + (item[0] === 24 ? " ★" : ""));
      });
      body += "</div>";
    }
    if (step === 3) body += "<div class='choices one'>" + Object.keys(LQ.DRAW_LABEL).map((key) => choice(draft.draw === key, "data-wset='draw' data-value='" + key + "'", bi(LQ.DRAW_LABEL[key].en, LQ.DRAW_LABEL[key].zh))).join("") + "</div>";
    if (step === 4) body += "<div class='choices one'>" + Object.keys(LQ.HEM_LABEL).map((key) => choice(draft.hem === key, "data-wset='hem' data-value='" + key + "'", bi(LQ.HEM_LABEL[key].en, LQ.HEM_LABEL[key].zh))).join("") + "</div>";
    if (step === 5) {
      body += "<p class='note'>" + t("A 5 cm return is already in the allowance. Only the extra is added, on every panel. Overlap applies to a double draw only.", "标准 5 厘米已经含在损耗里，只加超出部分。重叠只在双开时计算。") + "</p>";
      body += field("Return (cm)", "包边（厘米）", "<input data-w='returnCm' inputmode='decimal' value='" + esc(draft.returnCm) + "'>");
      body += draft.draw === "double" ? field("Overlap (cm)", "重叠（厘米）", "<input data-w='overlapCm' inputmode='decimal' value='" + esc(draft.overlapCm) + "'>") : "<p class='note'>" + t("Overlap is not used on a single draw.", "单开不计重叠。") + "</p>";
    }
    if (step === 6) {
      body += "<div class='choices'>" + Object.keys(LQ.TIEBACK_LABEL).map((key) => choice(draft.tieback === key, "data-wset='tieback' data-value='" + key + "'", bi(LQ.TIEBACK_LABEL[key].en, LQ.TIEBACK_LABEL[key].zh))).join("") + "</div>";
      if (draft.tieback === "custom") body += field("Describe the tieback", "绑带说明", "<textarea data-w='tiebackRemark'>" + esc(draft.tiebackRemark) + "</textarea>");
    }
    if (step === 7) {
      body += "<div class='choices'>" + ["blackout", "sheer"].map((category) => choice(draft.category === category, "data-wset='category' data-value='" + category + "'", bi(LQ.CATEGORY_LABEL[category].en, LQ.CATEGORY_LABEL[category].zh))).join("") + "</div>";
      body += "<div class='choices one' style='margin-top:8px'>" + catalog.filter((item) => item.category === draft.category).map((fabric) => choice(draft.fabricId === fabric.id, "data-wset='fabricId' data-value='" + fabric.id + "'", "<b>" + esc(fabric.model) + "</b><small>" + esc(fabric.version) + " · " + fabric.widthM + " m · " + t("Finished", "成品") + " ¥" + fabric.finishedPriceCnyPerM + "/m · " + t("Cloth", "面料") + " ¥" + fabric.fabricPriceCnyPerM + "/m</small>")).join("") + "</div>";
      body += "<div class='choices one' style='margin-top:8px'>" + Object.keys(LQ.HARDWARE_LABEL).map((key) => choice(draft.hardware === key, "data-wset='hardware' data-value='" + key + "'", bi(LQ.HARDWARE_LABEL[key].en, LQ.HARDWARE_LABEL[key].zh))).join("") + "</div>";
      if (draft.hardware === "roman-rod") body += "<div class='choices'>" + Object.keys(LQ.ROD_LABEL).map((key) => choice(draft.rodColor === key, "data-wset='rodColor' data-value='" + key + "'", bi(LQ.ROD_LABEL[key].en, LQ.ROD_LABEL[key].zh))).join("") + "</div>";
      if (draft.hardware === "electric-track") {
        body += "<p class='note'>" + t("Motorized orders use the white electric track and a remote only.", "电动只配白色专用轨道，控制方式只有遥控。") + "</p><div class='choices'>" +
          choice(draft.motorSide === "left", "data-wset='motorSide' data-value='left'", bi("Motor left", "电机在左")) +
          choice(draft.motorSide === "right", "data-wset='motorSide' data-value='right'", bi("Motor right", "电机在右")) + "</div><div class='choices'>" +
          rules.plugStandards.map((plug) => choice(draft.plugStandard === plug, "data-wset='plugStandard' data-value='" + plug + "'", plug)).join("") + "</div>";
      }
      body += field("Quantity", "数量", "<input data-w='quantity' inputmode='numeric' value='" + esc(draft.quantity) + "'>");
      body += field("Remarks for this window", "本窗备注", "<textarea data-w='remarks'>" + esc(draft.remarks) + "</textarea>");
    }
    return body + errorList();
  }

  function reviewView() {
    const preview = buildOrder();
    preview.number = t("Assigned on submit", "提交时生成");
    const cards = preview.windows.map((line, index) => "<article class='card'><h2 style='margin:0 0 6px'>" + (index + 1) + ". " + esc(line.input.name) + "</h2><p>" + esc(LQ.headingSummary(line.input).en) + " · " + line.result.widthCm + " × " + line.result.heightCm + " cm · ×" + line.input.quantity + "</p><p>" + esc(line.fabric.model) + " " + esc(line.fabric.version) + "</p><p>" + t("Priced usage", "计价用料") + " " + line.result.usageMetersPerPiece + " m × " + line.input.quantity + " = " + line.result.usageMetersPriced + " m</p><p>" + t("Line", "本窗") + " ¥" + line.result.pricing.lineCny.toFixed(2) + "</p>" + line.result.warnings.map((warning) => "<p class='warn'>" + esc(lang === "zh" ? warning.zh : warning.en) + "</p>").join("") + "</article>").join("");
    const foreign = preview.settlement.foreign != null ? "<p>" + t("Estimated", "估算") + " " + preview.currency + " " + preview.settlement.foreign.toFixed(2) + "</p>" : "";
    return "<h1>" + t("Review and send", "核对后提交") + "</h1><p>" + esc(customer.name) + " · " + esc(customer.city) + ", " + esc(customer.country) + "<br>" + esc(customer.tradeTerm) + " · " + esc(customer.currency) + " · " + esc(customer.deliveryDate) + "</p>" + cards +
      "<div class='card' style='background:#1e3a34;color:#f7f3ea'><p>" + t("Total in CNY", "人民币合计") + " ¥" + preview.cnyTotal.toFixed(2) + "</p>" + foreign + "<p class='note'>" + esc(LQ.FX_NOTE) + "</p></div>" + errorList();
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
      html += "<p class='big'>" + result.usageMetersPerPiece.toFixed(3) + " m</p><p class='note'>" + t("Fabric used for the price, per piece", "单套计价用料") + "</p>";
      html += "<p>" + t("Cut width", "裁宽") + " " + result.cutWidthCm + " cm · " + t("Fullness", "丰满度") + " " + result.fullnessDisplay + "x</p>";
      html += "<p>" + (result.totalGliders ? t("Gliders", "滑轮") + " " + result.totalGliders + " · " + t("Folds", "褶") + " " + result.totalCount : result.totalRings ? t("Rings", "环") + " " + result.totalRings : t("Pleats", "褶") + " " + result.totalCount + " · " + t("Hooks", "钩") + " " + result.totalHooks) + "</p>";
      if (active.fabricId) html += "<p>" + t("This window", "本窗") + " ¥" + result.pricing.lineCny.toFixed(2) + "</p>";
      result.warnings.forEach((warning) => { html += "<p class='warn'>" + esc(lang === "zh" ? warning.zh : warning.en) + "</p>"; });
    } else html += "<p class='note'>" + t("Enter width and height to see the cloth usage.", "填好宽高后，这里会显示用料。") + "</p>";
    html += "<p style='border-top:1px solid var(--line);padding-top:8px'>" + t("Saved windows", "已保存窗位") + " " + windows.length + "</p>";
    if (!windows.length) html += "<p class='note'>" + t("The CNY total appears after a window is saved.", "保存窗位后这里显示人民币合计。") + "</p>";
    else {
      html += "<p><b>CNY ¥" + saved.toFixed(2) + "</b></p>";
      if (settlement.foreign != null) html += "<p>" + t("Estimate", "估算") + " " + customer.currency + " " + settlement.foreign.toFixed(2) + "</p>";
    }
    if (customer.currency !== "CNY") html += "<p class='note'>" + esc(LQ.FX_NOTE) + "</p>";
    return html;
  }

  function readInputs() {
    document.querySelectorAll("[data-c]").forEach((el) => { customer[el.dataset.c] = el.value; });
    if (draft) document.querySelectorAll("[data-w]").forEach((el) => { draft[el.dataset.w] = el.value; });
  }
  function persist() {
    localStorage.setItem("lq-static-draft", JSON.stringify({ customer, windows }));
    localStorage.setItem("lq-lang", lang);
  }
  function saveWindow() {
    const fabric = fabricById(draft.fabricId);
    const result = LQ.computeWindow(toInput(draft), fabric, LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
    if (result.errors.length) {
      problems = result.errors.map((error) => (lang === "zh" ? error.zh : error.en));
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
      const result = LQ.computeWindow(toInput(item), fabricById(item.fabricId), LQ.DEFAULT_RULES, LQ.DEFAULT_HARDWARE_PRICES);
      result.errors.forEach((error) => problems.push(t("Window", "窗位") + " " + (index + 1) + ": " + (lang === "zh" ? error.zh : error.en)));
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
        draft[choiceButton.dataset.wset] = choiceButton.dataset.wset === "gliderPitch" || choiceButton.dataset.wset === "fabricPerPleat" || choiceButton.dataset.wset === "hookSpacingCm" ? Number(choiceButton.dataset.value) : choiceButton.dataset.value;
        if (choiceButton.dataset.wset === "headingFamily" && choiceButton.dataset.value === "grommet") draft.fabricPerPleat = 30;
        if (choiceButton.dataset.wset === "category") draft.fabricId = "";
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
      else if (phase === "list") phase = "customer";
      else if (phase === "review") phase = "list";
    }
    if (action === "windows") {
      problems = customerErrors();
      if (!problems.length) phase = "list";
    }
    if (action === "add") { draft = blankWindow(); editIndex = null; step = 0; phase = "edit"; problems = []; }
    if (action === "edit") { editIndex = Number(act.dataset.index); draft = { ...windows[editIndex] }; step = 0; phase = "edit"; problems = []; }
    if (action === "remove") windows.splice(Number(act.dataset.index), 1);
    if (action === "review") phase = "review";
    if (action === "next") { if (step < STEPS.length - 1) step += 1; else saveWindow(); }
    if (action === "submit") { submit(); return; }
    persist();
    render();
  });
  document.addEventListener("input", () => { readInputs(); if (phase === "edit" || phase === "customer") { persist(); document.querySelector("#calc").innerHTML = calcView(); } });

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

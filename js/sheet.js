/* Printable order sheets. Depends on docs/js/lq.js (global LQ). */
(function () {
  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }
  function money(amount) {
    return "¥" + Number(amount || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fx(amount, currency) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    } catch (error) {
      return currency + " " + Number(amount).toFixed(2);
    }
  }
  function both(pair) {
    return pair ? esc(pair.en) + " / " + esc(pair.zh) : "";
  }
  function widthM(cm) {
    const metres = Math.round(cm) / 100;
    return (Number.isInteger(metres) ? metres.toFixed(1) : metres) + " m";
  }
  function heading(input) {
    return LQ.headingSummary(input);
  }
  function hardware(input) {
    let text = both(LQ.HARDWARE_LABEL[input.hardware]);
    if (input.hardware === "roman-rod" && input.rodColor) text += " · " + both(LQ.ROD_LABEL[input.rodColor]);
    if (input.hardware === "electric-track") text += " · motor " + esc(input.motorSide) + " · plug " + esc(input.plugStandard) + " · remote only";
    if (input.hardware === "manual-track") text += " · white";
    return text;
  }
  function countLine(result) {
    const parts = ["total " + result.totalCount];
    if (result.totalGliders) parts.push("gliders " + result.totalGliders);
    if (result.totalHooks) parts.push("hooks " + result.totalHooks);
    if (result.totalRings) parts.push("rings " + result.totalRings);
    parts.push(result.panels.map((panel) => panel.side + " " + panel.count).join(", "));
    return parts.join(" · ");
  }
  function row(k, v) {
    return "<tr><th>" + esc(k) + "</th><td>" + v + "</td></tr>";
  }
  function windowBlock(order, item, index, factory) {
    const input = item.input;
    const result = item.result;
    const fabric = item.fabric;
    const head = heading(input);
    let html = "<section>";
    if (factory) {
      html += "<div class='pkg'><div>PACKAGE LABEL / 箱贴</div><div>" + esc(order.number) + " · " + (index + 1) + "/" + order.windows.length + " · ×" + esc(input.quantity) + "</div><b>" + esc(input.name) + "</b><div>" + result.widthCm + " × " + result.heightCm + " cm · " + esc(head.zh) + " · " + esc(LQ.DRAW_LABEL[input.draw].zh) + "</div><div>" + esc(fabric.model) + " " + esc(fabric.version) + "</div></div>";
    }
    html += "<h3>" + (index + 1) + ". " + esc(input.name) + " <span style='font-weight:400;color:#6f675c'>" + esc(head.en) + " / " + esc(head.zh) + "</span></h3><table>";
    html += row("Finished size / 成品", result.widthCm + " × " + result.heightCm + " cm (" + esc(input.width) + " × " + esc(input.height) + " " + esc(input.unit) + ")");
    html += row("Orientation / 方向", both(LQ.ORIENTATION_LABEL[input.orientation]));
    html += row("Lining / 里布", both(LQ.LINING_LABEL[input.lining]));
    html += row("Top / 上口", both(LQ.TOP_LABEL[input.topFinish]));
    html += row("Draw / 开合", both(LQ.DRAW_LABEL[input.draw]));
    html += row("Hem / 下摆", both(LQ.HEM_LABEL[input.hem]) + " · uses " + result.hemUsageCm + " cm");
    html += row("Return / overlap", esc(input.returnCm) + " cm / " + (input.draw === "double" ? esc(input.overlapCm) + " cm" : "—") + " · excess " + result.excessCm + " cm");
    html += row("Tieback / 绑带", both(LQ.TIEBACK_LABEL[input.tieback]) + (input.tiebackRemark ? " · " + esc(input.tiebackRemark) : ""));
    html += row("Hardware / 五金", hardware(input));
    html += row("Fabric / 面料", esc(fabric.model) + " · " + esc(fabric.version) + " · " + widthM(fabric.widthCm) + " · finished " + money(fabric.priceCnyPerM) + "/m · cloth " + money(fabric.fabricPriceCnyPerM) + "/m");
    html += row("Count / 褶·环·滑轮", esc(countLine(result)));
    html += row("Cut width / 裁宽", result.cutWidthCm + " cm · fullness " + result.fullnessDisplay + "x");
    html += row("Fabric usage / 计价用料", result.usageMetersPerPiece + " m / piece × " + esc(input.quantity) + " = " + result.usageMetersPriced + " m · " + (result.usageBasis === "drop-length" ? "定宽按裁长" : "定高按裁宽"));
    html += row("Line / 行金额", money(result.pricing.lineCny) + " (curtain " + money(result.pricing.curtainCny) + ", track " + money(result.pricing.trackCny) + ", motor " + money(result.pricing.motorCny) + ")");
    html += "</table>";
    (result.warnings || []).forEach((warning) => {
      html += "<p class='warn'>" + esc(warning.en) + " / " + esc(warning.zh) + "</p>";
    });
    if (factory) {
      html += "<ol style='font-size:12px;color:#3f3a33'>";
      (result.trace || []).forEach((line) => { html += "<li>" + esc(line.zh) + "</li>"; });
      html += "</ol>";
    }
    if (input.remarks) html += "<p>备注 " + esc(input.remarks) + "</p>";
    html += "</section>";
    return html;
  }
  function totals(order) {
    const usage = order.windows.reduce((sum, item) => sum + Number(item.result.usageMetersPriced || 0), 0);
    let html = "<p>计价用料合计 Priced fabric " + usage.toFixed(3) + " m</p>";
    html += "<p style='font-size:18px'><b>合计 CNY " + money(order.cnyTotal) + "</b></p>";
    if (order.settlement && order.settlement.foreign != null) {
      html += "<p>估算 Estimate " + esc(fx(order.settlement.foreign, order.currency)) + " · 1 " + esc(order.currency) + " = " + order.settlement.rateCny + " CNY · " + esc(order.settlement.rateDate || "") + "</p>";
    }
    if (order.currency !== "CNY") html += "<p class='note'>" + esc(LQ.FX_NOTE) + "</p>";
    return html;
  }
  function copyBlock(order, factory) {
    const c = order.customer;
    return "<article class='sheet" + (factory ? " break" : "") + "'>" +
      "<header style='display:flex;justify-content:space-between;border-bottom:1px solid #1c1915;padding-bottom:8px'>" +
      "<div><div style='letter-spacing:.28em;font-size:11px'>LAN QUEEN</div><h2>" + (factory ? "车间生产单" : "Order confirmation") + "</h2><div style='font-size:12px;color:#6f675c'>" + (factory ? "杭州兰客厅 · 桐庐工厂" : "兰客厅 · Hangzhou custom curtains") + "</div></div>" +
      "<div style='text-align:right;font-size:12px'><b>" + esc(order.number) + "</b><div>" + esc(order.createdAt || "") + "</div><div>" + esc(c.tradeTerm) + " · " + esc(c.shippingMethod) + "</div></div></header>" +
      "<p style='font-size:12px'>Customer / 客户 " + esc(c.name) + "<br>Ship to / 地址 " + esc(c.address) + ", " + esc(c.city) + ", " + esc(c.country) + "<br>Email " + esc(c.email || "—") + " · WhatsApp / WeChat " + esc(c.messenger || "—") + "<br>Delivery / 交期 " + esc(c.deliveryDate) + (c.remarks ? "<br>备注 " + esc(c.remarks) : "") + "</p>" +
      order.windows.map((item, index) => windowBlock(order, item, index, factory)).join("") +
      totals(order) +
      (factory ? "" : "<div class='sign'><div><p>Customer signature / 客户签字</p><div>Date / 日期</div></div><div><p>LAN QUEEN / 兰客厅确认</p><div>Date / 日期</div></div></div>") +
      "<p class='note'>Height is measured from the top of the fabric. 成品高从面料上沿量起。</p></article>";
  }
  function sheetsHtml(order) {
    return copyBlock(order, false) + copyBlock(order, true);
  }
  function orderToText(order) {
    const lines = [];
    lines.push("LAN QUEEN overseas order " + order.number);
    lines.push("This is an estimate until the Bank of China rate on the day of remittance.");
    lines.push(LQ.FX_NOTE);
    const c = order.customer;
    lines.push("");
    lines.push("Customer: " + c.name);
    lines.push("Country / city: " + c.country + " / " + c.city);
    lines.push("Address: " + c.address);
    lines.push("Email: " + (c.email || ""));
    lines.push("WhatsApp / WeChat: " + (c.messenger || ""));
    lines.push("Delivery: " + c.deliveryDate);
    lines.push("Currency: " + order.currency + "  Trade term: " + c.tradeTerm + "  Shipping: " + c.shippingMethod);
    if (c.remarks) lines.push("Remarks: " + c.remarks);
    order.windows.forEach((item, index) => {
      const input = item.input;
      const result = item.result;
      const fabric = item.fabric;
      const head = heading(input);
      lines.push("");
      lines.push("--- Window " + (index + 1) + ": " + input.name + " ---");
      lines.push("Heading: " + head.en + " / " + head.zh);
      lines.push("Size: " + input.width + " x " + input.height + " " + input.unit + " = " + result.widthCm + " x " + result.heightCm + " cm");
      lines.push("Orientation: " + input.orientation + "  Lining: " + input.lining + "  Top: " + input.topFinish);
      lines.push("Draw: " + input.draw + "  Hem: " + input.hem + "  Return: " + input.returnCm + "  Overlap: " + input.overlapCm);
      lines.push("Tieback: " + input.tieback + (input.tiebackRemark ? " (" + input.tiebackRemark + ")" : ""));
      lines.push("Hardware: " + input.hardware + (input.rodColor ? " " + input.rodColor : "") + (input.motorSide ? " motor " + input.motorSide + " plug " + input.plugStandard : ""));
      lines.push("Fabric: " + fabric.model + " " + fabric.version + " width " + widthM(fabric.widthCm) + " finished " + fabric.priceCnyPerM + " CNY/m cloth " + fabric.fabricPriceCnyPerM + " CNY/m");
      lines.push("Qty: " + input.quantity);
      lines.push("Pleats/folds/rings: " + result.totalCount + "  Gliders: " + (result.totalGliders ?? "—") + "  Hooks: " + (result.totalHooks ?? "—") + "  Rings: " + (result.totalRings ?? "—"));
      lines.push("Cut width cm: " + result.cutWidthCm + "  Fullness: " + result.fullnessDisplay + "x");
      lines.push("Fabric usage m (priced): " + result.usageMetersPriced + " (" + result.usageMetersPerPiece + " per piece, " + result.usageBasis + ")");
      lines.push("Curtain CNY: " + result.pricing.curtainCny + "  Track: " + result.pricing.trackCny + "  Motor: " + result.pricing.motorCny + "  Line: " + result.pricing.lineCny);
      (result.warnings || []).forEach((warning) => lines.push("WARNING: " + warning.en + " / " + warning.zh));
      (result.trace || []).forEach((line) => lines.push(line.zh));
      if (input.remarks) lines.push("Window remarks: " + input.remarks);
    });
    lines.push("");
    lines.push("TOTAL CNY: " + order.cnyTotal);
    if (order.settlement && order.settlement.foreign != null) {
      lines.push("ESTIMATE " + order.currency + ": " + order.settlement.foreign + " at 1 " + order.currency + " = " + order.settlement.rateCny + " CNY (" + order.settlement.rateDate + ")");
    }
    lines.push("");
    lines.push("Open the attached HTML in a browser and print it to A4, or paste the attached JSON into print.html.");
    return lines.join("\n");
  }
  function orderToDocument(order) {
    return "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>" + esc(order.number) + "</title><style>" +
      "@page{size:A4;margin:12mm}body{font-family:Georgia,'PingFang SC','Songti SC',serif;color:#1c1915;margin:0}" +
      ".sheet{page-break-after:always}.break{page-break-before:always}table{width:100%;border-collapse:collapse;font-size:12px}" +
      "th,td{border-bottom:1px solid #eee;text-align:left;vertical-align:top;padding:3px 8px 3px 0;font-weight:400}th{width:34%;color:#666}" +
      ".pkg{border:1px dashed #111;padding:8px;font-size:12px}.warn{color:#8f2d2d;font-size:12px}.note{font-size:11px;color:#666}" +
      ".sign{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:28px;font-size:12px}.sign p{border-bottom:1px solid #111;padding-bottom:22px}" +
      "</style></head><body>" + sheetsHtml(order) + "</body></html>";
  }
  window.LQSheet = { sheetsHtml, orderToText, orderToDocument };
})();

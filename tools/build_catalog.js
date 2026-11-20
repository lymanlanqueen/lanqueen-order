#!/usr/bin/env node
"use strict";
/**
 * Rebuild data/catalog.json from the owner's pipe-delimited price list.
 *
 *   node tools/build_catalog.js
 *
 * Sheets are separated by "== <sheet>" lines. RMB columns are the base prices.
 * An empty version cell inherits the previous row's version. The same model
 * with a different colour range becomes another colour tier. A new model with
 * an empty version (for example HB under F15) is its own entry.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(__dirname, "pricelist_full.txt");
const OUT = path.join(ROOT, "data", "catalog.json");

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return null;
  return Number(text);
}

function sheetKind(title) {
  const name = title.toLowerCase();
  if (name.startsWith("fabric")) return "fabric";
  if (name.startsWith("blackout")) return "blackout";
  if (name.startsWith("sheer")) return "sheer";
  return null;
}

function parseSections(text) {
  return text.split(/^== /m).slice(1).map((part) => {
    const breakAt = part.indexOf("\n");
    return {
      title: part.slice(0, breakAt).trim(),
      body: part.slice(breakAt + 1),
    };
  });
}

function parseSheet(title, body) {
  const kind = sheetKind(title);
  if (!kind) return [];
  const rows = [];
  let version = "";
  body.split(/\n/).forEach((line) => {
    if (!line.includes("|")) return;
    const cells = line.split("|").map((cell) => cell.trim());
    const versionCell = cells[0] || "";
    const model = cells[1] || "";
    if (!model || model === "Model" || /price|width|settlement/i.test(model)) return;
    if (versionCell && !/^[A-Za-z]+\d+$/.test(versionCell)) return;
    let colors = "";
    let widthAt = 2;
    if (kind === "fabric") {
      colors = cells[2] || "";
      widthAt = 3;
    }
    const widthM = num(cells[widthAt]);
    const finishedCNY = num(cells[widthAt + 1]);
    const finishedAUD = num(cells[widthAt + 2]);
    const finishedUSD = num(cells[widthAt + 3]);
    const fabricCNY = num(cells[widthAt + 4]);
    const fabricAUD = num(cells[widthAt + 5]);
    const fabricUSD = num(cells[widthAt + 6]);
    if (!(widthM > 0) || finishedCNY == null || fabricCNY == null) return;
    if (versionCell) version = versionCell.toUpperCase();
    if (!version) return;
    rows.push({
      version,
      model,
      category: kind,
      colors,
      widthM,
      finishedCNY,
      finishedAUD,
      finishedUSD,
      fabricCNY,
      fabricAUD,
      fabricUSD,
    });
  });
  return rows;
}

function groupModels(rows) {
  const groups = [];
  const index = new Map();
  rows.forEach((row) => {
    const key = row.category + "\0" + row.version + "\0" + row.model;
    if (!index.has(key)) {
      const group = { version: row.version, model: row.model, category: row.category, rows: [] };
      index.set(key, group);
      groups.push(group);
    }
    index.get(key).rows.push(row);
  });
  return groups;
}

function uniqueId(base, used) {
  let id = base || "fabric";
  let n = 2;
  while (used.has(id)) {
    id = base + "-" + n;
    n += 1;
  }
  used.add(id);
  return id;
}

function toEntry(group, used) {
  const first = group.rows[0];
  const tiered = group.rows.some((row) => row.colors);
  const id = uniqueId(slug(group.model), used);
  const entry = {
    id,
    version: group.version,
    model: group.model,
    category: group.category,
    nameEn: group.model,
    nameZh: group.model,
    widthM: first.widthM,
    widthCm: Math.round(first.widthM * 100),
  };
  if (tiered) {
    entry.colorTiers = group.rows.map((row) => ({
      colors: row.colors,
      widthM: row.widthM,
      finishedCNY: row.finishedCNY,
      fabricCNY: row.fabricCNY,
      finishedAUD: row.finishedAUD,
      finishedUSD: row.finishedUSD,
      fabricAUD: row.fabricAUD,
      fabricUSD: row.fabricUSD,
    }));
  } else {
    entry.finishedPriceCnyPerM = first.finishedCNY;
    entry.fabricPriceCnyPerM = first.fabricCNY;
    entry.priceCnyPerM = first.finishedCNY;
    entry.finishedAudPerM = first.finishedAUD;
    entry.finishedUsdPerM = first.finishedUSD;
    entry.fabricAudPerM = first.fabricAUD;
    entry.fabricUsdPerM = first.fabricUSD;
  }
  return entry;
}

function buildCatalog(text) {
  const rows = parseSections(text).flatMap((section) => parseSheet(section.title, section.body));
  const used = new Set();
  return groupModels(rows).map((group) => toEntry(group, used));
}

function main() {
  const text = fs.readFileSync(SOURCE, "utf8");
  const catalog = buildCatalog(text);
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
  const counts = catalog.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {});
  console.log("Wrote " + catalog.length + " models to " + path.relative(ROOT, OUT));
  console.log(counts);
}

module.exports = { buildCatalog, parseSections, slug };

if (require.main === module) main();

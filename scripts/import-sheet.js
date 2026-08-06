#!/usr/bin/env node
/*
  scripts/import-sheet.js
  Usage:
    npm run import-sheet -- --url "<PUBLISHED_CSV_URL>" --out dxn-auto-reply/questions.json

  Fetches a published Google Sheets CSV (or any CSV URL), parses it (supports quoted multi-line
  cells), maps columns to a canonical schema, normalizes certain fields, and writes a JSON file.
*/

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import crypto from 'crypto';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { url: '', out: 'dxn-auto-reply/questions.json' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--url' || a === '-u') && args[i + 1]) { out.url = args[++i]; }
    else if ((a === '--out' || a === '-o') && args[i + 1]) { out.out = args[++i]; }
    else if (a === '--help' || a === '-h') { out.help = true; }
  }
  return out;
}

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  const clean = text.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "");
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"') {
        if (clean[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ""; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.filter((r) => r.some((x) => String(x).trim() !== ""));
}

function normalize(text) {
  if (!text && text !== 0) return '';
  return String(text)
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ماهي/g, "ما هي")
    .replace(/ماهو/g, "ما هو")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitKeywords(s) {
  if (!s) return [];
  return String(s).split(/[،,;]/).map((x) => x.trim()).filter(Boolean);
}

function fromSheet(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 1) return [];
  const head = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const qi = head.findIndex((h) => h.includes('question'));
  const ai = head.findIndex((h) => h.includes('answer'));
  const ki = head.findIndex((h) => h.includes('keyword') || h.includes('keywords'));
  const wi = head.findIndex((h) => h.includes('whats') || h.includes('whatsapp') || h.includes('wa'));
  // fallback: allow columns named "q"/"a"
  const qi2 = qi >= 0 ? qi : head.findIndex((h) => h === 'q');
  const ai2 = ai >= 0 ? ai : head.findIndex((h) => h === 'a');

  if (qi2 < 0 || ai2 < 0) {
    throw new Error('CSV must include Question and Answer columns (headers containing "question" and "answer").');
  }

  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const qs = String(row[qi2] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const as = String(row[ai2] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const keywordsRaw = ki >= 0 ? row[ki] : '';
    const keywords = splitKeywords(keywordsRaw);
    const whatsapp = wi >= 0 ? /نعم|yes|true|1/i.test(String(row[wi] || '')) : false;

    qs.forEach((q, idx) => {
      const answer = as[idx] || as[0] || '';
      if (q && answer) {
        const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `sheet-${Date.now()}-${r}-${idx}`;
        out.push({
          id,
          question: q,
          answer,
          keywords,
          whatsapp: !!whatsapp,
          source: 'sheet',
          row: r + 1
        });
      }
    });
  }
  return out;
}

async function main() {
  const args = parseArgs();
  if (args.help || !args.url) {
    console.log('Usage: npm run import-sheet -- --url "<PUBLISHED_CSV_URL>" [--out <output.json>]');
    process.exit(args.help ? 0 : 1);
  }

  console.log('Fetching CSV from:', args.url);
  const res = await fetch(args.url);
  if (!res.ok) {
    console.error('Failed to fetch CSV:', res.status, res.statusText);
    process.exit(2);
  }
  const text = await res.text();

  let items = [];
  try {
    items = fromSheet(text);
  } catch (e) {
    console.error('Error parsing CSV:', e.message);
    process.exit(3);
  }

  if (!items.length) {
    console.warn('No valid Q/A rows found in the sheet. Nothing to write.');
    process.exit(0);
  }

  const outPath = path.resolve(process.cwd(), args.out);
  const dir = path.dirname(outPath);
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}

  fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Wrote ${items.length} entries to ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(99); });

/* نظام الرد التلقائي DXN — يعمل بدون خادم
   المصادر: questions.json + Google Sheets (منشور كـ CSV) + إضافات لوحة الإدارة */

const SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vSVr544Ga5dd5mmMfxqgRKUz7BiLrLzkcWFIdVf5rVmhzAhp81kAuWpafJIHZ_vgTfi3G4PcrspA5pk/pub?output=csv";

const WHATSAPP_NUMBER = "218946098624";
const BASE = document.currentScript
  ? document.currentScript.src.replace(/chat\.js.*$/, "")
  : "";

let answers = [];


/* ---------- قارئ CSV يدعم الخلايا متعددة الأسطر ---------- */
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
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

function fromSheet(csv) {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const qi = head.findIndex((h) => h.includes("question"));
  const ai = head.findIndex((h) => h.includes("answer"));
  const ki = head.findIndex((h) => h.includes("keyword"));
  const wi = head.findIndex((h) => h.includes("whats"));
  if (qi < 0 || ai < 0) return [];

  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const qs = (row[qi] || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const as = (row[ai] || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const keywords = (row[ki] || "").split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    const whatsapp = /نعم|yes|true|1/i.test(row[wi] || "");
    qs.forEach((q, idx) => {
      const answer = as[idx] || as[0] || "";
      if (q && answer) out.push({ question: q, answer, keywords, whatsapp });
    });
  }
  return out;
}

/* ---------- تحميل قاعدة البيانات ---------- */
function loadLocal() {
  try { return JSON.parse(localStorage.getItem("botQuestions")) || []; }
  catch { return []; }
}

async function loadKnowledge() {
  let base = [];
  try {
    const res = await fetch(BASE + "questions.json");
    base = await res.json();
  } catch (e) {
    console.log("تعذر تحميل questions.json:", e);
  }

  let sheet = [];
  try {
    const res = await fetch(SHEET_CSV_URL);
    sheet = fromSheet(await res.text());
  } catch (e) {
    console.log("تعذر تحميل جدول Google Sheets:", e);
  }

  answers = base.concat(sheet, loadLocal()).map((item) => ({
    question: item.question || "",
    answer: item.answer || "",
    keywords: item.keywords || [],
    whatsapp: !!item.whatsapp,
  }));

  console.log("عدد الأسئلة المحمّلة:", answers.length);
}

loadKnowledge();



/* ---------- الواجهة ---------- */
function messagesBox() {
  return document.getElementById("chat-box") || document.getElementById("chatMessages");
}

function addMessage(html, className) {
  const box = messagesBox();
  if (!box) return;
  const div = document.createElement("div");
  div.className = className;
  div.innerHTML = html;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function whatsappButton(text) {
  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  return '<a class="wa-btn" target="_blank" rel="noopener" href="' + url + '">📱 تواصل عبر واتساب</a>';
}

function inputEl() {
  return document.getElementById("user-input") || document.getElementById("userMessage");
}

function sendMessage() {
  const input = inputEl();
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  addMessage(escapeHtml(text), "user-message");
  input.value = "";

  setTimeout(() => {
    const match = findAnswer(text, answers);
    if (match) {
      let html = escapeHtml(match.answer).replace(/\n/g, "<br>");
      if (match.whatsapp) html += "<br>" + whatsappButton("سؤالي: " + text);
      addMessage(html, "bot-message");
    } else {
      addMessage(
        "لم أجد إجابة دقيقة لهذا السؤال 🙏<br>يمكنك إعادة صياغته أو التواصل مع الفريق مباشرة.<br>" +
          whatsappButton("سؤالي: " + text),
        "bot-message",
      );
    }
  }, 300);
}

function quickAsk(text) {
  const input = inputEl();
  if (!input) return;
  input.value = text;
  sendMessage();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target === inputEl()) sendMessage();
});

window.sendMessage = sendMessage;
window.quickAsk = quickAsk;

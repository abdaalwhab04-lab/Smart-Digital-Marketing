/* نظام الرد التلقائي DXN
   قاعدة المعرفة:
   1. questions.json
   2. Google Sheets
   3. localStorage
   4. Gemini عند عدم العثور على إجابة
*/

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSVr544Ga5dd5mmMfxqgRKUz7BiLrLzkcWFIdVf5rVmhzAhp81kAuWpafJIHZ_vgTfi3G4PcrspA5pk/pub?output=csv";

const GEMINI_API_URL =
  "https://smart-digital-marketing.onrender.com/api/gemini";

const WHATSAPP_NUMBER = "218946098624";

const BASE = document.currentScript
  ? document.currentScript.src.replace(/chat\.js.*$/, "")
  : "";

let answers = [];

/* =========================
   قراءة CSV
========================= */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/^\uFEFF/, "");

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];

    if (quoted) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += c;
    }
  }

  row.push(cell);
  rows.push(row);

  return rows.filter((r) =>
    r.some((x) => x.trim() !== "")
  );
}

/* =========================
   تحويل Google Sheets
========================= */

function fromSheet(csv) {
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    return [];
  }

  const head = rows[0].map((h) =>
    h.trim().toLowerCase()
  );

  const qi = head.findIndex((h) =>
    h.includes("question")
  );

  const ai = head.findIndex((h) =>
    h.includes("answer")
  );

  const ki = head.findIndex((h) =>
    h.includes("keyword")
  );

  const wi = head.findIndex((h) =>
    h.includes("whats")
  );

  if (qi < 0 || ai < 0) {
    return [];
  }

  const out = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    const qs = (row[qi] || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const as = (row[ai] || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const keywords =
      ki >= 0
        ? (row[ki] || "")
            .split(/[،,]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const whatsapp =
      wi >= 0 &&
      /نعم|yes|true|1/i.test(row[wi] || "");

    qs.forEach((q, idx) => {
      const answer =
        as[idx] ||
        as[0] ||
        "";

      if (q && answer) {
        out.push({
          question: q,
          answer,
          keywords,
          whatsapp
        });
      }
    });
  }

  return out;
}

/* =========================
   قاعدة محلية
========================= */

function loadLocal() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("botQuestions")
      ) || []
    );
  } catch (error) {
    console.error(
      "Local knowledge error:",
      error
    );

    return [];
  }
}

/* =========================
   تحميل قاعدة المعرفة
========================= */

async function loadKnowledge() {
  let base = [];
  let sheet = [];

  try {
    const res = await fetch(
      BASE + "questions.json"
    );

    if (res.ok) {
      base = await res.json();
    }
  } catch (error) {
    console.log(
      "تعذر تحميل questions.json:",
      error
    );
  }

  try {
    const res = await fetch(
      SHEET_CSV_URL
    );

    if (res.ok) {
      sheet = fromSheet(
        await res.text()
      );
    }
  } catch (error) {
    console.log(
      "تعذر تحميل Google Sheets:",
      error
    );
  }

  answers = base
    .concat(sheet, loadLocal())
    .map((item) => ({
      question: item.question || "",
      answer: item.answer || "",
      keywords: Array.isArray(item.keywords)
        ? item.keywords
        : [],
      whatsapp: !!item.whatsapp
    }));

  console.log(
    "عدد الأسئلة المحملة:",
    answers.length
  );
}

/* =========================
   صندوق المحادثة
========================= */

function messagesBox() {
  return (
    document.getElementById("chat-box") ||
    document.getElementById("chatMessages")
  );
}

/* =========================
   إضافة رسالة
========================= */

function addMessage(html, className) {
  const box = messagesBox();

  if (!box) {
    console.error(
      "لم يتم العثور على chatMessages"
    );

    return;
  }

  const div =
    document.createElement("div");

  div.className = className;

  div.innerHTML = html;

  box.appendChild(div);

  box.scrollTop =
    box.scrollHeight;
}

/* =========================
   حماية HTML
========================= */

function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[c]
  );
}

/* =========================
   زر واتساب
========================= */

function whatsappButton(text) {
  const url =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(text);

  return (
    '<a class="wa-btn" target="_blank" rel="noopener" href="' +
    url +
    '">📱 تواصل عبر واتساب</a>'
  );
}

/* =========================
   مربع الكتابة
========================= */

function findAnswer(text, list) {
  const normalized =
    text.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  /* تطابق السؤال */
  for (const item of list) {
    const q =
      (item.question || "")
        .trim()
        .toLowerCase();

    if (q && normalized === q) {
      return item;
    }
  }

  /* البحث بالكلمات المفتاحية */
  for (const item of list) {
    const keywords =
      item.keywords || [];

    for (const keyword of keywords) {
      const k =
        String(keyword)
          .trim()
          .toLowerCase();

      if (
        k &&
        normalized.includes(k)
      ) {
        return item;
      }
    }
  }

  return null;
}

/* =========================
   الاتصال بـ Gemini
========================= */

async function askGemini(question) {
  try {
    const response =
      await fetch(
        GEMINI_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            question,
            company: "DXN",
            section: "عام"
          })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          "فشل الاتصال بالمساعد"
      );
    }

    return data.answer || "";

  } catch (error) {
    console.error(
      "Gemini error:",
      error
    );

    return "";
  }
}

/* =========================
   إرسال الرسالة
========================= */

async function sendMessage() {
  const input = inputEl();

  if (!input) {
    console.error(
      "لم يتم العثور على userMessage"
    );

    return;
  }

  const text =
    input.value.trim();

  if (!text) {
    return;
  }

  /* عرض رسالة المستخدم */
  addMessage(
    escapeHtml(text),
    "user-message"
  );

  /* تنظيف الحقل */
  input.value = "";

  /* البحث في قاعدة المعرفة */
  const match =
    findAnswer(
      text,
      answers
    );

  if (match) {
    let html =
      escapeHtml(
        match.answer
      ).replace(
        /\n/g,
        "<br>"
      );

    if (match.whatsapp) {
      html +=
        "<br><br>" +
        whatsappButton(
          "سؤالي: " + text
        );
    }

    addMessage(
      html,
      "bot-message"
    );

    return;
  }

  /* رسالة انتظار */
  const loading =
    document.createElement("div");

  loading.className =
    "bot-message";

  loading.innerHTML =
    "🤖 جاري التفكير...";

  const box =
    messagesBox();

  if (box) {
    box.appendChild(
      loading
    );

    box.scrollTop =
      box.scrollHeight;
  }

  /* إرسال إلى Gemini */
  const geminiAnswer =
    await askGemini(text);

  /* حذف الانتظار */
  loading.remove();

  if (geminiAnswer) {
    addMessage(
      escapeHtml(
        geminiAnswer
      ).replace(
        /\n/g,
        "<br>"
      ),
      "bot-message"
    );

  } else {
    addMessage(
      "لم أجد إجابة دقيقة لهذا السؤال 🙏<br>" +
        "يمكنك إعادة صياغة السؤال أو التواصل مع الفريق مباشرة.<br><br>" +
        whatsappButton(
          "سؤالي: " + text
        ),
      "bot-message"
    );
  }
}

/* =========================
   الأسئلة السريعة
========================= */

function quickAsk(text) {
  const input = inputEl();

  if (!input) {
    return;
  }

  input.value = text;

  sendMessage();
}

/* =========================
   تشغيل Enter
========================= */

document.addEventListener(
  "keydown",
  (event) => {
    const input = inputEl();

    if (
      input &&
      event.key === "Enter" &&
      event.target === input
    ) {
      event.preventDefault();

      sendMessage();
    }
  }
);

/* =========================
   بدء التشغيل
========================= */

window.sendMessage =
  sendMessage;

window.quickAsk =
  quickAsk;

loadKnowledge();

/* تحميل مصادر المعرفة للروبوت الموحد */

function parseSheetCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((h) =>
    String(h).trim().replace(/^\uFEFF/, "")
  );

  return rows.slice(1).map((values) => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = String(values[index] || "").trim();
    });

    return item;
  });
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeSheetRows(sheetRows) {
  const result = [];

  for (const row of sheetRows) {
    const questions = splitLines(row.question);
    const answers = splitLines(row.Answer);
    const keywords = splitLines(row.Keywords);
    const whatsapp = splitLines(row.WhatsApp);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question || question.toLowerCase() === "question") {
        continue;
      }

      const answer = answers[i] || "";
      const keywordLine = keywords[i] || "";
      const whatsappValue = whatsapp[i] || "";

      result.push({
        question,
        answer,
        keywords: keywordLine
          .split(/[،,]/)
          .map((x) => x.trim())
          .filter(Boolean),
        whatsapp:
          whatsappValue === "نعم" ||
          whatsappValue.toLowerCase() === "yes" ||
          whatsappValue.toLowerCase() === "true" ||
          whatsappValue === "1"
      });
    }
  }

  return result;
}

async function loadKnowledge(options = {}) {
  const {
    baseUrl = "",
    sheetUrl = ""
  } = options;

  let base = [];

if (baseUrl) {
  try {
    const res = await fetch(baseUrl + "questions.json");

    if (res.ok) {
      base = await res.json();
    }
  } catch (e) {
    console.log("تعذر تحميل questions.json:", e.message);
  }
}

  let sheet = [];

  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl);

      if (!res.ok) {
        throw new Error(`Google Sheets HTTP ${res.status}`);
      }

      const text = await res.text();
      const parsed = parseSheetCSV(text);

      sheet = normalizeSheetRows(parsed);

      console.log(
        `تم تحميل ${sheet.length} سؤال من Google Sheets`
      );
    } catch (e) {
      console.log(
        "تعذر تحميل Google Sheets:",
        e.message
      );
    }
  }

  let local = [];

  try {
    local =
      JSON.parse(
        localStorage.getItem("botQuestions")
      ) || [];
  } catch {
    local = [];
  }

  return base
    .concat(sheet, local)
    .map((item) => ({
      question: item.question || "",
      answer: item.answer || "",
      keywords: Array.isArray(item.keywords)
        ? item.keywords
        : [],
      whatsapp: !!item.whatsapp
    }))
    .filter((item) => item.question);
}

export {
  loadKnowledge,
  parseSheetCSV,
  normalizeSheetRows
};

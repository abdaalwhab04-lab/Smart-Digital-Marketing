/* تحميل مصادر المعرفة للروبوت الموحد */

async function loadKnowledge(options = {}) {
  const {
    baseUrl = "",
    sheetUrl = ""
  } = options;

  let base = [];

  try {
    const res = await fetch(baseUrl + "questions.json");
    base = await res.json();
  } catch (e) {
    console.log("تعذر تحميل questions.json:", e);
  }

  let sheet = [];

  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl);
      sheet = fromSheet(await res.text());
    } catch (e) {
      console.log("تعذر تحميل جدول Google Sheets:", e);
    }
  }

  let local = [];

  try {
    local = JSON.parse(localStorage.getItem("botQuestions")) || [];
  } catch {
    local = [];
  }

  return base.concat(sheet, local).map((item) => ({
    question: item.question || "",
    answer: item.answer || "",
    keywords: item.keywords || [],
    whatsapp: !!item.whatsapp
  }));
}


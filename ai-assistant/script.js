const GEMINI_API_URL =
  "https://smart-digital-marketing.onrender.com/api/gemini";

async function search() {
  const companyInput = document.getElementById("company");
  const sectionInput = document.getElementById("section");
  const questionInput = document.getElementById("question");
  const answerBox = document.getElementById("answer");

  const company = companyInput ? companyInput.value.trim() : "DXN";
  const section = sectionInput ? sectionInput.value.trim() : "عام";
  const question = questionInput.value.trim();

  if (!question) {
    answerBox.textContent = "اكتب سؤالك أولاً.";
    return;
  }

  answerBox.textContent = "جاري التفكير...";

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        company,
        section,
        question
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي"
      );
    }

    answerBox.textContent = data.answer;

  } catch (error) {
    console.error("Gemini error:", error);

    answerBox.textContent =
      "تعذر الاتصال بالذكاء الاصطناعي. حاول مرة أخرى.";
  }
}


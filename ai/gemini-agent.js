/* Gemini AI Assistant Layer - Phase 4.4 */

async function askGemini(userText) {
  if (!userText) return null;

  if (!window.GEMINI_CONFIG || !window.GEMINI_CONFIG.enabled) {
    return null;
  }

  try {
    const response = await fetch(
      window.GEMINI_CONFIG.endpoint || "http://localhost:8787/api/gemini",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: userText
        })
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.answer) {
      return null;
    }

    return data.answer;

  } catch (error) {
    console.log("Gemini backend unavailable:", error);
    return null;
  }
}

window.askGemini = askGemini;

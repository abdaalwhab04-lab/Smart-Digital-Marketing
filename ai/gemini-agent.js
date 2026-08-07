/* Gemini AI Assistant Layer - Phase 4.3 */

async function askGemini(userText) {
  if (!userText) return null;

  if (!window.GEMINI_CONFIG || !window.GEMINI_CONFIG.enabled) {
    return null;
  }

  /*
    سيتم ربط Gemini API هنا.
    حاليا النظام يحتفظ بالرد المحلي إذا لم تتوفر خدمة Gemini.
  */

  return null;
}

window.askGemini = askGemini;

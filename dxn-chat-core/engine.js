/* محرك الرد الذكي DXN Chat Core */

function scoreAnswer(userText, item) {
  const userTokens = tokens(userText);

  const questionTokens = tokens(item.question || "");
  const keywordTokens = (item.keywords || []).flatMap((k) => tokens(k));

  let score = 0;

  userTokens.forEach((word) => {
    if (questionTokens.includes(word)) score += 3;
    if (keywordTokens.includes(word)) score += 5;
  });

  return score;
}

function findAnswer(userText, knowledge) {
  if (!userText || !Array.isArray(knowledge)) {
    return null;
  }

  let best = null;
  let bestScore = 0;

  knowledge.forEach((item) => {
    const score = scoreAnswer(userText, item);

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  if (!best || bestScore < 2) {
    return {
      answer: "لم أجد إجابة مناسبة، حاول صياغة السؤال بطريقة أخرى.",
      whatsapp: false,
      score: bestScore
    };
  }

  return {
    answer: best.answer,
    whatsapp: best.whatsapp,
    score: bestScore
  };
}

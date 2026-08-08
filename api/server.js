/* Smart Digital Marketing - Gemini Backend */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadKnowledge } from "../dxn-chat-core/knowledge.js";
import DXN_CONFIG from "../config/dxn.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 8787;
const HOST = "0.0.0.0";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";


async function buildKnowledgeContext() {
  const knowledge = await loadKnowledge({
    sheetUrl: DXN_CONFIG.sheetUrl
  });

  if (!knowledge.length) {
    return "لا توجد قاعدة معرفة متاحة.";
  }

  console.log(
    `Knowledge loaded: ${knowledge.length} questions`
  );

  return knowledge
    .map((item, index) => {
      return `${index + 1}. السؤال: ${item.question || ""}
الإجابة: ${item.answer || ""}
الكلمات المفتاحية: ${(item.keywords || []).join(", ")}`;
    })
    .join("\n\n");
}

async function askGemini(question, company, section) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const knowledgeContext = await buildKnowledgeContext();

  const prompt = `
أنت المساعد التسويقي الذكي لموقع Smart Digital Marketing والمتخصص في شركة DXN.

مهمتك:
- أجب باللغة العربية الواضحة والبسيطة.
- اربط الإجابة بالشركة والقسم والسؤال عندما يكون ذلك مناسبًا.
- إذا كان السؤال عن DXN، اجعل الإجابة مرتبطة بـDXN قدر الإمكان.
- إذا كان السؤال عامًا في التسويق، أجب بطريقة عملية ومفيدة للمسوق.
- استخدم قاعدة المعرفة المحلية كمصدر أساسي للمعلومات الموجودة فيها.
- إذا لم تجد الإجابة في قاعدة المعرفة، استخدم معرفتك العامة لصياغة إجابة مفيدة.
- لا تخترع أسعارًا أو نسب أرباح أو سياسات تسجيل غير مؤكدة.
- لا تخترع معلومات خاصة بشركة DXN غير موجودة في قاعدة المعرفة أو غير مؤكدة.
- لا تقل للمستخدم إنك بحثت في قاعدة بيانات.
- لا تذكر أنك نموذج ذكاء اصطناعي إلا إذا سُئلت مباشرة.
- اجعل الإجابة مختصرة ومباشرة، واستخدم نقاطًا عند الحاجة.

الشركة:
${company || "DXN"}

القسم:
${section || "عام"}

قاعدة المعرفة المحلية:
${knowledgeContext}

سؤال المستخدم:
${question}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API error:", data);

    throw new Error(
      data?.error?.message || "Gemini API request failed"
    );
  }

  const answer = data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();

  if (!answer) {
    throw new Error("Gemini returned an empty response");
  }

  return answer;
}

const server = http.createServer((req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://abdaalwhab04-lab.github.io"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader(
    "Content-Type",
    "application/json; charset=utf-8"
  );

  if (
    req.method !== "POST" ||
    req.url !== "/api/gemini"
  ) {
    res.statusCode = 404;

    res.end(
      JSON.stringify({
        success: false,
        error: "Not found"
      })
    );

    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body);

      const question = String(
        data.question || ""
      ).trim();

      const company = String(
        data.company || "DXN"
      ).trim();

      const section = String(
        data.section || "عام"
      ).trim();

      if (!question) {
        res.statusCode = 400;

        res.end(
          JSON.stringify({
            success: false,
            error: "Question is required"
          })
        );

        return;
      }

      const answer = await askGemini(
        question,
        company,
        section
      );

      res.statusCode = 200;

      res.end(
        JSON.stringify({
          success: true,
          answer
        })
      );

    } catch (error) {
      console.error("Backend error:", error);

      res.statusCode = 500;

      res.end(
        JSON.stringify({
          success: false,
          error:
            error.message ||
            "Internal server error"
        })
      );
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(
    `Gemini backend listening on ${HOST}:${PORT}`
  );
});

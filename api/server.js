/* Smart Digital Marketing - Gemini Backend
   Phase 4.4
*/

import http from "http";

const PORT = Number(process.env.PORT) || 8787;
const HOST = "0.0.0.0";

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST" || req.url !== "/api/gemini") {
    res.statusCode = 404;
    res.end(JSON.stringify({
      success: false,
      error: "Not found"
    }));
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const question = String(data.question || "").trim();

      if (!question) {
        res.statusCode = 400;
        res.end(JSON.stringify({
          success: false,
          error: "Question is required"
        }));
        return;
      }

      res.end(JSON.stringify({
        success: true,
        answer: "اختبار Backend ناجح. السؤال المستلم: " + question
      }));

    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({
        success: false,
        error: "Invalid JSON"
      }));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Gemini backend listening on ${HOST}:${PORT}`);
});

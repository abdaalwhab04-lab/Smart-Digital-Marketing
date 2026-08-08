/* Smart Digital Marketing - Gemini Backend */

import http from "http";

const PORT = Number(process.env.PORT) || 8787;
const HOST = "0.0.0.0";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";

async function askGemini(question) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

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
                text: question
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

  const answer =
    data?.candidates?.[0]?.content?.parts
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

  if (req.method !== "POST" || req.url !== "/api/gemini") {
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
      const question = String(data.question || "").trim();

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

      const answer = await askGemini(question);

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
          error: error.message || "Internal server error"
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

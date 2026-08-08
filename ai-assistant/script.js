const GEMINI_API_URL =
  "https://smart-digital-marketing.onrender.com/api/gemini";

const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("question");
const sendButton = document.getElementById("sendButton");
const companyInput = document.getElementById("company");
const sectionInput = document.getElementById("section");

let isSending = false;

/* حماية النص من HTML */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

/* تنسيق إجابة المساعد */
function formatAnswer(text) {
  if (!text) {
    return "";
  }

  let result = escapeHtml(text);

  /* الأسطر الجديدة */
  result = result.replace(/\n/g, "<br>");

  /* النص الغامق بصيغة Markdown */
  result = result.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  return result;
}

/* النزول إلى آخر رسالة */
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* إضافة رسالة */
function addMessage(text, type) {
  const message = document.createElement("div");

  if (type === "user") {
    message.className = "message user-message";

    message.innerHTML = `
      <div class="message-content">
        <div class="message-name">أنت</div>
        <div class="message-bubble">
          ${escapeHtml(text)}
        </div>
      </div>

      <div class="message-avatar">
        👤
      </div>
    `;
  } else {
    message.className = "message bot-message";

    message.innerHTML = `
      <div class="message-avatar">
        🤖
      </div>

      <div class="message-content">
        <div class="message-name">
          المساعد التسويقي
        </div>

        <div class="message-bubble bot-answer">
          ${formatAnswer(text)}
        </div>
      </div>
    `;
  }

  chatMessages.appendChild(message);
  scrollToBottom();

  return message;
}

/* رسالة الانتظار */
function addLoadingMessage() {
  const message = document.createElement("div");

  message.className =
    "message bot-message loading-message";

  message.innerHTML = `
    <div class="message-avatar">
      🤖
    </div>

    <div class="message-content">
      <div class="message-name">
        المساعد التسويقي
      </div>

      <div class="message-bubble loading-bubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chatMessages.appendChild(message);
  scrollToBottom();

  return message;
}

/* إرسال الرسالة */
async function sendMessage() {
  if (isSending) {
    return;
  }

  const question =
    questionInput.value.trim();

  if (!question) {
    questionInput.focus();
    return;
  }

  const company =
    companyInput
      ? companyInput.value.trim()
      : "DXN";

  const section =
    sectionInput
      ? sectionInput.value.trim()
      : "عام";

  /* عرض رسالة المستخدم */
  addMessage(question, "user");

  /* تفريغ مربع الكتابة */
  questionInput.value = "";

  /* بدء حالة الإرسال */
  isSending = true;

  sendButton.disabled = true;
  questionInput.disabled = true;

  /* عرض التحميل */
  const loadingMessage =
    addLoadingMessage();

  try {
    console.log("Sending message to:", GEMINI_API_URL);

    const response = await fetch(
      GEMINI_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          question: question,
          company: company,
          section: section
        })
      }
    );

    console.log(
      "Server response:",
      response.status
    );

    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "تعذر قراءة استجابة الخادم."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        `خطأ HTTP ${response.status}`
      );
    }

    if (!data.success) {
      throw new Error(
        data.error ||
        "الخادم لم يعطِ إجابة صحيحة."
      );
    }

    /* حذف رسالة التحميل */
    loadingMessage.remove();

    /* عرض إجابة المساعد */
    addMessage(
      data.answer ||
      "لم يتم العثور على إجابة.",
      "bot"
    );

  } catch (error) {
    console.error(
      "Gemini error:",
      error
    );

    loadingMessage.remove();

    addMessage(
      "تعذر إرسال الرسالة إلى المساعد حالياً. حاول مرة أخرى.",
      "bot"
    );

  } finally {
    isSending = false;

    sendButton.disabled = false;
    questionInput.disabled = false;

    questionInput.focus();
  }
}

/* زر الإرسال */
if (sendButton) {
  sendButton.addEventListener(
    "click",
    sendMessage
  );
}

/* الضغط على Enter */
if (questionInput) {
  questionInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }

    }
  );
}

/* التركيز على مربع الكتابة */
window.addEventListener(
  "load",
  function () {
    if (questionInput) {
      questionInput.focus();
    }
  }
);

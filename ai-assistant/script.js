const GEMINI_API_URL =
"https://smart-digital-marketing.onrender.com/api/gemini";

const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("question");
const sendButton = document.getElementById("sendButton");
const companyInput = document.getElementById("company");
const sectionInput = document.getElementById("section");

let isSending = false;

/* إضافة رسالة إلى المحادثة */
function addMessage(text, type) {

const message = document.createElement("div");

message.className =
type === "user"
? "message user-message"
: "message bot-message";

if (type === "user") {

message.innerHTML = `
  <div class="message-content">

    <div class="message-name">
      أنت
    </div>

    <div class="message-bubble">
      ${escapeHtml(text)}
    </div>

  </div>

  <div class="message-avatar">
    👤
  </div>
`;

} else {

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

/* رسالة مؤقتة أثناء انتظار الذكاء الاصطناعي */
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

/* تحويل النص إلى HTML بسيط */
function formatAnswer(text) {

if (!text) {
return "";
}

let result = escapeHtml(text);

/* الأسطر الجديدة */
result = result.replace(/\n/g, "<br>");

/* النص الغامق /
result = result.replace(
/**(.?)**/g,
"<strong>$1</strong>"
);

/* القوائم */
result = result.replace(
/(^|<br>)* /g,
"$1• "
);

return result;
}

/* حماية النص الذي يكتبه المستخدم */
function escapeHtml(text) {

const div = document.createElement("div");

div.textContent = text;

return div.innerHTML;
}

/* النزول إلى آخر رسالة */
function scrollToBottom() {

chatMessages.scrollTop =
chatMessages.scrollHeight;
}

/* إرسال السؤال */
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

/* عرض سؤال المستخدم */
addMessage(question, "user");

/* تنظيف مربع الكتابة */
questionInput.value = "";

questionInput.focus();

/* حالة الإرسال */
isSending = true;

sendButton.disabled = true;

questionInput.disabled = true;

/* رسالة الانتظار */
const loadingMessage =
addLoadingMessage();

try {

const response =
  await fetch(GEMINI_API_URL, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      question: question,

      company: company,

      section: section

    })

  });


let data;

try {

  data = await response.json();

} catch (jsonError) {

  throw new Error(
    "تعذر قراءة استجابة الخادم."
  );
}


if (!response.ok || !data.success) {

  throw new Error(
    data.error ||
    "حدث خطأ أثناء الاتصال بالمساعد."
  );
}


/* إزالة رسالة الانتظار */
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
  "تعذر الاتصال بالمساعد حالياً. تأكد من اتصال الإنترنت وحاول مرة أخرى.",
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
sendButton.addEventListener(
"click",
sendMessage
);

/* إرسال بالضغط على Enter */
questionInput.addEventListener(
"keydown",
function(event) {

if (
  event.key === "Enter" &&
  !event.shiftKey
) {

  event.preventDefault();

  sendMessage();

}

}
);

/* جعل الزر يعمل أيضاً في حال تحميل الصفحة */
document.addEventListener(
"DOMContentLoaded",
function() {

questionInput.focus();

}
);

DXN Chatbot Knowledge Base

Overview

The chatbot knowledge base contains the questions and answers used by the DXN automatic reply system.

The system supports multiple data sources to make updating information easier.

---

Data Sources

1. questions.json

Location:

dxn-auto-reply/questions.json

Purpose:

- Stores the main chatbot questions.
- Contains predefined answers.
- Works as the primary knowledge source.

Example structure:

[
  {
    "question": "كيف أسجل في DXN؟",
    "answer": "يمكنك التسجيل عن طريق التواصل مع الفريق.",
    "keywords": ["تسجيل", "عضوية"],
    "whatsapp": true
  }
]

---

2. Google Sheets

Purpose:

Allow updating chatbot content without changing code.

The sheet can contain:

- Question.
- Answer.
- Keywords.
- WhatsApp option.

The chatbot reads the published CSV version.

---

3. Local Storage

Purpose:

Save local additions from the administration system.

Used for:

- Testing new questions.
- Temporary updates.
- Local customization.

---

Answer Format

Each answer contains:

Question

The user message that should match.

Answer

The response displayed by the chatbot.

Keywords

Additional words that improve matching.

WhatsApp

Determines whether to show the WhatsApp contact button.

---

Matching Process

When the user asks a question:

1. Normalize the text.
2. Compare with stored questions.
3. Calculate the matching score.
4. Select the highest result.
5. Return the answer.

---

Future Improvements

Planned:

- AI-generated answers.
- Automatic learning from conversations.
- Categories for questions.
- Multi-language knowledge base.
- Advanced search.

DXN Chatbot Documentation

Overview

The DXN chatbot is an intelligent automatic reply system designed to answer customer questions about DXN products, registration, business opportunities, and support.

The chatbot works without a server and runs directly in the browser.

---

Main Components

User Interface

Location:

dxn-auto-reply/

Responsible for:

- Displaying the chat window.
- Receiving user messages.
- Showing chatbot answers.
- Providing quick reply buttons.

---

Message Flow

The chatbot process:

1. User enters a question.
2. The message is cleaned and normalized.
3. The engine compares the question with the knowledge base.
4. A matching score is calculated.
5. The highest score answer is returned.
6. The answer is displayed to the user.

---

Answer Engine

Location:

dxn-chat-core/engine.js

Responsibilities:

- Text analysis.
- Question matching.
- Answer selection.

The engine uses a scoring system:

- Exact match gets a high score.
- Similar words increase the score.
- Keywords improve matching accuracy.

---

Knowledge Sources

The chatbot loads answers from:

questions.json

Main question database.

Google Sheets

Allows updating questions without editing code.

Local Storage

Stores local additions from the browser.

---

WhatsApp Integration

The chatbot can generate a WhatsApp contact button.

Used for:

- Direct customer communication.
- Support requests.
- Questions without available answers.

---

Improvement Goals

Future improvements:

- Better Arabic language understanding.
- Synonyms support.
- AI-powered answers.
- Conversation memory.
- Customer analytics.

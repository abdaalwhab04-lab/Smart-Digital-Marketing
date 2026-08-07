Smart Digital Marketing — System Architecture

Overview

Smart Digital Marketing is a web-based digital marketing platform that includes an intelligent DXN customer support chatbot.

The system is designed to be modular, easy to maintain, and compatible with AI development tools.

---

System Structure

Frontend Layer

Responsible for the user interface.

Contains:

- Website pages.
- Chat interface.
- User interaction elements.
- Styling files.

---

Chatbot Layer

Folder:

dxn-auto-reply/

Responsibilities:

- Display chat window.
- Receive user messages.
- Show chatbot responses.
- Connect the interface with the answer engine.

Main files:

index.html

The chatbot interface.

chat.js

Handles:

- Sending messages.
- Displaying responses.
- Loading answers.
- Connecting with the engine.

config.js

Contains configuration settings.

---

Core Engine Layer

Folder:

dxn-chat-core/

Responsibilities:

- Analyze user questions.
- Normalize text.
- Calculate matching scores.
- Select the best answer.

Main files:

engine.js

The main intelligent matching engine.

utils.js

Contains helper functions.

---

Knowledge Layer

Sources:

- questions.json
- Google Sheets CSV
- Local Storage

The chatbot combines these sources into one knowledge database.

---

Deployment Layer

The project uses:

- Git
- GitHub
- GitHub Pages

The repository stores all versions and changes.

---

Future Architecture

Planned additions:

- Admin dashboard.
- Analytics system.
- AI integrations.
- Multi-channel messaging.
- Advanced customer management.


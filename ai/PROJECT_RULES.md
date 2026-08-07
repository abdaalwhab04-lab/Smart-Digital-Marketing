Smart Digital Marketing — Development Rules

General Rules

1. Never delete project files unless the user explicitly requests it.
2. Never rename files, folders, or functions without user approval.
3. Preserve backward compatibility whenever possible.
4. Keep the existing project structure.
5. Avoid unnecessary code duplication.

Coding Standards

- Use clear and readable JavaScript.
- Prefer modular code.
- Keep functions short and focused.
- Write comments for important logic.
- Do not introduce breaking changes.

Chatbot Rules

- The chatbot must always load its knowledge correctly.
- Keep support for:
  - questions.json
  - Google Sheets
  - Local Storage
- Do not remove WhatsApp integration.
- Do not remove the chatbot scoring engine unless instructed.

Git Rules

- Never modify Git history.
- Never force push.
- Always create meaningful commit messages.
- Keep the working tree clean whenever possible.

AI Assistant Rules

Before making changes:

1. Read PROJECT_CONTEXT.md.
2. Read FILE_MAP.md.
3. Read TASKS.md.
4. Understand the requested task.
5. Change only what is necessary.

Safety Rules

- Never expose secrets or credentials.
- Never delete user data.
- Ask for clarification if a requested change is ambiguous.

Goal

The priority is to keep the project stable, maintainable, and easy to extend.


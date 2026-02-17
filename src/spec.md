# Specification

## Summary
**Goal:** Add authenticated private 1:1 chat with a user picker and automatic 3-second polling for new messages, while keeping the existing Internet Identity login/logout UX unchanged.

**Planned changes:**
- Confirm the existing Internet Identity login/logout UI remains the only auth flow; no duplicate login buttons or providers added.
- Backend: add private conversation message storage keyed by user pair; authenticated send-message endpoint; fetch-messages endpoint supporting incremental “only new since last seen” retrieval.
- Backend: add a query endpoint to list selectable chat users from existing profile data (exclude the caller; include principal + display name/username, and support existing avatar usage).
- Frontend: add an authenticated “Chat” entry point that opens a user-picker modal listing users with avatar + display name/username; selecting a user opens a private chat view.
- Frontend: implement private chat view with message history, send message, and polling every 3 seconds while the chat is open; stop polling when closed; English labels/empty states.

**User-visible outcome:** Logged-in users can click “Chat”, pick another user from a list, and exchange private messages; the chat updates automatically every 3 seconds while open. Logged-out users won’t see (or will be prompted to log in for) chat entry points, and the existing Internet Identity login/logout continues to work as before.

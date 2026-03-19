
## Task 5 — Message Schema, Migration, Context, Tests (DONE)
- Migration: `20260311180804_create_messages.exs` — messages table with FK to agents
- Schema: `lib/backend/messaging/message.ex` — Ecto schema with belongs_to :to_agent
- Context: `lib/backend/messaging.ex` — list_messages, list_messages_for_agent, get_unread_messages, send_message, mark_read, get_message!
- Tests: `test/backend/messaging_test.exs` — 16 tests, 0 failures
- Full suite: 66 tests, 0 failures
- Commit: c57c027 feat(backend): add message schema, migration, and tests

# Copi.po — Aitzaz AI Social Copilot

Advanced AI social assistant for TikTok LIVE conversation support and WhatsApp Business automation.

## Goals
- TikTok LIVE conversation copilot: understand viewer messages/comments, maintain context, and generate natural American-English reply suggestions.
- Conversation modes: Friendly, Funny, Smart, Short, Warm.
- Viewer memory and relationship context.
- WhatsApp Business AI agent with automatic replies and human-approval mode.
- Shared AI brain, memory, safety rules, analytics and audit logs.
- Secure server-side provider configuration so users do not repeatedly enter API keys.

## Integration rule
Only official/authorized TikTok and WhatsApp capabilities will be used. The application must not bypass platform authentication, anti-bot controls, or unsupported private APIs.

## Planned stack
- Backend: FastAPI + Python
- Database: PostgreSQL (SQLite for local development)
- Frontend: Next.js + TypeScript
- AI provider abstraction: OpenAI first
- Deployment: Docker

## Current status
Foundation scaffold. Implementation will be delivered incrementally with tests and deployment checks.

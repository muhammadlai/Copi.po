# Copi.po — Aitzaz AI Social Copilot

Advanced AI social assistant for TikTok LIVE conversation support and WhatsApp Business automation.

## Chromebook AI Host preview

Branch: `chromebook-ai-host`

The browser preview includes an original animated fictional avatar, ChromeOS browser text-to-speech, optional browser speech input, response styles, and an AI reply request to the existing FastAPI backend. It is a prototype, not a connected TikTok LIVE broadcaster.

### Run locally on Chromebook

1. Open the Chromebook Linux terminal and install Docker with your preferred supported Linux setup, or use another computer/server with Docker.
2. In this repository branch, copy `.env.example` to `.env`.
3. Put your OpenAI API key in `.env` on the server only. Never put API keys in frontend code or commit them to GitHub.
4. From the repository root, run:
   ```bash
   docker compose up --build
   ```
5. Open `http://localhost:3000` in Chrome. The API health check is `http://localhost:8000/health`.

If the backend has not been configured, the avatar and browser voice demo still work, but AI-generated replies will not work. ChromeOS voice choices depend on installed browser voices and may not include a female voice on every device.

## TikTok integration status

The current browser preview does not log in to TikTok, fetch LIVE comments, or broadcast to LIVE. Those features require supported official/authorized access and must be implemented and tested separately. Do not use private endpoints, credential sharing, or anti-bot bypasses.

## Existing project goals

- TikTok LIVE conversation copilot: understand viewer messages/comments, maintain context, and generate natural American-English reply suggestions.
- Conversation modes: Friendly, Funny, Smart, Short, Warm.
- Viewer memory and relationship context.
- WhatsApp Business AI agent with automatic replies and human-approval mode.
- Shared AI brain, memory, safety rules, analytics and audit logs.
- Secure server-side provider configuration so users do not repeatedly enter API keys.

## Planned stack

- Backend: FastAPI + Python
- Database: PostgreSQL (SQLite for local development)
- Frontend: Next.js + TypeScript
- AI provider abstraction: OpenAI first
- Deployment: Docker

## Current status

Foundation scaffold plus Chromebook browser avatar/voice preview. Realistic 3D model, deployed server, automatic authorized TikTok LIVE event ingestion, and live broadcast integration remain future work.

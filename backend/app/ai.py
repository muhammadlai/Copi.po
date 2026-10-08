from openai import OpenAI
from .config import settings

MODES = {
    "friendly": "warm, friendly and easy to talk to",
    "funny": "playful and lightly funny without forcing jokes",
    "smart": "sharp, thoughtful and genuinely useful",
    "short": "brief, natural and conversational",
    "warm": "kind, welcoming and emotionally intelligent",
}

def build_prompt(message: str, mode: str, person_context: str = "") -> str:
    style = MODES.get(mode, MODES["friendly"])
    return f"""You are Aitzaz's real-time social copilot.
Write a natural American-English reply to the viewer/contact message below.
Style: {style}.
Never sound like a bot, marketer, translator, or scripted assistant.
Keep the conversation moving with a relevant question or hook when appropriate.
Do not invent facts about Aitzaz. Do not claim to have done something you cannot do.
Context about this person: {person_context or "No saved context."}

Incoming message:
{message}

Return ONLY the reply text."""
    
def generate_reply(message: str, mode: str = "friendly", person_context: str = "") -> str:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured on the backend.")
    client = OpenAI(api_key=settings.openai_api_key)
    result = client.responses.create(
        model=settings.openai_model,
        input=build_prompt(message, mode, person_context),
    )
    return result.output_text.strip()

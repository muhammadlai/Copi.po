from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Copi.po AI Social Copilot API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "copi.po-api", "version": "0.1.0"}

@app.get("/api/v1")
async def api_info():
    return {"name": "Copi.po", "modules": ["ai-brain", "memory", "tiktok-copilot", "whatsapp-agent", "analytics"]}

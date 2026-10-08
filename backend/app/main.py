from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import Base, engine
from .routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Copi.po AI Social Copilot API", version="0.2.0")
origins = [x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "copi.po-api", "version": "0.2.0"}

@app.get("/api/v1")
async def api_info():
    return {"name": "Copi.po", "modules": ["ai-brain", "memory", "tiktok-copilot", "whatsapp-agent", "analytics"]}

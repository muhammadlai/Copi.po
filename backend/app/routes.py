import json
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.orm import Session
from .db import get_db
from .models import Base, Person, Message, Event
from .ai import generate_reply
from .config import settings
from .whatsapp import send_whatsapp_text

router = APIRouter(prefix="/api/v1")

class ReplyRequest(BaseModel):
    platform: str = "tiktok"
    external_id: str = "demo"
    display_name: str = ""
    message: str = Field(min_length=1)
    mode: str = "friendly"

@router.post("/ai/reply")
def ai_reply(body: ReplyRequest, db: Session = Depends(get_db)):
    person = db.scalar(select(Person).where(Person.platform == body.platform, Person.external_id == body.external_id))
    if not person:
        person = Person(platform=body.platform, external_id=body.external_id, display_name=body.display_name)
        db.add(person); db.flush()
    context = f"name={person.display_name}; notes={person.notes}; interests={person.interests}"
    db.add(Message(person_id=person.id, platform=body.platform, direction="inbound", text=body.message))
    reply = generate_reply(body.message, body.mode, context)
    db.add(Message(person_id=person.id, platform=body.platform, direction="suggestion", text=reply))
    person.last_seen_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    db.commit()
    return {"reply": reply, "person_id": person.id, "mode": body.mode}

@router.get("/people")
def people(db: Session = Depends(get_db)):
    rows = db.scalars(select(Person).order_by(desc(Person.last_seen_at)).limit(100)).all()
    return [{"id": x.id, "platform": x.platform, "external_id": x.external_id, "display_name": x.display_name, "notes": x.notes, "interests": x.interests, "last_seen_at": x.last_seen_at} for x in rows]

@router.get("/people/{person_id}/messages")
def person_messages(person_id: int, db: Session = Depends(get_db)):
    rows = db.scalars(select(Message).where(Message.person_id == person_id).order_by(Message.created_at)).all()
    return [{"id": x.id, "direction": x.direction, "platform": x.platform, "text": x.text, "created_at": x.created_at} for x in rows]

@router.get("/whatsapp/webhook")
def whatsapp_verify(
    hub_mode: str = Query("", alias="hub.mode"),
    hub_challenge: str = Query("", alias="hub.challenge"),
    hub_verify_token: str = Query("", alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Webhook verification failed")

@router.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    db.add(Event(platform="whatsapp", event_type="webhook", payload=json.dumps(payload)))
    db.commit()
    return {"ok": True}

@router.post("/whatsapp/send")
async def whatsapp_send(to: str, text: str):
    return await send_whatsapp_text(to, text)

@router.post("/tiktok/webhook")
async def tiktok_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    db.add(Event(platform="tiktok", event_type="webhook", payload=json.dumps(payload)))
    db.commit()
    return {"ok": True}

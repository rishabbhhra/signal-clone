import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models import Call, User
from app.schemas import UserBrief
from app.auth import get_current_user

router = APIRouter(prefix="/api/calls", tags=["calls"])


class CallOut(BaseModel):
    id: str
    caller: UserBrief
    receiver: Optional[UserBrief] = None
    call_type: str  # "audio" | "video"
    status: str  # "missed", "incoming", "outgoing", "completed"
    duration_seconds: int
    call_link: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CallCreate(BaseModel):
    receiver_id: Optional[str] = None
    call_type: str = "audio"
    status: str = "completed"
    duration_seconds: int = 0


@router.get("", response_model=List[CallOut])
async def list_calls(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Call)
        .where(or_(Call.caller_id == current_user.id, Call.receiver_id == current_user.id))
        .order_by(Call.created_at.desc())
        .limit(50)
    )
    res = await db.execute(query)
    calls = res.scalars().all()
    return calls


@router.post("/link")
async def create_call_link(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    link_id = uuid.uuid4().hex[:12]
    call_link = f"https://signal.group/#call/{link_id}"
    new_call = Call(
        caller_id=current_user.id,
        receiver_id=None,
        call_type="video",
        status="completed",
        call_link=call_link,
        created_at=datetime.utcnow(),
    )
    db.add(new_call)
    await db.commit()
    return {"call_link": call_link}


@router.post("", response_model=CallOut)
async def record_call(
    req: CallCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_call = Call(
        caller_id=current_user.id,
        receiver_id=req.receiver_id,
        call_type=req.call_type,
        status=req.status,
        duration_seconds=req.duration_seconds,
        created_at=datetime.utcnow(),
    )
    db.add(new_call)
    await db.commit()
    await db.refresh(new_call)
    return new_call

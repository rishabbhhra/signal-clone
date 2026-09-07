from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models import Story, User
from app.schemas import UserBrief
from app.auth import get_current_user

router = APIRouter(prefix="/api/stories", tags=["stories"])


class StoryOut(BaseModel):
    id: str
    user_id: str
    user: UserBrief
    content: Optional[str] = None
    media_url: Optional[str] = None
    created_at: datetime
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoryCreate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None


@router.get("", response_model=List[StoryOut])
async def list_stories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.utcnow()
    query = (
        select(Story)
        .where(Story.expires_at > now)
        .order_by(Story.created_at.desc())
    )
    res = await db.execute(query)
    stories = res.scalars().all()
    return stories


@router.post("", response_model=StoryOut, status_code=status.HTTP_201_CREATED)
async def create_story(
    req: StoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.utcnow()
    new_story = Story(
        user_id=current_user.id,
        content=req.content,
        media_url=req.media_url,
        created_at=now,
        expires_at=now + timedelta(hours=24),
    )
    db.add(new_story)
    await db.commit()
    await db.refresh(new_story)
    return new_story

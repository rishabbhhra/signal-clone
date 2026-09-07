from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List, Optional

from app.database import get_db
from app.models import User
from app.schemas import UserBrief, UserOut, UserUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=List[UserBrief])
async def search_users(
    q: Optional[str] = Query(None, description="Search query by username or display name"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).where(User.id != current_user.id)
    if q:
        search_term = f"%{q.strip()}%"
        query = query.where(
            or_(
                User.username.ilike(search_term),
                User.display_name.ilike(search_term),
                User.phone_number.ilike(search_term),
            )
        )
    result = await db.execute(query.limit(30))
    users = result.scalars().all()
    return [UserBrief.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserOut)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.display_name is not None:
        current_user.display_name = req.display_name.strip()
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    if req.bio is not None:
        current_user.bio = req.bio

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/{user_id}/safety-number")
async def get_safety_number(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns safety number comparing current user and contact for Signal E2E simulation."""
    result = await db.execute(select(User).where(User.id == user_id))
    other_user = result.scalars().first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Deterministic 60-digit number between the two users
    import hashlib
    combined = "-".join(sorted([current_user.id, other_user.id]))
    h = hashlib.sha256(combined.encode()).hexdigest()
    # convert hex digits to numeric segments
    num_str = "".join([str(int(c, 16) % 10) for c in h]) * 2
    segments = [num_str[i * 5 : (i + 1) * 5] for i in range(12)]
    safety_number = " ".join(segments)

    return {
        "safety_number": safety_number,
        "current_user_name": current_user.display_name,
        "contact_name": other_user.display_name,
        "verified": True,
        "encryption_protocol": "Signal Protocol (Double Ratchet + Curve25519 - Simulated)",
    }

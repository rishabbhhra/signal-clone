from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from app.database import get_db
from app.models import User
from app.schemas import (
    OTPRequest,
    OTPVerify,
    TokenResponse,
    UserOut,
    SwitchUserRequest,
    UserBrief,
)
from app.auth import create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/request-otp")
async def request_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    """Mock OTP request. Returns mock OTP in response for testing convenience."""
    identifier = req.identifier.strip()
    return {
        "message": f"OTP sent successfully to {identifier}",
        "otp": settings.FIXED_OTP,
        "hint": "Use 123456 (or the returned OTP) to complete login / registration",
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(req: OTPVerify, db: AsyncSession = Depends(get_db)):
    """Verifies OTP (accepts fixed OTP 123456) and creates or logs in the user."""
    if req.otp != settings.FIXED_OTP and req.otp != "000000":
        # Allow any 6-digit OTP in test mode for convenience, or reject if clearly invalid
        if len(req.otp) != 6 or not req.otp.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP. Please enter the 6-digit code (e.g. 123456).",
            )

    identifier = req.identifier.strip()
    # Check if existing user by phone or username
    result = await db.execute(
        select(User).where(
            or_(User.phone_number == identifier, User.username == identifier)
        )
    )
    user = result.scalars().first()

    if not user:
        # Create new user
        is_phone = identifier.startswith("+") or identifier.replace("-", "").isdigit()
        username = identifier.lstrip("+").lower() if is_phone else identifier.lower()
        # ensure unique username
        existing = await db.execute(select(User).where(User.username == username))
        if existing.scalars().first():
            import random
            username = f"{username}_{random.randint(100, 999)}"

        display_name = req.display_name or (f"User {identifier[-4:]}" if is_phone else identifier)
        avatar = req.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"

        user = User(
            phone_number=identifier if is_phone else None,
            username=username,
            display_name=display_name,
            avatar_url=avatar,
            is_online=True,
            last_seen=datetime.utcnow(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update profile if provided
        if req.display_name:
            user.display_name = req.display_name
        if req.avatar_url:
            user.avatar_url = req.avatar_url
        user.is_online = True
        user.last_seen = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": user.id, "username": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.post("/switch-user", response_model=TokenResponse)
async def switch_user(req: SwitchUserRequest, db: AsyncSession = Depends(get_db)):
    """Fast switch between accounts (Alice, Bob, Moxie, etc.) for effortless testing."""
    result = await db.execute(select(User).where(User.id == req.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = create_access_token({"sub": user.id, "username": user.username})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/seed-users", response_model=List[UserBrief])
async def list_seed_users(db: AsyncSession = Depends(get_db)):
    """Lists available users for the quick switcher."""
    result = await db.execute(select(User).order_by(User.created_at.asc()))
    users = result.scalars().all()
    return [UserBrief.model_validate(u) for u in users]

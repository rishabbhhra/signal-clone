from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from app.database import get_db
from app.models import Contact, User
from app.schemas import ContactAddRequest, ContactOut, UserBrief
from app.auth import get_current_user

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("", response_model=List[ContactOut])
async def list_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contact)
        .where(Contact.user_id == current_user.id)
        .order_by(Contact.created_at.desc())
    )
    contacts = result.scalars().all()
    # load contact_user for each
    output = []
    for c in contacts:
        u_res = await db.execute(select(User).where(User.id == c.contact_user_id))
        u = u_res.scalars().first()
        if u:
            output.append(
                ContactOut(
                    id=c.id,
                    contact_user=UserBrief.model_validate(u),
                    nickname=c.nickname,
                    created_at=c.created_at,
                )
            )
    return output


@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
async def add_contact(
    req: ContactAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    identifier = req.identifier.strip()
    result = await db.execute(
        select(User).where(
            or_(User.phone_number == identifier, User.username == identifier)
        )
    )
    target_user = result.scalars().first()

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail=f"User with username or phone '{identifier}' not found on Signal",
        )

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a contact")

    # Check if already added
    existing = await db.execute(
        select(Contact).where(
            Contact.user_id == current_user.id,
            Contact.contact_user_id == target_user.id,
        )
    )
    contact = existing.scalars().first()
    if contact:
        return ContactOut(
            id=contact.id,
            contact_user=UserBrief.model_validate(target_user),
            nickname=contact.nickname,
            created_at=contact.created_at,
        )

    new_contact = Contact(
        user_id=current_user.id,
        contact_user_id=target_user.id,
        nickname=req.nickname,
    )
    db.add(new_contact)
    await db.commit()
    await db.refresh(new_contact)

    return ContactOut(
        id=new_contact.id,
        contact_user=UserBrief.model_validate(target_user),
        nickname=new_contact.nickname,
        created_at=new_contact.created_at,
    )


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Contact).where(
            Contact.id == contact_id, Contact.user_id == current_user.id
        )
    )
    contact = result.scalars().first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    await db.delete(contact)
    await db.commit()
    return None

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional

from app.database import get_db
from app.models import (
    Conversation,
    ConversationParticipant,
    Message,
    MessageReaction,
    User,
)
from app.schemas import (
    MessageOut,
    MessageSend,
    ReactionToggleRequest,
    MessageReactionOut,
    MessageReplyBrief,
    UserBrief,
)
from app.auth import get_current_user
from app.websocket_manager import ws_manager

router = APIRouter(tags=["messages"])


def format_message_out(msg: Message) -> MessageOut:
    reply_out = None
    if msg.reply_to:
        reply_out = MessageReplyBrief(
            id=msg.reply_to.id,
            content=msg.reply_to.content,
            message_type=msg.reply_to.message_type,
            sender_id=msg.reply_to.sender_id,
            sender_name=msg.reply_to.sender.display_name if msg.reply_to.sender else "User",
        )

    reactions_out = [
        MessageReactionOut(
            id=r.id,
            emoji=r.emoji,
            user_id=r.user_id,
            user_name=r.user.display_name if r.user else "User",
        )
        for r in msg.reactions
    ]

    sender_brief = (
        UserBrief.model_validate(msg.sender)
        if msg.sender
        else UserBrief(id=msg.sender_id, username="unknown", display_name="Unknown")
    )

    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        sender=sender_brief,
        content=msg.content,
        message_type=msg.message_type,
        file_url=msg.file_url,
        file_name=msg.file_name,
        file_size=msg.file_size,
        reply_to=reply_out,
        status=msg.status,
        expires_at=msg.expires_at,
        created_at=msg.created_at,
        reactions=reactions_out,
    )


@router.get("/api/conversations/{conv_id}/messages", response_model=List[MessageOut])
async def get_messages(
    conv_id: str,
    limit: int = Query(100, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify caller is participant
    part_res = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    my_part = part_res.scalars().first()
    if not my_part:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    now = datetime.utcnow()
    # Delete expired disappearing messages
    expired_res = await db.execute(
        select(Message).where(
            Message.conversation_id == conv_id,
            Message.expires_at.isnot(None),
            Message.expires_at <= now,
        )
    )
    expired_msgs = expired_res.scalars().all()
    for exp in expired_msgs:
        await db.delete(exp)
    if expired_msgs:
        await db.commit()

    # Query remaining messages
    query = (
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    res = await db.execute(query)
    messages = res.scalars().all()

    # Mark incoming unread messages as read
    last_msg_id = None
    read_message_ids = []
    for m in messages:
        last_msg_id = m.id
        if m.sender_id != current_user.id and m.status != "read":
            m.status = "read"
            read_message_ids.append(m.id)

    if last_msg_id:
        my_part.last_read_message_id = last_msg_id

    await db.commit()

    # Broadcast read status to conversation participants
    if read_message_ids:
        all_parts_res = await db.execute(
            select(ConversationParticipant.user_id).where(
                ConversationParticipant.conversation_id == conv_id
            )
        )
        all_user_ids = [uid for uid, in all_parts_res.all()]
        await ws_manager.broadcast_to_users(
            all_user_ids,
            {
                "type": "messages_read",
                "conversation_id": conv_id,
                "read_by_user_id": current_user.id,
                "message_ids": read_message_ids,
            },
        )

    return [format_message_out(m) for m in messages]


@router.post("/api/conversations/{conv_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    conv_id: str,
    req: MessageSend,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = conv_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Verify sender is participant
    part_res = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    if not part_res.scalars().first():
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    # Determine initial message status
    all_parts = await db.execute(
        select(ConversationParticipant.user_id).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id != current_user.id,
        )
    )
    recipient_ids = [uid for uid, in all_parts.all()]

    initial_status = "sent"
    # Check if any recipient is viewing conversation -> read!
    any_viewing = any(ws_manager.is_user_viewing_conversation(rid, conv_id) for rid in recipient_ids)
    any_online = any(ws_manager.is_user_online(rid) for rid in recipient_ids)

    if any_viewing:
        initial_status = "read"
    elif any_online:
        initial_status = "delivered"

    expires_at = None
    if conv.disappearing_seconds and conv.disappearing_seconds > 0:
        expires_at = datetime.utcnow() + timedelta(seconds=conv.disappearing_seconds)

    new_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=req.content,
        message_type=req.message_type,
        file_url=req.file_url,
        file_name=req.file_name,
        file_size=req.file_size,
        reply_to_id=req.reply_to_id,
        status=initial_status,
        expires_at=expires_at,
        created_at=datetime.utcnow(),
    )
    db.add(new_msg)
    conv.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(new_msg)

    # Re-query with eager loads
    full_msg_res = await db.execute(select(Message).where(Message.id == new_msg.id))
    msg_loaded = full_msg_res.scalars().first()
    out = format_message_out(msg_loaded)

    # Broadcast to all conversation members (including sender)
    all_member_ids = recipient_ids + [current_user.id]
    await ws_manager.broadcast_to_users(
        all_member_ids,
        {
            "type": "new_message",
            "conversation_id": conv_id,
            "message": out.model_dump(mode="json"),
        },
    )

    return out


@router.post("/api/conversations/{conv_id}/read")
async def mark_conversation_read(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    part_res = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    my_part = part_res.scalars().first()
    if not my_part:
        raise HTTPException(status_code=403, detail="Not a participant")

    # Mark all messages sent by others in this conversation as read
    msgs_res = await db.execute(
        select(Message).where(
            Message.conversation_id == conv_id,
            Message.sender_id != current_user.id,
            Message.status != "read",
        )
    )
    msgs = msgs_res.scalars().all()
    read_ids = []
    for m in msgs:
        m.status = "read"
        read_ids.append(m.id)

    last_msg = await db.execute(
        select(Message.id).where(Message.conversation_id == conv_id).order_by(Message.created_at.desc()).limit(1)
    )
    last_id = last_msg.scalar_one_or_none()
    if last_id:
        my_part.last_read_message_id = last_id

    await db.commit()

    if read_ids:
        all_parts = await db.execute(
            select(ConversationParticipant.user_id).where(
                ConversationParticipant.conversation_id == conv_id
            )
        )
        all_uids = [uid for uid, in all_parts.all()]
        await ws_manager.broadcast_to_users(
            all_uids,
            {
                "type": "messages_read",
                "conversation_id": conv_id,
                "read_by_user_id": current_user.id,
                "message_ids": read_ids,
            },
        )

    return {"message": "Marked as read", "count": len(read_ids)}


@router.post("/api/messages/{message_id}/react")
async def toggle_message_reaction(
    message_id: str,
    req: ReactionToggleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg_res = await db.execute(select(Message).where(Message.id == message_id))
    msg = msg_res.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Check if user already reacted with this emoji
    existing_res = await db.execute(
        select(MessageReaction).where(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == current_user.id,
            MessageReaction.emoji == req.emoji,
        )
    )
    existing = existing_res.scalars().first()

    if existing:
        await db.delete(existing)
        action = "removed"
    else:
        new_reaction = MessageReaction(
            message_id=message_id,
            user_id=current_user.id,
            emoji=req.emoji,
        )
        db.add(new_reaction)
        action = "added"

    await db.commit()

    # Fetch updated reactions
    all_reacts_res = await db.execute(
        select(MessageReaction).where(MessageReaction.message_id == message_id)
    )
    reactions = all_reacts_res.scalars().all()
    reactions_out = [
        MessageReactionOut(
            id=r.id,
            emoji=r.emoji,
            user_id=r.user_id,
            user_name=r.user.display_name if r.user else "User",
        )
        for r in reactions
    ]

    # Notify conversation participants
    parts_res = await db.execute(
        select(ConversationParticipant.user_id).where(
            ConversationParticipant.conversation_id == msg.conversation_id
        )
    )
    member_ids = [uid for uid, in parts_res.all()]
    await ws_manager.broadcast_to_users(
        member_ids,
        {
            "type": "reaction_update",
            "conversation_id": msg.conversation_id,
            "message_id": message_id,
            "reactions": [r.model_dump() for r in reactions_out],
        },
    )

    return {"message": f"Reaction {action}", "reactions": reactions_out}


@router.delete("/api/messages/{message_id}", status_code=status.HTTP_200_OK)
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg_res = await db.execute(select(Message).where(Message.id == message_id))
    msg = msg_res.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own messages")

    conv_id = msg.conversation_id
    await db.delete(msg)
    await db.commit()

    parts_res = await db.execute(
        select(ConversationParticipant.user_id).where(
            ConversationParticipant.conversation_id == conv_id
        )
    )
    member_ids = [uid for uid, in parts_res.all()]
    await ws_manager.broadcast_to_users(
        member_ids,
        {
            "type": "message_deleted",
            "conversation_id": conv_id,
            "message_id": message_id,
        },
    )

    return {"message": "Message deleted"}

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from typing import List, Optional

from app.database import get_db
from app.models import (
    Conversation,
    ConversationParticipant,
    Message,
    User,
)
from app.schemas import (
    ConversationOut,
    ConversationCreateDirect,
    ConversationCreateGroup,
    ConversationParticipantOut,
    GroupMemberAddRequest,
    DisappearingSettingsUpdate,
    MessageOut,
    UserBrief,
    MessageReactionOut,
)
from app.auth import get_current_user
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


async def format_conversation_out(
    conv: Conversation,
    current_user_id: str,
    db: AsyncSession,
) -> ConversationOut:
    # Load participants
    part_query = select(ConversationParticipant).where(
        ConversationParticipant.conversation_id == conv.id
    )
    part_res = await db.execute(part_query)
    participants = part_res.scalars().all()

    participants_out = []
    direct_recipient = None

    for p in participants:
        u_res = await db.execute(select(User).where(User.id == p.user_id))
        u = u_res.scalars().first()
        if u:
            # check live presence from websocket manager
            is_online = ws_manager.is_user_online(u.id) or u.is_online
            u_brief = UserBrief(
                id=u.id,
                username=u.username,
                display_name=u.display_name,
                avatar_url=u.avatar_url,
                is_online=is_online,
                last_seen=u.last_seen,
            )
            participants_out.append(
                ConversationParticipantOut(
                    id=p.id,
                    user_id=p.user_id,
                    role=p.role,
                    joined_at=p.joined_at,
                    user=u_brief,
                )
            )
            if conv.type == "direct" and u.id != current_user_id:
                direct_recipient = u_brief

    if conv.type == "note_to_self":
        direct_recipient = UserBrief(
            id=current_user_id,
            username="note_to_self",
            display_name="Note to Self",
            avatar_url=None,
            is_online=True,
        )

    # Find last message
    msg_query = (
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    msg_res = await db.execute(msg_query)
    last_msg = msg_res.scalars().first()

    last_msg_out = None
    if last_msg:
        sender_res = await db.execute(select(User).where(User.id == last_msg.sender_id))
        sender = sender_res.scalars().first()
        sender_brief = UserBrief.model_validate(sender) if sender else UserBrief(
            id=last_msg.sender_id, username="unknown", display_name="Unknown"
        )
        reactions_out = [
            MessageReactionOut(
                id=r.id,
                emoji=r.emoji,
                user_id=r.user_id,
                user_name=r.user.display_name if r.user else "User",
            )
            for r in last_msg.reactions
        ]
        last_msg_out = MessageOut(
            id=last_msg.id,
            conversation_id=last_msg.conversation_id,
            sender_id=last_msg.sender_id,
            sender=sender_brief,
            content=last_msg.content,
            message_type=last_msg.message_type,
            file_url=last_msg.file_url,
            file_name=last_msg.file_name,
            file_size=last_msg.file_size,
            reply_to=None,
            status=last_msg.status,
            expires_at=last_msg.expires_at,
            created_at=last_msg.created_at,
            reactions=reactions_out,
        )

    # Calculate unread count for current user
    # Find current user's participant entry
    my_part = next((p for p in participants if p.user_id == current_user_id), None)
    unread_count = 0
    if my_part:
        if my_part.last_read_message_id:
            # find last read message's created_at
            lrm_res = await db.execute(
                select(Message.created_at).where(Message.id == my_part.last_read_message_id)
            )
            lrm_time = lrm_res.scalar_one_or_none()
            if lrm_time:
                unread_res = await db.execute(
                    select(func.count(Message.id)).where(
                        Message.conversation_id == conv.id,
                        Message.sender_id != current_user_id,
                        Message.created_at > lrm_time,
                    )
                )
                unread_count = unread_res.scalar() or 0
            else:
                unread_res = await db.execute(
                    select(func.count(Message.id)).where(
                        Message.conversation_id == conv.id,
                        Message.sender_id != current_user_id,
                    )
                )
                unread_count = unread_res.scalar() or 0
        else:
            unread_res = await db.execute(
                select(func.count(Message.id)).where(
                    Message.conversation_id == conv.id,
                    Message.sender_id != current_user_id,
                )
            )
            unread_count = unread_res.scalar() or 0

    return ConversationOut(
        id=conv.id,
        type=conv.type,
        name=conv.name,
        avatar_url=conv.avatar_url,
        created_by=conv.created_by,
        disappearing_seconds=conv.disappearing_seconds,
        updated_at=conv.updated_at,
        participants=participants_out,
        last_message=last_msg_out,
        unread_count=unread_count,
        direct_recipient=direct_recipient,
    )


@router.get("", response_model=List[ConversationOut])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Ensure Note to Self conversation exists for current user
    note_conv_res = await db.execute(
        select(Conversation)
        .join(ConversationParticipant)
        .where(
            Conversation.type == "note_to_self",
            ConversationParticipant.user_id == current_user.id,
        )
    )
    note_conv = note_conv_res.scalars().first()
    if not note_conv:
        note_conv = Conversation(
            id=f"conv-note-{current_user.id}",
            type="note_to_self",
            name="Note to Self",
            created_by=current_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(note_conv)
        await db.flush()
        part = ConversationParticipant(
            conversation_id=note_conv.id,
            user_id=current_user.id,
            role="admin",
        )
        db.add(part)
        welcome_note = Message(
            conversation_id=note_conv.id,
            sender_id=current_user.id,
            content="hi",
            message_type="text",
            status="read",
            created_at=datetime.utcnow(),
        )
        db.add(welcome_note)
        await db.commit()

    # Find all conversations where current_user is participant
    query = (
        select(Conversation)
        .join(ConversationParticipant)
        .where(ConversationParticipant.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    res = await db.execute(query)
    convs = res.scalars().all()

    output = []
    for c in convs:
        output.append(await format_conversation_out(c, current_user.id, db))
    return output


@router.post("/direct", response_model=ConversationOut)
async def get_or_create_direct_conversation(
    req: ConversationCreateDirect,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if req.contact_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot create direct conversation with yourself")

    target_res = await db.execute(select(User).where(User.id == req.contact_user_id))
    target_user = target_res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Check if a direct conversation already exists between these 2 users
    find_query = (
        select(Conversation)
        .join(ConversationParticipant)
        .where(Conversation.type == "direct")
        .where(
            ConversationParticipant.user_id.in_([current_user.id, target_user.id])
        )
        .group_by(Conversation.id)
        .having(func.count(ConversationParticipant.id) == 2)
    )
    res = await db.execute(find_query)
    existing_conv = res.scalars().first()

    if existing_conv:
        return await format_conversation_out(existing_conv, current_user.id, db)

    # Create new direct conversation
    new_conv = Conversation(
        type="direct",
        created_by=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_conv)
    await db.flush()

    p1 = ConversationParticipant(
        conversation_id=new_conv.id,
        user_id=current_user.id,
        role="member",
    )
    p2 = ConversationParticipant(
        conversation_id=new_conv.id,
        user_id=target_user.id,
        role="member",
    )
    db.add_all([p1, p2])
    await db.commit()
    await db.refresh(new_conv)

    return await format_conversation_out(new_conv, current_user.id, db)


@router.post("/group", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
async def create_group_conversation(
    req: ConversationCreateGroup,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Group name is required")

    # Member IDs must include current_user
    member_set = set(req.member_ids)
    member_set.add(current_user.id)

    avatar = req.avatar_url or f"https://api.dicebear.com/7.x/shapes/svg?seed={req.name}"

    new_conv = Conversation(
        type="group",
        name=req.name.strip(),
        avatar_url=avatar,
        created_by=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_conv)
    await db.flush()

    # Add creator as admin
    participants = [
        ConversationParticipant(
            conversation_id=new_conv.id,
            user_id=current_user.id,
            role="admin",
        )
    ]
    for uid in member_set:
        if uid != current_user.id:
            # check user exists
            u_check = await db.execute(select(User).where(User.id == uid))
            if u_check.scalars().first():
                participants.append(
                    ConversationParticipant(
                        conversation_id=new_conv.id,
                        user_id=uid,
                        role="member",
                    )
                )

    db.add_all(participants)

    # Add system message
    sys_msg = Message(
        conversation_id=new_conv.id,
        sender_id=current_user.id,
        content=f"{current_user.display_name} created the group \"{new_conv.name}\"",
        message_type="system",
        status="delivered",
    )
    db.add(sys_msg)

    await db.commit()
    await db.refresh(new_conv)

    conv_out = await format_conversation_out(new_conv, current_user.id, db)

    # Notify all participants via WebSocket
    await ws_manager.broadcast_to_users(
        list(member_set),
        {"type": "new_conversation", "conversation": conv_out.model_dump(mode="json")},
    )

    return conv_out


@router.get("/{conv_id}", response_model=ConversationOut)
async def get_conversation(
    conv_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify participant
    part = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    if not part.scalars().first():
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = conv_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return await format_conversation_out(conv, current_user.id, db)


@router.post("/{conv_id}/members")
async def add_group_member(
    conv_id: str,
    req: GroupMemberAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = conv_res.scalars().first()
    if not conv or conv.type != "group":
        raise HTTPException(status_code=400, detail="Invalid group conversation")

    # Check caller is admin or member
    caller_part = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    caller = caller_part.scalars().first()
    if not caller:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    # Check if target already in group
    target_part = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == req.user_id,
        )
    )
    if target_part.scalars().first():
        raise HTTPException(status_code=400, detail="User already in this group")

    target_user_res = await db.execute(select(User).where(User.id == req.user_id))
    target_user = target_user_res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_part = ConversationParticipant(
        conversation_id=conv_id,
        user_id=req.user_id,
        role="member",
    )
    db.add(new_part)

    # System message
    sys_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=f"{current_user.display_name} added {target_user.display_name} to the group",
        message_type="system",
        status="delivered",
    )
    db.add(sys_msg)
    conv.updated_at = datetime.utcnow()
    await db.commit()

    # Get updated conversation
    updated = await format_conversation_out(conv, current_user.id, db)
    # Broadcast to all members
    member_ids = [p.user_id for p in updated.participants]
    await ws_manager.broadcast_to_users(
        member_ids,
        {"type": "group_updated", "conversation": updated.model_dump(mode="json")},
    )

    return {"message": "Member added successfully", "conversation": updated}


@router.delete("/{conv_id}/members/{user_id}")
async def remove_group_member(
    conv_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = conv_res.scalars().first()
    if not conv or conv.type != "group":
        raise HTTPException(status_code=400, detail="Invalid group conversation")

    # Caller must be admin or removing self (leaving group)
    caller_part = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    caller = caller_part.scalars().first()
    if not caller:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    if user_id != current_user.id and caller.role != "admin":
        raise HTTPException(status_code=403, detail="Only group admins can remove other members")

    target_part_res = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == user_id,
        )
    )
    target_part = target_part_res.scalars().first()
    if not target_part:
        raise HTTPException(status_code=404, detail="Member not in this group")

    target_user_res = await db.execute(select(User).where(User.id == user_id))
    target_user = target_user_res.scalars().first()
    target_name = target_user.display_name if target_user else "User"

    await db.delete(target_part)

    action_text = f"{target_name} left the group" if user_id == current_user.id else f"{current_user.display_name} removed {target_name} from the group"
    sys_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=action_text,
        message_type="system",
        status="delivered",
    )
    db.add(sys_msg)
    conv.updated_at = datetime.utcnow()
    await db.commit()

    updated = await format_conversation_out(conv, current_user.id, db)
    all_notified = [p.user_id for p in updated.participants] + [user_id]
    await ws_manager.broadcast_to_users(
        all_notified,
        {"type": "group_updated", "conversation": updated.model_dump(mode="json")},
    )

    return {"message": "Member removed successfully"}


@router.patch("/{conv_id}/disappearing")
async def update_disappearing_settings(
    conv_id: str,
    req: DisappearingSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = conv_res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    part_res = await db.execute(
        select(ConversationParticipant).where(
            ConversationParticipant.conversation_id == conv_id,
            ConversationParticipant.user_id == current_user.id,
        )
    )
    if not part_res.scalars().first():
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")

    conv.disappearing_seconds = req.disappearing_seconds
    conv.updated_at = datetime.utcnow()

    # System message
    time_label = "off"
    if req.disappearing_seconds > 0:
        if req.disappearing_seconds < 60:
            time_label = f"{req.disappearing_seconds} seconds"
        elif req.disappearing_seconds < 3600:
            time_label = f"{req.disappearing_seconds // 60} minutes"
        elif req.disappearing_seconds < 86400:
            time_label = f"{req.disappearing_seconds // 3600} hours"
        else:
            time_label = f"{req.disappearing_seconds // 86400} days"

    sys_msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=f"{current_user.display_name} set disappearing messages to {time_label}",
        message_type="system",
        status="delivered",
    )
    db.add(sys_msg)
    await db.commit()

    updated = await format_conversation_out(conv, current_user.id, db)
    member_ids = [p.user_id for p in updated.participants]
    await ws_manager.broadcast_to_users(
        member_ids,
        {"type": "disappearing_updated", "conversation_id": conv_id, "disappearing_seconds": req.disappearing_seconds},
    )

    return {"message": "Disappearing settings updated", "disappearing_seconds": req.disappearing_seconds}

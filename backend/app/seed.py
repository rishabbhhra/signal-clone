from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import (
    User,
    Contact,
    Conversation,
    ConversationParticipant,
    Message,
    MessageReaction,
    generate_safety_number,
)


async def seed_database(db: AsyncSession):
    # Check if users already exist
    existing = await db.execute(select(User).limit(1))
    if existing.scalars().first():
        return

    print("--- Seeding Database with Realistic Signal Users and Conversations ---")

    # 1. Create Seed Users
    users_data = [
        {
            "id": "usr-moxie",
            "username": "moxie",
            "display_name": "Moxie Marlinspike",
            "phone_number": "+1 555 0101",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Moxie&mouth=smile&hair=dreads01",
            "bio": "Signal co-founder & cryptographer. Speak freely.",
            "safety_number": generate_safety_number(),
            "is_online": True,
        },
        {
            "id": "usr-snowden",
            "username": "snowden",
            "display_name": "Edward Snowden",
            "phone_number": "+1 555 0102",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Snowden&eyebrows=default&facialHair=beardLight",
            "bio": "Privacy is the power to selectively reveal oneself to the world.",
            "safety_number": generate_safety_number(),
            "is_online": False,
        },
        {
            "id": "usr-alice",
            "username": "alice",
            "display_name": "Alice Smith",
            "phone_number": "+1 555 0103",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=AliceSmith&hair=long01&clothing=blazerAndShirt",
            "bio": "Software Engineer. Privacy first.",
            "safety_number": generate_safety_number(),
            "is_online": True,
        },
        {
            "id": "usr-bob",
            "username": "bob",
            "display_name": "Bob Johnson",
            "phone_number": "+1 555 0104",
            "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=BobJohnson&hair=short01&facialHair=scruff",
            "bio": "Fullstack developer testing real-time WebSockets.",
            "safety_number": generate_safety_number(),
            "is_online": True,
        },
        {
            "id": "usr-signal",
            "username": "signal",
            "display_name": "Signal Official",
            "phone_number": "+1 555 0000",
            "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=SignalOfficial",
            "bio": "Say 'hello' to a different messaging experience. Free & private.",
            "safety_number": generate_safety_number(),
            "is_online": True,
        },
    ]

    users_map = {}
    for u_data in users_data:
        user = User(
            id=u_data["id"],
            username=u_data["username"],
            display_name=u_data["display_name"],
            phone_number=u_data["phone_number"],
            avatar_url=u_data["avatar_url"],
            bio=u_data["bio"],
            safety_number=u_data["safety_number"],
            is_online=u_data["is_online"],
            last_seen=datetime.utcnow() - timedelta(minutes=15),
            created_at=datetime.utcnow() - timedelta(days=30),
        )
        db.add(user)
        users_map[user.id] = user

    await db.flush()

    # 2. Seed Contacts for Alice (primary demo user)
    contacts_data = [
        ("usr-alice", "usr-moxie", "Moxie (Signal)"),
        ("usr-alice", "usr-snowden", "Edward Snowden"),
        ("usr-alice", "usr-bob", "Bob Johnson"),
        ("usr-alice", "usr-signal", "Signal Official"),
        ("usr-bob", "usr-alice", "Alice Smith"),
        ("usr-bob", "usr-moxie", "Moxie"),
        ("usr-moxie", "usr-alice", "Alice"),
        ("usr-snowden", "usr-alice", "Alice"),
    ]

    for uid, cid, nick in contacts_data:
        c = Contact(
            user_id=uid,
            contact_user_id=cid,
            nickname=nick,
            created_at=datetime.utcnow() - timedelta(days=20),
        )
        db.add(c)

    await db.flush()

    now = datetime.utcnow()

    # 3. Seed Conversations & Messages

    # --- Conversation 1: Alice & Bob (1-on-1 direct) ---
    conv_bob = Conversation(
        id="conv-alice-bob",
        type="direct",
        created_by="usr-alice",
        disappearing_seconds=0,
        created_at=now - timedelta(hours=3),
        updated_at=now - timedelta(minutes=2),
    )
    db.add(conv_bob)
    await db.flush()

    db.add_all([
        ConversationParticipant(conversation_id=conv_bob.id, user_id="usr-alice", role="member"),
        ConversationParticipant(conversation_id=conv_bob.id, user_id="usr-bob", role="member"),
    ])

    bob_msgs = [
        ("usr-bob", "Hey Alice! Have you tested the real-time WebSocket messaging on our Signal clone yet?", now - timedelta(hours=2), "read", None),
        ("usr-alice", "Yes Bob! The single check (sent), double check (delivered), and double blue check (read) receipts are working seamlessly.", now - timedelta(hours=1, minutes=45), "read", None),
        ("usr-bob", "That's awesome! Did you also check out message reactions and replies?", now - timedelta(minutes=30), "read", None),
        ("usr-alice", "Absolutely, you can quote messages, react with emojis, and attach files or voice notes.", now - timedelta(minutes=15), "read", None),
        ("usr-bob", "Try opening two browser tabs and test sending messages back and forth right now!", now - timedelta(minutes=2), "delivered", None),
    ]

    last_bob_msg_id = None
    for s_id, content, t, st, reply_to in bob_msgs:
        m = Message(
            conversation_id=conv_bob.id,
            sender_id=s_id,
            content=content,
            message_type="text",
            status=st,
            reply_to_id=reply_to,
            created_at=t,
        )
        db.add(m)
        await db.flush()
        last_bob_msg_id = m.id

        if "reactions" in content:
            r1 = MessageReaction(message_id=m.id, user_id="usr-alice", emoji="🔥", created_at=t + timedelta(seconds=10))
            r2 = MessageReaction(message_id=m.id, user_id="usr-bob", emoji="👍", created_at=t + timedelta(seconds=20))
            db.add_all([r1, r2])

    # --- Conversation 2: Alice & Moxie (1-on-1 direct) ---
    conv_moxie = Conversation(
        id="conv-alice-moxie",
        type="direct",
        created_by="usr-moxie",
        disappearing_seconds=0,
        created_at=now - timedelta(days=2),
        updated_at=now - timedelta(minutes=18),
    )
    db.add(conv_moxie)
    await db.flush()

    db.add_all([
        ConversationParticipant(conversation_id=conv_moxie.id, user_id="usr-alice", role="member"),
        ConversationParticipant(conversation_id=conv_moxie.id, user_id="usr-moxie", role="member"),
    ])

    moxie_msgs = [
        ("usr-moxie", "Alice, remember: Signal is designed so that the server knows nothing about who is talking to whom or what is being said.", now - timedelta(days=1), "read", None),
        ("usr-alice", "Exactly Moxie. That's why privacy by design is at the core of this interface.", now - timedelta(hours=5), "read", None),
        ("usr-moxie", "Verify our Safety Number whenever you get a chance to confirm the simulated cryptographic identity!", now - timedelta(minutes=18), "read", None),
    ]
    for s_id, content, t, st, reply_to in moxie_msgs:
        m = Message(
            conversation_id=conv_moxie.id,
            sender_id=s_id,
            content=content,
            message_type="text",
            status=st,
            reply_to_id=reply_to,
            created_at=t,
        )
        db.add(m)
        await db.flush()
        if "Safety Number" in content:
            r = MessageReaction(message_id=m.id, user_id="usr-alice", emoji="🔒", created_at=t + timedelta(seconds=5))
            db.add(r)

    # --- Conversation 3: Alice & Edward Snowden (1-on-1 direct) ---
    conv_snowden = Conversation(
        id="conv-alice-snowden",
        type="direct",
        created_by="usr-snowden",
        disappearing_seconds=3600,  # 1 hour disappearing
        created_at=now - timedelta(days=3),
        updated_at=now - timedelta(hours=1),
    )
    db.add(conv_snowden)
    await db.flush()

    db.add_all([
        ConversationParticipant(conversation_id=conv_snowden.id, user_id="usr-alice", role="member"),
        ConversationParticipant(conversation_id=conv_snowden.id, user_id="usr-snowden", role="member"),
    ])

    sys_sn = Message(
        conversation_id=conv_snowden.id,
        sender_id="usr-snowden",
        content="Edward Snowden set disappearing messages to 1 hour",
        message_type="system",
        status="delivered",
        created_at=now - timedelta(hours=2),
    )
    db.add(sys_sn)
    m_sn = Message(
        conversation_id=conv_snowden.id,
        sender_id="usr-snowden",
        content="Arguing that you don't care about the right to privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say.",
        message_type="text",
        status="read",
        created_at=now - timedelta(hours=1),
    )
    db.add(m_sn)
    await db.flush()
    r_sn = MessageReaction(message_id=m_sn.id, user_id="usr-alice", emoji="❤️", created_at=now - timedelta(minutes=50))
    db.add(r_sn)

    # --- Conversation 4: Group Chat: "Signal Security & Architecture" ---
    conv_group = Conversation(
        id="conv-group-signal-core",
        type="group",
        name="Signal Security & Architecture",
        avatar_url="https://api.dicebear.com/7.x/shapes/svg?seed=SignalSecurityArchitecture",
        created_by="usr-moxie",
        disappearing_seconds=0,
        created_at=now - timedelta(days=5),
        updated_at=now - timedelta(minutes=5),
    )
    db.add(conv_group)
    await db.flush()

    group_parts = [
        ConversationParticipant(conversation_id=conv_group.id, user_id="usr-moxie", role="admin"),
        ConversationParticipant(conversation_id=conv_group.id, user_id="usr-alice", role="member"),
        ConversationParticipant(conversation_id=conv_group.id, user_id="usr-bob", role="member"),
        ConversationParticipant(conversation_id=conv_group.id, user_id="usr-snowden", role="member"),
    ]
    db.add_all(group_parts)

    sys_grp = Message(
        conversation_id=conv_group.id,
        sender_id="usr-moxie",
        content="Moxie Marlinspike created the group \"Signal Security & Architecture\"",
        message_type="system",
        status="delivered",
        created_at=now - timedelta(days=5),
    )
    db.add(sys_grp)

    grp_msgs = [
        ("usr-moxie", "Welcome everyone to the Signal Security & Architecture working group.", now - timedelta(days=1), "read"),
        ("usr-snowden", "Good to be here. Real-time encryption protocols and minimal metadata logging are paramount.", now - timedelta(hours=12), "read"),
        ("usr-bob", "We've implemented full support for group messaging, member addition/removal, and typing states!", now - timedelta(hours=2), "read"),
        ("usr-alice", "All messages are persisting cleanly in SQLite, and WebSockets ensure instantaneous fan-out.", now - timedelta(minutes=5), "read"),
    ]
    for s_id, content, t, st in grp_msgs:
        m = Message(
            conversation_id=conv_group.id,
            sender_id=s_id,
            content=content,
            message_type="text",
            status=st,
            created_at=t,
        )
        db.add(m)
        await db.flush()
        if "SQLite" in content:
            r = MessageReaction(message_id=m.id, user_id="usr-bob", emoji="🚀", created_at=t + timedelta(seconds=15))
            db.add(r)

    # --- Conversation 5: Alice & Signal Support ---
    conv_signal = Conversation(
        id="conv-alice-signal-bot",
        type="direct",
        created_by="usr-signal",
        disappearing_seconds=0,
        created_at=now - timedelta(days=10),
        updated_at=now - timedelta(days=10),
    )
    db.add(conv_signal)
    await db.flush()

    db.add_all([
        ConversationParticipant(conversation_id=conv_signal.id, user_id="usr-alice", role="member"),
        ConversationParticipant(conversation_id=conv_signal.id, user_id="usr-signal", role="member"),
    ])

    m_bot = Message(
        conversation_id=conv_signal.id,
        sender_id="usr-signal",
        content="👋 Welcome to Signal! Share freely without ads, tracking, or compromise. Click on any contact to begin messaging.",
        message_type="text",
        status="read",
        created_at=now - timedelta(days=10),
    )
    db.add(m_bot)

    await db.commit()
    print("--- Database Seeding Completed Successfully! ---")

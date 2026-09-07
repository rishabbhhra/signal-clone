import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, ConversationParticipant
from app.websocket_manager import ws_manager
from app.seed import seed_database
from app.routers import auth, users, contacts, conversations, messages, upload, calls, stories

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("signal_clone")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized.")

    # Run seed data check
    async with AsyncSessionLocal() as session:
        await seed_database(session)
    logger.info("Database seeding check completed.")

    yield
    await engine.dispose()


app = FastAPI(
    title="Signal Clone API",
    description="Backend API and WebSocket service for Signal Messaging Clone",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(contacts.router)
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(upload.router)
app.include_router(calls.router)
app.include_router(stories.router)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Signal Clone Backend",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await ws_manager.connect(websocket, user_id)

    # Set user online in database
    async with AsyncSessionLocal() as session:
        u_res = await session.execute(select(User).where(User.id == user_id))
        user = u_res.scalars().first()
        if user:
            user.is_online = True
            user.last_seen = datetime.utcnow()
            await session.commit()

            # Broadcast presence to user's conversation peers
            conv_parts = await session.execute(
                select(ConversationParticipant.conversation_id).where(
                    ConversationParticipant.user_id == user_id
                )
            )
            conv_ids = [c for c, in conv_parts.all()]

            peer_parts = await session.execute(
                select(ConversationParticipant.user_id).where(
                    ConversationParticipant.conversation_id.in_(conv_ids),
                    ConversationParticipant.user_id != user_id,
                )
            )
            peer_uids = list(set([p for p, in peer_parts.all()]))
            await ws_manager.broadcast_presence(
                user_id=user_id,
                is_online=True,
                last_seen=user.last_seen.isoformat(),
                all_contact_ids=peer_uids,
            )

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")

                if action == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))

                elif action == "active_conversation":
                    cid = msg.get("conversation_id")
                    ws_manager.set_active_conversation(user_id, cid)

                elif action == "typing":
                    cid = msg.get("conversation_id")
                    is_typing = bool(msg.get("is_typing", False))
                    if cid:
                        # Broadcast typing to other members in the conversation
                        async with AsyncSessionLocal() as session:
                            parts = await session.execute(
                                select(ConversationParticipant.user_id).where(
                                    ConversationParticipant.conversation_id == cid,
                                    ConversationParticipant.user_id != user_id,
                                )
                            )
                            peer_ids = [p for p, in parts.all()]

                            u_res = await session.execute(select(User).where(User.id == user_id))
                            u = u_res.scalars().first()
                            uname = u.display_name if u else "Someone"

                        await ws_manager.broadcast_to_users(
                            peer_ids,
                            {
                                "type": "typing",
                                "conversation_id": cid,
                                "user_id": user_id,
                                "user_name": uname,
                                "is_typing": is_typing,
                            },
                        )

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        is_completely_offline = ws_manager.disconnect(websocket, user_id)
        if is_completely_offline:
            async with AsyncSessionLocal() as session:
                u_res = await session.execute(select(User).where(User.id == user_id))
                user = u_res.scalars().first()
                if user:
                    user.is_online = False
                    user.last_seen = datetime.utcnow()
                    await session.commit()

                    conv_parts = await session.execute(
                        select(ConversationParticipant.conversation_id).where(
                            ConversationParticipant.user_id == user_id
                        )
                    )
                    conv_ids = [c for c, in conv_parts.all()]

                    peer_parts = await session.execute(
                        select(ConversationParticipant.user_id).where(
                            ConversationParticipant.conversation_id.in_(conv_ids),
                            ConversationParticipant.user_id != user_id,
                        )
                    )
                    peer_uids = list(set([p for p, in peer_parts.all()]))
                    await ws_manager.broadcast_presence(
                        user_id=user_id,
                        is_online=False,
                        last_seen=user.last_seen.isoformat(),
                        all_contact_ids=peer_uids,
                    )

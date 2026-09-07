import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    ForeignKey,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_safety_number():
    """Generate a Signal-like 60-digit safety number grouped in 12 5-digit segments."""
    import random
    segments = [f"{random.randint(10000, 99999)}" for _ in range(12)]
    return " ".join(segments)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone_number = Column(String(32), unique=True, index=True, nullable=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    display_name = Column(String(128), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    bio = Column(String(256), default="Hey there! I am using Signal.")
    safety_number = Column(String(128), default=generate_safety_number)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    contacts = relationship(
        "Contact",
        foreign_keys="Contact.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    sent_messages = relationship("Message", back_populates="sender")
    participations = relationship(
        "ConversationParticipant",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    nickname = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "contact_user_id", name="uq_user_contact"),
    )

    user = relationship("User", foreign_keys=[user_id], back_populates="contacts")
    contact_user = relationship("User", foreign_keys=[contact_user_id])


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(String(16), nullable=False, default="direct")  # "direct" | "group"
    name = Column(String(128), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    disappearing_seconds = Column(Integer, default=0)  # 0 = off, 10, 60, 3600, 86400
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participants = relationship(
        "ConversationParticipant",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at.asc()",
    )


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(16), default="member")  # "admin" | "member"
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_read_message_id = Column(String(36), nullable=True)

    __table_args__ = (
        UniqueConstraint("conversation_id", "user_id", name="uq_conv_user"),
    )

    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", back_populates="participations", lazy="selectin")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False, default="")
    message_type = Column(String(16), default="text")  # "text", "image", "file", "voice", "system"
    file_url = Column(String(512), nullable=True)
    file_name = Column(String(256), nullable=True)
    file_size = Column(Integer, nullable=True)
    reply_to_id = Column(String(36), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(16), default="sent")  # "sending", "sent", "delivered", "read"
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages", lazy="selectin")
    reply_to = relationship("Message", remote_side=[id], lazy="selectin")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan", lazy="selectin")


class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(16), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("message_id", "user_id", "emoji", name="uq_msg_user_emoji"),
    )

    message = relationship("Message", back_populates="reactions")
    user = relationship("User", lazy="selectin")


class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    caller_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    call_type = Column(String(16), default="audio")  # "audio" | "video"
    status = Column(String(16), default="completed")  # "missed", "incoming", "outgoing", "completed"
    duration_seconds = Column(Integer, default=0)
    call_link = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    caller = relationship("User", foreign_keys=[caller_id], lazy="selectin")
    receiver = relationship("User", foreign_keys=[receiver_id], lazy="selectin")


class Story(Base):
    __tablename__ = "stories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    media_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", foreign_keys=[user_id], lazy="selectin")

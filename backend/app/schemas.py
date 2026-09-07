from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    username: str
    display_name: str
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserBrief(BaseModel):
    id: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserOut(UserBrief):
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    safety_number: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Auth Schemas
class OTPRequest(BaseModel):
    identifier: str  # phone_number or username


class OTPVerify(BaseModel):
    identifier: str
    otp: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class SwitchUserRequest(BaseModel):
    user_id: str


# Contact Schemas
class ContactAddRequest(BaseModel):
    identifier: str  # phone_number or username
    nickname: Optional[str] = None


class ContactOut(BaseModel):
    id: str
    contact_user: UserBrief
    nickname: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Message Reaction Schemas
class MessageReactionOut(BaseModel):
    id: str
    emoji: str
    user_id: str
    user_name: str

    model_config = ConfigDict(from_attributes=True)


class ReactionToggleRequest(BaseModel):
    emoji: str


# Message Schemas
class MessageReplyBrief(BaseModel):
    id: str
    content: str
    message_type: str
    sender_id: str
    sender_name: str

    model_config = ConfigDict(from_attributes=True)


class MessageSend(BaseModel):
    content: str = ""
    message_type: str = "text"  # "text" | "image" | "file" | "voice" | "system"
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    reply_to_id: Optional[str] = None


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender: UserBrief
    content: str
    message_type: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    reply_to: Optional[MessageReplyBrief] = None
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    reactions: List[MessageReactionOut] = []

    model_config = ConfigDict(from_attributes=True)


# Conversation Schemas
class ConversationCreateDirect(BaseModel):
    contact_user_id: str


class ConversationCreateGroup(BaseModel):
    name: str
    avatar_url: Optional[str] = None
    member_ids: List[str]


class ConversationParticipantOut(BaseModel):
    id: str
    user_id: str
    role: str
    joined_at: datetime
    user: UserBrief

    model_config = ConfigDict(from_attributes=True)


class ConversationOut(BaseModel):
    id: str
    type: str  # "direct" | "group"
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_by: Optional[str] = None
    disappearing_seconds: int = 0
    updated_at: datetime
    participants: List[ConversationParticipantOut] = []
    last_message: Optional[MessageOut] = None
    unread_count: int = 0
    direct_recipient: Optional[UserBrief] = None

    model_config = ConfigDict(from_attributes=True)


class GroupMemberAddRequest(BaseModel):
    user_id: str


class GroupMemberRemoveRequest(BaseModel):
    user_id: str


class DisappearingSettingsUpdate(BaseModel):
    disappearing_seconds: int = Field(ge=0, le=604800)  # up to 7 days

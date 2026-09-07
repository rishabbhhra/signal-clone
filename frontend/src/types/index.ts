export interface User {
  id: string;
  username: string;
  display_name: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  safety_number?: string | null;
  is_online: boolean;
  last_seen?: string | null;
  created_at: string;
}

export interface UserBrief {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  is_online: boolean;
  last_seen?: string | null;
}

export interface Contact {
  id: string;
  contact_user: UserBrief;
  nickname?: string | null;
  created_at: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
  user_name: string;
}

export interface MessageReplyBrief {
  id: string;
  content: string;
  message_type: string;
  sender_id: string;
  sender_name: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: UserBrief;
  content: string;
  message_type: "text" | "image" | "file" | "voice" | "system" | "poll" | string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  reply_to?: MessageReplyBrief | null;
  status: "sending" | "sent" | "delivered" | "read";
  expires_at?: string | null;
  created_at: string;
  reactions: MessageReaction[];
}

export interface ConversationParticipant {
  id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  user: UserBrief;
}

export interface Conversation {
  id: string;
  type: "direct" | "group" | "note_to_self";
  name?: string | null;
  avatar_url?: string | null;
  created_by?: string | null;
  disappearing_seconds: number;
  updated_at: string;
  participants: ConversationParticipant[];
  last_message?: Message | null;
  unread_count: number;
  direct_recipient?: UserBrief | null;
}

# Secure Messaging Platform (Signal Clone)

A pixel-perfect, production-grade clone of the **Signal Private Messenger** application built with a modern fullstack architecture (**Next.js 14 + TypeScript** and **Python FastAPI + SQLite + WebSockets**).

---

## 🌟 Key Features

### 1. Authentication & Onboarding
- **Phone / Username Registration & Login**: Onboard with phone number (e.g. `+1 555 0103`) or `@username`.
- **Mock OTP Flow**: Fixed code verification (`123456`) with a 1-click auto-fill helper.
- **Profile Customization**: Set display name, bio, and choose from Signal preset avatars.
- **Session Persistence**: JWT-based session storage in `localStorage`.
- **Fast Demo Account Switcher**: Switch instantly between pre-seeded test accounts (**Alice Smith**, **Bob Johnson**, **Moxie Marlinspike**, **Edward Snowden**, **Signal Support**) to test real-time messaging across two browser tabs.

### 2. Real-Time One-on-One Messaging
- **Instant Two-Way Messaging**: Real-time communication via WebSockets without page refreshes.
- **Signal Receipts System**:
  - `✓` Single check: Sent
  - `✓✓` Double check: Delivered to recipient's active session
  - `✓✓` **Double blue check**: Read by recipient
- **Typing Indicators**: Real-time 3-dot bouncing animation in chat bubbles and `"Alice is typing..."` subtitle in the conversation list.
- **Message Timestamps & Date Dividers**: Automatically grouped by `"Today"`, `"Yesterday"`, or formatted calendar dates.
- **Persistence**: All conversations, messages, and statuses are persisted in SQLite.

### 3. Group Messaging
- **Create Groups**: Name groups, generate avatars, and select initial members.
- **Group Member Management**:
  - View member list with **Admin** badges (`Crown` indicator).
  - Admins can add or remove members.
  - Members can leave the group at any time.
- **System Notifications**: Centered pill notifications for group creation, member additions, removals, and settings changes.

### 4. Signal Experience & Aesthetics
- **Signal Desktop Design**: Authentic charcoal dark theme (`#121214` background, `#1a1a1e` sidebar, `#2c6bed` outgoing bubble, `#2b2b32` incoming bubble).
- **Light Mode Support**: Seamless toggle between dark and light themes in Settings.
- **Responsive Layout**: Adapts gracefully across mobile, tablet, and desktop viewports.
- **Web Audio Sound Synthesis**: Built-in Signal incoming chime, outgoing message pop, and phone call ringtone using the browser's Web Audio API (zero external assets needed).

### 5. Bonus Features
- **Attachments (Images & Files)**: Multipart upload with inline image lightbox viewer and downloadable document cards.
- **Message Reactions**: Floating emoji reaction bar (`👍`, `❤️`, `😂`, `😮`, `😢`, `👏`, `🔥`) with real-time reaction counters docked on bubbles.
- **Quoted Replies**: Click reply on any message to pin a quote banner and render an embedded quoted snippet inside the message bubble.
- **Functional Disappearing Messages**: Configure timers (`Off`, `10s`, `1m`, `1h`, `1d`, `1w`). Messages automatically expire and purge after their duration.
- **Keyboard Shortcuts**: `Cmd+K` / `Ctrl+K` to search chats, `Enter` to send, `Shift+Enter` for newlines, `Esc` to close modals.

### 6. Mocked / Placeholder Sections
- **Voice & Video Calls**: Calling screen with ringtone audio synthesis, call duration counter, mute mic, video toggle, and hang up.
- **Simulated End-to-End Encryption**: 60-digit safety number grid (12 blocks of 5 digits) + simulated QR code verification.
- **Stories**: Ephemeral 24h stories placeholder modal.
- **Linked Devices**: Multi-device management and QR code link view.

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────────────┐
                        │      Next.js 14 Frontend (React 18)     │
                        │  Tailwind CSS • TypeScript • Web Audio  │
                        └──────────────┬──────────────────────────┘
                                       │
                    REST API (HTTP)    │   WebSocket (Real-Time Duplex)
                                       │
                        ┌──────────────┴──────────────────────────┐
                        │          FastAPI Backend (Python)       │
                        │        Connection Manager • Routers     │
                        └──────────────┬──────────────────────────┘
                                       │
                               SQLAlchemy (Async)
                                       │
                        ┌──────────────┴──────────────────────────┐
                        │           SQLite Database (WAL)         │
                        └─────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (SQLite)

The database schema is normalized and designed using SQLAlchemy 2.0 async engine:

| Table | Description |
|---|---|
| `users` | Stores accounts: `id`, `phone_number`, `username`, `display_name`, `avatar_url`, `bio`, `safety_number`, `is_online`, `last_seen`, `created_at`. |
| `contacts` | Saved contact relationships: `id`, `user_id`, `contact_user_id`, `nickname`, `created_at`. |
| `conversations` | Direct and group chat records: `id`, `type` (`direct` or `group`), `name`, `avatar_url`, `created_by`, `disappearing_seconds`, `updated_at`. |
| `conversation_participants` | Association between conversations and users: `id`, `conversation_id`, `user_id`, `role` (`admin` or `member`), `last_read_message_id`, `joined_at`. |
| `messages` | Chat messages: `id`, `conversation_id`, `sender_id`, `content`, `message_type` (`text`, `image`, `file`, `voice`, `system`), `file_url`, `file_name`, `file_size`, `reply_to_id`, `status` (`sending`, `sent`, `delivered`, `read`), `expires_at`, `created_at`. |
| `message_reactions` | Emoji reactions on messages: `id`, `message_id`, `user_id`, `emoji`, `created_at`. |

---

## 📡 WebSocket Event Protocol

The WebSocket endpoint connects to `ws://localhost:8000/ws/{user_id}`:

### Client -> Server Events
- `ping`: `{ "action": "ping" }` (Keepalive)
- `active_conversation`: `{ "action": "active_conversation", "conversation_id": "..." }`
- `typing`: `{ "action": "typing", "conversation_id": "...", "is_typing": true|false }`

### Server -> Client Broadcasts
- `new_message`: Pushed to all conversation members when a new message is sent.
- `typing`: Broadcasts `user_name` and `is_typing` state to other conversation participants.
- `messages_read`: Notifies sender that messages were opened and marked read (`status = "read"`).
- `reaction_update`: Broadcasts updated reactions list on a message.
- `presence`: Broadcasts online/offline status changes to contacts.
- `disappearing_updated`: Broadcasts changes in disappearing message timer.
- `message_deleted`: Broadcasts message removal when deleted or expired.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested with v24)
- **Python**: 3.10+ (tested with 3.12)
- **npm** or **yarn**

### Quick Start (Both Servers)

Run the automated launcher script from the root of `signal-clone`:
```bash
./run_all.sh
```
This launches:
- **FastAPI Backend**: `http://localhost:8000` (OpenAPI Docs at `http://localhost:8000/docs`)
- **Next.js Frontend**: `http://localhost:3000`

---

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (auto-creates database and loads seed data)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

To run the automated backend test suite:
```bash
PYTHONPATH=. pytest tests/test_api.py -v
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing Two-Way Real-Time Messaging

1. Open **Browser Window 1** at `http://localhost:3000`. By default, you are logged in as **Alice Smith**.
2. Open an **Incognito Window** (or second browser) at `http://localhost:3000`.
3. In the second window, use the fast switcher dropdown in the top-left header to switch to **Bob Johnson**.
4. Send a message from Bob to Alice:
   - Notice the typing indicator (`"Bob is typing..."`) appear in real time on Alice's screen.
   - The message instantly arrives on Alice's screen with a subtle Signal sound.
   - Bob's single tick `✓` instantly turns into a double tick `✓✓`, and turns blue when Alice views the chat.
   - Hover over any bubble to react with emojis (`🔥`, `❤️`, `👍`) or reply.

---

## 📋 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/request-otp` | Mock OTP request (returns `123456`). |
| `POST` | `/api/auth/verify-otp` | Verify OTP and obtain JWT bearer token. |
| `POST` | `/api/auth/switch-user` | Instant account switch for evaluation. |
| `GET` | `/api/auth/me` | Fetch authenticated user profile. |
| `GET` | `/api/users` | Search users by username, phone, or name. |
| `GET` | `/api/users/{id}/safety-number` | Calculate simulated 60-digit safety number. |
| `GET` | `/api/contacts` | List contacts. |
| `POST` | `/api/contacts` | Add contact by phone/username. |
| `GET` | `/api/conversations` | List user's conversations with preview & unread counts. |
| `POST` | `/api/conversations/direct` | Get or create 1-on-1 direct conversation. |
| `POST` | `/api/conversations/group` | Create a new group conversation. |
| `POST` | `/api/conversations/{id}/members` | Add member to group (Admin control). |
| `DELETE` | `/api/conversations/{id}/members/{uid}` | Remove member from group (Admin control). |
| `PATCH` | `/api/conversations/{id}/disappearing` | Update disappearing message timer. |
| `GET` | `/api/conversations/{id}/messages` | Fetch messages and mark incoming as read. |
| `POST` | `/api/conversations/{id}/messages` | Send message (text, attachment, quote). |
| `POST` | `/api/messages/{id}/react` | Toggle emoji reaction on message. |
| `DELETE` | `/api/messages/{id}` | Delete message. |
| `POST` | `/api/upload` | Upload image or attachment file. |
| `WS` | `/ws/{user_id}` | Real-time WebSocket connection. |

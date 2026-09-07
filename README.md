# Signal Clone — Secure Messaging Platform

A pixel-perfect, production-grade clone of the **Signal Private Messenger** application built with a modern fullstack architecture (**Next.js 14 + TypeScript** frontend and **Python FastAPI + SQLite + WebSockets** backend).

---

## 🌟 Key Features

### 1. Authentication & Onboarding
- **Phone / Username Registration & Login**: Onboard with phone number or `@username`.
- **Mock OTP Flow**: Fixed code verification (`123456`) with 1-click auto-fill.
- **Profile Customization**: Set display name, bio, and avatar photo.
- **Session Persistence**: JWT-based session stored in `localStorage`.
- **Fast Demo Account Switcher**: Instantly switch between **Alice Smith**, **Bob Johnson**, **Moxie Marlinspike**, **Edward Snowden**, **Signal Support** to test real-time messaging across two browser tabs.

### 2. Real-Time One-on-One Messaging
- **Instant Two-Way Messaging**: WebSocket-powered real-time communication.
- **Signal Receipts System**: `✓` Sent → `✓✓` Delivered → `✓✓` Blue = Read.
- **Typing Indicators**: Live `"Alice is typing..."` animation in chat and sidebar.
- **Message Timestamps & Date Dividers**: Grouped by `"Today"`, `"Yesterday"`, or calendar date.
- **Persistence**: All conversations, messages, and statuses persisted in SQLite.

### 3. Group Messaging
- **Create Groups**: Name, avatar, select members.
- **Group Member Management**: Admin badges, add/remove members, leave group.
- **System Notifications**: Pill-style notifications for group events.

### 4. Rich Messaging Features
- **📎 Attachments**: Photos, videos, and file uploads with inline image lightbox and downloadable document cards.
- **😊 Emoji / Sticker / GIF Picker**: Full emoji grid with 8 categories, search, skin tone selector, stickers and GIFs tabs.
- **🎙️ Voice Notes**: Real browser `MediaRecorder` recording with live waveform, discard/send controls, and in-chat audio player with scrubber and speed toggle (1×/1.5×/2×).
- **📊 Polls**: Create polls with multiple options, allow-multiple toggle, real-time voting via reactions.
- **💬 Quoted Replies**: Reply to any message with an embedded quote preview.
- **❤️ Message Reactions**: Floating emoji bar with real-time reaction counters on bubbles.
- **⏱️ Disappearing Messages**: Per-chat timers (Off / 30s / 5m / 1h / 1d / 1w / 4w).
- **⌨️ Keyboard Shortcuts**: `Cmd+K` / `Ctrl+K` search, `Enter` send, `Shift+Enter` newline, `Esc` close modals.

### 5. Signal-Authentic UI & Theme
- **Pixel-perfect Signal Desktop design**: Near-black `#111113` background, visible `#1e1e22` settings cards, `#2c6bed` outgoing bubbles.
- **Fully functional Settings panels**: General (Phone, Device, Permissions, Updates), Appearance (Language, Theme, Chat colour, Zoom), Chats (text input, folders, export), Calls (devices, relay), Notifications, Privacy, Data usage, Backups, Donate.
- **Official Signal favicon** (ICO + SVG + PNG).
- **Note to Self**: Styled welcome card with official chat badge.

### 6. Responsive Design
- 📱 **Mobile**: Single-panel view — chat list fills full screen, tap to open chat, **← back button** to return. Bottom tab bar replaces the side rail.
- 💻 **Tablet** (768px+): Sidebar + chat panel, activity rail hidden.
- 🖥️ **Desktop** (1024px+): Full 3-column Signal layout (activity rail + sidebar + chat canvas).

### 7. Mocked / Simulated Sections
- **Voice & Video Calls**: Call screen with ringtone synthesis, duration counter, mute, video toggle, hang up.
- **End-to-End Encryption**: 60-digit safety number grid + simulated QR verification.
- **Stories**: Ephemeral 24h story creator placeholder.
- **Linked Devices**: Multi-device management and QR link view.

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

## ☁️ Live Deployment

| | URL |
|---|---|
| 🌐 **Frontend** | [signal-clone-eosin-phi.vercel.app](https://signal-clone-eosin-phi.vercel.app) |
| ⚙️ **Backend API** | [signal-clone-backend-p0az.onrender.com](https://signal-clone-backend-p0az.onrender.com) |
| 📖 **API Docs** | [signal-clone-backend-p0az.onrender.com/docs](https://signal-clone-backend-p0az.onrender.com/docs) |

> **Note**: The backend runs on Render's free tier and may take ~30 seconds to wake up after inactivity. This is expected behaviour on the free plan.

---

## ☁️ Cloud Deployment (Vercel + Render)

The frontend is deployed on **Vercel** and the backend on **Render.com** (free tier, no credit card needed).

### Step 1 — Deploy Backend to Render

1. Go to [render.com](https://render.com) → sign up with GitHub.
2. Click **New + → Web Service** → connect the `signal-clone` repo.
3. Fill in the settings:

| Field | Value |
|---|---|
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

4. Click **Create Web Service**. After deploy, copy your Render URL, e.g.:
   ```
   https://signal-clone-backend-xxxx.onrender.com
   ```

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub.
2. Click **Add New Project** → import the `signal-clone` repo.
3. Set **Root Directory** to `frontend`.
4. Add these **Environment Variables** (using your Render URL from Step 1):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://your-backend.onrender.com/ws` |

5. Click **Deploy**. Vercel rebuilds automatically on every `git push`.

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

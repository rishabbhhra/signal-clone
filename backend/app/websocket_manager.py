import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")


class WebSocketManager:
    def __init__(self):
        # user_id -> List of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # conversation_id -> Set of user_ids currently viewing/active in that conversation
        self.conversation_viewers: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Active connections: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str) -> bool:
        """Disconnects a socket. Returns True if user has no remaining active connections (went offline)."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                # remove from any active viewers
                for viewers in self.conversation_viewers.values():
                    viewers.discard(user_id)
                return True
        return False

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    def set_active_conversation(self, user_id: str, conversation_id: str):
        # Remove from previous conversations
        for cid, viewers in self.conversation_viewers.items():
            if cid != conversation_id:
                viewers.discard(user_id)
        if conversation_id:
            if conversation_id not in self.conversation_viewers:
                self.conversation_viewers[conversation_id] = set()
            self.conversation_viewers[conversation_id].add(user_id)

    def is_user_viewing_conversation(self, user_id: str, conversation_id: str) -> bool:
        return conversation_id in self.conversation_viewers and user_id in self.conversation_viewers[conversation_id]

    async def send_personal_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            payload = json.dumps(message)
            dead_sockets = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {e}")
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                if dead in self.active_connections[user_id]:
                    self.active_connections[user_id].remove(dead)

    async def broadcast_to_users(self, user_ids: List[str], message: dict):
        for uid in set(user_ids):
            await self.send_personal_message(uid, message)

    async def broadcast_presence(self, user_id: str, is_online: bool, last_seen: str, all_contact_ids: List[str]):
        payload = {
            "type": "presence",
            "user_id": user_id,
            "is_online": is_online,
            "last_seen": last_seen,
        }
        await self.broadcast_to_users(all_contact_ids, payload)


ws_manager = WebSocketManager()

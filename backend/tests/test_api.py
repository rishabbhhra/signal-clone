import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import engine, Base, AsyncSessionLocal
from app.seed import seed_database


def run_async(coro):
    return asyncio.run(coro)


@pytest.fixture(scope="session", autouse=True)
def prepare_db():
    async def init():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as session:
            await seed_database(session)
    run_async(init())
    yield


def test_health():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    run_async(_test())


def test_auth_request_and_verify_otp():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Request OTP
            req_res = await ac.post("/api/auth/request-otp", json={"identifier": "+15551234567"})
            assert req_res.status_code == 200
            assert req_res.json()["otp"] == "123456"

            # Verify OTP
            verify_res = await ac.post(
                "/api/auth/verify-otp",
                json={
                    "identifier": "+15551234567",
                    "otp": "123456",
                    "display_name": "Test User",
                },
            )
            assert verify_res.status_code == 200
            data = verify_res.json()
            assert "access_token" in data
            assert data["user"]["display_name"] == "Test User"
    run_async(_test())


def test_seeded_users_and_messaging():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Switch to Alice
            res = await ac.post("/api/auth/switch-user", json={"user_id": "usr-alice"})
            assert res.status_code == 200
            data = res.json()
            token = data["access_token"]
            assert data["user"]["username"] == "alice"

            headers = {"Authorization": f"Bearer {token}"}

            # Check me
            me_res = await ac.get("/api/auth/me", headers=headers)
            assert me_res.status_code == 200
            assert me_res.json()["username"] == "alice"

            # Check conversations
            convs_res = await ac.get("/api/conversations", headers=headers)
            assert convs_res.status_code == 200
            convs = convs_res.json()
            assert len(convs) >= 3

            # Check messages in Alice-Bob conversation
            bob_conv = next(c for c in convs if c["id"] == "conv-alice-bob")
            msgs_res = await ac.get(f"/api/conversations/{bob_conv['id']}/messages", headers=headers)
            assert msgs_res.status_code == 200
            msgs = msgs_res.json()
            assert len(msgs) >= 4

            # Send a new message
            send_res = await ac.post(
                f"/api/conversations/{bob_conv['id']}/messages",
                headers=headers,
                json={"content": "Automated test message from Alice", "message_type": "text"},
            )
            assert send_res.status_code == 201
            new_msg = send_res.json()
            assert new_msg["content"] == "Automated test message from Alice"

            # React to message
            react_res = await ac.post(
                f"/api/messages/{new_msg['id']}/react",
                headers=headers,
                json={"emoji": "🚀"},
            )
            assert react_res.status_code == 200
            assert len(react_res.json()["reactions"]) == 1

            # Check safety number
            sec_res = await ac.get("/api/users/usr-bob/safety-number", headers=headers)
            assert sec_res.status_code == 200
            assert "safety_number" in sec_res.json()
    run_async(_test())

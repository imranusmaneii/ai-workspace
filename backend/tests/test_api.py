import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_register_validation(client):
    response = await client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "short",
        "name": "",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_validation(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@test.com",
        "password": "wrongpassword",
    })
    assert response.status_code in [401, 422]


@pytest.mark.asyncio
async def test_protected_route(client):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_workspaces_unauthenticated(client):
    response = await client.get("/api/v1/workspaces")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_models_endpoint(client):
    response = await client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

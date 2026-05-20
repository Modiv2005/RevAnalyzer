import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.auth import hash_password

# Create a clean in-memory SQLite database for testing!
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Setup clean tables before every test function
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    # Register an analyst user in database
    from backend.app.models import User
    hashed_pwd = hash_password("securepass123")
    user = User(
        email="test_analyst@firm.com",
        hashed_password=hashed_pwd,
        full_name="Sarah Analyst",
        role="analyst",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def analyst_token(client, test_user):
    # Fetch JWT login token
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test_analyst@firm.com", "password": "securepass123"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]

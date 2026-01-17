import os
import subprocess
import time
import socket
import pytest
from datetime import datetime, timezone
from uuid import uuid4

# Test database configuration - must be set BEFORE importing app
TEST_DB_HOST = os.getenv("TEST_DB_HOST", "localhost")
TEST_DB_PORT = os.getenv("TEST_DB_PORT", "5433")
TEST_DB_USER = os.getenv("TEST_DB_USER", "postgres")
TEST_DB_PASSWORD = os.getenv("TEST_DB_PASSWORD", "postgres")
TEST_DB_NAME = os.getenv("TEST_DB_NAME", "postgres_db_test")

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    f"postgresql://{TEST_DB_USER}:{TEST_DB_PASSWORD}@{TEST_DB_HOST}:{TEST_DB_PORT}/{TEST_DB_NAME}",
)

# Set DATABASE_URL for the app before importing it
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "test-secret-key")

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from main import app
from db.session import get_session
from db.models import (
    AssignmentSuggestionModel,
    CompanyModel,
    ShiftTemplateModel,
    UserModel,
    UserRole,
    WorkerShiftModel,
)
from api.auth.auth_service import create_access_token

# Path to docker-compose.test.yml (relative to backend/)
DOCKER_COMPOSE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "docker-compose.test.yml"
)


def is_port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """Check if a port is open."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False


def wait_for_postgres(host: str, port: int, timeout: int = 30) -> bool:
    """Wait for PostgreSQL to be ready."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_port_open(host, port):
            # Give postgres a moment to fully initialize
            time.sleep(1)
            return True
        time.sleep(0.5)
    return False


@pytest.fixture(scope="session", autouse=True)
def postgres_container():
    """Start PostgreSQL container for tests, stop it after."""
    host = TEST_DB_HOST
    port = int(TEST_DB_PORT)

    # Check if postgres is already running
    if is_port_open(host, port):
        print(f"\nPostgreSQL already running on {host}:{port}")
        yield
        return

    # Start the container
    print(f"\nStarting PostgreSQL test container...")
    subprocess.run(
        ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "up", "-d"],
        check=True,
        capture_output=True,
    )

    # Wait for postgres to be ready
    if not wait_for_postgres(host, port):
        subprocess.run(
            ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "down", "-v"],
            capture_output=True,
        )
        pytest.fail("PostgreSQL container failed to start")

    print(f"PostgreSQL test container ready on {host}:{port}")

    yield

    # Stop and remove the container
    print("\nStopping PostgreSQL test container...")
    subprocess.run(
        ["docker", "compose", "-f", DOCKER_COMPOSE_FILE, "down", "-v"],
        capture_output=True,
    )


# Create test engine (will be initialized after postgres is ready)
test_engine = None


def get_test_engine():
    global test_engine
    if test_engine is None:
        test_engine = create_engine(TEST_DATABASE_URL)
    return test_engine


@pytest.fixture(scope="session")
def setup_test_database(postgres_container):
    """Create all tables before running tests, drop them after."""
    engine = get_test_engine()
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(setup_test_database):
    """Create a new database session for each test with transaction rollback."""
    engine = setup_test_database
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with the test database session."""

    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def company(session: Session) -> CompanyModel:
    """Create a test company."""
    company = CompanyModel(id=uuid4(), name="Test Company")
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


@pytest.fixture
def admin_user(session: Session, company: CompanyModel) -> UserModel:
    """Create an admin user for testing."""
    user = UserModel(
        id=uuid4(),
        email="admin@test.com",
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        company_id=company.id,
        password="hashed_password",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def worker_user(session: Session, company: CompanyModel) -> UserModel:
    """Create a worker user for testing."""
    user = UserModel(
        id=uuid4(),
        email="worker@test.com",
        first_name="Worker",
        last_name="User",
        role=UserRole.WORKER,
        company_id=company.id,
        password="hashed_password",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def worker_users(session: Session, company: CompanyModel) -> list[UserModel]:
    """Create multiple worker users for testing."""
    workers = []
    for i in range(3):
        user = UserModel(
            id=uuid4(),
            email=f"worker{i}@test.com",
            first_name=f"Worker{i}",
            last_name="User",
            role=UserRole.WORKER,
            company_id=company.id,
            password="hashed_password",
        )
        session.add(user)
        workers.append(user)
    session.commit()
    for worker in workers:
        session.refresh(worker)
    return workers


@pytest.fixture
def admin_token(admin_user: UserModel) -> str:
    """Create a valid JWT token for the admin user."""
    return create_access_token({"user_id": str(admin_user.id)})


@pytest.fixture
def worker_token(worker_user: UserModel) -> str:
    """Create a valid JWT token for a worker user."""
    return create_access_token({"user_id": str(worker_user.id)})


@pytest.fixture
def shift_template(session: Session, company: CompanyModel) -> ShiftTemplateModel:
    """Create a shift template for testing."""
    template = ShiftTemplateModel(
        id=uuid4(),
        company_id=company.id,
        name="Morning Shift",
        position="Cashier",
        startTime="09:00",
        endTime="17:00",
        days=[1, 2, 3, 4, 5],  # Monday to Friday
    )
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


@pytest.fixture
def shift_templates(session: Session, company: CompanyModel) -> list[ShiftTemplateModel]:
    """Create multiple shift templates for testing."""
    templates = [
        ShiftTemplateModel(
            id=uuid4(),
            company_id=company.id,
            name="Morning Shift",
            position="Cashier",
            startTime="09:00",
            endTime="13:00",
            days=[1, 2, 3, 4, 5],
        ),
        ShiftTemplateModel(
            id=uuid4(),
            company_id=company.id,
            name="Afternoon Shift",
            position="Cashier",
            startTime="13:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5],
        ),
    ]
    for template in templates:
        session.add(template)
    session.commit()
    for template in templates:
        session.refresh(template)
    return templates


@pytest.fixture
def existing_worker_shift(
    session: Session,
    company: CompanyModel,
    worker_user: UserModel,
    shift_template: ShiftTemplateModel,
) -> WorkerShiftModel:
    """Create an existing worker shift for testing."""
    shift = WorkerShiftModel(
        id=uuid4(),
        worker_id=worker_user.id,
        company_id=company.id,
        template_id=shift_template.id,
        start_date=datetime(2025, 1, 6, 9, 0, tzinfo=timezone.utc),  # Monday
        end_date=datetime(2025, 1, 6, 17, 0, tzinfo=timezone.utc),
    )
    session.add(shift)
    session.commit()
    session.refresh(shift)
    return shift


@pytest.fixture
def assignment_suggestions(
    session: Session,
    company: CompanyModel,
    worker_users: list[UserModel],
    shift_template: ShiftTemplateModel,
) -> list[AssignmentSuggestionModel]:
    """Create assignment suggestions for testing."""
    suggestions = []
    for i, worker in enumerate(worker_users[:2]):
        suggestion = AssignmentSuggestionModel(
            id=uuid4(),
            worker_id=worker.id,
            company_id=company.id,
            template_id=shift_template.id,
            start_date=datetime(2025, 1, 6 + i, 9, 0, tzinfo=timezone.utc),
            end_date=datetime(2025, 1, 6 + i, 17, 0, tzinfo=timezone.utc),
            created_at=datetime.now(timezone.utc),
        )
        session.add(suggestion)
        suggestions.append(suggestion)
    session.commit()
    for suggestion in suggestions:
        session.refresh(suggestion)
    return suggestions

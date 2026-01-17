import pytest
from datetime import datetime, timezone
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from db.models import (
    AssignmentSuggestionModel,
    CompanyModel,
    ShiftTemplateModel,
    UserModel,
    WorkerShiftModel,
)


class TestAutoAssignEndpoint:
    """Integration tests for POST /worker-shifts/auto-assign endpoint."""

    def test_auto_assign_creates_suggestions(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        session: Session,
    ):
        """Test that auto-assign creates assignment suggestions in the database."""
        # Monday to Friday (Jan 6-10, 2025)
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 5  # 5 weekdays

        # Verify suggestions are in the database
        suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(suggestions) == 5

    def test_auto_assign_requires_admin_role(
        self,
        client: TestClient,
        worker_token: str,
        shift_template: ShiftTemplateModel,
    ):
        """Test that only admins can trigger auto-assign."""
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": worker_token},
        )

        assert response.status_code == 403
        assert response.json()["detail"] == "User must be ADMIN."

    def test_auto_assign_requires_authentication(self, client: TestClient):
        """Test that auto-assign requires authentication."""
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post("/worker-shifts/auto-assign", json=payload)

        assert response.status_code == 401

    def test_auto_assign_distributes_shifts_evenly(
        self,
        client: TestClient,
        admin_token: str,
        shift_templates: list[ShiftTemplateModel],
        worker_users: list[UserModel],
        session: Session,
    ):
        """Test that shifts are distributed evenly among workers."""
        # Single day with 2 templates and 3 workers
        payload = {
            "range_start": "2025-01-06T00:00:00Z",  # Monday
            "range_end": "2025-01-06T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        items = data["items"]

        # 2 templates = 2 suggestions
        assert len(items) == 2

        # Different workers should be assigned
        worker_ids = [item["worker_id"] for item in items]
        assert len(set(worker_ids)) == 2  # 2 unique workers

    def test_auto_assign_respects_existing_shifts(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        existing_worker_shift: WorkerShiftModel,
        session: Session,
    ):
        """Test that auto-assign respects existing worker shifts when overwrite is false."""
        payload = {
            "range_start": "2025-01-06T00:00:00Z",  # Monday (same as existing shift)
            "range_end": "2025-01-06T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()

        # Should assign to the worker who already has the shift (existing assignment)
        assert len(data["items"]) == 1
        assert data["items"][0]["worker_id"] == str(existing_worker_shift.worker_id)

    def test_auto_assign_overwrites_when_flag_set(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        existing_worker_shift: WorkerShiftModel,
        session: Session,
    ):
        """Test that auto-assign ignores existing shifts when overwrite is true."""
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-06T23:59:59Z",
            "overwrite_shifts": True,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1

    def test_auto_assign_clears_previous_suggestions(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        assignment_suggestions: list[AssignmentSuggestionModel],
        session: Session,
    ):
        """Test that auto-assign clears previous suggestions before creating new ones."""
        initial_count = len(session.exec(select(AssignmentSuggestionModel)).all())
        assert initial_count == 2  # From fixture

        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-06T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200

        # Old suggestions should be deleted, new ones created
        final_suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(final_suggestions) == 1  # Only the new one


class TestGetSuggestionsEndpoint:
    """Integration tests for GET /worker-shifts/suggestions endpoint."""

    def test_get_suggestions_returns_company_suggestions(
        self,
        client: TestClient,
        admin_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
    ):
        """Test that get suggestions returns all company suggestions."""
        response = client.get(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 2

    def test_get_suggestions_requires_admin(
        self,
        client: TestClient,
        worker_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
    ):
        """Test that only admins can view suggestions."""
        response = client.get(
            "/worker-shifts/suggestions",
            cookies={"access_token": worker_token},
        )

        assert response.status_code == 403

    def test_get_suggestions_returns_empty_when_none(
        self,
        client: TestClient,
        admin_token: str,
    ):
        """Test that get suggestions returns empty list when no suggestions exist."""
        response = client.get(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []


class TestAcceptSuggestionsEndpoint:
    """Integration tests for POST /worker-shifts/suggestions/accept endpoint."""

    def test_accept_suggestions_creates_worker_shifts(
        self,
        client: TestClient,
        admin_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
        session: Session,
    ):
        """Test that accepting suggestions creates actual worker shifts."""
        response = client.post(
            "/worker-shifts/suggestions/accept",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["count"] == 2

        # Verify worker shifts were created
        worker_shifts = session.exec(select(WorkerShiftModel)).all()
        assert len(worker_shifts) == 2

        # Verify suggestions were deleted
        suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(suggestions) == 0

    def test_accept_suggestions_requires_admin(
        self,
        client: TestClient,
        worker_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
    ):
        """Test that only admins can accept suggestions."""
        response = client.post(
            "/worker-shifts/suggestions/accept",
            cookies={"access_token": worker_token},
        )

        assert response.status_code == 403

    def test_accept_suggestions_with_no_suggestions(
        self,
        client: TestClient,
        admin_token: str,
    ):
        """Test accepting when there are no suggestions."""
        response = client.post(
            "/worker-shifts/suggestions/accept",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0


class TestDeclineSuggestionsEndpoint:
    """Integration tests for DELETE /worker-shifts/suggestions endpoint."""

    def test_decline_suggestions_deletes_all(
        self,
        client: TestClient,
        admin_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
        session: Session,
    ):
        """Test that declining suggestions deletes all company suggestions."""
        response = client.delete(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["count"] == 2

        # Verify suggestions were deleted
        suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(suggestions) == 0

    def test_decline_suggestions_requires_admin(
        self,
        client: TestClient,
        worker_token: str,
        assignment_suggestions: list[AssignmentSuggestionModel],
    ):
        """Test that only admins can decline suggestions."""
        response = client.delete(
            "/worker-shifts/suggestions",
            cookies={"access_token": worker_token},
        )

        assert response.status_code == 403

    def test_decline_suggestions_with_no_suggestions(
        self,
        client: TestClient,
        admin_token: str,
    ):
        """Test declining when there are no suggestions."""
        response = client.delete(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0


class TestAutoAssignWorkflow:
    """End-to-end integration tests for the complete auto-assign workflow."""

    def test_full_workflow_generate_and_accept(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        session: Session,
    ):
        """Test the complete workflow: generate suggestions -> accept -> verify shifts."""
        # Step 1: Generate suggestions
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        suggestions_data = response.json()
        assert len(suggestions_data["items"]) == 5

        # Step 2: Verify suggestions exist
        response = client.get(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        assert len(response.json()["items"]) == 5

        # Step 3: Accept suggestions
        response = client.post(
            "/worker-shifts/suggestions/accept",
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        assert response.json()["count"] == 5

        # Step 4: Verify worker shifts were created
        worker_shifts = session.exec(select(WorkerShiftModel)).all()
        assert len(worker_shifts) == 5

        # Step 5: Verify suggestions are gone
        suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(suggestions) == 0

    def test_full_workflow_generate_and_decline(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        session: Session,
    ):
        """Test the workflow: generate suggestions -> decline -> verify no shifts."""
        # Step 1: Generate suggestions
        payload = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }

        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload,
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200

        # Step 2: Decline suggestions
        response = client.delete(
            "/worker-shifts/suggestions",
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        assert response.json()["count"] == 5

        # Step 3: Verify no worker shifts were created
        worker_shifts = session.exec(select(WorkerShiftModel)).all()
        assert len(worker_shifts) == 0

        # Step 4: Verify suggestions are gone
        suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(suggestions) == 0

    def test_regenerate_suggestions_replaces_old_ones(
        self,
        client: TestClient,
        admin_token: str,
        shift_template: ShiftTemplateModel,
        worker_users: list[UserModel],
        session: Session,
    ):
        """Test that regenerating suggestions replaces old ones."""
        # First generation
        payload1 = {
            "range_start": "2025-01-06T00:00:00Z",
            "range_end": "2025-01-07T23:59:59Z",
            "overwrite_shifts": False,
        }
        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload1,
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        first_suggestions = response.json()["items"]
        assert len(first_suggestions) == 2

        # Second generation with different range
        payload2 = {
            "range_start": "2025-01-08T00:00:00Z",
            "range_end": "2025-01-10T23:59:59Z",
            "overwrite_shifts": False,
        }
        response = client.post(
            "/worker-shifts/auto-assign",
            json=payload2,
            cookies={"access_token": admin_token},
        )
        assert response.status_code == 200
        second_suggestions = response.json()["items"]
        assert len(second_suggestions) == 3

        # Verify only second batch exists
        all_suggestions = session.exec(select(AssignmentSuggestionModel)).all()
        assert len(all_suggestions) == 3

        # Verify the dates are from second batch
        suggestion_dates = [s.start_date.day for s in all_suggestions]
        assert 8 in suggestion_dates
        assert 9 in suggestion_dates
        assert 10 in suggestion_dates
        assert 6 not in suggestion_dates
        assert 7 not in suggestion_dates

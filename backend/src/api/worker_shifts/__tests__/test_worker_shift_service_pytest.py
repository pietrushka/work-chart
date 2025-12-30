from datetime import datetime, timezone
from uuid import UUID, uuid4
from dataclasses import dataclass
from typing import Optional
import json
import pytest


from ..schemas import Range
from ..worker_shift_service import (
    prepare_auto_assign_shifts,
)


@dataclass
class MockWorkerShift:
    id: UUID
    worker_id: UUID
    company_id: UUID
    start_date: datetime
    end_date: datetime
    template_id: Optional[UUID] = None

    # MockWorkerShift(
    #     id=uuid4(),
    #     worker_id=uuid4(),
    #     company_id=uuid4(),
    #     template_id=uuid4(),
    #     start_date=datetime(2025, 1, 1, 9, 0, 0),
    #     end_date=datetime(2025, 1, 1, 17, 0, 0),
    # )


@dataclass
class MockShiftTemplate:
    id: UUID
    company_id: UUID
    name: str
    position: str
    startTime: str
    endTime: str
    days: Optional[list[int]] = None


@dataclass
class MockUser:
    id: UUID
    company_id: UUID
    name: str


def test_even_shift_distribution():
    """Test basic even distribution of shifts between two users with two templates"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    worker_shifts = []

    shift_templates = [
        MockShiftTemplate(
            id="shift-template-1",
            company_id=uuid4(),
            name="Morning Shift 1",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
        MockShiftTemplate(
            id="shift-template-2",
            company_id=uuid4(),
            name="Morning Shift 2",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
        MockUser(
            id="user-2",
            company_id=company_id,
            name="Jane Smith",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    assert len(shifts) == 2
    assert shifts[0]["worker_id"] == "user-1"
    assert shifts[0]["template_id"] == "shift-template-1"
    assert shifts[0]["start_date"] == datetime(2025, 1, 1, 9, 0, tzinfo=timezone.utc)
    assert shifts[0]["end_date"] == datetime(2025, 1, 1, 17, 0, tzinfo=timezone.utc)

    assert shifts[1]["worker_id"] == "user-2"
    assert shifts[1]["template_id"] == "shift-template-2"
    assert shifts[1]["start_date"] == datetime(2025, 1, 1, 9, 0, tzinfo=timezone.utc)
    assert shifts[1]["end_date"] == datetime(2025, 1, 1, 17, 0, tzinfo=timezone.utc)


def test_only_assigns_shifts_on_matching_weekdays():
    """Test that templates with specific days only create shifts on those days"""
    company_id = uuid4()
    # January 3, 2025 is Friday (5), Jan 4 is Saturday (6), Jan 5 is Sunday (7)
    range_obj = Range(
        range_start="2025-01-03T00:00:00Z", range_end="2025-01-05T23:59:59Z"
    )

    worker_shifts = []

    # Template only for weekdays (Mon-Fri = 1-5)
    shift_templates = [
        MockShiftTemplate(
            id="weekday-template",
            company_id=company_id,
            name="Weekday Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5],  # Monday to Friday only
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    # Should only create shift for Friday (Jan 3), not Sat/Sun
    assert len(shifts) == 1
    assert shifts[0]["start_date"] == datetime(2025, 1, 3, 9, 0, tzinfo=timezone.utc)


def test_includes_existing_worker_shifts():
    """Test that existing shifts prevent duplicate assignments"""
    company_id = uuid4()
    user_id_1 = "user-1"
    user_id_2 = "user-2"
    template_id = "shift-template-1"

    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    # Existing shift for user-1 with shift-template-1
    worker_shifts = [
        MockWorkerShift(
            id=uuid4(),
            worker_id=user_id_2,
            company_id=company_id,
            template_id=template_id,
            start_date=datetime(2025, 1, 1, 9, 0, tzinfo=timezone.utc),
            end_date=datetime(2025, 1, 1, 17, 0, tzinfo=timezone.utc),
        ),
    ]

    shift_templates = [
        MockShiftTemplate(
            id=template_id,
            company_id=company_id,
            name="Morning Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
    ]

    users = [
        MockUser(
            id=user_id_1,
            company_id=company_id,
            name="John Doe",
        ),
        MockUser(
            id=user_id_2,
            company_id=company_id,
            name="Jane Smith",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    assert len(shifts) == 1
    shift_1 = shifts[0]
    assert shift_1["worker_id"] == user_id_2
    assert shift_1["template_id"] == template_id
    assert shift_1["start_date"] == datetime(2025, 1, 1, 9, 0, tzinfo=timezone.utc)
    assert shift_1["end_date"] == datetime(2025, 1, 1, 17, 0, tzinfo=timezone.utc)


def test_multi_day_range():
    """Test shift creation across multiple days"""
    company_id = uuid4()
    # Jan 1-3, 2025 (Wed-Fri)
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-03T23:59:59Z"
    )

    worker_shifts = []

    shift_templates = [
        MockShiftTemplate(
            id="daily-template",
            company_id=company_id,
            name="Daily Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],  # Every day
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    # Should create shifts for all 3 days
    assert len(shifts) == 3
    assert shifts[0]["start_date"] == datetime(2025, 1, 1, 9, 0, tzinfo=timezone.utc)
    assert shifts[1]["start_date"] == datetime(2025, 1, 2, 9, 0, tzinfo=timezone.utc)
    assert shifts[2]["start_date"] == datetime(2025, 1, 3, 9, 0, tzinfo=timezone.utc)


def test_not_enough_users():
    """Test with not enough users available raises ValueError"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    worker_shifts = []

    shift_templates = [
        MockShiftTemplate(
            id="template-1",
            company_id=company_id,
            name="Morning Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
        MockShiftTemplate(
            id="template-2",
            company_id=company_id,
            name="Morning Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    # Should raise ValueError when not enough users provided
    with pytest.raises(
        ValueError, match="Cannot auto-assign shifts: not enough users provided"
    ):
        prepare_auto_assign_shifts(
            range=range_obj,
            worker_shifts=worker_shifts,
            shift_templates=shift_templates,
            users=users,
        )


def test_empty_templates():
    """Test with no shift templates"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    worker_shifts = []
    shift_templates = []  # No templates

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    assert len(shifts) == 0


def test_no_matching_weekdays():
    """Test when template days don't match range dates"""
    company_id = uuid4()
    # Jan 7-8, 2025 (Tue-Wed, days 2-3)
    range_obj = Range(
        range_start="2025-01-07T00:00:00Z", range_end="2025-01-08T23:59:59Z"
    )

    worker_shifts = []

    # Template only for Monday (1)
    shift_templates = [
        MockShiftTemplate(
            id="monday-only",
            company_id=company_id,
            name="Monday Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[1],  # Monday only
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    # Should return empty list - no matching days
    assert len(shifts) == 0


def test_even_distribution_multiple_templates():
    """Test that shifts are distributed evenly across users"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-06T00:00:00Z", range_end="2025-01-10T23:59:59Z"
    )

    worker_shifts = []

    # 3 templates
    shift_templates = [
        MockShiftTemplate(
            id="template-1",
            company_id=company_id,
            name="Shift 1",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[
                1,
                2,
            ],
        ),
        MockShiftTemplate(
            id="template-2",
            company_id=company_id,
            name="Shift 2",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[2, 3],
        ),
        MockShiftTemplate(
            id="template-3",
            company_id=company_id,
            name="Shift 3",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=[
                4,
                5,
            ],
        ),
    ]

    # 2 users
    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
        MockUser(
            id="user-2",
            company_id=company_id,
            name="Jane Smith",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    user_1_shifts = [s for s in shifts if s["worker_id"] == "user-1"]
    user_2_shifts = [s for s in shifts if s["worker_id"] == "user-2"]

    assert len(user_1_shifts) == 3
    assert len(user_2_shifts) == 3


def test_shift_times_are_correct():
    """Test that startTime and endTime are properly parsed"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    worker_shifts = []

    shift_templates = [
        MockShiftTemplate(
            id="afternoon-shift",
            company_id=company_id,
            name="Afternoon Shift",
            position="Cashier",
            startTime="13:30",
            endTime="21:45",
            days=[1, 2, 3, 4, 5, 6, 7],
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    assert len(shifts) == 1
    # Verify time parsing: 13:30 and 21:45
    assert shifts[0]["start_date"] == datetime(2025, 1, 1, 13, 30, tzinfo=timezone.utc)
    assert shifts[0]["end_date"] == datetime(2025, 1, 1, 21, 45, tzinfo=timezone.utc)


def test_templates_without_days_are_skipped():
    """Test that templates with days=None are filtered out"""
    company_id = uuid4()
    range_obj = Range(
        range_start="2025-01-01T00:00:00Z", range_end="2025-01-01T23:59:59Z"
    )

    worker_shifts = []

    shift_templates = [
        MockShiftTemplate(
            id="no-days-template",
            company_id=company_id,
            name="Invalid Shift",
            position="Cashier",
            startTime="09:00",
            endTime="17:00",
            days=None,  # No days specified
        ),
    ]

    users = [
        MockUser(
            id="user-1",
            company_id=company_id,
            name="John Doe",
        ),
    ]

    shifts = prepare_auto_assign_shifts(
        range=range_obj,
        worker_shifts=worker_shifts,
        shift_templates=shift_templates,
        users=users,
    )

    # Should return empty - template has no days
    assert len(shifts) == 0

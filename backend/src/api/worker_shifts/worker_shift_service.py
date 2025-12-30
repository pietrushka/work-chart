from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from .schemas import AddWorkerShiftPayloadSchema, Range
from db.models import ShiftTemplateModel, UserModel, WorkerShiftModel


def create_shift_template(
    data: AddWorkerShiftPayloadSchema, company_id: UUID, session: Session
):
    worker_shift_data = data.model_dump()
    worker_shift_data["company_id"] = company_id
    new_worker_shift = WorkerShiftModel.model_validate(worker_shift_data)
    session.add(new_worker_shift)
    session.commit()
    session.refresh(new_worker_shift)
    return new_worker_shift


def get_worker_shifts_by_company_id(company_id: UUID, range: Range, session: Session):
    data = range.model_dump()
    query = (
        select(WorkerShiftModel)
        .where(WorkerShiftModel.company_id == company_id)
        .where(WorkerShiftModel.start_date >= data["range_start"])
        .where(WorkerShiftModel.end_date <= data["range_end"])
    )
    results = session.exec(query).all()
    return results


def get_worker_shifts_in_time_range(start_date, end_date, session: Session):
    query = select(WorkerShiftModel).where(
        WorkerShiftModel.start_date >= start_date,
        WorkerShiftModel.end_date <= end_date,
    )
    results = session.exec(query).all()
    return results


def get_user_shifts(user_id: UUID, payload: Range, session: Session):
    data = payload.model_dump()
    query = (
        select(WorkerShiftModel)
        .options(selectinload(WorkerShiftModel.template))
        .where(WorkerShiftModel.worker_id == user_id)
        .where(WorkerShiftModel.start_date >= data["range_start"])
        .where(WorkerShiftModel.end_date <= data["range_end"])
    )
    results = session.exec(query).all()
    return results


def get_worker_for_shift(
    shift_placeholders: list,
    shift_template: ShiftTemplateModel,
    day_worker_shifts: list[WorkerShiftModel],
    users: list[UserModel],
    user_shift_counts: dict[UUID, int],
    shift_start_date: datetime,
    shift_end_date: datetime,
):
    existing_shift = next(
        (ws for ws in day_worker_shifts if ws.template_id == shift_template.id),
        None,
    )

    if existing_shift:
        return existing_shift.worker_id

    # Sort users by shift count (ascending) to assign to user with fewest shifts
    sorted_users = sorted(users, key=lambda u: user_shift_counts[u.id])
    for user in sorted_users:

        has_worker_shift = any(
            ws
            for ws in day_worker_shifts
            if ws.worker_id == user.id
            # TODO prepare test then uncomment
            # and (
            #     ws["start_date"].date() >= shift_start_date
            #     and ws["end_date"].date() <= shift_end_date
            # )
        )

        if has_worker_shift:
            continue

        has_placeholder_shift = any(
            sp
            for sp in shift_placeholders
            if sp["worker_id"] == user.id
            and (
                sp["start_date"] >= shift_start_date
                and sp["end_date"] <= shift_end_date
            )
        )
        if has_placeholder_shift:
            continue

        return user.id


def prepare_auto_assign_shifts(
    range: Range,
    worker_shifts: list[WorkerShiftModel],
    shift_templates: list[ShiftTemplateModel],
    users: list[UserModel],
):
    if not users:
        raise ValueError("Cannot auto-assign shifts: no users provided")

    range_dict = range.model_dump()
    start_date = datetime.fromisoformat(
        range_dict["range_start"].replace("Z", "+00:00")
    )
    end_date = datetime.fromisoformat(range_dict["range_end"].replace("Z", "+00:00"))
    shift_placeholders = []
    current_date = start_date
    user_shift_counts = {user.id: 0 for user in users}

    while current_date <= end_date:
        weekday = current_date.isoweekday()
        day_shift_templates = [
            st for st in shift_templates if st.days and weekday in st.days
        ]

        day_worker_shifts = [
            ws for ws in worker_shifts if ws.start_date.date() == current_date.date()
        ]

        for st in day_shift_templates:
            shift_start_date = current_date.replace(
                hour=int(st.startTime.split(":")[0]),
                minute=int(st.startTime.split(":")[1]),
                second=0,
                microsecond=0,
            )
            shift_end_date = current_date.replace(
                hour=int(st.endTime.split(":")[0]),
                minute=int(st.endTime.split(":")[1]),
                second=0,
                microsecond=0,
            )

            worker_id = get_worker_for_shift(
                shift_placeholders=shift_placeholders,
                shift_template=st,
                day_worker_shifts=day_worker_shifts,
                users=users,
                user_shift_counts=user_shift_counts,
                shift_start_date=shift_start_date,
                shift_end_date=shift_end_date,
            )
            print(f"  Shift Template ID: {st.id}, Assigned Worker ID: {worker_id}")
            if not worker_id:
                # If no user could be assigned (all users already have this shift)
                raise ValueError("Cannot auto-assign shifts: not enough users provided")

            shift_placeholders.append(
                {
                    "worker_id": worker_id,
                    "template_id": st.id,
                    "start_date": shift_start_date,
                    "end_date": shift_end_date,
                }
            )
            user_shift_counts[worker_id] += 1

        current_date += timedelta(days=1)

    return shift_placeholders

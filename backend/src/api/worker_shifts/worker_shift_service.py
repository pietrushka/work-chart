from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from api.worker_shifts.schemas import AddWorkerShiftPayloadSchema, Range
from db.models import ShiftTemplateModel, WorkerShiftModel


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


def auto_assign(
    range: Range,
    worker_shifts: WorkerShiftModel,
    shift_template: ShiftTemplateModel,
    session: Session,
):
    range_dict = range.model_dump()
    start_date = datetime.fromisoformat(
        range_dict["range_start"].replace("Z", "+00:00")
    )
    end_date = datetime.fromisoformat(range_dict["range_end"].replace("Z", "+00:00"))
    print("start_date", start_date)
    shift_placeholders = []
    current_date = start_date
    while current_date <= end_date:
        print(current_date.strftime("%d.%m.%Y"))
        current_date += timedelta(days=1)

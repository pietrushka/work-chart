from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from api.worker_shifts.schemas import AddWorkerShiftPayloadSchema, Range
from db.models import WorkerShiftModel


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

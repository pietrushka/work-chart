from uuid import UUID
from sqlmodel import Session, select
from db.models import LeaveModel
from api.leave.schemas import CreateLeaveSchema, EditLeaveSchema
from datetime import datetime


def create_leave(
    data: CreateLeaveSchema, user_id: UUID, company_id: UUID, session: Session
):
    leave_data = data.model_dump()
    leave_data["user_id"] = user_id
    leave_data["company_id"] = company_id
    leave_data["start_date"] = datetime.fromisoformat(data.start_date)
    leave_data["end_date"] = datetime.fromisoformat(data.end_date)

    new_leave = LeaveModel.model_validate(leave_data)
    session.add(new_leave)
    session.commit()
    session.refresh(new_leave)
    return new_leave


def get_leaves_by_user_id(user_id: UUID, session: Session):
    query = select(LeaveModel).where(LeaveModel.user_id == user_id)
    results = session.exec(query).all()
    return results


def update_leave(leave_id: UUID, data: EditLeaveSchema, session: Session):
    leave = session.get(LeaveModel, leave_id)
    if not leave:
        return None

    update_data = data.model_dump(exclude_unset=True)
    if "start_date" in update_data and update_data["start_date"]:
        update_data["start_date"] = datetime.fromisoformat(update_data["start_date"])
    if "end_date" in update_data and update_data["end_date"]:
        update_data["end_date"] = datetime.fromisoformat(update_data["end_date"])

    for key, value in update_data.items():
        setattr(leave, key, value)

    session.add(leave)
    session.commit()
    session.refresh(leave)
    return leave


def delete_leave(leave_id: UUID, session: Session):
    leave = session.get(LeaveModel, leave_id)
    if not leave:
        return None

    session.delete(leave)
    session.commit()
    return leave

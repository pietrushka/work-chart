from uuid import UUID
from sqlmodel import Session, select
from db.models import LeaveModel
from api.leave.schemas import CreateLeaveSchema, EditLeaveSchema
from datetime import datetime


def validate_can_create_leave(
    data: CreateLeaveSchema, user_id: UUID,  session: Session
):
    query = select(LeaveModel).where(
        LeaveModel.user_id == user_id,
        LeaveModel.start_date <= data.end_date,
        LeaveModel.end_date >= data.start_date
    )
    overlapping_leaves = session.exec(query).first()
    has_overlapin_leave = len(overlapping_leaves) == 0
    if (has_overlapin_leave):
        return False
    
    return True

def create_leave(
    data: CreateLeaveSchema, user_id: UUID, company_id: UUID, session: Session
):
    leave_data = data.model_dump()
    leave_data["user_id"] = user_id
    leave_data["company_id"] = company_id
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
    print("update_data", update_data)

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

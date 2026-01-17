from fastapi import APIRouter, Depends, HTTPException

from api.users.user_service import (
    find_workers_by_company_id,
)

from api.shift_template.shift_template_service import (
    find_shift_template_by_id,
)
from api.worker_shifts.schemas import (
    AddWorkerShiftPayloadSchema,
    AssignmentSuggestionResponse,
    AutoAssignPayloadSchema,
    Range,
    MyShiftsResponse,
)
from api.worker_shifts.worker_shift_service import (
    accept_assignment_suggestions,
    delete_all_company_suggestions,
    delete_worker_shifts_in_range,
    get_assignment_suggestions_by_company,
    prepare_auto_assign_shifts,
    create_shift_template,
    get_user_shifts,
    get_worker_shifts_by_company_id,
    get_worker_shifts_in_time_range,
    save_assignment_suggestions,
)

from api.shift_template.shift_template_service import (
    find_shift_templates_by_company_id,
)

from db.models import UserRole
from db.session import get_session
from api.dependencies import authenticate_user
from api.common import authenticate_company_admin


router = APIRouter(tags=["worker-shifts"])


@router.post("/create-worker-shift")
def create_worker_shift(
    payload: AddWorkerShiftPayloadSchema,
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    data = payload.model_dump()
    template = find_shift_template_by_id(data["template_id"], session)
    if not template:
        raise HTTPException(status_code=401, detail="Template not found")
    authenticate_company_admin(template.company_id, current_user)

    concurrent_shifts = get_worker_shifts_in_time_range(
        data["start_date"], data["end_date"], session
    )
    if concurrent_shifts:
        raise HTTPException(
            status_code=400, detail="There are already shifts in this time range"
        )

    new_worker_shift = create_shift_template(payload, template.company_id, session)

    if not new_worker_shift:
        raise HTTPException(status_code=500, detail="Worker shift not created")

    return {"status": "success"}


@router.get("/company")
def get_worker_shifts(
    range_start: str,
    range_end: str,
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    payload = Range(range_start=range_start, range_end=range_end)
    worker_shifts = get_worker_shifts_by_company_id(
        current_user.company_id, payload, session
    )

    return {"items": worker_shifts}


@router.get("/my-shifts")
def get_my_shifts(
    range_start: str,
    range_end: str,
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    payload = Range(range_start=range_start, range_end=range_end)
    shifts = get_user_shifts(current_user.id, payload, session)

    response_items = [
        MyShiftsResponse(
            id=str(shift.id),
            worker_id=str(shift.worker_id),
            company_id=str(shift.company_id),
            start_date=shift.start_date,
            end_date=shift.end_date,
            template=shift.template,
        )
        for shift in shifts
    ]

    return {"items": response_items}


@router.post("/auto-assign")
def auto_assign_controller(
    payload: AutoAssignPayloadSchema,
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    data = payload.model_dump()

    if data["overwrite_shifts"]:
        worker_shifts = []
    else:
        worker_shifts = get_worker_shifts_in_time_range(
            data["range_start"], data["range_end"], session
        )

    shift_templates = find_shift_templates_by_company_id(
        current_user.company_id, session
    )

    range = Range(range_start=data["range_start"], range_end=data["range_end"])

    users = find_workers_by_company_id(current_user.company_id, session)

    shift_placeholders = prepare_auto_assign_shifts(
        range, worker_shifts, shift_templates, users
    )

    delete_all_company_suggestions(current_user.company_id, session)
    suggestions = save_assignment_suggestions(
        shift_placeholders, current_user.company_id, session
    )

    response_items = [
        AssignmentSuggestionResponse(
            id=str(s.id),
            worker_id=str(s.worker_id),
            company_id=str(s.company_id),
            template_id=str(s.template_id),
            start_date=s.start_date,
            end_date=s.end_date,
            created_at=s.created_at,
        )
        for s in suggestions
    ]

    return {"items": response_items}


@router.get("/suggestions")
def get_suggestions(
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    suggestions = get_assignment_suggestions_by_company(
        current_user.company_id, session
    )

    response_items = [
        AssignmentSuggestionResponse(
            id=str(s.id),
            worker_id=str(s.worker_id),
            company_id=str(s.company_id),
            template_id=str(s.template_id),
            start_date=s.start_date,
            end_date=s.end_date,
            created_at=s.created_at,
        )
        for s in suggestions
    ]

    return {"items": response_items}


@router.post("/suggestions/accept")
def accept_suggestions(
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    worker_shifts = accept_assignment_suggestions(current_user.company_id, session)

    return {"status": "success", "count": len(worker_shifts)}


@router.delete("/suggestions")
def decline_suggestions(
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    count = delete_all_company_suggestions(current_user.company_id, session)

    return {"status": "success", "count": count}


@router.delete("/clear")
def clear_worker_shifts(
    range_start: str,
    range_end: str,
    session=Depends(get_session),
    current_user=Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    payload = Range(range_start=range_start, range_end=range_end)
    count = delete_worker_shifts_in_range(current_user.company_id, payload, session)

    return {"status": "success", "count": count}

from uuid import UUID
from sqlmodel import Session, select
from api.shift_template.schemas import (
    CreateShiftTemplateSchema,
    EditShiftTemplateSchema,
)
from db.models import ShiftTemplateModel


def create_shift_template(
    data: CreateShiftTemplateSchema, company_id: UUID, session: Session
):
    shift_template_data = data.model_dump()
    shift_template_data["company_id"] = company_id
    new_shift_template = ShiftTemplateModel.model_validate(shift_template_data)
    session.add(new_shift_template)
    session.commit()
    session.refresh(new_shift_template)
    return new_shift_template


def find_shift_templates_by_company_id(company_id: str, session: Session):
    query = select(ShiftTemplateModel).where(
        ShiftTemplateModel.company_id == company_id
    )
    results = session.exec(query).all()
    return results


def find_shift_template_by_id(shift_template_id: str, session: Session):
    shift_template = session.get(ShiftTemplateModel, shift_template_id)
    return shift_template


def edit_shift_template(
    shift_template: ShiftTemplateModel,
    payload: EditShiftTemplateSchema,
    session: Session,
):
    update_data = payload.model_dump(exclude_unset=True)

    # shift_template.model_validate(update_data, update=True) TODO check why this is not working
    for field, value in update_data.items():
        setattr(shift_template, field, value)

    session.commit()


def delete_shift_template(shift_template: ShiftTemplateModel, session: Session):
    session.delete(shift_template)
    session.commit()

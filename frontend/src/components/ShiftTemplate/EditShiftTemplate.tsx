import { ShiftTemplateFormValues } from "../../types/shiftTemplate"
import { useUpdateShiftTemplateMutation } from "../../redux/api/shiftTemplateApi"
import ShiftTemplateForm from "./ShiftTemplateForm"
import { Dialog, DialogTitle, Paper } from "@mui/material"

type EditShiftTemplateProps = {
  initialValues: ShiftTemplateFormValues
  id: string
  onClose: () => void
}

export default function EditShiftTemplate({
  initialValues,
  id,
  onClose,
}: EditShiftTemplateProps) {
  const [updateShiftTemplate] = useUpdateShiftTemplateMutation()

  async function onSubmit(values: ShiftTemplateFormValues) {
    await updateShiftTemplate({ id, ...values }).unwrap()
    onClose()
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit Shift Template</DialogTitle>
      <Paper sx={{ p: 2 }}>
        <ShiftTemplateForm initialValues={initialValues} onSubmit={onSubmit} />
      </Paper>
    </Dialog>
  )
}

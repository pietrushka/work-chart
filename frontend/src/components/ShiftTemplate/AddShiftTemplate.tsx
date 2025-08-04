import { ShiftTemplateFormValues } from "../../types/shiftTemplate"
import { useAddShiftTemplateMutation } from "../../redux/api/shiftTemplateApi"
import ShiftTemplateForm from "./ShiftTemplateForm"
import { Paper, Typography } from "@mui/material"
import { positions } from "../../constants"

const initialValues = {
  name: "",
  position: positions[0],
  startTime: "08:00",
  endTime: "16:00",
  days: [0, 1, 2, 3, 4],
}

export default function AddShift() {
  const [addShiftTemplate] = useAddShiftTemplateMutation()

  async function onSubmit(form: ShiftTemplateFormValues) {
    await addShiftTemplate(form).unwrap()
  }

  return (
    <Paper sx={{ p: 2, width: "100%", maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Add Shift Template
      </Typography>
      <ShiftTemplateForm initialValues={initialValues} onSubmit={onSubmit} />
    </Paper>
  )
}

import { Dialog, DialogTitle, Paper } from "@mui/material"
import { EmployeeFormValues } from "../../../types/employee"
import { useUpdateEmployeeMutation } from "../../../redux/api/employeeApi"
import EmployeeForm from "./EmployeeForm"

type EditEmployeeProps = {
  initialValues: EmployeeFormValues
  id: string
  onClose: () => void
}

export default function EditEmployee({
  initialValues,
  id,
  onClose,
}: EditEmployeeProps) {
  const [updateEmployee] = useUpdateEmployeeMutation()

  async function onSubmit(values: EmployeeFormValues) {
    await updateEmployee({ id, ...values }).unwrap()
    onClose()
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Edit Employee</DialogTitle>
      <Paper sx={{ p: 2 }}>
        <EmployeeForm initialValues={initialValues} onSubmit={onSubmit} />
      </Paper>
    </Dialog>
  )
}

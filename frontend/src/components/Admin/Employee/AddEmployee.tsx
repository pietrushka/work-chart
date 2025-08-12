import { Paper, Typography } from "@mui/material"
import EmployeeForm from "./EmployeeForm"
import { positions } from "../../../constants"
import { EmployeeFormValues } from "../../../types/employee"
import { useAddEmployeeMutation } from "../../../redux/api/employeeApi"

const initialValues = {
  first_name: "",
  last_name: "",
  position: positions[0],
  email: "",
}

export default function AddEmployee() {
  const [addEmployee] = useAddEmployeeMutation()

  async function onSubmit(form: EmployeeFormValues) {
    await addEmployee(form).unwrap()
  }

  return (
    <Paper sx={{ p: 2, width: "100%", maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Add Employee
      </Typography>
      <EmployeeForm initialValues={initialValues} onSubmit={onSubmit} />
    </Paper>
  )
}

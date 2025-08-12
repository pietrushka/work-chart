import { Box, Typography, Container } from "@mui/material"
import AddEmployee from "../components/Admin/Employee/AddEmployee"
import EmployeeList from "../components/Admin/Employee/EmployeeList"

export default function EmployeesPage() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employees
      </Typography>
      <Box display="flex">
        <AddEmployee />
        <Box sx={{ height: 32 }} />
        <EmployeeList />
      </Box>
    </Container>
  )
}

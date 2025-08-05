import { Box, Typography, Container } from "@mui/material"
import AddEmployee from "../components/Employee/AddEmployee"
import EmployeeList from "../components/Employee/EmployeeList"

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

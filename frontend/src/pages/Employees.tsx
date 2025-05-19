import { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from "@mui/material"
import {
  useAddEmployeeMutation,
  useGetEmployeesQuery,
} from "../redux/api/employeesApi"

interface EmployeeFormData {
  firstName: string
  lastName: string
  position: string
  email: string
}

export default function EmployeesPage() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Employees
        </Typography>
        <AddEmployee />
        <EmployeesList />
      </Box>
    </Container>
  )
}

function EmployeesList() {
  const { data } = useGetEmployeesQuery()
  const employees = data?.employees || []
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <List>
        {employees.map((employee) => (
          <ListItem key={employee.id} divider>
            <ListItemText
              primary={`${employee.firstName} ${employee.lastName}`}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {employee.position}
                  </Typography>
                  <br />
                  {employee.email}
                </>
              }
            />
          </ListItem>
        ))}
        {employees.length === 0 && (
          <ListItem>
            <ListItemText primary="No employees added yet" />
          </ListItem>
        )}
      </List>
    </Paper>
  )
}

function AddEmployee() {
  const [addEmployee] = useAddEmployeeMutation()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    position: "",
    email: "",
  })

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setFormData({ firstName: "", lastName: "", position: "", email: "" })
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    addEmployee(formData)
    handleClose()
  }
  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={handleOpen}
      >
        +
      </Fab>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Employee</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              fullWidth
              required
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              fullWidth
              required
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="position"
              label="Position"
              fullWidth
              required
              value={formData.position}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

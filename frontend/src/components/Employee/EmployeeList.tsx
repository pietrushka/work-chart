import React, { useState } from "react"
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Button,
} from "@mui/material"
import {
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
} from "../../redux/api/employeeApi"
import EditEmployee from "./EditEmployee"

export default function EmployeeList() {
  const { data } = useGetEmployeesQuery()
  const [deleteEmployee] = useDeleteEmployeeMutation()
  const [editActiveId, setEditActiveId] = useState<string>()

  const employees = data?.items || []
  return (
    <Paper sx={{ p: 2, width: "100%", maxWidth: 600 }}>
      {editActiveId && (
        <EditEmployee
          id={editActiveId}
          initialValues={employees.find((x) => x.id === editActiveId)!}
          onClose={() => setEditActiveId(undefined)}
        />
      )}
      {!employees.length ? (
        <Typography color="text.secondary">No employees.</Typography>
      ) : (
        <List>
          {employees.map((employee, idx) => (
            <React.Fragment key={employee.id}>
              <ListItem alignItems="flex-start">
                <Box
                  display="flex"
                  alignItems="center"
                  width="100%"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {employee.first_name} {employee.last_name}{" "}
                      <span style={{ color: "#888", fontWeight: 400 }}>
                        {employee.position && `(${employee.position})`}
                      </span>
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => setEditActiveId(employee.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => deleteEmployee(employee.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </ListItem>
              {idx < employees.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  )
}

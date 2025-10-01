import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from "@mui/material"
import { Delete, Edit } from "@mui/icons-material"
import {
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  useEditLeaveMutation,
  useDeleteLeaveMutation,
} from "../redux/api/leaveApi"

export default function MyLeaves() {
  const { data, isLoading } = useGetMyLeavesQuery()
  const [createLeave] = useCreateLeaveMutation()
  const [editLeave] = useEditLeaveMutation()
  const [deleteLeave] = useDeleteLeaveMutation()

  const [openDialog, setOpenDialog] = useState(false)
  const [editingLeave, setEditingLeave] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [error, setError] = useState("")

  const leaves = data?.items || []

  const handleOpenDialog = (
    leaveId?: string,
    currentStart?: string,
    currentEnd?: string,
  ) => {
    if (leaveId) {
      setEditingLeave(leaveId)
      setStartDate(currentStart?.split("T")[0] || "")
      setEndDate(currentEnd?.split("T")[0] || "")
    } else {
      setEditingLeave(null)
      setStartDate("")
      setEndDate("")
    }
    setError("")
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingLeave(null)
    setStartDate("")
    setEndDate("")
    setError("")
  }

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError("Both start and end dates are required")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date")
      return
    }

    try {
      if (editingLeave) {
        await editLeave({
          id: editingLeave,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
        }).unwrap()
      } else {
        await createLeave({
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
        }).unwrap()
      }
      handleCloseDialog()
    } catch (error) {
      console.error(error)
      setError("Failed to save leave request")
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await deleteLeave(id).unwrap()
      } catch (_) {
        console.error(_)
        alert("Failed to delete leave request")
      }
    }
  }

  if (isLoading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">My Leaves</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Request Leave
        </Button>
      </Box>

      {leaves.length === 0 ? (
        <Typography>No leave requests found</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {leaves.map((leave) => (
            <Card key={leave.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {new Date(leave.start_date).toLocaleDateString()} -{" "}
                      {new Date(leave.end_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration:{" "}
                      {Math.ceil(
                        (new Date(leave.end_date).getTime() -
                          new Date(leave.start_date).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() =>
                        handleOpenDialog(
                          leave.id,
                          leave.start_date,
                          leave.end_date,
                        )
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(leave.id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingLeave ? "Edit Leave Request" : "Request Leave"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLeave ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

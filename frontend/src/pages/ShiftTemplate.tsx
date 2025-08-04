import { Box, Container, Typography } from "@mui/material"
import AddShift from "../components/ShiftTemplate/AddShiftTemplate"
import ShiftList from "../components/ShiftTemplate/ShiftTemplateList"

export default function ShiftTemplate() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shift Templates
      </Typography>
      <Box display="flex">
        <AddShift />
        <Box sx={{ height: 32 }} />
        <ShiftList />
      </Box>
    </Container>
  )
}

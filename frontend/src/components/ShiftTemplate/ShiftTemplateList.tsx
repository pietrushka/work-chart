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
  useGetShiftTemplatesQuery,
  useDeleteShiftTemplateMutation,
} from "../../redux/api/shiftTemplateApi"
import EditShiftTemplate from "./EditShiftTemplate"

export default function ShiftList() {
  const { data } = useGetShiftTemplatesQuery()
  const [deleteShiftTemplate] = useDeleteShiftTemplateMutation()
  const [editActiveId, setEditActiveId] = useState<string>()

  const shifts = data?.items || []
  return (
    <Paper sx={{ p: 2, width: "100%", maxWidth: 600 }}>
      {editActiveId && (
        <EditShiftTemplate
          id={editActiveId}
          initialValues={shifts.find((x) => x.id === editActiveId)!}
          onClose={() => setEditActiveId(undefined)}
        />
      )}
      {!shifts.length ? (
        <Typography color="text.secondary">
          No shift templates available.
        </Typography>
      ) : (
        <List>
          {shifts.map((shift, idx) => (
            <React.Fragment key={shift.id}>
              <ListItem alignItems="flex-start">
                <Box
                  display="flex"
                  alignItems="center"
                  width="100%"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {shift.name}{" "}
                      <span style={{ color: "#888", fontWeight: 400 }}>
                        ({shift.position})
                      </span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {shift.startTime} - {shift.endTime} |{" "}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => setEditActiveId(shift.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => deleteShiftTemplate(shift.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </ListItem>
              {idx < shifts.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  )
}

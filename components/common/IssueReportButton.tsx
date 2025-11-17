"use client";
import * as React from "react";
import { Fab, Tooltip } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import IssueReportModal from "./IssueReportModal";

export default function IssueReportButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Tooltip title="Report Issue or Request Feature" placement="left">
        <Fab
          color="secondary"
          size="small"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>
      <IssueReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
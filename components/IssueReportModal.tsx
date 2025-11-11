"use client";
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

interface IssueReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IssueReportModal({ open, onClose }: IssueReportModalProps) {
  const [type, setType] = React.useState<'issue' | 'feature'>('issue');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/issues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, description: description.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setDescription('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setDescription('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report Issue or Request Feature</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Type</FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(e) => setType(e.target.value as 'issue' | 'feature')}
            >
              <FormControlLabel value="issue" control={<Radio />} label="Bug Report" />
              <FormControlLabel value="feature" control={<Radio />} label="Feature Request" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            placeholder={`Describe the ${type === 'issue' ? 'issue' : 'feature request'} in detail...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Thank you! Your {type === 'issue' ? 'bug report' : 'feature request'} has been submitted successfully.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!description.trim() || submitting || success}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
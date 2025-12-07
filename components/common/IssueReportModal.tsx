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
  DialogContentText,
  Link,
} from "@mui/material";

interface IssueReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IssueReportModal({ open, onClose }: IssueReportModalProps) {
  const [type, setType] = React.useState<'issue' | 'feature'>('issue');
  const [shortDescription, setShortDescription] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [discordUsername, setDiscordUsername] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async () => {
    if (!shortDescription.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/issues/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type, 
          shortDescription: shortDescription.trim(),
          description: description.trim(),
          discordUsername: discordUsername.trim() || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setShortDescription('');
        setDescription('');
        setDiscordUsername('');
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
      setShortDescription('');
      setDescription('');
      setDiscordUsername('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report Issue or Request Feature for Villager Hunt</DialogTitle>
      <DialogContent>
        <DialogContentText>Before submitting a report, check the <Link href={`https://trello.com/b/XUeuFFbu/acnh-villager-hunt`}>Trello board</Link> to see if it exists.</DialogContentText>
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
            label="Short Description"
            placeholder={`${type === 'issue' ? 'Bug Report' : 'Feature Request'}: Brief summary (max 50 chars)`}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value.slice(0, 50))}
            disabled={submitting}
            helperText={`${shortDescription.length}/50 characters`}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Detailed Description"
            placeholder={`Provide more details about the ${type === 'issue' ? 'issue' : 'feature request'}...`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText={'Provide more details on what you are reporting'}
            disabled={submitting}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Discord Username"
            placeholder="Optional. In case I need more details on your feature or bug report."
            value={discordUsername}
            onChange={(e) => setDiscordUsername(e.target.value)}
            disabled={submitting}
            helperText={'Optional. Only will be used if I need more details on your feature/bug report.'}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Thank you! Your {type === 'issue' ? 'bug report' : 'feature request'} has been added to our Trello board.
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
          disabled={!shortDescription.trim() || !description.trim() || submitting || success}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
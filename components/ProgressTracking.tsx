import React, { useState } from "react";
import { 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Avatar, 
  Divider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { 
  WorkOutline, 
  FileUpload, 
  Download, 
  Save, 
  Clear,
  EmojiEvents,
  SortByAlpha,
  Sort
} from "@mui/icons-material";

interface CompletedCareer {
  career_id: string;
  career_name: string;
  generation: number;
}

interface ProgressTrackingProps {
  completedCareers: CompletedCareer[];       // The list of finished careers
  onClear: () => void;                       // Callback to clear the completed list
  onSave: () => void;                        // Placeholder callback for "Save"
  onExport: () => void;                      // Placeholder callback for "Export"
  onFileSelected: (file: File) => void;      // Callback when a file is chosen
}

function ProgressTracking({
  completedCareers,
  onClear,
  onSave,
  onExport,
  onFileSelected,
}: ProgressTrackingProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = oldest first, desc = newest first
  const [showSaveModal, setShowSaveModal] = useState(false);
  const careersPerPage = 5; // Show 5 careers per page
  
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  const totalGenerations = completedCareers.length;
  const currentGeneration = totalGenerations + 1;
  
  // Sort careers based on current sort order
  const sortedCareers = [...completedCareers].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.generation - b.generation; // Oldest first (1, 2, 3...)
    } else {
      return b.generation - a.generation; // Newest first (3, 2, 1...)
    }
  });
  
  // Pagination calculations (using sorted careers)
  const totalPages = Math.ceil(sortedCareers.length / careersPerPage);
  const startIndex = (currentPage - 1) * careersPerPage;
  const endIndex = startIndex + careersPerPage;
  const currentCareers = sortedCareers.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSortOrderChange = (event: React.MouseEvent<HTMLElement>, newSortOrder: 'asc' | 'desc' | null) => {
    if (newSortOrder !== null) {
      setSortOrder(newSortOrder);
      setCurrentPage(1); // Reset to first page when sorting changes
    }
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    onSave();
    setShowSaveModal(false);
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents color="primary" />
          Legacy Progress
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Generations Completed: {totalGenerations} | Current Generation: {currentGeneration}
          </Typography>
        </Box>
      </Box>

      {/* Completed Careers List */}
      {completedCareers.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6">
              Completed Careers
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Sort Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Sort:
                </Typography>
                <ToggleButtonGroup
                  value={sortOrder}
                  exclusive
                  onChange={handleSortOrderChange}
                  size="small"
                  aria-label="sort order"
                >
                  <ToggleButton value="asc" aria-label="oldest first">
                    <SortByAlpha sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Oldest First
                  </ToggleButton>
                  <ToggleButton value="desc" aria-label="newest first">
                    <Sort sx={{ mr: 0.5, fontSize: '1rem' }} />
                    Newest First
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              {/* Results Counter */}
              <Typography variant="body2" color="text.secondary">
                {completedCareers.length > careersPerPage && (
                  `Showing ${startIndex + 1}-${Math.min(endIndex, completedCareers.length)} of ${completedCareers.length}`
                )}
              </Typography>
            </Box>
          </Box>
          
          <Stack spacing={2}>
            {currentCareers.map((career) => (
              <Card 
                key={career.career_id}
                elevation={2}
                sx={{ 
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 48, 
                        height: 48,
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {career.generation}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {career.career_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generation {career.generation}
                      </Typography>
                    </Box>
                    <Chip 
                      icon={<WorkOutline />}
                      label="Completed" 
                      color="success" 
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          {completedCareers.length > careersPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, mb: 3 }}>
          <WorkOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No careers completed yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Start your legacy by selecting careers and using the randomizer!
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Action Buttons */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Manage Progress
        </Typography>
        
        {/* File Upload */}
        <Box sx={{ mb: 2 }}>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<FileUpload />}
              sx={{ mr: 1, mb: 1 }}
            >
              Import Progress
            </Button>
          </label>
        </Box>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Save />}
            onClick={handleSaveClick}
            sx={{ flexGrow: 1 }}
          >
            Save Progress
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={onExport}
            sx={{ flexGrow: 1 }}
          >
            Export Data
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Clear />}
            onClick={onClear}
            sx={{ flexGrow: 1 }}
          >
            Clear All
          </Button>
        </Stack>
      </Box>

      {/* Save Confirmation Modal */}
      <Dialog
        open={showSaveModal}
        onClose={handleSaveCancel}
        aria-labelledby="save-dialog-title"
        aria-describedby="save-dialog-description"
      >
        <DialogTitle id="save-dialog-title">
          Save Progress
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="save-dialog-description">
            Saving uses local storage on your browser. If you clear your browser&apos;s local storage, your progress will be deleted. We highly recommend that you export your data as well for backup!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveConfirm} color="success" variant="contained" autoFocus>
            Save Progress
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProgressTracking;

import React from "react";
import { 
  Checkbox, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Typography, 
  Box, 
  Button
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Pack } from "@/constants/packs";

interface PacksToggleListProps {
  packs: Pack[];
  selectedCareerIds: { [packId: string]: string[] };
  disabledCareerIds: string[];
  onTogglePack: (pack: Pack) => void;
  onToggleCareer: (pack: Pack, careerId: string) => void;
  onSelectAll: () => void;
  getPackCheckboxState: (pack: Pack) => { checked: boolean; indeterminate: boolean };
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
}

function PacksToggleList({
  packs,
  selectedCareerIds,
  disabledCareerIds,
  onTogglePack,
  onToggleCareer,
  onSelectAll,
  getPackCheckboxState,
  selectAllChecked,
  selectAllIndeterminate
}: PacksToggleListProps) {
  // Calculate the total number of careers across all packs
  const totalCareerCount = packs.reduce((sum, pack) => sum + pack.careers.length, 0);
  // Determine if all careers are disabled
  const allCareersDisabled = totalCareerCount > 0 && disabledCareerIds.length === totalCareerCount;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Packs & Careers Selection
      </Typography>

      {/* Select All Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant={selectAllChecked ? "contained" : "outlined"}
          color="primary"
          onClick={onSelectAll}
          disabled={allCareersDisabled}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2
          }}
        >
          {selectAllChecked ? "Deselect All Packs" : 
           selectAllIndeterminate ? "Select All Packs" : "Select All Packs"}
        </Button>
      </Box>

      {/* Pack Cards Grid */}
      <Grid container spacing={3}>
        {packs.map((pack) => {
          const { checked: packChecked, indeterminate: packIndeterminate } = getPackCheckboxState(pack);
          const packIsDisabled = pack.careers.every((career) =>
            disabledCareerIds.includes(career.career_id)
          );
          
          const selectedCareers = selectedCareerIds[pack.pack_id] || [];
          const enabledCareers = pack.careers.filter(career => !disabledCareerIds.includes(career.career_id));
          const selectionText = enabledCareers.length > 0 
            ? `${selectedCareers.length}/${enabledCareers.length} selected`
            : 'All completed';

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={pack.pack_id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  border: packChecked ? 2 : 1,
                  borderColor: packChecked ? 'primary.main' : 'divider',
                  backgroundColor: packIsDisabled ? 'action.disabledBackground' : 'background.paper',
                  '&:hover': {
                    elevation: packIsDisabled ? 1 : 4,
                    transform: packIsDisabled ? 'none' : 'translateY(-2px)'
                  }
                }}
                elevation={packChecked ? 3 : 1}
              >
                <CardHeader
                  title={
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textDecoration: packIsDisabled ? 'line-through' : 'none',
                        color: packIsDisabled ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {pack.pack_name}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="text.secondary">
                      {selectionText}
                    </Typography>
                  }
                  action={
                    <Checkbox
                      checked={packChecked}
                      indeterminate={packIndeterminate}
                      disabled={packIsDisabled}
                      onChange={() => onTogglePack(pack)}
                      color="primary"
                    />
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {pack.careers.map((career) => {
                      const careersSelected = selectedCareerIds[pack.pack_id] || [];
                      const careerIsSelected = careersSelected.includes(career.career_id);
                      const careerIsDisabled = disabledCareerIds.includes(career.career_id);

                      return (
                        <Chip
                          key={career.career_id}
                          label={career.career_name}
                          onClick={() => !careerIsDisabled && onToggleCareer(pack, career.career_id)}
                          variant={careerIsSelected ? "filled" : "outlined"}
                          color={careerIsSelected ? "primary" : "default"}
                          disabled={careerIsDisabled}
                          sx={{
                            '&:hover': {
                              backgroundColor: careerIsDisabled ? 'inherit' : 
                                careerIsSelected ? 'primary.dark' : 'action.hover'
                            },
                            textDecoration: careerIsDisabled ? 'line-through' : 'none',
                            cursor: careerIsDisabled ? 'default' : 'pointer'
                          }}
                        />
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default PacksToggleList;

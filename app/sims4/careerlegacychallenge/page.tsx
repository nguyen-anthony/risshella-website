"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navigation from "@/components/Navigation";
import IFrameBox from "@/components/IFrameBox";
import styles from "@/app/page.module.css";
import PacksToggleList from "@/components/PacksToggleList";
import CareerRandomizer from "@/components/CareerRandomizer";
import ProgressTracking from '@/components/ProgressTracking';
import { PACKS, Pack } from "@/constants/packs"; // If needed here

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: { xs: 0.5, sm: 1, md: 1.5 },
            width: '100%'
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CareerLegacy() {
  const [value, setValue] = React.useState(0);
  
  // 1) Lifted state: which careers are selected
  const [selectedCareerIds, setSelectedCareerIds] = React.useState<{
    [packId: string]: string[];
  }>({});
  const [completedCareers, setCompletedCareers] = React.useState<{
    career_id: string;
    career_name: string;
    generation: number;
  }[]>([]);
  const [generationCount, setGenerationCount] = React.useState(1);
  const [disabledCareerIds, setDisabledCareerIds] = React.useState<string[]>([]);


  React.useEffect(() => {
    // 1) Restore completedCareers
    const savedCompleted = localStorage.getItem("completedCareers");
    if (savedCompleted) {
      try {
        const parsedCompleted = JSON.parse(savedCompleted);
        setCompletedCareers(parsedCompleted);

        // Derive disabledCareerIds from the saved completed careers
        setDisabledCareerIds(
          parsedCompleted.map((career: { career_id: string }) => career.career_id)
        );

        // Optionally, update generationCount to next generation
        if (parsedCompleted.length > 0) {
          const maxGen = Math.max(
            ...parsedCompleted.map((c: { generation: number }) => c.generation)
          );
          setGenerationCount(maxGen + 1);
        }
      } catch (error) {
        console.error("Error parsing saved completedCareers:", error);
      }
    }

    // 2) Restore selectedCareerIds
    const savedSelected = localStorage.getItem("selectedCareers");
    if (savedSelected) {
      try {
        const parsedSelected = JSON.parse(savedSelected);
        setSelectedCareerIds(parsedSelected);
      } catch (error) {
        console.error("Error parsing saved selectedCareers:", error);
      }
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("completedCareers", JSON.stringify(completedCareers));
    localStorage.setItem("selectedCareers", JSON.stringify(selectedCareerIds));
  }, [completedCareers, selectedCareerIds]);

  React.useEffect(() => {
    const savedTab = localStorage.getItem("activeTabIndex");
    if (savedTab !== null) {
      try {
        const parsedTab = JSON.parse(savedTab);
        if (typeof parsedTab === "number") {
          setValue(parsedTab);
        }
      } catch (error) {
        console.error("Error parsing saved tab index:", error);
      }
    }
  }, []);


  // 2) Helper to determine pack's tri-state (checked, unchecked, indeterminate)
  function getPackCheckboxState(pack: Pack) {
    // Filter out careers that are disabled
    const enabledCareers = pack.careers.filter(
      (career) => !disabledCareerIds.includes(career.career_id)
    );
    
    const totalEnabled = enabledCareers.length;
    const selectedCareers = selectedCareerIds[pack.pack_id] || [];
    const countSelected = selectedCareers.length;

    // If there are no enabled careers, the pack can't be toggled anyway
    if (totalEnabled === 0) {
      // Return something that indicates "unchecked" (or you might want to mark it disabled)
      return { checked: false, indeterminate: false };
    }

    if (countSelected === 0) {
      return { checked: false, indeterminate: false };
    } else if (countSelected === totalEnabled) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }


  // 3) Toggle an entire pack
  function handleTogglePack(pack: Pack) {
    const { checked, indeterminate } = getPackCheckboxState(pack);

    if (checked || indeterminate) {
      // Unselect all careers in this pack
      setSelectedCareerIds((prev) => {
        const newState = { ...prev };
        delete newState[pack.pack_id];
        return newState;
      });
    } else {
      // Only select the careers that aren't disabled
      const enabledCareers = pack.careers.filter(
        (career) => !disabledCareerIds.includes(career.career_id)
      );
      // If there are any enabled careers, select them
      if (enabledCareers.length > 0) {
        setSelectedCareerIds((prev) => ({
          ...prev,
          [pack.pack_id]: enabledCareers.map((c) => c.career_id),
        }));
      }
    }
  }


  // 4) Toggle an individual career within a pack
  function handleToggleCareer(pack: Pack, careerId: string) {
    setSelectedCareerIds((prev) => {
      const currentCareers = prev[pack.pack_id] || [];
      let updatedCareers: string[];

      if (currentCareers.includes(careerId)) {
        // Unselect this career
        updatedCareers = currentCareers.filter((id) => id !== careerId);
      } else {
        // Select this career
        updatedCareers = [...currentCareers, careerId];
      }

      const newState = { ...prev, [pack.pack_id]: updatedCareers };

      // If the user unselected the last career, remove the pack from the map
      if (updatedCareers.length === 0) {
        delete newState[pack.pack_id];
      }
      return newState;
    });
  }

  function getAllSelectedCareers(): { career_id: string; career_name: string }[] {
    const allSelected: { career_id: string; career_name: string }[] = [];

    Object.entries(selectedCareerIds).forEach(([packId, careerIds]) => {
      const pack = PACKS.find((p) => p.pack_id === packId);
      if (!pack) return;
      pack.careers.forEach((career) => {
        if (careerIds.includes(career.career_id)) {
          allSelected.push(career);
        }
      });
    });

    return allSelected;
  }

  function handleCareerChosen(careerId: string, careerName: string) {
    // 1. Add the career to your "completed" list, increment generation, etc.
    setCompletedCareers((prev) => [
      ...prev,
      { career_id: careerId, career_name: careerName, generation: generationCount },
    ]);
    setGenerationCount((prev) => prev + 1);

    // 2. Remove it from the "selected" list so it's no longer in the random pool
    setSelectedCareerIds((prev) => {
      const newState = { ...prev };
      for (const packId in newState) {
        if (newState[packId].includes(careerId)) {
          newState[packId] = newState[packId].filter((id) => id !== careerId);
          if (newState[packId].length === 0) {
            delete newState[packId];
          }
          break;
        }
      }
      return newState;
    });

    // 3. Add this career to the "disabled" list so its checkbox is grayed out
    setDisabledCareerIds((prev) => [...prev, careerId]);
  }


   // 4) Clear completed careers
  function handleClearCompleted() {
    if (window.confirm('Please use the export button to backup your progress.\n Are you sure you want to clear all saved progress and start over?') ) {
      setCompletedCareers([]);
      setDisabledCareerIds([]);
      setSelectedCareerIds({});
      setGenerationCount(1);
      localStorage.removeItem("completedCareers")
      localStorage.removeItem("selectedCareers")
    }
  }

  // 5) Save, Export, and File Selected (placeholders)
  function handleSave() {
    alert(
      "Saving uses local storage on your browser. If you clear your browser's local storage, your progress will be deleted. Highly recommend that you export your data as well!"
    );
    // Save the completed careers array as a JSON string in local storage.
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem("completedCareers", JSON.stringify(completedCareers));
    localStorage.setItem("selectedCareers", JSON.stringify(selectedCareerIds));
  }

  function handleExport() {
    // Gather all data in a single object
    const data = {
      completedCareers,
      generationCount,
      disabledCareerIds,
      selectedCareerIds,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2); // `null, 2` for pretty-print

    // Create a temporary download link
    const hiddenElement = document.createElement("a");
    hiddenElement.href = "data:application/json;charset=utf-8," + encodeURIComponent(jsonString);
    hiddenElement.target = "_blank";
    hiddenElement.download = "careerProgress.json"; // or ".txt"
    hiddenElement.click();
  }



  function handleFileSelected(file: File) {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Update state from the imported data, using optional chaining if needed:
        setCompletedCareers(data.completedCareers ?? []);
        setGenerationCount(data.generationCount ?? 1);
        setDisabledCareerIds(data.disabledCareerIds ?? []);
        setSelectedCareerIds(data.selectedCareerIds ?? {});
      } catch (error) {
        alert("Error: Unable to parse the file. Make sure it's valid JSON.");
        console.error(error);
      }
    };

    reader.readAsText(file);
  }

  // 5) Logic for "Select all packs"
  const allPacksCount = PACKS.length;
  const selectedPacksCount = Object.keys(selectedCareerIds).length;
  const allSelected = selectedPacksCount === allPacksCount;
  const noneSelected = selectedPacksCount === 0;
  const someSelected = !noneSelected && !allSelected;
  const selectAllChecked = allSelected && !someSelected;
  const selectAllIndeterminate = someSelected;

  function handleSelectAll() {
    // If already all selected, unselect everything
    if (selectAllChecked || selectAllIndeterminate) {
      setSelectedCareerIds({});
    } else {
      // Select only enabled careers across all packs
      const newCareerState: { [packId: string]: string[] } = {};
      PACKS.forEach((pack) => {
        const enabledCareers = pack.careers.filter(
          (c) => !disabledCareerIds.includes(c.career_id)
        );
        if (enabledCareers.length > 0) {
          newCareerState[pack.pack_id] = enabledCareers.map((c) => c.career_id);
        }
      });
      setSelectedCareerIds(newCareerState);
    }
  }

  // Tab handling
  function handleChange(event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
    localStorage.setItem("activeTabIndex", JSON.stringify(newValue));
  }

  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <h2>Career Legacy Challenge</h2>
        <p>Website is being revamped, so things will look a little different for some time :)</p>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch", // Changed from "center" to "stretch" to use full width
            px: { xs: 1, sm: 2, md: 3, lg: 4 }, // Added lg breakpoint for larger padding
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              <Tab label="Challenge Rules" />
              <Tab label="Randomizer" />
            </Tabs>
          </Box>

          {/* Tab Panel 1 */}
          <CustomTabPanel value={value} index={0}>
            <IFrameBox url="https://docs.google.com/document/d/e/2PACX-1vQ0gWK-GPO9t4wXLn64tQ42zz1tIyjfaTpAZlge1LeOFViDZVsIFnxjdAuIn9_oaqeHVmH1O4n0Iqpl/pub?embedded=true" />
          </CustomTabPanel>

          {/* Tab Panel 2 */}
          <CustomTabPanel value={value} index={1}>
            {/* Vertical Stack Layout for All Devices */}
            <Box sx={{ width: '100%' }}>
              {/* Randomizer Section - Always Visible */}
              <Box sx={{ 
                mb: 2, 
                p: { xs: 2, sm: 3, md: 4 }, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 2,
                minHeight: 120,
                width: '100%'
              }}>
                <Typography variant="h6" gutterBottom>
                  Career Randomizer
                </Typography>
                <CareerRandomizer 
                  allSelectedCareers={getAllSelectedCareers()}         
                  onCareerChosen={handleCareerChosen}
                />
              </Box>

              {/* Progress Tracking - Collapsible */}
              <Accordion sx={{ mb: 1, width: '100%' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="progress-tracking-content"
                  id="progress-tracking-header"
                  sx={{ minHeight: 56 }}
                >
                  <Typography variant="h6">Progress Tracking</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <ProgressTracking
                    completedCareers={completedCareers}
                    onClear={handleClearCompleted}
                    onSave={handleSave}
                    onExport={handleExport}
                    onFileSelected={handleFileSelected}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Pack Selection - Collapsible */}
              <Accordion sx={{ width: '100%' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="pack-selection-content"
                  id="pack-selection-header"
                  sx={{ minHeight: 56 }}
                >
                  <Typography variant="h6">Select Packs & Careers</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <PacksToggleList
                    packs={PACKS}
                    selectedCareerIds={selectedCareerIds}
                    disabledCareerIds={disabledCareerIds}
                    onTogglePack={handleTogglePack}
                    onToggleCareer={handleToggleCareer}
                    onSelectAll={handleSelectAll}
                    getPackCheckboxState={getPackCheckboxState}
                    selectAllChecked={selectAllChecked}
                    selectAllIndeterminate={selectAllIndeterminate}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </CustomTabPanel>
        </Box>
      </main>
      <footer className={styles.footer}>{/* Footer content */}</footer>
    </div>
  );
}

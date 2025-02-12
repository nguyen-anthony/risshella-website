import React from "react";
import { Button } from "@mui/material";

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
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <div>
      <h3>Completed Careers</h3>
      {/* List of completed careers */}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {completedCareers.map((career) => (
          <li key={career.career_id}>
            Generation {career.generation} - {career.career_name}
          </li>
        ))}
      </ul>

      {/* File input and buttons */}
      <div style={{ marginTop: "1rem" }}>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          style={{ marginBottom: "0.5rem" }}
        />
        <br />
        <Button variant='contained' color="success" onClick={onSave}>Save</Button>
        <Button variant='contained' onClick={onExport} style={{ marginLeft: "0.5rem" }}>
          Export
        </Button>
        <Button variant='contained' color="error" onClick={onClear} style={{ marginLeft: "0.5rem" }}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export default ProgressTracking;

import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
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
  return (
    <div>
      <h2>Packs/Careers List</h2>

      {/* Top-level "Select all packs" */}
      <FormControlLabel
        control={
          <Checkbox
            checked={selectAllChecked}
            indeterminate={selectAllIndeterminate}
            onChange={onSelectAll}
          />
        }
        label="Select all packs"
      />

      <div style={{ marginLeft: "2rem", marginTop: "0.1rem" }}>
        {packs.map((pack) => {
          const { checked: packChecked, indeterminate: packIndeterminate } =
            getPackCheckboxState(pack);

          return (
            <div key={pack.pack_id} style={{ marginBottom: "0.1rem" }}>
              {/* Pack-level checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={packChecked}
                    indeterminate={packIndeterminate}
                    onChange={() => onTogglePack(pack)}
                  />
                }
                label={pack.pack_name}
              />

              {/* Indent child careers */}
              {(packChecked || packIndeterminate) && (
                <div style={{ marginLeft: "2rem", marginTop: "0.1rem" }}>
                  {pack.careers.map((career) => {
                    const careersSelected = selectedCareerIds[pack.pack_id] || [];
                    const careerIsSelected = careersSelected.includes(career.career_id);

                    return (
                      <div key={career.career_id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={careerIsSelected}
                              disabled={disabledCareerIds.includes(career.career_id)}
                              onChange={() => onToggleCareer(pack, career.career_id)}
                            />
                          }
                          label={career.career_name}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PacksToggleList;

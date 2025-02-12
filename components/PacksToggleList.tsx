import React, { useState } from "react";
import { PACKS, Pack } from "@/constants/packs";

function PacksToggleList() {
  // State for selected pack IDs
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);

  // Determine if we are in "all selected" mode
  const allSelected = selectedPackIds.length === PACKS.length;

  // Handler to toggle an individual pack
  const handleTogglePack = (packId: string) => {
    setSelectedPackIds((prev) =>
      prev.includes(packId)
        ? prev.filter((id) => id !== packId)
        : [...prev, packId]
    );
  };

  // Handler for "Select All Packs" button
  const handleSelectAll = () => {
    if (allSelected) {
      // If currently all are selected, unselect them all
      setSelectedPackIds([]);
    } else {
      // Otherwise select every pack
      setSelectedPackIds(PACKS.map((p) => p.pack_id));
    }
  };

  return (
    <div>
      <h2>Packs/Careers List</h2>

      {/* Toggle: Select All Packs */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: "bold" }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
          />
          Select All Packs
        </label>
      </div>

      {/* Render each pack */}
      {PACKS.map((pack: Pack) => {
        const packIsSelected = selectedPackIds.includes(pack.pack_id);
        return (
          <div key={pack.pack_id} style={{ marginBottom: "1rem" }}>
            {/* Pack toggle */}
            <label style={{ fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={packIsSelected}
                onChange={() => handleTogglePack(pack.pack_id)}
              />
              {pack.pack_name}
            </label>

            {/* Show careers only if pack is selected */}
            {packIsSelected && (
              <ul style={{ marginTop: "0.5rem" }}>
                {pack.careers.map((career) => (
                  <li key={career.career_id}>
                    <label>
                      <input
                        type="checkbox"
                        // Additional logic for career selection could go here
                        checked={true}
                        onChange={() => {}}
                      />
                      {career.career_name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PacksToggleList;

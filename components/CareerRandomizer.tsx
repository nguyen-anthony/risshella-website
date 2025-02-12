// CareerRandomizer.tsx
import React, { useState, useMemo } from "react";
import { PACKS } from "@/constants/packs";
import { Button } from "@mui/material"

interface CareerRandomizerProps {
  selectedCareerIds: { [packId: string]: string[] };
}

function CareerRandomizer({ selectedCareerIds }: CareerRandomizerProps) {
  const [randomCareerId, setRandomCareerId] = useState<string | null>(null);

  // 1) Flatten all selected IDs
  const allSelectedIds = Object.values(selectedCareerIds).flat();

  const careerNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    PACKS.forEach((pack) => {
      pack.careers.forEach((c) => {
        map[c.career_id] = c.career_name;
      });
    });
    return map;
  }, []);

  function handleRandomize() {
    if (allSelectedIds.length === 0) {
      setRandomCareerId(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * allSelectedIds.length);
    const chosenId = allSelectedIds[randomIndex];
    setRandomCareerId(chosenId);
  }

  // 3) Convert the chosen ID to a name
  const randomCareerName = randomCareerId ? careerNameMap[randomCareerId] : null;

  return (
    <div>
      <h3>Randomizer</h3>
      <p>Selected career: {randomCareerName ?? "None"}</p>
      <Button variant="contained" onClick={handleRandomize}>Randomize!</Button>
    </div>
  );
}

export default CareerRandomizer;

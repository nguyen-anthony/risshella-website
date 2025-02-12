import React, { useState } from "react";
import { Button } from '@mui/material';

interface Career {
  career_id: string;
  career_name: string;
}

interface CareerRandomizerProps {
  // A list of fully selected careers (each an object with ID and name).
  allSelectedCareers: Career[];
}

function CareerRandomizer({ allSelectedCareers }: CareerRandomizerProps) {
  const [randomCareer, setRandomCareer] = useState<Career | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [genNum, setGenNum] = useState(1); // Generation counter

  function handleRandomize() {
    if (allSelectedCareers.length === 0) {
      setRandomCareer(null);
      alert("Please select some careers in the list!");
      return;
    }

    setIsRandomizing(true);
    let currentCareer: Career | null = null; // Local variable to store the current career

    // Start an interval that picks a random career every 10ms
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allSelectedCareers.length);
      const chosen = allSelectedCareers[randomIndex];
      currentCareer = chosen; // update the local variable
      setRandomCareer(chosen);
    }, 10);

    // After 1.5 seconds, stop the interval
    setTimeout(() => {
      clearInterval(intervalId);
      setIsRandomizing(false);

      // Optional: add a slight delay before asking for confirmation
      setTimeout(() => {
        if (
          currentCareer &&
          window.confirm(`Do you want to play the "${currentCareer.career_name}" career?`)
        ) {
          // Record the chosen career
          console.log(`User chose: ${currentCareer.career_name}`);
          setGenNum((prev) => prev + 1);
          // Additional logic such as disabling the chosen career can be added here.
          console.log(`${genNum}`)
        }
      }, 500);
    }, 1500);
  }

  return (
    <div>
      <h3>Randomizer</h3>
      <p>
        Selected career: {randomCareer ? randomCareer.career_name : "None"}
      </p>
      <Button variant='contained' onClick={handleRandomize} disabled={isRandomizing}>
        {isRandomizing ? "Randomizing..." : "Randomize!"}
      </Button>
    </div>
  );
}

export default CareerRandomizer;

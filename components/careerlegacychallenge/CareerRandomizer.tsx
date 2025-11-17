import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

interface Career {
  career_id: string;
  career_name: string;
}

interface CareerRandomizerProps {
  // A list of fully selected careers (each an object with ID and name).
  allSelectedCareers: Career[];
  onCareerChosen: (careerId: string, careerName: string) => void; // new callback
}

function CareerRandomizer({ allSelectedCareers, onCareerChosen }: CareerRandomizerProps) {
  const [randomCareer, setRandomCareer] = useState<Career | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCareer, setPendingCareer] = useState<Career | null>(null);

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
        if (currentCareer) {
          setPendingCareer(currentCareer);
          setShowConfirmModal(true);
        }
      }, 500);
    }, 1500);
  }

  const handleConfirmCareer = () => {
    if (pendingCareer) {
      console.log(`User chose: ${pendingCareer.career_name}`);
      onCareerChosen(pendingCareer.career_id, pendingCareer.career_name);
    }
    setShowConfirmModal(false);
    setPendingCareer(null);
  };

  const handleCancelCareer = () => {
    setShowConfirmModal(false);
    setPendingCareer(null);
  };

  return (
    <div>
      <h3>Randomizer</h3>
      <p style={{ minWidth: "280px" }}>
        Selected career: {randomCareer ? randomCareer.career_name : "None"}
      </p>
      <Button variant='contained' onClick={handleRandomize} disabled={isRandomizing}>
        {isRandomizing ? "Randomizing..." : "Randomize!"}
      </Button>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmModal}
        onClose={handleCancelCareer}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Career Choice
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Do you want to play the &ldquo;{pendingCareer?.career_name}&rdquo; career? By confirming, this will save your progress to your browser&apos;s local storage.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCareer} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmCareer} color="primary" variant="contained" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CareerRandomizer;

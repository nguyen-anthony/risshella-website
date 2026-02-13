"use client";
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface BingoCardData {
  villagerIds: number[];
  markedSquares: boolean[];
  size: number;
  generatedAt: number;
}

/**
 * Hook for managing interactive bingo card state in localStorage
 * Each hunt can have one bingo card that persists across page loads
 */
export function useBingoCard(huntId: string) {
  const [cardData, setCardData, removeCardData] = useLocalStorage<BingoCardData | null>(
    `bingoCard_${huntId}`,
    null
  );

  // Re-read from localStorage when huntId changes
  useEffect(() => {
    if (!huntId || typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(`bingoCard_${huntId}`);
      if (item) {
        const parsed = JSON.parse(item);
        setCardData(parsed);
      } else {
        setCardData(null);
      }
    } catch (error) {
      console.error(`Error reading bingo card for hunt ${huntId}:`, error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huntId]);

  /**
   * Generate a new bingo card with the provided villager IDs
   */
  const generateCard = useCallback(
    (villagerIds: number[], size: number) => {
      const totalSquares = size * size;
      setCardData({
        villagerIds,
        markedSquares: new Array(totalSquares).fill(false),
        size,
        generatedAt: Date.now(),
      });
    },
    [setCardData]
  );

  /**
   * Toggle the marked state of a square at the given index
   */
  const toggleSquare = useCallback(
    (index: number) => {
      if (!cardData) return;
      
      const newMarkedSquares = [...cardData.markedSquares];
      newMarkedSquares[index] = !newMarkedSquares[index];
      
      setCardData({
        ...cardData,
        markedSquares: newMarkedSquares,
      });
    },
    [cardData, setCardData]
  );

  /**
   * Clear the bingo card for this hunt
   */
  const clearCard = useCallback(() => {
    removeCardData();
  }, [removeCardData]);

  /**
   * Check if a bingo card exists for this hunt
   */
  const hasCard = cardData !== null;

  return {
    cardData,
    hasCard,
    generateCard,
    toggleSquare,
    clearCard,
  };
}

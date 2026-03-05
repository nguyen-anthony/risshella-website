-- Migration: add owner bingo filter defaults to hunts table
-- These columns let hunt owners pre-set species and personality filters
-- that are automatically applied when visitors generate a bingo card.

ALTER TABLE hunts
  ADD COLUMN IF NOT EXISTS bingo_filter_species       TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bingo_filter_personalities TEXT[] NOT NULL DEFAULT '{}';

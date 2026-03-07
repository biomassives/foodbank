-- Migration: add driver_routes column to profiles
-- Apply manually via Supabase SQL Editor (migration history is out of sync)
--
-- driver_routes stores two WeekAvailability grids for users who run food pickups:
--   boulder  — days/slots they are in Boulder and available for donor pickups
--   mountain — days/slots they are driving up to Ward Food Pantry

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS driver_routes jsonb DEFAULT NULL;

COMMENT ON COLUMN profiles.driver_routes IS
  'Two WeekAvailability grids: {boulder: {...}, mountain: {...}}. '
  'boulder = pickup windows in Boulder; mountain = delivery runs to Ward Food Pantry.';

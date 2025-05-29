/*
  # Add variant columns to cart table

  1. Changes
    - Add `size` column to cart table (TEXT, nullable)
    - Add `color` column to cart table (TEXT, nullable)
    These columns are needed to store variant information for merchandise items

  2. Security
    - No changes to RLS policies needed as existing policies cover the new columns
*/

ALTER TABLE cart
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS color text;
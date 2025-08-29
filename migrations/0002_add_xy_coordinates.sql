-- Add X and Y coordinate columns to stash_events table
ALTER TABLE stash_events ADD COLUMN x INTEGER;
ALTER TABLE stash_events ADD COLUMN y INTEGER;

-- Create index on coordinates for potential future queries
CREATE INDEX idx_coordinates ON stash_events(x, y);

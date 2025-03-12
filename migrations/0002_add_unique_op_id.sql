-- Add UNIQUE constraint to op_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_op_id ON stash_events(op_id); 
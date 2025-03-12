-- Drop existing indexes
DROP INDEX IF EXISTS idx_timestamp;
DROP INDEX IF EXISTS idx_user;
DROP INDEX IF EXISTS idx_item;

-- Drop existing table
DROP TABLE IF EXISTS stash_events;

-- Create new table with updated schema
CREATE TABLE stash_events (
  id INTEGER PRIMARY KEY,
  date DATETIME NOT NULL,
  op_id INTEGER NOT NULL,
  league TEXT NOT NULL,
  account TEXT NOT NULL,
  action TEXT CHECK(action IN ('added', 'removed')) NOT NULL,
  stash TEXT NOT NULL,
  item TEXT NOT NULL
);

-- Create new indexes
CREATE INDEX idx_date ON stash_events(date);
CREATE INDEX idx_account ON stash_events(account);
CREATE INDEX idx_item ON stash_events(item);
CREATE INDEX idx_stash ON stash_events(stash);
CREATE INDEX idx_op_id ON stash_events(op_id);
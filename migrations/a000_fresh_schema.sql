-- Create table
DROP TABLE stash_events;

CREATE TABLE stash_events (
  id INTEGER PRIMARY KEY,
  date DATETIME NOT NULL,
  op_id INTEGER NOT NULL,
  league TEXT NOT NULL,
  account TEXT NOT NULL,
  action TEXT CHECK(action IN ('added', 'removed', 'modified')) NOT NULL,
  stash TEXT NOT NULL,
  itemCount INTEGER NOT NULL,
  item TEXT NOT NULL
);
-- Recreate indexes
CREATE INDEX idx_date ON stash_events(date);
CREATE INDEX idx_account ON stash_events(account);
CREATE INDEX idx_item ON stash_events(item);
CREATE INDEX idx_stash ON stash_events(stash);
CREATE INDEX idx_op_id ON stash_events(op_id);
CREATE UNIQUE INDEX idx_unique_op_id ON stash_events(op_id);
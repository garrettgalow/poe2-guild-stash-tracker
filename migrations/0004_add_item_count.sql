-- Drop existing check constraint
DROP TABLE IF EXISTS stash_events_temp;
CREATE TABLE stash_events_temp (
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

-- Copy data
INSERT INTO stash_events_temp SELECT id, date, op_id, league, account, action, stash, 1, item FROM stash_events;

-- Drop old table and rename new one
DROP TABLE stash_events;
ALTER TABLE stash_events_temp RENAME TO stash_events;

-- Recreate indexes
CREATE INDEX idx_date ON stash_events(date);
CREATE INDEX idx_account ON stash_events(account);
CREATE INDEX idx_item ON stash_events(item);
CREATE INDEX idx_stash ON stash_events(stash);
CREATE INDEX idx_op_id ON stash_events(op_id);
CREATE UNIQUE INDEX idx_unique_op_id ON stash_events(op_id);
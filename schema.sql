CREATE TABLE stash_events (
  id INTEGER PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  league TEXT NOT NULL,
  stash TEXT NOT NULL,
  item TEXT NOT NULL,
  user TEXT NOT NULL,
  action TEXT CHECK(action IN ('added', 'removed')) NOT NULL
);

CREATE INDEX idx_timestamp ON stash_events(timestamp);
CREATE INDEX idx_user ON stash_events(user);
CREATE INDEX idx_item ON stash_events(item);

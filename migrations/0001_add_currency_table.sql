-- Create currency table
CREATE TABLE currency (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Insert currency items from config
INSERT INTO currency (name) VALUES
  ('Orb of Transmutation'),
  ('Orb of Augmentation'),
  ('Orb of Alchemy'),
  ('Regal Orb'),
  ('Chaos Orb'),
  ('Vaal Orb'),
  ('Exalted Orb'),
  ('Divine Orb'),
  ('Orb of Annulment'),
  ('Orb of Chance'),
  ('Mirror of Kalandra'),
  ('Lesser Jewellers Orb'),
  ('Greater Jewellers Orb'),
  ('Perfect Jewellers Orb'),
  ('Blacksmiths Whetstone'),
  ('Arcanists Etcher'),
  ('Armourers Scrap'),
  ('Gemcutters Prism'),
  ('Glassblowers Bauble'),
  ('Artificer''s Orb'); 
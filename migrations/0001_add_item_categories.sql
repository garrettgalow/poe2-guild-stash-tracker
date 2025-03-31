-- Create categories table
CREATE TABLE item_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Create item-category mapping table
CREATE TABLE item_category_mapping (
  item_name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (item_name, category_id),
  FOREIGN KEY (category_id) REFERENCES item_categories(id)
);

-- Insert categories
INSERT INTO item_categories (name) VALUES
  ('currency'),
  ('gems');

-- Insert currency items mapping
INSERT INTO item_category_mapping (item_name, category_id)
VALUES
  ('Orb of Transmutation', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Orb of Augmentation', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Orb of Alchemy', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Regal Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Chaos Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Vaal Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Exalted Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Divine Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Orb of Annulment', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Orb of Chance', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Mirror of Kalandra', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Lesser Jewellers Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Greater Jewellers Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Perfect Jewellers Orb', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Blacksmiths Whetstone', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Arcanists Etcher', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Armourers Scrap', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Gemcutters Prism', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Glassblowers Bauble', (SELECT id FROM item_categories WHERE name = 'currency')),
  ('Artificer''s Orb', (SELECT id FROM item_categories WHERE name = 'currency'));

-- Insert gem items mapping
INSERT INTO item_category_mapping (item_name, category_id)
VALUES
  ('Uncut Skill Gem', (SELECT id FROM item_categories WHERE name = 'gems')); 
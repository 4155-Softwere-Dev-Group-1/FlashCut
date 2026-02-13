-- FlashCut Database Initialization Script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deck_flashcards junction table
CREATE TABLE IF NOT EXISTS deck_flashcards (
  deck_id INT REFERENCES decks(id) ON DELETE CASCADE,
  flashcard_id INT REFERENCES flashcards(id) ON DELETE CASCADE,
  PRIMARY KEY (deck_id, flashcard_id)
);

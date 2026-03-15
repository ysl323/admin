-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  lesson INTEGER DEFAULT 1,
  grade INTEGER DEFAULT 1,
  question TEXT NOT NULL,
  english TEXT NOT NULL,
  chinese TEXT NOT NULL,
  phonetic TEXT,
  audio_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Create learning_records table
CREATE TABLE IF NOT EXISTS learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  module_type TEXT NOT NULL,
  lesson INTEGER DEFAULT 1,
  question TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  data TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default modules
INSERT OR IGNORE INTO modules (name, type, description, icon, sort_order) VALUES
  ('小学英语', 'primary', '小学英语单词学习', '📚', 1),
  ('初中英语', 'junior', '初中英语单词学习', '📖', 2),
  ('高中英语', 'senior', '高中英语单词学习', '📕', 3),
  ('编程英语', 'programming', '编程相关英语单词', '💻', 4);
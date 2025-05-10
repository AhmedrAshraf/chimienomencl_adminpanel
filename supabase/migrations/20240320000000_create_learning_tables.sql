-- Create learnings table
CREATE TABLE learnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create learning_sections table
CREATE TABLE learning_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_id UUID NOT NULL REFERENCES learnings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('explanation', 'example', 'rule')),
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create learning_quizzes table (junction table for learning-quiz relationships)
CREATE TABLE learning_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_id UUID NOT NULL REFERENCES learnings(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(learning_id, quiz_id)
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_learnings_updated_at
  BEFORE UPDATE ON learnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sections_updated_at
  BEFORE UPDATE ON learning_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_quizzes_updated_at
  BEFORE UPDATE ON learning_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to view learnings"
  ON learnings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert learnings"
  ON learnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update learnings"
  ON learnings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete learnings"
  ON learnings FOR DELETE
  TO authenticated
  USING (true);

-- Similar policies for learning_sections
CREATE POLICY "Allow authenticated users to view learning sections"
  ON learning_sections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert learning sections"
  ON learning_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update learning sections"
  ON learning_sections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete learning sections"
  ON learning_sections FOR DELETE
  TO authenticated
  USING (true);

-- Similar policies for learning_quizzes
CREATE POLICY "Allow authenticated users to view learning quizzes"
  ON learning_quizzes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert learning quizzes"
  ON learning_quizzes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete learning quizzes"
  ON learning_quizzes FOR DELETE
  TO authenticated
  USING (true); 
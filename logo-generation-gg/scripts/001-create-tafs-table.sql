-- Criar tabela para armazenar TAFs realizados
CREATE TABLE IF NOT EXISTS tafs (
  id SERIAL PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  passport_id VARCHAR(50) NOT NULL,
  recruiter_name VARCHAR(255) NOT NULL,
  auxiliary_name VARCHAR(255),
  photo_url TEXT,
  date TIMESTAMP NOT NULL,
  status JSONB NOT NULL,
  correct_questions INTEGER NOT NULL,
  correct_exercises INTEGER NOT NULL,
  total_criteria INTEGER NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tafs_status ON tafs USING GIN(status);
CREATE INDEX IF NOT EXISTS idx_tafs_passport_id ON tafs(passport_id);
CREATE INDEX IF NOT EXISTS idx_tafs_date ON tafs(date);

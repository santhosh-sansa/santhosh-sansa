CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS embedding_vector vector(1536);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_vector
  ON knowledge_chunks USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- Optional upgrade idea:
-- Store OpenAI text-embedding-3-small values in embedding_vector and query:
-- SELECT *, 1 - (embedding_vector <=> $1::vector) AS score
-- FROM knowledge_chunks
-- WHERE status = 'active'
-- ORDER BY embedding_vector <=> $1::vector
-- LIMIT 8;

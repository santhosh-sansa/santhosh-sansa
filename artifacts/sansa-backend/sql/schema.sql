CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  original_name TEXT,
  stored_name TEXT,
  mime_type TEXT,
  status TEXT DEFAULT 'active',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  keywords TEXT DEFAULT '',
  embedding_json JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_status ON knowledge_chunks(status);
CREATE INDEX IF NOT EXISTS idx_chunks_text_search
  ON knowledge_chunks USING GIN (to_tsvector('simple', title || ' ' || content || ' ' || keywords));

CREATE TABLE IF NOT EXISTS manual_teachings (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_logs (
  id BIGSERIAL PRIMARY KEY,
  user_message TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_count INT DEFAULT 0,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_memories (
  id BIGSERIAL PRIMARY KEY,
  memory_type TEXT DEFAULT 'business',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT DEFAULT '',
  importance INT DEFAULT 3,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_memories_status ON ai_memories(status);
CREATE INDEX IF NOT EXISTS idx_ai_memories_text_search
  ON ai_memories USING GIN (to_tsvector('simple', title || ' ' || content || ' ' || keywords));

const { Pool } = require('pg');

const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : null;

async function initDatabase() {
  if (!pool) {
    console.warn('DATABASE_URL not set. SANSA AI is running in website demo mode without database logging.');
    return;
  }

  await pool.query(`
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

    CREATE TABLE IF NOT EXISTS app_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      mobile TEXT DEFAULT '',
      user_type TEXT DEFAULT 'business-owner',
      plan_id TEXT DEFAULT 'free',
      credits INT DEFAULT 50,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'owner',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE app_users ADD COLUMN IF NOT EXISTS mobile TEXT DEFAULT '';
    ALTER TABLE app_users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'business-owner';
    ALTER TABLE app_users ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'free';
    ALTER TABLE app_users ADD COLUMN IF NOT EXISTS credits INT DEFAULT 50;

    CREATE TABLE IF NOT EXISTS business_setups (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE,
      setup_json JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT,
      event_name TEXT NOT NULL,
      event_json JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_events (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT,
      provider TEXT DEFAULT 'upi',
      invoice_number TEXT DEFAULT '',
      customer_name TEXT DEFAULT '',
      amount NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'created',
      payment_url TEXT DEFAULT '',
      event_json JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT,
      plan_id TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      amount NUMERIC DEFAULT 0,
      provider TEXT DEFAULT '',
      payment_url TEXT DEFAULT '',
      invoice_number TEXT DEFAULT '',
      starts_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      event_json JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function query(sql, params = []) {
  if (!pool) {
    return { rows: [], rowCount: 0, command: 'SKIP' };
  }

  const result = await pool.query(sql, params);
  return result;
}

module.exports = { pool, initDatabase, query };

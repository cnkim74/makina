// 자동 생성 파일 — 고치지 마세요. `node scripts/gen-schema.mjs` (빌드·개발 서버 시작 때 자동 실행)
// 원본: migrations/0001_init.sql
export const SCHEMA_STATEMENTS: readonly string[] = [
  "CREATE TABLE IF NOT EXISTS users ( id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor')), status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled')), created_at TEXT NOT NULL DEFAULT (datetime('now')), last_login_at TEXT )",
  "CREATE TABLE IF NOT EXISTS sessions ( id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)",
  "CREATE TABLE IF NOT EXISTS login_failures ( id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_login_failures_email ON login_failures (email, created_at)",
  "CREATE TABLE IF NOT EXISTS settings ( key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE TABLE IF NOT EXISTS videos ( id INTEGER PRIMARY KEY AUTOINCREMENT, youtube_id TEXT NOT NULL, title TEXT NOT NULL, caption TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT '작업 영상', tags TEXT NOT NULL DEFAULT '[]', published_on TEXT NOT NULL DEFAULT (date('now')), sort INTEGER NOT NULL DEFAULT 0, visible INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE TABLE IF NOT EXISTS sns_links ( id INTEGER PRIMARY KEY AUTOINCREMENT, platform TEXT NOT NULL, label TEXT NOT NULL, url TEXT NOT NULL, visible INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0 )",
  "CREATE TABLE IF NOT EXISTS inquiries ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')), memo TEXT NOT NULL DEFAULT '', client_key TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_inquiries_client ON inquiries (client_key, created_at)",
  "CREATE TABLE IF NOT EXISTS media ( id INTEGER PRIMARY KEY AUTOINCREMENT, r2_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE TABLE IF NOT EXISTS events ( id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', path TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_events_type_time ON events (type, created_at)"
];

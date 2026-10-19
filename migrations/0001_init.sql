-- 성원마끼나 CMS 초기 스키마 (Cloudflare D1 / SQLite)

-- 회원. 첫 가입자는 owner 로 바로 활성, 이후 가입자는 pending 상태로 관리자 승인을 기다린다.
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  name          TEXT    NOT NULL,
  password_hash TEXT    NOT NULL,
  password_salt TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor')),
  status        TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- 로그인 세션. id 는 쿠키 토큰의 SHA-256 (토큰 원문은 저장하지 않는다)
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- 로그인 실패 기록 (짧은 시간 연속 실패 시 잠금)
CREATE TABLE IF NOT EXISTS login_failures (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_failures_email ON login_failures (email, created_at);

-- 사이트 설정 (연락처·연동·히어로 등). value 는 문자열 또는 JSON
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 유튜브 영상
CREATE TABLE IF NOT EXISTS videos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  youtube_id   TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  caption      TEXT    NOT NULL DEFAULT '',
  kind         TEXT    NOT NULL DEFAULT '작업 영상',
  tags         TEXT    NOT NULL DEFAULT '[]',
  published_on TEXT    NOT NULL DEFAULT (date('now')),
  sort         INTEGER NOT NULL DEFAULT 0,
  visible      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- SNS 채널
CREATE TABLE IF NOT EXISTS sns_links (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT    NOT NULL,
  label    TEXT    NOT NULL,
  url      TEXT    NOT NULL,
  visible  INTEGER NOT NULL DEFAULT 1,
  sort     INTEGER NOT NULL DEFAULT 0
);

-- 문의
CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  email      TEXT    NOT NULL DEFAULT '',
  category   TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done')),
  memo       TEXT    NOT NULL DEFAULT '',
  client_key TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_client ON inquiries (client_key, created_at);

-- 업로드한 파일 (R2)
CREATE TABLE IF NOT EXISTS media (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key       TEXT    NOT NULL UNIQUE,
  filename     TEXT    NOT NULL,
  content_type TEXT    NOT NULL,
  size         INTEGER NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 자체 분석 이벤트 (개인정보 없음: 종류·라벨·경로·날짜만)
CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT    NOT NULL,
  label      TEXT    NOT NULL DEFAULT '',
  path       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON events (type, created_at);

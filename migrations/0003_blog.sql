-- 블로그 (cnbizpartners.com 인사이트 방식): 마크다운 본문 + 표지 카드 + 자주 묻는 질문 + 유튜브 + 페이스북 게시 기록
CREATE TABLE IF NOT EXISTS blog_posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  summary       TEXT    NOT NULL DEFAULT '',
  body          TEXT    NOT NULL DEFAULT '',
  keyword       TEXT    NOT NULL DEFAULT '',
  tags          TEXT    NOT NULL DEFAULT '[]',
  faq           TEXT    NOT NULL DEFAULT '[]',
  cover         TEXT    NOT NULL DEFAULT '{}',
  youtube_id    TEXT    NOT NULL DEFAULT '',
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  source        TEXT    NOT NULL DEFAULT 'manual',
  published_at  TEXT,
  views         INTEGER NOT NULL DEFAULT 0,
  fb_post_id    TEXT    NOT NULL DEFAULT '',
  fb_permalink  TEXT    NOT NULL DEFAULT '',
  created_by    TEXT    NOT NULL DEFAULT '',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts (status, published_at);

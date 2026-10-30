-- 영업 관리: 고객(회원) · 견적 · 계약 · 매출 · 목표(실적) · 명함
-- 금액은 모두 원 단위 정수. 품목(items)은 JSON 배열 [{ "name": "", "spec": "", "qty": 1, "price": 0 }]

-- 고객(농가) 회원
CREATE TABLE IF NOT EXISTS customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  phone      TEXT    NOT NULL DEFAULT '',
  phone2     TEXT    NOT NULL DEFAULT '',
  email      TEXT    NOT NULL DEFAULT '',
  region     TEXT    NOT NULL DEFAULT '',
  address    TEXT    NOT NULL DEFAULT '',
  farm       TEXT    NOT NULL DEFAULT '',
  tractor    TEXT    NOT NULL DEFAULT '',
  machines   TEXT    NOT NULL DEFAULT '',
  source     TEXT    NOT NULL DEFAULT '',
  grade      TEXT    NOT NULL DEFAULT 'normal' CHECK (grade IN ('prospect', 'normal', 'vip', 'dealer')),
  memo       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);

-- 견적서
CREATE TABLE IF NOT EXISTS quotes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_no         TEXT    NOT NULL UNIQUE,
  customer_id    INTEGER REFERENCES customers (id) ON DELETE SET NULL,
  customer_name  TEXT    NOT NULL,
  customer_phone TEXT    NOT NULL DEFAULT '',
  customer_addr  TEXT    NOT NULL DEFAULT '',
  title          TEXT    NOT NULL DEFAULT '',
  items          TEXT    NOT NULL DEFAULT '[]',
  discount       INTEGER NOT NULL DEFAULT 0,
  vat_mode       TEXT    NOT NULL DEFAULT 'exclusive' CHECK (vat_mode IN ('exclusive', 'inclusive', 'none')),
  valid_until    TEXT    NOT NULL DEFAULT '',
  note           TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'won', 'lost')),
  created_by     TEXT    NOT NULL DEFAULT '',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes (customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes (status, created_at);

-- 계약서
CREATE TABLE IF NOT EXISTS contracts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_no         TEXT    NOT NULL UNIQUE,
  quote_id       INTEGER REFERENCES quotes (id) ON DELETE SET NULL,
  customer_id    INTEGER REFERENCES customers (id) ON DELETE SET NULL,
  customer_name  TEXT    NOT NULL,
  customer_phone TEXT    NOT NULL DEFAULT '',
  customer_addr  TEXT    NOT NULL DEFAULT '',
  customer_birth TEXT    NOT NULL DEFAULT '',
  items          TEXT    NOT NULL DEFAULT '[]',
  discount       INTEGER NOT NULL DEFAULT 0,
  vat_mode       TEXT    NOT NULL DEFAULT 'exclusive' CHECK (vat_mode IN ('exclusive', 'inclusive', 'none')),
  deposit        INTEGER NOT NULL DEFAULT 0,
  deposit_date   TEXT    NOT NULL DEFAULT '',
  balance_date   TEXT    NOT NULL DEFAULT '',
  delivery_date  TEXT    NOT NULL DEFAULT '',
  delivery_place TEXT    NOT NULL DEFAULT '',
  warranty       TEXT    NOT NULL DEFAULT '',
  special_terms  TEXT    NOT NULL DEFAULT '',
  status         TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'delivered', 'done', 'cancelled')),
  signed_on      TEXT    NOT NULL DEFAULT '',
  created_by     TEXT    NOT NULL DEFAULT '',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_contracts_customer ON contracts (customer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (status, created_at);

-- 매출 (한 줄 = 한 건의 판매·수금 대상)
CREATE TABLE IF NOT EXISTS sales (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sold_on       TEXT    NOT NULL,
  customer_id   INTEGER REFERENCES customers (id) ON DELETE SET NULL,
  customer_name TEXT    NOT NULL DEFAULT '',
  contract_id   INTEGER REFERENCES contracts (id) ON DELETE SET NULL,
  category      TEXT    NOT NULL DEFAULT 'machine' CHECK (category IN ('machine', 'parts', 'service', 'etc')),
  item          TEXT    NOT NULL DEFAULT '',
  qty           INTEGER NOT NULL DEFAULT 1,
  amount        INTEGER NOT NULL DEFAULT 0,
  vat           INTEGER NOT NULL DEFAULT 0,
  paid          INTEGER NOT NULL DEFAULT 0,
  method        TEXT    NOT NULL DEFAULT '',
  region        TEXT    NOT NULL DEFAULT '',
  memo          TEXT    NOT NULL DEFAULT '',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sales_day ON sales (sold_on);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales (customer_id);

-- 연간 목표 (실적 관리). item 은 품목 이름(예: DRAGON 230) 또는 '전체'
CREATE TABLE IF NOT EXISTS targets (
  year   INTEGER NOT NULL,
  item   TEXT    NOT NULL,
  qty    INTEGER NOT NULL DEFAULT 0,
  amount INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (year, item)
);

-- 명함 (네임카드). 사진은 R2 의 cards/ 아래에 두고 로그인한 사람만 본다
CREATE TABLE IF NOT EXISTS name_cards (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  company    TEXT    NOT NULL DEFAULT '',
  title      TEXT    NOT NULL DEFAULT '',
  phone      TEXT    NOT NULL DEFAULT '',
  mobile     TEXT    NOT NULL DEFAULT '',
  email      TEXT    NOT NULL DEFAULT '',
  address    TEXT    NOT NULL DEFAULT '',
  tags       TEXT    NOT NULL DEFAULT '',
  memo       TEXT    NOT NULL DEFAULT '',
  met_on     TEXT    NOT NULL DEFAULT '',
  front_key  TEXT    NOT NULL DEFAULT '',
  back_key   TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_name_cards_name ON name_cards (name);

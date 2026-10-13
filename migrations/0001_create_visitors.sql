-- Visitor counter schema for Cloudflare D1 (SQLite).
--
--
-- The global total is COUNT(*) FROM visitors, so it can never drift out of sync
-- with the rows and can never be incremented twice for the same visitor.

CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY NOT NULL,
  visitor_number INTEGER NOT NULL UNIQUE,
  first_visit_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_visitors_visitor_number
  ON visitors (visitor_number);
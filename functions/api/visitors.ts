/**
 * Cloudflare Pages Function: POST /api/visitors
 *
 * Registers an anonymous first-party identifier (a UUID the browser keeps in
 * localStorage) and returns the permanent visitor number assigned to it.
 *
 */

interface D1ResultRow {
  visitor_number?: number;
  total?: number;
}

interface D1Result {
  results?: D1ResultRow[];
  success?: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = D1ResultRow>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
}

interface Env {
  visitorsCounter?: D1Database;
}

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const MAX_BODY_BYTES = 256;

const NO_STORE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function json(payload: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...NO_STORE_HEADERS, ...extraHeaders },
  });
}

function normalizeVisitorId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim().toLowerCase();
  if (id.length !== 36) return null;
  return UUID_V4.test(id) ? id : null;
}

const INSERT_VISITOR = `
  INSERT INTO visitors (id, visitor_number)
  SELECT ?1, (SELECT IFNULL(MAX(visitor_number), 0) + 1 FROM visitors)
  WHERE NOT EXISTS (SELECT 1 FROM visitors WHERE id = ?1)
`;

const SELECT_VISITOR = `
  SELECT visitor_number FROM visitors WHERE id = ?1 LIMIT 1
`;

const COUNT_VISITORS = `
  SELECT COUNT(*) AS total FROM visitors
`;

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { Allow: "POST, OPTIONS", ...NO_STORE_HEADERS },
    });
  }

  if (request.method !== "POST") {
    return json(
      { error: "method_not_allowed" },
      405,
      { Allow: "POST, OPTIONS" },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "payload_too_large" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const visitorId = normalizeVisitorId(
    body && typeof body === "object"
      ? (body as { visitorId?: unknown }).visitorId
      : null,
  );

  if (!visitorId) {
    return json({ error: "invalid_visitor_id" }, 400);
  }

  const db = env.visitorsCounter;
  if (!db) {
    return json({ error: "counter_unavailable" }, 503);
  }

  try {
    const [ , selectResult, countResult] = await db.batch([
      db.prepare(INSERT_VISITOR).bind(visitorId),
      db.prepare(SELECT_VISITOR).bind(visitorId),
      db.prepare(COUNT_VISITORS),
    ]);

    const visitorNumber = selectResult.results?.[0]?.visitor_number;
    const totalVisitors = countResult.results?.[0]?.total;

    if (typeof visitorNumber !== "number") {
      return json({ error: "counter_unavailable" }, 500);
    }

    return json({
      visitorNumber,
      totalVisitors: typeof totalVisitors === "number" ? totalVisitors : null,
    });
  } catch (error) {
    console.error("visitors: database failure", error);
    return json({ error: "counter_unavailable" }, 500);
  }
}
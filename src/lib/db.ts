import Database from 'better-sqlite3';
import { sql } from '@vercel/postgres';

export type QueryParam = string | number | boolean | null;

const SQLITE_PATH = process.env.SQLITE_DB_PATH || 'dev.db';

function toPostgresQuery(query: string): string {
  let index = 0;
  return query.replace(/\?/g, () => `$${++index}`);
}

const isPostgres = () => {
  if (process.env.FORCE_SQLITE === 'true') return false;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return !!url && /postgres/i.test(url);
};

let sqliteDb: Database.Database | null = null;

function getSqliteDb() {
  if (!sqliteDb) {
    sqliteDb = new Database(SQLITE_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    runSqliteMigrations(sqliteDb);
  }
  return sqliteDb;
}

function runSqliteMigrations(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    task_goal TEXT,
    automation_level TEXT CHECK(automation_level IN ('◎', '△', '×')),
    tobe_owner TEXT CHECK(tobe_owner IN ('エージェント', '人間', '共同')),
    input_info TEXT,
    output_info TEXT,
    data_standard TEXT,
    trigger_event TEXT,
    asis_owner TEXT,
    agent_capability TEXT,
    tools_systems TEXT,
    exception_cases TEXT,
    error_handling TEXT,
    target_time INTEGER,
    target_time_unit TEXT CHECK(target_time_unit IN ('秒', '分', '時間')),
    confidentiality TEXT CHECK(confidentiality IN ('高', '中', '低')),
    audit_log_required BOOLEAN,
    learning_mechanism TEXT,
    kpi_metrics TEXT,
    cost_benefit REAL,
    comments TEXT,
    priority TEXT CHECK(priority IN ('高', '中', '低')) DEFAULT '中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS task_dependencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    depends_on_task_id INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id)
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS quick_memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    task_name TEXT,
    memo_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );`);
}

async function runPostgresMigrations() {
  await sql`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_name TEXT NOT NULL,
    task_goal TEXT,
    automation_level TEXT CHECK(automation_level IN ('◎', '△', '×')),
    tobe_owner TEXT CHECK(tobe_owner IN ('エージェント', '人間', '共同')),
    input_info TEXT,
    output_info TEXT,
    data_standard TEXT,
    trigger_event TEXT,
    asis_owner TEXT,
    agent_capability TEXT,
    tools_systems TEXT,
    exception_cases TEXT,
    error_handling TEXT,
    target_time INTEGER,
    target_time_unit TEXT CHECK(target_time_unit IN ('秒', '分', '時間')),
    confidentiality TEXT CHECK(confidentiality IN ('高', '中', '低')),
    audit_log_required BOOLEAN,
    learning_mechanism TEXT,
    kpi_metrics TEXT,
    cost_benefit REAL,
    comments TEXT,
    priority TEXT CHECK(priority IN ('高', '中', '低')) DEFAULT '中',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`;
  await sql`CREATE TABLE IF NOT EXISTS task_dependencies (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    depends_on_task_id INTEGER NOT NULL REFERENCES tasks(id)
  );`;
  await sql`CREATE TABLE IF NOT EXISTS quick_memos (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    task_name TEXT,
    memo_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  );`;
}

export async function queryAll<T = unknown>(query: string, params: QueryParam[] = []): Promise<T[]> {
  if (isPostgres()) {
    await runPostgresMigrations();
    const text = toPostgresQuery(query);
    const result = await sql.query(text, params);
    return result.rows as T[];
  }
  const db = getSqliteDb();
  const statement = db.prepare(query);
  return statement.all(params) as T[];
}

export async function queryGet<T = unknown>(query: string, params: QueryParam[] = []): Promise<T | undefined> {
  const results = await queryAll<T>(query, params);
  return results[0];
}

export async function execute(query: string, params: QueryParam[] = []): Promise<void> {
  if (isPostgres()) {
    await runPostgresMigrations();
    const text = toPostgresQuery(query);
    await sql.query(text, params);
    return;
  }
  const db = getSqliteDb();
  const statement = db.prepare(query);
  statement.run(params);
}

export async function executeAndReturnId(query: string, params: QueryParam[] = []): Promise<number> {
  if (isPostgres()) {
    await runPostgresMigrations();
    const text = toPostgresQuery(`${query} RETURNING id`);
    const result = await sql.query(text, params);
    const [row] = result.rows as { id: number }[];
    return row?.id ?? 0;
  }
  const db = getSqliteDb();
  const statement = db.prepare(query);
  const info = statement.run(params);
  return Number(info.lastInsertRowid);
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  if (isPostgres()) {
    await runPostgresMigrations();
    await sql`BEGIN`;
    try {
      const result = await fn();
      await sql`COMMIT`;
      return result;
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  }
  // better-sqlite3 transactions are synchronous, so fall back to executing the
  // callback directly for async flows. Individual statements remain atomic.
  return fn();
}

import { CapacitorSQLite, SQLiteConnection, type SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

type QueryRow = Record<string, unknown>;

const DB_NAME = 'gestao_pessoal_v2';
let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;

const schema = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    category_id TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    due_date TEXT,
    is_done INTEGER NOT NULL,
    done_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS list_items (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT NOT NULL,
    text TEXT NOT NULL,
    is_done INTEGER NOT NULL,
    done_at TEXT,
    sort_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`
];

export function isNativePlatform() {
  return Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
}

export async function getNativeDb() {
  if (!isNativePlatform()) {
    throw new Error('SQLite nativo indisponível fora do iOS/Android.');
  }

  if (db) return db;
  if (!sqlite) sqlite = new SQLiteConnection(CapacitorSQLite);

  const consistency = await sqlite.checkConnectionsConsistency();
  const hasConnection = (await sqlite.isConnection(DB_NAME, false)).result;
  db = consistency.result && hasConnection
    ? await sqlite.retrieveConnection(DB_NAME, false)
    : await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);

  await db.open();
  for (const statement of schema) {
    await db.execute(statement);
  }
  return db;
}

export async function nativeRun(statement: string, values: unknown[] = []) {
  const connection = await getNativeDb();
  await connection.run(statement, values);
}

export async function nativeQuery<T extends QueryRow>(statement: string, values: unknown[] = []) {
  const connection = await getNativeDb();
  const result = await connection.query(statement, values);
  return (result.values ?? []) as T[];
}

export async function resetNativeDb() {
  const connection = await getNativeDb();
  for (const table of ['transactions', 'categories', 'reminders', 'lists', 'list_items']) {
    await connection.execute(`DELETE FROM ${table};`);
  }
}

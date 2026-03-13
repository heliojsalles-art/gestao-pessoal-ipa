import type { AppBackup, Category, Reminder, Transaction, UserList, UserListItem } from '../types/models';
import { getNativeDb, isNativePlatform, nativeQuery, nativeRun, resetNativeDb } from './native-sqlite';

const FALLBACK_KEY = 'gestao-pessoal-db-v2';

const emptyBackup: AppBackup = {
  version: 2,
  exportedAt: new Date().toISOString(),
  categories: [],
  transactions: [],
  reminders: [],
  lists: [],
  listItems: [],
};

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: row.kind as 'income' | 'expense',
    color: String(row.color),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    type: row.type as 'income' | 'expense',
    amount: Number(row.amount),
    description: String(row.description),
    categoryId: String(row.category_id),
    date: String(row.date),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapReminder(row: Record<string, unknown>): Reminder {
  return {
    id: String(row.id),
    title: String(row.title),
    notes: row.notes ? String(row.notes) : undefined,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    isDone: Number(row.is_done) === 1,
    doneAt: row.done_at ? String(row.done_at) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapList(row: Record<string, unknown>): UserList {
  return {
    id: String(row.id),
    name: String(row.name),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapListItem(row: Record<string, unknown>): UserListItem {
  return {
    id: String(row.id),
    listId: String(row.list_id),
    text: String(row.text),
    isDone: Number(row.is_done) === 1,
    doneAt: row.done_at ? String(row.done_at) : undefined,
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function readFallback(): AppBackup {
  const raw = localStorage.getItem(FALLBACK_KEY);
  return raw ? JSON.parse(raw) as AppBackup : emptyBackup;
}

function writeFallback(data: AppBackup) {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
}

export async function readDb(): Promise<AppBackup> {
  if (!isNativePlatform()) {
    return readFallback();
  }

  await getNativeDb();
  const [categories, transactions, reminders, lists, listItems] = await Promise.all([
    nativeQuery('SELECT * FROM categories ORDER BY kind, name;'),
    nativeQuery('SELECT * FROM transactions ORDER BY date DESC, created_at DESC;'),
    nativeQuery('SELECT * FROM reminders ORDER BY created_at DESC;'),
    nativeQuery('SELECT * FROM lists ORDER BY updated_at DESC;'),
    nativeQuery('SELECT * FROM list_items ORDER BY list_id, sort_order ASC;'),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories: categories.map(mapCategory),
    transactions: transactions.map(mapTransaction),
    reminders: reminders.map(mapReminder),
    lists: lists.map(mapList),
    listItems: listItems.map(mapListItem),
  };
}

export async function replaceDb(data: AppBackup) {
  if (!isNativePlatform()) {
    writeFallback(data);
    return;
  }

  await resetNativeDb();

  for (const item of data.categories) {
    await nativeRun(
      'INSERT INTO categories (id, name, kind, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);',
      [item.id, item.name, item.kind, item.color, item.createdAt, item.updatedAt],
    );
  }
  for (const item of data.transactions) {
    await nativeRun(
      'INSERT INTO transactions (id, type, amount, description, category_id, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [item.id, item.type, item.amount, item.description, item.categoryId, item.date, item.notes ?? null, item.createdAt, item.updatedAt],
    );
  }
  for (const item of data.reminders) {
    await nativeRun(
      'INSERT INTO reminders (id, title, notes, due_date, is_done, done_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [item.id, item.title, item.notes ?? null, item.dueDate ?? null, item.isDone ? 1 : 0, item.doneAt ?? null, item.createdAt, item.updatedAt],
    );
  }
  for (const item of data.lists) {
    await nativeRun(
      'INSERT INTO lists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?);',
      [item.id, item.name, item.createdAt, item.updatedAt],
    );
  }
  for (const item of data.listItems) {
    await nativeRun(
      'INSERT INTO list_items (id, list_id, text, is_done, done_at, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      [item.id, item.listId, item.text, item.isDone ? 1 : 0, item.doneAt ?? null, item.sortOrder, item.createdAt, item.updatedAt],
    );
  }
}

export async function seedIfEmpty(data: AppBackup) {
  const current = await readDb();
  if (current.categories.length || current.transactions.length || current.reminders.length || current.lists.length) return;
  await replaceDb(data);
}

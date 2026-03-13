import { readDb, replaceDb } from '../../db/storage';
import type { EntryKind, Transaction } from '../../types/models';
import { nowIso } from '../../utils/date';
import { createId } from '../../utils/ids';

export async function listTransactions() {
  const db = await readDb();
  return [...db.transactions].sort((a, b) => b.date.localeCompare(a.date));
}

export async function createTransaction(input: {
  type: EntryKind;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  notes?: string;
}) {
  const db = await readDb();
  const now = nowIso();
  const transaction: Transaction = { id: createId('txn'), createdAt: now, updatedAt: now, ...input };
  db.transactions.unshift(transaction);
  await replaceDb(db);
  return transaction;
}

export async function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
  const db = await readDb();
  db.transactions = db.transactions.map((item) => item.id === id ? { ...item, ...updates, updatedAt: nowIso() } : item);
  await replaceDb(db);
}

export async function deleteTransaction(id: string) {
  const db = await readDb();
  db.transactions = db.transactions.filter((item) => item.id !== id);
  await replaceDb(db);
}

export async function getFinanceSummary() {
  const transactions = await listTransactions();
  const income = transactions.filter((item) => item.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  return { income, expense, balance: income - expense };
}

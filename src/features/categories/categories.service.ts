import { readDb, replaceDb } from '../../db/storage';
import type { Category, EntryKind } from '../../types/models';
import { nowIso } from '../../utils/date';
import { createId } from '../../utils/ids';

export async function listCategories(kind?: EntryKind) {
  const db = await readDb();
  const items = kind ? db.categories.filter((item) => item.kind === kind) : db.categories;
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function createCategory(input: Pick<Category, 'name' | 'kind' | 'color'>) {
  const db = await readDb();
  const now = nowIso();
  const category: Category = { id: createId('cat'), createdAt: now, updatedAt: now, ...input };
  db.categories.push(category);
  await replaceDb(db);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'color'>>) {
  const db = await readDb();
  db.categories = db.categories.map((item) => item.id === id ? { ...item, ...updates, updatedAt: nowIso() } : item);
  await replaceDb(db);
}

export async function deleteCategory(id: string, replacementCategoryId?: string) {
  const db = await readDb();
  const inUse = db.transactions.some((item) => item.categoryId === id);
  if (inUse && !replacementCategoryId) {
    throw new Error('Essa categoria já está em uso. Escolha uma substituta antes de excluir.');
  }
  if (replacementCategoryId) {
    db.transactions = db.transactions.map((item) => item.categoryId === id ? { ...item, categoryId: replacementCategoryId, updatedAt: nowIso() } : item);
  }
  db.categories = db.categories.filter((item) => item.id !== id);
  await replaceDb(db);
}

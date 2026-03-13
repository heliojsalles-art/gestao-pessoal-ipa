import { readDb, replaceDb } from '../../db/storage';
import type { UserList, UserListItem } from '../../types/models';
import { nowIso } from '../../utils/date';
import { createId } from '../../utils/ids';

export async function listLists() {
  const db = await readDb();
  return db.lists.map((list) => ({
    ...list,
    items: db.listItems.filter((item) => item.listId === list.id).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

export async function createList(name: string) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Informe um nome para a lista.');

  const db = await readDb();
  const now = nowIso();
  const list: UserList = { id: createId('list'), name: cleanName, createdAt: now, updatedAt: now };
  db.lists.unshift(list);
  await replaceDb(db);
  return list;
}

export async function renameList(listId: string, name: string) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Informe um nome para a lista.');

  const db = await readDb();
  const now = nowIso();
  db.lists = db.lists.map((list) => (list.id === listId ? { ...list, name: cleanName, updatedAt: now } : list));
  await replaceDb(db);
}

export async function deleteList(listId: string) {
  const db = await readDb();
  db.lists = db.lists.filter((list) => list.id !== listId);
  db.listItems = db.listItems.filter((item) => item.listId !== listId);
  await replaceDb(db);
}

export async function addListItem(listId: string, text: string) {
  const cleanText = text.trim();
  if (!cleanText) throw new Error('Informe um item para adicionar.');

  const db = await readDb();
  const now = nowIso();
  const sortOrder = db.listItems.filter((item) => item.listId === listId).length + 1;
  const item: UserListItem = { id: createId('item'), listId, text: cleanText, isDone: false, sortOrder, createdAt: now, updatedAt: now };
  db.listItems.push(item);
  db.lists = db.lists.map((list) => (list.id === listId ? { ...list, updatedAt: now } : list));
  await replaceDb(db);
  return item;
}

export async function toggleListItem(id: string) {
  const db = await readDb();
  const now = nowIso();
  db.listItems = db.listItems.map((item) => item.id === id ? { ...item, isDone: !item.isDone, doneAt: !item.isDone ? now : undefined, updatedAt: now } : item);
  await replaceDb(db);
}

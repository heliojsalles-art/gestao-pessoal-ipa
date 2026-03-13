import { readDb, replaceDb } from '../../db/storage';
import type { Reminder } from '../../types/models';
import { isOlderThanHours, nowIso } from '../../utils/date';
import { createId } from '../../utils/ids';

async function cleanup() {
  const db = await readDb();
  const next = db.reminders.filter((item) => !(item.isDone && isOlderThanHours(item.doneAt, 6)));
  if (next.length !== db.reminders.length) {
    db.reminders = next;
    await replaceDb(db);
  }
}

export async function listReminders() {
  await cleanup();
  const db = await readDb();
  return [...db.reminders].sort((a, b) => Number(a.isDone) - Number(b.isDone));
}

export async function createReminder(input: Pick<Reminder, 'title' | 'notes' | 'dueDate'>) {
  const db = await readDb();
  const now = nowIso();
  const reminder: Reminder = {
    id: createId('rem'),
    title: input.title,
    notes: input.notes,
    dueDate: input.dueDate,
    isDone: false,
    createdAt: now,
    updatedAt: now,
  };
  db.reminders.unshift(reminder);
  await replaceDb(db);
  return reminder;
}

export async function toggleReminder(id: string) {
  const db = await readDb();
  db.reminders = db.reminders.map((item) => {
    if (item.id !== id) return item;
    const nextDone = !item.isDone;
    return { ...item, isDone: nextDone, doneAt: nextDone ? nowIso() : undefined, updatedAt: nowIso() };
  });
  await replaceDb(db);
}

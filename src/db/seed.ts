import type { AppBackup } from '../types/models';
import { nowIso } from '../utils/date';
import { createId } from '../utils/ids';

const now = nowIso();
const salaryId = createId('cat');
const salesId = createId('cat');
const foodId = createId('cat');
const transportId = createId('cat');
const marketListId = createId('list');

export const seedData: AppBackup = {
  version: 2,
  exportedAt: now,
  categories: [
    { id: salaryId, name: 'Salário', kind: 'income', color: '#166534', createdAt: now, updatedAt: now },
    { id: salesId, name: 'Extras', kind: 'income', color: '#0369a1', createdAt: now, updatedAt: now },
    { id: foodId, name: 'Alimentação', kind: 'expense', color: '#dc2626', createdAt: now, updatedAt: now },
    { id: transportId, name: 'Transporte', kind: 'expense', color: '#7c3aed', createdAt: now, updatedAt: now },
  ],
  transactions: [
    { id: createId('txn'), type: 'income', amount: 3200, description: 'Recebimento principal', categoryId: salaryId, date: now, createdAt: now, updatedAt: now },
    { id: createId('txn'), type: 'expense', amount: 58.9, description: 'Mercado', categoryId: foodId, date: now, createdAt: now, updatedAt: now },
  ],
  reminders: [
    { id: createId('rem'), title: 'Separar contas da semana', notes: 'Ver entradas e saídas', isDone: false, createdAt: now, updatedAt: now },
  ],
  lists: [
    { id: marketListId, name: 'Mercado', createdAt: now, updatedAt: now },
  ],
  listItems: [
    { id: createId('item'), listId: marketListId, text: 'Arroz', isDone: false, sortOrder: 1, createdAt: now, updatedAt: now },
    { id: createId('item'), listId: marketListId, text: 'Feijão', isDone: false, sortOrder: 2, createdAt: now, updatedAt: now },
  ],
};

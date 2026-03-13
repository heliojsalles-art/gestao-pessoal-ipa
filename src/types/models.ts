export type EntryKind = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  kind: EntryKind;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: EntryKind;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  isDone: boolean;
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListItem {
  id: string;
  listId: string;
  text: string;
  isDone: boolean;
  doneAt?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppBackup {
  version: 2;
  exportedAt: string;
  categories: Category[];
  transactions: Transaction[];
  reminders: Reminder[];
  lists: UserList[];
  listItems: UserListItem[];
}

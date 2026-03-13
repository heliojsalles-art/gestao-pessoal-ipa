import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { listCategories } from '../features/categories/categories.service';
import { createTransaction, deleteTransaction, getFinanceSummary, listTransactions, updateTransaction } from '../features/finance/finance.service';
import type { Category, EntryKind, Transaction } from '../types/models';
import { formatCurrency, formatDate, nowIso } from '../utils/date';

const emptyForm = {
  id: '',
  type: 'expense' as EntryKind,
  amount: '',
  description: '',
  categoryId: '',
  date: nowIso().slice(0, 10),
  notes: '',
};

export function FinancePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [form, setForm] = useState(emptyForm);

  async function load(preserveType?: EntryKind) {
    const [allCategories, allTransactions, financeSummary] = await Promise.all([
      listCategories(),
      listTransactions(),
      getFinanceSummary(),
    ]);
    setCategories(allCategories);
    setTransactions(allTransactions);
    setSummary(financeSummary);
    const currentType = preserveType ?? form.type;
    const fallback = allCategories.find((item) => item.kind === currentType)?.id ?? '';
    setForm((current) => ({ ...current, categoryId: current.categoryId && allCategories.some((item) => item.id === current.categoryId) ? current.categoryId : fallback }));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const fallback = categories.find((item) => item.kind === form.type)?.id ?? '';
    setForm((current) => ({ ...current, categoryId: fallback }));
  }, [form.type]);

  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter((item) => item.type === 'expense');
    return categories
      .filter((item) => item.kind === 'expense')
      .map((category) => ({
        name: category.name,
        color: category.color,
        value: expenseTransactions.filter((item) => item.categoryId === category.id).reduce((acc, item) => acc + item.amount, 0),
      }))
      .filter((item) => item.value > 0);
  }, [categories, transactions]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      description: form.description,
      categoryId: form.categoryId,
      date: new Date(form.date).toISOString(),
      notes: form.notes || undefined,
    };
    if (form.id) {
      await updateTransaction(form.id, payload);
    } else {
      await createTransaction(payload);
    }
    setForm({ ...emptyForm, type: form.type, categoryId: categories.find((item) => item.kind === form.type)?.id ?? '' });
    await load(form.type);
  }

  function startEdit(item: Transaction) {
    setForm({
      id: item.id,
      type: item.type,
      amount: String(item.amount),
      description: item.description,
      categoryId: item.categoryId,
      date: item.date.slice(0, 10),
      notes: item.notes ?? '',
    });
  }

  return (
    <>
      <PageHeader title="Finanças" subtitle="Entradas, saídas, gráficos e edição de lançamentos" right={<Link className="btn secondary" to="/financas/categorias">Categorias</Link>} />
      <div className="grid cards">
        <div className="card glass wallet-card"><div className="label">Saldo</div><div className="value">{formatCurrency(summary.balance)}</div></div>
        <div className="card glass wallet-card"><div className="label">Entradas</div><div className="value amount-income">{formatCurrency(summary.income)}</div></div>
        <div className="card glass wallet-card"><div className="label">Saídas</div><div className="value amount-expense">{formatCurrency(summary.expense)}</div></div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card glass wallet-card">
          <div className="section-head"><div><h3>{form.id ? 'Editar lançamento' : 'Novo lançamento'}</h3><p>Crie, edite ou atualize movimentações sem sair da tela.</p></div></div>
          <form className="form-grid" onSubmit={submit}>
            <div className="form-grid two">
              <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EntryKind })}>
                <option value="income">Entrada</option>
                <option value="expense">Saída</option>
              </select>
              <input className="input" type="number" step="0.01" value={form.amount} placeholder="Valor" onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div className="form-grid two">
              <input className="input" value={form.description} placeholder="Descrição" onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              {categories.filter((item) => item.kind === form.type).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <textarea className="textarea" value={form.notes} placeholder="Observações opcionais" onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="row">
              <button className="btn primary" type="submit">{form.id ? 'Salvar alterações' : 'Salvar lançamento'}</button>
              {form.id ? <button className="btn secondary" type="button" onClick={() => setForm({ ...emptyForm, type: 'expense', categoryId: categories.find((item) => item.kind === 'expense')?.id ?? '' })}>Cancelar edição</button> : null}
            </div>
          </form>
        </div>

        <div className="card glass wallet-card">
          <div className="section-head"><div><h3>Gastos por categoria</h3><p>Visão rápida para entender onde o dinheiro está indo.</p></div></div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={82}>
                  {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass wallet-card">
          <div className="section-head"><div><h3>Lançamentos</h3><p>Seu histórico recente com edição e exclusão.</p></div></div>
          <div className="list">
            {transactions.map((item) => {
              const category = categories.find((category) => category.id === item.categoryId);
              return (
                <div className="item ledger-item" key={item.id}>
                  <div className="row align-start">
                    <div>
                      <strong>{item.description}</strong>
                      <div className="small">{category?.name} • {formatDate(item.date)}</div>
                      {item.notes ? <div className="small">{item.notes}</div> : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={item.type === 'income' ? 'amount-income' : 'amount-expense'}>{formatCurrency(item.amount)}</div>
                      <div className="row compact">
                        <button className="btn ghost" onClick={() => startEdit(item)}>Editar</button>
                        <button className="btn ghost danger-text" onClick={() => deleteTransaction(item.id).then(() => load())}>Excluir</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { bootstrapDb } from '../db/bootstrap';
import { listCategories } from '../features/categories/categories.service';
import { getFinanceSummary, listTransactions } from '../features/finance/finance.service';
import { listLists } from '../features/lists/lists.service';
import { listReminders } from '../features/reminders/reminders.service';
import type { Category, Transaction } from '../types/models';
import { formatCurrency } from '../utils/date';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function HomePage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [pendingReminders, setPendingReminders] = useState(0);
  const [listsCount, setListsCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      await bootstrapDb();
      const [financeSummary, reminders, lists, allTransactions, allCategories] = await Promise.all([
        getFinanceSummary(),
        listReminders(),
        listLists(),
        listTransactions(),
        listCategories(),
      ]);
      setSummary(financeSummary);
      setPendingReminders(reminders.filter((item) => !item.isDone).length);
      setListsCount(lists.length);
      setTransactions(allTransactions);
      setCategories(allCategories);
    })();
  }, []);

  const monthlyChart = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const base = MONTHS.map((name) => ({ name, entradas: 0, saídas: 0 }));

    transactions.forEach((item) => {
      const date = new Date(item.date);
      if (date.getFullYear() !== currentYear) return;
      const monthIndex = date.getMonth();
      if (item.type === 'income') {
        base[monthIndex].entradas += item.amount;
      } else {
        base[monthIndex].saídas += item.amount;
      }
    });

    return base;
  }, [transactions]);

  const highlightCategory = useMemo(() => {
    const expenseTotals = new Map<string, number>();
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => expenseTotals.set(item.categoryId, (expenseTotals.get(item.categoryId) ?? 0) + item.amount));

    const [categoryId, total] = [...expenseTotals.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    const category = categories.find((item) => item.id === categoryId);

    return {
      name: category?.name ?? 'Sem destaque',
      color: category?.color ?? '#94a3b8',
      total: total ?? 0,
    };
  }, [categories, transactions]);

  return (
    <>
      <PageHeader
        title="Gestão Pessoal"
        subtitle="Seu painel diário com finanças, lembretes e listas em um visual premium"
      />

      <div className="grid cards hero-cards">
        <div className="card glass wallet-card stat-card stat-card-balance">
          <div className="label">Saldo</div>
          <div className="value">{formatCurrency(summary.balance)}</div>
          <div className="small">Visão geral atual</div>
        </div>
        <div className="card glass wallet-card stat-card">
          <div className="label">Entradas</div>
          <div className="value amount-income">{formatCurrency(summary.income)}</div>
          <div className="small">Total registrado</div>
        </div>
        <div className="card glass wallet-card stat-card">
          <div className="label">Saídas</div>
          <div className="value amount-expense">{formatCurrency(summary.expense)}</div>
          <div className="small">Total registrado</div>
        </div>
      </div>

      <div className="grid cards secondary-cards" style={{ marginTop: 16 }}>
        <div className="card glass wallet-card compact-card">
          <div className="row align-start">
            <div>
              <div className="label">Lembretes pendentes</div>
              <div className="value value-compact">{pendingReminders}</div>
            </div>
            <span className="status-orb orb-blue" />
          </div>
        </div>
        <div className="card glass wallet-card compact-card">
          <div className="row align-start">
            <div>
              <div className="label">Listas ativas</div>
              <div className="value value-compact">{listsCount}</div>
            </div>
            <span className="status-orb orb-green" />
          </div>
        </div>
        <div className="card glass wallet-card compact-card">
          <div className="row align-start">
            <div>
              <div className="label">Maior gasto</div>
              <div className="value value-compact">{highlightCategory.name}</div>
              <div className="small">{formatCurrency(highlightCategory.total)}</div>
            </div>
            <span className="status-orb" style={{ background: highlightCategory.color }} />
          </div>
        </div>
      </div>

      <div className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <div className="card glass wallet-card chart-card">
          <div className="section-head">
            <div>
              <h3>Dashboard mensal</h3>
              <p>Entradas e saídas ao longo do ano</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.22)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `R$${value}`} tickLine={false} axisLine={false} width={46} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="entradas" radius={[10, 10, 0, 0]} fill="rgba(34, 197, 94, 0.82)" />
                <Bar dataKey="saídas" radius={[10, 10, 0, 0]} fill="rgba(239, 68, 68, 0.78)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass wallet-card tip-card">
          <div className="section-head">
            <div>
              <h3>Hoje</h3>
              <p>Resumo rápido do que merece atenção</p>
            </div>
          </div>
          <div className="tip-list">
            <div className="tip-row">
              <span className="tip-dot orb-blue" />
              <div>
                <strong>{pendingReminders} lembrete(s) pendente(s)</strong>
                <div className="small">Toque em Lembretes para concluir ou reagendar.</div>
              </div>
            </div>
            <div className="tip-row">
              <span className="tip-dot orb-green" />
              <div>
                <strong>{listsCount} lista(s) ativa(s)</strong>
                <div className="small">Ideal para mercado, tarefas e compras rápidas.</div>
              </div>
            </div>
            <div className="tip-row">
              <span className="tip-dot" style={{ background: highlightCategory.color }} />
              <div>
                <strong>{highlightCategory.name}</strong>
                <div className="small">Categoria com mais gasto até agora.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

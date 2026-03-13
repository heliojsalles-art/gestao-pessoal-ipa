import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { createReminder, listReminders, toggleReminder } from '../features/reminders/reminders.service';
import type { Reminder } from '../types/models';

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  async function load() {
    setReminders(await listReminders());
  }

  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await createReminder({ title, notes, dueDate: undefined });
    setTitle('');
    setNotes('');
    await load();
  }

  return (
    <>
      <PageHeader title="Lembretes" subtitle="Concluiu? Ele some sozinho depois de 6 horas e mantém sua tela limpa" />
      <div className="card glass wallet-card">
        <form className="form-grid" onSubmit={submit}>
          <input className="input" placeholder="Novo lembrete" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="textarea" placeholder="Observação opcional" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="btn primary" type="submit">Criar lembrete</button>
        </form>
      </div>
      <div className="card glass wallet-card" style={{ marginTop: 16 }}>
        <div className="list reminders-list">
          {reminders.map((item) => (
            <label className="item reminder-item" key={item.id}>
              <div className="row align-start">
                <div>
                  <input type="checkbox" checked={item.isDone} onChange={() => toggleReminder(item.id).then(load)} /> <strong>{item.title}</strong>
                  {item.notes ? <div className="small">{item.notes}</div> : null}
                </div>
                <span className="pill">{item.isDone ? 'Concluído' : 'Pendente'}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { addListItem, createList, deleteList, listLists, renameList, toggleListItem } from '../features/lists/lists.service';

interface ListWithItems {
  id: string;
  name: string;
  items: Array<{ id: string; text: string; isDone: boolean }>;
}

export function ListsPage() {
  const [lists, setLists] = useState<ListWithItems[]>([]);
  const [name, setName] = useState('');
  const [newItems, setNewItems] = useState<Record<string, string>>({});

  async function load() {
    setLists(await listLists() as ListWithItems[]);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    await createList(name);
    setName('');
    await load();
  }

  async function handleRename(list: ListWithItems) {
    const nextName = window.prompt('Novo nome da lista:', list.name);
    if (!nextName) return;
    await renameList(list.id, nextName);
    await load();
  }

  async function handleDelete(list: ListWithItems) {
    const confirmed = window.confirm(`Apagar a lista "${list.name}"?`);
    if (!confirmed) return;
    await deleteList(list.id);
    await load();
  }

  return (
    <>
      <PageHeader title="Listas" subtitle="Mercado, farmácia, tarefas e o que mais você quiser" />
      <div className="card glass wallet-card">
        <form className="row" onSubmit={submit}>
          <input className="input" placeholder="Nome da nova lista" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn primary" type="submit">Criar lista</button>
        </form>
      </div>
      <div className="grid surface-spacer">
        {lists.map((list) => {
          const doneCount = list.items.filter((item) => item.isDone).length;

          return (
            <div className="card glass wallet-card" key={list.id}>
              <div className="list-card-head">
                <div className="list-title-wrap">
                  <h3>{list.name}</h3>
                  <div className="list-progress">{doneCount}/{list.items.length || 0} item(ns) concluído(s)</div>
                  <div className="progress-track"><span style={{ width: `${list.items.length ? (doneCount / list.items.length) * 100 : 0}%` }} /></div>
                </div>
                <div className="list-actions">
                  <button className="btn secondary" type="button" onClick={() => handleRename(list)}>Renomear</button>
                  <button className="btn danger" type="button" onClick={() => handleDelete(list)}>Apagar</button>
                </div>
              </div>

              <div className="list">
                {list.items.length ? list.items.map((item) => (
                  <label className="item checkbox-row" key={item.id}>
                    <input type="checkbox" checked={item.isDone} onChange={() => toggleListItem(item.id).then(load)} />
                    <span>{item.text}</span>
                  </label>
                )) : <div className="small">Essa lista ainda não tem itens.</div>}
              </div>
              <form
                className="row"
                style={{ marginTop: 12 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  addListItem(list.id, newItems[list.id] || '').then(() => {
                    setNewItems((current) => ({ ...current, [list.id]: '' }));
                    load();
                  });
                }}
              >
                <input className="input" placeholder="Novo item" value={newItems[list.id] || ''} onChange={(e) => setNewItems((current) => ({ ...current, [list.id]: e.target.value }))} required />
                <button className="btn secondary" type="submit">Adicionar</button>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../features/categories/categories.service';
import type { Category, EntryKind } from '../types/models';

export function CategoriesPage() {
  const [kind, setKind] = useState<EntryKind>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0f172a');
  const [error, setError] = useState('');

  async function load() {
    setCategories(await listCategories(kind));
  }

  useEffect(() => { load(); }, [kind]);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    await createCategory({ name, kind, color });
    setName('');
    setColor('#0f172a');
    await load();
  }

  return (
    <>
      <PageHeader title="Categorias" subtitle="Você pode adicionar, editar, substituir e excluir" />
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <button className={`btn ${kind === 'income' ? 'primary' : 'secondary'}`} onClick={() => setKind('income')}>Entradas</button>
          <button className={`btn ${kind === 'expense' ? 'primary' : 'secondary'}`} onClick={() => setKind('expense')}>Saídas</button>
        </div>
        <form className="form-grid two" onSubmit={addCategory}>
          <input className="input" placeholder="Nova categoria" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" type="color" value={color} onChange={(e) => setColor(e.target.value)} required />
          <button className="btn primary" type="submit">Adicionar</button>
        </form>
        {error ? <p className="danger-text">{error}</p> : null}
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="list">
          {categories.map((item) => <CategoryRow key={item.id} category={item} siblings={categories} onSaved={load} onError={setError} />)}
        </div>
      </div>
    </>
  );
}

function CategoryRow({ category, siblings, onSaved, onError }: { category: Category; siblings: Category[]; onSaved: () => Promise<void>; onError: (value: string) => void }) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [replacement, setReplacement] = useState('');

  return (
    <div className="item">
      <div className="form-grid two">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <span className="pill"><span className="dot" style={{ background: color }} /> {category.kind === 'income' ? 'Entrada' : 'Saída'}</span>
        <div className="row compact">
          <button className="btn secondary" onClick={() => updateCategory(category.id, { name, color }).then(onSaved)}>Salvar</button>
          <select className="select compact-select" value={replacement} onChange={(e) => setReplacement(e.target.value)}>
            <option value="">Substituir por...</option>
            {siblings.filter((item) => item.id !== category.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button className="btn danger" onClick={async () => {
            try {
              await deleteCategory(category.id, replacement || undefined);
              onError('');
              await onSaved();
            } catch (error) {
              onError(error instanceof Error ? error.message : 'Erro ao excluir categoria.');
            }
          }}>Excluir</button>
        </div>
      </div>
    </div>
  );
}

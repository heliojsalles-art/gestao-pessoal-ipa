import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/', 'Início', '⌂'],
  ['/financas', 'Finanças', '◔'],
  ['/lembretes', 'Lembretes', '✓'],
  ['/listas', 'Listas', '≣'],
  ['/backup', 'Backup', '↥'],
] as const;

export function AppShell() {
  return (
    <div className="app-shell">
      <main className="container"><Outlet /></main>
      <nav className="bottom-nav">
        {items.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

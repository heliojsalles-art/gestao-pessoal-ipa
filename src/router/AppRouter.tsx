import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { BackupPage } from '../pages/BackupPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { FinancePage } from '../pages/FinancePage';
import { HomePage } from '../pages/HomePage';
import { ListsPage } from '../pages/ListsPage';
import { RemindersPage } from '../pages/RemindersPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'financas', element: <FinancePage /> },
      { path: 'financas/categorias', element: <CategoriesPage /> },
      { path: 'lembretes', element: <RemindersPage /> },
      { path: 'listas', element: <ListsPage /> },
      { path: 'backup', element: <BackupPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

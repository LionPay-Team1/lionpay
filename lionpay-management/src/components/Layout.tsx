
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h1 className="page-title">Management Console</h1>
          <div className="user-profile">
            <span>Welcome, {user?.username}</span>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

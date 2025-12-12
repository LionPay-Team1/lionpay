import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header className="top-header">
          <h1 className="page-title">Management Console</h1>
          <div className="user-profile">
            <span>Welcome, Admin</span>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

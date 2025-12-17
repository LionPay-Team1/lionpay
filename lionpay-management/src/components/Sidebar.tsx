
import { NavLink } from 'react-router-dom';
import { Users, History, LogOut, LayoutDashboard, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>LionPay Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/users" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>User Management</span>
        </NavLink>
        <NavLink to="/points/history" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
          <History size={20} />
          <span>Point History</span>
        </NavLink>
        <NavLink to="/exchange-rates" className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Coins size={20} />
          <span>Exchange Rates</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


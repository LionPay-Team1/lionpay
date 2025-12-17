import { NavLink, Link } from 'react-router-dom';
import { Users, History, LogOut, Coins, Store, Shield, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

const navItems = [
    { to: '/', icon: Home, label: '홈' },
    { to: '/users', icon: Users, label: '사용자 관리' },
    { to: '/merchants', icon: Store, label: '가맹점 관리' },
    { to: '/transactions', icon: History, label: '거래 내역' },
    { to: '/exchange-rates', icon: Coins, label: '환율 관리' },
    { to: '/admins', icon: Shield, label: '관리자 관리' },
];

export function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col">
            <div className="h-14 px-6 border-b border-border flex items-center">
                <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
                    LionPay Admin
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`
                        }
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                    onClick={logout}
                >
                    <LogOut className="h-5 w-5" />
                    <span>로그아웃</span>
                </Button>
            </div>
        </aside>
    );
}

import { Home, CreditCard, History, User } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Footer() {

    const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
        const location = useLocation();
        const path = location.pathname;
        const isActive = path === to;

        return (
            <Link to={to} className="flex flex-col items-center justify-center w-full h-full space-y-1">
                <Icon
                    className={cn(
                        "w-6 h-6 transition-colors",
                        isActive ? "text-primary-600" : "text-gray-400"
                    )}
                />
                <span
                    className={cn(
                        "text-[10px] font-medium transition-colors",
                        isActive ? "text-primary-600" : "text-gray-400"
                    )}
                >
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 pb-safe">
            <div className="flex items-center justify-around h-full max-w-md mx-auto">
                <NavItem to="/" icon={Home} label="홈" />
                <NavItem to="/charge" icon={CreditCard} label="충전" />
                <NavItem to="/history" icon={History} label="내역" />
                <NavItem to="/my" icon={User} label="MY" />
            </div>
        </nav>
    );
}

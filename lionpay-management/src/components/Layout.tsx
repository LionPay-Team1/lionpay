import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useRefresh } from '../contexts/RefreshContext';
import { Button } from '../components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
    const { triggerRefresh } = useRefresh();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        triggerRefresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card">
                    <Link to="/" className="text-lg font-semibold text-foreground hover:opacity-80 transition-opacity">
                        Management Console
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                            새로고침
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            Welcome, Admin
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

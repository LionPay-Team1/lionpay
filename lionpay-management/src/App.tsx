import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { UserList } from './pages/UserList';
import { UserDetail } from './pages/UserDetail';
import { TransactionHistory } from './pages/TransactionHistory';
import { ExchangeRates } from './pages/ExchangeRates';
import { Merchants } from './pages/Merchants';
import { AdminList } from './pages/AdminList';
import { Home } from './pages/Home';
import { RefreshProvider } from './contexts/RefreshContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <RefreshProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Home />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="users/:userId" element={<UserDetail />} />
                            <Route path="merchants" element={<Merchants />} />
                            <Route path="transactions" element={<TransactionHistory />} />
                            <Route path="exchange-rates" element={<ExchangeRates />} />
                            <Route path="admins" element={<AdminList />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </RefreshProvider>
        </AuthProvider>
    );
}

export default App;
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl shadow-gray-200/50">
                <Header />
                <main className="pt-14 pb-20 px-4 min-h-[calc(100vh-80px)]">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}

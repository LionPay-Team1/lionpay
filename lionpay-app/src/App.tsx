import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Charge from './pages/Charge';
import History from './pages/History';
import My from './pages/My';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Payment from './pages/Payment';
import { useAppStore } from './lib/store';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/charge" element={<Charge />} />
          <Route path="/history" element={<History />} />
          <Route path="/my" element={<My />} />
          <Route path="/payment" element={<Payment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

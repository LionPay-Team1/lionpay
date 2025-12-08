import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Charge from './pages/Charge';
import History from './pages/History';
import My from './pages/My';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<Layout />}>
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

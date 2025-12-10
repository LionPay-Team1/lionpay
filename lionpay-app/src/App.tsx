import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import Charge from './pages/Charge';
import History from './pages/History';
import My from './pages/My';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Payment from './pages/Payment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
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

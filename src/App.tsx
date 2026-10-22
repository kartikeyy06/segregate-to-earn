import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ClassifyPage from './pages/ClassifyPage';
import DepositPage from './pages/DepositPage';
import TokenWallet from './pages/TokenWallet';
import AnalyticsPage from './pages/AnalyticsPage';
import QRRFIDPage from './pages/QRRFIDPage';
import VerificationPage from './pages/VerificationPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><DashboardPage /></Layout>} />
      <Route path="/classify" element={<Layout><ClassifyPage /></Layout>} />
      <Route path="/deposit" element={<Layout><DepositPage /></Layout>} />
      <Route path="/wallet" element={<Layout><TokenWallet /></Layout>} />
      <Route path="/qr-rfid" element={<Layout><QRRFIDPage /></Layout>} />
      <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
      <Route path="/verification" element={<Layout><VerificationPage /></Layout>} />
    </Routes>
  );
}
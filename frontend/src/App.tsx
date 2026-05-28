import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import PixTransfer from './pages/PixTransfer';
import TransferSuccess from './pages/TransferSuccess';
import BlockchainDetails from './pages/BlockchainDetails';
import FintechDashboard from './pages/FintechDashboard';

import Layout from './components/Layout';
import SidebarLayout from './components/SidebarLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* User Flow (Consumer App) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<UserDashboard />} />
          <Route path="transfer" element={<PixTransfer />} />
          <Route path="transfer/success/:id" element={<TransferSuccess />} />
          <Route path="blockchain/:id" element={<BlockchainDetails />} />
        </Route>
        
        {/* Fintech Flow (Dashboard) */}
        <Route path="/fintech" element={<SidebarLayout />}>
          <Route index element={<FintechDashboard />} />
          <Route path="home" element={<FintechDashboard />} />
          <Route path="transactions" element={<FintechDashboard />} />
          <Route path="api" element={<FintechDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

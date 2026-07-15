import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PharmacyPage from './pages/PharmacyPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import LabPage from './pages/LabPage';
import HRPage from './pages/HRPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients"    element={<PatientsPage />} />
            <Route path="doctors"     element={<DoctorsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="pharmacy"    element={<PharmacyPage />} />
            <Route path="billing"     element={<BillingPage />} />
            <Route path="inventory"   element={<InventoryPage />} />
            <Route path="lab"         element={<LabPage />} />
            <Route path="hr"          element={<HRPage />} />
            <Route path="reports"     element={<ReportsPage />} />
            <Route path="settings"    element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

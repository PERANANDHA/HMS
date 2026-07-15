import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import NurseDashboard from './dashboards/NurseDashboard';
import PharmacistDashboard from './dashboards/PharmacistDashboard';
import LabDashboard from './dashboards/LabDashboard';
import PatientPortal from './dashboards/PatientPortal';

const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  ROLE_ADMIN:          AdminDashboard,
  ROLE_DOCTOR:         DoctorDashboard,
  ROLE_RECEPTIONIST:   ReceptionistDashboard,
  ROLE_NURSE:          NurseDashboard,
  ROLE_PHARMACIST:     PharmacistDashboard,
  ROLE_LAB_TECHNICIAN: LabDashboard,
  ROLE_PATIENT:        PatientPortal,
};

export default function Dashboard() {
  const { primaryRole } = useAuth();
  const DashComp = primaryRole ? (DASHBOARD_MAP[primaryRole] ?? AdminDashboard) : AdminDashboard;
  return <DashComp />;
}

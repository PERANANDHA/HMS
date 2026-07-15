import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const MOCK_USERS: Record<string, any> = {
  'admin@ehms.com': { password: 'admin123', name: 'Admin Anbarasan', roles: ['ROLE_ADMIN'], id: 1 },
  'doctor@ehms.com': { password: 'doctor123', name: 'Dr. Vijayakumar', roles: ['ROLE_DOCTOR'], id: 2 },
  'reception@ehms.com': { password: 'recept123', name: 'Reception Meenakshi', roles: ['ROLE_RECEPTIONIST'], id: 3 },
  'nurse@ehms.com': { password: 'nurse123', name: 'Nurse Anjali', roles: ['ROLE_NURSE'], id: 4 },
  'pharmacy@ehms.com': { password: 'pharma123', name: 'Pharma Selvam', roles: ['ROLE_PHARMACIST'], id: 5 },
  'lab@ehms.com': { password: 'lab123', name: 'Lab Tech Loganathan', roles: ['ROLE_LAB_TECHNICIAN'], id: 6 },
  'patient@ehms.com': { password: 'patient123', name: 'Patient Jeeva', roles: ['ROLE_PATIENT'], id: 7 },
};

let mockDoctors = [
  { id: 1, firstName: 'Ramesh', lastName: 'Kumar', email: 'r.kumar@ehms.com', phone: '+91 94440-12345', specialization: 'Cardiologist', department: { id: 1, name: 'Cardiology' } },
  { id: 2, firstName: 'Subhashini', lastName: 'Selvam', email: 's.selvam@ehms.com', phone: '+91 98410-67890', specialization: 'Neurologist', department: { id: 2, name: 'Neurology' } },
  { id: 3, firstName: 'Ganesan', lastName: 'Raman', email: 'g.raman@ehms.com', phone: '+91 98840-54321', specialization: 'Surgeon', department: { id: 3, name: 'General Surgery' } },
];

let mockPatients = [
  { id: 1, firstName: 'Jayakumar', lastName: 'Balan', email: 'jayakumar.balan@example.com', phone: '+91 90030-99887', gender: 'Male', dateOfBirth: '1980-05-15' },
  { id: 2, firstName: 'Janaki', lastName: 'Raman', email: 'janaki.raman@example.com', phone: '+91 99400-55667', gender: 'Female', dateOfBirth: '1992-08-20' },
  { id: 3, firstName: 'Abirami', lastName: 'Sundaram', email: 'abirami.s@example.com', phone: '+91 97900-11223', gender: 'Female', dateOfBirth: '2001-02-10' },
];

const today = new Date();
const tmrw = new Date(today); tmrw.setDate(tmrw.getDate() + 1);
const yest = new Date(today); yest.setDate(yest.getDate() - 1);

let mockAppointments = [
  { id: 1, status: 'SCHEDULED', reason: 'Routine Checkup', appointmentDate: tmrw.toISOString(), patient: { firstName: 'Jayakumar', lastName: 'Balan' }, doctor: { firstName: 'Ramesh', lastName: 'Kumar' } },
  { id: 2, status: 'COMPLETED', reason: 'Consultation', appointmentDate: yest.toISOString(), patient: { firstName: 'Janaki', lastName: 'Raman' }, doctor: { firstName: 'Subhashini', lastName: 'Selvam' } },
  { id: 3, status: 'CANCELLED', reason: 'Follow-up', appointmentDate: today.toISOString(), patient: { firstName: 'Abirami', lastName: 'Sundaram' }, doctor: { firstName: 'Ganesan', lastName: 'Raman' } },
  { id: 4, status: 'SCHEDULED', reason: 'Fever', appointmentDate: today.toISOString(), patient: { firstName: 'Jayakumar', lastName: 'Balan' }, doctor: { firstName: 'Ramesh', lastName: 'Kumar' } },
];

export default async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const { url, method, data } = config;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (url === '/auth/login' && method?.toLowerCase() === 'post') {
    const body = data ? JSON.parse(data) : {};
    const user = MOCK_USERS[body.email];

    if (user && user.password === body.password) {
      return {
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          id: user.id,
          name: user.name,
          email: body.email,
          roles: user.roles
        },
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      } as AxiosResponse;
    } else {
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Invalid email or password.' }
        },
        isAxiosError: true,
        config
      });
    }
  }

  // --- MOCK GET ENDPOINTS ---
  if (method?.toLowerCase() === 'get') {
    if (url === '/doctors') {
      return {
        data: mockDoctors,
        status: 200, statusText: 'OK', headers: config.headers as any, config
      } as AxiosResponse;
    }

    if (url === '/patients') {
      return {
        data: mockPatients,
        status: 200, statusText: 'OK', headers: config.headers as any, config
      } as AxiosResponse;
    }

    if (url === '/appointments') {
      return {
        data: mockAppointments,
        status: 200, statusText: 'OK', headers: config.headers as any, config
      } as AxiosResponse;
    }

    if (url === '/billing/stats') {
      return {
        data: {
          totalRevenue: 245000,
          paidRevenue: 180000,
          pendingRevenue: 65000,
          totalInvoices: 145,
          paidInvoices: 120,
          pendingInvoices: 25
        },
        status: 200, statusText: 'OK', headers: config.headers as any, config
      } as AxiosResponse;
    }
  }

  // --- MOCK POST ENDPOINTS ---
  if (method?.toLowerCase() === 'post') {
    if (url === '/patients') {
      const body = typeof data === 'string' ? JSON.parse(data) : (data || {});
      const newPatient = { ...body, id: mockPatients.length > 0 ? Math.max(...mockPatients.map(p => p.id)) + 1 : 1 };
      mockPatients.push(newPatient);
      return { data: newPatient, status: 201, statusText: 'Created', headers: config.headers as any, config } as AxiosResponse;
    }
    if (url === '/doctors') {
      const body = typeof data === 'string' ? JSON.parse(data) : (data || {});
      const newDoctor = {
        ...body,
        id: mockDoctors.length > 0 ? Math.max(...mockDoctors.map(d => d.id)) + 1 : 1,
        department: body.departmentName ? { id: 99, name: body.departmentName } : undefined
      };
      mockDoctors.push(newDoctor);
      return { data: newDoctor, status: 201, statusText: 'Created', headers: config.headers as any, config } as AxiosResponse;
    }
    if (url === '/appointments') {
      const body = typeof data === 'string' ? JSON.parse(data) : (data || {});
      const patient = mockPatients.find(p => p.id === body.patientId) || { firstName: 'Unknown', lastName: 'Patient' };
      const doctor = mockDoctors.find(d => d.id === body.doctorId) || { firstName: 'Unknown', lastName: 'Doctor' };
      const newAppointment = {
        ...body,
        id: mockAppointments.length > 0 ? Math.max(...mockAppointments.map(a => a.id)) + 1 : 1,
        patient,
        doctor
      };
      mockAppointments.push(newAppointment);
      return { data: newAppointment, status: 201, statusText: 'Created', headers: config.headers as any, config } as AxiosResponse;
    }
  }

  // --- MOCK PUT ENDPOINTS ---
  if (method?.toLowerCase() === 'put') {
    if (url?.startsWith('/patients/')) {
      const idStr = url.split('/').pop() || '0';
      const id = parseInt(idStr, 10);
      const body = typeof data === 'string' ? JSON.parse(data) : (data || {});
      const index = mockPatients.findIndex(p => p.id === id);
      if (index !== -1) {
        mockPatients[index] = { ...mockPatients[index], ...body };
        return { data: mockPatients[index], status: 200, statusText: 'OK', headers: config.headers as any, config } as AxiosResponse;
      }
    }
  }

  // Generic fallback for other API endpoints
  return {
    data: [],
    status: 200,
    statusText: 'OK',
    headers: config.headers as any,
    config,
  } as AxiosResponse;
}

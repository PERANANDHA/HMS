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

  // Generic fallback for other GET/POST API endpoints
  return {
    data: [], // Return empty array or object so the UI doesn't crash on map()
    status: 200,
    statusText: 'OK',
    headers: config.headers as any,
    config,
  } as AxiosResponse;
}

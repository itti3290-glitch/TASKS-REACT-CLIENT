import type { Patient, ReplacementRequest, Task, User } from './types';

// In the cloud, VITE_API_URL holds the server address. Locally it falls back to localhost.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// token is null for login and register, where the user is not signed in yet.
async function request(path: string, token: string | null, method = 'GET', body?: unknown) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('אין חיבור לשרת, נסו שוב');
  }
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}

export type AuthResponse = { token: string; user: User };

export function loginRequest(credentials: { email: string; password: string }): Promise<AuthResponse> {
  return request('/api/auth/login', null, 'POST', credentials);
}

export type NewAccount = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

export function registerRequest(account: NewAccount): Promise<AuthResponse> {
  return request('/api/auth/register', null, 'POST', account);
}

export function fetchTasks(token: string): Promise<Task[]> {
  return request('/api/tasks', token);
}

export function fetchPatientTasks(token: string, patientId: string): Promise<Task[]> {
  return request(`/api/tasks?patient=${patientId}`, token);
}

export function fetchPatients(token: string): Promise<Patient[]> {
  return request('/api/patients', token);
}

export type NewTask = {
  title: string;
  category: string;
  starts_at: string;
  duration_minutes: number | null;
  volunteers_needed: number;
  location: string;
  description: string;
  patient_id: number;
};

export function createTask(token: string, task: NewTask): Promise<Task> {
  return request('/api/tasks', token, 'POST', task);
}

export function fetchTask(token: string, taskId: string): Promise<Task> {
  return request(`/api/tasks/${taskId}`, token);
}

export function updateTask(token: string, taskId: number, task: NewTask): Promise<Task> {
  return request(`/api/tasks/${taskId}`, token, 'PUT', task);
}

export function deleteTask(token: string, taskId: number): Promise<{ message: string }> {
  return request(`/api/tasks/${taskId}`, token, 'DELETE');
}

export function signupToTask(token: string, taskId: number): Promise<{ message: string }> {
  return request(`/api/tasks/${taskId}/signup`, token, 'POST');
}

export function requestReplacement(token: string, taskId: number): Promise<{ message: string }> {
  return request(`/api/tasks/${taskId}/replacement-request`, token, 'POST');
}

export function fetchRequests(token: string): Promise<ReplacementRequest[]> {
  return request('/api/requests', token);
}

export function acceptRequest(token: string, requestId: number): Promise<{ message: string }> {
  return request(`/api/requests/${requestId}/accept`, token, 'POST');
}

export function fetchMyTasks(token: string): Promise<Task[]> {
  return request('/api/tasks?mine=true', token);
}

export type Me = User & {
  this_month_count: number;
  patients: { id: number; full_name: string }[];
};

export function fetchMe(token: string): Promise<Me> {
  return request('/api/auth/me', token);
}

export type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

export function updateMe(token: string, profile: ProfileForm): Promise<User> {
  return request('/api/me', token, 'PUT', profile);
}

export type Volunteer = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  this_month_count: number;
  patients: { id: number; full_name: string }[];
};

export function fetchVolunteers(token: string): Promise<Volunteer[]> {
  return request('/api/users', token);
}

export type NewPatient = {
  full_name: string;
  address: string;
  contact_phone: string;
  notes: string;
};

export function createPatient(token: string, patient: NewPatient): Promise<Patient> {
  return request('/api/patients', token, 'POST', patient);
}

export type NewVolunteer = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

export function createVolunteer(token: string, volunteer: NewVolunteer): Promise<User> {
  return request('/api/users', token, 'POST', volunteer);
}

export function deletePatient(token: string, patientId: number): Promise<{ message: string }> {
  return request(`/api/patients/${patientId}`, token, 'DELETE');
}

export function deleteVolunteer(token: string, userId: number): Promise<{ message: string }> {
  return request(`/api/users/${userId}`, token, 'DELETE');
}

export function addToTeam(token: string, patientId: number, userId: number): Promise<{ message: string }> {
  return request(`/api/patients/${patientId}/volunteers`, token, 'POST', { user_id: userId });
}

export function removeFromTeam(token: string, patientId: number, userId: number): Promise<{ message: string }> {
  return request(`/api/patients/${patientId}/volunteers/${userId}`, token, 'DELETE');
}

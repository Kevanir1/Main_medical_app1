export type UserRole = 'admin' | 'doctor' | 'patient' | 'receptionist';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isBlocked: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  code: 'invalid_credentials' | 'account_blocked' | 'account_not_found' | 'server_error';
  message: string;
}

export const roleLabels: Record<UserRole, string> = {
  'admin': 'Administrator',
  'doctor': 'Lekarz',
  'patient': 'Pacjent',
  'receptionist': 'Recepcjonista'
};

export const roleRedirectPaths: Record<UserRole, string> = {
  'admin': '/admin',
  'doctor': '/doctor',
  'patient': '/patient',
  'receptionist': '/reception'
};

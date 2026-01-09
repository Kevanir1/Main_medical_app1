export type UserRole = 'patient' | 'doctor' | 'admin';

export type UserStatus = 'active' | 'blocked';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface DoctorApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  birthDate: string;
  specialization: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface BlockUserData {
  userId: string;
  reason: string;
}

export interface DeleteUserData {
  userId: string;
  reason: string;
}

export interface MergeUsersData {
  primaryUserId: string;
  secondaryUserId: string;
}

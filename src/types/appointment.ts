export interface Appointment {
  id: number;
  patientId: number | string;
  doctorId: number | string;
  availabilityId?: number | string;
  appointmentDate: string; // ISO
  status: AppointmentStatus;
  createdAt?: string;
}

export interface Specialty {
  key: string;
  label: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface TimeSlot {
  id: number | string;
  doctorId: number | string;
  isAvailable: boolean;
  startTime: string; // ISO
  endTime: string; // ISO
}

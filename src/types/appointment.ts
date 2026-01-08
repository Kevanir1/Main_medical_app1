export interface Appointment {
  id: number | string;
  patientId: number | string;
  doctorId: number | string;
  availabilityId?: number | string;
  appointmentDate: string; // ISO
  status: string;
  createdAt?: string;
}

export interface Specialty {
  key: string;
  label: string;
}

export interface TimeSlot {
  id: number | string;
  doctorId: number | string;
  isAvailable: boolean;
  startTime: string; // ISO
  endTime: string; // ISO
}

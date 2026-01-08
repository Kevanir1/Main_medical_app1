export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  phone: string;
  email?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: VisitType;
  status: VisitStatus;
  notes?: string;
  reason: string;
}

export type VisitType = 'consultation' | 'follow-up' | 'procedure' | 'emergency';

export type VisitStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export const visitTypeLabels: Record<VisitType, string> = {
  'consultation': 'Konsultacja',
  'follow-up': 'Kontrolna',
  'procedure': 'Zabieg',
  'emergency': 'Nagły przypadek'
};

export const visitStatusLabels: Record<VisitStatus, string> = {
  'scheduled': 'Zaplanowana',
  'in-progress': 'W trakcie',
  'completed': 'Zakończona',
  'cancelled': 'Anulowana',
  'no-show': 'Nieobecność'
};

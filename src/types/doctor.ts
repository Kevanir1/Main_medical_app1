export interface DoctorRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  passportNumber?: string;
  birthDate: string;
  specialization: string;
}

export const SPECIALIZATIONS = [
  'Kardiologia',
  'Neurologia',
  'Pediatria',
  'Dermatologia',
  'Ortopedia',
  'Ginekologia',
  'Urologia',
  'Okulistyka',
  'Laryngologia',
  'Psychiatria',
  'Chirurgia ogólna',
  'Medycyna rodzinna',
  'Internista',
  'Radiologia',
  'Anestezjologia',
] as const;

export type Specialization = typeof SPECIALIZATIONS[number];

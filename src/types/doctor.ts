export interface DoctorRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  specialization: Specialization;
  password: string;
  licenseNumber: string;
}

export type DoctorInfo = {
  firstName: string;
  lastName: string;
  email: string;
  doctorId: string;
  specialization: Specialization;
  licenseNumber: string;
}

export const specializations = {
    'KARDIOLOGIA': 'cardiology',
    'DERMATOLOGIA': 'dermatology',
    'NEUROLOGIA': 'neurology',
    'PEDIATRIA': 'pediatrics',
    'OKULISTYKA': 'ophthalmology',
    'ORTOPEDIA': 'orthopedics',
    'PSYCHIATRIA': 'psychiatry',
    'REUMATOLOGIA': 'rheumatology',
    'GINEKOLOGIA': 'gynecology',
    "ONKOLOGIA": 'oncology',
    'MEDYCYNA_RODZINNA': 'general_medicine'
}

export const specializationToLabel: Record<Specialization, string> = {
  cardiology: 'Kardiologia',
  dermatology: 'Dermatologia',
  neurology: 'Neurologia',
  pediatrics: 'Pediatria',
  ophthalmology: 'Okulistyka',
  orthopedics: 'Ortopedia',
  psychiatry: 'Psychiatria',
  rheumatology: 'Reumatologia',
  gynecology: 'Ginekologia',
  oncology: 'Onkologia',
  general_medicine: 'Medycyna rodzinna'
}

export type Specialization = typeof specializations[keyof typeof specializations];
export interface DoctorRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pesel: string;
  passportNumber?: string;
  birthDate: string;
  specialization: string;
  password: string;
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


  export type Specialization = typeof specializations[keyof typeof specializations];

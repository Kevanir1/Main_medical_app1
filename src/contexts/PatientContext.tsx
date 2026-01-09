import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getUpcomingAppointmentsByPatient, getPastAppointmentsByPatient } from '@/lib/medical-api/appointment';

export interface PatientProfile {
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  phone: string;
  email: string;
}

export interface BookedSlot {
  doctorId: string;
  date: string;
  time: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  availability_id: number;
  appointment_date: string;
  status: string;
  created_at: string;
  doctor?: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

interface PatientContextType {
  profile: PatientProfile;
  setProfile: (profile: PatientProfile) => void;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  isLoading: boolean;
  refreshAppointments: () => Promise<void>;
}

const defaultProfile: PatientProfile = {
  firstName: '',
  lastName: '',
  pesel: '',
  birthDate: '',
  phone: '',
  email: ''
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAppointments = async () => {
    const patientId = localStorage.getItem('patient_id');
    if (!patientId) return;

    setIsLoading(true);
    try {
      const [upcomingRes, pastRes] = await Promise.all([
        getUpcomingAppointmentsByPatient(Number(patientId)),
        getPastAppointmentsByPatient(Number(patientId))
      ]);

      if (upcomingRes?.appointments) {
        setUpcomingAppointments(upcomingRes.appointments);
      }
      if (pastRes?.appointments) {
        setPastAppointments(pastRes.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAppointments();
  }, []);

  return (
    <PatientContext.Provider value={{
      profile,
      setProfile,
      upcomingAppointments,
      pastAppointments,
      isLoading,
      refreshAppointments
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return context;
};
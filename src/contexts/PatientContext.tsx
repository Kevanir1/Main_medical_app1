import { createContext, useContext, useState, ReactNode } from 'react';

export interface PatientProfile {
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  phone: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
}

export interface BookedSlot {
  doctorId: string;
  date: string;
  time: string;
}

interface PatientContextType {
  profile: PatientProfile;
  setProfile: (profile: PatientProfile) => void;
  bookedSlots: BookedSlot[];
  addBookedSlot: (slot: BookedSlot) => void;
  isSlotBooked: (doctorId: string, date: string, time: string) => boolean;
}

const defaultProfile: PatientProfile = {
  firstName: 'Jan',
  lastName: 'Kowalski',
  pesel: '90010112345',
  birthDate: '1990-01-01',
  phone: '123456789',
  email: 'pacjent@medapp.pl',
  street: 'ul. Przykładowa 12/3',
  postalCode: '00-001',
  city: 'Warszawa'
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<PatientProfile>(defaultProfile);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  const addBookedSlot = (slot: BookedSlot) => {
    setBookedSlots(prev => [...prev, slot]);
  };

  const isSlotBooked = (doctorId: string, date: string, time: string) => {
    return bookedSlots.some(
      slot => slot.doctorId === doctorId && slot.date === date && slot.time === time
    );
  };

  return (
    <PatientContext.Provider value={{ profile, setProfile, bookedSlots, addBookedSlot, isSlotBooked }}>
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
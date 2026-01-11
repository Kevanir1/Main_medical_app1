import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/availability/';

type CreateAvailabilityPayload = {
  doctor_Id: number;
  startTime: string; // ISO time string
  endTime: string; // ISO time string
  is_available: boolean;
}

export const createDoctorAvailability = async (payload: CreateAvailabilityPayload) => {
  return await post(BASE_PATH, payload);
}

export const getDoctorAvailability = async (doctorId: number) => {
  return await get(`${BASE_PATH}/doctor/${doctorId}`);
}

export const getAvailabilitiesBySpecializationAndDate = async (specialization: string, date: string) => {
  const url = `${BASE_PATH}?specialization=${encodeURIComponent(specialization)}&date=${encodeURIComponent(date)}`;
  
  // Debug logging in development
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.debug('[availability API] GET request:', {
      url,
      specialization,
      date
    });
  }
  
  return await get(url);
}

export const updateDoctorAvailability = async (availabilityId: number, payload: Partial<CreateAvailabilityPayload>) => {
  return await patch(`${BASE_PATH}/${availabilityId}`, payload);
}

export const deleteDoctorAvailability = async (availabilityId: number) => {
  return await del(`${BASE_PATH}/${availabilityId}`);
}


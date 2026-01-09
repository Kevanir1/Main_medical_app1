import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/availability';

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

export const updateDoctorAvailability = async (availabilityId: number, payload: Partial<CreateAvailabilityPayload>) => {
  return await patch(`${BASE_PATH}/${availabilityId}`, payload);
}

export const deleteDoctorAvailability = async (availabilityId: number) => {
  return await del(`${BASE_PATH}/${availabilityId}`);
}


import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/appointment';

type CreateAppointmentPayload = {
  patientId: number;
  doctorId: number;
  availabilityId: number;
}

export const createAppointment = async (payload: CreateAppointmentPayload) => {
  return await post(BASE_PATH, payload);
}

export const getAppointment = async (appointmentId: number) => {
  return await get(`${BASE_PATH}/${appointmentId}`);
}

export const getAppointmentsByPatient = async (patientId: number) => {
  return await get(`${BASE_PATH}/patient/${patientId}`);
}

export const getUpcomingAppointmentsByPatient = async (patientId: number) => {
  return await get(`${BASE_PATH}/patient/${patientId}/upcoming`);
}

export const getPastAppointmentsByPatient = async (patientId: number) => {
  return await get(`${BASE_PATH}/patient/${patientId}/past`);
}

export const getAppointmentsByDoctor = async (doctorId: number) => {
  return await get(`${BASE_PATH}/doctor/${doctorId}`);
}

export const completeAppointment = async (appointmentId: number) => {
  return await patch(`${BASE_PATH}/${appointmentId}/complete`);
}

export const cancelAppointment = async (appointmentId: number) => {
  return await patch(`${BASE_PATH}/${appointmentId}/cancel`);
}

export const deleteAppointment = async (appointmentId: number) => {
  return await del(`${BASE_PATH}/${appointmentId}`);
}


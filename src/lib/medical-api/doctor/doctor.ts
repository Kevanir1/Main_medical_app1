import { get, post, patch, del } from "../../apiClient"
import { Specialization } from "@/types/doctor";

type UpdateDoctorPayload = {
  first_name?: string;
  last_name?: string;
  license_number?: string;
  specialization?: Specialization;
}

const BASE_PATH = '/doctor';

export const getDoctor= async (doctorId: number) => {
  return await get(`${BASE_PATH}/${doctorId}`);
}

export const getAllSpecializations = async () => {
  return await get(`${BASE_PATH}/specializations`);
}

export const getDoctorsBySpecialization = async (specialization: string) => {
  return await get(`${BASE_PATH}/specialization/${specialization}`);
}   

export const updateDoctor = async (doctorId: number, payload: UpdateDoctorPayload) => {
  return await patch(`${BASE_PATH}/${doctorId}`, payload);
}

export const deleteDoctor = async (doctorId: number) => {
  return await del(`${BASE_PATH}/${doctorId}`);
}


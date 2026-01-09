import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/patient';

type UpdatePatientPayload = {
  first_name?: string;
  last_name?: string;
  pesel?: string;
  phone?: string;
}

export const getPatient = async (patientId: number) => {
  return await get(`${BASE_PATH}/${patientId}`);
}

export const updatePatient = async (patientId: number, payload: UpdatePatientPayload) => {
  return await patch(`${BASE_PATH}/${patientId}`, payload);
}
import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/user';

type RegisterBase = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

type RegisterUserPayload = RegisterBase & {
  pesel: string;
  phone: string;
}

type RegisterDoctorPayload = RegisterBase & {
  specialization: string;
  license_number: string;
}

export const getPendingUsers = async () => {
  return await get(`${BASE_PATH}/pending`);
}

export const getPatient = async (userId: number) => {
  return await get(`${BASE_PATH}/patient/${userId}`);
}

export const getDoctor = async (userId: number) => {
  return await get(`${BASE_PATH}/doctor/${userId}`);
}

export const registerUser = async (payload: RegisterUserPayload) => {
  return await post(`${BASE_PATH}/register`, payload);
}

export const registerDoctor = async (payload: RegisterDoctorPayload) => {
  return await post(`${BASE_PATH}/register/doctor`, payload);
}

export const activateUser = async (userId: number) => {
  return await patch(`${BASE_PATH}/${userId}/activate`);
}

export const deleteUser = async (userId: number) => {
  return await del(`${BASE_PATH}/${userId}`);
}
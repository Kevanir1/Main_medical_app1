import { get, post, patch, del } from "../apiClient"
import { UserRole } from "@/types/auth";

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

export const registerUser = async (payload: RegisterUserPayload) => {
  return await post('/user/register', payload);
}

export const registerDoctor = async (payload: RegisterDoctorPayload) => {
  return await post('/user/register/doctor', payload);
}
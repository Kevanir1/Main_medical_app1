import { get, post, patch, del } from "../apiClient"
import { UserRole } from "@/types/auth";

type RegisterPayload = {
  role: UserRole;
};

export const register = () => {
  
}
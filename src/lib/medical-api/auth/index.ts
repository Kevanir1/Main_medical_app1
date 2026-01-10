import { get, post, patch, del } from "../../apiClient"

export const login = async (email: string, password: string) => {
  const res = await post('/auth/login', { email, password });
  if (res && res.token) {
    localStorage.setItem('token', res.token);
    if (res.patient_id) localStorage.setItem('patient_id', String(res.patient_id));
    if (res.doctor_id) localStorage.setItem('doctor_id', String(res.doctor_id));
    localStorage.setItem('user_id', String(res.user_id || ''));
    localStorage.setItem('role', res.role || '');
  }
  return res;
}

export const logout = async () => {
  const res = await post('/auth/logout');

  localStorage.removeItem('token');
  localStorage.removeItem('patient_id');
  localStorage.removeItem('doctor_id');
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  return res;
}
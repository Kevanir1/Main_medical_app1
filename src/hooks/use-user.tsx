export const useLocalStorageUser = () => {
  const patient_id = localStorage.getItem('patient_id');
  const doctor_id = localStorage.getItem('doctor_id');
  const token = localStorage.getItem('medapp_token');
  const role = localStorage.getItem('role');
  const user_id = localStorage.getItem('user_id');

  return {
    patient_id: patient_id ? Number(patient_id) : null,
    doctor_id: doctor_id ? Number(doctor_id) : null,
    token: token || null,
    role: role || null,
    user_id: user_id ? Number(user_id) : null
  };
}
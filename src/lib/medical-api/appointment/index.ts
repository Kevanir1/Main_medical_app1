import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/appointment';

type CreateAppointmentPayload = {
  doctor_id: number;
  availability_id: number;
}

type ExtraAppointmentFields = {
  reason?: string;
  type?: string;
  specialization?: string;
}

export const createAppointment = async (payload: CreateAppointmentPayload & ExtraAppointmentFields) => {
  try {
    return await post(`${BASE_PATH}/`, payload);
  } catch (err: any) {
    // Only attempt a single retry when the backend returns 400 AND
    // the error message indicates a missing patient_id. For any other
    // 400 response do not retry and rethrow immediately.
    if (err && err.status === 400) {
      const errMsg = (err.payload && err.payload.message) || err.message || '';
      const indicatesMissingPatient = /patient[_\s-]?id|patientId|patient id|missing patient/i.test(errMsg);

      if (!indicatesMissingPatient) {
        throw err; // other validation error, don't retry
      }

      try {
        const me = await get('/auth/me');
        const userId = me?.user?.id;
        if (userId) {
          const patientRes = await get(`/user/patient/${userId}`);
          const patientId = patientRes?.patient?.id;
          if (patientId) {
            // debug log only in dev
            if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
              console.debug('createAppointment retry with patient_id', patientId);
            }
            const retryPayload = { ...(payload as any), patient_id: patientId };
            return await post(`${BASE_PATH}/`, retryPayload);
          }
        }
      } catch (innerErr) {
        // if anything goes wrong while obtaining patient_id, fall through
        // and rethrow the original error below
      }
    }

    throw err;
  }
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


export const deleteAppointment = async (appointmentId: number) => {
  return await del(`${BASE_PATH}/${appointmentId}`);
}

export const cancelAppointment = async (appointmentId: number) => {
  try {
    const res = await patch(`${BASE_PATH}/${appointmentId}/cancel`);
    // dev log
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
      console.debug('cancelAppointment', appointmentId, res?.status ?? 'no-status');
    }
    return res;
  } catch (err: any) {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV) {
      console.debug('cancelAppointment error', appointmentId, err?.status ?? err?.message);
    }
    throw err;
  }
}


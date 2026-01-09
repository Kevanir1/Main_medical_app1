import { get, post, patch, del } from "../../apiClient"

const BASE_PATH = '/prescription';

type CreatePrescriptionPayload = {
    parient_id: number;
    doctor_id: number;
    appointment_id: number;
    notes: string;
    prescription_items: PrescriptionItem[];
}
    
type PrescriptionItem = {
    medication_name: string;
    dosage: string;
    instructions: string;   
}

export const createPrescription = async (payload: CreatePrescriptionPayload) => {
    return await post(`${BASE_PATH}/create`, payload);
}

export const getPrescriptions = async (prescription_id: number) => {
    return await get(`${BASE_PATH}/${prescription_id}`);
}

export const getPrescriptionsByPatient = async (patient_id: number) => {
    return await get(`${BASE_PATH}/patient/${patient_id}`);
}

export const getPrescriptionsByDoctor = async (doctor_id: number) => {
    return await get(`${BASE_PATH}/doctor/${doctor_id}`);
}

export const deletePrescription = async (prescription_id: number) => {
    return await del(`${BASE_PATH}/${prescription_id}`);
}

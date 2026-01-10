import apiClient from '@/lib/apiClient';

type RawDoctor = any;
type RawAppointment = any;
type RawAvailability = any;

function toDoctor(d: RawDoctor) {
  return {
    id: d.id,
    userId: d.user_id,
    firstName: d.first_name,
    lastName: d.last_name,
    specialization: d.specialization,
    licenseNumber: d.license_number,
  };
}

function toAvailability(a: RawAvailability) {
  return {
    id: a.id,
    doctorId: a.doctor_id,
    isAvailable: a.is_available,
    startTime: a.start_time,
    endTime: a.end_time,
  };
}

function toAppointment(ap: RawAppointment) {
  return {
    id: ap.id,
    patientId: ap.patient_id,
    doctorId: ap.doctor_id,
    availabilityId: ap.availability_id,
    appointmentDate: ap.appointment_date,
    status: ap.status,
    createdAt: ap.created_at,
  };
}

const auth = {
  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res && res.token) {
      localStorage.setItem('medapp_token', res.token);
      if (res.patient_id) localStorage.setItem('patient_id', String(res.patient_id));
      if (res.doctor_id) localStorage.setItem('doctor_id', String(res.doctor_id));
      localStorage.setItem('user_id', String(res.user_id || ''));
      localStorage.setItem('role', res.role || '');
    }
    return res;
  },

  logout() {
    localStorage.removeItem('medapp_token');
    localStorage.removeItem('patient_id');
    localStorage.removeItem('doctor_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
  }
};

const doctors = {
  async getSpecializations(): Promise<string[]> {
    const res = await apiClient.get('/doctor/specializations');
    return res.specializations || [];
  },

  async getBySpecialization(specialization: string) {
    const res = await apiClient.get(`/doctor/specializations/${specialization}`);
    return (res.doctors || []).map(toDoctor);
  },

  async get(doctorId: number) {
    const res = await apiClient.get(`/doctor/${doctorId}`);
    return toDoctor(res.doctor);
  }
};

function mapRawUser(r: any) {
  return {
    id: String(r.id),
    firstName: r.first_name || r.firstName || '',
    lastName: r.last_name || r.lastName || '',
    email: r.email || '',
    role: r.role || 'patient',
    status: r.is_active ? 'active' : 'blocked',
    createdAt: r.created_at || r.createdAt || ''
  };
}

const user = {
  async list() {
    try {
      const res = await apiClient.get('/user/pending');
      const raws = res.pending_users || [];
      return raws.map(mapRawUser);
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd pobierania użytkowników' };
    }
  },

  async pending() {
    try {
      const res = await apiClient.get('/user/pending');
      const raws = res.pending_users || [];
      return raws.map(mapRawUser);
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd pobierania zgłoszeń' };
    }
  },

  async activate(userId: number | string) {
    try {
      await apiClient.patch(`/user/${userId}/activate`);
      return;
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd aktywacji użytkownika' };
    }
  },

  async delete(userId: number | string) {
    try {
      await apiClient.del(`/user/${userId}`);
      return;
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd usuwania użytkownika' };
    }
  },

  async getDoctorByUserId(userId: number | string) {
    try {
      const res = await apiClient.get(`/user/doctor/${userId}`);
      return res.doctor;
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd pobierania lekarza' };
    }
  },

  async getPatient(patientId: number | string) {
    try {
      const res = await apiClient.get(`/patient/${patientId}`);
      return res.patient;
    } catch (e: any) {
      throw { status: e.status || 500, message: e.payload?.message || e.message || 'Błąd pobierania pacjenta' };
    }
  }
};

const availability = {
  async getForDoctor(doctorId: number) {
    const res = await apiClient.get(`/availability/doctor/${doctorId}`);
    return (res.availability || []).map(toAvailability);
  }
};

const appointments = {
  async create(payload: { patient_id: number | string; doctor_id: number | string; availability_id: number | string }) {
    const res = await apiClient.post('/appointment/', payload);
    return res.appointment_id;
  },

  async getByPatient(patientId: number | string) {
    const res = await apiClient.get(`/appointment/patient/${patientId}`);
    return (res.appointments || []).map(toAppointment);
  },

  async getByDoctor(doctorId: number | string) {
    const res = await apiClient.get(`/appointment/doctor/${doctorId}`);
    return (res.appointments || []).map(toAppointment);
  },

  async get(appointmentId: number | string) {
    const res = await apiClient.get(`/appointment/${appointmentId}`);
    return toAppointment(res.appointment);
  },

  async cancel(appointmentId: number | string) {
    return apiClient.del(`/appointment/${appointmentId}`);
  },

  async changeStatus(appointmentId: number | string, status: string) {
    return apiClient.patch(`/appointment/${appointmentId}/status`, { status });
  }
};

export default { auth, doctors, user, availability, appointments };

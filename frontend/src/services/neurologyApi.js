
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Patient APIs - matching your backend routes
export const patientApi = {
    getAllPatients: (page = 1, limit = 100, search = '') => 
        api.get(`/patient/getPatients?page=${page}&limit=${limit}&search=${search}`),
    getPatientById: (id) => api.get(`/patient/getPatient/${id}`),
    createPatient: (data) => api.post('/patient/registerPatient', data),
    updatePatient: (id, data) => api.put(`/patient/updatePatient/${id}`, data),
    deletePatient: (id) => api.delete(`/patient/deletePatient/${id}`),
};


export const submitCompleteForm = (data) => api.post('/neurology/submit-form', data);

// Encounter APIs - you need to create these routes in your backend
export const encounterApi = {
    createEncounter: (data) => api.post('/neurology/encounters', data),
    getPatientEncounters: (patientId, page = 1, limit = 10) => 
        api.get(`/neurology/patients/${patientId}/encounters?page=${page}&limit=${limit}`),
    getFullEncounterDetails: (encounterId) => api.get(`/neurology/encounters/${encounterId}/full`),
    patchEncounter: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}`, data),
    deleteEncounter: (encounterId) => api.delete(`/neurology/encounters/${encounterId}`),
};

// Other neurology APIs - all need to be created in your backend
export const complaintsApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/complaints`, data),
};

export const headacheApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/headache`, data),
};

export const seizureApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/seizures`, data),
};

export const neuroExamApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/neuro-exam`, data),
};

export const imagingApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/imaging`, data),
};

export const electrophysiologyApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/electrophysiology`, data),
};

export const labsApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/labs`, data),
};

export const otherTestsApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/other-tests`, data),
};

export const analysisApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/analysis`, data),
};

export const diagnosesApi = {
    add: (encounterId, data) => api.post(`/neurology/encounters/${encounterId}/diagnoses`, data),
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/diagnoses`, data),
};

export const managementApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/management`, data),
};

export const medicationsApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/medications`, data),
};

export const notesApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/notes`, data),
};

export const referralsApi = {
    patch: (encounterId, data) => api.patch(`/neurology/encounters/${encounterId}/referrals`, data),
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        console.error('API Error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Network error occurred' };
    }
);

export default api;
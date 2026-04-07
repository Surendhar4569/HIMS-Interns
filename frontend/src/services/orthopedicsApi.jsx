// src/services/orthopedicsApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/orthopedics';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Patient APIs
export const patientApi = {
    getAllPatients: (page = 1, limit = 20, search = '') => 
        api.get(`/patients?page=${page}&limit=${limit}&search=${search}`),
    patchPatient: (id, data) => api.patch(`/patients/${id}`, data),
};

// Encounter APIs
export const encounterApi = {
    getPatientEncounters: (patientId, page = 1, limit = 10) => 
        api.get(`/patients/${patientId}/encounters?page=${page}&limit=${limit}`),
    getFullEncounterDetails: (encounterId) => api.get(`/encounters/${encounterId}/full`),
     patchEncounter: (encounterId, data) => api.patch(`/encounters/${encounterId}`, data),
};

// Section-specific APIs
export const complaintsApi = {
     patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/complaints`, data),
};

export const physicalExamApi = {
      patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/physical-exam`, data),
};

export const imagingApi = {
    patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/imaging`, data),
};

export const labsApi = {
     patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/labs`, data),
};

export const diagnosesApi = {
    patch: (encounterId, data) => {
        return api.patch(`/encounters/${encounterId}/diagnoses`, data);
    },
};

export const managementApi = {
    patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/management`, data),
};

export const rehabMilestonesApi = {
    patch: (encounterId, data) => {
        return api.patch(`/encounters/${encounterId}/rehab-milestones`, data);
    },
};

export const referralsApi = {
     patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/referrals`, data),
};

export const notesApi = {
    patch: (encounterId, data) => api.patch(`/encounters/${encounterId}/notes`, data),
};

// Complete form submission
export const submitCompleteForm = (data) => api.post('/submit-form', data);
export const getSingleEncounterForReport = (encounterId) => 
    api.get(`/encounters/${encounterId}/full`);
// Request/Response interceptors for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Network error occurred' };
    }
);





export default api;
// src/services/neurologyHelpers.js

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {string} Age in years
 */
export const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age.toString();
};

/**
 * Format date to readable string
 * @param {string} dateString - Date in ISO format
 * @returns {string} Formatted date (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Format date with time
 * @param {string} dateString - Date in ISO format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Clean phone number (remove non-digits)
 * @param {string} phone - Phone number
 * @returns {string} Cleaned phone number
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return null;
    return phone.replace(/\D/g, "");
};

/**
 * Generate patient visit ID
 * @returns {string} Generated visit ID
 */
export const generatePatientVisitId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const randomNum = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `NEURO-${year}-${randomNum}`;
};

/**
 * Calculate BMI from height and weight
 * @param {string|number} heightCm - Height in centimeters
 * @param {string|number} weightKg - Weight in kilograms
 * @returns {string|null} BMI with one decimal place
 */
export const calculateBMI = (heightCm, weightKg) => {
    if (!heightCm || !weightKg) return null;
    const heightInM = parseFloat(heightCm) / 100;
    const weight = parseFloat(weightKg);
    if (heightInM > 0 && weight > 0) {
        return (weight / (heightInM * heightInM)).toFixed(1);
    }
    return null;
};

/**
 * Get BMI category
 * @param {string|number} bmi - BMI value
 * @returns {string} BMI category
 */
export const getBMICategory = (bmi) => {
    if (!bmi) return 'Unknown';
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return 'Underweight';
    if (bmiNum < 25) return 'Normal';
    if (bmiNum < 30) return 'Overweight';
    return 'Obese';
};

/**
 * Get severity color based on value (1-10)
 * @param {string|number} severity - Severity value (1-10)
 * @returns {string} Color scheme
 */
export const getSeverityColor = (severity) => {
    if (!severity) return 'gray';
    const num = parseInt(severity);
    if (num <= 3) return 'green';
    if (num <= 6) return 'yellow';
    if (num <= 8) return 'orange';
    return 'red';
};

/**
 * Format diagnosis type for display
 * @param {string} type - Diagnosis type
 * @returns {string} Formatted type
 */
export const formatDiagnosisType = (type) => {
    const types = {
        'primary': 'Primary Diagnosis',
        'secondary': 'Secondary Diagnosis',
        'differential': 'Differential Diagnosis',
        'rule_out': 'Rule Out'
    };
    return types[type] || type;
};

/**
 * Format seizure type for display
 * @param {string} type - Seizure type
 * @returns {string} Formatted type
 */
export const formatSeizureType = (type) => {
    const types = {
        'focal': 'Focal Onset',
        'generalized_tonic_clonic': 'Generalized Tonic-Clonic',
        'absence': 'Absence',
        'myoclonic': 'Myoclonic',
        'atonic': 'Atonic',
        'tonic': 'Tonic',
        'clonic': 'Clonic',
        'focal_impaired': 'Focal with Impaired Awareness',
        'unknown': 'Unknown Onset'
    };
    return types[type] || type;
};

/**
 * Format headache type for display
 * @param {string} type - Headache type
 * @returns {string} Formatted type
 */
export const formatHeadacheType = (type) => {
    const types = {
        'migraine': 'Migraine',
        'tension': 'Tension-Type',
        'cluster': 'Cluster',
        'thunderclap': 'Thunderclap',
        'chronic_daily': 'Chronic Daily',
        'medication_overuse': 'Medication Overuse',
        'new_daily_persistent': 'New Daily Persistent'
    };
    return types[type] || type;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Check if object has any non-empty values
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object has data
 */
export const hasData = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(val => 
        val && val !== '' && val !== 'N/A' && val !== 'Not specified'
    );
};

/**
 * Group encounters by month/year
 * @param {Array} encounters - List of encounters
 * @returns {Object} Grouped encounters
 */
export const groupEncountersByMonth = (encounters) => {
    const grouped = {};
    encounters.forEach(encounter => {
        const date = new Date(encounter.encounter_date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        const key = `${year} - ${month}`;
        
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(encounter);
    });
    return grouped;
};

/**
 * Sort encounters by date (newest first)
 * @param {Array} encounters - List of encounters
 * @returns {Array} Sorted encounters
 */
export const sortEncountersByDate = (encounters) => {
    return [...encounters].sort((a, b) => 
        new Date(b.encounter_date) - new Date(a.encounter_date)
    );
};

/**
 * Extract unique diagnoses from multiple encounters
 * @param {Array} encounters - List of encounters with details
 * @returns {Array} Unique diagnoses with counts
 */
export const extractUniqueDiagnoses = (encounters) => {
    const diagnosisMap = {};
    
    encounters.forEach(encounter => {
        if (encounter.diagnoses) {
            encounter.diagnoses.forEach(dx => {
                const key = dx.diagnosis_name;
                if (!diagnosisMap[key]) {
                    diagnosisMap[key] = {
                        name: dx.diagnosis_name,
                        count: 0,
                        types: new Set()
                    };
                }
                diagnosisMap[key].count++;
                diagnosisMap[key].types.add(dx.diagnosis_type);
            });
        }
    });
    
    return Object.values(diagnosisMap)
        .map(item => ({
            ...item,
            types: Array.from(item.types)
        }))
        .sort((a, b) => b.count - a.count);
};

// Default export for convenience
const helpers = {
    calculateAge,
    formatDate,
    formatDateTime,
    cleanPhoneNumber,
    generatePatientVisitId,
    calculateBMI,
    getBMICategory,
    getSeverityColor,
    formatDiagnosisType,
    formatSeizureType,
    formatHeadacheType,
    truncateText,
    hasData,
    groupEncountersByMonth,
    sortEncountersByDate,
    extractUniqueDiagnoses
};

export default helpers;
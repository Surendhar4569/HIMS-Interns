// routes/orthopedics.Routes.js
import express from 'express';
import {
    // Patient controllers
    getAllPatients,
    patchPatient,
    // Encounter controllers
    getPatientEncounters,
    getFullEncounterDetails,
    patchEncounter,  
    // PATCH controllers for each section
    patchComplaints,
    patchPhysicalExam,
    patchImaging,
    patchLabs,
    patchDiagnoses,
    patchManagement,
    patchRehabMilestones,
    patchReferrals,
    patchNotes,
    // Complete form submission
    submitCompleteForm,
} from '../controllers/orthopedics.controllers.js';


const orthopedics = express.Router();

// ==================== PATIENT ROUTES ====================
/**
 * @route   GET /api/orthopedics/patients
 * @desc    Get all patients with pagination
 * @access  Public
 */
orthopedics.get('/patients', getAllPatients);

/**
 * @route   PATCH /api/orthopedics/patients/:id
 * @desc    Partially update patient information
 * @access  Public
 */
orthopedics.patch('/patients/:id', patchPatient);

/**
 * @route   DELETE /api/orthopedics/patients/:id
 * @desc    Delete patient
 * @access  Public
 */

// ==================== ENCOUNTER ROUTES ====================

/**
 * @route   GET /api/orthopedics/patients/:patientId/encounters
 * @desc    Get all encounters for a patient
 * @access  Public
 */
orthopedics.get('/patients/:patientId/encounters', getPatientEncounters);

/**
 * @route   GET /api/orthopedics/encounters/:encounterId/full
 * @desc    Get complete encounter details with all related data
 * @access  Public
 */
orthopedics.get('/encounters/:encounterId/full', getFullEncounterDetails);

/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId
 * @desc    Partially update encounter basic information
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId', patchEncounter);

// ==================== COMPLAINTS ROUTES ====================


/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/complaints
 * @desc    Partially update encounter complaints
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/complaints', patchComplaints);

// ==================== PHYSICAL EXAM ROUTES ====================



/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/physical-exam
 * @desc    Partially update physical examination
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/physical-exam', patchPhysicalExam);

// ==================== IMAGING ROUTES ====================


/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/imaging
 * @desc    Partially update imaging studies
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/imaging', patchImaging);

// ==================== LABS ROUTES ====================


/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/labs
 * @desc    Partially update lab tests
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/labs', patchLabs);

// ==================== DIAGNOSES ROUTES ====================
/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/diagnoses
 * @desc    Partially update diagnoses (add/update/remove)
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/diagnoses', patchDiagnoses);

// ==================== MANAGEMENT PLAN ROUTES ====================
/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/management
 * @desc    Partially update management plan
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/management', patchManagement);

// ==================== REHAB MILESTONES ROUTES ====================
/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/rehab-milestones
 * @desc    Partially update rehabilitation milestones
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/rehab-milestones', patchRehabMilestones);

// ==================== REFERRALS ROUTES ====================
/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/referrals
 * @desc    Partially update referrals
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/referrals', patchReferrals);

// ==================== PHYSICIAN NOTES ROUTES ====================
/**
 * @route   PATCH /api/orthopedics/encounters/:encounterId/notes
 * @desc    Partially update physician notes
 * @access  Public
 */
orthopedics.patch('/encounters/:encounterId/notes', patchNotes);

// ==================== COMPLETE FORM SUBMISSION ====================

/**
 * @route   POST /api/orthopedics/submit-form
 * @desc    Submit complete orthopedic form data (new encounter)
 * @access  Public
 */
orthopedics.post('/submit-form', submitCompleteForm);

/**
 * @route   PUT /api/orthopedics/encounters/:encounterId
 * @desc    Update complete orthopedic form data (full update)
 * @access  Public
 */
// ==================== HEALTH CHECK ROUTE ====================

/**
 * @route   GET /api/orthopedics/health
 * @desc    Health check endpoint
 * @access  Public
 */
orthopedics.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Orthopedics API is running',
        timestamp: new Date().toISOString()
    });
});

export default orthopedics;
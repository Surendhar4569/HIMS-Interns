// routes/neurology.Routes.js
import express from "express";
import {
    // Encounter controllers
    createEncounter,
    getPatientEncounters,
    getEncounterById,
    updateEncounter,
    deleteEncounter,
    
    // Complaint controllers
    updateComplaints,
    
    // Headache controllers
    updateHeadache,
    
    // Seizure controllers
    updateSeizure,
    
    // Neuro Exam controllers
    updateNeuroExam,
    
    // Imaging controllers
    updateImaging,
    
    // Electrophysiology controllers
    updateElectrophysiology,
    
    // Labs controllers
    updateLabs,
    
    // Analysis controllers
    updateAnalysis,
    
    // Diagnoses controllers
    addDiagnoses,
    updateDiagnoses,
    
    // Management controllers
    updateManagement,
    
    // Medications controllers
    updateMedications,
    
    // Notes controllers
    updateNotes,
    
    // Referrals controllers
    updateReferrals,
    
    // Complete form submission
    submitCompleteForm
} from "../controllers/neurology.Controllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const neurologyRouter = express.Router();

// Apply authentication to all routes
neurologyRouter.use(verifyToken);

// ========== ENCOUNTER ROUTES ==========
neurologyRouter.post("/encounters", createEncounter);
neurologyRouter.get("/patients/:patientId/encounters", getPatientEncounters);
neurologyRouter.get("/encounters/:encounterId/full", getEncounterById);
neurologyRouter.patch("/encounters/:encounterId", updateEncounter);
neurologyRouter.delete("/encounters/:encounterId", deleteEncounter);

// ========== COMPLAINTS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/complaints", updateComplaints);

// ========== HEADACHE ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/headache", updateHeadache);

// ========== SEIZURE ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/seizures", updateSeizure);

// ========== NEURO EXAM ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/neuro-exam", updateNeuroExam);

// ========== IMAGING ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/imaging", updateImaging);

// ========== ELECTROPHYSIOLOGY ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/electrophysiology", updateElectrophysiology);

// ========== LABS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/labs", updateLabs);

// ========== OTHER TESTS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/other-tests", updateAnalysis);

// ========== ANALYSIS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/analysis", updateAnalysis);

// ========== DIAGNOSES ROUTES ==========
neurologyRouter.post("/encounters/:encounterId/diagnoses", addDiagnoses);
neurologyRouter.patch("/encounters/:encounterId/diagnoses", updateDiagnoses);

// ========== MANAGEMENT ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/management", updateManagement);

// ========== MEDICATIONS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/medications", updateMedications);

// ========== NOTES ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/notes", updateNotes);

// ========== REFERRALS ROUTES ==========
neurologyRouter.patch("/encounters/:encounterId/referrals", updateReferrals);

// ========== COMPLETE FORM SUBMISSION ==========
neurologyRouter.post("/submit-form", submitCompleteForm);

export default neurologyRouter;
// controllers/neurology.controllers.js
import db from "../db.js"; // Adjust based on your DB connection

// ========== ENCOUNTER CONTROLLERS ==========
export const createEncounter = async (req, res) => {
  try {
    const { patient_id, encounter_date, visit_id, ...encounterData } = req.body;
    

    const result = await db.query(
      `INSERT INTO neurology_encounters 
            (patient_id, encounter_date,visit_id) 
            VALUES ($1, $2, $3)
            RETURNING encounter_id`,
      [patient_id, encounter_date || new Date(),  visit_id],
    );

    res.status(201).json({
      success: true,
      message: "Encounter created successfully",
      encounter_id: result.rows[0].encounter_id,
    });
  } catch (error) {
    console.error("Error creating encounter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create encounter",
    });
  }
};

export const getPatientEncounters = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const encounters = await db.query(
      `SELECT * FROM neurology_encounters 
            WHERE patient_id = $1 
            ORDER BY encounter_date DESC 
            LIMIT $2 OFFSET $3`,
      [patientId, parseInt(limit), offset],
    );

    const total = await db.query(
      `SELECT COUNT(*) as count FROM neurology_encounters WHERE patient_id = $1`,
      [patientId],
    );

    res.json({
      success: true,
      data: encounters.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching encounters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch encounters",
    });
  }
};

export const getEncounterById = async (req, res) => {
  try {
    const { encounterId } = req.params;

    // Get main encounter data
    // const encounter = await db.query(
    //   `SELECT e.*, p.patient_name, p.dob, p.gender, p.contact_number, p.email, COALESCE(p.address, '') as address
    //         FROM neurology_encounters e
    //         LEFT JOIN patient p ON e.patient_id = p.patient_id
    //         WHERE e.encounter_id = $1`,
    //   [encounterId],
    // );
    const encounter = await db.query(
      `SELECT 
      e.*, 
      p.patient_name, 
      p.dob, 
      p.gender, 
      p.contact_number, 
      p.email, 
      p.address -- Pulling address directly from patient table
   FROM neurology_encounters e
   LEFT JOIN patient p ON e.patient_id = p.patient_id
   WHERE e.encounter_id = $1`,
      [encounterId],
    );

    if (!encounter.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    // Get all related data
    const complaints = await db.query(
      `SELECT * FROM neurology_complaints WHERE encounter_id = $1`,
      [encounterId],
    );

    const headache = await db.query(
      `SELECT * FROM neurology_headache WHERE encounter_id = $1`,
      [encounterId],
    );

    const seizures = await db.query(
      `SELECT * FROM neurology_seizures WHERE encounter_id = $1`,
      [encounterId],
    );

    const neuroExam = await db.query(
      `SELECT * FROM neurology_neuro_exam WHERE encounter_id = $1`,
      [encounterId],
    );

    const imaging = await db.query(
      `SELECT * FROM neurology_imaging WHERE encounter_id = $1`,
      [encounterId],
    );

    const electrophysiology = await db.query(
      `SELECT * FROM neurology_electrophysiology WHERE encounter_id = $1`,
      [encounterId],
    );

    const labs = await db.query(
      `SELECT * FROM neurology_labs WHERE encounter_id = $1`,
      [encounterId],
    );

    const analysis = await db.query(
      `SELECT * FROM neurology_analysis WHERE encounter_id = $1`,
      [encounterId],
    );

    const diagnoses = await db.query(
      `SELECT * FROM neurology_diagnoses WHERE encounter_id = $1`,
      [encounterId],
    );

    const management = await db.query(
      `SELECT * FROM neurology_management WHERE encounter_id = $1`,
      [encounterId],
    );

    const medications = await db.query(
      `SELECT * FROM neurology_medications WHERE encounter_id = $1`,
      [encounterId],
    );

    const notes = await db.query(
      `SELECT * FROM neurology_notes WHERE encounter_id = $1`,
      [encounterId],
    );

    const referrals = await db.query(
      `SELECT * FROM neurology_referrals WHERE encounter_id = $1`,
      [encounterId],
    );

    res.json({
      success: true,
      data: {
        encounter: encounter.rows[0],
        complaints: complaints.rows[0] || {},
        headache: headache.rows[0] || {},
        seizures: seizures.rows[0] || {},
        neuroExam: neuroExam.rows[0] || {},
        imaging: imaging.rows[0] || {},
        electrophysiology: electrophysiology.rows[0] || {},
        labs: labs.rows[0] || {},
        analysis: analysis.rows[0] || {},
        diagnoses: diagnoses.rows || [],
        management: management.rows[0] || {},
        medications: medications.rows || [],
        notes: notes.rows[0] || {},
        referrals: referrals.rows || [],
      },
    });
  } catch (error) {
    console.error("Error fetching encounter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch encounter",
    });
  }
};
// backend/controllers/neurology.Controllers.js

// backend/controllers/neurology.Controllers.js

export const getFullEncounterDetails = async (req, res) => {
 

  try {
    const { encounterId } = req.params;

    // 1. Get main encounter data with patient info
    const encounter = await db.query(
      `SELECT e.*, p.patient_name, p.dob, p.gender, p.contact_number, p.email, p.address
       FROM neurology_encounters e
       LEFT JOIN patient p ON e.patient_id = p.patient_id
       WHERE e.encounter_id = $1`,
      [encounterId],
    );

    if (!encounter.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    // 2. Get complaints data - FIX: Use SELECT * to get all columns
    const complaints = await db.query(
      `SELECT * FROM neurology_complaints WHERE encounter_id = $1`,
      [encounterId],
    );
    

    // 3. Get headache data
    const headache = await db.query(
      `SELECT * FROM neurology_headache WHERE encounter_id = $1`,
      [encounterId],
    );
    

    // 4. Get seizures data
    const seizures = await db.query(
      `SELECT * FROM neurology_seizures WHERE encounter_id = $1`,
      [encounterId],
    );

    // 5. Get neuro exam data
    const neuroExam = await db.query(
      `SELECT * FROM neurology_neuro_exam WHERE encounter_id = $1`,
      [encounterId],
    );

    // 6. Get imaging data
    const imaging = await db.query(
      `SELECT * FROM neurology_imaging WHERE encounter_id = $1`,
      [encounterId],
    );
    

    // 7. Get electrophysiology data
    const electrophysiology = await db.query(
      `SELECT * FROM neurology_electrophysiology WHERE encounter_id = $1`,
      [encounterId],
    );

    // 8. Get labs data
    const labs = await db.query(
      `SELECT * FROM neurology_labs WHERE encounter_id = $1`,
      [encounterId],
    );

    // 9. Get analysis data
    const analysis = await db.query(
      `SELECT * FROM neurology_analysis WHERE encounter_id = $1`,
      [encounterId],
    );
    
    // 10. Get diagnoses data
    const diagnoses = await db.query(
      `SELECT * FROM neurology_diagnoses WHERE encounter_id = $1 ORDER BY diagnosis_type`,
      [encounterId],
    );

    // 11. Get management data
    const management = await db.query(
      `SELECT * FROM neurology_management WHERE encounter_id = $1`,
      [encounterId],
    );

    // 12. Get medications data
    const medications = await db.query(
      `SELECT * FROM neurology_medications WHERE encounter_id = $1`,
      [encounterId],
    );

    // 13. Get notes data
    const notes = await db.query(
      `SELECT * FROM neurology_notes WHERE encounter_id = $1`,
      [encounterId],
    );

    // 14. Get referrals data
    const referrals = await db.query(
      `SELECT * FROM neurology_referrals WHERE encounter_id = $1`,
      [encounterId],
    );

    // Return the data
    res.json({
      success: true,
      data: {
        encounter: encounter.rows[0],
        complaints: complaints.rows[0] || null,
        headache: headache.rows[0] || null,
        seizures: seizures.rows[0] || null,
        neuroExam: neuroExam.rows[0] || null,
        imaging: imaging.rows[0] || null,
        electrophysiology: electrophysiology.rows[0] || null,
        labs: labs.rows[0] || null,
        analysis: analysis.rows[0] || null,
        diagnoses: diagnoses.rows || [],
        management: management.rows[0] || null,
        medications: medications.rows || [],
        notes: notes.rows[0] || null,
        referrals: referrals.rows || [],
      },
    });
  } catch (error) {
    console.error("Error fetching full encounter details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch encounter details",
      error: error.message,
    });
  }
};
// backend/controllers/neurology.Controllers.js
const sanitize = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitize(v)]),
    );
  } else {
    return obj === "" ? null : obj;
  }
};

export const updateEncounter = async (req, res) => {
  const encounterId = Number(req.params.encounterId);
  const updates = sanitize(req.body);

  try {
    const client = await db.connect();

    try {
      await client.query("BEGIN");
    
      // ============================================
      // 1. UPDATE neurology_encounters table
      // ============================================
      const encounterFields = [
        "visit_id",
        "height_cm",
        "weight_kg",
        "bmi",
        "allergies",
        "past_medical_history",
        "past_surgical_history",
        "family_history",
        "social_history",
        "occupation",
        "smoking_status",
        "alcohol_use",
        "lifestyle",
      ];

      const encounterUpdate = {};
      encounterFields.forEach((field) => {
        if (updates[field] !== undefined) {
          encounterUpdate[field] = updates[field];
        }
      });

     

      if (Object.keys(encounterUpdate).length > 0) {
        const setClause = Object.keys(encounterUpdate)
          .map((key, idx) => `${key} = $${idx + 1}`)
          .join(", ");
        

        const values = [...Object.values(encounterUpdate), encounterId];

        const result = await client.query(
          `UPDATE neurology_encounters 
   SET ${setClause}, updated_at = CURRENT_TIMESTAMP
   WHERE encounter_id = $${Object.keys(encounterUpdate).length + 1}`,
          values,
        );
      }
      // ============================================
      // NEW STEP: UPDATE address in patient table
      // ============================================
      if (
        updates.address !== undefined ||
        updates.contactPhone !== undefined ||
        updates.contactEmail !== undefined
      ) {
        await client.query(
          `UPDATE patient 
     SET address = COALESCE($1, address),
         contact_number = COALESCE($2, contact_number),
         email = COALESCE($3, email)
     WHERE patient_id = (SELECT patient_id FROM neurology_encounters WHERE encounter_id = $4)`,
          [
            updates.address,
            updates.contactPhone,
            updates.contactEmail,
            encounterId,
          ],
        );
      }

      // ============================================
      // 2. UPDATE neurology_complaints table
      // ============================================
      const complaintFields = [
        "chief_complaint",
        "onset_date",
        "duration",
        "progression",
        "numbness",
        "paresthesia",
        "tremors",
        "involuntary_movements",
        "speech_changes",
        "vision_changes",
        "dizziness",
        "balance_issues",
        "cognitive_changes",
        "language_changes",
        "diplopia",
        "vertigo",
        "memory_changes",
        "neuropathic_pain",
        "radicular_pain",
        "symptom_triggers",
        "symptom_relievers",
        "overall_severity",
        "weakness_present",
        "weakness_side",
        "weakness_pattern",
        "weakness_limb",
      ];

      const complaintUpdate = {};
      complaintFields.forEach((field) => {
        if (updates[field] !== undefined) {
          complaintUpdate[field] = updates[field];
        }
      });

      if (Object.keys(complaintUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_complaints WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(complaintUpdate);
          const insertValues = [encounterId, ...Object.values(complaintUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_complaints (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(complaintUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(complaintUpdate), encounterId];
          await client.query(
            `UPDATE neurology_complaints SET ${setClause} WHERE encounter_id = $${Object.keys(complaintUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 3. UPDATE neurology_headache table
      // ============================================
      const headacheFields = [
        "headache_type",
        "headache_location",
        "headache_severity",
        "headache_triggers",
        "headache_duration",
      ];

      const headacheUpdate = {};
      headacheFields.forEach((field) => {
        if (updates[field] !== undefined) {
          headacheUpdate[field] = updates[field];
        }
      });

      if (Object.keys(headacheUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_headache WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(headacheUpdate);
          const insertValues = [encounterId, ...Object.values(headacheUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_headache (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(headacheUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(headacheUpdate), encounterId];
          await client.query(
            `UPDATE neurology_headache SET ${setClause} WHERE encounter_id = $${Object.keys(headacheUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 4. UPDATE neurology_seizures table
      // ============================================
      const seizureFields = [
        "seizures_present",
        "seizure_type",
        "seizure_frequency",
      ];

      const seizureUpdate = {};
      seizureFields.forEach((field) => {
        if (updates[field] !== undefined) {
          seizureUpdate[field] = updates[field];
        }
      });

      if (Object.keys(seizureUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_seizures WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(seizureUpdate);
          const insertValues = [encounterId, ...Object.values(seizureUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_seizures (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(seizureUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(seizureUpdate), encounterId];
          await client.query(
            `UPDATE neurology_seizures SET ${setClause} WHERE encounter_id = $${Object.keys(seizureUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 5. UPDATE neurology_neuro_exam table
      // ============================================
      const neuroExamFields = [
        "mental_status_orientation",
        "memory_registration",
        "memory_recall",
        "cognition",
        "cranial_nerve_findings",
        "motor_tone",
        "motor_power",
        "muscle_bulk",
        "reflexes_biceps",
        "reflexes_triceps",
        "reflexes_knee",
        "reflexes_ankle",
        "plantar_response",
        "sensory_pain",
        "sensory_temperature",
        "sensory_vibration",
        "sensory_proprioception",
        "coordination_finger_nose",
        "coordination_heel_shin",
        "gait",
        "romberg_test",
        "tandem_walk",
        "babinski",
        "hoffmann",
        "lhermitte",
        "adls",
        "mobility",
      ];

      const neuroExamUpdate = {};
      neuroExamFields.forEach((field) => {
        if (updates[field] !== undefined) {
          neuroExamUpdate[field] = updates[field];
        }
      });

      if (Object.keys(neuroExamUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_neuro_exam WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(neuroExamUpdate);
          const insertValues = [encounterId, ...Object.values(neuroExamUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_neuro_exam (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(neuroExamUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(neuroExamUpdate), encounterId];
          await client.query(
            `UPDATE neurology_neuro_exam SET ${setClause} WHERE encounter_id = $${Object.keys(neuroExamUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 6. UPDATE neurology_imaging table
      // ============================================
      const imagingFields = [
        "ct_brain",
        "mri_brain",
        "mr_angiography",
        "mri_spine",
        "lumbar_puncture",
      ];

      const imagingUpdate = {};
      imagingFields.forEach((field) => {
        if (updates[field] !== undefined) {
          imagingUpdate[field] = updates[field];
        }
      });

      if (Object.keys(imagingUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_imaging WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(imagingUpdate);
          const insertValues = [encounterId, ...Object.values(imagingUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_imaging (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(imagingUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(imagingUpdate), encounterId];
          await client.query(
            `UPDATE neurology_imaging SET ${setClause} WHERE encounter_id = $${Object.keys(imagingUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 7. UPDATE neurology_electrophysiology table
      // ============================================
      const epFields = ["eeg_ordered", "ncs_ordered", "emg_ordered"];

      const epUpdate = {};
      epFields.forEach((field) => {
        if (updates[field] !== undefined) {
          epUpdate[field] = updates[field];
        }
      });

      if (Object.keys(epUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_electrophysiology WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(epUpdate);
          const insertValues = [encounterId, ...Object.values(epUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_electrophysiology (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(epUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(epUpdate), encounterId];
          await client.query(
            `UPDATE neurology_electrophysiology SET ${setClause} WHERE encounter_id = $${Object.keys(epUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 8. UPDATE neurology_labs table
      // ============================================
      const labsFields = [
        "cbc_results",
        "electrolyte_results",
        "thyroid_results",
        "esr_crp_results",
        "autoimmune_results",
      ];

      const labsUpdate = {};
      labsFields.forEach((field) => {
        if (updates[field] !== undefined) {
          labsUpdate[field] = updates[field];
        }
      });

      if (Object.keys(labsUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_labs WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(labsUpdate);
          const insertValues = [encounterId, ...Object.values(labsUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_labs (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(labsUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(labsUpdate), encounterId];
          await client.query(
            `UPDATE neurology_labs SET ${setClause} WHERE encounter_id = $${Object.keys(labsUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 9. UPDATE neurology_analysis table
      // ============================================
      const analysisFields = [
        "mri_findings",
        "mr_angio_findings",
        "eeg_results",
        "ncs_results",
        "comparison_previous",
        "genetic_testing",
        "metabolic_panel",
      ];

      const analysisUpdate = {};
      analysisFields.forEach((field) => {
        if (updates[field] !== undefined) {
          analysisUpdate[field] = updates[field];
        }
      });

      if (Object.keys(analysisUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_analysis WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(analysisUpdate);
          const insertValues = [encounterId, ...Object.values(analysisUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_analysis (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(analysisUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(analysisUpdate), encounterId];
          await client.query(
            `UPDATE neurology_analysis SET ${setClause} WHERE encounter_id = $${Object.keys(analysisUpdate).length + 1}`,
            values,
          );
        }
      }

      // ============================================
      // 10. UPDATE neurology_management table
      // ============================================
      const managementFields = [
        "pain_management",
        "spasticity_management",
        "seizure_control",
        "lifestyle_recommendations",
        "rehabilitation",
        "surgical_plan",
        "endovascular",
        "botulinum_toxin",
        "physiotherapy",
        "occupational_therapy",
        "speech_therapy",
        "follow_up_timing",
        "repeat_imaging",
        "repeat_labs",
        "monitoring",
        "warning_signs",
      ];

      const managementUpdate = {};
      managementFields.forEach((field) => {
        if (updates[field] !== undefined) {
          managementUpdate[field] = updates[field];
        }
      });

      if (Object.keys(managementUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_management WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(managementUpdate);
          const insertValues = [
            encounterId,
            ...Object.values(managementUpdate),
          ];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_management (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(managementUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(managementUpdate), encounterId];
          await client.query(
            `UPDATE neurology_management SET ${setClause} WHERE encounter_id = $${Object.keys(managementUpdate).length + 1}`,
            values,
          );
        }
       }

      // ============================================
      // 11. UPDATE neurology_notes table
      // ============================================
      const notesFields = [
        "clinical_observations",
        "patient_questions",
        "caregiver_questions",
        "education_provided",
        "multidisciplinary_care",
      ];

      const notesUpdate = {};
      notesFields.forEach((field) => {
        if (updates[field] !== undefined) {
          notesUpdate[field] = updates[field];
        }
      });

      if (Object.keys(notesUpdate).length > 0) {
        const checkResult = await client.query(
          "SELECT 1 FROM neurology_notes WHERE encounter_id = $1",
          [encounterId],
        );

        if (checkResult.rows.length === 0) {
          const insertFields = Object.keys(notesUpdate);
          const insertValues = [encounterId, ...Object.values(notesUpdate)];
          const placeholders = insertFields
            .map((_, idx) => `$${idx + 2}`)
            .join(", ");
          await client.query(
            `INSERT INTO neurology_notes (encounter_id, ${insertFields.join(", ")}) 
                         VALUES ($1, ${placeholders})`,
            insertValues,
          );
        } else {
          const setClause = Object.keys(notesUpdate)
            .map((key, idx) => `${key} = $${idx + 1}`)
            .join(", ");
          const values = [...Object.values(notesUpdate), encounterId];
          await client.query(
            `UPDATE neurology_notes SET ${setClause} WHERE encounter_id = $${Object.keys(notesUpdate).length + 1}`,
            values,
          );
        }
       }
      // ============================================
      // 12. UPDATE neurology_diagnoses table
      // ============================================
      // Robust check: check if ANY of these fields exist in the updates object
      const diagnosisTriggerFields = [
        "primary_diagnosis",
        "icd10_code",
        "severity",
        "stage",
        "disease_classification",
        "comorbidities",
      ];

      const hasDiagnosisUpdate = diagnosisTriggerFields.some(
        (field) => updates[field] !== undefined,
      );

      if (hasDiagnosisUpdate) {
        const primaryDiagnosisUpdate = {};

        // Mapping frontend keys to database column names
        if (updates.primary_diagnosis !== undefined)
          primaryDiagnosisUpdate.diagnosis_name = updates.primary_diagnosis;
        if (updates.icd10_code !== undefined)
          primaryDiagnosisUpdate.icd10_code = updates.icd10_code;
        if (updates.disease_classification !== undefined)
          primaryDiagnosisUpdate.disease_classification =
            updates.disease_classification;
        if (updates.severity !== undefined)
          primaryDiagnosisUpdate.severity = updates.severity;
        if (updates.stage !== undefined)
          primaryDiagnosisUpdate.stage = updates.stage;
        if (updates.comorbidities !== undefined)
          primaryDiagnosisUpdate.comorbidities = updates.comorbidities;

        if (Object.keys(primaryDiagnosisUpdate).length > 0) {
          // Check if primary diagnosis exists for this encounter
          const primaryCheck = await client.query(
            `SELECT 1 FROM neurology_diagnoses WHERE encounter_id = $1 AND diagnosis_type = 'primary'`,
            [encounterId],
          );

          if (primaryCheck.rows.length === 0) {
            // INSERT LOGIC
            const insertFields = Object.keys(primaryDiagnosisUpdate);
            const insertValues = [
              encounterId,
              "primary",
              ...Object.values(primaryDiagnosisUpdate),
            ];

            // Placeholders start from $3 because $1 is encounter_id and $2 is 'primary'
            const placeholders = insertFields
              .map((_, idx) => `$${idx + 3}`)
              .join(", ");

            await client.query(
              `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, ${insertFields.join(", ")}) 
         VALUES ($1, $2, ${placeholders})`,
              insertValues,
            );
          } else {
            // UPDATE LOGIC
            const setClause = Object.keys(primaryDiagnosisUpdate)
              .map((key, idx) => `${key} = $${idx + 1}`)
              .join(", ");

            const values = [
              ...Object.values(primaryDiagnosisUpdate),
              encounterId,
            ];

            await client.query(
              `UPDATE neurology_diagnoses 
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE encounter_id = $${Object.keys(primaryDiagnosisUpdate).length + 1} AND diagnosis_type = 'primary'`,
              values,
            );
          }
        }
      }

      // Handle SECONDARY diagnosis
      if (updates.secondary_diagnosis) {
        // Check if secondary diagnosis exists
        const secondaryCheck = await client.query(
          `SELECT 1 FROM neurology_diagnoses WHERE encounter_id = $1 AND diagnosis_type = 'secondary'`,
          [encounterId],
        );

        if (secondaryCheck.rows.length === 0) {
          // Insert new secondary diagnosis
          await client.query(
            `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, diagnosis_name, created_at, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [encounterId, "secondary", updates.secondary_diagnosis],
          );
          
        } else {
          // Update existing secondary diagnosis
          await client.query(
            `UPDATE neurology_diagnoses 
             SET diagnosis_name = $1, updated_at = CURRENT_TIMESTAMP
             WHERE encounter_id = $2 AND diagnosis_type = 'secondary'`,
            [updates.secondary_diagnosis, encounterId],
          );
        }
      }

      // Handle ADDITIONAL/DIFFERENTIAL diagnoses if you have them
      // If you have an array of additional diagnoses, you can handle them here
      if (
        updates.additional_diagnoses &&
        Array.isArray(updates.additional_diagnoses)
      ) {
        // Delete all existing additional diagnoses
        await client.query(
          `DELETE FROM neurology_diagnoses WHERE encounter_id = $1 AND diagnosis_type = 'additional'`,
          [encounterId],
        );

        // Insert new additional diagnoses
        for (const diag of updates.additional_diagnoses) {
          if (diag.diagnosis_name) {
            await client.query(
              `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, diagnosis_name, icd10_code, severity, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [
                encounterId,
                "additional",
                diag.diagnosis_name,
                diag.icd10_code,
                diag.severity,
              ],
            );
          }
        }
      }

      // ============================================
      // 13. UPDATE neurology_medications table
      // ============================================
      if (updates.medications && Array.isArray(updates.medications)) {
        await client.query(
          "DELETE FROM neurology_medications WHERE encounter_id = $1",
          [encounterId],
        );

        for (const med of updates.medications) {
          if (med.name || med.medication_name) {
            const medName = med.name || med.medication_name;
            await client.query(
              `INSERT INTO neurology_medications (encounter_id, medication_name, dose, route, frequency, duration, purpose)
                             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                encounterId,
                medName,
                med.dose,
                med.route,
                med.frequency,
                med.duration,
                med.purpose,
              ],
            );
          }
        }
       }

      // ============================================
      // 14. UPDATE neurology_referrals table
      // ============================================
      if (updates.referrals && Array.isArray(updates.referrals)) {
        await client.query(
          "DELETE FROM neurology_referrals WHERE encounter_id = $1",
          [encounterId],
        );

        for (const ref of updates.referrals) {
          const referralName =
            typeof ref === "string" ? ref : ref.referral_name || ref.name;
          if (referralName) {
            await client.query(
              `INSERT INTO neurology_referrals (encounter_id, referral_name)
                             VALUES ($1, $2)`,
              [encounterId, referralName],
            );
          }
        }
       }

      
      await client.query("COMMIT");

      
      res.json({
        success: true,
        message: "Encounter updated successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating encounter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update encounter",
      error: error.message,
    });
  }
};
export const deleteEncounter = async (req, res) => {
  try {
    const { encounterId } = req.params;

    // Delete main encounter (CASCADE will delete related records)
    const result = await db.query(
      `DELETE FROM neurology_encounters WHERE encounter_id = $1`,
      [encounterId],
    );

    res.json({
      success: true,
      message: "Encounter deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting encounter:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete encounter",
    });
  }
};

// ========== COMPLAINTS CONTROLLERS ==========
export const updateComplaints = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const complaintsData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_complaints WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(complaintsData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_complaints SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(complaintsData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(complaintsData)];

      await db.query(
        `INSERT INTO neurology_complaints (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Complaints updated successfully",
    });
  } catch (error) {
    console.error("Error updating complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update complaints",
    });
  }
};

// ========== HEADACHE CONTROLLERS ==========
export const updateHeadache = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const headacheData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_headache WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(headacheData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_headache SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(headacheData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(headacheData)];

      await db.query(
        `INSERT INTO neurology_headache (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Headache details updated successfully",
    });
  } catch (error) {
    console.error("Error updating headache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update headache details",
    });
  }
};

// ========== SEIZURE CONTROLLERS ==========
export const updateSeizure = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const seizureData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_seizures WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(seizureData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_seizures SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(seizureData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(seizureData)];

      await db.query(
        `INSERT INTO neurology_seizures (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Seizure details updated successfully",
    });
  } catch (error) {
    console.error("Error updating seizure:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update seizure details",
    });
  }
};

// ========== NEURO EXAM CONTROLLERS ==========
export const updateNeuroExam = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const examData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_neuro_exam WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(examData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_neuro_exam SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(examData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(examData)];

      await db.query(
        `INSERT INTO neurology_neuro_exam (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Neurological exam updated successfully",
    });
  } catch (error) {
    console.error("Error updating neuro exam:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update neurological exam",
    });
  }
};

// ========== IMAGING CONTROLLERS ==========
export const updateImaging = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const imagingData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_imaging WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(imagingData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_imaging SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(imagingData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(imagingData)];

      await db.query(
        `INSERT INTO neurology_imaging (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Imaging details updated successfully",
    });
  } catch (error) {
    console.error("Error updating imaging:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update imaging details",
    });
  }
};

// ========== ELECTROPHYSIOLOGY CONTROLLERS ==========
export const updateElectrophysiology = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const epData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_electrophysiology WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(epData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_electrophysiology SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(epData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(epData)];

      await db.query(
        `INSERT INTO neurology_electrophysiology (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Electrophysiology details updated successfully",
    });
  } catch (error) {
    console.error("Error updating electrophysiology:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update electrophysiology details",
    });
  }
};

// ========== LABS CONTROLLERS ==========
export const updateLabs = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const labsData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_labs WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(labsData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_labs SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(labsData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(labsData)];

      await db.query(
        `INSERT INTO neurology_labs (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Lab results updated successfully",
    });
  } catch (error) {
    console.error("Error updating labs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lab results",
    });
  }
};

// ========== ANALYSIS CONTROLLERS ==========
export const updateAnalysis = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const analysisData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_analysis WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(analysisData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_analysis SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(analysisData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(analysisData)];

      await db.query(
        `INSERT INTO neurology_analysis (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Analysis updated successfully",
    });
  } catch (error) {
    console.error("Error updating analysis:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update analysis",
    });
  }
};

// ========== DIAGNOSES CONTROLLERS ==========
export const addDiagnoses = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const diagnoses = req.body;

    // First delete existing diagnoses
    await db.query(`DELETE FROM neurology_diagnoses WHERE encounter_id = $1`, [
      encounterId,
    ]);

    // Insert new diagnoses
    if (diagnoses.primaryCondition) {
      await db.query(
        `INSERT INTO neurology_diagnoses 
         (encounter_id, diagnosis_type, diagnosis_name, affected_side, affected_joint, severity, fracture_type, ligament_grade) 
         VALUES ($1, 'primary', $2, $3, $4, $5, $6, $7)`,
        [
          encounterId,
          diagnoses.primaryCondition,
          diagnoses.affectedSide,
          diagnoses.affectedJoint,
          diagnoses.severity,
          diagnoses.fractureType,
          diagnoses.ligamentGrade,
        ],
      );
    }

    if (diagnoses.suspectedCondition) {
      await db.query(
        `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, diagnosis_name) 
         VALUES ($1, 'suspected', $2)`,
        [encounterId, diagnoses.suspectedCondition],
      );
    }

    if (diagnoses.differentials && diagnoses.differentials.length) {
      for (const diff of diagnoses.differentials) {
        await db.query(
          `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, diagnosis_name) 
           VALUES ($1, 'differential', $2)`,
          [encounterId, diff],
        );
      }
    }

    res.json({
      success: true,
      message: "Diagnoses added successfully",
    });
  } catch (error) {
    console.error("Error adding diagnoses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add diagnoses",
    });
  }
};

export const updateDiagnoses = async (req, res) => {
  return addDiagnoses(req, res);
};

// ========== MANAGEMENT CONTROLLERS ==========
export const updateManagement = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const managementData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_management WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(managementData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_management SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(managementData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(managementData)];

      await db.query(
        `INSERT INTO neurology_management (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Management plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating management:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update management plan",
    });
  }
};

// ========== MEDICATIONS CONTROLLERS ==========
export const updateMedications = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const medications = req.body.medications || [];

    // Delete existing medications
    await db.query(
      `DELETE FROM neurology_medications WHERE encounter_id = $1`,
      [encounterId],
    );

    // Insert new medications
    for (const med of medications) {
      await db.query(
        `INSERT INTO neurology_medications 
         (encounter_id, medication_name, dose, route, frequency, duration, purpose) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          encounterId,
          med.name,
          med.dose,
          med.route,
          med.frequency,
          med.duration,
          med.purpose,
        ],
      );
    }

    res.json({
      success: true,
      message: "Medications updated successfully",
    });
  } catch (error) {
    console.error("Error updating medications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medications",
    });
  }
};

// ========== NOTES CONTROLLERS ==========
export const updateNotes = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const notesData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_notes WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(notesData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_notes SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(notesData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(notesData)];

      await db.query(
        `INSERT INTO neurology_notes (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Notes updated successfully",
    });
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notes",
    });
  }
};

// ========== REFERRALS CONTROLLERS ==========
export const updateReferrals = async (req, res) => {
  try {
    const { encounterId } = req.params;
    const referralsData = req.body;

    const existing = await db.query(
      `SELECT * FROM neurology_referrals WHERE encounter_id = $1`,
      [encounterId],
    );

    if (existing.rows.length) {
      // Build dynamic UPDATE query
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(referralsData)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }

      values.push(encounterId);

      await db.query(
        `UPDATE neurology_referrals SET ${setClause.join(", ")} WHERE encounter_id = $${paramIndex}`,
        values,
      );
    } else {
      const columns = Object.keys(referralsData);
      const placeholders = columns.map((_, i) => `$${i + 2}`).join(", ");
      const values = [encounterId, ...Object.values(referralsData)];

      await db.query(
        `INSERT INTO neurology_referrals (encounter_id, ${columns.join(", ")}) 
         VALUES ($1, ${placeholders})`,
        values,
      );
    }

    res.json({
      success: true,
      message: "Referrals updated successfully",
    });
  } catch (error) {
    console.error("Error updating referrals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update referrals",
    });
  }
};

// ========== COMPLETE FORM SUBMISSION ==========
export const submitCompleteForm = async (req, res) => {
  try {
    //const data = req.body;
   
    const data = req.body;
    
   

    // First create the encounter
    const encounterResult = await db.query(
      `INSERT INTO neurology_encounters 
       (patient_id, encounter_date,  visit_id,  height_cm, weight_kg, bmi, allergies, 
        past_medical_history, past_surgical_history, family_history, social_history, 
        occupation, smoking_status, alcohol_use, lifestyle) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING encounter_id`,
      [
        data.patient_id,
        new Date(),
        data.visit_id,
        data.height_cm,
        data.weight_kg,
        data.bmi,
        data.allergies,
        data.past_medical_history,
        data.past_surgical_history,
        data.family_history,
        data.social_history,
        data.occupation,
        data.smoking_status,
        data.alcohol_use,
        data.lifestyle,
      ],
    );

    const encounterId = encounterResult.rows[0].encounter_id;

    // Insert complaints
    await db.query(
      `INSERT INTO neurology_complaints 
   (encounter_id, chief_complaint, onset_date, duration, progression,
    weakness_present, weakness_side, weakness_pattern, numbness, paresthesia) 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        encounterId,
        data.chief_complaint,
        data.onset_date || null,
        data.duration,
        data.progression,
        data.weakness_present,
        data.weakness_side,
        data.weakness_pattern,
        data.numbness,
        data.paresthesia,
      ],
    );

    // Insert headache
    await db.query(
      `INSERT INTO neurology_headache 
       (encounter_id, headache_type, headache_location, headache_severity, headache_triggers, headache_duration) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        encounterId,
        data.headache_type,
        data.headache_location,
        data.headache_severity,
        data.headache_triggers,
        data.headache_duration,
      ],
    );

    // Insert seizures
    await db.query(
      `INSERT INTO neurology_seizures 
       (encounter_id, seizures_present, seizure_type, seizure_frequency) 
       VALUES ($1, $2, $3, $4)`,
      [
        encounterId,
        data.seizures_present,
        data.seizure_type,
        data.seizure_frequency,
      ],
    );

    // Insert neuro exam
    await db.query(
      `INSERT INTO neurology_neuro_exam 
       (encounter_id, mental_status_orientation, memory_registration, memory_recall, cognition,
        cranial_nerve_findings, motor_tone, motor_power, muscle_bulk, reflexes_biceps,
        reflexes_triceps, reflexes_knee, reflexes_ankle, plantar_response, sensory_pain,
        sensory_temperature, sensory_vibration, sensory_proprioception, coordination_finger_nose,
        coordination_heel_shin, gait, romberg_test, tandem_walk, babinski, hoffmann,
        lhermitte, adls, mobility) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)`,
      [
        encounterId,
        data.mental_status_orientation,
        data.memory_registration,
        data.memory_recall,
        data.cognition,
        data.cranial_nerve_findings,
        data.motor_tone,
        data.motor_power,
        data.muscle_bulk,
        data.reflexes_biceps,
        data.reflexes_triceps,
        data.reflexes_knee,
        data.reflexes_ankle,
        data.plantar_response,
        data.sensory_pain,
        data.sensory_temperature,
        data.sensory_vibration,
        data.sensory_proprioception,
        data.coordination_finger_nose,
        data.coordination_heel_shin,
        data.gait,
        data.romberg_test,
        data.tandem_walk,
        data.babinski,
        data.hoffmann,
        data.lhermitte,
        data.adls,
        data.mobility,
      ],
    );

    // Insert imaging
    await db.query(
      `INSERT INTO neurology_imaging 
       (encounter_id, ct_brain, mri_brain, mr_angiography, mri_spine) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        encounterId,
        data.ct_brain,
        data.mri_brain,
        data.mr_angiography,
        data.mri_spine,
      ],
    );

    // Insert electrophysiology
    await db.query(
      `INSERT INTO neurology_electrophysiology 
       (encounter_id, eeg_ordered, ncs_ordered, emg_ordered) 
       VALUES ($1, $2, $3, $4)`,
      [encounterId, data.eeg_ordered, data.ncs_ordered, data.emg_ordered],
    );

    // Insert labs - FIXED: Using PostgreSQL array syntax
    await db.query(
      `INSERT INTO neurology_labs 
       (encounter_id, lab_tests, cbc_results, electrolyte_results, thyroid_results, esr_crp_results, autoimmune_results) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        encounterId,
        data.lab_tests || data.labTests || [], // PostgreSQL accepts array directly
        data.cbc_results,
        data.electrolyte_results,
        data.thyroid_results,
        data.esr_crp_results,
        data.autoimmune_results,
      ],
    );

    // Insert analysis
    await db.query(
      `INSERT INTO neurology_analysis 
       (encounter_id, mri_findings, mr_angio_findings, eeg_results, ncs_results, comparison_previous) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        encounterId,
        data.mri_findings,
        data.mr_angio_findings,
        data.eeg_results,
        data.ncs_results,
        data.comparison_previous,
      ],
    );

    // Insert primary diagnosis
    if (data.primary_diagnosis) {
      await db.query(
        `INSERT INTO neurology_diagnoses 
         (encounter_id, diagnosis_type, diagnosis_name, icd10_code, disease_classification, severity, stage, comorbidities) 
         VALUES ($1, 'primary', $2, $3, $4, $5, $6, $7)`,
        [
          encounterId,
          data.primary_diagnosis,
          data.icd10_code,
          data.disease_classification,
          data.severity,
          data.stage,
          data.comorbidities,
        ],
      );
    }

    // Insert secondary diagnosis
    if (data.secondary_diagnosis) {
      await db.query(
        `INSERT INTO neurology_diagnoses (encounter_id, diagnosis_type, diagnosis_name) 
         VALUES ($1, 'secondary', $2)`,
        [encounterId, data.secondary_diagnosis],
      );
    }

    // Insert medications
    if (data.medications && data.medications.length) {
      for (const med of data.medications) {
        await db.query(
          `INSERT INTO neurology_medications 
           (encounter_id, medication_name, dose, route, frequency, duration, purpose) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            encounterId,
            med.name,
            med.dose,
            med.route,
            med.frequency,
            med.duration,
            med.purpose,
          ],
        );
      }
    }

    // Insert management
    await db.query(
      `INSERT INTO neurology_management 
       (encounter_id, pain_management, spasticity_management, seizure_control, lifestyle_recommendations,
        rehabilitation, surgical_plan, endovascular, botulinum_toxin, physiotherapy,
        occupational_therapy, speech_therapy, follow_up_timing, repeat_imaging, repeat_labs,
        monitoring, warning_signs) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        encounterId,
        data.pain_management,
        data.spasticity_management,
        data.seizure_control,
        data.lifestyle_recommendations,
        data.rehabilitation,
        data.surgical_plan,
        data.endovascular,
        data.botulinum_toxin,
        data.physiotherapy,
        data.occupational_therapy,
        data.speech_therapy,
        data.follow_up_timing,
        data.repeat_imaging,
        data.repeat_labs,
        data.monitoring,
        data.warning_signs,
      ],
    );

    // Insert notes
    await db.query(
      `INSERT INTO neurology_notes 
       (encounter_id, clinical_observations, patient_questions, caregiver_questions, education_provided, multidisciplinary_care) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        encounterId,
        data.clinical_observations,
        data.patient_questions,
        data.caregiver_questions,
        data.education_provided,
        data.multidisciplinary_care,
      ],
    );

    // Insert referrals
    if (data.referrals && data.referrals.length) {
      for (const ref of data.referrals) {
        await db.query(
          `INSERT INTO neurology_referrals (encounter_id, referral_name) VALUES ($1, $2)`,
          [encounterId, ref],
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Neurology form submitted successfully",
      encounter_id: encounterId,
    });
  } catch (error) {
    console.error("Error submitting complete form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit form",
      error: error.message,
    });
  }
};

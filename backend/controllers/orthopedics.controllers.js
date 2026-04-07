import pool from "../db.js"; 

/**
 * Calculate age from date of birth
 * Returns age in years
 */
const calculateAge = (dob) => {
  if (!dob) return null;

  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};


// Helper function to clean and truncate strings
const cleanString = (str, maxLength) => {
  if (!str) return null;
  const cleaned = String(str).trim();
  return cleaned.length > 0 ? cleaned.substring(0, maxLength) : null;
};

// Helper function to clean phone numbers
const cleanPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  // Limit to 15 characters
  return cleaned.length > 0 ? cleaned.substring(0, 15) : null;
};
/**
 * Generate a unique patient visit ID
 */
const generatePatientVisitId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORTH-${year}-${randomNum}`;
};
/**
 * Get all patients with pagination
 * GET /api/orthopedics/patients
 */
export const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = `
            SELECT 
                patient_id, patient_name, email, gender, dob, age,
                blood_group, contact_number, address, emergency_name,
                emergency_contact_number, created_at
            FROM patient
        `;

    let countQuery = "SELECT COUNT(*) FROM patient";
    const values = [];

    if (search) {
      query += ` WHERE patient_name ILIKE $1 OR email ILIKE $1 OR contact_number ILIKE $1`;
      countQuery += ` WHERE patient_name ILIKE $1 OR email ILIKE $1 OR contact_number ILIKE $1`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    const result = await pool.query(query, [...values, limit, offset]);
    const countResult = await pool.query(countQuery, values);

    res.status(200).json({
      success: true,
      data: result.rows, // Age is already in the database
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching patients",
      error: error.message,
    });
  }
};

// ==================== ENCOUNTER CONTROLLERS ====================
 /* Get all encounters for a patient
 * GET /api/orthopedics/patients/:patientId/encounters
 */
export const getPatientEncounters = async (req, res) => {
  try {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    

    const query = `
      SELECT 
        e.*,
        p.patient_name,
        p.dob,
        p.gender,
        p.blood_group,
        p.contact_number,
        p.email,
        p.address,
        p.emergency_name,
        p.emergency_contact_number
      FROM encounters e
      JOIN patient p ON p.patient_id = e.patient_id
      WHERE e.patient_id = $1
      ORDER BY e.encounter_date DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM encounters WHERE patient_id = $1
    `;

    const result = await pool.query(query, [patientId, limit, offset]);
    const countResult = await pool.query(countQuery, [patientId]);

    // Add age to each encounter
    const encountersWithAge = result.rows.map(encounter => ({
      ...encounter,
      patient_age: calculateAge(encounter.dob)
    }));

    res.status(200).json({
      success: true,
      data: encountersWithAge,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patient encounters:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching encounters",
      error: error.message,
    });
  }
};

/**
 * Get complete encounter details with all related data
 * GET /api/orthopedics/encounters/:encounterId/full
 */
export const getFullEncounterDetails = async (req, res) => {
  try {
    const { encounterId } = req.params;

    // Get encounter basic info with all patient details
    const encounterQuery = `
      SELECT 
        e.*,
        p.patient_id,
        p.patient_name,
        p.dob,
        p.gender,
        p.blood_group,
        p.contact_number,
        p.email,
        p.address,
        p.emergency_name,
        p.emergency_contact_number,
        p.created_at as patient_created_at
      FROM encounters e
      JOIN patient p ON p.patient_id = e.patient_id
      WHERE e.encounter_id = $1
    `;

    const encounterResult = await pool.query(encounterQuery, [encounterId]);

    if (encounterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Encounter not found",
      });
    }

    const encounter = encounterResult.rows[0];
    
    // Calculate age
    const age = calculateAge(encounter.dob);

    // Get complaints
    const complaints = await pool.query(
      "SELECT * FROM encounter_complaints WHERE encounter_id = $1",
      [encounterId],
    );

    // Get physical exam
    const physicalExam = await pool.query(
      "SELECT * FROM encounter_physical_exam WHERE encounter_id = $1",
      [encounterId],
    );

    // Get imaging
    const imaging = await pool.query(
      "SELECT * FROM encounter_imaging WHERE encounter_id = $1",
      [encounterId],
    );

    // Get labs
    const labs = await pool.query(
      "SELECT * FROM encounter_labs WHERE encounter_id = $1",
      [encounterId],
    );

    // Get diagnoses
    const diagnoses = await pool.query(
      "SELECT * FROM encounter_diagnoses WHERE encounter_id = $1 ORDER BY display_order",
      [encounterId],
    );

    // Get management plan
    const management = await pool.query(
      "SELECT * FROM encounter_management WHERE encounter_id = $1",
      [encounterId],
    );

    // Get rehab milestones
    const rehabMilestones = await pool.query(
      "SELECT * FROM encounter_rehab_milestones WHERE encounter_id = $1 ORDER BY display_order",
      [encounterId],
    );

    // Get referrals
    const referrals = await pool.query(
      "SELECT * FROM encounter_referrals WHERE encounter_id = $1",
      [encounterId],
    );

    // Get physician notes
    const notes = await pool.query(
      "SELECT * FROM encounter_notes WHERE encounter_id = $1",
      [encounterId],
    );

    // Structure the response with all patient details including age and blood group
    res.status(200).json({
      success: true,
      data: {
        encounter: {
          // Encounter details
          encounter_id: encounter.encounter_id,
          encounter_date: encounter.encounter_date,
          patient_id_at_visit: encounter.patient_id_at_visit,
          height_cm: encounter.height_cm,
          weight_kg: encounter.weight_kg,
          bmi: encounter.bmi,
          allergies: encounter.allergies,
          past_medical_history: encounter.past_medical_history,
          past_surgical_history: encounter.past_surgical_history,
          family_history: encounter.family_history,
          social_history: encounter.social_history,
          occupation: encounter.occupation,
          physical_activity_level: encounter.physical_activity_level,
          smoking_status: encounter.smoking_status,
          alcohol_use: encounter.alcohol_use,
          
          // Patient details with age and blood group
          patient_id: encounter.patient_id,
          patient_name: encounter.patient_name,
          dob: encounter.dob,
          age: age,
          gender: encounter.gender,
          blood_group: encounter.blood_group,
          contact_number: encounter.contact_number,
          email: encounter.email,
          address: encounter.address,
          emergency_name: encounter.emergency_name,
          emergency_contact_number: encounter.emergency_contact_number,
          patient_created_at: encounter.patient_created_at
        },
        complaints: complaints.rows[0] || null,
        physical_exam: physicalExam.rows[0] || null,
        imaging: imaging.rows[0] || null,
        labs: labs.rows[0] || null,
        diagnoses: diagnoses.rows,
        management: management.rows[0] || null,
        rehab_milestones: rehabMilestones.rows,
        referrals: referrals.rows[0] || null,
        notes: notes.rows[0] || null,
      },
    });
  } catch (error) {
    console.error("Error fetching full encounter details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching encounter details",
      error: error.message,
    });
  }
};
/**
 * Submit complete orthopedic form data
 * POST /api/orthopedics/submit-form
 */

export const submitCompleteForm = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const formData = req.body;

    // 1. Create or get patient
    // 1. Create or get patient - FIXED
    let patientId = null;
    let displayPatientId = formData.patientId || generatePatientVisitId();

    if (formData.patient_id) {
      // If patient_id is provided, check if it's the integer ID or string ID
      const patientCheck = await client.query(
        "SELECT patient_id FROM patient WHERE patient_id = $1 OR patient_id::text = $2",
        [formData.patient_id, formData.patient_id],
      );

      if (patientCheck.rows.length > 0) {
        patientId = patientCheck.rows[0].patient_id; // Get the integer ID
      } else {
        // If not found by ID, try by email
        const emailCheck = await client.query(
          "SELECT patient_id FROM patient WHERE email = $1",
          [formData.contactEmail],
        );

        if (emailCheck.rows.length > 0) {
          patientId = emailCheck.rows[0].patient_id;
        }
      }
    }

    if (!patientId) {
      // Create new patient
      const age = calculateAge(formData.dob);

      const patientResult = await client.query(
        `INSERT INTO patient (
        patient_name, email, gender, dob, age, blood_group, 
        contact_number, address, emergency_name, emergency_contact_number
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING patient_id`,
        [
          cleanString(formData.name, 100),
          cleanString(formData.contactEmail, 150),
          cleanString(formData.gender, 10),
          formData.dob,
          age,
          // Handle null/undefined values
          formData.blood_group ? cleanString(formData.blood_group, 5) : null,
          cleanPhoneNumber(formData.contactPhone),
          formData.address || null,
          formData.emergency_name
            ? cleanString(formData.emergency_name, 100)
            : null,
          formData.emergency_contact_number
            ? cleanPhoneNumber(formData.emergency_contact_number)
            : null,
        ],
      );
      patientId = patientResult.rows[0].patient_id;
    }

    // 2. Create encounter with correct values
    const encounterResult = await client.query(
      `INSERT INTO encounters (
        patient_id, patient_id_at_visit, height_cm, weight_kg, bmi,
        allergies, past_medical_history, past_surgical_history,
        family_history, social_history, occupation,
        physical_activity_level, smoking_status, alcohol_use
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING encounter_id`,
      [
        // $1: patient_id - MUST be integer
        parseInt(patientId),

        // $2: patient_id_at_visit - string ID
        displayPatientId,

        // $3: height_cm
        formData.height ? parseFloat(formData.height) : null,

        // $4: weight_kg
        formData.weight ? parseFloat(formData.weight) : null,

        // $5: bmi
        formData.bmi ? parseFloat(formData.bmi) : null,

        // $6: allergies - TEXT (no limit)
        formData.allergies || null,

        // $7: past_medical_history - TEXT
        formData.pastMedicalHistory || null,

        // $8: past_surgical_history - TEXT
        formData.pastSurgicalHistory || null,

        // $9: family_history - TEXT
        formData.familyHistory || null,

        // $10: social_history - TEXT
        formData.socialHistory || null,

        // $11: occupation - VARCHAR(100)
        formData.occupation
          ? String(formData.occupation).substring(0, 100)
          : null,

        // $12: physical_activity_level - VARCHAR(50)
        formData.physicalActivity
          ? String(formData.physicalActivity).substring(0, 50)
          : null,

        // $13: smoking_status - VARCHAR(20)
        formData.smokingStatus
          ? String(formData.smokingStatus).substring(0, 20)
          : null,

        // $14: alcohol_use - VARCHAR(100)
        formData.alcoholUse
          ? String(formData.alcoholUse).substring(0, 100)
          : null,
      ],
    );

    const encounterId = encounterResult.rows[0].encounter_id;

    // 3. Add complaints
    // In the complaints insert (around line where you insert complaints):
    // In submitCompleteForm function, find the complaints insert section
    // Add truncation for all VARCHAR fields

    await client.query(
      `INSERT INTO encounter_complaints (
        encounter_id, chief_complaint, onset_date, duration,
        progression, pain_location, pain_intensity, pain_type,
        pain_radiation, swelling, redness, warmth, trauma_mechanism,
        trauma_time, functional_limitation, mobility_limitation,
        adl_limitation, range_motion_loss, numbness, tingling, weakness
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        encounterId,
        formData.chiefComplaint, // TEXT - no limit
        formData.onset, // DATE
        formData.duration, // VARCHAR(50)
        formData.progression, // VARCHAR(50)
        formData.painLocation, // TEXT
        formData.painIntensity ? parseInt(formData.painIntensity) : null, // INTEGER
        formData.painType ? String(formData.painType).substring(0, 50) : null, // VARCHAR(50)
        formData.painRadiation, // TEXT
        // Fix swelling - VARCHAR(20)
        formData.swelling ? String(formData.swelling).substring(0, 20) : null,
        // redness - VARCHAR(10)
        formData.redness ? String(formData.redness).substring(0, 10) : null,
        // warmth - VARCHAR(10)
        formData.warmth ? String(formData.warmth).substring(0, 10) : null,
        formData.traumaMechanism, // TEXT
        formData.traumaTime, // VARCHAR(100)
        formData.functionalLimitation, // TEXT
        formData.mobilityLimitation, // TEXT
        formData.adlLimitation, // TEXT
        formData.rangeMotionLoss, // TEXT
        // numbness - VARCHAR(10)
        formData.numbness ? String(formData.numbness).substring(0, 10) : null,
        // tingling - VARCHAR(10)
        formData.tingling ? String(formData.tingling).substring(0, 10) : null,
        // weakness - VARCHAR(10)
        formData.weakness ? String(formData.weakness).substring(0, 10) : null,
      ],
    );

    // 4. Add physical exam
    await client.query(
      `INSERT INTO encounter_physical_exam (
                encounter_id, inspection, deformity, scars,
                palpation_tenderness, warmth_on_palpation, crepitus,
                rom_active_flexion, rom_passive_flexion,
                rom_active_extension, rom_passive_extension,
                quadriceps_strength, hamstring_strength, calf_strength,
                pulses, sensation, motor_function, gait,
                special_tests, joint_instability
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        encounterId,
        formData.inspection,
        formData.deformity,
        formData.scars,
        formData.palpationTenderness,
        formData.warmth,
        formData.crepitus,
        formData.romActiveFlexion,
        formData.romPassiveFlexion,
        formData.romActiveExtension,
        formData.romPassiveExtension,
        formData.quadStrength,
        formData.hamstringStrength,
        formData.calfStrength,
        formData.pulses,
        formData.sensation,
        formData.motorFunction,
        formData.gait,
        formData.specialTests,
        formData.jointInstability,
      ],
    );

    // 5. Add imaging
    await client.query(
      `INSERT INTO encounter_imaging (
                encounter_id, xray_done, xray_findings, mri_done,
                mri_indication, ct_done, ultrasound_done, dexa_done
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        encounterId,
        formData.xrayDone,
        formData.xrayFindings,
        formData.mriDone,
        formData.mriIndication,
        formData.ctDone,
        formData.ultrasoundDone,
        formData.dexaDone,
      ],
    );

    // 6. Add labs
    await client.query(
      `INSERT INTO encounter_labs (
                encounter_id, cbc_ordered, esr_ordered, crp_ordered,
                rheumatoid_factor_ordered, uric_acid_ordered,
                calcium_ordered, vitamin_d_ordered, alp_ordered,
                cbc_results, esr_results, crp_results,
                other_labs_results, other_lab_tests
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        encounterId,
        formData.labTests?.includes("CBC") || false,
        formData.labTests?.includes("ESR") || false,
        formData.labTests?.includes("CRP") || false,
        formData.labTests?.includes("Rheumatoid Factor") || false,
        formData.labTests?.includes("Uric Acid") || false,
        formData.labTests?.includes("Calcium") || false,
        formData.labTests?.includes("Vitamin D") || false,
        formData.labTests?.includes("ALP") || false,
        formData.cbcResults,
        formData.esrResults,
        formData.crpResults,
        formData.otherLabs,
        null,
      ],
    );

    // 7. Add diagnoses
    // ==================== DIAGNOSES SECTION (UPDATED) ====================
    // 7. Add diagnoses with proper handling of all types
    const diagnoses = [];

    // 1. Add Primary Diagnosis
    if (
      formData.primaryCondition &&
      formData.primaryCondition !== "Not applicable"
    ) {
      diagnoses.push({
        type: "primary",
        name: formData.primaryCondition,
        side: formData.affectedSide,
        joint: formData.affectedJoint,
        severity: formData.severity,
        fracture: formData.fractureType,
        ligament: formData.ligamentGrade,
      });
    }

    // 2. Add Suspected Conditions (handle both string and array formats)
    if (
      formData.suspectedCondition &&
      formData.suspectedCondition !== "Not applicable"
    ) {
      // Check if it's an array or needs to be split
      let suspectedList = [];

      if (Array.isArray(formData.suspectedCondition)) {
        suspectedList = formData.suspectedCondition;
      } else if (typeof formData.suspectedCondition === "string") {
        // Split by comma and trim
        suspectedList = formData.suspectedCondition
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "" && s.toLowerCase() !== "not applicable");
      }

      suspectedList.forEach((suspected) => {
        if (suspected && suspected !== "") {
          diagnoses.push({
            type: "suspected",
            name: suspected,
            side: formData.affectedSide,
            joint: formData.affectedJoint,
            severity: formData.severity,
            fracture: formData.fractureType,
            ligament: formData.ligamentGrade,
          });
        }
      });
    }

    // 3. Add Differential Diagnoses (array of strings)
    if (
      formData.differentials &&
      Array.isArray(formData.differentials) &&
      formData.differentials.length > 0
    ) {
      formData.differentials.forEach((diff) => {
        if (
          diff &&
          diff.trim() !== "" &&
          diff.toLowerCase() !== "not applicable"
        ) {
          diagnoses.push({
            type: "differential",
            name: diff.trim(),
            side: formData.affectedSide,
            joint: formData.affectedJoint,
            severity: formData.severity,
            fracture: formData.fractureType,
            ligament: formData.ligamentGrade,
          });
        }
      });
    }

    // Insert all diagnoses with display_order
    let displayOrder = 1;
    for (const diagnosis of diagnoses) {
      if (diagnosis.name && diagnosis.name !== "Not applicable") {
        await client.query(
          `INSERT INTO encounter_diagnoses (
                encounter_id, diagnosis_type, diagnosis_name,
                affected_side, affected_joint, severity,
                fracture_type, ligament_grade, display_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            encounterId,
            diagnosis.type,
            diagnosis.name,
            diagnosis.side || null,
            diagnosis.joint || null,
            diagnosis.severity || null,
            diagnosis.fracture || null,
            diagnosis.ligament || null,
            displayOrder++,
          ],
        );
      }
    }
    // 8. Add management plan
    await client.query(
      `INSERT INTO encounter_management (
                encounter_id, immobilization_type, physiotherapy,
                pain_medications, activity_modification, surgical_plan,
                fracture_fixation, arthroscopy, joint_replacement,
                post_op_care, follow_up_timeline, repeat_imaging_schedule,
                red_flag_symptoms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        encounterId,
        formData.immobilizationType,
        formData.physiotherapy,
        formData.painMedications,
        formData.activityModification,
        formData.surgicalPlan,
        formData.fractureFixation,
        formData.arthroscopy,
        formData.jointReplacement,
        formData.postOpCare,
        formData.followUpTimeline,
        formData.repeatImaging,
        formData.redFlags,
      ],
    );

    // 9. Add rehab milestones
    if (formData.rehabMilestones && formData.rehabMilestones.length > 0) {
      for (let i = 0; i < formData.rehabMilestones.length; i++) {
        await client.query(
          `INSERT INTO encounter_rehab_milestones (
                        encounter_id, milestone_description, display_order
                    ) VALUES ($1, $2, $3)`,
          [encounterId, formData.rehabMilestones[i], i + 1],
        );
      }
    }

    // 10. Add referrals
    await client.query(
      `INSERT INTO encounter_referrals (
        encounter_id, pt_referral, pain_clinic, surgery_referral
    ) VALUES ($1, $2, $3, $4)`,
      [
        encounterId,
        formData.ptReferral
          ? String(formData.ptReferral).substring(0, 20)
          : null,
        formData.painClinic
          ? String(formData.painClinic).substring(0, 20)
          : null,
        formData.surgeryReferral
          ? String(formData.surgeryReferral).substring(0, 30)
          : null,
      ],
    );
    // 11. Add physician notes
    await client.query(
      `INSERT INTO encounter_notes (
                encounter_id, additional_observations, counseling,
                patient_questions, education_provided
            ) VALUES ($1, $2, $3, $4, $5)`,
      [
        encounterId,
        formData.additionalObservations,
        formData.counseling,
        formData.patientQuestions,
        formData.education,
      ],
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Orthopedic form submitted successfully",
      data: {
        patient_id: patientId,
        encounter_id: encounterId,
        patient_id_at_visit: formData.patientId,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error submitting complete form:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while submitting form",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

// ==================== PATCH CONTROLLERS FOR PARTIAL UPDATES ====================
/**
 * Partially update patient information
 * PATCH /api/orthopedics/patients/:id
 */
export const patchPatient = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const updates = req.body;
// Debug log

        // Check if patient exists
        const existingPatient = await client.query(
            'SELECT patient_id FROM patient WHERE patient_id = $1',
            [id]
        );

        if (existingPatient.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Helper function to clean strings
        const cleanString = (str, maxLength) => {
            if (!str) return null;
            const cleaned = String(str).trim();
            return cleaned.length > 0 ? cleaned.substring(0, maxLength) : null;
        };

        const cleanPhoneNumber = (phone) => {
            if (!phone) return null;
            const cleaned = phone.replace(/\D/g, '');
            return cleaned.length > 0 ? cleaned.substring(0, 15) : null;
        };

        // Calculate age if DOB is updated
        let age = null;
        if (updates.dob) {
            const calculateAge = (dob) => {
                const today = new Date();
                const birthDate = new Date(dob);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            };
            age = calculateAge(updates.dob);
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            name: { dbField: 'patient_name', process: (v) => cleanString(v, 100) },
            email: { dbField: 'email', process: (v) => cleanString(v, 150) },
            gender: { dbField: 'gender', process: (v) => cleanString(v, 10) },
            dob: { dbField: 'dob', process: (v) => v },
            bloodGroup: { dbField: 'blood_group', process: (v) => cleanString(v, 5) },
            contactPhone: { dbField: 'contact_number', process: (v) => cleanPhoneNumber(v) },
            contactEmail: { dbField: 'email', process: (v) => cleanString(v, 150) }, // Alias for email
            address: { dbField: 'address', process: (v) => v },
            emergencyName: { dbField: 'emergency_name', process: (v) => cleanString(v, 100) },
            emergencyContactNumber: { dbField: 'emergency_contact_number', process: (v) => cleanPhoneNumber(v) }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined && value !== null) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        // Add age if dob was updated
        if (updates.dob && age !== null) {
            updateFields.push(`age = $${paramIndex}`);
            values.push(age);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(id);
        const query = `
            UPDATE patient 
            SET ${updateFields.join(', ')}
            WHERE patient_id = $${paramIndex}
            RETURNING *
        `;

       

        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Patient updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching patient:', error);
        
        // Check for duplicate email error
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists in the system',
                error: 'duplicate_email'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating patient',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update encounter basic information
 * PATCH /api/orthopedics/encounters/:encounterId
 */
export const patchEncounter = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;

        // Check if encounter exists
        const existingEncounter = await client.query(
            'SELECT encounter_id FROM encounters WHERE encounter_id = $1',
            [encounterId]
        );

        if (existingEncounter.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Encounter not found'
            });
        }

        // Helper function to clean strings
        const cleanString = (str, maxLength) => {
            if (!str) return null;
            const cleaned = String(str).trim();
            return cleaned.length > 0 ? cleaned.substring(0, maxLength) : null;
        };

        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

      const fieldMappings = {
    patient_id_at_visit: () => updates.patientId,
    height_cm: () => updates.height ? parseFloat(updates.height) : null,
    weight_kg: () => updates.weight ? parseFloat(updates.weight) : null,
    bmi: () => updates.bmi ? parseFloat(updates.bmi) : null,
    allergies: () => updates.allergies,
    past_medical_history: () => updates.pastMedicalHistory,
    past_surgical_history: () => updates.pastSurgicalHistory,
    family_history: () => updates.familyHistory,
    social_history: () => updates.socialHistory,
    occupation: () => cleanString(updates.occupation, 100),
    physical_activity_level: () => cleanString(updates.physicalActivity, 50),
    smoking_status: () => cleanString(updates.smokingStatus, 20),
    alcohol_use: () => cleanString(updates.alcoholUse, 100)
};


       for (const [dbField, getValue] of Object.entries(fieldMappings)) {
    // Check if the source field exists in updates
    const sourceField = (() => {
        if (dbField === 'height_cm') return 'height' in updates;
        if (dbField === 'weight_kg') return 'weight' in updates;
        if (dbField === 'past_medical_history') return 'pastMedicalHistory' in updates;
        if (dbField === 'past_surgical_history') return 'pastSurgicalHistory' in updates;
        if (dbField === 'family_history') return 'familyHistory' in updates;
        if (dbField === 'social_history') return 'socialHistory' in updates;
        if (dbField === 'physical_activity_level') return 'physicalActivity' in updates;
        if (dbField === 'smoking_status') return 'smokingStatus' in updates;
        if (dbField === 'alcohol_use') return 'alcoholUse' in updates;
        return dbField in updates;
    })();

    if (sourceField) {
        const value = getValue();
        if (value !== undefined) {
            updateFields.push(`${dbField} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    }
} 
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounters 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;

        const result = await client.query(query, values);
        
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Encounter updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching encounter:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating encounter',
            error: error.message
        });
    } finally {
        client.release();
    }
};


/**
 * Partially update complaints
 * PATCH /api/orthopedics/encounters/:encounterId/complaints
 */
export const patchComplaints = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;

        // Check if complaints exist
        const existing = await client.query(
            'SELECT complaint_id FROM encounter_complaints WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Complaints not found for this encounter'
            });
        }

        // Helper function to clean strings
        const cleanString = (str, maxLength) => {
            if (!str) return null;
            const cleaned = String(str).trim();
            return cleaned.length > 0 ? cleaned.substring(0, maxLength) : null;
        };

        // Map frontend field names to database column names and their processing functions
        const fieldMappings = {
            // Frontend field: [database field, processing function]
            chiefComplaint: ['chief_complaint', (v) => v],
            onset: ['onset_date', (v) => v],
            duration: ['duration', (v) => v],
            progression: ['progression', (v) => v],
            painLocation: ['pain_location', (v) => v],
            painIntensity: ['pain_intensity', (v) => v ? parseInt(v) : null],
            painType: ['pain_type', (v) => cleanString(v, 50)],
            painRadiation: ['pain_radiation', (v) => v],
            swelling: ['swelling', (v) => cleanString(v, 20)],
            redness: ['redness', (v) => cleanString(v, 10)],
            warmth: ['warmth', (v) => cleanString(v, 10)],
            traumaMechanism: ['trauma_mechanism', (v) => v],
            traumaTime: ['trauma_time', (v) => v],
            functionalLimitation: ['functional_limitation', (v) => v],
            mobilityLimitation: ['mobility_limitation', (v) => v],
            adlLimitation: ['adl_limitation', (v) => v],
            rangeMotionLoss: ['range_motion_loss', (v) => v],
            numbness: ['numbness', (v) => cleanString(v, 10)],
            tingling: ['tingling', (v) => cleanString(v, 10)],
            weakness: ['weakness', (v) => cleanString(v, 10)]
        };

        // Build dynamic update query based on what was sent from frontend
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const [dbField, processFn] = fieldMappings[frontendField];
                const processedValue = processFn(updates[frontendField]);
                
                if (processedValue !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(processedValue);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_complaints 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;


        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Complaints updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching complaints:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating complaints',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update physical examination
 * PATCH /api/orthopedics/encounters/:encounterId/physical-exam
 */
export const patchPhysicalExam = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;


        // Check if physical exam exists
        const existing = await client.query(
            'SELECT exam_id FROM encounter_physical_exam WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Physical exam not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            inspection: { dbField: 'inspection', process: (v) => v },
            deformity: { dbField: 'deformity', process: (v) => v },
            scars: { dbField: 'scars', process: (v) => v },
            palpationTenderness: { dbField: 'palpation_tenderness', process: (v) => v },
            palpationWarmth: { dbField: 'warmth_on_palpation', process: (v) => v },
            crepitus: { dbField: 'crepitus', process: (v) => v },
            romActiveFlexion: { dbField: 'rom_active_flexion', process: (v) => v },
            romPassiveFlexion: { dbField: 'rom_passive_flexion', process: (v) => v },
            romActiveExtension: { dbField: 'rom_active_extension', process: (v) => v },
            romPassiveExtension: { dbField: 'rom_passive_extension', process: (v) => v },
            quadStrength: { dbField: 'quadriceps_strength', process: (v) => v },
            hamstringStrength: { dbField: 'hamstring_strength', process: (v) => v },
            calfStrength: { dbField: 'calf_strength', process: (v) => v },
            pulses: { dbField: 'pulses', process: (v) => v },
            sensation: { dbField: 'sensation', process: (v) => v },
            motorFunction: { dbField: 'motor_function', process: (v) => v },
            gait: { dbField: 'gait', process: (v) => v },
            specialTests: { dbField: 'special_tests', process: (v) => v },
            jointInstability: { dbField: 'joint_instability', process: (v) => v }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_physical_exam 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;


        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Physical exam updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching physical exam:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating physical exam',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update imaging
 * PATCH /api/orthopedics/encounters/:encounterId/imaging
 */
export const patchImaging = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;


        // Check if imaging exists
        const existing = await client.query(
            'SELECT imaging_id FROM encounter_imaging WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Imaging not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            xrayDone: { dbField: 'xray_done', process: (v) => v },
            xrayFindings: { dbField: 'xray_findings', process: (v) => v },
            mriDone: { dbField: 'mri_done', process: (v) => v },
            mriIndication: { dbField: 'mri_indication', process: (v) => v },
            ctDone: { dbField: 'ct_done', process: (v) => v },
            ultrasoundDone: { dbField: 'ultrasound_done', process: (v) => v },
            dexaDone: { dbField: 'dexa_done', process: (v) => v }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_imaging 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;

  

        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Imaging updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching imaging:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating imaging',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update labs
 * PATCH /api/orthopedics/encounters/:encounterId/labs
 */
export const patchLabs = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;


        // Check if labs exist
        const existing = await client.query(
            'SELECT lab_id FROM encounter_labs WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Labs not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            // Lab test ordered flags
            cbcOrdered: { 
                dbField: 'cbc_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            esrOrdered: { 
                dbField: 'esr_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            crpOrdered: { 
                dbField: 'crp_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            rheumatoidFactorOrdered: { 
                dbField: 'rheumatoid_factor_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            uricAcidOrdered: { 
                dbField: 'uric_acid_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            calciumOrdered: { 
                dbField: 'calcium_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            vitaminDOrdered: { 
                dbField: 'vitamin_d_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            alpOrdered: { 
                dbField: 'alp_ordered', 
                process: (v) => v !== undefined ? v : false 
            },
            
            // Lab results
            cbcResults: { 
                dbField: 'cbc_results', 
                process: (v) => v 
            },
            esrResults: { 
                dbField: 'esr_results', 
                process: (v) => v 
            },
            crpResults: { 
                dbField: 'crp_results', 
                process: (v) => v 
            },
            otherLabs: { 
                dbField: 'other_labs_results', 
                process: (v) => v 
            },
            otherLabTests: { 
                dbField: 'other_lab_tests', 
                process: (v) => v 
            }
        };

        // Special handling for labTests array (if sent)
        if (updates.labTests && Array.isArray(updates.labTests)) {
            const labTests = updates.labTests;
            // Convert array to individual ordered flags
            const labFlags = {
                cbcOrdered: labTests.includes('CBC'),
                esrOrdered: labTests.includes('ESR'),
                crpOrdered: labTests.includes('CRP'),
                rheumatoidFactorOrdered: labTests.includes('Rheumatoid Factor'),
                uricAcidOrdered: labTests.includes('Uric Acid'),
                calciumOrdered: labTests.includes('Calcium'),
                vitaminDOrdered: labTests.includes('Vitamin D'),
                alpOrdered: labTests.includes('ALP')
            };
            
            // Merge with existing updates
            Object.assign(updates, labFlags);
        }

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_labs 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;


        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Labs updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching labs:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating labs',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update diagnoses
 * PATCH /api/orthopedics/encounters/:encounterId/diagnoses
 */
export const patchDiagnoses = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;

        

        // Delete all existing diagnoses for this encounter
        await client.query(
            'DELETE FROM encounter_diagnoses WHERE encounter_id = $1',
            [encounterId]
        );

        // Re-insert all diagnoses
        let displayOrder = 1;

        // Insert Primary Diagnosis
        if (updates.primaryCondition && updates.primaryCondition !== "Not applicable") {
            await client.query(
                `INSERT INTO encounter_diagnoses (
                    encounter_id, diagnosis_type, diagnosis_name,
                    affected_side, affected_joint, severity,
                    fracture_type, ligament_grade, display_order
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    encounterId,
                    'primary',
                    updates.primaryCondition,
                    updates.affectedSide || null,
                    updates.affectedJoint || null,
                    updates.severity || null,
                    updates.fractureType === "Not applicable" ? null : updates.fractureType,
                    updates.ligamentGrade === "Not applicable" ? null : updates.ligamentGrade,
                    displayOrder++
                ]
            );
        }

        // Insert Suspected Conditions
        if (updates.suspectedCondition && updates.suspectedCondition !== "Not applicable") {
            let suspectedList = [];
            
            if (Array.isArray(updates.suspectedCondition)) {
                suspectedList = updates.suspectedCondition;
            } else if (typeof updates.suspectedCondition === 'string') {
                suspectedList = updates.suspectedCondition
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s && s.toLowerCase() !== 'not applicable');
            }

            for (const suspected of suspectedList) {
                if (suspected) {
                    await client.query(
                        `INSERT INTO encounter_diagnoses (
                            encounter_id, diagnosis_type, diagnosis_name,
                            affected_side, affected_joint, severity,
                            fracture_type, ligament_grade, display_order
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                            encounterId,
                            'suspected',
                            suspected,
                            updates.affectedSide || null,
                            updates.affectedJoint || null,
                            updates.severity || null,
                            updates.fractureType === "Not applicable" ? null : updates.fractureType,
                            updates.ligamentGrade === "Not applicable" ? null : updates.ligamentGrade,
                            displayOrder++
                        ]
                    );
                }
            }
        }

        // Insert Differential Diagnoses
        if (updates.differentials && Array.isArray(updates.differentials)) {
            for (const diff of updates.differentials) {
                if (diff && diff.trim() !== "" && diff.toLowerCase() !== "not applicable") {
                    await client.query(
                        `INSERT INTO encounter_diagnoses (
                            encounter_id, diagnosis_type, diagnosis_name,
                            affected_side, affected_joint, severity,
                            fracture_type, ligament_grade, display_order
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                            encounterId,
                            'differential',
                            diff.trim(),
                            updates.affectedSide || null,
                            updates.affectedJoint || null,
                            updates.severity || null,
                            updates.fractureType === "Not applicable" ? null : updates.fractureType,
                            updates.ligamentGrade === "Not applicable" ? null : updates.ligamentGrade,
                            displayOrder++
                        ]
                    );
                }
            }
        }

        await client.query('COMMIT');

        // Return updated diagnoses
        const result = await client.query(
            'SELECT * FROM encounter_diagnoses WHERE encounter_id = $1 ORDER BY display_order',
            [encounterId]
        );

        res.status(200).json({
            success: true,
            message: 'Diagnoses updated successfully',
            data: result.rows
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching diagnoses:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating diagnoses',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update management plan
 * PATCH /api/orthopedics/encounters/:encounterId/management
 */
export const patchManagement = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;

        

        // Check if management exists
        const existing = await client.query(
            'SELECT management_id FROM encounter_management WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Management plan not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            immobilizationType: { dbField: 'immobilization_type', process: (v) => v },
            physiotherapy: { dbField: 'physiotherapy', process: (v) => v },
            painMedications: { dbField: 'pain_medications', process: (v) => v },
            activityModification: { dbField: 'activity_modification', process: (v) => v },
            surgicalPlan: { dbField: 'surgical_plan', process: (v) => v },
            fractureFixation: { dbField: 'fracture_fixation', process: (v) => v },
            arthroscopy: { dbField: 'arthroscopy', process: (v) => v },
            jointReplacement: { dbField: 'joint_replacement', process: (v) => v },
            postOpCare: { dbField: 'post_op_care', process: (v) => v },
            followUpTimeline: { dbField: 'follow_up_timeline', process: (v) => v },
            repeatImaging: { dbField: 'repeat_imaging_schedule', process: (v) => v },
            redFlags: { dbField: 'red_flag_symptoms', process: (v) => v }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_management 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;


        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Management plan updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching management plan:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating management plan',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update rehab milestones
 * PATCH /api/orthopedics/encounters/:encounterId/rehab-milestones
*/


export const patchRehabMilestones = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;


        // Check if this is a complete replacement (using milestones array)
        if (updates.milestones && Array.isArray(updates.milestones)) {
            
            // Delete all existing milestones
            await client.query(
                'DELETE FROM encounter_rehab_milestones WHERE encounter_id = $1',
                [encounterId]
            );
            
            // Insert new milestones
            for (let i = 0; i < updates.milestones.length; i++) {
                await client.query(
                    `INSERT INTO encounter_rehab_milestones (
                        encounter_id, milestone_description, display_order
                    ) VALUES ($1, $2, $3)`,
                    [encounterId, updates.milestones[i], i + 1]
                );
            }
        }
        // Handle add operations
        else if (updates.add && Array.isArray(updates.add)) {
            
            // Get current max display order
            const maxOrder = await client.query(
                'SELECT COALESCE(MAX(display_order), 0) as max_order FROM encounter_rehab_milestones WHERE encounter_id = $1',
                [encounterId]
            );
            let nextOrder = maxOrder.rows[0].max_order + 1;

            for (const milestone of updates.add) {
                // Handle both string and object formats
                const description = typeof milestone === 'string' ? milestone : milestone.description;
                
                await client.query(
                    `INSERT INTO encounter_rehab_milestones (
                        encounter_id, milestone_description, display_order
                    ) VALUES ($1, $2, $3)`,
                    [encounterId, description, nextOrder++]
                );
            }
        }

        // Handle update operations - FIXED: was 'upserts.update' now 'updates.update'
        if (updates.update && Array.isArray(updates.update)) {
            
            for (const milestone of updates.update) {
                // Ensure milestone has required fields
                if (!milestone.milestone_id) {
                    console.error("Missing milestone_id in update:", milestone);
                    continue;
                }
                
                await client.query(
                    `UPDATE encounter_rehab_milestones 
                     SET milestone_description = COALESCE($1, milestone_description),
                         display_order = COALESCE($2, display_order)
                     WHERE milestone_id = $3 AND encounter_id = $4`,
                    [
                        milestone.description || null,
                        milestone.displayOrder || null,
                        milestone.milestone_id,
                        encounterId
                    ]
                );
            }
        }

        // Handle remove operations
        if (updates.remove && Array.isArray(updates.remove)) {
            
            await client.query(
                'DELETE FROM encounter_rehab_milestones WHERE milestone_id = ANY($1::int[]) AND encounter_id = $2',
                [updates.remove, encounterId]
            );
        }

        await client.query('COMMIT');

        // Return updated milestones
        const result = await client.query(
            'SELECT * FROM encounter_rehab_milestones WHERE encounter_id = $1 ORDER BY display_order',
            [encounterId]
        );

        res.status(200).json({
            success: true,
            message: 'Rehabilitation milestones updated successfully',
            data: result.rows
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching rehab milestones:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating rehab milestones',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update referrals
 * PATCH /api/orthopedics/encounters/:encounterId/referrals
 */
export const patchReferrals = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;


        // Check if referrals exist
        const existing = await client.query(
            'SELECT referral_id FROM encounter_referrals WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Referrals not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            ptReferral: { dbField: 'pt_referral', process: (v) => v },
            painClinic: { dbField: 'pain_clinic', process: (v) => v },
            surgeryReferral: { dbField: 'surgery_referral', process: (v) => v }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_referrals 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;

       

        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Referrals updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching referrals:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating referrals',
            error: error.message
        });
    } finally {
        client.release();
    }
};

/**
 * Partially update physician notes
 * PATCH /api/orthopedics/encounters/:encounterId/notes
 */
export const patchNotes = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { encounterId } = req.params;
        const updates = req.body;

        

        // Check if notes exist
        const existing = await client.query(
            'SELECT note_id FROM encounter_notes WHERE encounter_id = $1',
            [encounterId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notes not found for this encounter'
            });
        }

        // Map frontend field names to database column names
        const fieldMappings = {
            additionalObservations: { dbField: 'additional_observations', process: (v) => v },
            counseling: { dbField: 'counseling', process: (v) => v },
            patientQuestions: { dbField: 'patient_questions', process: (v) => v },
            education: { dbField: 'education_provided', process: (v) => v }
        };

        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        // Iterate through the frontend fields that were sent
        Object.keys(updates).forEach(frontendField => {
            if (fieldMappings[frontendField]) {
                const { dbField, process } = fieldMappings[frontendField];
                const value = process(updates[frontendField]);
                
                if (value !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(encounterId);
        const query = `
            UPDATE encounter_notes 
            SET ${updateFields.join(', ')}
            WHERE encounter_id = $${paramIndex}
            RETURNING *
        `;

      

        const result = await client.query(query, values);
        
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Notes updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error patching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating notes',
            error: error.message
        });
    } finally {
        client.release();
    }
};
// Export all controllers
export default {
  // Patient controllers
    getAllPatients,
    patchPatient,
    getPatientEncounters,
    getFullEncounterDetails,
    patchEncounter,
    // Section controllers
    // PATCH controllers
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
};

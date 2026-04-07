import { Pool } from "pg";
import "dotenv/config";

const con = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/* =============================
   DATABASE CONNECT
============================= */

con
  .connect()
  .then(async () => {
    console.log("Database connected");
    console.log("Tables Created");
    await createTables();
  })
  .catch((err) => console.log("DB Error:", err));

/* =============================
   CREATE TABLES IF NOT EXIST
============================= */

async function createTables() {
  try {
    /* complaint_master */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_master (
        complaint_id SERIAL PRIMARY KEY,
        ticket_number VARCHAR(50) UNIQUE NOT NULL,
        raised_by_type VARCHAR(30) NOT NULL,
        raised_by_name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        sub_category VARCHAR(100),
        department VARCHAR(50) NOT NULL,

        priority VARCHAR(10) NOT NULL
        CHECK (priority IN ('LOW','MEDIUM','HIGH')),

        status VARCHAR(15) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED')),

        complaint_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* complaint_assignment */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_assignment (
        assignment_id SERIAL PRIMARY KEY,
        complaint_id INT NOT NULL,
        assigned_department VARCHAR(100) NOT NULL,
        assigned_employee_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_assignment_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE
      );
    `);

    /* complaint_status_history */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_status_history (
        history_id SERIAL PRIMARY KEY,
        complaint_id INT NOT NULL,
        old_status VARCHAR(50) NOT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by INT NOT NULL,
        remarks TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_status_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE
      );
    `);

    /* complaint_attachment */
    await con.query(`
      CREATE TABLE IF NOT EXISTS complaint_attachment (
        attachment_id SERIAL PRIMARY KEY,
        complaint_id INT NOT NULL
        REFERENCES complaint_master(complaint_id)
        ON DELETE CASCADE,

        file_type VARCHAR(20) NOT NULL,
        file_name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* patient_feedback */
    await con.query(`
      CREATE TABLE IF NOT EXISTS patient_feedback (
        feedback_id SERIAL PRIMARY KEY,
        patient_id INT NOT NULL,
        patient_name VARCHAR(150) NOT NULL,
        admission_id INT,
        service_type VARCHAR(50) NOT NULL,

        rating INT CHECK (rating BETWEEN 1 AND 5),
        feedback_comments TEXT,

        feedback_mode VARCHAR(50) NOT NULL,
        consent_flag BOOLEAN DEFAULT false,

        created_date TIMESTAMP DEFAULT NOW()
      );
    `);

    /* feedback_module_ratings */
    await con.query(`
      CREATE TABLE IF NOT EXISTS feedback_module_ratings (
        module_rating_id SERIAL PRIMARY KEY,
        feedback_id INT NOT NULL,
        module_name VARCHAR(100) NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_date TIMESTAMP DEFAULT NOW(),

        CONSTRAINT fk_feedback
        FOREIGN KEY (feedback_id)
        REFERENCES patient_feedback(feedback_id)
        ON DELETE CASCADE
      );
    `);

    /* employee */
    await con.query(`
      CREATE TABLE IF NOT EXISTS employee (
        employee_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        employee_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        dob DATE NOT NULL,
        email VARCHAR(150) NOT NULL,
        contact_number VARCHAR(15) NOT NULL,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        qualification VARCHAR(150),
        experience_years INT,
        status VARCHAR(20) DEFAULT 'Active',
        date_of_joining DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        password VARCHAR
      );
    `);

    /* patient */
    await con.query(`
      CREATE TABLE IF NOT EXISTS patient (
        patient_id SERIAL PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        dob DATE NOT NULL,
        blood_group VARCHAR(5),
        contact_number VARCHAR(15) NOT NULL,
        address TEXT,
        emergency_name VARCHAR(100),
        emergency_contact_number VARCHAR(15),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);


    
    // neurology_encounters
    await con.query(`
      CREATE TABLE IF NOT EXISTS neurology_encounters (
  encounter_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  encounter_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,

  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  bmi NUMERIC(6,2),

  allergies TEXT,
  past_medical_history TEXT,
  past_surgical_history TEXT,
  family_history TEXT,
  social_history TEXT,

  occupation TEXT,
  smoking_status TEXT,
  alcohol_use TEXT,
  lifestyle TEXT,

  visit_id VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);



    //neurology_complaints
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_complaints (
  complaint_id SERIAL PRIMARY KEY,
  encounter_id INT,

  chief_complaint TEXT,
  onset_date DATE,
  duration TEXT,
  progression TEXT,

  weakness_present VARCHAR(10),
  weakness_side VARCHAR(20),
  weakness_pattern VARCHAR(50),
  weakness_limb TEXT,

  numbness TEXT,
  paresthesia TEXT,
  tremors TEXT,
  involuntary_movements TEXT,

  speech_changes TEXT,
  language_changes TEXT,
  vision_changes TEXT,

  dizziness TEXT,
  vertigo TEXT,
  balance_issues TEXT,

  cognitive_changes TEXT,
  memory_changes TEXT,

  neuropathic_pain TEXT,
  radicular_pain TEXT,

  symptom_triggers TEXT,
  symptom_relievers TEXT,
  overall_severity INT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_headache
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_headache (
  headache_id SERIAL PRIMARY KEY,
  encounter_id INT,

  headache_type TEXT,
  headache_location TEXT,
  headache_severity INT,
  headache_triggers TEXT,
  headache_duration TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_seizures
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_seizures (
  seizure_id SERIAL PRIMARY KEY,
  encounter_id INT,

  seizures_present VARCHAR(10),
  seizure_type TEXT,
  seizure_frequency TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);




    //neurology_exam
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_neuro_exam (
  exam_id SERIAL PRIMARY KEY,
  encounter_id INT,

  mental_status_orientation TEXT,
  memory_registration TEXT,
  memory_recall TEXT,
  cognition TEXT,

  cranial_nerve_findings TEXT,

  motor_tone TEXT,
  motor_power TEXT,
  muscle_bulk TEXT,

  reflexes_biceps TEXT,
  reflexes_triceps TEXT,
  reflexes_knee TEXT,
  reflexes_ankle TEXT,

  plantar_response TEXT,

  sensory_pain TEXT,
  sensory_temperature TEXT,
  sensory_vibration TEXT,
  sensory_proprioception TEXT,

  coordination_finger_nose TEXT,
  coordination_heel_shin TEXT,

  gait TEXT,
  romberg_test TEXT,
  tandem_walk TEXT,

  babinski TEXT,
  hoffmann TEXT,
  lhermitte TEXT,

  adls TEXT,
  mobility TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //imaging
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_imaging (
  imaging_id SERIAL PRIMARY KEY,
  encounter_id INT,

  ct_brain TEXT,
  mri_brain TEXT,
  mr_angiography TEXT,
  mri_spine TEXT,
  lumbar_puncture TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_analysis
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_analysis (
  analysis_id SERIAL PRIMARY KEY,
  encounter_id INT,

  mri_findings TEXT,
  mr_angio_findings TEXT,
  eeg_results TEXT,
  ncs_results TEXT,
  comparison_previous TEXT,

  genetic_testing TEXT,
  metabolic_panel TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_diagnoses
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_diagnoses (
  diagnosis_id SERIAL PRIMARY KEY,
  encounter_id INT,

  diagnosis_type TEXT,
  diagnosis_name TEXT,
  icd10_code TEXT,
  disease_classification TEXT,
  severity TEXT,
  stage TEXT,
  comorbidities TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_management
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_management (
  management_id SERIAL PRIMARY KEY,
  encounter_id INT,

  pain_management TEXT,
  spasticity_management TEXT,
  seizure_control TEXT,

  lifestyle_recommendations TEXT,
  rehabilitation TEXT,

  surgical_plan TEXT,
  endovascular TEXT,
  botulinum_toxin TEXT,

  physiotherapy TEXT,
  occupational_therapy TEXT,
  speech_therapy TEXT,

  follow_up_timing TEXT,
  repeat_imaging TEXT,
  repeat_labs TEXT,
  monitoring TEXT,
  warning_signs TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_medication
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_medications (
  medication_id SERIAL PRIMARY KEY,
  encounter_id INT,

  medication_name TEXT,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  duration TEXT,
  purpose TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_notes
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_notes (
  note_id SERIAL PRIMARY KEY,
  encounter_id INT,

  clinical_observations TEXT,
  patient_questions TEXT,
  caregiver_questions TEXT,
  education_provided TEXT,
  multidisciplinary_care TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_referrals
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_referrals (
  referral_id SERIAL PRIMARY KEY,
  encounter_id INT,

  referral_name TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



    //neurology_labs
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_labs (
  lab_id SERIAL PRIMARY KEY,
  encounter_id INT,

  lab_tests TEXT[],   -- array support
  cbc_results TEXT,
  electrolyte_results TEXT,
  thyroid_results TEXT,
  esr_crp_results TEXT,
  autoimmune_results TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);



  //neurology_electrophysiology
    await con.query(`
CREATE TABLE IF NOT EXISTS neurology_electrophysiology (
  ep_id SERIAL PRIMARY KEY,
  encounter_id INT,

  eeg_ordered TEXT,
  ncs_ordered TEXT,
  emg_ordered TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (encounter_id)
  REFERENCES neurology_encounters(encounter_id)
  ON DELETE CASCADE
);
`);
  } catch (error) {
    console.error("Table Creation Error:", error);
  }
}

export default con;

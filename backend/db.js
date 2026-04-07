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

    //ORTHOPEDICS Patient
    /*1. patient */


await con.query(`
  CREATE TABLE IF NOT EXISTS patient (
    patient_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    age INTEGER,  
    blood_group VARCHAR(5),
    contact_number VARCHAR(15) NOT NULL,
    address TEXT,
    emergency_name VARCHAR(100),
    emergency_contact_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
//2. Encounters table (each visit)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounters (
    encounter_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patient(patient_id) ON DELETE CASCADE,
    encounter_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patient_id_at_visit VARCHAR(50),          -- e.g., 'ORTH-2024-00345'
    height_cm NUMERIC(5,1),
    weight_kg NUMERIC(5,1),
    bmi NUMERIC(4,1),
    allergies TEXT,
    past_medical_history TEXT,
    past_surgical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    occupation VARCHAR(100),
    physical_activity_level VARCHAR(50),
    smoking_status VARCHAR(20),
    alcohol_use VARCHAR(100)
);
      `)
      //-- 3. Encounter complaints
      await con.query(`
      CREATE TABLE IF NOT EXISTS encounter_complaints (
      complaint_id SERIAL PRIMARY KEY,
      encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
      chief_complaint TEXT,
      onset_date DATE,
      duration VARCHAR(50),
      progression VARCHAR(50),
      pain_location TEXT,
      pain_intensity INTEGER CHECK (pain_intensity BETWEEN 0 AND 10),
      pain_type VARCHAR(50),
      pain_radiation TEXT,
      swelling VARCHAR(20),         
      redness VARCHAR(20),           
      warmth VARCHAR(20),            
      trauma_mechanism TEXT,
      trauma_time VARCHAR(100),
      functional_limitation TEXT,
      mobility_limitation TEXT,
      adl_limitation TEXT,
      range_motion_loss TEXT,
      numbness VARCHAR(10),
      tingling VARCHAR(10),
      weakness VARCHAR(10)
);
`);
    //-- 4. Physical examination
    await con.query(`        
    CREATE TABLE IF NOT EXISTS encounter_physical_exam (
    exam_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    inspection TEXT,
    deformity TEXT,
    scars TEXT,
    palpation_tenderness TEXT,
    warmth_on_palpation TEXT,
    crepitus TEXT,
    rom_active_flexion VARCHAR(20),
    rom_passive_flexion VARCHAR(20),
    rom_active_extension VARCHAR(20),
    rom_passive_extension VARCHAR(20),
    quadriceps_strength VARCHAR(10),
    hamstring_strength VARCHAR(10),
    calf_strength VARCHAR(10),
    pulses TEXT,
    sensation TEXT,
    motor_function TEXT,
    gait TEXT,
    special_tests TEXT,
    joint_instability TEXT
);`)
  // -- 5. Imaging studies (updated to match form fields)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_imaging (
    imaging_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    xray_done VARCHAR(20), 
    xray_findings TEXT,
    mri_done VARCHAR(20),
    mri_indication TEXT,
    ct_done VARCHAR(20), 
    ultrasound_done VARCHAR(20),
    dexa_done VARCHAR(20) 
);
`)
    // -- 6. Laboratory tests (updated to match form fields)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_labs (
    lab_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    -- Lab test selections (as checkboxes)
    cbc_ordered BOOLEAN DEFAULT FALSE,
    esr_ordered BOOLEAN DEFAULT FALSE,
    crp_ordered BOOLEAN DEFAULT FALSE,
    rheumatoid_factor_ordered BOOLEAN DEFAULT FALSE,
    uric_acid_ordered BOOLEAN DEFAULT FALSE,
    calcium_ordered BOOLEAN DEFAULT FALSE,
    vitamin_d_ordered BOOLEAN DEFAULT FALSE,
    alp_ordered BOOLEAN DEFAULT FALSE,
    -- Lab results
    cbc_results VARCHAR(100),
    esr_results VARCHAR(100),
    crp_results VARCHAR(100),
    other_labs_results TEXT,
    -- For any additional lab tests not in the predefined list
    other_lab_tests TEXT
);`)
    //7. Diagnoses (primary, suspected, differentials)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_diagnoses (
    diagnosis_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    diagnosis_type VARCHAR(20) NOT NULL, -- 'primary', 'suspected', 'differential'
    diagnosis_name TEXT NOT NULL,
    affected_side VARCHAR(20), -- 'Left', 'Right', 'Bilateral'
    affected_joint VARCHAR(50),
    severity VARCHAR(20), -- 'Mild', 'Moderate', 'Severe'
    fracture_type VARCHAR(50), -- 'Simple/Closed', 'Compound/Open', 'Comminuted', etc.
    ligament_grade VARCHAR(50), -- 'Grade I (Mild)', 'Grade II (Moderate)', 'Grade III (Severe)'
    display_order INTEGER, -- To maintain order of differential diagnoses
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_encounter_diagnoses_encounter_id ON encounter_diagnoses(encounter_id);
CREATE INDEX IF NOT EXISTS idx_encounter_diagnoses_type ON encounter_diagnoses(diagnosis_type);
`)
     // -- 8. Management plan (one per encounter, but referrals and milestones are separate)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_management (
    management_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    immobilization_type VARCHAR(50),
    physiotherapy VARCHAR(50),
    pain_medications TEXT,
    activity_modification TEXT,
    surgical_plan TEXT,
    fracture_fixation TEXT,
    arthroscopy TEXT,
    joint_replacement TEXT,
    post_op_care TEXT,
    follow_up_timeline VARCHAR(100),
    repeat_imaging_schedule TEXT,
    red_flag_symptoms TEXT
);
`)
     // -- 9. Rehabilitation milestones (multiple per encounter)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_rehab_milestones (
    milestone_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    milestone_description TEXT,
    display_order INTEGER            -- to preserve the order from the form
);`)
    // 10. Referrals (multiple per encounter)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_referrals (
    referral_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    pt_referral VARCHAR(20),       
    pain_clinic VARCHAR(20),     
    surgery_referral VARCHAR(30) 
);`)

    // -- 11. Physician notes (one per encounter)
    await con.query(`
    CREATE TABLE IF NOT EXISTS encounter_notes (
    note_id SERIAL PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounters(encounter_id) ON DELETE CASCADE,
    additional_observations TEXT,
    counseling TEXT,
    patient_questions TEXT,
    education_provided TEXT
    )`)
 

    /*end of the ORTHOPEDICS */
      
    await con.query(`
      -- Create complaint_otp_verification table
-- Create complaint_otp_verification table (WITHOUT UNIQUE constraint)
CREATE TABLE IF NOT EXISTS complaint_otp_verification (
    otp_id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaint_master(complaint_id) ON DELETE CASCADE,
    otp_code VARCHAR(6) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    retry_count INTEGER DEFAULT 0
    -- Remove the UNIQUE(complaint_id) constraint
);

-- Create indexes for   faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_complaint_id ON complaint_otp_verification(complaint_id);
CREATE INDEX IF NOT EXISTS idx_otp_code ON complaint_otp_verification(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON complaint_otp_verification(expires_at);`)
await con.query(`
  -- Create complaint_closure_feedback table
CREATE TABLE IF NOT EXISTS complaint_closure_feedback (
    feedback_id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaint_master(complaint_id) ON DELETE CASCADE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    comment TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_complaint_id ON complaint_closure_feedback(complaint_id);`
)

// Add this to your createTables function
await con.query(`
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';
`);

await con.query(`
  DROP TRIGGER IF EXISTS update_complaint_master_updated_at ON complaint_master;
  CREATE TRIGGER update_complaint_master_updated_at
    BEFORE UPDATE ON complaint_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`);
await con.query(`
  ALTER TABLE complaint_master 
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP DEFAULT NULL
`);
  } catch (error) {
    console.error("Table Creation Error:", error);
  }
}

export default con;
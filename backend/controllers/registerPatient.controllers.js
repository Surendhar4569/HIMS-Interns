import con from "../db.js";

/* ===============================
   GET ALL PATIENTS
================================ */
export const getPatients = async (req, res) => {
  try {
    const result = await con.query(`
      SELECT
        patient_id,
        patient_name,
        email,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        blood_group,
        contact_number,
        address,
        emergency_name,
        emergency_contact_number,
        created_at
      FROM patient
      ORDER BY patient_id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("Get Patients Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/* ===============================
   REGISTER PATIENT
================================ */
export const registerPatient = async (req, res) => {
  try {
    const {
      patient_name,
      email,
      gender,
      dob,
      blood_group,
      contact_number,
      address,
      emergency_name,
      emergency_contact_number,
    } = req.body;

    // Basic validation
    if (!patient_name?.trim() ||
        !email?.trim() ||
        !gender?.trim() ||
        !dob ||
        !contact_number?.trim()) {

      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const query = `
      INSERT INTO patient
      (patient_name, email, gender, dob, blood_group,
       contact_number, address,
       emergency_name, emergency_contact_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const result = await con.query(query, [
      patient_name.trim(),
      email.trim(),
      gender.trim(),
      dob,
      blood_group ?? null,
      contact_number.trim(),
      address ?? null,
      emergency_name ?? null,
      emergency_contact_number ?? null,
    ]);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: result.rows[0],
    });

  } catch (error) {

    // Handle duplicate email (PostgreSQL unique violation)
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/* ===============================
   UPDATE PATIENT
================================ */
export const updatePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (isNaN(patient_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const {
      patient_name,
      email,
      gender,
      dob,
      blood_group,
      contact_number,
      address,
      emergency_name,
      emergency_contact_number,
    } = req.body;

    const query = `
      UPDATE patient
      SET
        patient_name = COALESCE($1, patient_name),
        email = COALESCE($2, email),
        gender = COALESCE($3, gender),
        dob = COALESCE($4, dob),
        blood_group = COALESCE($5, blood_group),
        contact_number = COALESCE($6, contact_number),
        address = COALESCE($7, address),
        emergency_name = COALESCE($8, emergency_name),
        emergency_contact_number = COALESCE($9, emergency_contact_number)
      WHERE patient_id = $10
      RETURNING *;
    `;

    const result = await con.query(query, [
      patient_name ?? null,
      email ?? null,
      gender ?? null,
      dob ?? null,
      blood_group ?? null,
      contact_number ?? null,
      address ?? null,
      emergency_name ?? null,
      emergency_contact_number ?? null,
      patient_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/* ===============================
   DELETE PATIENT
================================ */
export const deletePatient = async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (isNaN(patient_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const result = await con.query(
      "DELETE FROM patient WHERE patient_id = $1 RETURNING *",
      [patient_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
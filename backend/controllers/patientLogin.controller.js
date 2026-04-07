import con from "../db.js";
import jwt from "jsonwebtoken";

export const patientLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    // Check if patient exists with given email
    const result = await con.query(
      "SELECT patient_id, patient_name, email, password FROM patient WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const patient = result.rows[0];

    // Compare plain text password (without hashing)
    if (patient.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token with consistent field names
    const token = jwt.sign(
      { 
        patient_id: patient.patient_id,  // Changed from 'id' to 'patient_id' for consistency
        name: patient.patient_name, 
        email: patient.email,
        role: "patient" 
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      success: true,
      token,
      patient: {
        patient_id: patient.patient_id,
        patient_name: patient.patient_name,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error("Patient login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
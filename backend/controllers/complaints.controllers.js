export const postComplaint = async (req, res) => {
  const client = await con.connect();

  try {
    // Multer populates req.body from the FormData text fields
    const {
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status
    } = req.body;

    // Multer populates req.file with the file info
    const attachment_path = req.file ? req.file.path : null;

    // Now validation will work because req.body is no longer undefined
    if (!patient_id || !patient_name || !contact_number) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO patient_complaint
      (patient_id, patient_name, contact_number, complaint_description, priority, status, attachment_path, complaint_datetime)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status,
      attachment_path
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Insert Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
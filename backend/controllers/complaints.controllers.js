import con from "../db.js";

/* =========================
   GET ALL
========================= */
export const getComplaint = async (req, res) => {
  try {
    const result = await con.query(
      "SELECT * FROM patient_complaint ORDER BY complaint_id DESC"
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error("Fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


/* =========================
   POST
========================= */
export const postComplaint = async (req, res) => {
  
  const client = await con.connect();
  
  try {
     await client.query("BEGIN");
    const {
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status,
    } = req.body;

    const attachment_path = req.file ? req.file.path : null;
    console.log(attachment_path)

    if (
      !patient_id ||
      !patient_name ||
      !contact_number ||
      !complaint_description ||
      !priority ||
      !status
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const insertQuery = `
      INSERT INTO patient_complaint
      (patient_id, contact_number, complaint_description, priority, status, attachment_path, complaint_datetime, patient_name)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
      patient_id,
      contact_number,
      complaint_description,
      priority,
      status,
      attachment_path,
      patient_name,
    ]);
    await client.query("COMMIT");


    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    client.release();
  }
};


/* =========================
   UPDATE
========================= */
export const updateComplaint = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint_id"
      });
    }

    const {
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status,
      attachment_path
    } = req.body;

    const allowedPriorities = ["Low", "Medium", "High"];
    const allowedStatus = ["New", "Open", "In Progress", "Resolved", "Closed"];

    if (priority && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value"
      });
    }

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const updateQuery = `
      UPDATE patient_complaint
      SET
        patient_id = COALESCE($1, patient_id),
        patient_name = COALESCE($2, patient_name),
        contact_number = COALESCE($3, contact_number),
        complaint_description = COALESCE($4, complaint_description),
        priority = COALESCE($5, priority),
        status = COALESCE($6, status),
        attachment_path = COALESCE($7, attachment_path)
        WHERE complaint_id = $8
      RETURNING *;
    `;

    const result = await con.query(updateQuery, [
      patient_id ?? null,
      patient_name ?? null,
      contact_number ?? null,
      complaint_description ?? null,
      priority ?? null,
      status ?? null,
      attachment_path ?? null,
      complaint_id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Update Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* =========================
   DELETE
========================= */
export const deleteComplaint = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint_id"
      });
    }

    const result = await con.query(
      "DELETE FROM patient_complaint WHERE complaint_id = $1 RETURNING *",
      [complaint_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
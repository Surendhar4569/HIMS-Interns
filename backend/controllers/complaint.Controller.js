import pool from "../db.js";

/* =========================
	 COMPLAINT MASTER - GET ALL
========================= */
export const getComplaintMaster = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM complaint_master ORDER BY complaint_id DESC",
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Fetch Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* =========================
	 COMPLAINT MASTER - POST
========================= */




export const postComplaintMaster = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    let {
      ticket_number,
      raised_by_type,
      raised_by_name,
      raised_by_mobile, 
      category,
      sub_category,
      department,
      priority,
      complaint_description,
      attachment_type = 'BEFORE',
       patient_id
    } = req.body;

    if (!ticket_number) ticket_number = `TKT-${Date.now()}`;
     if (patient_id && !raised_by_type) {
      raised_by_type = "PATIENT";
    }

    if (!raised_by_type || !raised_by_name || !raised_by_mobile || !department || !priority) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing" });
    }

    const insertMasterQuery = `
      INSERT INTO complaint_master
      (ticket_number, raised_by_type, raised_by_name, raised_by_mobile, category, sub_category, department, priority, complaint_description,patient_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const masterResult = await client.query(insertMasterQuery, [
      ticket_number,
      raised_by_type,
      raised_by_name,
      raised_by_mobile, // Add this
      category || null,
      sub_category || null,
      department,
      priority,
      complaint_description || null,
      patient_id || null 
    ]);

    const complaint_id = masterResult.rows[0].complaint_id;

    if (req.file) {
      const insertAttachmentQuery = `
        INSERT INTO complaint_attachment
        (complaint_id, file_type, file_name, attachment_type)
        VALUES ($1,$2,$3,$4)
        RETURNING *;
      `;

      await client.query(insertAttachmentQuery, [
        complaint_id,
        req.file.mimetype.split("/")[0],
        req.file.path,
        attachment_type
      ]);
    }

    await client.query("COMMIT");

    return res
      .status(201)
      .json({
        success: true,
        message: "Complaint created successfully",
        data: masterResult.rows[0],
      });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Insert Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
};


/* =========================
   ADD AFTER RESOLUTION IMAGE
========================= */
export const addAfterResolutionImage = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { complaint_id } = req.body;
    
    if (!complaint_id || !req.file) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Complaint ID or file is missing" });
    }

    // Check if complaint exists and is resolved
    const complaintCheck = await client.query(
      "SELECT status FROM complaint_master WHERE complaint_id = $1",
      [complaint_id]
    );

    if (complaintCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const insertQuery = `
      INSERT INTO complaint_attachment
      (complaint_id, file_type, file_name, attachment_type)
      VALUES ($1, $2, $3, 'AFTER')
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
      complaint_id,
      req.file.mimetype.split("/")[0],
      req.file.path,
    ]);

    await client.query("COMMIT");
    return res.status(201).json({
      success: true,
      message: "After resolution image added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Insert Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
};
/* =========================
	 COMPLAINT MASTER - UPDATE
========================= */
export const updateComplaintMaster = async (req, res) => {
   console.log("=== updateComplaintAssignment called ===");
  console.log("Assignment ID:", req.params.assignment_id);
  console.log("Request body:", req.body);
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid complaint_id" });
    }

    const {
      ticket_number,
      raised_by_type,
      raised_by_name,
      category,
      sub_category,
      department,
      priority,
      complaint_description,
    } = req.body;

    const updateQuery = `
			UPDATE complaint_master
			SET
				ticket_number = COALESCE($1, ticket_number),
				raised_by_type = COALESCE($2, raised_by_type),
				raised_by_name = COALESCE($3, raised_by_name),
				category = COALESCE($4, category),
				sub_category = COALESCE($5, sub_category),
				department = COALESCE($6, department),
				priority = COALESCE($7, priority),
				complaint_description = COALESCE($8, complaint_description)
			WHERE complaint_id = $9
			RETURNING *;
		`;

    const result = await pool.query(updateQuery, [
      ticket_number ?? null,
      raised_by_type ?? null,
      raised_by_name ?? null,
      category ?? null,
      sub_category ?? null,
      department ?? null,
      priority ?? null,
      complaint_description ?? null,
      complaint_id,
    ]);

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    return res
      .status(200)
      .json({
        success: true,
        message: "Complaint updated successfully",
        data: result.rows[0],
      });
  } catch (error) {
    console.error("Update Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
	 COMPLAINT MASTER - DELETE
========================= */
export const deleteComplaintMaster = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid complaint_id" });

    await pool.query(
      "DELETE FROM complaint_attachment WHERE complaint_id = $1",
      [complaint_id],
    );

    const result = await pool.query(
      "DELETE FROM complaint_master WHERE complaint_id = $1 RETURNING *",
      [complaint_id],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    return res
      .status(200)
      .json({
        success: true,
        message: "Complaint deleted successfully",
        data: result.rows[0],
      });
  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
	 ATTACHMENTS - GET ALL
========================= */
export const getComplaintAttachments = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM complaint_attachment ORDER BY attachment_id DESC",
    );
    return res
      .status(200)
      .json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error("Fetch Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* =========================
	 ATTACHMENTS - POST
========================= */
export const postComplaintAttachment = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { complaint_id } = req.body;
    if (!complaint_id || !req.file) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Complaint ID or file is missing" });
    }

    const insertQuery = `
			INSERT INTO complaint_attachment
			(complaint_id, file_type, file_name)
			VALUES ($1, $2, $3)
			RETURNING *;
		`;

    const result = await client.query(insertQuery, [
      complaint_id,
      req.file.mimetype.split("/")[0],
      req.file.path,
    ]);

    await client.query("COMMIT");
    return res
      .status(201)
      .json({
        success: true,
        message: "Attachment added successfully",
        data: result.rows[0],
      });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Insert Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
};

/* =========================
	 ATTACHMENTS - DELETE
========================= */
export const deleteComplaintAttachment = async (req, res) => {
  try {
    const { attachment_id } = req.params;
    if (!attachment_id || isNaN(attachment_id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid attachment_id" });

    const result = await pool.query(
      "DELETE FROM complaint_attachment WHERE attachment_id = $1 RETURNING *",
      [attachment_id],
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });

    return res
      .status(200)
      .json({
        success: true,
        message: "Attachment deleted successfully",
        data: result.rows[0],
      });
  } catch (error) {
    console.error("Delete Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* =========================
	 GET SINGLE COMPLAINT WITH ATTACHMENTS
========================= */
/* =========================
	 GET SINGLE COMPLAINT WITH ATTACHMENTS
========================= */
export const getComplaintById = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid complaint_id" 
      });
    }

    const query = `
      SELECT 
        cm.complaint_id,
        cm.ticket_number,
        cm.raised_by_type,
        cm.raised_by_name,
        cm.category,
        cm.sub_category,
        cm.department,
        cm.priority,
        cm.status,
        cm.complaint_description,
        cm.created_at,
        cm.assigned_to,

        json_agg(
          DISTINCT jsonb_build_object(
            'attachment_id', ca.attachment_id,
            'file_name', ca.file_name,
            'file_type', ca.file_type,
            'attachment_type', ca.attachment_type,
            'created_at', ca.created_at
          )
        ) FILTER (WHERE ca.attachment_id IS NOT NULL) as attachments,

        cas.assignment_id,
        cas.assigned_employee_id,
        cas.assigned_department,
        e.employee_name as assigned_employee_name

      FROM complaint_master cm

      LEFT JOIN complaint_attachment ca
        ON cm.complaint_id = ca.complaint_id

      LEFT JOIN complaint_assignment cas
        ON cm.complaint_id = cas.complaint_id

      LEFT JOIN employee e
        ON e.employee_id = cas.assigned_employee_id

      WHERE cm.complaint_id = $1

      GROUP BY cm.complaint_id, cas.assignment_id, cas.assigned_employee_id, 
               cas.assigned_department, e.employee_name

      ORDER BY cm.created_at DESC
    `;

    const result = await pool.query(query, [complaint_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Complaint not found" 
      });
    }

    // ensure absolute URLs for the frontend
    const base = `${req.protocol}://${req.get("host")}`;
    const complaint = result.rows[0];
    
    if (complaint.attachments) {
      complaint.attachments = complaint.attachments.map(att => {
        if (att.file_name && !/^https?:\/\//i.test(att.file_name)) {
          const rel = att.file_name.replace(/^\/+/, "");
          att.file_name = `${base}/${rel}`;
        }
        return att;
      });
      
      // Separate before and after images for easy access
      complaint.before_images = complaint.attachments.filter(att => att.attachment_type === 'BEFORE');
      complaint.after_images = complaint.attachments.filter(att => att.attachment_type === 'AFTER');
    } else {
      complaint.before_images = [];
      complaint.after_images = [];
      complaint.attachments = [];
    }

    return res.json({ 
      success: true, 
      data: complaint 
    });
  } catch (error) {
    console.error("Get Complaint By ID Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};


/* =========================
	 COMPLAINT LIST (JOIN)
========================= */

export const getComplaintList = async (req, res) => {
  try {
    const query = `
      SELECT 
        cm.complaint_id,
        cm.ticket_number,
        cm.raised_by_type,
        cm.raised_by_name,
        cm.category,
        cm.sub_category,
        cm.department,
        cm.priority,
        cm.status,
        cm.complaint_description,
        cm.created_at,
        cm.closed_at,

        json_agg(
          DISTINCT jsonb_build_object(
            'attachment_id', ca.attachment_id,
            'file_name', ca.file_name,
            'file_type', ca.file_type,
            'attachment_type', ca.attachment_type,
            'created_at', ca.created_at
          )
        ) FILTER (WHERE ca.attachment_id IS NOT NULL) as attachments,

        cas.assignment_id,
        cas.assigned_employee_id,
        cas.assigned_department,
        e.employee_name

      FROM complaint_master cm

      LEFT JOIN complaint_attachment ca
        ON cm.complaint_id = ca.complaint_id

      LEFT JOIN complaint_assignment cas
        ON cm.complaint_id = cas.complaint_id

      LEFT JOIN employee e
        ON e.employee_id = cas.assigned_employee_id

      GROUP BY cm.complaint_id, cas.assignment_id, cas.assigned_employee_id, 
               cas.assigned_department, e.employee_name

      ORDER BY cm.created_at DESC
    `;

    const result = await pool.query(query);

    const base = `${req.protocol}://${req.get("host")}`;
    const rows = result.rows.map((r) => {
      if (r.attachments) {
        r.attachments = r.attachments.map(att => {
          if (att.file_name && !/^https?:\/\//i.test(att.file_name)) {
            const rel = att.file_name.replace(/^\/+/, "");
            att.file_name = `${base}/${rel}`;
          }
          return att;
        });
        
        r.before_images = r.attachments.filter(att => att.attachment_type === 'BEFORE');
        r.after_images = r.attachments.filter(att => att.attachment_type === 'AFTER');
      }
      return r;
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Complaint List Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

/* =========================
	 UPDATE STATUS / PRIORITY
========================= */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { status, priority } = req.body;

    if (!complaint_id || isNaN(complaint_id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid complaint_id" });
    if (!status && !priority)
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });

    const fields = [];
    const values = [];
    let idx = 1;
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    values.push(complaint_id);

    const query = `UPDATE complaint_master SET ${fields.join(", ")} WHERE complaint_id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


export const assignComplaint = async (req, res) => {
   console.log("=== assignComplaint CALLED ===");
  console.log("Request body:", req.body);
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { complaint_id, assigned_employee_id, changed_by, remarks } = req.body;

    // ---------------- VALIDATION ----------------
    if (!complaint_id || isNaN(complaint_id)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Invalid complaint_id" });
    }

    if (!assigned_employee_id || isNaN(assigned_employee_id)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, message: "Invalid assigned_employee_id" });
    }

    // ---------------- CHECK COMPLAINT EXISTS ----------------
    const complaintCheck = await client.query(
      "SELECT status FROM complaint_master WHERE complaint_id = $1",
      [complaint_id],
    );
    console.log("complaint check",complaintCheck)
    if (complaintCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    const old_status = complaintCheck.rows[0].status || "OPEN";

     const complaintDetails = await client.query(
      "SELECT status, closed_at FROM complaint_master WHERE complaint_id = $1",
      [complaint_id],
    );
    
    const hadClosedAt = complaintDetails.rows[0].closed_at !== null;
    
    // Check if feedback exists
    const feedbackExists = await client.query(
      "SELECT feedback_id FROM complaint_closure_feedback WHERE complaint_id = $1",
      [complaint_id]
    );
    
    const wasPreviouslyClosed = old_status === 'CLOSED' || hadClosedAt || feedbackExists.rows.length > 0;
    
    if (wasPreviouslyClosed) {
      console.log(`Complaint ${complaint_id} was previously closed - deleting feedback`);
      
      await client.query(
        `DELETE FROM complaint_closure_feedback WHERE complaint_id = $1`,
        [complaint_id]
      );
      
      await client.query(
        `DELETE FROM complaint_otp_verification WHERE complaint_id = $1`,
        [complaint_id]
      );
      
      await client.query(
        `UPDATE complaint_master SET closed_at = NULL WHERE complaint_id = $1`,
        [complaint_id]
      );
    }
    // ---------------- GET EMPLOYEE DEPARTMENT ----------------
    const empResult = await client.query(
      "SELECT department FROM employee WHERE employee_id = $1 AND status = 'Active'",
      [assigned_employee_id],
    );

    if (empResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, message: "Employee not found or inactive" });
    }

    const assigned_department = empResult.rows[0].department;

    // Check if complaint is CLOSED and needs reopening
    const isClosed = old_status === 'CLOSED' || old_status === 'RESOLVED';

    // ---------------- 1️⃣ INSERT INTO complaint_assignment ----------------
    await client.query(
      `INSERT INTO complaint_assignment
       (complaint_id, assigned_department, assigned_employee_id)
       VALUES ($1, $2, $3)`,
      [complaint_id, assigned_department, assigned_employee_id],
    );

    // ---------------- 2️⃣ INSERT INTO complaint_status_history ----------------
    const new_status = isClosed ? 'ASSIGNED' : 'ASSIGNED';
    const status_remarks = isClosed ? 
      `Complaint reopened and assigned to employee ID ${assigned_employee_id}` : 
      remarks || `Assigned to employee ID ${assigned_employee_id}`;

    await client.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [complaint_id, old_status, new_status, changed_by, status_remarks],
    );

    // ---------------- 3️⃣ UPDATE complaint_master ----------------
    await client.query(
      `UPDATE complaint_master
       SET status = $1,
           assigned_to = $2
       WHERE complaint_id = $3`,
      [new_status, assigned_employee_id, complaint_id],
    );

    // If complaint was closed, delete OTP and feedback records
if (isClosed) {
  console.log(`Reopening complaint ${complaint_id} - Deleting OTP and feedback`);
  
  // Delete OTP verification records
  const otpDelete = await client.query(
    `DELETE FROM complaint_otp_verification 
     WHERE complaint_id = $1
     RETURNING *`,
    [complaint_id]
  );
  console.log(`Deleted ${otpDelete.rowCount} OTP records for complaint ${complaint_id}`);
  
  // Delete feedback records
  const feedbackDelete = await client.query(
    `DELETE FROM complaint_closure_feedback 
     WHERE complaint_id = $1
     RETURNING *`,
    [complaint_id]
  );
  console.log(`Deleted ${feedbackDelete.rowCount} feedback records for complaint ${complaint_id}`);
  
  // Clear closed_at timestamp
  await client.query(
    `UPDATE complaint_master
     SET closed_at = NULL
     WHERE complaint_id = $1`,
    [complaint_id]
  );
}
    

    
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: isClosed ? 
        "Complaint reopened and assigned successfully" : 
        "Complaint assigned successfully",
      data: {
        complaint_id,
        old_status,
        new_status,
        reopened: isClosed
      }
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Assign Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  } finally {
    if (client) client.release();
  }
};
export const getComplaintAssignments = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        c.complaint_id,
        c.ticket_number,
        c.status,
        ca.assignment_id,
        ca.assigned_employee_id,
        e.employee_name,
        ca.assigned_department
      FROM complaint_master c
      LEFT JOIN complaint_assignment ca 
        ON c.complaint_id = ca.complaint_id
      LEFT JOIN employee e 
        ON ca.assigned_employee_id = e.employee_id
      WHERE c.complaint_id = $1
    `,
      [complaint_id],
    );

    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Fetch Assignment Error:", error);

    return res.status(500).json({
      success: false,
    });
  }
};

export const updateComplaintAssignment = async (req, res) => {
   console.log("=== updateComplaintAssignment CALLED ===");
  console.log("Assignment ID:", req.params.assignment_id);
  console.log("Request body:", req.body);
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const { assignment_id } = req.params;
    const { assigned_employee_id, changed_by, remarks } = req.body;

    if (!assignment_id || isNaN(assignment_id))
      return res.status(400).json({ success: false, message: "Invalid assignment_id" });

    // Get current assignment details
    const currentAssignment = await client.query(
      `SELECT ca.complaint_id, ca.assigned_employee_id, cm.status 
       FROM complaint_assignment ca
       JOIN complaint_master cm ON ca.complaint_id = cm.complaint_id
       WHERE ca.assignment_id = $1`,
      [assignment_id]
    );

    if (currentAssignment.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const complaint_id = currentAssignment.rows[0].complaint_id;
    const currentStatus = currentAssignment.rows[0].status;

    // Get employee details
    const emp = await client.query(
      "SELECT department FROM employee WHERE employee_id = $1",
      [assigned_employee_id]
    );

    if (emp.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const department = emp.rows[0].department;

    // Update the assignment
    const result = await client.query(
      `UPDATE complaint_assignment
       SET assigned_employee_id = $1,
           assigned_department = $2,
           assigned_at = CURRENT_TIMESTAMP
       WHERE assignment_id = $3
       RETURNING complaint_id`,
      [assigned_employee_id, department, assignment_id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Update complaint_master
    await client.query(
      `UPDATE complaint_master
       SET assigned_to = $1
       WHERE complaint_id = $2`,
      [assigned_employee_id, complaint_id]
    );

    // If complaint is CLOSED, reopen it and set status to ASSIGNED
    // If complaint is CLOSED, reopen it and set status to ASSIGNED
if (currentStatus === 'CLOSED' || currentStatus === 'RESOLVED') {
  console.log(`Reopening complaint ${complaint_id} - Deleting feedback`);
  
  // Update status to ASSIGNED
  await client.query(
    `UPDATE complaint_master
     SET status = 'ASSIGNED'
     WHERE complaint_id = $1`,
    [complaint_id]
  );
  
  // Clear closed_at timestamp
  await client.query(
    `UPDATE complaint_master
     SET closed_at = NULL
     WHERE complaint_id = $1`,
    [complaint_id]
  );

  // Add to status history
  await client.query(
    `INSERT INTO complaint_status_history
     (complaint_id, old_status, new_status, changed_by, remarks)
     VALUES ($1, $2, $3, $4, $5)`,
    [complaint_id, 'CLOSED', 'ASSIGNED', changed_by, remarks || 'Reopened and reassigned']
  );

  // Delete the old feedback when complaint is reopened
  const feedbackDelete = await client.query(
    `DELETE FROM complaint_closure_feedback 
     WHERE complaint_id = $1
     RETURNING *`,
    [complaint_id]
  );
  console.log(`Deleted ${feedbackDelete.rowCount} feedback records`);
  
  // Also delete any OTP verification records
  const otpDelete = await client.query(
    `DELETE FROM complaint_otp_verification 
     WHERE complaint_id = $1
     RETURNING *`,
    [complaint_id]
  );
  console.log(`Deleted ${otpDelete.rowCount} OTP records`);
}else {
      // If not closed, just add status history for reassignment
      await client.query(
        `INSERT INTO complaint_status_history
         (complaint_id, old_status, new_status, changed_by, remarks)
         VALUES ($1, $2, $3, $4, $5)`,
        [complaint_id, currentStatus, 'ASSIGNED', changed_by, remarks || 'Reassigned']
      );
    }

    await client.query("COMMIT");

    return res.json({ 
      success: true, 
      message: currentStatus === 'CLOSED' ? 
        "Complaint reopened and assigned successfully. Previous feedback has been cleared." : 
        "Assignment updated successfully",
      data: {
        complaint_id,
        old_status: currentStatus,
        new_status: currentStatus === 'CLOSED' ? 'ASSIGNED' : currentStatus,
        reopened: currentStatus === 'CLOSED',
        feedback_cleared: currentStatus === 'CLOSED' 
      }
    });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Update Assignment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (client) client.release();
  }
};

export const deleteComplaintAssignment = async (req, res) => {
  const { assignment_id } = req.params;

  try {
    // Get complaint details before deleting assignment
    const result = await pool.query(
      `SELECT ca.complaint_id, cm.status 
       FROM complaint_assignment ca
       JOIN complaint_master cm ON ca.complaint_id = cm.complaint_id
       WHERE ca.assignment_id = $1`,
      [assignment_id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const complaint_id = result.rows[0].complaint_id;
    const currentStatus = result.rows[0].status;

    // Delete the assignment
    await pool.query(
      "DELETE FROM complaint_assignment WHERE assignment_id=$1",
      [assignment_id],
    );

    // If complaint was CLOSED or RESOLVED, delete feedback when unassigning
    if (currentStatus === 'CLOSED' || currentStatus === 'RESOLVED') {
      await pool.query(
        `DELETE FROM complaint_closure_feedback 
         WHERE complaint_id = $1`,
        [complaint_id]
      );
      console.log(`Deleted feedback for complaint ${complaint_id} during unassign`);
      
      await pool.query(
        `DELETE FROM complaint_otp_verification 
         WHERE complaint_id = $1`,
        [complaint_id]
      );
      console.log(`Deleted OTP records for complaint ${complaint_id} during unassign`);
    }

    // Update complaint status to OPEN
    await pool.query(
      "UPDATE complaint_master SET status='OPEN' WHERE complaint_id=$1",
      [complaint_id],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Unassign Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const generateComplaintOTP = async (req, res) => {
  let client;
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid complaint_id" 
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Get complaint with mobile number
    const complaintCheck = await client.query(
      `SELECT cm.complaint_id, cm.status, cm.raised_by_name, 
              cm.raised_by_type, cm.raised_by_mobile
       FROM complaint_master cm
       WHERE cm.complaint_id = $1`,
      [complaint_id]
    );

    if (complaintCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Complaint not found" 
      });
    }

    const complaint = complaintCheck.rows[0];
    
    if (complaint.status !== 'RESOLVED') {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "OTP can only be generated for RESOLVED complaints" 
      });
    }

    const mobileNumber = complaint.raised_by_mobile;

    if (!mobileNumber) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "Mobile number not found for this complaint" 
      });
    }

    // Check for existing unverified and non-expired OTP
    const existingOTP = await client.query(
      `SELECT * FROM complaint_otp_verification 
       WHERE complaint_id = $1 
       AND is_verified = FALSE 
       AND expires_at > NOW()
       ORDER BY generated_at DESC
       LIMIT 1`,
      [complaint_id]
    );

    let otpRecord;
    let isNewOTP = false;

    // If existing valid OTP found, reuse it
    if (existingOTP.rows.length > 0) {
      otpRecord = existingOTP.rows[0];
      console.log(`Reusing existing OTP for complaint ${complaint_id}: ${otpRecord.otp_code}`);
    } else {
      // Delete any expired or invalid OTPs
      await client.query(
        `DELETE FROM complaint_otp_verification 
         WHERE complaint_id = $1 AND is_verified = FALSE`,
        [complaint_id]
      );

      // Generate new 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Insert new OTP
      const result = await client.query(
        `INSERT INTO complaint_otp_verification 
         (complaint_id, otp_code, expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [complaint_id, otpCode, expiresAt]
      );

      otpRecord = result.rows[0];
      isNewOTP = true;
      console.log(`Generated new OTP for complaint ${complaint_id}: ${otpCode}`);
    }

    await client.query("COMMIT");

    // Here you would integrate with an SMS service
    // For now, just log the OTP
    console.log(`OTP for complaint ${complaint_id}: ${otpRecord.otp_code}`);
    console.log(`Send SMS to: ${mobileNumber}`);

    return res.status(200).json({
      success: true,
      message: isNewOTP ? "OTP generated successfully" : "OTP already active. Using existing OTP.",
      data: {
        otp_id: otpRecord.otp_id,
        expires_at: otpRecord.expires_at,
        is_existing: !isNewOTP,
        // Remove in production - only for testing
        test_otp: otpRecord.otp_code,
        mobile_number: mobileNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      }
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Generate OTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  } finally {
    if (client) client.release();
  }
};
/* =========================
   VERIFY OTP AND CLOSE COMPLAINT
========================= */
export const verifyOTPAndCloseComplaint = async (req, res) => {
  let client;
  try {
    const { complaint_id } = req.params;
    const { otp_code, remarks, changed_by } = req.body;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid complaint_id" 
      });
    }

    if (!otp_code || otp_code.length !== 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid 6-digit OTP is required" 
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Get the OTP record
    const otpCheck = await client.query(
      `SELECT ov.*, cm.status, cm.raised_by_name
       FROM complaint_otp_verification ov
       JOIN complaint_master cm ON ov.complaint_id = cm.complaint_id
       WHERE ov.complaint_id = $1 AND ov.is_verified = FALSE
       ORDER BY ov.generated_at DESC
       LIMIT 1`,
      [complaint_id]
    );

    if (otpCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "No active OTP found for this complaint" 
      });
    }

    const otpRecord = otpCheck.rows[0];

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please generate a new OTP" 
      });
    }

    // Check if too many retry_count 
    if (otpRecord.retry_count  >= 5) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "Too many failed retry_count . Please generate a new OTP" 
      });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp_code) {
      // Increment retry_count 
      await client.query(
        `UPDATE complaint_otp_verification 
         SET retry_count  = retry_count  + 1
         WHERE otp_id = $1`,
        [otpRecord.otp_id]
      );
      
      await client.query("COMMIT");
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${5 - (otpRecord.retry_count  + 1)} retry_count  remaining` 
      });
    }

    // OTP verified - close the complaint
    await client.query(
      `UPDATE complaint_otp_verification 
       SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP
       WHERE otp_id = $1`,
      [otpRecord.otp_id]
    );

    // Update complaint status to CLOSED
    await client.query(
      `UPDATE complaint_master 
       SET status = 'CLOSED'
       WHERE complaint_id = $1`,
      [complaint_id]
    );
await client.query(
  `UPDATE complaint_master
   SET closed_at = CURRENT_TIMESTAMP
   WHERE complaint_id = $1`,
  [complaint_id]
);
    // Add status history entry
    await client.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [complaint_id, 'RESOLVED', 'CLOSED', changed_by, remarks || 'Closed via OTP verification']
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Complaint closed.",
      data: {
        complaint_id: parseInt(complaint_id),
        status: "CLOSED",
        verified_at: new Date()
      }
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  } finally {
    if (client) client.release();
  }
};

/* =========================
   RESEND OTP FOR COMPLAINT
========================= */
// export const resendComplaintOTP = async (req, res) => {
//   try {
//     const { complaint_id } = req.params;
    
//     if (!complaint_id || isNaN(complaint_id)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid complaint_id" 
//       });
//     }

//     // Reuse the generate function
//     req.params = { complaint_id };
//     return generateComplaintOTP(req, res);
    
//   } catch (error) {
//     console.error("Resend OTP Error:", error);
//     return res.status(500).json({ 
//       success: false, 
//       message: "Internal Server Error" 
//     });
//   }
// };


export const resendComplaintOTP = async (req, res) => {
  let client;
  try {
    const { complaint_id } = req.params;
    
    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid complaint_id" 
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Get complaint with mobile number
    const complaintCheck = await client.query(
      `SELECT cm.complaint_id, cm.status, cm.raised_by_mobile
       FROM complaint_master cm
       WHERE cm.complaint_id = $1`,
      [complaint_id]
    );

    if (complaintCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Complaint not found" 
      });
    }

    const complaint = complaintCheck.rows[0];
    
    if (complaint.status !== 'RESOLVED') {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "OTP can only be generated for RESOLVED complaints" 
      });
    }

    const mobileNumber = complaint.raised_by_mobile;

    if (!mobileNumber) {
      await client.query("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: "Mobile number not found for this complaint" 
      });
    }

    // For resend, ALWAYS generate new OTP (delete any existing unverified)
    await client.query(
      `DELETE FROM complaint_otp_verification 
       WHERE complaint_id = $1 AND is_verified = FALSE`,
      [complaint_id]
    );

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Insert new OTP
    const result = await client.query(
      `INSERT INTO complaint_otp_verification 
       (complaint_id, otp_code, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [complaint_id, otpCode, expiresAt]
    );

    await client.query("COMMIT");

    console.log(`Resent OTP for complaint ${complaint_id}: ${otpCode}`);
    console.log(`Send SMS to: ${mobileNumber}`);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      data: {
        otp_id: result.rows[0].otp_id,
        expires_at: expiresAt,
        test_otp: otpCode,
        mobile_number: mobileNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      }
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  } finally {
    if (client) client.release();
  }
};


/* =========================
   GET OTP STATUS FOR COMPLAINT
========================= */
export const getOTPStatus = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    
    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid complaint_id" 
      });
    }

    const result = await pool.query(
      `SELECT ov.*, cm.status
       FROM complaint_otp_verification ov
       RIGHT JOIN complaint_master cm ON ov.complaint_id = cm.complaint_id
       WHERE cm.complaint_id = $1
       ORDER BY ov.generated_at DESC
       LIMIT 1`,
      [complaint_id]
    );

    const otpData = result.rows[0] || null;
    
    return res.status(200).json({
      success: true,
      data: {
        complaint_status: otpData?.status,
        otp_generated: otpData ? true : false,
        is_verified: otpData?.is_verified || false,
        expires_at: otpData?.expires_at,
        retry_count : otpData?.retry_count  || 0,
        verified_at: otpData?.verified_at
      }
    });
    
  } catch (error) {
    console.error("Get OTP Status Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
};
/* =========================
   GET COMPLAINTS BY PATIENT ID
========================= */
export const getComplaintsByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;

    if (!patient_id || isNaN(patient_id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid patient_id" 
      });
    }

    const query = `
      SELECT 
        cm.complaint_id,
        cm.ticket_number,
        cm.complaint_description,
        cm.status,
        cm.priority,
        cm.department,
        cm.created_at,
        cm.closed_at,
        cm.raised_by_type,
        json_agg(
          jsonb_build_object(
            'attachment_id', ca.attachment_id,
            'file_name', ca.file_name,
            'attachment_type', ca.attachment_type
          )
        ) FILTER (WHERE ca.attachment_id IS NOT NULL) as attachments,
        cas.assigned_employee_id,
        e.employee_name as assigned_employee_name
      FROM complaint_master cm
      LEFT JOIN complaint_attachment ca ON cm.complaint_id = ca.complaint_id
      LEFT JOIN complaint_assignment cas ON cm.complaint_id = cas.complaint_id
      LEFT JOIN employee e ON e.employee_id = cas.assigned_employee_id
      WHERE cm.patient_id = $1 
        AND cm.raised_by_type = 'PATIENT'  -- Add this filter
      GROUP BY cm.complaint_id, cas.assigned_employee_id, e.employee_name
      ORDER BY cm.created_at DESC
    `;

    const result = await pool.query(query, [patient_id]);

    const base = `${req.protocol}://${req.get("host")}`;
    const rows = result.rows.map(r => {
      if (r.attachments) {
        r.attachments = r.attachments.map(att => {
          if (att.file_name && !/^https?:\/\//i.test(att.file_name)) {
            att.file_name = `${base}/${att.file_name.replace(/^\/+/, "")}`;
          }
          return att;
        });
        r.before_images = r.attachments.filter(att => att.attachment_type === 'BEFORE');
        r.after_images = r.attachments.filter(att => att.attachment_type === 'AFTER');
      }
      return r;
    });

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get complaints by patient error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =========================
   SUBMIT CLOSURE FEEDBACK
========================= */
/* =========================
   SUBMIT CLOSURE FEEDBACK
========================= */
export const submitClosureFeedback = async (req, res) => {
  let client;
  try {
    const { complaint_id } = req.params;
    const { satisfaction_rating, comment } = req.body;
    
    // Handle both patient and employee token structures consistently
    const userId = req.user?.patient_id || req.user?.employee_id || req.user?.id;
    const userRole = req.user?.role;
    const userName = req.user?.name;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint_id"
      });
    }

    if (!satisfaction_rating || satisfaction_rating < 1 || satisfaction_rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Satisfaction rating must be between 1 and 5"
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Check if complaint exists and is CLOSED
    const complaintCheck = await client.query(
      `SELECT complaint_id, status, patient_id, raised_by_name, raised_by_type 
       FROM complaint_master 
       WHERE complaint_id = $1`,
      [complaint_id]
    );

    if (complaintCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const complaint = complaintCheck.rows[0];

    if (complaint.status !== 'CLOSED') {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted for closed complaints"
      });
    }

    // After checking complaint exists and status is CLOSED, add:

// Get the current closed_at timestamp for this complaint
const closedAtResult = await client.query(
  `SELECT closed_at FROM complaint_master WHERE complaint_id = $1`,
  [complaint_id]
);
const currentClosedAt = closedAtResult.rows[0].closed_at;

// Check if feedback already exists for THIS closure cycle
const existingFeedback = await client.query(
  `SELECT feedback_id, submitted_at FROM complaint_closure_feedback 
   WHERE complaint_id = $1`,
  [complaint_id]
);

if (existingFeedback.rows.length > 0) {
  const existingSubmittedAt = existingFeedback.rows[0].submitted_at;
  
  // If feedback was submitted after the current closed_at, it's for this closure
  if (new Date(existingSubmittedAt) >= new Date(currentClosedAt)) {
    await client.query("ROLLBACK");
    return res.status(400).json({
      success: false,
      message: "Feedback already submitted for this closure"
    });
  }
  // If feedback was from previous closure (submitted before current closed_at),
  // allow new feedback (delete old or just insert new - depending on business rule)
}

    // Check authorization based on user role
    let isAuthorized = false;
    
    if (userRole === 'patient') {
      // Patient: Check if complaint belongs to this patient
      isAuthorized = complaint.patient_id === parseInt(userId);
    } else if (userRole === 'employee') {
      // Employee: Check if complaint was raised by this employee
      // Get the employee name from database using employee_id
      const employeeCheck = await client.query(
        `SELECT employee_name FROM employee WHERE employee_id = $1`,
        [userId]
      );
      
      if (employeeCheck.rows.length > 0) {
        const employeeName = employeeCheck.rows[0].employee_name;
        isAuthorized = complaint.raised_by_name === employeeName && complaint.raised_by_type === 'EMPLOYEE';
      }
    }

    if (!isAuthorized) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "You can only submit feedback for your own complaints"
      });
    }

    // // Check if feedback already exists
    // const existingFeedback = await client.query(
    //   `SELECT feedback_id FROM complaint_closure_feedback 
    //    WHERE complaint_id = $1`,
    //   [complaint_id]
    // );

    // if (existingFeedback.rows.length > 0) {
    //   await client.query("ROLLBACK");
    //   return res.status(400).json({
    //     success: false,
    //     message: "Feedback already submitted for this complaint"
    //   });
    // }

    
    // Insert feedback
    const result = await client.query(
      `INSERT INTO complaint_closure_feedback 
       (complaint_id, satisfaction_rating, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [complaint_id, satisfaction_rating, comment || null]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Submit Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  } finally {
    if (client) client.release();
  }
};

/* =========================
   GET FEEDBACK FOR COMPLAINT
========================= */
/* =========================
   GET FEEDBACK FOR COMPLAINT
========================= */
// export const getFeedbackByComplaint = async (req, res) => {
//   try {
//     const { complaint_id } = req.params;

//     if (!complaint_id || isNaN(complaint_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid complaint_id"
//       });
//     }

//     const result = await pool.query(
//       `SELECT * FROM complaint_closure_feedback 
//        WHERE complaint_id = $1`,
//       [complaint_id]
//     );

//     // No authorization check needed for viewing feedback
//     // Anyone can view feedback for any complaint

//     return res.status(200).json({
//       success: true,
//       data: result.rows[0] || null
//     });

//   } catch (error) {
//     console.error("Get Feedback Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };

export const getFeedbackByComplaint = async (req, res) => {
  try {
    const { complaint_id } = req.params;

    if (!complaint_id || isNaN(complaint_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint_id"
      });
    }

    // Get complaint's current closed_at
    const complaintResult = await pool.query(
      `SELECT closed_at, status FROM complaint_master 
       WHERE complaint_id = $1`,
      [complaint_id]
    );

    // Get feedback if exists
    const feedbackResult = await pool.query(
      `SELECT * FROM complaint_closure_feedback 
       WHERE complaint_id = $1 
       ORDER BY submitted_at DESC 
       LIMIT 1`,
      [complaint_id]
    );

    const complaint = complaintResult.rows[0];
    const feedback = feedbackResult.rows[0] || null;

    return res.status(200).json({
      success: true,
      data: {
        feedback: feedback,
        complaint_closed_at: complaint?.closed_at || null,
        complaint_status: complaint?.status
      }
    });

  } catch (error) {
    console.error("Get Feedback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
/* =========================
   GET COMPLAINTS RAISED BY EMPLOYEE NAME
========================= */
export const getComplaintsByRaisedByName = async (req, res) => {
  try {
    const { raised_by_name } = req.params;

    const query = `
      SELECT 
        cm.complaint_id,
        cm.ticket_number,
        cm.complaint_description,
        cm.status,
        cm.priority,
        cm.department,
        cm.created_at,
        cm.closed_at,
        cm.raised_by_type,
        json_agg(
          jsonb_build_object(
            'attachment_id', ca.attachment_id,
            'file_name', ca.file_name,
            'attachment_type', ca.attachment_type
          )
        ) FILTER (WHERE ca.attachment_id IS NOT NULL) as attachments,
        cas.assigned_employee_id,
        e.employee_name as assigned_employee_name
      FROM complaint_master cm
      LEFT JOIN complaint_attachment ca ON cm.complaint_id = ca.complaint_id
      LEFT JOIN complaint_assignment cas ON cm.complaint_id = cas.complaint_id
      LEFT JOIN employee e ON e.employee_id = cas.assigned_employee_id
      WHERE cm.raised_by_name = $1 
        AND cm.raised_by_type = 'EMPLOYEE'  -- Add this filter
      GROUP BY cm.complaint_id, cas.assigned_employee_id, e.employee_name
      ORDER BY cm.created_at DESC
    `;

    const result = await pool.query(query, [raised_by_name]);

    const base = `${req.protocol}://${req.get("host")}`;
    const rows = result.rows.map(r => {
      if (r.attachments) {
        r.attachments = r.attachments.map(att => {
          if (att.file_name && !/^https?:\/\//i.test(att.file_name)) {
            att.file_name = `${base}/${att.file_name.replace(/^\/+/, "")}`;
          }
          return att;
        });
        r.before_images = r.attachments.filter(att => att.attachment_type === 'BEFORE');
        r.after_images = r.attachments.filter(att => att.attachment_type === 'AFTER');
      }
      return r;
    });

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Get complaints by raised by name error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
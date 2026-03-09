import pool from "../db.js";

/* =========================
	 COMPLAINT MASTER - GET ALL
========================= */
export const getComplaintMaster = async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM complaint_master ORDER BY complaint_id DESC"
		);

		return res.status(200).json({
			success: true,
			count: result.rows.length,
			data: result.rows
		});

	} catch (error) {	
		console.error("Fetch Error:", error.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
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
			category,
			sub_category,
			department,
			priority,
			complaint_description
		} = req.body;

		if (!ticket_number) ticket_number = `TKT-${Date.now()}`;

		if (!raised_by_type || !raised_by_name || !department || !priority) {
			await client.query("ROLLBACK");
			return res.status(400).json({ success: false, message: "Required fields are missing" });
		}

		const insertMasterQuery = `
			INSERT INTO complaint_master
			(ticket_number, raised_by_type, raised_by_name, category, sub_category, department, priority, complaint_description)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			RETURNING *;
		`;

		const masterResult = await client.query(insertMasterQuery, [
			ticket_number,
			raised_by_type,
			raised_by_name,
			category || null,
			sub_category || null,
			department,
			priority,
			complaint_description || null
		]);

		const complaint_id = masterResult.rows[0].complaint_id;

		if (req.file) {
			const insertAttachmentQuery = `
				INSERT INTO complaint_attachment
				(complaint_id, file_type, file_name)
				VALUES ($1,$2,$3)
				RETURNING *;
			`;

			await client.query(insertAttachmentQuery, [
				complaint_id,
				req.file.mimetype.split("/")[0],
				req.file.path
			]);
		}

		await client.query("COMMIT");

		return res.status(201).json({ success: true, message: "Complaint created successfully", data: masterResult.rows[0] });

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
	try {
		const { complaint_id } = req.params;

		if (!complaint_id || isNaN(complaint_id)) {
			return res.status(400).json({ success: false, message: "Invalid complaint_id" });
		}

		const {
			ticket_number,
			raised_by_type,
			raised_by_name,
			category,
			sub_category,
			department,
			priority,
			complaint_description
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
			complaint_id
		]);

		if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

		return res.status(200).json({ success: true, message: "Complaint updated successfully", data: result.rows[0] });

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

		if (!complaint_id || isNaN(complaint_id)) return res.status(400).json({ success: false, message: "Invalid complaint_id" });

		await pool.query("DELETE FROM complaint_attachment WHERE complaint_id = $1", [complaint_id]);

		const result = await pool.query("DELETE FROM complaint_master WHERE complaint_id = $1 RETURNING *", [complaint_id]);

		if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

		return res.status(200).json({ success: true, message: "Complaint deleted successfully", data: result.rows[0] });

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
		const result = await pool.query("SELECT * FROM complaint_attachment ORDER BY attachment_id DESC");
		return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
	} catch (error) {
		console.error("Fetch Error:", error.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
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
			return res.status(400).json({ success: false, message: "Complaint ID or file is missing" });
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
			req.file.path
		]);

		await client.query("COMMIT");
		return res.status(201).json({ success: true, message: "Attachment added successfully", data: result.rows[0] });

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
		if (!attachment_id || isNaN(attachment_id)) return res.status(400).json({ success: false, message: "Invalid attachment_id" });

		const result = await pool.query("DELETE FROM complaint_attachment WHERE attachment_id = $1 RETURNING *", [attachment_id]);
		if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Attachment not found" });

		return res.status(200).json({ success: true, message: "Attachment deleted successfully", data: result.rows[0] });
	} catch (error) {
		console.error("Delete Error:", error.message);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
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

				ca.file_name AS attachment_path,

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

			ORDER BY cm.created_at DESC
		`;

		const result = await pool.query(query);

		// ensure every row has an absolute URL for the frontend
		const base = `${req.protocol}://${req.get("host")}`;
		const rows = result.rows.map(r => {
			if (r.attachment_path && !/^https?:\/\//i.test(r.attachment_path)) {
				// normalize leading slash and prepend origin
				const rel = r.attachment_path.replace(/^\/+/, "");
				r.attachment_path = `${base}/${rel}`;
			}
			return r;
		});

		return res.json({ success: true, data: rows });
	} catch (error) {
		console.error("Complaint List Error:", error);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

/* =========================
	 UPDATE STATUS / PRIORITY
========================= */
export const updateComplaintStatus = async (req, res) => {
	try {
		const { complaint_id } = req.params;
		const { status, priority } = req.body;

		if (!complaint_id || isNaN(complaint_id)) return res.status(400).json({ success: false, message: "Invalid complaint_id" });
		if (!status && !priority) return res.status(400).json({ success: false, message: "Nothing to update" });

		const fields = [];
		const values = [];
		let idx = 1;
		if (status) { fields.push(`status = $${idx++}`); values.push(status); }
		if (priority) { fields.push(`priority = $${idx++}`); values.push(priority); }
		values.push(complaint_id);

		const query = `UPDATE complaint_master SET ${fields.join(", ")} WHERE complaint_id = $${idx} RETURNING *`;
		const result = await pool.query(query, values);

		if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });
		return res.status(200).json({ success: true, data: result.rows[0] });

	} catch (error) {
		console.error("Update status error:", error);
		return res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};





export const assignComplaint = async (req, res) => {
    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const {
            complaint_id,
            assigned_employee_id,
            changed_by,
            remarks
        } = req.body;

        // ---------------- VALIDATION ----------------
        if (!complaint_id || isNaN(complaint_id)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Invalid complaint_id" });
        }

        if (!assigned_employee_id || isNaN(assigned_employee_id)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Invalid assigned_employee_id" });
        }

        // ---------------- CHECK COMPLAINT EXISTS ----------------
        const complaintCheck = await client.query(
            "SELECT status FROM complaint_master WHERE complaint_id = $1",
            [complaint_id]
        );

        if (complaintCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        const old_status = complaintCheck.rows[0].status || "OPEN";

        // ---------------- GET EMPLOYEE DEPARTMENT ----------------
        const empResult = await client.query(
            "SELECT department FROM employee WHERE employee_id = $1 AND status = 'Active'",
            [assigned_employee_id]
        );

        if (empResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ success: false, message: "Employee not found or inactive" });
        }

        const assigned_department = empResult.rows[0].department;

        // ---------------- 1️⃣ INSERT INTO complaint_assignment ----------------
        await client.query(
            `
            INSERT INTO complaint_assignment
            (complaint_id, assigned_department, assigned_employee_id)
            VALUES ($1, $2, $3)
            `,
            [complaint_id, assigned_department, assigned_employee_id]
        );

        // ---------------- 2️⃣ INSERT INTO complaint_status_history ----------------
        await client.query(
            `
            INSERT INTO complaint_status_history
            (complaint_id, old_status, new_status, changed_by, remarks)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [
                complaint_id,
                old_status,
                "ASSIGNED",
                changed_by,
                remarks || `Assigned to employee ID ${assigned_employee_id}`
            ]
        );

        // ---------------- 3️⃣ UPDATE complaint_master ----------------
        await client.query(
            `
            UPDATE complaint_master
            SET status = 'ASSIGNED',
                assigned_to = $1
            WHERE complaint_id = $2
            `,
            [assigned_employee_id, complaint_id]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Complaint assigned successfully"
        });

    } catch (error) {
        if (client) await client.query("ROLLBACK");
        console.error("Assign Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (client) client.release();
    }
};

export const getComplaintAssignments = async (req, res) => {
  try {

    const { complaint_id } = req.params;

    const result = await pool.query(`
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
    `, [complaint_id]);

    return res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {

    console.error("Fetch Assignment Error:", error);

    return res.status(500).json({
      success: false
    });

  }
};


export const updateComplaintAssignment = async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const { assignment_id } = req.params;
        const { assigned_employee_id, changed_by, remarks } = req.body;

        if (!assignment_id || isNaN(assignment_id))
            return res.status(400).json({ success: false });

        const emp = await client.query(
            "SELECT department FROM employee WHERE employee_id = $1",
            [assigned_employee_id]
        );

        if (emp.rows.length === 0)
            return res.status(404).json({ success: false, message: "Employee not found" });

        const department = emp.rows[0].department;

        const result = await client.query(
            `
            UPDATE complaint_assignment
            SET assigned_employee_id = $1,
                assigned_department = $2,
                assigned_at = CURRENT_TIMESTAMP
            WHERE assignment_id = $3
            RETURNING complaint_id
            `,
            [assigned_employee_id, department, assignment_id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ success: false });

        const complaint_id = result.rows[0].complaint_id;

        await client.query(
            `
            UPDATE complaint_master
            SET assigned_to = $1
            WHERE complaint_id = $2
            `,
            [assigned_employee_id, complaint_id]
        );

        await client.query(
            `
            INSERT INTO complaint_status_history
            (complaint_id, old_status, new_status, changed_by, remarks)
            VALUES ($1, 'ASSIGNED', 'ASSIGNED', $2, $3)
            `,
            [complaint_id, changed_by, remarks || "Reassigned"]
        );

        await client.query("COMMIT");

        return res.json({ success: true });

    } catch (error) {
        if (client) await client.query("ROLLBACK");
        console.error("Update Assignment Error:", error);
        return res.status(500).json({ success: false });
    } finally {
        if (client) client.release();
    }
}; 

export const deleteComplaintAssignment = async (req, res) => {
  const { assignment_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT complaint_id FROM complaint_assignment WHERE assignment_id=$1",
      [assignment_id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Assignment not found" });

    const complaint_id = result.rows[0].complaint_id;

    await pool.query(
      "DELETE FROM complaint_assignment WHERE assignment_id=$1",
      [assignment_id]
    );

    await pool.query(
      "UPDATE complaint_master SET status='OPEN' WHERE complaint_id=$1",
      [complaint_id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
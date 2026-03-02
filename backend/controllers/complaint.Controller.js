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
				ca.file_name AS attachment_path

			FROM complaint_master cm
			LEFT JOIN complaint_attachment ca
				ON cm.complaint_id = ca.complaint_id
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


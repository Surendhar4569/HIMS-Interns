import pool from "../db.js";

export const getNextRequestNumber = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT request_number FROM request_master ORDER BY request_id DESC LIMIT 1"
    );

    const year = new Date().getFullYear();
    let nextSeq = 1;

    if (result.rows.length > 0) {
      const lastNumber = result.rows[0].request_number;
      const lastSeq = parseInt(lastNumber.split("-")[2]);
      nextSeq = lastSeq + 1;
    }

    const formattedSeq = String(nextSeq).padStart(3, "0");

    res.status(200).json({
      next_sequence: formattedSeq,
      year: year,
    });
  } catch (error) {
    console.error("Error generating request number:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Post Request (Employee)
 */
export const postRequest = async (req, res) => {
  try {
    const {
      request_category,
      request_title,
      requirement_description,
      related_module,
      existing_feature_ref,
      priority,
    } = req.body;

    // Prefix mapping (CR / AR)
    const prefix = request_category === "CR" ? "CR" : "AR";
    const year = new Date().getFullYear();

    // Get last request number
    const lastResult = await pool.query(
      "SELECT request_number FROM request_master ORDER BY request_id DESC LIMIT 1"
    );

    let nextSeq = 1;

    if (lastResult.rows.length > 0) {
      const lastNumber = lastResult.rows[0].request_number;
      const lastSeq = parseInt(lastNumber.split("-")[2]);
      nextSeq = lastSeq + 1;
    }

    const formattedSeq = String(nextSeq).padStart(3, "0");
    const requestNumber = `${prefix}-${year}-${formattedSeq}`;

    // Category mapping to DB enum values
    const categoryDB =
      request_category === "CR"
        ? "CHANGE_REQUEST"
        : "ADDITIONAL_REQUIREMENT";

    const insertQuery = `
  INSERT INTO request_master 
  (request_number, request_category, request_title, requirement_description, related_module, existing_feature_ref, priority, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, 'RAISED')
  RETURNING request_id
`;

    const values = [
  requestNumber,
  categoryDB,
  request_title,
  requirement_description,
  related_module || null,
  existing_feature_ref || null,
  priority,
];

    const result = await pool.query(insertQuery, values);
    const requestId = result.rows[0].request_id;

    // Handle attachment (REUSING existing middleware ✅)
    if (req.file) {
      await pool.query(
        `INSERT INTO request_attachments (request_id, file_name, file_path)
         VALUES ($1, $2, $3)`,
        [requestId, req.file.filename, req.file.path]
      );
    }

    res.status(200).json({
      message: "Request submitted successfully",
      request_number: requestNumber,
    });
  } catch (error) {
    console.error("Error posting request:", error);
    res.status(500).json({ error: "Server error" });
  }
};
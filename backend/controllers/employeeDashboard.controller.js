import con from "../db.js";

export const getEmployeeComplaints = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const result = await con.query(
      `
      SELECT 
        cm.complaint_id,
        cm.ticket_number,
        cm.complaint_description,
        cm.status,
        cm.priority,
        cm.department,
        cm.created_at
      FROM complaint_master cm
      JOIN complaint_assignment ca
        ON cm.complaint_id = ca.complaint_id
      WHERE ca.assigned_employee_id = $1
      ORDER BY cm.created_at DESC
      `,
      [employee_id],
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { old_status, new_status, changed_by, remarks } = req.body;

    // Validate status transition
    const statusFlow = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const oldIndex = statusFlow.indexOf(old_status);
    const newIndex = statusFlow.indexOf(new_status);
    
    if (newIndex < oldIndex) {
      return res.status(400).json({
        success: false,
        message: "Cannot move backwards in status flow",
      });
    }

    // Start transaction
    await con.query("BEGIN");

    // Update complaint master status (removed updated_at)
    await con.query(
      `UPDATE complaint_master
       SET status = $1
       WHERE complaint_id = $2`,
      [new_status, complaint_id],
    );

    // Insert into status history
    await con.query(
      `INSERT INTO complaint_status_history
       (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      [complaint_id, old_status, new_status, changed_by, remarks],
    );

    await con.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    await con.query("ROLLBACK");
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
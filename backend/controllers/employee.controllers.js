import con from "../db.js";

// ✅ GET All Employees (DATE FIXED)
export const getEmployees = async (req, res) => {
  try {
    const result = await con.query(`
      SELECT 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status,
        date_of_joining,
        created_at
      FROM employee
      ORDER BY employee_id DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("Get Employees Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ✅ REGISTER Employee (DOB FIXED)
export const registerEmployee = async (req, res) => {
  try {
    const {
      employee_name,
      gender,
      dob,
      email,
      contact_number,
      department,
      designation,
      qualification,
      experience_years,
      status,
    } = req.body;

    if (
      !employee_name ||
      !gender ||
      !dob ||
      !email ||
      !contact_number ||
      !department ||
      !designation
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const query = `
      INSERT INTO employee
      (employee_name, gender, dob, email, contact_number,
       department, designation, qualification,
       experience_years, status,
       date_of_joining, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
      RETURNING 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status;
    `;

    const result = await con.query(query, [
      employee_name,
      gender,
      dob,
      email,
      contact_number,
      department,
      designation,
      qualification || null,
      experience_years || null,
      status || "Active",
    ]);

    return res.status(201).json({
      success: true,
      message: "Employee registered successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Register Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ✅ UPDATE Employee (DOB FIXED)
export const updateEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const {
      employee_name,
      gender,
      dob,
      email,
      contact_number,
      department,
      designation,
      qualification,
      experience_years,
      status,
    } = req.body;

    const query = `
      UPDATE employee
      SET
        employee_name = COALESCE($1, employee_name),
        gender = COALESCE($2, gender),
        dob = COALESCE($3, dob),
        email = COALESCE($4, email),
        contact_number = COALESCE($5, contact_number),
        department = COALESCE($6, department),
        designation = COALESCE($7, designation),
        qualification = COALESCE($8, qualification),
        experience_years = COALESCE($9, experience_years),
        status = COALESCE($10, status)
      WHERE employee_id = $11
      RETURNING 
        employee_id,
        employee_name,
        gender,
        TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
        email,
        contact_number,
        department,
        designation,
        qualification,
        experience_years,
        status;
    `;

    const result = await con.query(query, [
      employee_name || null,
      gender || null,
      dob || null,
      email || null,
      contact_number || null,
      department || null,
      designation || null,
      qualification || null,
      experience_years || null,
      status || null,
      employee_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Update Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ✅ DELETE Employee
export const deleteEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const result = await con.query(
      "DELETE FROM employee WHERE employee_id = $1 RETURNING *",
      [employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
import con from "../db.js";

export const employeeLogin = async (req, res) => {
  try {

    const { employee_name, password } = req.body;

    if (!employee_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password required" 
      });
    }

    const result = await con.query(
      `SELECT employee_id, employee_name 
       FROM employee
       WHERE employee_name = $1 AND password = $2`,
      [employee_name, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      employee: result.rows[0]
    });

  } catch (error) {

    console.error("Employee Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};
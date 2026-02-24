// import express from "express"
// import con from "../db.js"
// export const  getComplaint=async (req,res)=>{
//     try{
//     const get_query="SELECT * FROM patient_complaints"
//     const result=await con.query(get_query)
//     return res.status(200).json({
//         sucess:true,
//         count:result.rows.length,
//         data:result.rows
//     })

//     }
//     catch(error){
//         console.log("error fetching",error.message)
//         return res.status(500).json({
//             sucess:false,
//             message:"internal server error"
//         })

//     }
// }



// export const postComplaint = async (req, res) => {
//   const client = await con.connect();

//   try {
//     const {
//       patient_id,
//       contact_number,
//       complaint_description,
//       priority,
//       status,
//       attachment_path,
//       patient_name,
//     } = req.body;

//     // Basic validation
//     if (!patient_id ||!patient_name|| !contact_number || !complaint_description || !priority || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields are missing"
//       });
//     }

//     const allowedPriorities = ["Low", "Medium", "High"];
//     if (!allowedPriorities.includes(priority)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid priority value"
//       });
//     }

//     const allowedStatus = ["New","Open", "In Progress", "Resolved", "Closed"];
//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value"
//       });
//     }

//     await client.query("BEGIN");

//     const insertQuery = `
//       INSERT INTO patient_complaints
//       (patient_id, contact_number, complaint_description, priority, status, attachment_path, complaint_datetime,patient_name)
//       VALUES ($1, $2, $3, $4, $5, $6,$7, NOW(),$8)
//       RETURNING *;
//     `;

//     const result = await client.query(insertQuery, [
//       patient_id,
//       contact_number,
//       complaint_description,
//       priority,
//       status,
//       attachment_path ?? null,
//       patient_name
//     ]);

//     await client.query("COMMIT");

//     return res.status(201).json({
//       success: true,
//       message: "Complaint submitted successfully",
//       data: result.rows[0]
//     });

//   } catch (error) {
//     await client.query("ROLLBACK");

//     console.error("Error inserting complaint:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   } finally {
//     client.release();
//   }
// };


// export const updateComplaint = async (req, res) => {
//   try {
//     const { complaint_id } = req.params;

//     if (isNaN(complaint_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid complaint_id",
//       });
//     }

//     const {
//       patient_id,
//       contact_number,
//       complaint_description,
//       priority,
//       status,
//       attachment_path,
//       patient_name
//     } = req.body;

//     const checkQuery =
//       "SELECT * FROM patient_complaints WHERE complaint_id = $1";
//     const existing = await con.query(checkQuery, [complaint_id]);

//     if (existing.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found",
//       });
//     }


//     const allowedPriorities = ["Low", "Medium", "High"];
//     if (priority && !allowedPriorities.includes(priority)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid priority value",
//       });
//     }
//     const allowedStatus = ["New","Open", "In Progress", "Resolved", "Closed"];
//     if (status && !allowedStatus.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status value",
//       });
//     }

//     const updateQuery = `
//       UPDATE patient_complaints
//       SET 
//         patient_id = COALESCE($1, patient_id),
//         contact_number = COALESCE($2, contact_number),
//         complaint_description = COALESCE($3, complaint_description),
//         priority = COALESCE($4, priority),
//         status = COALESCE($5, status),
//         attachment_path = COALESCE($6, attachment_path),
//         patient_name = COALESCE($7, patient_name)
//       WHERE complaint_id = $
//       RETURNING *;
//     `;

//     const result = await con.query(updateQuery, [
//       patient_id || null,
//       contact_number || null,
//       complaint_description || null,
//       priority || null,
//       status || null,
//       attachment_path || null,
//       complaint_id,
//       patient_name || null
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Complaint updated successfully",
//       data: result.rows[0],
//     });
//   } catch (error) {
//     console.error("Update Complaint Error:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };




// export const deleteComplaint = async (req, res) => {
//   try {
//     const { complaint_id } = req.params;

//    if (!complaint_id || isNaN(complaint_id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid complaint_id",
//       });
//     }

//     const deleteQuery = `
//       DELETE FROM patient_complaints
//       WHERE complaint_id = $1
//       RETURNING *;
//     `;

//     const result = await con.query(deleteQuery, [complaint_id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Complaint deleted successfully",
//       data: result.rows[0],
//     });

//   } catch (error) {
//     console.error("Delete Complaint Error:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };






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
    const {
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status,
      attachment_path
    } = req.body;

    // Basic validation
    if (
      !patient_id ||
      !patient_name ||
      !contact_number ||
      !complaint_description ||
      !priority ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    const allowedPriorities = ["Low", "Medium", "High"];
    const allowedStatus = ["New", "Open", "In Progress", "Resolved", "Closed"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value"
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO patient_complaint
      (patient_id,patient_name, contact_number, complaint_description, priority, status, attachment_path, complaint_datetime)
      VALUES ($1, $2, $3, $4, $5, $6, $7,NOW())
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
      patient_id,
      patient_name,
      contact_number,
      complaint_description,
      priority,
      status,
      attachment_path ?? null,
      
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Insert Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
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
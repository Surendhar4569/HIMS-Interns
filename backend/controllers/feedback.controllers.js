import express from "express"
import con from "../db.js"
export const  getfeedBack=async (req,res)=>{
    try{
    const get_query="SELECT * FROM patient_feedback"
    const result=await con.query(get_query)
    return res.status(200).json({
        sucess:true,
        count:result.rows.length,
        data:result.rows
    })

    }
    catch(error){
        console.log("error fetching",error.message)
        return res.status(500).json({
            sucess:false,
            message:"internal server error"
        })

    }
}



export const postFeedback = async (req, res) => {
  const client = await con.connect();

  try {
    const {
      patient_id,
      admission_id,
      service_type,
      rating,
      feedback_comments,
      feedback_mode,
      consent_flag,
    } = req.body;

    if (!patient_id || !service_type || !rating || !feedback_mode) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO patient_feedback
      (patient_id, admission_id, service_type, rating,
       feedback_comments, feedback_mode, consent_flag, created_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [ // FIXED
      patient_id,
      admission_id || null,
      service_type,
      rating,
      feedback_comments || null,
      feedback_mode,
      consent_flag || false,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Feedback already submitted",
      });
    }

    console.error("Error inserting feedback:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  } finally {
    client.release();
  }
};



export const updateFeedback = async (req, res) => {
  try {
    const { feedback_id } = req.params;

    const {
      service_type,
      rating,
      feedback_comments,
      feedback_mode,
      consent_flag
    } = req.body;

  
    if (isNaN(feedback_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback_id"
      });
    }

  
    const checkQuery = "SELECT * FROM patient_feedback WHERE feedback_id = $1";
    const existing = await con.query(checkQuery, [feedback_id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

 

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const allowedServiceTypes = ["OPD", "IPD", "Diagnostic", "Pharmacy"];
    if (service_type && !allowedServiceTypes.includes(service_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service_type"
      });
    }

    const allowedModes = ["Online", "Offline", "Kiosk", "App","source"];
    if (feedback_mode && !allowedModes.includes(feedback_mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback_mode"
      });
    }



    const updateQuery = `
      UPDATE patient_feedback
      SET 
        service_type = COALESCE($1, service_type),
        rating = COALESCE($2, rating),
        feedback_comments = COALESCE($3, feedback_comments),
        feedback_mode = COALESCE($4, feedback_mode),
        consent_flag = COALESCE($5, consent_flag)
      WHERE feedback_id = $6
      RETURNING *;
    `;

    const result = await con.query(updateQuery, [
      service_type || null,
      rating || null,
      feedback_comments || null,
      feedback_mode || null,
      consent_flag,
      feedback_id
    ]);

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Update Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};




export const deleteFeedback = async (req, res) => {
  try {
    const { feedback_id } = req.params;

    if (isNaN(feedback_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback_id"
      });
    }

    const deleteQuery = `
      DELETE FROM patient_feedback
      WHERE feedback_id = $1
      RETURNING *;
    `;

    const result = await con.query(deleteQuery, [feedback_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Delete Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
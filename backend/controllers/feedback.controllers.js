import express from "express"
import con from "../db.js"

export const getfeedBack = async (req, res) => {
  try {

    const query = `
      SELECT 
        pf.feedback_id,
        pf.patient_id,
        pf.patient_name,
        pf.admission_id,
        pf.service_type,
        pf.rating AS overall_rating,
        pf.feedback_comments,
        pf.feedback_mode,
        pf.consent_flag,
        pf.created_date,

        COALESCE(
          json_agg(
            json_build_object(
              'module_rating_id', fmr.module_rating_id,
              'module_name', fmr.module_name,
              'rating', fmr.rating,
              'comment', fmr.comment
            )
          ) FILTER (WHERE fmr.module_rating_id IS NOT NULL),
          '[]'
        ) AS module_ratings

      FROM patient_feedback pf
      LEFT JOIN feedback_module_ratings fmr
      ON pf.feedback_id = fmr.feedback_id

      GROUP BY pf.feedback_id
      ORDER BY pf.created_date DESC;
    `;

    const result = await con.query(query);

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




export const postFeedback = async (req, res) => {
  const client = await con.connect();

  try {
    const {
      patient_id,
      patient_name,
      admission_id,
      service_type,
      rating,
      feedback_comments,
      feedback_mode,
      consent_flag,
      module_ratings
    } = req.body;

    if (
      !patient_id ||
      !patient_name ||
      !service_type ||
      !rating ||
      !feedback_mode ||
      !Array.isArray(module_ratings) ||
      module_ratings.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Overall rating must be between 1 and 5"
      });
    }

    for (const module of module_ratings) {
      if (
        !module.module_name ||
        !module.rating ||
        module.rating < 1 ||
        module.rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid module rating data"
        });
      }
    }

    await client.query("BEGIN");

    const insertFeedbackQuery = `
      INSERT INTO patient_feedback
      (patient_id, patient_name, admission_id, service_type,
       rating, feedback_comments, feedback_mode, consent_flag)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING feedback_id;
    `;

    const feedbackResult = await client.query(insertFeedbackQuery, [
      patient_id,
      patient_name,
      admission_id || null,
      service_type,
      rating,
      feedback_comments || null,
      feedback_mode,
      consent_flag === "Yes" ? true : false
    ]);

    const feedback_id = feedbackResult.rows[0].feedback_id;

    const insertModuleQuery = `
      INSERT INTO feedback_module_ratings
      (feedback_id, module_name, rating, comment)
      VALUES ($1, $2, $3, $4);
    `;

    for (const module of module_ratings) {
      await client.query(insertModuleQuery, [
        feedback_id,
        module.module_name,
        module.rating,
        module.comment || null
      ]);
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback_id
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error("Insert Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  } finally {
    client.release();
  }
};









export const updateFeedback = async (req, res) => {
  const client = await con.connect();

  try {
    const { feedback_id } = req.params;

    if (isNaN(feedback_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback_id"
      });
    }

    const {
      service_type,
      rating,
      feedback_comments,
      feedback_mode,
      consent_flag,
      module_ratings
    } = req.body;
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM patient_feedback WHERE feedback_id = $1",
      [feedback_id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Overall rating must be between 1 and 5"
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

    const updatedParent = await client.query(updateQuery, [
      service_type || null,
      rating || null,
      feedback_comments || null,
      feedback_mode || null,
      consent_flag === "Yes" ? true : false,
      feedback_id
    ]);

    if (Array.isArray(module_ratings)) {

      for (const module of module_ratings) {
        if (
          !module.module_name ||
          !module.rating ||
          module.rating < 1 ||
          module.rating > 5
        ) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            success: false,
            message: "Invalid module rating data"
          });
        }
      }

      await client.query(
        "DELETE FROM feedback_module_ratings WHERE feedback_id = $1",
        [feedback_id]
      );

      const insertModuleQuery = `
        INSERT INTO feedback_module_ratings
        (feedback_id, module_name, rating, comment)
        VALUES ($1, $2, $3, $4);
      `;

      for (const module of module_ratings) {
        await client.query(insertModuleQuery, [
          feedback_id,
          module.module_name,
          module.rating,
          module.comment || null
        ]);
      }
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedParent.rows[0]
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error("Update Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  } finally {
    client.release();
  }
};










export const deleteFeedback = async (req, res) => {
  const client = await con.connect();

  try {
    const { feedback_id } = req.params;

    if (isNaN(feedback_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback_id"
      });
    }

    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT feedback_id FROM patient_feedback WHERE feedback_id = $1",
      [feedback_id]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    await client.query(
      "DELETE FROM patient_feedback WHERE feedback_id = $1",
      [feedback_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error("Delete Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  } finally {
    client.release();
  }
};
import express from "express";
import { getComplaintList, updateComplaintStatus } from "../controllers/complaint.Controller.js";

const router = express.Router();

// Route for complaint_list.jsx to get all complaints
// GET /api/complaint_list/getComplaintList
router.get("/getComplaintList", getComplaintList);

// Route for complaint_list.jsx to assign/update/delete an assignment
// PUT /api/complaint_list/assign/:complaint_id
router.put("/assign/:complaint_id", updateComplaintStatus);

export default router;
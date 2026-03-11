import express from "express";
import { getEmployeeComplaints } from "../controllers/employeeDashboard.controller.js";
import { updateComplaintStatus } from "../controllers/employeeDashboard.controller.js";

const employeeDashboardRouter = express.Router();

employeeDashboardRouter.get("/complaints/:employee_id", getEmployeeComplaints);
employeeDashboardRouter.put("/complaints/:complaint_id", updateComplaintStatus);

export default employeeDashboardRouter;
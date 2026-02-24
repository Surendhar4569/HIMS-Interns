import express from "express"
import {  getComplaint } from "../controllers/complaints.controllers.js"
import { postComplaint } from "../controllers/complaints.controllers.js"
import { updateComplaint } from "../controllers/complaints.controllers.js"
import { deleteComplaint } from "../controllers/complaints.controllers.js"
const patient_complaints=express.Router()

patient_complaints.get("/getComplaint",getComplaint)
// patient_complaints.post("/postComplaint",postComplaint)
patient_complaints.put("/updateComplaint/:complaint_id",updateComplaint)
patient_complaints.delete("/deleteComplaint/:complaint_id",deleteComplaint)

patient_complaints.post(
  "/postComplaint",
)
export default patient_complaints;

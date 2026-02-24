import express from "express"
import {  getComplaint } from "../controllers/complaints.controllers.js"
import { postComplaint } from "../controllers/complaints.controllers.js"
import { updateComplaint } from "../controllers/complaints.controllers.js"
import { deleteComplaint } from "../controllers/complaints.controllers.js"
import upload from "../middleware/upload.js"
const patient_complaints=express.Router()

patient_complaints.get("/getComplaint",
  upload.single("attachment_path")
  ,getComplaint)


patient_complaints.post(
  "/postComplaint",
  upload.single("attachment_path"),
  postComplaint
);


patient_complaints.put("/updateComplaint/:complaint_id",
  upload.single("attachment_path"),
  updateComplaint)


patient_complaints.delete("/deleteComplaint/:complaint_id",
  
  upload.single("attachment_path"),
  deleteComplaint)

export default patient_complaints;
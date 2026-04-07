import express from "express";
import upload from "../middleware/upload.js";
import {
  getComplaintMaster,
  postComplaintMaster,
  addAfterResolutionImage,
  updateComplaintMaster,
  deleteComplaintMaster,
  getComplaintById,
  getComplaintList,
  updateComplaintStatus,
  getComplaintAttachments,
  postComplaintAttachment,
  deleteComplaintAttachment,
  generateComplaintOTP,
  verifyOTPAndCloseComplaint,
  resendComplaintOTP,
  getOTPStatus,
  getComplaintsByPatient,
    submitClosureFeedback,
  getFeedbackByComplaint,
  getComplaintsByRaisedByName
} from "../controllers/complaint.Controller.js";

import {getComplaintAssignments,
    assignComplaint,
    updateComplaintAssignment,
    deleteComplaintAssignment
} from "../controllers/complaint.Controller.js"
import { verifyToken } from "../middleware/authMiddleware.js";
import { verify } from "crypto";
const complaintRouter = express.Router();

// Complaint master routes
complaintRouter.get("/getComplaintMaster",verifyToken, getComplaintMaster);

complaintRouter.post(
  "/postComplaintMaster",
  verifyToken,
  upload,
  postComplaintMaster
);

complaintRouter.put("/updateComplaintMaster/:complaint_id",verifyToken, updateComplaintMaster);

complaintRouter.delete("/deleteComplaintMaster/:complaint_id",verifyToken, deleteComplaintMaster);

// Complaint list routes
complaintRouter.get("/getComplaintList",verifyToken, getComplaintList);
complaintRouter.patch("/updateStatus/:complaint_id",verifyToken, updateComplaintStatus);

// Attachment routes
complaintRouter.get("/getComplaintAttachments",verifyToken, getComplaintAttachments);

complaintRouter.post(
  "/postComplaintAttachment",
  verifyToken,
  upload,
  postComplaintAttachment
);

complaintRouter.delete(
  "/deleteComplaintAttachment/:attachment_id",
  verifyToken,
  deleteComplaintAttachment
);
complaintRouter.post("/add-after-image", verifyToken, upload, addAfterResolutionImage);

complaintRouter.post("/complaints/add-after-image", upload, addAfterResolutionImage);
complaintRouter.get("/get-complaint-assigned/:complaint_id",verifyToken,getComplaintAssignments)
complaintRouter.post("/post-complaint-assigned",verifyToken,assignComplaint)
complaintRouter.put("/update-complaint-assigned/:assignment_id",verifyToken,updateComplaintAssignment)
complaintRouter.delete("/delete-complaint-assigned/:assignment_id",verifyToken,deleteComplaintAssignment)
complaintRouter.get("/getComplaintById/:complaint_id", verifyToken, getComplaintById);

// OTP Verification Routes
complaintRouter.post("/generate-otp/:complaint_id", verifyToken, generateComplaintOTP);
complaintRouter.post("/verify-otp/:complaint_id", verifyToken, verifyOTPAndCloseComplaint);
complaintRouter.post("/resend-otp/:complaint_id", verifyToken, resendComplaintOTP);
complaintRouter.get("/otp-status/:complaint_id", verifyToken, getOTPStatus);

complaintRouter.get("/getComplaintsByPatient/:patient_id", verifyToken,getComplaintsByPatient);

complaintRouter.post("/submit-feedback/:complaint_id", verifyToken, submitClosureFeedback);
complaintRouter.get("/get-feedback/:complaint_id", verifyToken, getFeedbackByComplaint);
// Add this route
complaintRouter.get("/getComplaintsByRaisedByName/:raised_by_name", verifyToken, getComplaintsByRaisedByName);
export default complaintRouter;
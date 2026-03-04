import express from "express";
import upload from "../middleware/upload.js";
import {
  getComplaintMaster,
  postComplaintMaster,
  updateComplaintMaster,
  deleteComplaintMaster,
  getComplaintList,
  updateComplaintStatus,
  getComplaintAttachments,
  postComplaintAttachment,
  deleteComplaintAttachment
} from "../controllers/complaint.Controller.js";

const complaintRouter = express.Router();

// Complaint master routes
complaintRouter.get("/getComplaintMaster", getComplaintMaster);

complaintRouter.post(
  "/postComplaintMaster",
  upload,
  postComplaintMaster
);

complaintRouter.put("/updateComplaintMaster/:complaint_id", updateComplaintMaster);

complaintRouter.delete("/deleteComplaintMaster/:complaint_id", deleteComplaintMaster);

// Complaint list routes
complaintRouter.get("/getComplaintList", getComplaintList);
complaintRouter.patch("/updateStatus/:complaint_id", updateComplaintStatus);

// Attachment routes
complaintRouter.get("/getComplaintAttachments", getComplaintAttachments);

complaintRouter.post(
  "/postComplaintAttachment",
  upload,
  postComplaintAttachment
);

complaintRouter.delete(
  "/deleteComplaintAttachment/:attachment_id",
  deleteComplaintAttachment
);

export default complaintRouter;

import express from "express";
import {
  postRequest,
  getNextRequestNumber,
} from "../controllers/request.controllers.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Get auto request number
router.get("/getNextRequestNumber", getNextRequestNumber);

// Post request (with existing upload middleware)
router.post("/postRequest", upload.single("attachment"), postRequest);

export default router;
import express from "express"
import {  getfeedBack, postFeedback } from "../controllers/feedback.controllers.js"

import { updateFeedback } from "../controllers/feedback.controllers.js"
import { deleteFeedback } from "../controllers/feedback.controllers.js"
const patient_feedback=express.Router()

patient_feedback.get("/getFeedback",getfeedBack)
patient_feedback.post("/postFeedback",postFeedback)
patient_feedback.put("/updateFeedback/:feedback_id",updateFeedback)
patient_feedback.delete("/deleteFeedback/:feedback_id",deleteFeedback)
export default patient_feedback;
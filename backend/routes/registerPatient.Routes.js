import express from "express";
import {
  registerPatient,
  getPatients,
  updatePatient,
  deletePatient
} from "../controllers/registerPatient.controllers.js";

const registerPatientRouter = express.Router();

registerPatientRouter.post("/registerPatient", registerPatient);
registerPatientRouter.get("/getPatients", getPatients);
registerPatientRouter.put("/updatePatient/:patient_id", updatePatient);
registerPatientRouter.delete("/deletePatient/:patient_id", deletePatient);

export default registerPatientRouter;
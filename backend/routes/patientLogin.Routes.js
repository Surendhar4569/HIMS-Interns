import express from "express";
import { patientLogin } from "../controllers/patientLogin.controller.js";

const patientLoginRouter = express.Router();

patientLoginRouter.post("/login", patientLogin);

export default patientLoginRouter;
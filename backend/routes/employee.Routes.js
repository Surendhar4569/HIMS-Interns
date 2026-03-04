import express from "express";
import {
  registerEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
} from "../controllers/employee.controllers.js";

const registerEmployeeRouter = express.Router();

registerEmployeeRouter.post("/registerEmployee", registerEmployee);
registerEmployeeRouter.get("/getEmployees", getEmployees);
registerEmployeeRouter.put("/updateEmployee/:employee_id", updateEmployee);
registerEmployeeRouter.delete("/deleteEmployee/:employee_id", deleteEmployee);

export default registerEmployeeRouter;
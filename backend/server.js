import express from "express";
import "dotenv/config.js";
import cors from "cors";

import patient_feedback from "./routes/feedback.Routes.js";
import patient_complaints from "./routes/complaints.Routes.js";
import patientRouter from "./routes/registerPatient.Routes.js";
import registerPatientRouter from "./routes/registerPatient.Routes.js";
import registerEmployeeRouter from "./routes/employee.Routes.js"; 
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 3000;
import express from "express"
import "dotenv/config.js"
import cors from "cors"
import patient_feedback from "./routes/feedback.Routes.js"
import patient_complaints from "./routes/complaints.Routes.js"
import requestRoutes from "./routes/request.routes.js"

import con from "./db.js"

const app=express()
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json())
app.use("/uploads", express.static("uploads"));


const PORT=process.env.PORT || 3000

app.use("/feedback", patient_feedback);
app.use("/complaints", patient_complaints);
app.use("/patient", registerPatientRouter);
app.use("/employee", registerEmployeeRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use("/feedback",patient_feedback)
app.use("/complaints",patient_complaints)
app.use("/request", requestRoutes)
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

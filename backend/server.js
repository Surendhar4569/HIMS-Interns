import express from "express";
import "dotenv/config";
import cors from "cors";

// Routes
import patient_feedback from "./routes/feedback.Routes.js";
import complaintRoutes from "./routes/complaints.Routes.js";
import requestRoutes from "./routes/request.routes.js";
import employeeRoutes from "./routes/employee.Routes.js"; 
import PatientRouter from "./routes/registerPatient.Routes.js";
import EmployeeRouter from "./routes/employee.Routes.js";
import EmployeeDashboardRouter from "./routes/employeeDashboard.Routes.js"
// import complaintAssginedRouter from "./routes/complaint_assigned.Routes.js"
// import complaintAssginedRouter from "./routes/complaint_assigned.Routes.js"
import EmployeeLoginRouter from "./routes/EmployeeLogin.Routes.js"
const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));


// ================= API ROUTES =================

app.use("/api/feedback", patient_feedback);
app.use("/api/complaint_list", complaintRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/feedback", patient_feedback);
app.use("/complaints", complaintRoutes);
app.use("/request", requestRoutes);
app.use("/patient",PatientRouter)
app.use("/employee",EmployeeRouter)
app.use("/",EmployeeLoginRouter)
app.use("/employee-dashboard",EmployeeDashboardRouter)
// app.use("/complaint-assigned", complaintAssginedRouter)
app.use("/employee-login", EmployeeLoginRouter)
app.use((req,res)=>{
  res.status(404).json({
    success:false,
    message:"API route not found"
  });
});
app.use((err,req,res,next)=>{
  console.error(err);

  res.status(500).json({
    success:false,
    message:"Internal Server Error"
  });
});
// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
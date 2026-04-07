import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet"; 
import morgan from "morgan"; 
// Routes
import patient_feedback from "./routes/feedback.Routes.js";
import complaintRoutes from "./routes/complaints.Routes.js";
import requestRoutes from "./routes/request.routes.js";
import employeeRoutes from "./routes/employee.Routes.js"; 
import PatientRouter from "./routes/registerPatient.Routes.js";
import EmployeeRouter from "./routes/employee.Routes.js";
import EmployeeDashboardRouter from "./routes/employeeDashboard.Routes.js"
import EmployeeLoginRouter from "./routes/EmployeeLogin.Routes.js"
import orthopedics from "./routes/orthopedics.Routes.js";
import patientLoginRouter from "./routes/patientLogin.Routes.js";
const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(helmet()); // Add security headers
app.use(morgan('dev')); 
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// Add headers to static files
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("uploads"));


// ================= API ROUTES =================
app.use("/patient-login", patientLoginRouter);
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
app.use("/employee-login", EmployeeLoginRouter)
app.use("/api/orthopedics",orthopedics)
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
})
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
import express from "express";
import "dotenv/config";
import cors from "cors";

// Routes
import patient_feedback from "./routes/feedback.Routes.js";
import complaintRoutes from "./routes/complaints.Routes.js";
import patient_complaints from "./routes/complaints.Routes.js";
import requestRoutes from "./routes/request.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// ================= API ROUTES =================
app.use("/api/feedback", patient_feedback);
app.use("/api/complaint_master", complaintRoutes);
app.use("/api/complaint_attachment", complaintRoutes);
app.use("/api/complaint_list", complaintRoutes);
app.use("/feedback", patient_feedback);
app.use("/complaints", patient_complaints);
app.use("/complaints", complaintRoutes);
app.use("/request", requestRoutes);

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
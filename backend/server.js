import express from "express";
import "dotenv/config.js";
import cors from "cors";

// Routes
import patient_feedback from "./routes/feedback.Routes.js";
import complaintRoutes from "./routes/complaint.Routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// To parse JSON bodies
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// PORT
const PORT = process.env.PORT || 3000;

// ================= API ROUTES =================
app.use("/api/feedback", patient_feedback);
app.use("/api/complaint_master", complaintRoutes);
app.use("/api/complaint_attachment", complaintRoutes);
app.use("/api/complaint_list", complaintRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
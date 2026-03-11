import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Dashboard pages
import Home from "./pages/home";
import Complaints from "./pages/complaints";
import ComplaintList from "./pages/complaint_list";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import Employee from "./pages/employee";
import EmployeeRequest from "./pages/EmployeeRequest";
import PatientRecords from "./pages/patientsRecords";
import RegisterPatient from "./pages/registerPatient";
import EmployeeRecords from "./pages/employee"
import EmployeeLogin from "./pages/employeeLogin";
import EmployeeDashboard from "./pages/employeeDashboard";

function App() {

  return (

    <Routes>

      {/* PUBLIC ROUTE */}
      <Route path="/login" element={<EmployeeLogin />} />

      {/* PROTECTED DASHBOARD ROUTES */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >

        <Route path="employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />

        <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Feedback */}
        <Route path="feedback" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
        <Route path="feedback-list" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />

        {/* Complaints */}
        <Route path="complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
        <Route path="complaint_list" element={<ProtectedRoute><ComplaintList /></ProtectedRoute>} />

        {/* Employees */}
        <Route path="employee-records" element={<ProtectedRoute><Employee /></ProtectedRoute>} />
        <Route path="employee-request" element={<ProtectedRoute><EmployeeRequest /></ProtectedRoute>} />

        {/* Patients */}
        <Route path="patient-records" element={<ProtectedRoute><PatientRecords /></ProtectedRoute>} />
        <Route path="patient-register" element={<ProtectedRoute><RegisterPatient /></ProtectedRoute>} />

      </Route>

      {/* 404 */}
      <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />

    </Routes>

  );
}

export default App;
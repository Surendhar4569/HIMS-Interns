import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Home from "./pages/home";

import Complaints from "./pages/complaints";
import ComplaintList from "./pages/complaint_list";
import PatientComplaints from "./pages/patient_complaints";

import RegisterPatient from "./pages/registerPatient";
import Employee from "./pages/employee";
import EmployeeRequest from "./pages/EmployeeRequest";

import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";

function App() {
  return (
    <Flex>
      <Sidebar />

      <Box flex="1" p={5}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Feedback */}
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/feedback-list" element={<FeedbackList />} />

          {/* Complaints */}
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaint_list" element={<ComplaintList />} />
          <Route path="/patient_complaints" element={<PatientComplaints />} />

          {/* Other Pages */}
          <Route path="/registerPatient" element={<RegisterPatient />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/request" element={<EmployeeRequest />} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
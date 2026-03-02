import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Home from "./pages/home";
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
          <Route path="/feedback" element={<FeedbackForm />} />  
          <Route path="/feedback-list" element={<FeedbackList />} />
          <Route path="/complaints" element={<PatientComplaints />} />
          <Route path="/registerPatient" element={<RegisterPatient />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/request" element={<EmployeeRequest />} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
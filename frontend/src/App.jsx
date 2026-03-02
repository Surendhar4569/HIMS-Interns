import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Home from "./pages/home";
import PatientFeedback from "./pages/patient_feedback";
import PatientComplaints from "./pages/patient_complaints";
import RegisterPatient from "./pages/registerPatient";
import Employee from "./pages/employee";
import EmployeeRequest from "./pages/EmployeeRequest";

function App() {
  return (
    <Flex>
      <Sidebar />

      <Box flex="1" p={5}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feedback" element={<PatientFeedback />} />
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
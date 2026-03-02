import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Home from "./pages/home";
import PatientFeedback from "./pages/patient_feedback";
import Complaints from "./pages/complaints"; 
import ComplaintList from "./pages/complaint_list";

function App() {
  return (
    <Flex>

      {/* Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <Box flex="1" p={5}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feedback" element={<PatientFeedback />} />

          <Route path="/complaints" element={<Complaints />} />
           <Route path="/complaint_list" element={<ComplaintList />} />

        </Routes>
      </Box>

    </Flex>
  );
}

export default App;
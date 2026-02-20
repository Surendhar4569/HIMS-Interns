import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Home from "./pages/home";
import PatientFeedback from "./pages/patient_feedback";

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
        </Routes>
      </Box>

    </Flex>
  );
}

export default App;
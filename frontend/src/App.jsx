import { Box, Flex } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar";

// Home
import Home from "./pages/home";

// Feedback
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";

// Complaints
import Complaints from "./pages/complaints";
import ComplaintList from "./pages/complaint_list";

// Employees
import EmployeeRecords from "./pages/employeeRecords";
import EmployeeRequest from "./pages/EmployeeRequest";

function App() {
  return (
    <Flex>
      <Sidebar />

      <Box flex="1" p={5} ml="260px">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Feedback */}
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/feedback-list" element={<FeedbackList />} />

          {/* Complaints */}
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaint_list" element={<ComplaintList />} />

          {/* Employees */}
          <Route path="/employee-records" element={<EmployeeRecords />} />
          <Route path="/employee-request" element={<EmployeeRequest />} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;
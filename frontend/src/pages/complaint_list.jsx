import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  SimpleGrid,
  useToast,
  Badge,
  Flex,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Image,
  RadioGroup,
  Radio,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Spinner,
  ModalFooter,
  Avatar,
  IconButton,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  Divider
} from "@chakra-ui/react";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";

import {
  DownloadIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  SearchIcon,
  Icon,
} from "@chakra-ui/icons";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { 
  FiStar 
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OTPVerificationModal from "./OTPVerificationModal";

export default function ComplaintList() {
  const toast = useToast();

// eslint-disable-next-line no-unused-vars
  const [activeTab, setActiveTab] = useState("before");
  const navigate=useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure();
// eslint-disable-next-line no-unused-vars
  const [previewFile, setPreviewFile] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [originalEmployeeId, setOriginalEmployeeId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDeptFilter, setAssignDeptFilter] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [currentAssignment, setCurrentAssignment] = useState(null);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [raisedByType, setRaisedByType] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [deptOptions, setDeptOptions] = useState([]);
// eslint-disable-next-line no-unused-vars
  const [assignedInfo, setAssignedInfo] = useState(null);
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const pageSize = 10;

   const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [complaintToClose, setComplaintToClose] = useState(null);

  const [feedbackRefreshTrigger, setFeedbackRefreshTrigger] = useState(0);
// Function to handle OTP closure from modal
const handleOTPClosure = (complaint) => {
  setComplaintToClose(complaint);
  setIsOTPModalOpen(true);
};
  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const token=localStorage.getItem("token")
      const res = await fetch(
        "http://localhost:3000/api/complaint_list/getComplaintList",{
          headers:{
          "Authorization": `Bearer ${token}`
  }}
      );
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const data = await res.json();

      if (data.success) {
        setComplaints(data.data || []);
        setFiltered(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to fetch complaints",
        status: "error",
        duration: 2000,
      });
    }
  };

  const fetchEmployeesData = async () => {
    try {
      const token=localStorage.getItem("token")
      const res = await fetch(
        "http://localhost:3000/api/employee/getEmployees",{
          headers:{
          "Authorization": `Bearer ${token}`
  }
        }
      );
      if (res.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const data = await res.json();
      if (data.success) {
        setAllEmployees(data.data || []);
        const unique = [
          ...new Set(data.data.map((e) => e.department).filter(Boolean)),
        ];
        setDeptOptions(unique);
      }
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchEmployeesData();
  }, []);

  useEffect(() => {
    if (!isAssignOpen) return;

    const term = searchTerm.trim().toLowerCase();

    const results = allEmployees.filter((emp) => {
      // 1. Match Department
      const matchesDept = assignDeptFilter
        ? emp.department === assignDeptFilter
        : true;

      // 2. Match Search Term (if empty, matches everything)
      const matchesTerm =
        !term ||
        emp.employee_name?.toLowerCase().includes(term) ||
        emp.employee_id?.toString().includes(term);

      return matchesDept && matchesTerm;
    });

    setSearchResults(results.slice(0, 15));

    // Logic Fix: If we are in "Update" mode and results are found,
    // they will now show because we removed the !selectedEmployeeId check above.
  }, [searchTerm, assignDeptFilter, isAssignOpen, allEmployees]);

  useEffect(() => {
    let temp = [...complaints];
    if (search) {
      temp = temp.filter(
        (c) =>
          c.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
          c.raised_by_name?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (status) temp = temp.filter((c) => c.status === status);
    if (priority) temp = temp.filter((c) => c.priority === priority);
    if (raisedByType)
      temp = temp.filter((c) => c.raised_by_type === raisedByType);
    if (deptFilter) temp = temp.filter((c) => c.department === deptFilter);
    setFiltered(temp);
    setPage(1);
  }, [search, status, priority, raisedByType, deptFilter, complaints]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setRaisedByType("");
    setDeptFilter("");
    setPage(1);
  };



  const openAttachmentModal = (complaint) => {
  setSelectedComplaint(complaint);
  onOpen();
};


  const downloadAttachment = async (url) => {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const filename = url.split("/").pop() || "download";
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    toast({
      title: "Download failed",
      description: err.message,
      status: "error",
      duration: 2000,
    });
  }
};
//   const handleAssignClick = async (complaint) => {
//     setSelectedComplaint(complaint);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(
//         `http://localhost:3000/complaints/get-complaint-assigned/${complaint.complaint_id}`,{
//           headers:{
//           "Authorization": `Bearer ${token}`
//   }
// }
//       );
//       if (res.status === 401) {

//   localStorage.removeItem("token");
//   localStorage.removeItem("employee_id");
//   localStorage.removeItem("employee_name");

//   navigate("/login");
//   return;
// }


//       const data = await res.json();

//       if (res.ok && data.success && data.data.length > 0) {
//         const assignment = data.data.find(
//           (a) => a.complaint_id === complaint.complaint_id,
//         );

//         setSelectedEmployeeId(
//           assignment?.assigned_employee_id
//             ? assignment.assigned_employee_id.toString()
//             : null,
//         );
//         //setOriginalEmployeeId(assignment.assigned_employee_id.toString());
//         setOriginalEmployeeId(
//           assignment?.assigned_employee_id
//             ? assignment.assigned_employee_id.toString()
//             : null,
//         );
//         // IMPORTANT: store assignment_id
//         setCurrentAssignment(assignment);

//         setSelectedComplaint((prev) => ({
//           ...prev,
//           assignment_id: assignment.assignment_id,
//         }));
//       } else {
//         setSelectedEmployeeId(null);
//         setOriginalEmployeeId(null);
//         setCurrentAssignment(null);

//         setSelectedComplaint((prev) => ({
//           ...prev,
//           assignment_id: null,
//         }));
//       }
//     } catch (err) {
//       console.error("Failed to fetch assignment:", err);

//       setSelectedEmployeeId(null);
//       setOriginalEmployeeId(null);
//       setCurrentAssignment(null);
//     }

//     setAssignDeptFilter(complaint.department || "");
//     setSearchTerm("");
//     setSearchResults([]);
//     setSelectedEmployeeData(null);

//     onAssignOpen();
//   };
const handleAssignClick = async (complaint) => {
  setSelectedComplaint(complaint);

  // Show warning if complaint is closed
  if (complaint.status === "CLOSED") {
    toast({
      title: "Reopening Complaint",
      description: "This complaint is closed. It will be reopened and assigned to a new employee.",
      status: "warning",
      duration: 5000,
      isClosable: true,
    });
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/complaints/get-complaint-assigned/${complaint.complaint_id}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("employee_id");
      localStorage.removeItem("employee_name");
      navigate("/login");
      return;
    }

    const data = await res.json();

    if (res.ok && data.success && data.data.length > 0) {
      const assignment = data.data.find(
        (a) => a.complaint_id === complaint.complaint_id,
      );

      setSelectedEmployeeId(
        assignment?.assigned_employee_id
          ? assignment.assigned_employee_id.toString()
          : null,
      );
      setOriginalEmployeeId(
        assignment?.assigned_employee_id
          ? assignment.assigned_employee_id.toString()
          : null,
      );
      setCurrentAssignment(assignment);

      setSelectedComplaint((prev) => ({
        ...prev,
        assignment_id: assignment.assignment_id,
      }));
    } else {
      setSelectedEmployeeId(null);
      setOriginalEmployeeId(null);
      setCurrentAssignment(null);

      setSelectedComplaint((prev) => ({
        ...prev,
        assignment_id: null,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch assignment:", err);
    setSelectedEmployeeId(null);
    setOriginalEmployeeId(null);
    setCurrentAssignment(null);
  }

  setAssignDeptFilter(complaint.department || "");
  setSearchTerm("");
  setSearchResults([]);
  setSelectedEmployeeData(null);

  onAssignOpen();
};  
const handleUpdate = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "No Employee Selected",
        description: "Please search and select an employee to assign.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsAssigning(true);

    try {
      const isUpdate = selectedComplaint?.assignment_id ? true : false;

      const url = isUpdate
        ? `http://localhost:3000/complaints/update-complaint-assigned/${selectedComplaint.assignment_id}`
        : "http://localhost:3000/complaints/post-complaint-assigned";

      const method = isUpdate ? "PUT" : "POST";
       const changed_by_id = parseInt(localStorage.getItem("employee_id"), 10);


      const bodyData = isUpdate
        ? {
            assigned_employee_id: parseInt(selectedEmployeeId, 10),
            changed_by: changed_by_id,
          }
        : {
            complaint_id: selectedComplaint.complaint_id,
            assigned_employee_id: parseInt(selectedEmployeeId, 10),
            changed_by: changed_by_id,
          };
       const token=localStorage.getItem("token")
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
         
          "Authorization": `Bearer ${token}`
  }
        ,
        body: JSON.stringify(bodyData),
      });

      
      if (response.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}
      const result = await response.json();

      if (result.success) {
        toast({
          title: isUpdate ? "Assignment Updated" : "Complaint Assigned",
          status: "success",
          duration: 2000,
        });

        onAssignClose();
        fetchComplaints(); // refresh table
         localStorage.setItem('complaint_updated', JSON.stringify({
      complaint_id: selectedComplaint.complaint_id,
      timestamp: Date.now(),
      reopened: result.data?.reopened || false,
      feedback_cleared: result.data?.feedback_cleared || false
    }));
         if (window.refreshPatientDashboard) {
        window.refreshPatientDashboard();
      }
      
      // Also dispatch a storage event for cross-tab communication
      localStorage.setItem('complaint_updated', Date.now().toString());
      localStorage.removeItem('complaint_updated');
      }
    } catch (error) {
      console.error("Update Error:", error);

      toast({
        title: "Operation Failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (assignment_id) => {
    if (!assignment_id) {
      toast({
        title: "Assignment ID missing",
        status: "error",
        duration: 2000,
      });
      return;
    }

    try {
       const token=localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:3000/complaints/delete-complaint-assigned/${assignment_id}`,
        {
          method: "DELETE",
          headers:{
          "Authorization": `Bearer ${token}`
  }
        },
      );
      if (response.status === 401) {

  localStorage.removeItem("token");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("employee_name");

  navigate("/login");
  return;
}

      const data = await response.json();

      if (data.success) {
        await fetchComplaints(); // refresh list first

        onAssignClose(); // then close modal
        // Force refresh patient dashboard
      if (window.refreshPatientDashboard) {
        window.refreshPatientDashboard();
      }
        // Dispatch storage event for cross-tab communication
      localStorage.setItem('complaint_updated', Date.now().toString());
      localStorage.removeItem('complaint_updated');
        toast({
          title: "Complaint Unassigned",
          status: "success",
          duration: 2000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Unassign error:", error);

      toast({
        title: "Unassign failed",
        description: error.message,
        status: "error",
        duration: 2000,
      });
    }
  };

  const openCount = complaints.filter(
    (c) => c.status?.toUpperCase() === "OPEN",
  ).length;
  const progressCount = complaints.filter(
    (c) => c.status?.toUpperCase() === "IN_PROGRESS",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status?.toUpperCase() === "RESOLVED",
  ).length;
  const totalCount = complaints.length || 1;

  // Helper to get display data for selected employee
  const displayEmployee =
    selectedEmployeeData ||
    allEmployees.find((e) => e.employee_id.toString() === selectedEmployeeId);

  return (
    <Box bg="gray.50" minH="100vh">
      <Box p={6}>
        {/* Header */}
        <Box mb={6} textAlign="center">
          <VStack spacing={1}>
            <Text
              fontSize="3xl"
              fontWeight="extrabold"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Complaint List
            </Text>
            <Text fontSize="md" color="gray.500">
              View and manage all registered complaints
            </Text>
          </VStack>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <StatCard
            title="Open"
            value={openCount}
            color="blue.400"
            total={totalCount}
          />
          <StatCard
            title="In Progress"
            value={progressCount}
            color="yellow.400"
            total={totalCount}
          />
          <StatCard
            title="Resolved"
            value={resolvedCount}
            color="green.400"
            total={totalCount}
          />
        </SimpleGrid>

        {/* Filters */}
        <Box bg="white" p={4} borderRadius="xl" boxShadow="sm" mb={3}>
          <HStack spacing={3} wrap="wrap">
            <Input
              placeholder="Search ticket or name..."
              size="sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              w="220px"
              borderRadius="md"
              boxShadow="sm"
              focusBorderColor="blue.400"
            />
            <Select
              size="sm"
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              w="150px"
              borderRadius="md"
              boxShadow="sm"
              focusBorderColor="blue.400"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </Select>
            <Select
              size="sm"
              placeholder="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              w="150px"
              borderRadius="md"
              boxShadow="sm"
              focusBorderColor="blue.400"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </Select>
            <Select
              size="sm"
              placeholder="Raised by"
              value={raisedByType}
              onChange={(e) => setRaisedByType(e.target.value)}
              w="150px"
              borderRadius="md"
              boxShadow="sm"
              focusBorderColor="blue.400"
            >
              <option value="PATIENT">PATIENT</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
            </Select>
            <Select
              size="sm"
              placeholder="Department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              w="150px"
              borderRadius="md"
              boxShadow="sm"
              focusBorderColor="blue.400"
            >
              {deptOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              leftIcon={<RepeatIcon />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </HStack>
        </Box>

        {/* View Switch */}
        <Flex justify="center" mb={5}>
          <HStack spacing={4}>
            <Button
              size="sm"
              colorScheme={view === "list" ? "blue" : "gray"}
              variant={view === "list" ? "solid" : "outline"}
              onClick={() => setView("list")}
            >
              List View
            </Button>
            <Button
              size="sm"
              colorScheme={view === "card" ? "blue" : "gray"}
              variant={view === "card" ? "solid" : "outline"}
              onClick={() => setView("card")}
            >
              Card View
            </Button>
          </HStack>
        </Flex>

        {/* Animated List/Card */}
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Box
                bg="white"
                borderRadius="xl"
                boxShadow="sm"
                overflow="hidden"
              >
                <Grid
                  templateColumns="0.5fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr"
                  columnGap={4}
                  p={3}
                  fontWeight="bold"
                  bg="gray.100"
                >
                  <Text>S.No</Text>
                  <Text>Ticket</Text>
                  <Text>Name</Text>
                  <Text>Type</Text>
                  <Text>Dept</Text>
                  <Text>Priority</Text>
                  <Text>Status</Text>
                  <Text>Attachment</Text>
                  <Text>Assign</Text>
                </Grid>

                {paginatedData.map((c, idx) => (
                  <Grid
                    key={c.complaint_id}
                    templateColumns="0.5fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr"
                    columnGap={3}
                    p={2}
                    bg={idx % 2 === 0 ? "white" : "gray.50"}
                    alignItems="center"
                    _hover={{ bg: "gray.100" }}
                    transition="0.2s"
                  >
                    <Text>{(page - 1) * pageSize + idx + 1}</Text>
                    <Text fontWeight="medium">{c.ticket_number}</Text>
                    <Text>{c.raised_by_name}</Text>
                    <Text>{c.raised_by_type}</Text>
                    <Text>{c.department}</Text>
                    <Text>{c.priority}</Text>
                    <Badge
                      colorScheme={getStatusColor(c.status)}
                      variant="subtle"
                      borderRadius="full"
                      px={2}
                      py={1}
                      maxW="80px"
                      overflow="hidden"
                      textAlign="center"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {c.status}
                    </Badge>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      onClick={() => openAttachmentModal(c)}
                      isDisabled={!c.attachments || c.attachments.length === 0}
                    >
                      View
                    </Button>
                    <Button
                      size="xs"
                      colorScheme={c.assignment_id ? "orange" : "blue"}
                      onClick={() => handleAssignClick(c)}
                    >
                      {c.assignment_id ? "Update Assign" : "Assign"}
                    </Button>
                  </Grid>
                ))}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {paginatedData.map((c) => {
                  const priorityStyles = {
                    LOW: { bg: "green.100", color: "green.700" },
                    MEDIUM: { bg: "yellow.100", color: "yellow.800" },
                    HIGH: { bg: "red.100", color: "red.700" },
                  };
                  const priority = priorityStyles[c.priority] || {
                    bg: "gray.100",
                    color: "gray.700",
                  };
                  return (
                    <Box
                      key={c.complaint_id}
                      bg="white"
                      p={5}
                      borderRadius="xl"
                      boxShadow="sm"
                      border="1px solid"
                      borderColor="gray.100"
                      _hover={{
                        transform: "translateY(-3px)",
                        boxShadow: "md",
                      }}
                      transition="0.2s"
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        top="10px"
                        right="10px"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="600"
                        bg={priority.bg}
                        color={priority.color}
                      >
                        {c.priority}
                      </Box>

                      <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" fontSize="md">
                          {c.ticket_number}
                        </Text>

                        <Text fontSize="sm" color="gray.600">
                          <strong>NAME:</strong> {c.raised_by_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>TYPE:</strong> {c.raised_by_type}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>DEPARTMENT:</strong> {c.department}
                        </Text>

                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          color="gray.700"
                          mt={2}
                        >
                          Complaint Description :
                        </Text>
                        <Box p={3} borderRadius="md" w="100%" bg="gray.50">
                          <Text fontSize="sm" color="gray.700" noOfLines={3}>
                            {c.complaint_description ||
                              "No description provided."}
                          </Text>
                        </Box>

                        <Badge
                          colorScheme={getStatusColor(c.status)}
                          variant="subtle"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {c.status}
                        </Badge>

                        <Button
                          size="sm"
                          colorScheme="blue"
                          w="100%"
                          mt={2}
                          onClick={() => openAttachmentModal(c)}
                          isDisabled={!c.attachments || c.attachments.length === 0}
                        >
                          View Attachment
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          w="100%"
                          mt={2}
                          onClick={() => handleAssignClick(c)}
                        >
                          Assign To
                        </Button>
                      </VStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        <Flex mt={6} justify="center" align="center" gap={2} wrap="wrap">
          <Button
            size="sm"
            onClick={() => setPage(page - 1)}
            isDisabled={page === 1}
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              size="sm"
              colorScheme={page === i + 1 ? "blue" : "gray"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            size="sm"
            onClick={() => setPage(page + 1)}
            isDisabled={page === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </Flex>
      </Box>


       {/* Attachment Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Complaint Details & Images</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs onChange={(index) => setActiveTab(index === 0 ? "before" : "after")}>
                <TabList>
                  <Tab>Before ({selectedComplaint?.before_images?.length || 0})</Tab>
                  <Tab>After ({selectedComplaint?.after_images?.length || 0})</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    {selectedComplaint?.before_images?.length > 0 ? (
                      selectedComplaint.before_images.map((img, idx) => (
                        <Box key={idx} mb={4}>
                          <Image 
                            src={img.file_name} 
                            alt={`Before ${idx + 1}`} 
                            maxH="400px" 
                            mx="auto"
                            fallbackSrc="https://via.placeholder.com/400x300?text=Loading..."
                          />
                          <HStack justify="center" mt={2}>
                            <Button 
                              size="sm" 
                              colorScheme="blue" 
                              onClick={() => window.open(img.file_name, '_blank')}
                            >
                              View Full Size
                            </Button>
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              leftIcon={<DownloadIcon />}
                              onClick={() => downloadAttachment(img.file_name)}
                            >
                              Download
                            </Button>
                          </HStack>
                        </Box>
                      ))
                    ) : (
                      <Text textAlign="center" py={10} color="gray.500">
                        No before images available
                      </Text>
                    )}
                  </TabPanel>
                  
                  <TabPanel>
                    {selectedComplaint?.after_images?.length > 0 ? (
                      selectedComplaint.after_images.map((img, idx) => (
                        <Box key={idx} mb={4}>
                          <Image 
                            src={img.file_name} 
                            alt={`After ${idx + 1}`} 
                            maxH="400px" 
                            mx="auto"
                            fallbackSrc="https://via.placeholder.com/400x300?text=Loading..."
                          />
                          <HStack justify="center" mt={2}>
                            <Button 
                              size="sm" 
                              colorScheme="blue" 
                              onClick={() => window.open(img.file_name, '_blank')}
                            >
                              View Full Size
                            </Button>
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              leftIcon={<DownloadIcon />}
                              onClick={() => downloadAttachment(img.file_name)}
                            >
                              Download
                            </Button>
                          </HStack>
                        </Box>
                      ))
                    ) : (
                      <Text textAlign="center" py={10} color="gray.500">
                        No after images available
                      </Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {/* Add Divider and Complaint Info Section */}
              <Divider my={4} />
              
              <Box>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Ticket Number</Text>
                    <Text fontWeight="bold">{selectedComplaint?.ticket_number}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Status</Text>
                    <Badge 
                      colorScheme={
                        selectedComplaint?.status === "RESOLVED" ? "green" :
                        selectedComplaint?.status === "CLOSED" ? "gray" : "blue"
                      }
                      fontSize="sm"
                      px={2}
                      py={1}
                    >
                      {selectedComplaint?.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Priority</Text>
                    <Badge 
                      colorScheme={
                        selectedComplaint?.priority === "HIGH" ? "red" :
                        selectedComplaint?.priority === "MEDIUM" ? "orange" : "green"
                      }
                      fontSize="sm"
                      px={2}
                      py={1}
                    >
                      {selectedComplaint?.priority}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Department</Text>
                    <Text>{selectedComplaint?.department}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Raised By Name</Text>
                    <Text fontWeight="medium">{selectedComplaint?.raised_by_name || "N/A"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Raised By Type</Text>
                    <Badge 
                      colorScheme={
                        selectedComplaint?.raised_by_type === "EMPLOYEE" ? "purple" : "orange"
                      }
                      fontSize="xs"
                      px={2}
                      py={1}
                    >
                      {selectedComplaint?.raised_by_type || "N/A"}
                    </Badge>
                  </Box>

                  {/* Added Mobile Number (if available) */}
                  {selectedComplaint?.raised_by_mobile && (
                    <Box>
                      <Text fontSize="xs" color="gray.500">Mobile Number</Text>
                      <Text fontWeight="medium">
                        {selectedComplaint?.raised_by_mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                      </Text>
                    </Box>
                  )}

                  {/* Added Assigned Employee Info (if assigned) */}
                  {selectedComplaint?.employee_name && (
                    <Box>
                      <Text fontSize="xs" color="gray.500">Assigned To</Text>
                      <Text fontWeight="medium">{selectedComplaint?.employee_name}({selectedComplaint?.assigned_employee_id || "N/A"})</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Feedback Section - Show for CLOSED complaints */}
                {selectedComplaint?.status === "CLOSED" && (
                  <Box mt={4}>
                    <Divider my={4} />
                    <Text fontWeight="bold" mb={3}>Feedback Information</Text>
                    
                    {/* Fetch and display feedback */}
                    <FeedbackDisplay   key={selectedComplaint?.complaint_id + (selectedComplaint?.updated_at || Date.now())}
                    complaintId={selectedComplaint?.complaint_id}
                    refreshTrigger={feedbackRefreshTrigger} />
                  </Box>
                )}

                {/* Close Complaint Button - Only show for RESOLVED complaints */}
                {selectedComplaint?.status === "RESOLVED" && (
                  <Box mt={4}>
                    <Alert status="info" borderRadius="md" mb={3}>
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        This complaint has been resolved and is ready for closure.
                        Click the button below to close it with OTP verification.
                      </AlertDescription>
                    </Alert>
                    <Button
                      colorScheme="green"
                      size="md"
                      width="full"
                      onClick={() => handleOTPClosure(selectedComplaint)}
                    >
                      Close Complaint (OTP Required)
                    </Button>
                  </Box>
                )}

                {/* Show message for already closed complaints */}
                {selectedComplaint?.status === "CLOSED" && (
                  <Box mt={4}>
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        This complaint is closed.
                      </AlertDescription>
                    </Alert>
                  </Box>
                )}
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

{/* OTP Verification Modal - Add this after the Attachment Modal */}
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={() => {
            setIsOTPModalOpen(false);
            setComplaintToClose(null);
          }}
          complaint={complaintToClose}
          onSuccess={() => {
            // Refresh the complaint list
            fetchComplaints();
                // Trigger feedback refresh
    setFeedbackRefreshTrigger(prev => prev + 1);

            // Close the attachment modal
            onClose();
            toast({
              title: "Complaint Closed",
              description: "The complaint has been successfully closed",
              status: "success",
              duration: 3000,
            });
          }}
        />
      {/* Assign Employee Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedComplaint?.status === "CLOSED" && (
                <Alert status="warning" mb={4} borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>This complaint is closed</AlertTitle>
                    <AlertDescription fontSize="sm">
                      Reopening this complaint will set its status back to ASSIGNED.
                      The previous closure will be recorded in the history.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedComplaint && (
              <VStack align="stretch" spacing={6}>
                {/* Ticket Details */}
                <Box
                  bg="blue.50"
                  p={4}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="blue.400"
                >
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        Ticket Number
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">
                        {selectedComplaint.ticket_number}
                      </Text>
                    </Box>
                    <Box>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        Raised By
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedComplaint.raised_by_name}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Filters */}
                <HStack>
                  <Text fontWeight="medium" whiteSpace="nowrap" fontSize="sm">
                    Department:
                  </Text>
                  <Select
                    placeholder="All Departments"
                    value={assignDeptFilter}
                    onChange={(e) => setAssignDeptFilter(e.target.value)}
                    maxW="300px"
                  >
                    {deptOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </HStack>

                {/* Search Input */}
                <Box position="relative">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      {isSearchingEmployees ? (
                        <Spinner size="xs" />
                      ) : (
                        <SearchIcon color="gray.300" />
                      )}
                    </InputLeftElement>
                    <Input
                      placeholder="Search employee by name or ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedEmployeeId) {
                          setSelectedEmployeeId(null);
                          setSelectedEmployeeData(null);
                        }
                      }}
                      focusBorderColor="purple.400"
                    />
                  </InputGroup>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <List
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg="white"
                      boxShadow="dark-lg"
                      borderRadius="md"
                      zIndex={1500}
                      maxH="200px"
                      overflowY="auto"
                      border="1px solid"
                      borderColor="gray.100"
                      mt={1}
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map((emp) => (
                          <ListItem
                            key={emp.employee_id}
                            p={3}
                            _hover={{ bg: "purple.50", cursor: "pointer" }}
                            onClick={() => {
                              setSelectedEmployeeId(emp.employee_id.toString());
                              setSelectedEmployeeData(emp);
                              setSearchTerm("");
                              setSearchResults([]);
                            }}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                          >
                            <HStack spacing={3}>
                              <Avatar size="sm" name={emp.employee_name} />
                              <Box>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="gray.700"
                                >
                                  {emp.employee_name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {emp.department} • {emp.designation} • ID:{" "}
                                  {emp.employee_id}
                                </Text>
                              </Box>
                            </HStack>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem p={4} textAlign="center">
                          <Text fontSize="sm" color="gray.500">
                            No employees found.
                          </Text>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Box>

                {/* Selected Employee Card */}
                {selectedEmployeeId && (
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="purple.50"
                    borderColor="purple.200"
                  >
                    <HStack justify="space-between">
                      <HStack spacing={4}>
                        <Avatar
                          size="md"
                          name={displayEmployee?.employee_name || "Employee"}
                          bg="purple.500"
                        />
                        <Box>
                          <Text fontWeight="bold" color="purple.800">
                            {displayEmployee?.employee_name ||
                              `Employee ID: ${selectedEmployeeId}`}
                          </Text>
                          <Text fontSize="sm" color="purple.600">
                            {displayEmployee
                              ? `${displayEmployee.department} - ${displayEmployee.designation}`
                              : "Selected for assignment"}
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => {
                          setSelectedEmployeeId(null);
                          setSelectedEmployeeData(null);
                        }}
                      >
                        Remove
                      </Button>
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bg="gray.50" borderBottomRadius="md">
            <Flex w="full" justify="space-between">
              {selectedComplaint?.assignment_id && (
                <Button
                  colorScheme="red"
                  onClick={() =>
                    handleUnassign(selectedComplaint.assignment_id)
                  }
                >
                  Unassign
                </Button>
              )}
              <HStack spacing={3}>
                <Button variant="outline" onClick={onAssignClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleUpdate}
                  isLoading={isAssigning}
                >
                  {selectedComplaint?.assignment_id ? "Update" : "Assign"}
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

const FeedbackDisplay = ({ complaintId, refreshTrigger }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!complaintId) return;
      
      try {
        setLoading(true);
        setFeedback(null);
        setError(null);
        
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:3000/complaints/get-feedback/${complaintId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("employee_id");
          localStorage.removeItem("employee_name");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        
        // FIX: Check for data.data.feedback (new API structure)
        if (data.success && data.data && data.data.feedback) {
          setFeedback(data.data.feedback);
        } else {
          setFeedback(null);
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [complaintId, refreshTrigger]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Date not available";
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Flex justify="center" py={4}>
        <Spinner size="sm" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertDescription fontSize="sm">{error}</AlertDescription>
      </Alert>
    );
  }

  if (feedback) {
    return (
      <Box bg="gray.50" p={4} borderRadius="md">
        <VStack align="stretch" spacing={3}>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold">Satisfaction Rating</Text>
            <HStack spacing={1}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  as={FiStar}
                  w={5}
                  h={5}
                  color={star <= feedback.satisfaction_rating ? "yellow.400" : "gray.300"}
                  fill={star <= feedback.satisfaction_rating ? "yellow.400" : "none"}
                />
              ))}
            </HStack>
          </Flex>
          
          {feedback.comment && (
            <Box>
              <Text fontWeight="bold" mb={1}>Comment</Text>
              <Text fontSize="sm">{feedback.comment}</Text>
            </Box>
          )}
          
          <Flex justify="space-between" align="center" pt={2}>
            <Text fontSize="xs" color="gray.500">
              Submitted on: {formatDate(feedback.submitted_at)}
            </Text>
          </Flex>
        </VStack>
      </Box>
    );
  }

  return (
    <Alert status="info" borderRadius="md">
      <AlertIcon />
      <AlertDescription fontSize="sm">
        No feedback submitted yet for this complaint.
      </AlertDescription>
    </Alert>
  );
};
// Stat Card
function StatCard({ title, value, color, total }) {
  const percentage = Math.round((value / total) * 100);
  return (
    <Box
      bg="white"
      p={5}
      borderRadius="xl"
      boxShadow="sm"
      borderTop="4px solid"
      borderColor={color}
    >
      <Text fontSize="sm" color="gray.500">
        {title}
      </Text>
      <Text fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
      <Progress
        mt={2}
        value={percentage}
        size="sm"
        colorScheme={color.split(".")[0]}
        borderRadius="md"
      />
    </Box>
  );
}

// Status color helper
function getStatusColor(status) {
  const normalizedStatus = status ? status.toUpperCase() : "";
  switch (normalizedStatus) {
    case "OPEN":
      return "blue";
    case "ASSIGNED":
      return "purple";
    case "IN_PROGRESS":
      return "orange";
    case "RESOLVED":
      return "green";
    case "CLOSED":
      return "gray";
    default:
      return "gray";
  }
}

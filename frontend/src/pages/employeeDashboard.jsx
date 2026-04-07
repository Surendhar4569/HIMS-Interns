import { useEffect, useState,useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  HStack,
  VStack,
  Avatar,
  useToast,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Progress,
  InputRightElement,
  FormControl,
  FormLabel,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle
} from "@chakra-ui/react";
import {
  FiLogOut,
  FiLayers,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiUpload,
  FiFileText,
  FiRefreshCw,
  FiMoreVertical,
  FiEye,
  FiUser,
  FiStar,
  FiMessageSquare,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import OTPVerificationModal from "./OTPVerificationModal";
import EmployeeFeedbackModal from "./EmployeeFeedbackModal";

function EmployeeDashboard() {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [raisedComplaints, setRaisedComplaints] = useState([]);
  const [filteredAssigned, setFilteredAssigned] = useState([]);
  const [filteredRaised, setFilteredRaised] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loadingId, setLoadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // State for OTP modal
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [complaintToClose, setComplaintToClose] = useState(null);
  
  // State for Feedback modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] = useState(null);
  const [isViewFeedbackModalOpen, setIsViewFeedbackModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackCache, setFeedbackCache] = useState({});
    const [feedbackRefreshTrigger, setFeedbackRefreshTrigger] = useState(0);
const prevRaisedComplaintsRef = useRef([]);
  const employeeId = localStorage.getItem("employee_id");
  const employeeName = localStorage.getItem("employee_name");

  useEffect(() => {
    if (!employeeId) {
      navigate("/");
      return;
    }
    fetchAssignedComplaints();
    fetchRaisedComplaints();
  }, [employeeId, navigate]);
// Clear feedback cache for a specific complaint
const clearFeedbackCache = (complaintId) => {
  setFeedbackCache(prev => {
    const newCache = { ...prev };
    delete newCache[complaintId];
    return newCache;
  });
};

useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'complaint_updated') {
      try {
        const data = JSON.parse(e.newValue);
        if (data && data.complaint_id) {
           clearFeedbackCache(data.complaint_id);
           fetchAssignedComplaints();
          fetchRaisedComplaints();
            setFeedbackRefreshTrigger(prev => prev + 1);
        }
      } catch (error) {
        console.log("Storage event error:", error);
        fetchAssignedComplaints();
        fetchRaisedComplaints();
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  window.refreshEmployeeDashboard = () => {
    fetchAssignedComplaints();
    fetchRaisedComplaints();
  };
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    delete window.refreshEmployeeDashboard;
  };
}, []);

  // Fetch assigned complaints
  const fetchAssignedComplaints = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/employee-dashboard/complaints/${employeeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("employee_id");
          localStorage.removeItem("employee_name");
          navigate("/login");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          const sorted = [...data.data].sort((a, b) => b.complaint_id - a.complaint_id);
          setAssignedComplaints(sorted);
          setFilteredAssigned(sorted);
        }
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        toast({
          title: "Connection Error",
          status: "error",
          position: "top-right",
        });
      });
  };

  // Fetch complaints raised by the employee


// Fetch complaints raised by the employee
const fetchRaisedComplaints = () => {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:3000/complaints/getComplaintsByRaisedByName/${employeeName}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("employee_id");
        localStorage.removeItem("employee_name");
        navigate("/login");
        return;
      }
      return res.json();
    })
    .then(async (data) => {
      if (data && data.success) {
        const sorted = [...data.data].sort((a, b) => b.complaint_id - a.complaint_id);
        
        // Check for reopened complaints (were CLOSED, now NOT CLOSED)
        const previousComplaints = prevRaisedComplaintsRef.current;
        const reopenedComplaintIds = previousComplaints
          .filter(prev => prev.status === "CLOSED")
          .filter(prev => {
            const current = sorted.find(c => c.complaint_id === prev.complaint_id);
            return current && current.status !== "CLOSED";
          })
          .map(prev => prev.complaint_id);
        
        // Clear cache for reopened complaints
        if (reopenedComplaintIds.length > 0) {
          setFeedbackCache(prev => {
            const newCache = { ...prev };
            reopenedComplaintIds.forEach(id => {
              clearFeedbackCache(id);
            });
            return newCache;
          });
        }
        
        // Update ref with current complaints
        prevRaisedComplaintsRef.current = sorted;
        
        setRaisedComplaints(sorted);
        setFilteredRaised(sorted);
        
        // Fetch feedback for closed complaints
        await fetchFeedbackForClosedComplaints(sorted);
      }
    })
    .catch((err) => {
      console.error("Fetch Error:", err);
      toast({
        title: "Connection Error",
        status: "error",
        position: "top-right",
      });
    });
};
  // Fetch feedback for closed complaints
// Fetch feedback for closed complaints with enhanced data structure
const fetchFeedbackForClosedComplaints = async (complaintsList) => {
  const closedComplaints = complaintsList.filter(c => c.status === "CLOSED");
  const token = localStorage.getItem("token");
  
  const feedbackPromises = closedComplaints.map(async (complaint) => {
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/get-feedback/${complaint.complaint_id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          // data.data now contains { feedback, complaint_closed_at, complaint_status }
          return { 
            complaint_id: complaint.complaint_id, 
            feedbackData: data.data
          };
        }
      }
      return { complaint_id: complaint.complaint_id, feedbackData: null };
    } catch (error) {
      console.log("error", error);
      return { complaint_id: complaint.complaint_id, feedbackData: null };
    }
  });

  const results = await Promise.all(feedbackPromises);
  const newCache = {};
  
  results.forEach(({ complaint_id, feedbackData }) => {
    if (feedbackData && feedbackData.feedback) {
      // Store feedback with metadata for date comparison
      newCache[complaint_id] = {
        feedback: feedbackData.feedback,
        submitted_at: feedbackData.feedback.submitted_at,
        complaint_closed_at: feedbackData.complaint_closed_at
      };
    } else {
      newCache[complaint_id] = null;
    }
  });
  
  setFeedbackCache(newCache);
};

  // Apply filters based on active tab
  useEffect(() => {
    if (activeTab === 0) {
      let filtered = [...assignedComplaints];
      if (searchTerm.trim()) {
        filtered = filtered.filter(
          (c) =>
            c.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.complaint_description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterStatus) {
        filtered = filtered.filter((c) => c.status === filterStatus);
      }
      if (filterPriority) {
        filtered = filtered.filter((c) => c.priority === filterPriority);
      }
      setFilteredAssigned(filtered);
    } else {
      let filtered = [...raisedComplaints];
      if (searchTerm.trim()) {
        filtered = filtered.filter(
          (c) =>
            c.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.complaint_description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (filterStatus) {
        filtered = filtered.filter((c) => c.status === filterStatus);
      }
      if (filterPriority) {
        filtered = filtered.filter((c) => c.priority === filterPriority);
      }
      setFilteredRaised(filtered);
    }
  }, [searchTerm, filterStatus, filterPriority, assignedComplaints, raisedComplaints, activeTab]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterPriority("");
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("employee_name");
    toast({
      title: "Logged out",
      status: "success",
      position: "top-right",
      duration: 3000,
    });
    navigate("/login");
  };

  // Handle status change for assigned complaints
  const handleStatusChange = (complaintId, newStatus) => {
    setAssignedComplaints((prev) =>
      prev.map((c) =>
        c.complaint_id === complaintId
          ? { ...c, tempStatus: newStatus }
          : c
      )
    );
  };

  // Get available statuses based on current status (can only move forward)
  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentStatus === "RESOLVED") {
      return [];
    }
    return statusFlow.slice(currentIndex);
  };

  // Update status with file upload for RESOLVED
  const updateStatus = async (id, newStatus, oldStatus, remarks) => {
    if (newStatus === oldStatus) {
      toast({
        title: "No changes to save",
        status: "info",
        position: "top-right",
      });
      return;
    }

    if (newStatus === "RESOLVED" && !selectedFiles[id]) {
      toast({
        title: "Image Required",
        description: "Please upload an after-resolution image",
        status: "warning",
      });
      return;
    }

    setLoadingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/employee-dashboard/complaints/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: employeeId,
            remarks: remarks || `Status changed to ${newStatus}`,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        if (newStatus === "RESOLVED" && selectedFiles[id]) {
          const formData = new FormData();
          formData.append("complaint_id", id);
          formData.append("attachment_path", selectedFiles[id]);

          await fetch("http://localhost:3000/complaints/add-after-image", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
          });
        }

        toast({
          title: "Status Updated",
          description: `Complaint status changed to ${newStatus}`,
          status: "success",
        });

        if (newStatus === "RESOLVED") {
          const updatedComplaint = assignedComplaints.find(c => c.complaint_id === id);
          setComplaintToClose(updatedComplaint);
          setIsOTPModalOpen(true);
        }

        fetchAssignedComplaints();
        setSelectedFiles((prev) => ({ ...prev, [id]: null }));
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong",
        status: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // Handle file selection
  const handleFileChange = (id, file) => {
    setSelectedFiles((prev) => ({ ...prev, [id]: file }));
  };

  // View complaint details
  const viewComplaintDetails = async (complaint) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/complaints/getComplaintById/${complaint.complaint_id}`,
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
      if (data.success) {
        setSelectedComplaint(data.data);
        onOpen();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch complaint details",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch complaint details",
        status: "error",
      });
    }
  };

  // Feedback functions
  const openFeedbackModal = (complaint) => {
    setSelectedComplaintForFeedback(complaint);
    setIsFeedbackModalOpen(true);
  };

  const openViewFeedbackModal = async (complaint) => {
  // Check if we have cached feedback that is valid for current closure
  const cachedData = feedbackCache[complaint.complaint_id];
  
  if (cachedData && cachedData.feedback) {
    // Verify it's for current closure before using cache
    const complaintClosedAt = complaint.closed_at ? new Date(complaint.closed_at) : null;
    const feedbackSubmittedAt = new Date(cachedData.submitted_at);
    
    if (!complaintClosedAt || feedbackSubmittedAt >= complaintClosedAt) {
      setSelectedFeedback(cachedData.feedback);
      setIsViewFeedbackModalOpen(true);
      return;
    }
  }

  // If not cached or cache is stale, fetch fresh from server
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:3000/complaints/get-feedback/${complaint.complaint_id}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    
    if (res.status === 401) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    const data = await res.json();
    if (data.success && data.data && data.data.feedback) {
      setSelectedFeedback(data.data.feedback);
      setIsViewFeedbackModalOpen(true);
      
      // Update cache with new structure
      setFeedbackCache(prev => ({
        ...prev,
        [complaint.complaint_id]: {
          feedback: data.data.feedback,
          submitted_at: data.data.feedback.submitted_at,
          complaint_closed_at: data.data.complaint_closed_at
        }
      }));
    } else {
      toast({
        title: "No Feedback",
        description: "No feedback found for this complaint",
        status: "info",
      });
    }
  } catch (error) {
    console.error("Error fetching feedback:", error);
    toast({
      title: "Error",
      description: "Failed to fetch feedback",
      status: "error",
    });
  }
};

  const handleFeedbackSuccess = (complaintId) => {
    clearFeedbackCache(complaintId); 
      fetchRaisedComplaints();
  // Clear cache for this specific complaint
  
  
  // Refresh complaints to get updated status

  
  // Trigger UI refresh
  setFeedbackRefreshTrigger(prev => prev + 1);
  
  // Show success message
  toast({
    title: "Feedback Submitted",
    description: "Thank you for your feedback!",
    status: "success",
    duration: 3000,
  });
};

  const hasFeedback = (complaint) => {
  // CRITICAL: If complaint is not CLOSED, NEVER show feedback
  if (complaint.status !== "CLOSED") {
    return false;
  }
   if (!complaint.closed_at) {
    // Fallback: check if feedback exists
    const cachedData = feedbackCache[complaint.complaint_id];
    return cachedData && cachedData.feedback !== null;
  }
  const cachedData = feedbackCache[complaint.complaint_id];
  
  // If no data in cache or no feedback object, return false
  if (!cachedData || !cachedData.feedback) return false;
  
  // Get the complaint's closed_at from the complaint object
  const complaintClosedAt = complaint.closed_at ? new Date(complaint.closed_at) : null;
  const feedbackSubmittedAt = new Date(cachedData.submitted_at);
  
  // If we don't have closed_at info, default to checking cache existence
  if (!complaintClosedAt) {
    return true; // Assume feedback exists
  }
  
  // Feedback is valid only if submitted AFTER this closure
  // (allowing for 1 second tolerance for time precision)
  const isValid = feedbackSubmittedAt >= complaintClosedAt;
  
  return isValid;
};
  const getStats = () => {
    const complaints = activeTab === 0 ? assignedComplaints : raisedComplaints;
    return {
      open: complaints.filter((c) => c.status === "OPEN").length,
      assigned: complaints.filter((c) => c.status === "ASSIGNED").length,
      inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      resolved: complaints.filter((c) => c.status === "RESOLVED").length,
      closed: complaints.filter((c) => c.status === "CLOSED").length,
      total: complaints.length,
    };
  };

  const stats = getStats();
  const currentComplaints = activeTab === 0 ? filteredAssigned : filteredRaised;
  const statusOptions = activeTab === 0 ? ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] : ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

  // Helper for priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "red";
      case "MEDIUM": return "orange";
      case "LOW": return "green";
      default: return "gray";
    }
  };

  // Helper for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return "blue";
      case "ASSIGNED": return "purple";
      case "IN_PROGRESS": return "yellow";
      case "RESOLVED": return "green";
      case "CLOSED": return "gray";
      default: return "gray";
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Flex
        bg="white"
        px={8}
        py={4}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack spacing={4}>
          <Box p={2} bg="blue.600" borderRadius="lg">
            <Icon as={FiLayers} w={6} h={6} color="white" />
          </Box>
          <Heading size="lg" fontWeight="bold" color="gray.800">
            Employee Dashboard
          </Heading>
        </HStack>

        <HStack spacing={6}>
          <HStack spacing={3}>
            <Avatar size="md" name={employeeName} bg="blue.500" />
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="sm">
                {employeeName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Employee ID: {employeeId}
              </Text>
            </VStack>
          </HStack>
          <Button
            leftIcon={<FiLogOut />}
            variant="ghost"
            onClick={handleLogOut}
            size="sm"
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Container maxW="container.xl" py={8}>
        {/* Tabs */}
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          mb={6}
          onChange={(index) => {
            setActiveTab(index);
            clearFilters();
          }}
        >
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiCheckCircle} />
                <Text>Assigned to Me</Text>
                <Badge colorScheme="blue" borderRadius="full">
                  {assignedComplaints.length}
                </Badge>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={FiUser} />
                <Text>Raised by Me</Text>
                <Badge colorScheme="green" borderRadius="full">
                  {raisedComplaints.length}
                </Badge>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Assigned Complaints */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6} mb={8}>
                <StatCard title="Open" value={stats.open} total={stats.total} icon={FiAlertCircle} color="blue" />
                <StatCard title="Assigned" value={stats.assigned} total={stats.total} icon={FiClock} color="purple" />
                <StatCard title="In Progress" value={stats.inProgress} total={stats.total} icon={FiClock} color="orange" />
                <StatCard title="Resolved" value={stats.resolved} total={stats.total} icon={FiCheckCircle} color="green" />
                <StatCard title="Closed" value={stats.closed} total={stats.total} icon={FiCheckCircle} color="gray" />
              </SimpleGrid>

              <FilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                clearFilters={clearFilters}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                totalCount={currentComplaints.length}
                allCount={activeTab === 0 ? assignedComplaints.length : raisedComplaints.length}
              />

              <AssignedComplaintsGrid
                complaints={currentComplaints}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                viewComplaintDetails={viewComplaintDetails}
                handleStatusChange={handleStatusChange}
                getAvailableStatuses={getAvailableStatuses}
                handleFileChange={handleFileChange}
                updateStatus={updateStatus}
                selectedFiles={selectedFiles}
                loadingId={loadingId}
                setComplaintToClose={setComplaintToClose}
                setIsOTPModalOpen={setIsOTPModalOpen}
              />
            </TabPanel>

            {/* Tab 2: Raised Complaints */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6} mb={8}>
                <StatCard title="Open" value={stats.open} total={stats.total} icon={FiAlertCircle} color="blue" />
                <StatCard title="Assigned" value={stats.assigned} total={stats.total} icon={FiClock} color="purple" />
                <StatCard title="In Progress" value={stats.inProgress} total={stats.total} icon={FiClock} color="orange" />
                <StatCard title="Resolved" value={stats.resolved} total={stats.total} icon={FiCheckCircle} color="green" />
                <StatCard title="Closed" value={stats.closed} total={stats.total} icon={FiCheckCircle} color="gray" />
              </SimpleGrid>

              <FilterBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                clearFilters={clearFilters}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                totalCount={currentComplaints.length}
                allCount={activeTab === 0 ? assignedComplaints.length : raisedComplaints.length}
              />

              <RaisedComplaintsGrid
                 key={feedbackRefreshTrigger}
                complaints={currentComplaints}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                viewComplaintDetails={viewComplaintDetails}
                hasFeedback={hasFeedback}
                openFeedbackModal={openFeedbackModal}
                openViewFeedbackModal={openViewFeedbackModal}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        key={selectedComplaint?.complaint_id + feedbackRefreshTrigger}
        isOpen={isOpen}
        onClose={onClose}
        selectedComplaint={selectedComplaint}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
        hasFeedback={hasFeedback}
        openFeedbackModal={openFeedbackModal}
        openViewFeedbackModal={openViewFeedbackModal}
      />
      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={isOTPModalOpen}
        onClose={() => {
          setIsOTPModalOpen(false);
          setComplaintToClose(null);
        }}
        complaint={complaintToClose}
        onSuccess={() => {
          fetchAssignedComplaints();
           fetchRaisedComplaints();
             setFeedbackRefreshTrigger(prev => prev + 1);
          toast({
            title: "Complaint Closed",
            description: "The complaint has been successfully closed",
            status: "success",
          });
        }}
      />

      {/* Employee Feedback Modal */}
      <EmployeeFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedComplaintForFeedback(null);
        }}
        complaint={selectedComplaintForFeedback}
        onSuccess={(complaintId) => handleFeedbackSuccess(complaintId)}
      />

      {/* View Feedback Modal */}
      <Modal isOpen={isViewFeedbackModalOpen} onClose={() => setIsViewFeedbackModalOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFeedback && (
              <VStack align="stretch" spacing={4}>
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  Thank you for your feedback!
                </Alert>
                
                <Box>
                  <Text fontSize="sm" fontWeight="bold" mb={2}>Your Rating:</Text>
                  <HStack spacing={1}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        as={FiStar}
                        w={6}
                        h={6}
                        color={star <= selectedFeedback.satisfaction_rating ? "yellow.400" : "gray.300"}
                        fill={star <= selectedFeedback.satisfaction_rating ? "yellow.400" : "none"}
                      />
                    ))}
                  </HStack>
                </Box>

                {selectedFeedback.comment && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Your Comment:</Text>
                    <Box bg="gray.50" p={4} borderRadius="md">
                      <Text>{selectedFeedback.comment}</Text>
                    </Box>
                  </Box>
                )}

                <Box>
                  <Text fontSize="xs" color="gray.500">
                    Submitted on: {new Date(selectedFeedback.submitted_at).toLocaleString()}
                  </Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsViewFeedbackModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Filter Bar Component
const FilterBar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterPriority, setFilterPriority, clearFilters, statusOptions, priorityOptions, totalCount, allCount }) => {
  return (
    <Flex
      bg="white"
      p={4}
      borderRadius="xl"
      boxShadow="sm"
      mb={6}
      direction={{ base: "column", md: "row" }}
      gap={4}
      align="center"
      justify="space-between"
    >
      <HStack spacing={4} flex={1} wrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search by ticket or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <InputRightElement>
              <IconButton
                size="xs"
                icon={<FiXCircle />}
                onClick={() => setSearchTerm("")}
                variant="ghost"
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Select
          placeholder="All Status"
          maxW="180px"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          placeholder="All Priority"
          maxW="180px"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>

        <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={clearFilters} size="sm">
          Clear Filters
        </Button>
      </HStack>
      <Text fontSize="sm" color="gray.500">
        {totalCount} of {allCount} tickets
      </Text>
    </Flex>
  );
};

// Assigned Complaints Grid Component
const AssignedComplaintsGrid = ({ complaints, getPriorityColor, getStatusColor, viewComplaintDetails, handleStatusChange, getAvailableStatuses, handleFileChange, updateStatus, selectedFiles, loadingId, setComplaintToClose, setIsOTPModalOpen }) => {
  if (complaints.length === 0) {
    return (
      <Flex direction="column" align="center" py={16}>
        <Icon as={FiFileText} w={16} h={16} color="gray.200" mb={4} />
        <Heading size="md" color="gray.400" mb={2}>No Complaints Found</Heading>
        <Text color="gray.400">Try adjusting your filters or check back later.</Text>
      </Flex>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      {complaints.map((complaint) => {
        const availableStatuses = getAvailableStatuses(complaint.status);
        const tempStatus = complaint.tempStatus || complaint.status;
        const canUpdate = tempStatus !== complaint.status;
        const selectedFile = selectedFiles[complaint.complaint_id];

        return (
          <Card
            key={complaint.complaint_id}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.100"
            transition="all 0.2s"
            _hover={{ shadow: "lg" }}
          >
            <CardHeader pb={2}>
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Badge colorScheme={getPriorityColor(complaint.priority)} px={2} py={1} borderRadius="full" fontSize="xs">
                    {complaint.priority}
                  </Badge>
                  <Badge colorScheme={getStatusColor(complaint.status)} px={2} py={1} borderRadius="full" fontSize="xs">
                    {complaint.status}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    Ticket #{complaint.ticket_number || complaint.complaint_id}
                  </Text>
                </HStack>
                <Menu>
                  <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                  <MenuList>
                    <MenuItem icon={<FiEye />} onClick={() => viewComplaintDetails(complaint)}>
                      View Details
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </CardHeader>

            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="md" fontWeight="medium" noOfLines={3}>
                  {complaint.complaint_description}
                </Text>

                <Divider />

                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Department</Text>
                    <Text fontSize="sm" fontWeight="500">{complaint.department}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Priority</Text>
                    <Text fontSize="sm" fontWeight="500">{complaint.priority}</Text>
                  </Box>
                </SimpleGrid>

                {complaint.status === "RESOLVED" ? (
                  <>
                    <Divider />
                    <Box bg="green.50" p={4} borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                      <VStack spacing={3}>
                        <HStack spacing={2}>
                          <Icon as={FiCheckCircle} color="green.500" />
                          <Text fontWeight="bold" color="green.700">Complaint Resolved</Text>
                        </HStack>
                        <Text fontSize="sm" color="green.600" textAlign="center">
                          This complaint has been resolved and is ready for closure.
                          Please verify OTP to close the complaint.
                        </Text>
                        <Button
                          colorScheme="green"
                          size="sm"
                          width="full"
                          leftIcon={<FiCheckCircle />}
                          onClick={() => {
                            setComplaintToClose(complaint);
                            setIsOTPModalOpen(true);
                          }}
                        >
                          Close Complaint (OTP Required)
                        </Button>
                      </VStack>
                    </Box>
                  </>
                ) : complaint.status !== "CLOSED" ? (
                  <>
                    <Divider />
                    <Box>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.500">Update Status</FormLabel>
                        <Select
                          size="sm"
                          value={tempStatus}
                          onChange={(e) => handleStatusChange(complaint.complaint_id, e.target.value)}
                        >
                          {availableStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </FormControl>

                      {tempStatus === "RESOLVED" && complaint.status !== "RESOLVED" && (
                        <Box mt={3}>
                          <FormControl>
                            <FormLabel fontSize="xs" color="gray.500">
                              Upload After-Resolution Image (Required)
                            </FormLabel>
                            <Input
                              type="file"
                              accept="image/*"
                              size="sm"
                              p={1}
                              onChange={(e) => handleFileChange(complaint.complaint_id, e.target.files[0])}
                            />
                            {selectedFile && (
                              <Text fontSize="xs" color="green.500" mt={1}>
                                ✓ {selectedFile.name} selected
                              </Text>
                            )}
                          </FormControl>
                        </Box>
                      )}

                      <Button
                        mt={3}
                        colorScheme="blue"
                        size="sm"
                        width="full"
                        leftIcon={<FiCheckCircle />}
                        isLoading={loadingId === complaint.complaint_id}
                        isDisabled={!canUpdate || (tempStatus === "RESOLVED" && !selectedFile)}
                        onClick={() => updateStatus(complaint.complaint_id, tempStatus, complaint.status, complaint.remarks || "")}
                      >
                        {canUpdate ? "Update Status" : "No Changes"}
                      </Button>
                      {tempStatus === "RESOLVED" && !selectedFile && canUpdate && (
                        <Text fontSize="xs" color="red.500" mt={2} textAlign="center">
                          Please upload an after-resolution image
                        </Text>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box bg="gray.50" p={3} borderRadius="md" textAlign="center">
                    <Text fontSize="sm" color="gray.500">This complaint is closed and cannot be updated.</Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};

// Raised Complaints Grid Component (with Feedback)
const RaisedComplaintsGrid = ({ complaints, getPriorityColor, getStatusColor, viewComplaintDetails, hasFeedback, openFeedbackModal, openViewFeedbackModal }) => {
  if (complaints.length === 0) {
    return (
      <Flex direction="column" align="center" py={16}>
        <Icon as={FiFileText} w={16} h={16} color="gray.200" mb={4} />
        <Heading size="md" color="gray.400" mb={2}>No complaints found</Heading>
        <Text color="gray.400">You haven't raised any complaints yet.</Text>
        <Button mt={6} colorScheme="blue" onClick={() => window.location.href = "/complaints"}>
          Raise a Complaint
        </Button>
      </Flex>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      {complaints.map((complaint) => (
        <Card
          key={complaint.complaint_id}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.100"
          transition="all 0.2s"
          _hover={{ shadow: "lg" }}
        >
          <CardHeader pb={2}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Badge colorScheme={getPriorityColor(complaint.priority)} px={2} py={1} borderRadius="full" fontSize="xs">
                  {complaint.priority}
                </Badge>
                <Badge colorScheme={getStatusColor(complaint.status)} px={2} py={1} borderRadius="full" fontSize="xs">
                  {complaint.status}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  Ticket #{complaint.ticket_number || complaint.complaint_id}
                </Text>
              </HStack>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                <MenuList>
                  <MenuItem icon={<FiEye />} onClick={() => viewComplaintDetails(complaint)}>
                    View Details
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </CardHeader>

          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="md" fontWeight="medium" noOfLines={3}>
                {complaint.complaint_description}
              </Text>

              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Department</Text>
                  <Text fontSize="sm" fontWeight="500">{complaint.department}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>Priority</Text>
                  <Text fontSize="sm" fontWeight="500">{complaint.priority}</Text>
                </Box>
                {complaint.assigned_employee_name && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>Assigned To</Text>
                    <Text fontSize="sm" fontWeight="500">{complaint.assigned_employee_name}</Text>
                  </Box>
                )}
              </SimpleGrid>

              <Flex justify="space-between" align="center" pt={2}>
                <HStack spacing={1} fontSize="sm" color="gray.500">
                  <Icon as={FiClock} size="12px" />
                  <Text>{new Date(complaint.created_at).toLocaleDateString()}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    rightIcon={<FiEye />}
                    onClick={() => viewComplaintDetails(complaint)}
                  >
                    View
                  </Button>
                  
                  {/* Feedback Button - Only for CLOSED complaints */}
                  {complaint.status === "CLOSED" && (
                    hasFeedback(complaint) ? (
                      <Tooltip label="View your submitted feedback">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiMessageSquare />}
                          onClick={() => openViewFeedbackModal(complaint)}
                        >
                          View Feedback
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip label="Rate your experience">
                        <Button
                          size="sm"
                          colorScheme="purple"
                          variant="outline"
                          leftIcon={<FiStar />}
                          onClick={() => openFeedbackModal(complaint)}
                        >
                          Give Feedback
                        </Button>
                      </Tooltip>
                    )
                  )}
                </HStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

// Complaint Details Modal Component
// Complaint Details Modal Component with Feedback
const ComplaintDetailsModal = ({ isOpen, onClose, selectedComplaint, getStatusColor, getPriorityColor, hasFeedback, openFeedbackModal, openViewFeedbackModal }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent maxW="800px">
        <ModalHeader>Complaint Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {selectedComplaint && (
            <VStack align="stretch" spacing={4}>
              <Box bg="gray.50" p={4} borderRadius="lg">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Ticket Number</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {selectedComplaint.ticket_number}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedComplaint.status)} fontSize="md" px={3} py={1} borderRadius="full">
                      {selectedComplaint.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Priority</Text>
                    <Badge colorScheme={getPriorityColor(selectedComplaint.priority)} fontSize="md" px={3} py={1} borderRadius="full">
                      {selectedComplaint.priority}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Department</Text>
                    <Text fontWeight="medium">{selectedComplaint.department}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Raised By</Text>
                    <Text fontWeight="medium">{selectedComplaint.raised_by_name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">Raised By Type</Text>
                    <Text fontWeight="medium">{selectedComplaint.raised_by_type}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Complaint Description</Text>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text>{selectedComplaint.complaint_description || "No description provided."}</Text>
                </Box>
              </Box>

              {selectedComplaint.assigned_employee_name && (
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={2}>Assigned To</Text>
                  <Box bg="gray.50" p={3} borderRadius="md">
                    <HStack spacing={3}>
                      <Avatar size="sm" name={selectedComplaint.assigned_employee_name} />
                      <Box>
                        <Text fontWeight="medium">{selectedComplaint.assigned_employee_name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          Department: {selectedComplaint.assigned_department}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                </Box>
              )}

              <Divider />

              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={3}>Attachments</Text>
                <Tabs variant="enclosed" colorScheme="blue">
                  <TabList>
                    <Tab>Before Images {selectedComplaint.before_images?.length > 0 && <Badge ml={2} colorScheme="blue">{selectedComplaint.before_images.length}</Badge>}</Tab>
                    <Tab>After Images {selectedComplaint.after_images?.length > 0 && <Badge ml={2} colorScheme="green">{selectedComplaint.after_images.length}</Badge>}</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      {selectedComplaint.before_images?.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {selectedComplaint.before_images.map((img, idx) => (
                            <Box key={idx} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white">
                              <Image src={img.file_name} alt={`Before ${idx + 1}`} maxH="300px" w="100%" objectFit="cover" />
                              <Box p={2} bg="gray.50">
                                <Button size="xs" colorScheme="blue" variant="ghost" width="full" onClick={() => window.open(img.file_name, '_blank')}>
                                  View Full Size
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Flex direction="column" align="center" py={10}>
                          <Icon as={FiFileText} w={12} h={12} color="gray.300" mb={3} />
                          <Text color="gray.500">No before images available</Text>
                        </Flex>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {selectedComplaint.after_images?.length > 0 ? (
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {selectedComplaint.after_images.map((img, idx) => (
                            <Box key={idx} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white">
                              <Image src={img.file_name} alt={`After ${idx + 1}`} maxH="300px" w="100%" objectFit="cover" />
                              <Box p={2} bg="gray.50">
                                <Button size="xs" colorScheme="green" variant="ghost" width="full" onClick={() => window.open(img.file_name, '_blank')}>
                                  View Full Size
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Flex direction="column" align="center" py={10}>
                          <Icon as={FiFileText} w={12} h={12} color="gray.300" mb={3} />
                          <Text color="gray.500">No after-resolution images available yet</Text>
                        </Flex>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {/* Feedback Section - Only show for CLOSED complaints that were raised by this employee */}
              {selectedComplaint.status === "CLOSED" && selectedComplaint.raised_by_type === "EMPLOYEE" && (
                <>
                  <Divider />
                  {hasFeedback && hasFeedback(selectedComplaint) ? (
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle fontSize="sm">Feedback Submitted</AlertTitle>
                        <AlertDescription fontSize="xs">
                          You have already submitted feedback for this complaint.
                        </AlertDescription>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<FiMessageSquare />}
                        onClick={() => openViewFeedbackModal(selectedComplaint)}
                      >
                        View Feedback
                      </Button>
                    </Alert>
                  ) : (
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box flex="1">
                        <AlertTitle fontSize="sm">Complaint Closed</AlertTitle>
                        <AlertDescription fontSize="xs">
                          This complaint has been resolved and closed. We value your feedback!
                        </AlertDescription>
                      </Box>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        leftIcon={<FiStar />}
                        onClick={() => openFeedbackModal(selectedComplaint)}
                      >
                        Give Feedback
                      </Button>
                    </Alert>
                  )}
                </>
              )}

              <Flex justify="space-between" pt={2} borderTop="1px solid" borderColor="gray.200">
                <Text fontSize="xs" color="gray.500">Created: {new Date(selectedComplaint.created_at).toLocaleString()}</Text>
              </Flex>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Stat Card Component
const StatCard = ({ title, value, total, icon, color }) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  return (
    <Card borderRadius="xl" boxShadow="sm" borderTop="4px solid" borderTopColor={`${color}.500`}>
      <CardBody>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">{title}</Text>
            <Heading size="xl" fontWeight="bold" color={`${color}.600`}>{value}</Heading>
            <Text fontSize="xs" color="gray.400" mt={1}>{percentage}% of total</Text>
          </Box>
          <Icon as={icon} w={8} h={8} color={`${color}.400`} />
        </Flex>
        <Progress value={percentage} size="xs" colorScheme={color} mt={3} borderRadius="full" />
      </CardBody>
    </Card>
  );
};

export default EmployeeDashboard;
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  HStack,
  VStack,
  Badge,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  useToast,
  Icon,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  AlertTitle ,
  AlertDescription,
  AlertIcon,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { 
  FiLogOut, 
  FiEye, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiCalendar,
  FiStar,
  FiMessageSquare,
  FiThumbsUp,
   FiRefreshCw
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "./FeedbackModal";

function PatientDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedComplaintForFeedback, setSelectedComplaintForFeedback] = useState(null);
  const [isViewFeedbackModalOpen, setIsViewFeedbackModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
 const [feedbackCache, setFeedbackCache] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedbackRefreshTrigger, setFeedbackRefreshTrigger] = useState(0);
const prevComplaintsRef = useRef([]);
  const toast = useToast();
  const navigate = useNavigate();

  const patientId = localStorage.getItem("patient_id");
  const patientName = localStorage.getItem("patient_name");
  const token = localStorage.getItem("token");


// Clear feedback cache for a specific complaint


useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'complaint_updated') {
      try {
        const data = JSON.parse(e.newValue);
        if (data && data.complaint_id) {
          // Clear cache for this specific complaint
          setFeedbackCache(prev => {
            const newCache = { ...prev };
            delete newCache[data.complaint_id];
            return newCache;
          });
          // Refresh complaints
          fetchComplaints();
          // Force UI refresh
          setRefreshKey(prev => prev + 1);
          setFeedbackRefreshTrigger(prev => prev + 1);
        }
      } catch (error) {
        console.log("error : ", error);
        fetchComplaints();
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Expose function for cross-component communication
  window.refreshPatientDashboard = () => {
    fetchComplaints();
  };
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    delete window.refreshPatientDashboard;
  };
}, []);


  useEffect(() => {
    if (!patientId || !token) {
      navigate("/patient-login");
      return;
    }
    fetchComplaints();
  }, []);


useEffect(() => {
  window.refreshPatientDashboard = fetchComplaints;
  return () => {
    delete window.refreshPatientDashboard;
  };
}, []);

  // eslint-disable-next-line no-unused-vars


const fetchComplaints = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/complaints/getComplaintsByPatient/${patientId}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );

    if (res.status === 401) {
      localStorage.clear();
      navigate("/patient-login");
      return;
    }

    const data = await res.json();
    if (data.success) {
      // Fetch latest assignment date for each complaint
      const complaintsWithAssignment = await Promise.all(data.data.map(async (complaint) => {
        try {
          const assignRes = await fetch(
            `http://localhost:3000/complaints/get-complaint-assigned/${complaint.complaint_id}`,
            {
              headers: { "Authorization": `Bearer ${token}` }
            }
          );
          if (assignRes.ok) {
            const assignData = await assignRes.json();
            if (assignData.success && assignData.data.length > 0) {
              // Get the latest assignment (most recent assigned_at)
              const latestAssignment = assignData.data.sort((a, b) => 
                new Date(b.assigned_at) - new Date(a.assigned_at)
              )[0];
              
              return {
                ...complaint,
                last_assigned_at: latestAssignment.assigned_at
              };
            }
          }
        } catch (err) {
          console.error("Error fetching assignment", err);
        }
        return complaint;
      }));

      const complaintsWithClosedAt = complaintsWithAssignment.map(c => ({
        ...c,
        closed_at: c.closed_at || null
      }));
      const previousComplaints = prevComplaintsRef.current;
      const currentComplaints = complaintsWithClosedAt;

      // Find complaints that were CLOSED but now are NOT CLOSED (reopened)
      const reopenedComplaintIds = previousComplaints
        .filter(prev => prev.status === "CLOSED")
        .filter(prev => {
          const current = currentComplaints.find(c => c.complaint_id === prev.complaint_id);
          return current && current.status !== "CLOSED";
        })
        .map(prev => prev.complaint_id);

      // Clear cache for reopened complaints
      if (reopenedComplaintIds.length > 0) {
        setFeedbackCache(prev => {
          const newCache = { ...prev };
          reopenedComplaintIds.forEach(id => {
            delete newCache[id];
          });
          return newCache;
        });
      }

      // Update ref with current complaints
      prevComplaintsRef.current = currentComplaints;
      
      setComplaints(complaintsWithClosedAt)
      const closedComplaints = complaintsWithClosedAt.filter(c => c.status === "CLOSED");
      await fetchFeedbackForClosedComplaints(closedComplaints);
    }
  } catch (error) {
    console.error("Error fetching complaints:", error);
  } finally {
    setLoading(false);
  }
};

const fetchFeedbackForClosedComplaints = async (closedComplaints) => {
  const feedbackPromises = closedComplaints.map(async (complaint) => {
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/get-feedback/${complaint.complaint_id}`,
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          return { 
            complaint_id: complaint.complaint_id, 
            feedbackData: data.data  // This now contains { feedback, complaint_closed_at, complaint_status }
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

  // If not cached or cache is stale, fetch fresh
  try {
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
      navigate("/patient-login");
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
  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      status: "success",
      duration: 2000,
    });
    navigate("/patient-login");
  };

  const viewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

const handleFeedbackSuccess = (complaintId) => {
  // Clear cache for this specific complaint
  setFeedbackCache(prev => {
    const newCache = { ...prev };
    delete newCache[complaintId];
    return newCache;
  });
  
  // Refresh complaints
  fetchComplaints();
  setRefreshKey(prev => prev + 1);
  setFeedbackRefreshTrigger(prev => prev + 1);
  
  toast({
    title: "Feedback Submitted",
    description: "Thank you for your feedback!",
    status: "success",
    duration: 3000,
  });
};
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN": return "blue";
      case "ASSIGNED": return "purple";
      case "IN_PROGRESS": return "orange";
      case "RESOLVED": return "green";
      case "CLOSED": return "gray";
      default: return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "red";
      case "MEDIUM": return "orange";
      case "LOW": return "green";
      default: return "gray";
    }
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
  
  // If no data in cache, return false
  if (!cachedData || !cachedData.feedback) return false;
  
  // Get the complaint's closed_at from the complaint object
  // (Make sure your backend returns closed_at in complaint data)
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

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Flex
        bg="white"
        px={8}
        py={4}
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
      >
        <HStack spacing={4}>
          <Box bg="blue.500" p={2} borderRadius="lg">
            <Icon as={FiFileText} w={6} h={6} color="white" />
          </Box>
          <Box>
            <Heading size="lg">My Complaints</Heading>
            <Text fontSize="sm" color="gray.500">
              Track and view your complaints
            </Text>
          </Box>
        </HStack>
        
        <HStack spacing={4}>
          <VStack align="end" spacing={0}>
            <Text fontWeight="bold">{patientName}</Text>
            <Text fontSize="xs" color="gray.500">Patient</Text>
          </VStack>
          <Avatar size="md" name={patientName} bg="blue.500" />
          <Button
            leftIcon={<FiRefreshCw />}
            variant="ghost"
            onClick={() => {
              setFeedbackCache({}); // Clear entire cache
              fetchComplaints(); // Force refresh
            }}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiLogOut />}
            variant="ghost"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Container maxW="container.xl" py={8}>
        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
          <StatCard
            title="Total"
            value={complaints.length}
            icon={FiFileText}
            color="blue"
          />
          <StatCard
            title="Open"
            value={complaints.filter(c => c.status === "OPEN").length}
            icon={FiAlertCircle}
            color="red"
          />
          <StatCard
            title="In Progress"
            value={complaints.filter(c => c.status === "IN_PROGRESS").length}
            icon={FiClock}
            color="orange"
          />
          <StatCard
            title="Resolved/Closed"
            value={complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length}
            icon={FiCheckCircle}
            color="green"
          />
        </SimpleGrid>

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <Flex direction="column" align="center" py={16}>
            <Icon as={FiFileText} w={16} h={16} color="gray.200" mb={4} />
            <Heading size="md" color="gray.400">No complaints found</Heading>
            <Text color="gray.400" mt={2}>
              You haven't raised any complaints yet.
            </Text>
            <Button
              mt={6}
              colorScheme="blue"
              onClick={() => navigate("/complaints")}
            >
              Raise a Complaint
            </Button>
          </Flex>
        ) : (
          <SimpleGrid  key={feedbackRefreshTrigger}  columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {complaints.map((complaint) => (
              <Card
                key={complaint.complaint_id}
                borderRadius="xl"
                boxShadow="md"
                transition="all 0.2s"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                cursor="pointer"
                onClick={() => viewDetails(complaint)}
              >
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={getPriorityColor(complaint.priority)}
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {complaint.priority}
                      </Badge>
                      <Badge
                        colorScheme={getStatusColor(complaint.status)}
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {complaint.status}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      #{complaint.ticket_number}
                    </Text>
                  </Flex>
                </CardHeader>
                
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="medium" noOfLines={3}>
                      {complaint.complaint_description}
                    </Text>
                    
                    <Flex justify="space-between" align="center" pt={2}>
                      <HStack spacing={1} fontSize="sm" color="gray.500">
                        <Icon as={FiCalendar} size="12px" />
                        <Text>
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          rightIcon={<FiEye />}
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetails(complaint);
                          }}
                        >
                          View
                        </Button>
                        
                        {/* Feedback Button - Changes based on whether feedback exists */}
                        {complaint.status === "CLOSED" && (
                          hasFeedback(complaint) ? (
                            <Tooltip label="View your submitted feedback">
                              <Button
                                size="sm"
                                colorScheme="blue"
                                variant="outline"
                                leftIcon={<FiMessageSquare />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openViewFeedbackModal(complaint);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFeedbackModal(complaint);
                                }}
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
        )}
      </Container>

      {/* Complaint Details Modal */}
      <Modal key={refreshKey + feedbackRefreshTrigger} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complaint Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedComplaint && (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Ticket Number</Text>
                    <Text fontWeight="bold">{selectedComplaint.ticket_number}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Status</Text>
                    <Badge colorScheme={getStatusColor(selectedComplaint.status)}>
                      {selectedComplaint.status}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Priority</Text>
                    <Badge colorScheme={getPriorityColor(selectedComplaint.priority)}>
                      {selectedComplaint.priority}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Department</Text>
                    <Text>{selectedComplaint.department || "Not Assigned"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">Created Date</Text>
                    <Text>{new Date(selectedComplaint.created_at).toLocaleString()}</Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    Complaint Description
                  </Text>
                  <Box bg="gray.50" p={3} borderRadius="md" mt={1}>
                    <Text>{selectedComplaint.complaint_description}</Text>
                  </Box>
                </Box>

                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <>
                    <Divider />
                    <Text fontWeight="bold">Attachments</Text>
                    <Tabs>
                      <TabList>
                        <Tab>
                          Before ({selectedComplaint.attachments.filter(a => a.attachment_type === "BEFORE").length})
                        </Tab>
                        <Tab>
                          After ({selectedComplaint.attachments.filter(a => a.attachment_type === "AFTER").length})
                        </Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          {selectedComplaint.attachments
                            .filter(a => a.attachment_type === "BEFORE")
                            .map((img, idx) => (
                              <Box key={idx} mb={4}>
                                <Image
                                  src={img.file_name}
                                  alt={`Before ${idx + 1}`}
                                  maxH="300px"
                                  mx="auto"
                                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
                                />
                                <Flex justify="center" mt={2}>
                                  <Button
                                    size="xs"
                                    onClick={() => window.open(img.file_name, '_blank')}
                                  >
                                    View Full Size
                                  </Button>
                                </Flex>
                              </Box>
                            ))}
                          {selectedComplaint.attachments.filter(a => a.attachment_type === "BEFORE").length === 0 && (
                            <Text textAlign="center" color="gray.500">No before images</Text>
                          )}
                        </TabPanel>
                        <TabPanel>
                          {selectedComplaint.attachments
                            .filter(a => a.attachment_type === "AFTER")
                            .map((img, idx) => (
                              <Box key={idx} mb={4}>
                                <Image
                                  src={img.file_name}
                                  alt={`After ${idx + 1}`}
                                  maxH="300px"
                                  mx="auto"
                                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"
                                />
                                <Flex justify="center" mt={2}>
                                  <Button
                                    size="xs"
                                    onClick={() => window.open(img.file_name, '_blank')}
                                  >
                                    View Full Size
                                  </Button>
                                </Flex>
                              </Box>
                            ))}
                          {selectedComplaint.attachments.filter(a => a.attachment_type === "AFTER").length === 0 && (
                            <Text textAlign="center" color="gray.500">No after images yet</Text>
                          )}
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </>
                )}

                {/* Feedback Section for Closed Complaints */}
                {selectedComplaint.status === "CLOSED" && (
                  <>
                    <Divider />
                    {hasFeedback(selectedComplaint) ? (
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
                          onClick={() => {
                            setIsModalOpen(false);
                            openViewFeedbackModal(selectedComplaint);
                          }}
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
                          onClick={() => {
                            setIsModalOpen(false);
                            openFeedbackModal(selectedComplaint);
                          }}
                        >
                          Give Feedback
                        </Button>
                      </Alert>
                    )}
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Feedback Submission Modal */}
      <FeedbackModal
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

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card borderRadius="xl" boxShadow="sm">
      <CardBody>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="sm" color="gray.500">{title}</Text>
            <Heading size="xl" color={`${color}.600`}>{value}</Heading>
          </Box>
          <Icon as={icon} w={8} h={8} color={`${color}.500`} />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default PatientDashboard;
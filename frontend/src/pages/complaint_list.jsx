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
} from "@chakra-ui/react";
import { DownloadIcon, RepeatIcon, ChevronLeftIcon, ChevronRightIcon, DeleteIcon, SearchIcon } from "@chakra-ui/icons";
import { AnimatePresence, motion } from "framer-motion";

export default function ComplaintList() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const [previewFile, setPreviewFile] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [originalEmployeeId, setOriginalEmployeeId] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignDeptFilter, setAssignDeptFilter] = useState("");
  
  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingEmployees, setIsSearchingEmployees] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [raisedByType, setRaisedByType] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [deptOptions, setDeptOptions] = useState([]);

  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/complaint_list/getComplaintList"
      );
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data || []);
        setFiltered(data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to fetch complaints", status: "error", duration: 2000 });
    }
  };

  const fetchEmployeesData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/employee/getEmployees");
      const data = await res.json();
      if (data.success) {
        setAllEmployees(data.data || []);
        const unique = [...new Set(data.data.map((e) => e.department).filter(Boolean))];
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

  // Client-side Employee Search
  useEffect(() => {
    if (!isAssignOpen) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.trim().toLowerCase();

    // If both filters are empty, show no results to avoid loading the full list by default.
    if (!term && !assignDeptFilter) {
      setSearchResults([]);
      return;
    }

    const results = allEmployees.filter((emp) => {
      const matchesTerm = !term || emp.employee_name?.toLowerCase().includes(term) || emp.employee_id?.toString().includes(term);
      const matchesDept = assignDeptFilter ? emp.department === assignDeptFilter : true;
      return matchesTerm && matchesDept;
    });

    setSearchResults(results.slice(0, 15));
  }, [searchTerm, assignDeptFilter, isAssignOpen, allEmployees]);

  useEffect(() => {
    let temp = [...complaints];
    if (search) {
      temp = temp.filter(
        (c) =>
          c.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
          c.raised_by_name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status) temp = temp.filter((c) => c.status === status);
    if (priority) temp = temp.filter((c) => c.priority === priority);
    if (raisedByType) temp = temp.filter((c) => c.raised_by_type === raisedByType);
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

  const openAttachmentModal = (path) => {
    if (!path) {
      toast({ title: "No attachment available", status: "warning", duration: 2000 });
      return;
    }
    let url = /^https?:\/\//i.test(path)
      ? path
      : `${window.location.origin}/${path.startsWith("/") ? path.slice(1) : path}`;
    setPreviewFile(url);
    onOpen();
  };

  const downloadAttachment = async (url) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const filename = url.split("/").pop();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast({ title: "Download failed", description: err.message, status: "error", duration: 2000 });
    }
  };

  const handleAssignClick = (complaint) => {
    setSelectedComplaint(complaint);
    const empId = complaint.employee_id ? complaint.employee_id.toString() : null;
    setSelectedEmployeeId(empId);
    setOriginalEmployeeId(empId);
    setAssignDeptFilter("");
    setSearchTerm("");
    setSearchResults([]);
    setSelectedEmployeeData(null); // Reset detailed data, will rely on ID or search selection
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
      console.log("Updating complaint:", selectedComplaint.complaint_id, "Employee:", selectedEmployeeId);
      const response = await fetch(
        `http://localhost:3000/api/complaint_list/assign/${encodeURIComponent(selectedComplaint.complaint_id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: parseInt(selectedEmployeeId, 10),
            status: "ASSIGNED",
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error:", response.status, text);
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (response.ok && result.success) {
        toast({ title: "Updated Successfully", status: "success", duration: 2000 });
        onAssignClose();
        fetchComplaints(); // Refresh the list
      } else {
        throw new Error(result.message || "Failed to update complaint");
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast({
        title: "Update Failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!window.confirm("Are you sure you want to unassign this complaint?")) return;

    setIsAssigning(true);
    try {
      console.log("Unassigning complaint:", selectedComplaint.complaint_id);
      const response = await fetch(
        `http://localhost:3000/api/complaint_list/assign/${encodeURIComponent(selectedComplaint.complaint_id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: null,
            status: "OPEN",
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Server Error:", response.status, text);
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (response.ok && result.success) {
        toast({ title: "Unassigned Successfully", status: "success", duration: 2000 });
        onAssignClose();
        fetchComplaints();
      } else {
        throw new Error(result.message || "Failed to unassign complaint");
      }
    } catch (error) {
      console.error("Unassign Error:", error);
      toast({
        title: "Unassign Failed",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const openCount = complaints.filter((c) => c.status?.toUpperCase() === "OPEN").length;
  const progressCount = complaints.filter((c) => c.status?.toUpperCase() === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status?.toUpperCase() === "RESOLVED").length;
  const totalCount = complaints.length || 1;

  // Helper to get display data for selected employee
  const displayEmployee = selectedEmployeeData || allEmployees.find(e => e.employee_id.toString() === selectedEmployeeId);

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
          <StatCard title="Open" value={openCount} color="blue.400" total={totalCount} />
          <StatCard title="In Progress" value={progressCount} color="yellow.400" total={totalCount} />
          <StatCard title="Resolved" value={resolvedCount} color="green.400" total={totalCount} />
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
                <option key={dept} value={dept}>{dept}</option>
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
              <Box bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
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
                      onClick={() => openAttachmentModal(c.attachment_path || c.file_name)}
                      isDisabled={!c.attachment_path && !c.file_name}
                    >
                      View
                    </Button>
                    <Button
                      size="xs"
                      colorScheme="purple"
                      onClick={() => handleAssignClick(c)}
                    >
                      Assign To
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
                  const priority = priorityStyles[c.priority] || { bg: "gray.100", color: "gray.700" };
                  return (
                    <Box
                      key={c.complaint_id}
                      bg="white"
                      p={5}
                      borderRadius="xl"
                      boxShadow="sm"
                      border="1px solid"
                      borderColor="gray.100"
                      _hover={{ transform: "translateY(-3px)", boxShadow: "md" }}
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
                        <Text fontWeight="bold" fontSize="md">{c.ticket_number}</Text>

                        <Text fontSize="sm" color="gray.600">
                          <strong>NAME:</strong> {c.raised_by_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>TYPE:</strong> {c.raised_by_type}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <strong>DEPARTMENT:</strong> {c.department}
                        </Text>

                        <Text fontWeight="semibold" fontSize="sm" color="gray.700" mt={2}>
                          Complaint Description :
                        </Text>
                        <Box p={3} borderRadius="md" w="100%" bg="gray.50">
                          <Text fontSize="sm" color="gray.700" noOfLines={3}>
                            {c.complaint_description || "No description provided."}
                          </Text>
                        </Box>

                        <Badge colorScheme={getStatusColor(c.status)} variant="subtle" borderRadius="full" px={3} py={1}>
                          {c.status}
                        </Badge>

                        <Button
                          size="sm"
                          colorScheme="blue"
                          w="100%"
                          mt={2}
                          onClick={() => openAttachmentModal(c.attachment_path || c.file_name)}
                          isDisabled={!c.attachment_path && !c.file_name}
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
          <Button size="sm" onClick={() => setPage(page - 1)} isDisabled={page === 1}>Prev</Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i} size="sm" colorScheme={page === i + 1 ? "blue" : "gray"} onClick={() => setPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button size="sm" onClick={() => setPage(page + 1)} isDisabled={page === totalPages || totalPages === 0}>Next</Button>
        </Flex>
      </Box>

      {/* Attachment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attachment Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {previewFile.endsWith(".pdf") ? (
                <iframe src={previewFile} style={{ width: "100%", height: "500px" }} title="Preview" />
              ) : (
                <Image src={previewFile} alt="Preview" maxH="500px" w="full" />
              )}
              <HStack spacing={3}>
                <Button colorScheme="blue" onClick={() => window.open(previewFile, "_blank")}>Preview</Button>
                <Button leftIcon={<DownloadIcon />} colorScheme="green" onClick={() => downloadAttachment(previewFile)}>Download</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Assign Employee Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedComplaint && (
              <VStack align="stretch" spacing={6}>
                {/* Ticket Details */}
                <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px solid" borderColor="blue.400">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Ticket Number</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.700">{selectedComplaint.ticket_number}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Raised By</Text>
                      <Text fontSize="lg" fontWeight="bold">{selectedComplaint.raised_by_name}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Filters */}
                <HStack>
                  <Text fontWeight="medium" whiteSpace="nowrap" fontSize="sm">Department:</Text>
                  <Select
                    placeholder="All Departments"
                    value={assignDeptFilter}
                    onChange={(e) => setAssignDeptFilter(e.target.value)}
                    maxW="300px"
                  >
                    {deptOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Select>
                </HStack>

                {/* Search Input */}
                <Box position="relative">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      {isSearchingEmployees ? <Spinner size="xs" /> : <SearchIcon color="gray.300" />}
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
                  {!selectedEmployeeId && (searchResults.length > 0 || searchTerm || assignDeptFilter) && (
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
                                <Text fontSize="sm" fontWeight="bold" color="gray.700">{emp.employee_name}</Text>
                                <Text fontSize="xs" color="gray.500">{emp.department} • {emp.designation} • ID: {emp.employee_id}</Text>
                              </Box>
                            </HStack>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem p={4} textAlign="center">
                          <Text fontSize="sm" color="gray.500">No employees found.</Text>
                        </ListItem>
                      )}
                    </List>
                  )}
                </Box>

                {/* Selected Employee Card */}
                {selectedEmployeeId && (
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="purple.50" borderColor="purple.200">
                    <HStack justify="space-between">
                      <HStack spacing={4}>
                        <Avatar size="md" name={displayEmployee?.employee_name || "Employee"} bg="purple.500" />
                        <Box>
                          <Text fontWeight="bold" color="purple.800">
                            {displayEmployee?.employee_name || `Employee ID: ${selectedEmployeeId}`}
                          </Text>
                          <Text fontSize="sm" color="purple.600">
                            {displayEmployee ? `${displayEmployee.department} - ${displayEmployee.designation}` : "Selected for assignment"}
                          </Text>
                        </Box>
                      </HStack>
                      <Button size="sm" variant="ghost" colorScheme="red" onClick={() => {
                        setSelectedEmployeeId(null);
                        setSelectedEmployeeData(null);
                      }}>
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
              <Button colorScheme="red" variant="ghost" leftIcon={<DeleteIcon />} onClick={handleUnassign} isDisabled={isAssigning}>
                Unassign
              </Button>
              <HStack spacing={3}>
                <Button variant="outline" onClick={onAssignClose}>Cancel</Button>
                <Button
                  colorScheme="blue"
                  onClick={handleUpdate}
                  isLoading={isAssigning}
                >
                  Update
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Stat Card
function StatCard({ title, value, color, total }) {
  const percentage = Math.round((value / total) * 100);
  return (
    <Box bg="white" p={5} borderRadius="xl" boxShadow="sm" borderTop="4px solid" borderColor={color}>
      <Text fontSize="sm" color="gray.500">{title}</Text>
      <Text fontSize="2xl" fontWeight="bold">{value}</Text>
      <Progress mt={2} value={percentage} size="sm" colorScheme={color.split(".")[0]} borderRadius="md"/>
    </Box>
  );
}

// Status color helper
function getStatusColor(status) {
  const normalizedStatus = status ? status.toUpperCase() : "";
  switch(normalizedStatus) {
    case "OPEN": return "blue";
    case "ASSIGNED": return "purple";
    case "IN_PROGRESS": return "orange";
    case "RESOLVED": return "green";
    case "CLOSED": return "gray";
    default: return "gray";
  }
}
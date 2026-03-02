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
  useDisclosure,
} from "@chakra-ui/react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";
import { AnimatePresence, motion } from "framer-motion";

export default function ComplaintList() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewFile, setPreviewFile] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [raisedByType, setRaisedByType] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

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

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const progressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
  const totalCount = complaints.length || 1;

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
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="SALES">SALES</option>
              <option value="SUPPORT">SUPPORT</option>
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
                  templateColumns="0.5fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr"
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
                </Grid>

                {paginatedData.map((c, idx) => (
                  <Grid
                    key={c.complaint_id}
                    templateColumns="0.5fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr"
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
  switch(status) {
    case "OPEN": return "blue";
    case "IN_PROGRESS": return "orange";
    case "RESOLVED": return "green";
    case "CLOSED": return "gray";
    default: return "gray";
  }
}
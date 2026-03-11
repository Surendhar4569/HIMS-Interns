import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Flex,
  Container,
  Input,
  Text,
  HStack,
  Icon,
  Avatar,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiInbox, FiClipboard, FiLayers } from "react-icons/fi";

function EmployeeDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("employee_id");
  const employeeName = localStorage.getItem("employee_name");

  // Increased column widths
  const COLUMN_WIDTHS = {
    id: "120px",
    status: "240px",
    action: "180px",
  };

  useEffect(() => {
    if (!employeeId) {
      navigate("/");
      return;
    }
    fetchComplaints();
  }, [employeeId, navigate]);

  const fetchComplaints = () => {
    fetch(`http://localhost:3000/employee-dashboard/complaints/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComplaints(
            [...data.data].sort((a, b) => b.complaint_id - a.complaint_id),
          );
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

  const updateStatus = async (id, newStatus, oldStatus, remarks) => {
    if (newStatus === oldStatus) {
      toast({
        title: "No changes to save",
        status: "info",
        position: "top-right",
      });
      return;
    }

    setLoadingId(id);
    try {
      const res = await fetch(
        `http://localhost:3000/employee-dashboard/complaints/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_status: oldStatus,
            new_status: newStatus,
            employee_name: employeeName,
            remarks: remarks || "",
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Update Successful",
          status: "success",
          position: "top-right",
          variant: "solid",
        });

        setComplaints((prev) =>
          prev
            .map((c) =>
              c.complaint_id === id
                ? {
                    ...c,
                    status: newStatus,
                    tempStatus: undefined,
                    remarks: "",
                  }
                : c,
            )
            .sort((a, b) => b.complaint_id - a.complaint_id),
        );
      }
    } catch (error) {
      toast({ title: "Server Error", status: "error", position: "top-right" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Top Navigation */}
      <Flex
        bg="white"
        px={10}
        py={4}
        align="center"
        justify="space-between"
        borderBottom="2px solid"
        borderColor="blue.500"
        boxShadow="md"
      >
        <HStack spacing={4}>
          <Box p={2} bg="blue.500" borderRadius="lg">
            <Icon as={FiLayers} w={5} h={5} color="white" />
          </Box>
          <Heading size="md" fontWeight="800" color="gray.800">
            COMPLAINTS
          </Heading>
        </HStack>

        <HStack spacing={6}>
          <HStack spacing={3}>
            <VStack
              align="flex-end"
              spacing={0}
              display={{ base: "none", md: "flex" }}
            >
              <Text fontSize="sm" fontWeight="700" color="gray.700">
                {employeeName}
              </Text>
            </VStack>
            <Avatar
              size="sm"
              name={employeeName}
              border="2px solid"
              borderColor="blue.500"
            />
          </HStack>
          <Button
            rightIcon={<FiLogOut />}
            size="sm"
            variant="ghost"
            onClick={() => navigate("/login")}
          >
            Logout
          </Button>
        </HStack>
      </Flex>

      <Container maxW="container.xl" py={10}>
        <Flex justify="space-between" align="flex-end" mb={6}>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="blue.600">
              MANAGEMENT CONSOLE
            </Text>
            <Heading size="lg">Assigned Complaints</Heading>
          </Box>
          <Text fontSize="md" color="gray.500">
            Total Tickets: {complaints.length}
          </Text>
        </Flex>

        <Box
          bg="white"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <Table variant="simple">
            <Thead bg="gray.900">
              <Tr>
                <Th width={COLUMN_WIDTHS.id} color="white" py={5}>
                  ID
                </Th>
                <Th color="white">Complaint Details</Th>
                <Th width={COLUMN_WIDTHS.status} color="white">
                  Status Transition
                </Th>
                <Th color="white">Remarks</Th>
                <Th width={COLUMN_WIDTHS.action} color="white" textAlign="center">
                  Execution
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {complaints.map((c, index) => {
                const statusList = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
                const currentIndex = statusList.indexOf(c.status);

                return (
                  <Tr
                    key={c.complaint_id}
                    bg={index % 2 === 0 ? "white" : "gray.50"}
                    h="70px"
                  >
                    <Td>
                      <Text fontWeight="800" fontSize="sm" color="blue.600">
                        {c.complaint_id}
                      </Text>
                    </Td>

                    <Td>
                      <Text
                        fontSize="lg"
                        color="gray.700"
                        fontWeight="600"
                        lineHeight="tall"
                      >
                        {c.complaint_description}
                      </Text>
                    </Td>

                    <Td>
                      <Select
                        size="md"
                        h="44px"
                        fontSize="sm"
                        borderRadius="md"
                        value={c.tempStatus || c.status}
                        onChange={(e) => {
                          const updated = complaints.map((item) =>
                            item.complaint_id === c.complaint_id
                              ? { ...item, tempStatus: e.target.value }
                              : item,
                          );
                          setComplaints(updated);
                        }}
                      >
                        {statusList.map((s, idx) => (
                          <option key={s} value={s} disabled={idx < currentIndex}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </Td>

                    <Td>
                      <Input
                        placeholder="Any Remarks"
                        size="md"
                        h="44px"
                        fontSize="lg"
                        value={c.remarks || ""}
                        onChange={(e) => {
                          const updated = complaints.map((item) =>
                            item.complaint_id === c.complaint_id
                              ? { ...item, remarks: e.target.value }
                              : item,
                          );
                          setComplaints(updated);
                        }}
                      />
                    </Td>

                    <Td textAlign="center">
                      <Button
                        size="md"
                        h="44px"
                        colorScheme="blue"
                        width="full"
                        leftIcon={<FiClipboard size="14" />}
                        isLoading={loadingId === c.complaint_id}
                        isDisabled={!c.tempStatus || c.tempStatus === c.status}
                        onClick={() =>
                          updateStatus(
                            c.complaint_id,
                            c.tempStatus,
                            c.status,
                            c.remarks,
                          )
                        }
                      >
                        Update
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>

          {complaints.length === 0 && (
            <Flex direction="column" align="center" py={24}>
              <Icon as={FiClipboard} w={16} h={16} color="gray.100" mb={4} />
              <Text color="gray.400" fontWeight="700" fontSize="lg">
                Queue Clear
              </Text>
              <Text color="gray.400" fontSize="sm">
                No pending assignments found.
              </Text>
            </Flex>
          )}
        </Box>
      </Container>
    </Box>
  );
}

const VStack = ({ children, ...props }) => (
  <Flex direction="column" {...props}>
    {children}
  </Flex>
);

export default EmployeeDashboard;

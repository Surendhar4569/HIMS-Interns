import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Button,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import Employee from "./employee";

function EmployeeRecords() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("http://localhost:3000/employee/getEmployees");
    const result = await res.json();
    setEmployees(result.data || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    await fetch(`http://localhost:3000/employee/deleteEmployee/${id}`, {
      method: "DELETE",
    });

    setEmployees((prev) =>
      prev.filter((emp) => emp.employee_id !== id)
    );

    toast({ title: "Deleted Successfully", status: "info" });
  };

  const handleUpdate = (data, isEdit) => {
    if (isEdit) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === data.employee_id ? data : emp
        )
      );
    } else {
      setEmployees((prev) => [...prev, data]);
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setTabIndex(0);
  };

  return (
    <Box p={8} bg="gray.50" minH="100vh">
      <Heading size="lg" mb={6} textAlign="center">
        Employee Records
      </Heading>

      <Tabs
        index={tabIndex}
        onChange={(i) => setTabIndex(i)}
        variant="soft-rounded"
        colorScheme="blue"
        isFitted
      >
        <TabList>
          <Tab>Registration Form</Tab>
          <Tab>Employee List</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Employee
              selectedEmployee={selectedEmployee}
              onUpdate={handleUpdate}
            />
          </TabPanel>

          <TabPanel>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Designation</Th>
                  <Th>DOB</Th>
                  <Th>Department</Th>
                  <Th>Contact</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {employees.map((e) => (
                  <Tr key={e.employee_id}>
                    <Td>{e.employee_name}</Td>
                    <Td>{e.designation}</Td>
                    <Td>{e.dob}</Td>
                    <Td>{e.department}</Td>
                    <Td>{e.contact_number}</Td>
                    <Td>
                      <Flex gap={3}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleEditClick(e)}
                        >
                          Update
                        </Button>

                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() =>
                            handleDelete(e.employee_id)
                          }
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default EmployeeRecords;
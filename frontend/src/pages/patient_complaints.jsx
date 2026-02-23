import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";

export default function PatientComplaints() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    complaint_id: "",
    patient_id: "",
    patient_name: "",
    contact_number: "",
    priority: "",
    complaint_description: "",
  });

  const [errors, setErrors] = useState({});

  //  Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers for specific fields
    if (
      name === "complaint_id" ||
      name === "patient_id" ||
      name === "contact_number"
    ) {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  //  Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.complaint_id.trim()) {
      newErrors.complaint_id = "Complaint ID is required";
    }

    if (!formData.patient_id.trim()) {
      newErrors.patient_id = "Patient ID is required";
    }

    if (!formData.patient_name.trim()) {
      newErrors.patient_name = "Patient Name is required";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Enter valid 10-digit number";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!formData.complaint_description.trim()) {
      newErrors.complaint_description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //  Reset Form
  const resetForm = () => {
    setFormData({
      complaint_id: "",
      patient_id: "",
      patient_name: "",
      contact_number: "",
      priority: "",
      complaint_description: "",
    });

    setErrors({});
  };

  //  Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        complaint_datetime: new Date().toISOString(), // Auto timestamp
      };

      const response = await fetch("http://localhost:3000/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: "Complaint Submitted",
          description: "Complaint saved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        resetForm();
      } else {
        throw new Error("Error submitting complaint");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex="1" display="flex" justifyContent="center" alignItems="center">
      <Container maxW="5xl" bg="white" p={8} borderRadius="2xl" boxShadow="xl">
        <Box mb={8}>
          <Heading size="lg">Add New Complaint</Heading>
          <Text color="gray.500" mt={1}>
            Enter complaint details to create a new record
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">

            {/* Row 1 */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>

              <GridItem>
                <FormControl isRequired isInvalid={errors.complaint_id}>
                  <FormLabel>Complaint ID</FormLabel>
                  <Input
                    name="complaint_id"
                    value={formData.complaint_id}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                  <FormErrorMessage>{errors.complaint_id}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={errors.patient_id}>
                  <FormLabel>Patient ID</FormLabel>
                  <Input
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                  <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={errors.patient_name}>
                  <FormLabel>Patient Name</FormLabel>
                  <Input
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
                </FormControl>
              </GridItem>

            </Grid>

            {/* Row 2 */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>

              <GridItem>
                <FormControl isRequired isInvalid={errors.contact_number}>
                  <FormLabel>Contact Number</FormLabel>
                  <Input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    inputMode="numeric"
                  />
                  <FormErrorMessage>{errors.contact_number}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={errors.priority}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    placeholder="Select priority"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                  <FormErrorMessage>{errors.priority}</FormErrorMessage>
                </FormControl>
              </GridItem>

            </Grid>

            {/* Description */}
            <FormControl isRequired isInvalid={errors.complaint_description}>
              <FormLabel>Complaint Description</FormLabel>
              <Textarea
                rows={4}
                name="complaint_description"
                value={formData.complaint_description}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.complaint_description}</FormErrorMessage>
            </FormControl>

            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={loading}
                isDisabled={loading}
              >
                Submit Complaint
              </Button>
            </Box>

          </VStack>
        </form>
      </Container>
    </Box>
  );
}
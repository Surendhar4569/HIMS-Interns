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
  const [fileKey, setFileKey] = useState(Date.now());

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    contact_number: "",
    priority: "",
    status: "",
    attachment_path: null,
    complaint_description: "",
  });

  const [errors, setErrors] = useState({});

  // 🔥 Handle Input Change with Validations
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers for ID & contact
    if (name === "patient_id" || name === "contact_number") {
      if (!/^\d*$/.test(value)) return;
    }

    // 🚫 Prevent numbers & special chars in patient_name
    if (name === "patient_name") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, attachment_path: file });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

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

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (!formData.complaint_description.trim()) {
      newErrors.complaint_description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      patient_id: "",
      patient_name: "",
      contact_number: "",
      priority: "",
      status: "",
      attachment_path: null,
      complaint_description: "",
    });

    setFileKey(Date.now()); // reset file input
    setErrors({});
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formPayload = new FormData();

      formPayload.append("patient_id", formData.patient_id);
      formPayload.append("patient_name", formData.patient_name);
      formPayload.append("contact_number", formData.contact_number);
      formPayload.append("priority", formData.priority);
      formPayload.append("status", formData.status);
      formPayload.append("complaint_description", formData.complaint_description);

      if (formData.attachment_path) {
        formPayload.append("attachment_path", formData.attachment_path);
      }

      const response = await fetch(
        "http://localhost:3000/complaints/postComplaint",
        {
          method: "POST",
          body: formPayload,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Complaint Submitted",
          description: result.message || "Complaint saved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        resetForm();
      } else {
        throw new Error(result.message || "Error submitting complaint");
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
    <Box flex="1" display="flex" justifyContent="center" alignItems="center" py={10}>
      <Container maxW="5xl" bg="white" p={8} borderRadius="2xl" boxShadow="xl">
        <Box mb={8}>
          <Heading size="lg">Add New Complaint</Heading>
          <Text color="gray.500" mt={1}>
            Enter complaint details to create a new record
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl isRequired isInvalid={!!errors.patient_id}>
                  <FormLabel>Patient ID</FormLabel>
                  <Input
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={!!errors.patient_name}>
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

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl isRequired isInvalid={!!errors.contact_number}>
                  <FormLabel>Contact Number</FormLabel>
                  <Input
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                  />
                  <FormErrorMessage>{errors.contact_number}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={!!errors.priority}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">Select priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                  <FormErrorMessage>{errors.priority}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl isRequired isInvalid={!!errors.status}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Select status</option>
                    <option value="New">New</option>
                    <option value="Open">Open</option>
                  </Select>
                  <FormErrorMessage>{errors.status}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <Input
                    key={fileKey}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    variant="unstyled"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired isInvalid={!!errors.complaint_description}>
              <FormLabel>Complaint Description</FormLabel>
              <Textarea
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
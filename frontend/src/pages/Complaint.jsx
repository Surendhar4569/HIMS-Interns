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

export default function AddComplaint() {
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    patient_id: "",
    contact_number: "",
    priority: "",
    complaint_description: "",
    complaint_datetime: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for a field when user starts typing again
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.patient_id.trim()) newErrors.patient_id = "Patient ID is required";
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Enter valid 10-digit number";
    }
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.complaint_description.trim()) newErrors.complaint_description = "Description is required";
    if (!formData.complaint_datetime) newErrors.complaint_datetime = "Date & Time required";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      console.log("Submitting to Backend:", formData);
      
      toast({
        title: "Complaint Submitted.",
        description: "We've logged the complaint for Patient " + formData.patient_id,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setFormData({
        patient_id: "",
        contact_number: "",
        priority: "",
        complaint_description: "",
        complaint_datetime: "",
      });
      setErrors({});
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={6} display="flex" alignItems="center">
      <Container maxW="5xl" bg="white" p={8} borderRadius="2xl" boxShadow="xl">
        <Box mb={8}>
          <Heading size="lg" color="gray.800">Add New Complaint</Heading>
          <Text color="gray.500" mt={1}>Enter complaint details to create a new record</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            
            {/* Top Row: IDs and Name */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl isDisabled>
                  <FormLabel fontSize="sm" fontWeight="medium">Complaint ID</FormLabel>
                  <Input placeholder="Auto-generated" bg="gray.100" />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={!!errors.patient_id}>
                  <FormLabel fontSize="sm" fontWeight="medium">Patient ID</FormLabel>
                  <Input
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    placeholder="Enter Patient ID"
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isDisabled>
                  <FormLabel fontSize="sm" fontWeight="medium">Patient Name</FormLabel>
                  <Input placeholder="Auto-filled" bg="gray.100" />
                </FormControl>
              </GridItem>
            </Grid>

            {/* Second Row: Contact and Priority */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl isRequired isInvalid={!!errors.contact_number}>
                  <FormLabel fontSize="sm" fontWeight="medium">Contact Number</FormLabel>
                  <Input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.contact_number}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={!!errors.priority}>
                  <FormLabel fontSize="sm" fontWeight="medium">Priority</FormLabel>
                  <Select
                    name="priority"
                    placeholder="Select priority"
                    value={formData.priority}
                    onChange={handleChange}
                    focusBorderColor="blue.500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                  <FormErrorMessage>{errors.priority}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Third Row: Description */}
            <FormControl isRequired isInvalid={!!errors.complaint_description}>
              <FormLabel fontSize="sm" fontWeight="medium">Complaint Description</FormLabel>
              <Textarea
                rows={4}
                name="complaint_description"
                value={formData.complaint_description}
                onChange={handleChange}
                focusBorderColor="blue.500"
              />
              <FormErrorMessage>{errors.complaint_description}</FormErrorMessage>
            </FormControl>

            {/* Fourth Row: File and Date */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">Attachment (Optional)</FormLabel>
                  <Input type="file" p={1} bg="gray.50" />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired isInvalid={!!errors.complaint_datetime}>
                  <FormLabel fontSize="sm" fontWeight="medium">Date & Time</FormLabel>
                  <Input
                    type="datetime-local"
                    name="complaint_datetime"
                    value={formData.complaint_datetime}
                    onChange={handleChange}
                    focusBorderColor="blue.500"
                  />
                  <FormErrorMessage>{errors.complaint_datetime}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>

            <Box display="flex" justifyContent="flex-end" pt={4}>
              <Button type="submit" colorScheme="blue" size="lg" px={10}>
                Submit Complaint
              </Button>
            </Box>
          </VStack>
        </form>
      </Container>
    </Box>
  );
}






import { useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Button,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  useToast,
} from "@chakra-ui/react";

function PatientFeedback() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [moduleErrors, setModuleErrors] = useState({});

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",
    service_type: "",
    rating: "",
    consent_flag: "",
    feedback_comments: "",
  });

  // Module ratings (Production-ready structure)
  const [modules, setModules] = useState([
    { module_name: "Registration", rating: "", comment: "" },
    { module_name: "Doctor Consultation", rating: "", comment: "" },
    { module_name: "Billing", rating: "", comment: "" },
  ]);

  // Numeric field handler
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Normal change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // Module change handler
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value;
    setModules(updatedModules);

    if (moduleErrors[index]?.[field]) {
      const updatedErrors = { ...moduleErrors };
      updatedErrors[index][field] = null;
      setModuleErrors(updatedErrors);
    }
  };

  // Validation
  const validate = () => {
    let newErrors = {};
    let newModuleErrors = {};

    if (!formData.patient_id) newErrors.patient_id = "Required";
    if (!formData.patient_name) newErrors.patient_name = "Required";
    if (!formData.admission_id) newErrors.admission_id = "Required";
    if (!formData.service_type) newErrors.service_type = "Required";
    if (!formData.rating) newErrors.rating = "Required";
    if (!formData.consent_flag) newErrors.consent_flag = "Required";
    if (!formData.feedback_comments.trim())
      newErrors.feedback_comments = "Required";

    modules.forEach((module, index) => {
      let moduleError = {};
      if (!module.rating) moduleError.rating = "Required";
      if (!module.comment.trim()) moduleError.comment = "Required";

      if (Object.keys(moduleError).length > 0) {
        newModuleErrors[index] = moduleError;
      }
    });

    setErrors(newErrors);
    setModuleErrors(newModuleErrors);

    return (
      Object.keys(newErrors).length === 0 &&
      Object.keys(newModuleErrors).length === 0
    );
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      patient_name: "",
      admission_id: "",
      service_type: "",
      rating: "",
      consent_flag: "",
      feedback_comments: "",
    });

    setModules([
      { module_name: "Registration", rating: "", comment: "" },
      { module_name: "Doctor Consultation", rating: "", comment: "" },
      { module_name: "Billing", rating: "", comment: "" },
    ]);

    setErrors({});
    setModuleErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/feedback/postFeedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            feedback_mode: "Online",
            module_ratings: modules,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        resetForm();
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100" p={6}>
      <Box
        ml="250px" 
        maxW="1000px"
        w="100%"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
      >
        <Heading size="lg" mb={2}>
          Patient Experience Feedback
        </Heading>
        <Text color="gray.500" mb={6}>
          Hospital Quality Assessment Form
        </Text>

        <form onSubmit={handleSubmit}>
          {/* Patient Info Section */}
          <Heading size="md" mb={4}>
            Patient Details
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <FormControl isRequired isInvalid={errors.patient_id}>
                <FormLabel>Patient ID</FormLabel>
                <Input
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleNumberChange}
                />
                <FormErrorMessage>
                  {errors.patient_id}
                </FormErrorMessage>
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
                <FormErrorMessage>
                  {errors.patient_name}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired isInvalid={errors.admission_id}>
                <FormLabel>Admission ID</FormLabel>
                <Input
                  name="admission_id"
                  value={formData.admission_id}
                  onChange={handleNumberChange}
                />
                <FormErrorMessage>
                  {errors.admission_id}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired isInvalid={errors.service_type}>
                <FormLabel>Service Type</FormLabel>
                <Select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  placeholder="Select Service"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Pharmacy">Pharmacy</option>
                </Select>
                <FormErrorMessage>
                  {errors.service_type}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <Divider my={8} />

          {/* Overall Feedback */}
          <Heading size="md" mb={4}>
            Overall Feedback
          </Heading>

          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <FormControl isRequired isInvalid={errors.rating}>
                <FormLabel>Overall Rating</FormLabel>
                <Select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="Select Rating"
                >
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </Select>
                <FormErrorMessage>{errors.rating}</FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired isInvalid={errors.consent_flag}>
                <FormLabel>Consent for Data Usage</FormLabel>
                <Select
                  name="consent_flag"
                  value={formData.consent_flag}
                  onChange={handleChange}
                  placeholder="Select Consent"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Select>
                <FormErrorMessage>
                  {errors.consent_flag}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl
                isRequired
                isInvalid={errors.feedback_comments}
              >
                <FormLabel>Overall Comments</FormLabel>
                <Textarea
                  name="feedback_comments"
                  value={formData.feedback_comments}
                  onChange={handleChange}
                />
                <FormErrorMessage>
                  {errors.feedback_comments}
                </FormErrorMessage>
              </FormControl>
            </GridItem>
          </Grid>

          <Divider my={8} />

          {/* Module Ratings */}
          <Heading size="md" mb={4}>
            Module-wise Ratings
          </Heading>

          {modules.map((module, index) => (
            <Box
              key={index}
              p={5}
              borderWidth="1px"
              borderRadius="md"
              mb={5}
              bg="gray.50"
            >
              <Heading size="sm" mb={4}>
                {module.module_name}
              </Heading>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl
                  isRequired
                  isInvalid={moduleErrors[index]?.rating}
                >
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={module.rating}
                    onChange={(e) =>
                      handleModuleChange(
                        index,
                        "rating",
                        e.target.value
                      )
                    }
                    placeholder="Select Rating"
                  >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Select>
                  <FormErrorMessage>
                    {moduleErrors[index]?.rating}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isRequired
                  isInvalid={moduleErrors[index]?.comment}
                >
                  <FormLabel>Comment</FormLabel>
                  <Input
                    value={module.comment}
                    onChange={(e) =>
                      handleModuleChange(
                        index,
                        "comment",
                        e.target.value
                      )
                    }
                  />
                  <FormErrorMessage>
                    {moduleErrors[index]?.comment}
                  </FormErrorMessage>
                </FormControl>
              </Grid>
            </Box>
          ))}

          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            width="250px"
            isLoading={loading}
          >
            Submit Feedback
          </Button>
        </form>
      </Box>
    </Flex>
  );
}

export default PatientFeedback;
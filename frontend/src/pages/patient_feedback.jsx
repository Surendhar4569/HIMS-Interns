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
  useToast,
} from "@chakra-ui/react";

function PatientFeedback() {
  const toast = useToast();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",   
    service_type: "",
    rating: "",
    consent_flag: "",
    feedback_comments: "",
  });

  const handleNumberChange = (e) => {
    const { name, value } = e.target;

    if (/^\d*$/.test(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  //  Validation
  const validate = () => {
    let newErrors = {};

    if (!formData.patient_id)
      newErrors.patient_id = "Patient ID is required";

    if (!formData.patient_name)
      newErrors.patient_name = "Patient Name is required";

    if (!formData.admission_id)
      newErrors.admission_id = "Admission ID is required";

    if (!formData.service_type)
      newErrors.service_type = "Service Type is required";

    if (!formData.rating)
      newErrors.rating = "Rating is required";

    if (!formData.consent_flag)
      newErrors.consent_flag = "Consent selection is required";

    if (!formData.feedback_comments.trim())
      newErrors.feedback_comments = "Feedback comments are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/feedback/postFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          feedback_mode: "Online"   // add this
    })
      });
      console.log(res);
      
      if (res.ok) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        resetForm();
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast({
        title: "Server Error",
        description: "Unable to submit feedback",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={6}>
      <Box
        maxW="900px"
        w="100%"
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg="white"
      >
        <Heading size="lg" mb={2}>
          Feedback Capture Form
        </Heading>

        <Text color="gray.500" mb={6}>
          Capture patient experience feedback after service
        </Text>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>

            {/* Patient ID */}
            <GridItem>
              <FormControl isRequired isInvalid={errors.patient_id}>
                <FormLabel>Patient ID</FormLabel>
                <Input
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleNumberChange}
                />
                <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Patient Name */}
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

            {/* Admission ID */}
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

            {/* Service Type */}
            <GridItem>
              <FormControl isRequired isInvalid={errors.service_type}>
                <FormLabel>Service Type</FormLabel>
                <Select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  placeholder="Select Service Type"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Diagnostic">Diagnostic</option>
                  <option value="Pharmacy">Pharmacy</option>
                </Select>
                <FormErrorMessage>{errors.service_type}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Rating */}
            <GridItem>
              <FormControl isRequired isInvalid={errors.rating}>
                <FormLabel>Rating (1–5)</FormLabel>
                <Select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="Select Rating"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Select>
                <FormErrorMessage>{errors.rating}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Consent */}
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
                <FormErrorMessage>{errors.consent_flag}</FormErrorMessage>
              </FormControl>
            </GridItem>

            {/* Comments */}
            <GridItem colSpan={2}>
              <FormControl
                isRequired
                isInvalid={errors.feedback_comments}
              >
                <FormLabel>Feedback Comments</FormLabel>
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

          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            width="200px"
            isLoading={loading}
            isDisabled={loading}
          >
            Submit Feedback
          </Button>

        </form>
      </Box>
    </Flex>
  );
}

export default PatientFeedback;
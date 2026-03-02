import { useState, useEffect } from "react";
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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  useToast,
} from "@chakra-ui/react";

function PatientFeedback() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];

  const [availableModules, setAvailableModules] = useState(ALL_MODULES);
  const [selectedModule, setSelectedModule] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const [currentModuleData, setCurrentModuleData] = useState({
    rating: "",
    comment: "",
  });

  const [savedModules, setSavedModules] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",
    service_type: "",
    rating: "",
    consent_flag: "",
    feedback_comments: "",
  });

  // Clear module errors when all modules are finished
  useEffect(() => {
    if (savedModules.length === ALL_MODULES.length) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.modules;
        return updated;
      });
    }
  }, [savedModules]);

  // 🔥 Real-time filtering for IDs (Numbers only)
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) setErrors({ ...errors, [name]: null });
    }
  };

  // 🔥 Real-time filtering for Name (Letters only)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "patient_name") {
      if (!/^[A-Za-z\s]*$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSelectModule = (e) => {
    setSelectedModule(e.target.value);
    setCurrentModuleData({ rating: "", comment: "" });
    setEditingIndex(null);
  };

  const handleSaveModule = () => {
    if (!selectedModule || !currentModuleData.rating) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for the module.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    if (editingIndex !== null) {
      const updated = [...savedModules];
      updated[editingIndex] = {
        module_name: selectedModule,
        ...currentModuleData,
      };
      setSavedModules(updated);
      setEditingIndex(null);
    } else {
      setSavedModules([
        ...savedModules,
        { module_name: selectedModule, ...currentModuleData },
      ]);

      setAvailableModules(availableModules.filter((m) => m !== selectedModule));
    }

    setSelectedModule("");
    setCurrentModuleData({ rating: "", comment: "" });
  };

  const handleEditModule = (index) => {
    const module = savedModules[index];
    setSelectedModule(module.module_name);
    setCurrentModuleData({
      rating: module.rating,
      comment: module.comment,
    });
    setEditingIndex(index);
  };

  const handleDeleteModule = (index) => {
    const deleted = savedModules[index];
    setSavedModules(savedModules.filter((_, i) => i !== index));
    setAvailableModules([...availableModules, deleted.module_name]);
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.patient_id.trim()) newErrors.patient_id = "Patient ID is required";
    if (!formData.patient_name.trim()) newErrors.patient_name = "Patient Name is required";
    if (!formData.admission_id.trim()) newErrors.admission_id = "Admission ID is required";
    if (!formData.service_type) newErrors.service_type = "Service Type is required";
    if (!formData.rating) newErrors.rating = "Rating is required";
    if (!formData.consent_flag) newErrors.consent_flag = "Consent is required";

    if (savedModules.length < ALL_MODULES.length) {
      newErrors.modules = `Please complete feedback for all ${ALL_MODULES.length} modules`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/feedback/postFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          feedback_mode: "Online",
          module_ratings: savedModules,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your valuable feedback!",
          status: "success",
          duration: 3000,
        });

        // Reset Form
        setFormData({
          patient_id: "",
          patient_name: "",
          admission_id: "",
          service_type: "",
          rating: "",
          consent_flag: "",
          feedback_comments: "",
        });
        setSavedModules([]);
        setAvailableModules(ALL_MODULES);
        setSelectedModule("");
        setErrors({});
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100" p={6}>
      <Box ml="250px" maxW="1000px" w="100%" bg="white" p={8} borderRadius="lg" boxShadow="xl">
        <Heading size="lg" mb={2}>Patient Experience Feedback</Heading>
        <Text color="gray.500" mb={6}>Hospital Quality Assessment Form</Text>

        <form onSubmit={handleSubmit}>
          <Heading size="md" mb={4}>Patient Details</Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <FormControl isRequired isInvalid={!!errors.patient_id}>
              <FormLabel>Patient ID</FormLabel>
              <Input
                name="patient_id"
                value={formData.patient_id}
                onChange={handleNumberChange}
                placeholder="Numbers only"
              />
              <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.patient_name}>
              <FormLabel>Patient Name</FormLabel>
              <Input
                name="patient_name"
                value={formData.patient_name}
                onChange={handleChange}
                placeholder="Letters only"
              />
              <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.admission_id}>
              <FormLabel>Admission ID</FormLabel>
              <Input
                name="admission_id"
                value={formData.admission_id}
                onChange={handleNumberChange}
                placeholder="Numbers only"
              />
              <FormErrorMessage>{errors.admission_id}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.service_type}>
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
              <FormErrorMessage>{errors.service_type}</FormErrorMessage>
            </FormControl>
          </Grid>

          <Divider my={8} />

          <Heading size="md" mb={4}>Overall Feedback</Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <FormControl isRequired isInvalid={!!errors.rating}>
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

            <FormControl isRequired isInvalid={!!errors.consent_flag}>
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

            <FormControl gridColumn="span 2">
              <FormLabel>Overall Comments</FormLabel>
              <Textarea
                name="feedback_comments"
                value={formData.feedback_comments}
                onChange={handleChange}
              />
            </FormControl>
          </Grid>

          <Divider my={8} />
          <Heading size="md" mb={4}>Module-wise Feedback</Heading>

          <FormControl mb={4} isInvalid={!!errors.modules}>
            <FormLabel>Select Module</FormLabel>
            <Select
              placeholder="Choose Module"
              value={selectedModule}
              onChange={handleSelectModule}
            >
              {availableModules.map((module, index) => (
                <option key={index} value={module}>{module}</option>
              ))}
            </Select>
            <FormErrorMessage>{errors.modules}</FormErrorMessage>
          </FormControl>

          {selectedModule && (
            <Box p={5} borderWidth="1px" borderRadius="md" bg="gray.50" mb={5}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={currentModuleData.rating}
                    onChange={(e) =>
                      setCurrentModuleData({ ...currentModuleData, rating: e.target.value })
                    }
                    placeholder="Select Rating"
                  >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Comment</FormLabel>
                  <Input
                    value={currentModuleData.comment}
                    onChange={(e) =>
                      setCurrentModuleData({ ...currentModuleData, comment: e.target.value })
                    }
                  />
                </FormControl>
              </Grid>
              <Button mt={4} colorScheme="green" onClick={handleSaveModule}>
                ✔ Save Module
              </Button>
            </Box>
          )}

          {savedModules.map((module, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={3} bg="white">
              <Heading size="sm">{module.module_name}</Heading>
              <Text fontSize="sm">Rating: {module.rating} / 5</Text>
              {module.comment && <Text fontSize="sm">Comment: {module.comment}</Text>}
              <Flex mt={2} gap={2}>
                <Button size="xs" colorScheme="blue" onClick={() => handleEditModule(index)}>Edit</Button>
                <Button size="xs" colorScheme="red" onClick={() => handleDeleteModule(index)}>Delete</Button>
              </Flex>
            </Box>
          ))}

          <Text mt={2} mb={4} fontSize="sm" color={savedModules.length === ALL_MODULES.length ? "green.600" : "gray.600"} fontWeight="bold">
            Modules Completed: {savedModules.length} / {ALL_MODULES.length}
          </Text>

          <Button
            mt={2}
            w="full"
            colorScheme="blue"
            type="submit"
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
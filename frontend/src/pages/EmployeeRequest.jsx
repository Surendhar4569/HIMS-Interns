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
  GridItem,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";

function EmployeeRequest() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    request_number: "",
    request_category: "",
    request_title: "",
    requirement_description: "",
    related_module: "Billing",
    existing_feature_ref: "",
    priority: "",
    attachment: null,
  });

  const [errors, setErrors] = useState({});
  const [nextSequence, setNextSequence] = useState("001");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchNextRequestNumber();
  }, []);

  const fetchNextRequestNumber = async () => {
  try {
    const res = await fetch(
      "http://localhost:3000/request/getNextRequestNumber"
    );

    if (!res.ok) {
      console.error("API Error:", res.status);
      return;
    }

    const data = await res.json();

    // Store next serial sequence from backend (001, 002, etc.)
    const sequence = data.next_sequence || "001";
    setNextSequence(sequence);

    // Default preview before CR/AR selection
    setFormData((prev) => ({
      ...prev,
      request_number: sequence,
    }));
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};

  const handleChange = (e) => {
  const { name, value } = e.target;

  // File upload handling (unchanged)
  if (name === "attachment") {
    setFormData({ ...formData, attachment: e.target.files[0] });
    return;
  }

  // 🔥 Dynamic Request Number Logic (CR / AR)
  if (name === "request_category") {
    let previewNumber = nextSequence; // default = 001

    if (value === "CR") {
      previewNumber = `CR-${currentYear}-${nextSequence}`;
    } else if (value === "AR") {
      previewNumber = `AR-${currentYear}-${nextSequence}`;
    }

    setFormData({
      ...formData,
      request_category: value,
      request_number: previewNumber,
    });

    return;
  }

  // Normal field updates (title, description, priority, etc.)
  setFormData({
    ...formData,
    [name]: value,
  });
};

  const validate = () => {
    let newErrors = {};

    if (!formData.request_category)
      newErrors.request_category = "Category is required";

    if (!formData.request_title)
      newErrors.request_title = "Title is required";

    if (!formData.requirement_description)
      newErrors.requirement_description = "Description is required";

    if (!formData.priority)
      newErrors.priority = "Priority is required";

    if (
      formData.request_category === "CR" &&
      !formData.existing_feature_ref
    ) {
      newErrors.existing_feature_ref =
        "Existing Feature Reference is required for CR";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const res = await fetch(
        "http://localhost:3000/request/postRequest",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (res.ok) {
        toast({
          title: "Request Submitted",
          description: "Employee request created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        window.location.reload();
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
  console.error("Request submission failed:", error);

  toast({
    title: "Server Error",
    description: "Unable to submit request",
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
          Request (Employee)
        </Heading>

        <Text color="gray.500" mb={6}>
          Raise Change Requests / Additional Requirements
        </Text>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <FormControl>
                <FormLabel>Request Number</FormLabel>
                <Input value={formData.request_number} isReadOnly />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl
                isRequired
                isInvalid={errors.request_category}
              >
                <FormLabel>Request Category</FormLabel>
                <Select
                  name="request_category"
                  placeholder="Select CR / AR"
                  onChange={handleChange}
                >
                  <option value="CR">Change Request (CR)</option>
                  <option value="AR">Additional Requirement (AR)</option>
                </Select>
                <FormErrorMessage>
                  {errors.request_category}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl
                isRequired
                isInvalid={errors.request_title}
              >
                <FormLabel>Request Title</FormLabel>
                <Input
                  name="request_title"
                  onChange={handleChange}
                />
                <FormErrorMessage>
                  {errors.request_title}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl isRequired>
                <FormLabel>Requirement Description</FormLabel>
                  <Textarea
                    name="requirement_description"
                    placeholder="Describe the change request or additional requirement in detail"
                    value={formData.requirement_description}
                    onChange={handleChange}
                    rows={4}
                  />
                  <FormErrorMessage>
      {             errors.requirement_description}
                  </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Related Module</FormLabel>
                <Select
                  name="related_module"
                  onChange={handleChange}
                  defaultValue="Billing"
                >
                  <option value="Billing">Billing</option>
                </Select>
              </FormControl>
            </GridItem>

            {formData.request_category === "CR" && (
              <GridItem>
                <FormControl
                  isRequired
                  isInvalid={errors.existing_feature_ref}
                >
                  <FormLabel>Existing Feature Ref</FormLabel>
                  <Input
                    name="existing_feature_ref"
                    onChange={handleChange}
                  />
                  <FormErrorMessage>
                    {errors.existing_feature_ref}
                  </FormErrorMessage>
                </FormControl>
              </GridItem>
            )}

            <GridItem>
              <FormControl
                isRequired
                isInvalid={errors.priority}
              >
                <FormLabel>Priority</FormLabel>
                <Select
                  name="priority"
                  placeholder="Select Priority"
                  onChange={handleChange}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </Select>
                <FormErrorMessage>
                  {errors.priority}
                </FormErrorMessage>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Attachment (Optional)</FormLabel>
                <Input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                />
              </FormControl>
            </GridItem>
          </Grid>

          <Button
            mt={6}
            colorScheme="blue"
            type="submit"
            width="220px"
            isLoading={loading}
          >
            Submit Request
          </Button>
        </form>
      </Box>
    </Flex>
  );
}

export default EmployeeRequest;
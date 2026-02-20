import { useState } from "react"
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
  useToast,
} from "@chakra-ui/react"

function PatientFeedback() {
  const toast = useToast()

  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    visit_id_admission_id: "",
    service_type: "OPD",
    rating: "5",
    consent_flag: "Yes",
    feedback_comments: "",
    created_date: new Date().toLocaleString(),
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch("http://localhost:3000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: "Feedback Submitted",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Server Error",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={6}>
      <Box maxW="900px" w="100%" p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
        <Heading size="lg" mb={2}>
          Feedback Capture Form
        </Heading>

        <Text color="gray.500" mb={6}>
          Capture patient experience feedback after service
        </Text>

        <form onSubmit={handleSubmit}>
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            <GridItem>
              <FormControl isRequired>
                <FormLabel>Patient ID</FormLabel>
                <Input name="patient_id" value={formData.patient_id} onChange={handleChange} />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Patient Name</FormLabel>
                <Input name="patient_name" value={formData.patient_name} onChange={handleChange} />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired>
                <FormLabel>Visit / Admission ID</FormLabel>
                <Input name="visit_id_admission_id" value={formData.visit_id_admission_id} onChange={handleChange} />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Service Type</FormLabel>
                <Select name="service_type" value={formData.service_type} onChange={handleChange}>
                  <option>OPD</option>
                  <option>IPD</option>
                  <option>Diagnostic</option>
                  <option>Pharmacy</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Rating (1–5)</FormLabel>
                <Select name="rating" value={formData.rating} onChange={handleChange}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl>
                <FormLabel>Consent for Data Usage</FormLabel>
                <Select name="consent_flag" value={formData.consent_flag} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Feedback Comments</FormLabel>
                <Textarea name="feedback_comments" value={formData.feedback_comments} onChange={handleChange} />
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel>Created Date</FormLabel>
                <Input value={formData.created_date} isReadOnly />
              </FormControl>
            </GridItem>
          </Grid>

          <Button mt={6} colorScheme="blue" type="submit" width="200px">
            Submit Feedback
          </Button>
        </form>
      </Box>
    </Flex>
  )
}

export default PatientFeedback

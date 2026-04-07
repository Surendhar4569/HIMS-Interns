import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Select,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useToast,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Wrap,
  WrapItem,
  Tag,
  Textarea,
  TagLabel,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon, EditIcon, InfoIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { patientApi, encounterApi } from "../services/neurologyApi";
import { useNeurology } from "../context/NeurologyContext";
import { calculateAge, formatDate } from "../services/neurologyHelpers";
import { useLocation } from "react-router-dom";

const NeurologyRecords = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setEditMode } = useNeurology();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [encounters, setEncounters] = useState([]);
  const [selectedEncounter, setSelectedEncounter] = useState("");
  const [encounterData, setEncounterData] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEncounters, setLoadingEncounters] = useState(false);
  const [loadingEncounterData, setLoadingEncounterData] = useState(false);




const location = useLocation();


useEffect(() => {
    fetchPatients();
    
    // If we have a selected encounter and just came back from an update
    if (selectedEncounter) {
        fetchEncounterDetails(selectedEncounter);
    }
}, [location.state?.refresh]); 

// Effect for when the patient changes
useEffect(() => {
    if (selectedPatient) {
        fetchPatientEncounters(selectedPatient);
    } else {
        setEncounters([]);
        setSelectedEncounter("");
        setEncounterData(null);
    }
}, [selectedPatient]);

// Effect for when a specific encounter date is chosen from the dropdown
useEffect(() => {
    if (selectedEncounter) {
        fetchEncounterDetails(selectedEncounter);
    } else {
        setEncounterData(null);
    }
}, [selectedEncounter]);
  const handleEditClick = (encounter) => {
    
    setEditMode(encounterData, encounter.encounter_id, encounter.patient_id);
    navigate("/neurologyForm");
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const response = await patientApi.getAllPatients(1, 100);
      setPatients(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        status: "error",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchPatientEncounters = async (patientId) => {
    setLoadingEncounters(true);
    try {
      const response = await encounterApi.getPatientEncounters(patientId);
      setEncounters(response.data || []);
      if (response.data?.length > 0) {
        setSelectedEncounter(response.data[0].encounter_id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient encounters",
        status: "error",
      });
    } finally {
      setLoadingEncounters(false);
    }
  };

  const fetchEncounterDetails = async (encounterId) => {
    setLoadingEncounterData(true);
    try {
      const response = await encounterApi.getFullEncounterDetails(encounterId);
      setEncounterData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load encounter details",
        status: "error",
      });
    } finally {
      setLoadingEncounterData(false);
    }
  };

  if (loadingPatients) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4} justify="center" minH="60vh">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Loading neurology database...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="left">
          <Heading color="blue.700" mb={2}>
            Neurology Patient Records
          </Heading>
          <Text color="gray.600">
            Comprehensive patient history and clinical assessment data
          </Text>
        </Box>

        {/* Selection Card */}
        <Card variant="outline" boxShadow="sm">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontWeight="bold" fontSize="lg">
                  Select Patient
                </FormLabel>
                <Select
                  placeholder="Choose a patient"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  size="lg"
                  bg="white"
                >
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.patient_name} - {p.patient_id} ({calculateAge(p.dob)}{" "}
                      yrs)
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedPatient && (
                <FormControl>
                  <FormLabel fontWeight="bold" fontSize="lg">
                    Select Encounter{" "}
                    {encounters.length > 0 && `(${encounters.length} found)`}
                  </FormLabel>
                  {loadingEncounters ? (
                    <HStack spacing={2}>
                      <Spinner size="sm" />
                      <Text>Loading history...</Text>
                    </HStack>
                  ) : (
                    <Select
                      placeholder="Choose an encounter date"
                      value={selectedEncounter}
                      onChange={(e) => setSelectedEncounter(e.target.value)}
                      size="lg"
                      bg="white"
                    >
                      {encounters.map((e) => (
                        <option key={e.encounter_id} value={e.encounter_id}>
                          {formatDate(e.encounter_date)} - Visit ID:{" "}
                          {e.visit_id}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Header Info Bar */}
        {selectedEncounter && encounterData && !loadingEncounterData && (
          <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
            <CardBody py={3}>
              <HStack justify="space-between" wrap="wrap" spacing={4}>
                <HStack spacing={10}>
                  <HStack spacing={3}>
                    <CalendarIcon mb={1.5}color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="blue.600" fontWeight="bold">
                        ENCOUNTER DATE
                      </Text>
                      <Text fontWeight="bold">
                        {formatDate(encounterData.encounter?.encounter_date)}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack spacing={3}>
                    <TimeIcon mb={1.5} color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="blue.600" fontWeight="bold">
                        VISIT ID
                      </Text>
                      <Text fontWeight="bold">
                        {encounterData.encounter?.visit_id || "N/A"}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="blue"
                  onClick={() => handleEditClick(encounterData.encounter)}
                >
                  Edit This Encounter
                </Button>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Loading Encounter Data */}
        {loadingEncounterData && (
          <Alert status="info" borderRadius="lg">
            <Spinner size="sm" mr={3} />
            Loading encounter details...
          </Alert>
        )}

        {/* Main Content Tabs */}
        {encounterData && !loadingEncounterData && (
          <Card>
            <CardBody p={0}>
              <Tabs isLazy colorScheme="blue" variant="enclosed">
                <TabList overflowX="auto" px={4} pt={4} bg="gray.50">
                  <Tab fontWeight="medium">Patient Info</Tab>
                  <Tab fontWeight="medium">Symptoms & Complaints</Tab>
                  <Tab fontWeight="medium">Neurological Exam</Tab>
                  <Tab fontWeight="medium">Investigations</Tab>
                  <Tab fontWeight="medium">Analysis</Tab>
                  <Tab fontWeight="medium">Diagnosis</Tab>
                  <Tab fontWeight="medium">Management</Tab>
                  <Tab fontWeight="medium">Notes & Referrals</Tab>
                </TabList>

                <TabPanels>
                  {/* TAB 1: Patient Info - Demographics & History */}
                  <TabPanel py={6}>
                    <VStack spacing={6} align="stretch">
                      {/* Patient Demographics */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Patient Demographics</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                            <Stat>
                              <StatLabel>Patient Name</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.patient_name}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Patient ID</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.patient_id}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>MRN</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.mrn || "N/A"}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Date of Birth</StatLabel>
                              <StatNumber fontSize="md">
                                {formatDate(encounterData.encounter?.dob)}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Age</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.age || calculateAge(encounterData.encounter?.dob)} yrs
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Gender</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.gender}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Contact</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.contact_number ||
                                  "N/A"}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Email</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.email || "N/A"}
                              </StatNumber>
                            </Stat>
                          </SimpleGrid>
                          {encounterData.encounter?.address && (
                            <Text mt={2} fontSize="sm">
                              <strong>Address:</strong>{" "}
                              {encounterData.encounter.address}
                            </Text>
                          )}
                        </CardBody>
                      </Card>

                      {/* Physical Metrics */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Physical Metrics</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                            <Stat>
                              <StatLabel>Height</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.height_cm
                                  ? `${encounterData.encounter.height_cm} cm`
                                  : "N/A"}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Weight</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.weight_kg
                                  ? `${encounterData.encounter.weight_kg} kg`
                                  : "N/A"}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>BMI</StatLabel>
                              <StatNumber fontSize="md">
                                {encounterData.encounter?.bmi || "N/A"}
                              </StatNumber>
                              {encounterData.encounter?.bmi && (
                                <StatHelpText>
                                  <StatArrow
                                    type={
                                      encounterData.encounter.bmi > 25
                                        ? "increase"
                                        : encounterData.encounter.bmi < 18.5
                                          ? "decrease"
                                          : "increase"
                                    }
                                  />
                                  {encounterData.encounter.bmi > 30
                                    ? "Obese"
                                    : encounterData.encounter.bmi > 25
                                      ? "Overweight"
                                      : encounterData.encounter.bmi < 18.5
                                        ? "Underweight"
                                        : "Normal"}
                                </StatHelpText>
                              )}
                            </Stat>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Medical History */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Medical History</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold">
                                Past Medical History:
                              </Text>
                              <Text>
                                {encounterData.encounter
                                  ?.past_medical_history || "None"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">
                                Past Surgical History:
                              </Text>
                              <Text>
                                {encounterData.encounter
                                  ?.past_surgical_history || "None"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Family History:</Text>
                              <Text>
                                {encounterData.encounter?.family_history ||
                                  "None"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Allergies:</Text>
                              <Text color="red.600">
                                {encounterData.encounter?.allergies || "None"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Social History - with lifestyle fields */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">
                            Social History & Lifestyle
                          </Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold">Occupation:</Text>
                              <Text>
                                {encounterData.encounter?.occupation || "N/A"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Smoking Status:</Text>
                              <Badge
                                colorScheme={
                                  encounterData.encounter?.smoking_status ===
                                  "Current"
                                    ? "red"
                                    : encounterData.encounter
                                          ?.smoking_status === "Former"
                                      ? "yellow"
                                      : "green"
                                }
                              >
                                {encounterData.encounter?.smoking_status ||
                                  "Never"}
                              </Badge>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Alcohol Use:</Text>
                              <Text>
                                {encounterData.encounter?.alcohol_use || "None"}
                              </Text>
                            </Box>
                            {/* <Box>
                              <Text fontWeight="bold">
                                Physical Activity Level:
                              </Text>
                              <Text>
                                {encounterData.encounter
                                  ?.physical_activity_level || "N/A"}
                              </Text>
                            </Box> */}
                            {/* <Box>
                              <Text fontWeight="bold">Sleep Pattern:</Text>
                              <Text>
                                {encounterData.encounter?.sleep_pattern ||
                                  "N/A"}
                              </Text>
                            </Box> */}
                            <Box gridColumn="span 2">
                              <Text fontWeight="bold">Social History:</Text>
                              <Text>
                                {encounterData.encounter?.social_history ||
                                  "None"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* TAB 2: Symptoms & Complaints - with seizures and overall severity */}
                  <TabPanel py={6}>
                    {encounterData.complaints ? (
                      <VStack spacing={4} align="stretch">
                        {/* Chief Complaint */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Chief Complaint</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text fontSize="md" fontWeight="medium">
                              {encounterData.complaints.chief_complaint}
                            </Text>
                            <SimpleGrid columns={3} mt={3} spacing={2}>
                              <Badge colorScheme="blue" p={2}>
                                Onset:{" "}
                                {formatDate(
                                  encounterData.complaints.onset_date,
                                ) || "N/A"}
                              </Badge>
                              <Badge colorScheme="green" p={2}>
                                Duration:{" "}
                                {encounterData.complaints.duration || "N/A"}
                              </Badge>
                              <Badge colorScheme="purple" p={2}>
                                Progression:{" "}
                                {encounterData.complaints.progression || "N/A"}
                              </Badge>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Headache Details */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Headache Details</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 2, md: 3 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Type:</Text>
                                <Text>
                                  {encounterData.headache?.headache_type ||
                                    "N/A"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Location:</Text>
                                <Text>
                                  {encounterData.headache?.headache_location ||
                                    "N/A"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Severity:</Text>
                                <Text>
                                  {encounterData.headache?.headache_severity
                                    ? `${encounterData.headache.headache_severity}/10`
                                    : "N/A"}
                                </Text>
                                {encounterData.headache?.headache_severity && (
                                  <Progress
                                    value={
                                      encounterData.headache.headache_severity *
                                      10
                                    }
                                    size="xs"
                                    mt={1}
                                    colorScheme={
                                      encounterData.headache
                                        .headache_severity <= 3
                                        ? "green"
                                        : encounterData.headache
                                              .headache_severity <= 6
                                          ? "yellow"
                                          : "red"
                                    }
                                  />
                                )}
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Duration:</Text>
                                <Text>
                                  {encounterData.headache?.headache_duration ||
                                    "N/A"}
                                </Text>
                              </Box>
                              <Box gridColumn="span 2">
                                <Text fontWeight="bold">Triggers:</Text>
                                <Text>
                                  {encounterData.headache?.headache_triggers ||
                                    "N/A"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Seizure Details - Separate Card */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <HStack>
                              <Heading size="sm" color="black.700">
                                Seizure Details
                              </Heading>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Seizures Present:</Text>
                                <Badge
                                  colorScheme={
                                    encounterData.complaints
                                      .seizures_present === "Yes"
                                      ? "red"
                                      : "green"
                                  }
                                >
                                  {encounterData.complaints.seizures_present ||
                                    "No"}
                                </Badge>
                              </Box>
                              {encounterData.complaints.seizures_present ===
                                "Yes" && (
                                <>
                                  <Box>
                                    <Text fontWeight="bold">Seizure Type:</Text>
                                    <Text>
                                      {encounterData.complaints.seizure_type ||
                                        "N/A"}
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold">
                                      Seizure Frequency:
                                    </Text>
                                    <Text>
                                      {encounterData.complaints
                                        .seizure_frequency || "N/A"}
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold">Last Seizure:</Text>
                                    <Text>
                                      {formatDate(
                                        encounterData.complaints
                                          .last_seizure_date,
                                      ) || "N/A"}
                                    </Text>
                                  </Box>
                                </>
                              )}
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Weakness Details */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm" color="black.700">
                              Weakness Details
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Weakness Present:</Text>
                                <Badge
                                  colorScheme={
                                    encounterData.complaints
                                      .weakness_present === "Yes"
                                      ? "orange"
                                      : "green"
                                  }
                                >
                                  {encounterData.complaints.weakness_present ||
                                    "No"}
                                </Badge>
                              </Box>
                              {encounterData.complaints.weakness_present ===
                                "Yes" && (
                                <>
                                  <Box>
                                    <Text fontWeight="bold">
                                      Weakness Side:
                                    </Text>
                                    <Text>
                                      {encounterData.complaints.weakness_side ||
                                        "N/A"}
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold">
                                      Weakness Pattern:
                                    </Text>
                                    <Text>
                                      {encounterData.complaints
                                        .weakness_pattern || "N/A"}
                                    </Text>
                                  </Box>
                                </>
                              )}
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Sensory Symptoms */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Card variant="outline">
                            <CardHeader bg="teal.50" py={3}>
                              <Heading size="sm">Sensory Symptoms</Heading>
                            </CardHeader>
                            <CardBody>
                              <Text>
                                <strong>Numbness:</strong>{" "}
                                {encounterData.complaints.numbness || "None"}
                              </Text>
                              <Text mt={2}>
                                <strong>Paresthesia:</strong>{" "}
                                {encounterData.complaints.paresthesia || "None"}
                              </Text>
                            </CardBody>
                          </Card>

                          <Card variant="outline">
                            <CardHeader bg="teal.50" py={3}>
                              <Heading size="sm">Speech & Vision</Heading>
                            </CardHeader>
                            <CardBody>
                              <Text>
                                <strong>Speech Changes:</strong>{" "}
                                {encounterData.complaints.speech_changes ||
                                  "None"}
                              </Text>
                              <Text mt={2}>
                                <strong>Vision Changes:</strong>{" "}
                                {encounterData.complaints.vision_changes ||
                                  "None"}
                              </Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Cognitive & Balance */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Card variant="outline">
                            <CardHeader bg="gray.50" py={3}>
                              <Heading size="sm">Cognitive Changes</Heading>
                            </CardHeader>
                            <CardBody>
                              <Text>
                                {encounterData.complaints.cognitive_changes ||
                                  "None"}
                              </Text>
                            </CardBody>
                          </Card>
                          <Card variant="outline">
                            <CardHeader bg="gray.50" py={3}>
                              <Heading size="sm">Balance Issues</Heading>
                            </CardHeader>
                            <CardBody>
                              <Text>
                                {encounterData.complaints.balance_issues ||
                                  "None"}
                              </Text>
                              <Text mt={2}>
                                <strong>Dizziness:</strong>{" "}
                                {encounterData.complaints.dizziness || "None"}
                              </Text>
                            </CardBody>
                          </Card>
                        </SimpleGrid>

                        {/* Overall Severity - Extra Card */}
                        <Card variant="outline" borderColor="red.200">
                          <CardHeader bg="red.50" py={3}>
                            <Heading size="sm" color="red.700">
                              Overall Severity Assessment
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            {(encounterData.complaints?.overall_severity ?? null) !==null ? (
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">Severity Level:</Text>
                                  <Text fontSize="lg" fontWeight="bold">
                                    {encounterData.complaints.overall_severity}
                                    /10
                                  </Text>
                                </HStack>
                                <Progress
                                  value={
                                    encounterData.complaints.overall_severity *
                                    10
                                  }
                                  size="lg"
                                  colorScheme={
                                    encounterData.complaints.overall_severity <=
                                    3
                                      ? "green"
                                      : encounterData.complaints
                                            .overall_severity <= 6
                                        ? "yellow"
                                        : "red"
                                  }
                                  borderRadius="full"
                                />
                                <Text fontSize="sm" color="gray.600">
                                  {encounterData.complaints.overall_severity <=
                                  3
                                    ? "Mild - Minimal impact on daily activities"
                                    : encounterData.complaints
                                          .overall_severity <= 6
                                      ? "Moderate - Significant impact on daily activities"
                                      : "Severe - Major impact, requires immediate attention"}
                                </Text>
                              </VStack>
                            ) : (
                              <Text color="gray.500">
                                No severity assessment recorded
                              </Text>
                            )}
                          </CardBody>
                        </Card>
                      </VStack>
                    ) : (
                      <Card>
                        <CardBody>
                          <Text>No complaint data available</Text>
                        </CardBody>
                      </Card>
                    )}
                  </TabPanel>

                  {/* TAB 3: Neurological Exam - ALL Fields */}
                  <TabPanel py={6}>
                    {encounterData.neuroExam ? (
                      <VStack spacing={4} align="stretch">
                        {/* Mental Status */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Mental Status</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Orientation:</Text>
                                <Text>
                                  {encounterData.neuroExam
                                    .mental_status_orientation || "Normal"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">
                                  Memory Registration:
                                </Text>
                                <Text>
                                  {encounterData.neuroExam
                                    .memory_registration || "Normal"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Memory Recall:</Text>
                                <Text>
                                  {encounterData.neuroExam.memory_recall ||
                                    "Normal"}
                                </Text>
                              </Box>
                              <Box gridColumn="span 2">
                                <Text fontWeight="bold">Cognition:</Text>
                                <Text>
                                  {encounterData.neuroExam.cognition ||
                                    "Normal"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Cranial Nerves */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Cranial Nerves</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>
                              {encounterData.neuroExam.cranial_nerve_findings ||
                                "Normal"}
                            </Text>
                          </CardBody>
                        </Card>

                        {/* Motor System */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Motor System</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 3 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Muscle Tone:</Text>
                                <Text>
                                  {encounterData.neuroExam.motor_tone ||
                                    "Normal"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Motor Power:</Text>
                                <Text>
                                  {encounterData.neuroExam.motor_power ||
                                    "Normal"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Muscle Bulk:</Text>
                                <Text>
                                  {encounterData.neuroExam.muscle_bulk ||
                                    "Normal"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Reflexes */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Reflexes</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 2, md: 4 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Biceps:</Text>
                                <Badge>
                                  {encounterData.neuroExam.reflexes_biceps ||
                                    "2+"}
                                </Badge>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Triceps:</Text>
                                <Badge>
                                  {encounterData.neuroExam.reflexes_triceps ||
                                    "2+"}
                                </Badge>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Knee:</Text>
                                <Badge>
                                  {encounterData.neuroExam.reflexes_knee ||
                                    "2+"}
                                </Badge>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Ankle:</Text>
                                <Badge>
                                  {encounterData.neuroExam.reflexes_ankle ||
                                    "2+"}
                                </Badge>
                              </Box>
                            </SimpleGrid>
                            <Text mt={3}>
                              <strong>Plantar Response:</strong>{" "}
                              {encounterData.neuroExam.plantar_response ||
                                "Normal"}
                            </Text>
                          </CardBody>
                        </Card>

                        {/* Sensory System */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Sensory System</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Pain:</Text>
                                <Text>
                                  {encounterData.neuroExam.sensory_pain ||
                                    "Intact"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Temperature:</Text>
                                <Text>
                                  {encounterData.neuroExam
                                    .sensory_temperature || "Intact"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Vibration:</Text>
                                <Text>
                                  {encounterData.neuroExam.sensory_vibration ||
                                    "Intact"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Proprioception:</Text>
                                <Text>
                                  {encounterData.neuroExam
                                    .sensory_proprioception || "Intact"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>

                        {/* Coordination & Gait */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Coordination & Gait</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Gait:</Text>
                                <Text>
                                  {encounterData.neuroExam.gait || "Normal"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Romberg Test:</Text>
                                <Text>
                                  {encounterData.neuroExam.romberg_test ||
                                    "Negative"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      </VStack>
                    ) : (
                      <Card>
                        <CardBody>
                          <Text>No neurological exam data available</Text>
                        </CardBody>
                      </Card>
                    )}
                  </TabPanel>

                  {/* TAB 4: Investigations */}
                  <TabPanel py={6}>
                    <VStack spacing={4} align="stretch">
                      {/* Imaging */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Imaging Studies</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold">CT Brain:</Text>
                              <Text>
                                {encounterData.imaging?.ct_brain || "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">MRI Brain:</Text>
                              <Text>
                                {encounterData.imaging?.mri_brain || "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">MR Angiography:</Text>
                              <Text>
                                {encounterData.imaging?.mr_angiography ||
                                  "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">MRI Spine:</Text>
                              <Text>
                                {encounterData.imaging?.mri_spine || "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Lumbar Puncture:</Text>
                              <Text>
                                {encounterData.imaging?.lumbar_puncture ||
                                  "Not done"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Electrophysiology */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Electrophysiology</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold">EEG:</Text>
                              <Text>
                                {encounterData.electrophysiology?.eeg_ordered ||
                                  "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">NCS:</Text>
                              <Text>
                                {encounterData.electrophysiology?.ncs_ordered ||
                                  "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">EMG:</Text>
                              <Text>
                                {encounterData.electrophysiology?.emg_ordered ||
                                  "Not done"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>

                      {/* Laboratory Tests */}
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Laboratory Tests</Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Box>
                              <Text fontWeight="bold">CBC Results:</Text>
                              <Text>
                                {encounterData.labs?.cbc_results || "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Thyroid Results:</Text>
                              <Text>
                                {encounterData.labs?.thyroid_results ||
                                  "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Autoimmune Results:</Text>
                              <Text>
                                {encounterData.labs?.autoimmune_results ||
                                  "Not done"}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold">Metabolic Panel:</Text>
                              <Text>
                                {encounterData.labs?.metabolic_panel ||
                                  "Not done"}
                              </Text>
                            </Box>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* TAB 5: Analysis - Separate Tab with all fields */}
                  <TabPanel py={6}>
                    <VStack spacing={4} align="stretch">
                      <Card variant="outline">
                        <CardHeader bg="blue.50" py={3}>
                          <Heading size="sm">Analysis & Findings</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <Box>
                              <Text fontWeight="bold">MRI Findings:</Text>
                              <Textarea
                                isReadOnly
                                value={
                                  encounterData.analysis?.mri_findings ||
                                  "No MRI findings recorded"
                                }
                                bg="gray.50"
                                rows={3}
                              />
                            </Box>
                            <Divider />
                            <Box>
                              <Text fontWeight="bold">EEG Results:</Text>
                              <Textarea
                                isReadOnly
                                value={
                                  encounterData.analysis?.eeg_results ||
                                  "No EEG results recorded"
                                }
                                bg="gray.50"
                                rows={3}
                              />
                            </Box>
                            <Divider />
                            <Box>
                              <Text fontWeight="bold">
                                Clinical Correlation:
                              </Text>
                              <Textarea
                                isReadOnly
                                value={
                                  encounterData.analysis
                                    ?.clinical_correlation ||
                                  "No clinical correlation recorded"
                                }
                                bg="gray.50"
                                rows={3}
                              />
                            </Box>
                          </VStack>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>

                  {/* TAB 6: Diagnosis */}
                  <TabPanel py={6}>
                    {encounterData.diagnoses &&
                    encounterData.diagnoses.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        {encounterData.diagnoses.map((dx, idx) => (
                          <Card
                            key={idx}
                            variant="outline"
                            borderLeft="8px solid"
                            borderLeftColor={
                              dx.diagnosis_type === "primary"
                                ? "red.400"
                                : "blue.400"
                            }
                          >
                            <CardHeader
                              bg={
                                dx.diagnosis_type === "primary"
                                  ? "red.50"
                                  : "blue.50"
                              }
                              py={3}
                            >
                              <HStack justify="space-between" wrap="wrap">
                                <Heading
                                  size="sm"
                                  color={
                                    dx.diagnosis_type === "primary"
                                      ? "red.700"
                                      : "blue.700"
                                  }
                                >
                                  {dx.diagnosis_type?.toUpperCase() ||
                                    "DIAGNOSIS"}
                                </Heading>
                                {dx.icd10_code && (
                                  <Badge colorScheme="blue">
                                    ICD-10: {dx.icd10_code}
                                  </Badge>
                                )}
                              </HStack>
                            </CardHeader>
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <Text fontWeight="bold" fontSize="md">
                                  Diagnosis: {dx.diagnosis_name}
                                </Text>
                                <HStack spacing={2} wrap="wrap">
                                  {dx.severity && (
                                    <Tag colorScheme="red" variant="subtle">
                                      Severity: {dx.severity}
                                    </Tag>
                                  )}
                                  {dx.stage && (
                                    <Tag colorScheme="orange" variant="subtle">
                                      Stage: {dx.stage}
                                    </Tag>
                                  )}
                                </HStack>
                                {dx.disease_classification && (
                                  <Text fontSize="sm">
                                    <strong> Disease Classification:</strong>{" "}
                                    {dx.disease_classification}
                                  </Text>
                                )}
                                {dx.comorbidities && (
                                  <Text fontSize="sm">
                                    <strong>Comorbidities:</strong>{" "}
                                    {dx.comorbidities}
                                  </Text>
                                )}
                                {dx.notes && (
                                  <Text fontSize="sm" color="gray.600">
                                    <strong>Notes:</strong> {dx.notes}
                                  </Text>
                                )}
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    ) : (
                      <Card>
                        <CardBody>
                          <VStack spacing={4} py={8}>
                            <InfoIcon boxSize={12} color="gray.400" />
                            <Text color="gray.500" fontSize="lg">
                              No diagnosis data available
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </TabPanel>

                  {/* TAB 7: Management */}
                  <TabPanel py={6}>
                    {encounterData.management || encounterData.medications ? (
                      <VStack spacing={4} align="stretch">
                        {/* Medications */}
                        {encounterData.medications &&
                          encounterData.medications.length > 0 && (
                            <Card variant="outline">
                              <CardHeader bg="green.50" py={3}>
                                <Heading size="sm">Current Medications</Heading>
                              </CardHeader>
                              <CardBody>
                                <SimpleGrid
                                  columns={{ base: 1, md: 2 }}
                                  spacing={4}
                                >
                                  {encounterData.medications.map((med, idx) => (
                                    <Box
                                      key={idx}
                                      p={3}
                                      bg="gray.50"
                                      borderRadius="md"
                                    >
                                      <Text fontWeight="bold">Medicine : {med.medication_name || med.name || "Unknown Medicine"}</Text>
                                      <Text fontSize="sm">
                                        {med.dose} - {med.frequency}
                                      </Text>
                                      <Text fontSize="sm">
                                        Duration: {med.duration}
                                      </Text>
                                      {med.purpose && (
                                        <Text fontSize="sm" fontStyle="italic">
                                          {med.purpose}
                                        </Text>
                                      )}
                                    </Box>
                                  ))}
                                </SimpleGrid>
                              </CardBody>
                            </Card>
                          )}

                        {/* Management Plan */}
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Management Plan</Heading>
                          </CardHeader>
                          <CardBody>
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                            >
                              <Box>
                                <Text fontWeight="bold">Seizure Control:</Text>
                                <Text>
                                  {encounterData.management?.seizure_control ||
                                    "Not specified"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Surgical Plan:</Text>
                                <Text>
                                  {encounterData.management?.surgical_plan ||
                                    "None"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Physiotherapy:</Text>
                                <Text>
                                  {encounterData.management?.physiotherapy ||
                                    "Not specified"}
                                </Text>
                              </Box>
                              <Box>
                                <Text fontWeight="bold">Follow-up Timing:</Text>
                                <Text>
                                  {encounterData.management?.follow_up_timing ||
                                    "Not specified"}
                                </Text>
                              </Box>
                            </SimpleGrid>
                            <Box mt={4} p={3} bg="red.50" borderRadius="md">
                              <Text fontWeight="bold" color="red.700">
                                Warning Signs (Red Flags):
                              </Text>
                              <Text color="red.700">
                                {encounterData.management?.warning_signs ||
                                  "None specified"}
                              </Text>
                            </Box>
                          </CardBody>
                        </Card>
                      </VStack>
                    ) : (
                      <Card>
                        <CardBody>
                          <Text>No management data available</Text>
                        </CardBody>
                      </Card>
                    )}
                  </TabPanel>

                  {/* TAB 8: Notes & Referrals */}
                  
                  <TabPanel py={6}>
                    {encounterData.notes ||
                    (encounterData.referrals &&
                      encounterData.referrals.length > 0) ? (
                      <VStack spacing={4} align="stretch">
                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Clinical Observations</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>
                              {encounterData.notes?.clinical_observations ||
                                "None"}
                            </Text>
                          </CardBody>
                        </Card>

                        <Card variant="outline">
                          <CardHeader bg="blue.50" py={3}>
                            <Heading size="sm">Education Provided</Heading>
                          </CardHeader>
                          <CardBody>
                            <Text>
                              {encounterData.notes?.education_provided ||
                                "None"}
                            </Text>
                          </CardBody>
                        </Card>

                        {/* Multidisciplinary Care */}
                        {encounterData.notes?.multidisciplinary_care && (
                          <Card variant="outline">
                            <CardHeader bg="blue.50" py={3}>
                              <Heading size="sm" color="black.700">
                                Multidisciplinary Care
                              </Heading>
                            </CardHeader>
                            <CardBody>
                              <Text>
                                {encounterData.notes.multidisciplinary_care}
                              </Text>
                            </CardBody>
                          </Card>
                        )}

                        {encounterData.referrals &&
                          encounterData.referrals.length > 0 && (
                            <Card variant="outline" borderColor="green.200">
                              <CardHeader bg="green.50" py={3}>
                                <Heading size="sm" color="green.700">
                                  Referrals
                                </Heading>
                              </CardHeader>
                              <CardBody>
                                <Wrap spacing={2}>
                                  {encounterData.referrals.map((ref, idx) => (
                                    <WrapItem key={idx}>
                                      <Tag size="lg" colorScheme="green">
                                        {/* Access the referral_name property from the object */}
                                        {ref.referral_name || ref.name || ref}
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              </CardBody>
                            </Card>
                          )}
                      </VStack>
                    ) : (
                      <Card>
                        <CardBody>
                          <VStack spacing={4} py={8}>
                            <InfoIcon boxSize={12} color="gray.400" />
                            <Text color="gray.500" fontSize="lg">
                              No notes or referrals available
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default NeurologyRecords;

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
    Grid,
    GridItem,
    Badge,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Button,
    useToast,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Progress,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tag,
    TagLabel,
    Wrap,
    WrapItem,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon, InfoIcon } from "@chakra-ui/icons";
import { patientApi, encounterApi } from "../services/orthopedicsApi";
import { EditIcon,RepeatIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useOrthopedics } from "../context/OrthopedicsContext";
import { calculateAge,formatDate } from "../services/orthopedicsHelpers";
import { generateOrthopedicsReport } from "../services/orthopedicsReportGenerator";
import { DownloadIcon } from "@chakra-ui/icons";
const OrthopedicsPatientView = () => {
    const toast = useToast();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [encounters, setEncounters] = useState([]);
    const [selectedEncounter, setSelectedEncounter] = useState("");
    const [encounterData, setEncounterData] = useState(null);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingEncounters, setLoadingEncounters] = useState(false);
    const [loadingEncounterData, setLoadingEncounterData] = useState(false);
    const navigate = useNavigate();
    const { setEditMode } = useOrthopedics();

    // const [allEncountersData, setAllEncountersData] = useState([]);
    const [_isGeneratingReport, _setIsGeneratingReport] = useState(false);
    const [isGeneratingSingleReport, setIsGeneratingSingleReport] = useState(false);
const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
    // Fetch patients list on component mount
    useEffect(() => {
        fetchPatients();
    }, []);

    // Fetch encounters when patient is selected
    useEffect(() => {
        if (selectedPatient) {
            fetchPatientEncounters(selectedPatient);
        } else {
            setEncounters([]);
            setSelectedEncounter("");
            setEncounterData(null);
        }
    }, [selectedPatient]);

    // Fetch encounter details when encounter is selected
    useEffect(() => {
        if (selectedEncounter) {
            fetchEncounterDetails(selectedEncounter);
        } else {
            setEncounterData(null);
        }
    }, [selectedEncounter]);


    const handleEditClick = (encounter) => {
    // Set the data in context
    setEditMode(encounterData, encounter.encounter_id, encounter.patient_id);
    // Navigate to form page
    navigate('/orthopedics-form');
};
    const fetchPatients = async () => {
        setLoadingPatients(true);
        try {
            // You need to add this endpoint or use getAllPatients
            const response = await patientApi.getAllPatients(1, 100);
            setPatients(response.data || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast({
                title: "Error",
                description: "Failed to load patients list",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchPatientEncounters = async (patientId) => {
        setLoadingEncounters(true);
        try {
            const response = await encounterApi.getPatientEncounters(patientId);
            console.log("fetchPatientEncounters",response.data)
            setEncounters(response.data || []);
            if (response.data?.length > 0) {
                setSelectedEncounter(response.data[0].encounter_id);
            } else {
                setSelectedEncounter("");
                setEncounterData(null);
            }
        } catch (error) {
            console.error("Error fetching encounters:", error);
            toast({
                title: "Error",
                description: "Failed to load patient encounters",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingEncounters(false);
        }
    };

    const fetchEncounterDetails = async (encounterId) => {
        setLoadingEncounterData(true);
        try {
            const response = await encounterApi.getFullEncounterDetails(encounterId);
            console.log(response.data)
            setEncounterData(response.data);
        } catch (error) {
            console.error("Error fetching encounter details:", error);
            toast({
                title: "Error",
                description: "Failed to load encounter details",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoadingEncounterData(false);
        }
    };

const handleGenerateSingleEncounterReport = async () => {
    if (!selectedEncounter) {
        toast({
            title: "No Encounter Selected",
            description: "Please select an encounter first",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setIsGeneratingSingleReport(true);
    
    try {
        toast({
            title: "Generating Report",
            description: "Fetching encounter data...",
            status: "info",
            duration: 2000,
            isClosable: true,
        });

        // Fetch single encounter full details
        const response = await encounterApi.getFullEncounterDetails(selectedEncounter);
        const encounterFullData = response.data;
        
        // Get patient data from existing patients list
        const selectedPatientData = patients.find(p => p.patient_id === parseInt(selectedPatient));
        
        if (!selectedPatientData) {
            throw new Error("Patient data not found");
        }
        
        // Prepare patient data for report
        const patientReportData = {
            patient_id: selectedPatientData.patient_id,
            patient_name: selectedPatientData.patient_name,
            dob: selectedPatientData.dob,
            age: calculateAge(selectedPatientData.dob),
            gender: selectedPatientData.gender,
            blood_group: selectedPatientData.blood_group,
            contact_number: selectedPatientData.contact_number,
            email: selectedPatientData.email,
            address: selectedPatientData.address,
            emergency_name: selectedPatientData.emergency_name,
            emergency_contact_number: selectedPatientData.emergency_contact_number,
            // Medical History Fields from encounter
            past_medical_history: encounterFullData.encounter?.past_medical_history || 'N/A',
            past_surgical_history: encounterFullData.encounter?.past_surgical_history || 'N/A',
            family_history: encounterFullData.encounter?.family_history || 'N/A',
            social_history: encounterFullData.encounter?.social_history || 'N/A',
            allergies: encounterFullData.encounter?.allergies || selectedPatientData.allergies || 'None',
            occupation: encounterFullData.encounter?.occupation || 'N/A',
            physical_activity_level: encounterFullData.encounter?.physical_activity_level || 'N/A',
            smoking_status: encounterFullData.encounter?.smoking_status || 'N/A',
            alcohol_use: encounterFullData.encounter?.alcohol_use || 'N/A',
            height_cm: encounterFullData.encounter?.height_cm || selectedPatientData.height_cm,
            weight_kg: encounterFullData.encounter?.weight_kg || selectedPatientData.weight_kg,
            bmi: encounterFullData.encounter?.bmi || selectedPatientData.bmi
        };
        
        // Generate report with single encounter
        generateOrthopedicsReport(patientReportData, [encounterFullData], true);
        
        toast({
            title: "Report Generated",
            description: `Single encounter report generated successfully`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    } catch (error) {
        console.error("Error generating single encounter report:", error);
        toast({
            title: "Error",
            description: "Failed to generate report: " + (error.message || "Unknown error"),
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    } finally {
        setIsGeneratingSingleReport(false);
    }
};

// Generate report for all encounters (existing function - update it)
const handleGenerateFullReport = async () => {
    if (!selectedPatient) {
        toast({
            title: "No Patient Selected",
            description: "Please select a patient first",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    if (encounters.length === 0) {
        toast({
            title: "No Encounters",
            description: "This patient has no encounters to report",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setIsGeneratingFullReport(true);
    
    try {
        toast({
            title: "Generating Report",
            description: "Fetching all encounter data...",
            status: "info",
            duration: 2000,
            isClosable: true,
        });

        // Fetch full details for all encounters
        const allEncountersFullData = await fetchAllEncountersFullData(selectedPatient, encounters);
        
        // Get patient data from existing patients list
        const selectedPatientData = patients.find(p => p.patient_id === parseInt(selectedPatient));
        
        if (!selectedPatientData) {
            throw new Error("Patient data not found");
        }
        
        // Get the latest encounter for medical history
        const latestEncounter = allEncountersFullData.length > 0 ? allEncountersFullData[0] : null;
        
        // Prepare patient data for report
        const patientReportData = {
            patient_id: selectedPatientData.patient_id,
            patient_name: selectedPatientData.patient_name,
            dob: selectedPatientData.dob,
            age: calculateAge(selectedPatientData.dob),
            gender: selectedPatientData.gender,
            blood_group: selectedPatientData.blood_group,
            contact_number: selectedPatientData.contact_number,
            email: selectedPatientData.email,
            address: selectedPatientData.address,
            emergency_name: selectedPatientData.emergency_name,
            emergency_contact_number: selectedPatientData.emergency_contact_number,
            past_medical_history: latestEncounter?.encounter?.past_medical_history || selectedPatientData.past_medical_history || 'N/A',
            past_surgical_history: latestEncounter?.encounter?.past_surgical_history || 'N/A',
            family_history: latestEncounter?.encounter?.family_history || 'N/A',
            social_history: latestEncounter?.encounter?.social_history || 'N/A',
            allergies: latestEncounter?.encounter?.allergies || selectedPatientData.allergies || 'None',
            occupation: latestEncounter?.encounter?.occupation || 'N/A',
            physical_activity_level: latestEncounter?.encounter?.physical_activity_level || 'N/A',
            smoking_status: latestEncounter?.encounter?.smoking_status || 'N/A',
            alcohol_use: latestEncounter?.encounter?.alcohol_use || 'N/A',
            height_cm: latestEncounter?.encounter?.height_cm || selectedPatientData.height_cm,
            weight_kg: latestEncounter?.encounter?.weight_kg || selectedPatientData.weight_kg,
            bmi: latestEncounter?.encounter?.bmi || selectedPatientData.bmi
        };
        
        // Generate report with all encounters (pass false for single encounter flag)
        generateOrthopedicsReport(patientReportData, allEncountersFullData, false);
        
        toast({
            title: "Report Generated",
            description: `${encounters.length} encounter(s) included in the report`,
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    } catch (error) {
        console.error("Error generating full report:", error);
        toast({
            title: "Error",
            description: "Failed to generate complete report: " + (error.message || "Unknown error"),
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    } finally {
        setIsGeneratingFullReport(false);
    }
};

const fetchAllEncountersFullData = async (patientId, encountersList) => {
    const encountersWithFullData = [];
    
    for (const encounter of encountersList) {
        try {
            const response = await encounterApi.getFullEncounterDetails(encounter.encounter_id);
            encountersWithFullData.push(response.data);
        } catch (error) {
            console.error(`Error fetching encounter ${encounter.encounter_id}:`, error);
        }
    }
    return encountersWithFullData;
};
    if (loadingPatients) {
        return (
            <Container maxW="container.xl" py={10}>
                <VStack spacing={4} justify="center" minH="60vh">
                    <Spinner size="xl" color="medical.500" thickness="4px" />
                    <Text>Loading patients...</Text>
                </VStack>
            </Container>
        );
    }

    return (
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Box textAlign="left">
                    <Heading color="medical.700" mb={2}>Orthopedics Patient Records</Heading>
                    <Text color="gray.600">View and filter patient orthopedic encounters</Text>
                </Box>

                {/* Patient Selection Card */}
                <Card>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel fontWeight="bold" fontSize="lg">Select Patient</FormLabel>
                                <Select
                                    placeholder="Choose a patient"
                                    value={selectedPatient}
                                    onChange={(e) => setSelectedPatient(e.target.value)}
                                    size="lg"
                                    bg="white"
                                >
                                    {patients.map((patient) => (
                                        <option key={patient.patient_id} value={patient.patient_id}>
                                            {patient.patient_name} - {patient.patient_id} ({calculateAge(patient.dob)} yrs) - {patient.contact_number}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Encounter Selection - Shows when patient is selected */}
                            {selectedPatient && (
                                <FormControl>
                                    <FormLabel fontWeight="bold" fontSize="lg">
                                        Select Encounter {encounters.length > 0 && `(${encounters.length} found)`}
                                    </FormLabel>
                                    {loadingEncounters ? (
                                        <HStack spacing={2}>
                                            <Spinner size="sm" />
                                            <Text>Loading encounters...</Text>
                                        </HStack>
                                    ) : encounters.length > 0 ? (
                                        <Select
                                            placeholder="Choose an encounter"
                                            value={selectedEncounter}
                                            onChange={(e) => setSelectedEncounter(e.target.value)}
                                            size="lg"
                                            bg="white"
                                        >
                                            {encounters.map((encounter) => (
                                                <option key={encounter.encounter_id} value={encounter.encounter_id}>
                                                    {formatDate(encounter.encounter_date)} - {encounter.patient_id_at_visit}
                                                </option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Alert status="info" borderRadius="md">
                                            <AlertIcon />
                                            No encounters found for this patient
                                        </Alert>
                                    )}
                                </FormControl>
                            )}


                            {/* {selectedPatient && encounters.length > 0 && (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
        <CardBody py={3}>
            <HStack justify="space-between" wrap="wrap" spacing={4}>
                <HStack spacing={4}>
                    <CalendarIcon color="blue.500" />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="blue.600">Total Encounters</Text>
                        <Text fontWeight="bold" fontSize="lg">{encounters.length}</Text>
                    </VStack>
                </HStack>
                <HStack spacing={4}>
                    <TimeIcon color="blue.500" />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="blue.600">Last Visit</Text>
                        <Text fontWeight="bold">
                            {encounters.length > 0 ? formatDate(encounters[0].encounter_date) : 'N/A'}
                        </Text>
                    </VStack>
                </HStack>
                <HStack spacing={3}>
                    <Button
                        leftIcon={<DownloadIcon />}
                        colorScheme="green"
                        size="md"
                        onClick={handleGenerateReport}
                        isLoading={isGeneratingReport}
                        loadingText="Generating..."
                    >
                        Generate Complete Report
                    </Button>
                </HStack>
            </HStack>
        </CardBody>
    </Card>
)} */}

{selectedPatient && encounters.length > 0 && (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
        <CardBody py={3}>
            <HStack justify="space-between" wrap="wrap" spacing={4}>
                <HStack spacing={4}>
                    <CalendarIcon color="blue.500" />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="blue.600">Total Encounters</Text>
                        <Text fontWeight="bold" fontSize="lg">{encounters.length}</Text>
                    </VStack>
                </HStack>
                <HStack spacing={4}>
                    <TimeIcon color="blue.500" />
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="blue.600">Last Visit</Text>
                        <Text fontWeight="bold">
                            {encounters.length > 0 ? formatDate(encounters[0].encounter_date) : 'N/A'}
                        </Text>
                    </VStack>
                </HStack>
                <HStack spacing={3}>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<RepeatIcon />}
                            colorScheme="green"
                            size="md"
                            leftIcon={<DownloadIcon />}
                        >
                            Generate Report
                        </MenuButton>
                        <MenuList>
                            <MenuItem
                                onClick={handleGenerateFullReport}
                                icon={<DownloadIcon />}
                                isDisabled={isGeneratingFullReport}
                            >
                                {isGeneratingFullReport ? "Generating..." : "Full Patient Report (All Encounters)"}
                            </MenuItem>
                            <MenuItem
                                onClick={handleGenerateSingleEncounterReport}
                                icon={<DownloadIcon />}
                                isDisabled={!selectedEncounter || isGeneratingSingleReport}
                            >
                                {isGeneratingSingleReport 
                                    ? "Generating..." 
                                    : selectedEncounter 
                                        ? "Current Encounter Only" 
                                        : "Current Encounter Only (Select an encounter first)"}
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </HStack>
        </CardBody>
    </Card>
)}
                        </VStack>
                    </CardBody>
                </Card>


                {selectedEncounter && encounterData && !loadingEncounterData && (
                        <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                            <CardBody py={3}>
                                <HStack justify="space-between" wrap="wrap" spacing={4}>
                                    <HStack spacing={4}>
                                        <CalendarIcon color="blue.500" />
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="blue.600">Encounter Date</Text>
                                            <Text fontWeight="bold">{formatDate(encounterData.encounter.encounter_date)}</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack spacing={4}>
                                        <TimeIcon color="blue.500" />
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="sm" color="blue.600">Visit ID</Text>
                                            <Text fontWeight="bold">{encounterData.encounter.patient_id_at_visit}</Text>
                                        </VStack>
                                    </HStack>
                                    <HStack spacing={3}>
                                        <Button
                                            leftIcon={<EditIcon />}
                                            colorScheme="blue"
                                            size="md"
                                            onClick={() => handleEditClick(encounterData.encounter)}
                                        >
                                            Edit This Encounter
                                        </Button>
                                    </HStack>
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

                {/* Encounter Details Display */}
                {encounterData && !loadingEncounterData && (
                    <Card>
                        <CardBody p={0}>
                            <Tabs isLazy colorScheme="medical" variant="enclosed">
                                <TabList overflowX="auto" px={4} pt={4}>
                                    <Tab>Patient Info</Tab>
                                    <Tab>Complaints</Tab>
                                    <Tab>Physical Exam</Tab>
                                    <Tab>Imaging</Tab>
                                    <Tab>Diagnoses</Tab>
                                    <Tab>Management</Tab>
                                    <Tab>Notes</Tab>
                                </TabList>

                                <TabPanels>
                                    {/* TAB 1: Patient & Encounter Info */}
                                  {/* TAB 1: Patient & Encounter Info */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            {/* Patient Information */}
                                            <Card variant="outline">
                                                <CardHeader bg="medical.50" py={3}>
                                                    <Heading size="sm">Patient Information</Heading>
                                                </CardHeader>
                                                <CardBody>
                                                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                                        <Stat>
                                                            <StatLabel>Name</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.patient_name}</StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Age/Gender</StatLabel>
                                                            <StatNumber fontSize="md">
                                                                {encounterData.encounter.age} yrs / {encounterData.encounter.gender}
                                                            </StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Blood Group</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.blood_group || "N/A"}</StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Contact</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.contact_number || "N/A"}</StatNumber>
                                                        </Stat>
                                                    </SimpleGrid>
                                                    {encounterData.encounter.email && (
                                                        <Text mt={2} fontSize="sm">
                                                            <strong>Email:</strong> {encounterData.encounter.email}
                                                        </Text>
                                                    )}
                                                    {encounterData.encounter.address && (
                                                        <Text mt={1} fontSize="sm">
                                                            <strong>Address:</strong> {encounterData.encounter.address}
                                                        </Text>
                                                    )}
                                                </CardBody>
                                            </Card>

                                            {/* Emergency Information - New Card */}
                                            <Card variant="outline" borderColor="red.200">
                                                <CardHeader bg="red.50" py={3}>
                                                    <HStack>
                                                        <Heading size="sm" color="red.700">Emergency Contact Information</Heading>
                                                        <Badge colorScheme="red">Emergency</Badge>
                                                    </HStack>
                                                </CardHeader>
                                                <CardBody>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                        <Stat>
                                                            <StatLabel>Emergency Contact Name</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.emergency_name || "Not provided"}</StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Emergency Contact Number</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.emergency_contact_number || "Not provided"}</StatNumber>
                                                        </Stat>
                                                    </SimpleGrid>
                                                </CardBody>
                                            </Card>

                                            {/* Encounter Information */}
                                            <Card variant="outline">
                                                <CardHeader bg="medical.50" py={3}>
                                                    <Heading size="sm">Encounter Information</Heading>
                                                </CardHeader>
                                                <CardBody>
                                                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                                                        <Stat>
                                                            <StatLabel>Visit ID</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.patient_id_at_visit}</StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Date</StatLabel>
                                                            <StatNumber fontSize="md">{formatDate(encounterData.encounter.encounter_date)}</StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Occupation</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.occupation || "N/A"}</StatNumber>
                                                        </Stat>
                                                    </SimpleGrid>
                                                </CardBody>
                                            </Card>

                                            {/* Physical Metrics - New Card */}
                                            <Card variant="outline">
                                                <CardHeader bg="medical.50" py={3}>
                                                    <Heading size="sm">Physical Metrics</Heading>
                                                </CardHeader>
                                                <CardBody>
                                                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                                        <Stat>
                                                            <StatLabel>Height</StatLabel>
                                                            <StatNumber fontSize="md">
                                                                {encounterData.encounter.height_cm ? `${encounterData.encounter.height_cm} cm` : "N/A"}
                                                            </StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Weight</StatLabel>
                                                            <StatNumber fontSize="md">
                                                                {encounterData.encounter.weight_kg ? `${encounterData.encounter.weight_kg} kg` : "N/A"}
                                                            </StatNumber>
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>BMI</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.bmi || "N/A"}</StatNumber>
                                                            {encounterData.encounter.bmi && (
                                                                <StatHelpText>
                                                                    <StatArrow 
                                                                        type={encounterData.encounter.bmi > 25 ? "increase" : 
                                                                            encounterData.encounter.bmi < 18.5 ? "decrease" : "increase"} 
                                                                    />
                                                                    {encounterData.encounter.bmi > 30 ? "Obese" :
                                                                    encounterData.encounter.bmi > 25 ? "Overweight" :
                                                                    encounterData.encounter.bmi < 18.5 ? "Underweight" : "Normal"}
                                                                </StatHelpText>
                                                            )}
                                                        </Stat>
                                                        <Stat>
                                                            <StatLabel>Physical Activity</StatLabel>
                                                            <StatNumber fontSize="md">{encounterData.encounter.physical_activity_level || "N/A"}</StatNumber>
                                                        </Stat>
                                                    </SimpleGrid>
                                                </CardBody>
                                            </Card>

                                            {/* Medical History */}
                                            {(encounterData.encounter.past_medical_history || encounterData.encounter.past_surgical_history) && (
                                                <Card variant="outline">
                                                    <CardHeader bg="medical.50" py={3}>
                                                        <Heading size="sm">Medical History</Heading>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                            {encounterData.encounter.past_medical_history && (
                                                                <Box>
                                                                    <Text fontWeight="bold" fontSize="sm">Past Medical:</Text>
                                                                    <Text>{encounterData.encounter.past_medical_history}</Text>
                                                                </Box>
                                                            )}
                                                            {encounterData.encounter.past_surgical_history && (
                                                                <Box>
                                                                    <Text fontWeight="bold" fontSize="sm">Past Surgical:</Text>
                                                                    <Text>{encounterData.encounter.past_surgical_history}</Text>
                                                                </Box>
                                                            )}
                                                        </SimpleGrid>
                                                    </CardBody>
                                                </Card>
                                            )}

                                            {/* Social History */}
                                            {(encounterData.encounter.social_history || 
                                            encounterData.encounter.smoking_status || 
                                            encounterData.encounter.alcohol_use) && (
                                                <Card variant="outline">
                                                    <CardHeader bg="medical.50" py={3}>
                                                        <Heading size="sm">Social History</Heading>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                            {encounterData.encounter.smoking_status && (
                                                                <Box>
                                                                    <Text fontWeight="bold" fontSize="sm">Smoking:</Text>
                                                                    <Badge colorScheme={
                                                                        encounterData.encounter.smoking_status === "Current" ? "red" :
                                                                        encounterData.encounter.smoking_status === "Former" ? "yellow" : "green"
                                                                    }>
                                                                        {encounterData.encounter.smoking_status}
                                                                    </Badge>
                                                                </Box>
                                                            )}
                                                            {encounterData.encounter.alcohol_use && (
                                                                <Box>
                                                                    <Text fontWeight="bold" fontSize="sm">Alcohol:</Text>
                                                                    <Text>{encounterData.encounter.alcohol_use}</Text>
                                                                </Box>
                                                            )}
                                                            {encounterData.encounter.social_history && (
                                                                <Box gridColumn={{ base: "span 1", md: "span 3" }}>
                                                                    <Text fontWeight="bold" fontSize="sm">Social History:</Text>
                                                                    <Text>{encounterData.encounter.social_history}</Text>
                                                                </Box>
                                                            )}
                                                        </SimpleGrid>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </VStack>
                                    </TabPanel>

                                    {/* TAB 2: Complaints */}
                                   {/* TAB 2: Complaints */}
                                <TabPanel>
                                    {encounterData.complaints ? (
                                        <VStack spacing={4} align="stretch">
                                            {/* Chief Complaint Card */}
                                            <Card variant="outline">
                                                <CardHeader bg="medical.50" py={3}>
                                                    <Heading size="sm">Chief Complaint</Heading>
                                                </CardHeader>
                                                <CardBody>
                                                    <Text fontSize="md" fontWeight="medium">{encounterData.complaints.chief_complaint}</Text>
                                                    <SimpleGrid columns={3} mt={3} spacing={2}>
                                                        <Badge colorScheme="blue" p={2} borderRadius="md">
                                                            Onset: {formatDate(encounterData.complaints.onset_date) || "N/A"}
                                                        </Badge>
                                                        <Badge colorScheme="green" p={2} borderRadius="md">
                                                            Duration: {encounterData.complaints.duration || "N/A"}
                                                        </Badge>
                                                        <Badge colorScheme="purple" p={2} borderRadius="md">
                                                            Progression: {encounterData.complaints.progression || "N/A"}
                                                        </Badge>
                                                    </SimpleGrid>
                                                </CardBody>
                                </Card>

                                {/* Pain Characteristics Card */}
                                <Card variant="outline">
                                    <CardHeader bg="medical.50" py={3}>
                                        <Heading size="sm">Pain Characteristics</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                            <Stat>
                                                <StatLabel>Location</StatLabel>
                                                <StatNumber fontSize="sm">{encounterData.complaints.pain_location || "N/A"}</StatNumber>
                                            </Stat>
                                            <Stat>
                                                <StatLabel>Intensity</StatLabel>
                                                <StatNumber fontSize="sm">
                                                    {encounterData.complaints.pain_intensity ? 
                                                        `${encounterData.complaints.pain_intensity}/10` : "N/A"}
                                                </StatNumber>
                                                {encounterData.complaints.pain_intensity && (
                                                    <Progress 
                                                        value={encounterData.complaints.pain_intensity * 10} 
                                                        size="xs" 
                                                        colorScheme={
                                                            encounterData.complaints.pain_intensity <= 3 ? "green" :
                                                            encounterData.complaints.pain_intensity <= 6 ? "yellow" : "red"
                                                        }
                                                        mt={1}
                                                        borderRadius="full"
                                                    />
                                                )}
                                            </Stat>
                                            <Stat>
                                                <StatLabel>Type</StatLabel>
                                                <StatNumber fontSize="sm">{encounterData.complaints.pain_type || "N/A"}</StatNumber>
                                            </Stat>
                                            <Stat>
                                                <StatLabel>Radiation</StatLabel>
                                                <StatNumber fontSize="sm">{encounterData.complaints.pain_radiation || "None"}</StatNumber>
                                            </Stat>
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>

                                {/* Trauma Mechanism Card - NEW */}
                                {(encounterData.complaints.trauma_mechanism || encounterData.complaints.trauma_time) && (
                                    <Card variant="outline" borderColor="orange.200">
                                        <CardHeader bg="orange.50" py={3}>
                                            <HStack>
                                                <Heading size="sm" color="orange.700">Trauma Mechanism</Heading>
                                                <Badge colorScheme="orange">Injury Details</Badge>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                {encounterData.complaints.trauma_mechanism && (
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="orange.700">Mechanism of Injury:</Text>
                                                        <Text mt={1}>{encounterData.complaints.trauma_mechanism}</Text>
                                                    </Box>
                                                )}
                                                {encounterData.complaints.trauma_time && (
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="orange.700">Time Since Injury:</Text>
                                                        <Text mt={1}>{encounterData.complaints.trauma_time}</Text>
                                                    </Box>
                                                )}
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>
                                )}

                            {/* Local Findings Card */}
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                <Card variant="outline">
                                    <CardHeader bg="medical.50" py={3}>
                                        <Heading size="sm">Local Findings</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Swelling:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.swelling === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.swelling || "No"}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Redness:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.redness === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.redness || "No"}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Warmth:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.warmth === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.warmth || "No"}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                        </CardBody>
                                    </Card>

                                {/* Neurological Symptoms Card */}
                                <Card variant="outline">
                                    <CardHeader bg="medical.50" py={3}>
                                        <Heading size="sm">Neurological Symptoms</Heading>
                                    </CardHeader>
                                    <CardBody>
                                        <VStack align="stretch" spacing={3}>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Numbness:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.numbness === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.numbness || "No"}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Tingling:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.tingling === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.tingling || "No"}
                                                </Badge>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontWeight="medium">Weakness:</Text>
                                                <Badge 
                                                    colorScheme={encounterData.complaints.weakness === "Yes" ? "red" : "green"}
                                                    fontSize="sm"
                                                    p={1}
                                                    px={2}
                                                >
                                                    {encounterData.complaints.weakness || "No"}
                                                </Badge>
                                            </HStack>
                                        </VStack>
                                    </CardBody>
                                    </Card>
                                </SimpleGrid>

                                {/* Functional Limitations Card - NEW */}
                                {(encounterData.complaints.functional_limitation || 
                                encounterData.complaints.mobility_limitation || 
                                encounterData.complaints.adl_limitation || 
                                encounterData.complaints.range_motion_loss) && (
                                    <Card variant="outline" borderColor="blue.200">
                                        <CardHeader bg="blue.50" py={3}>
                                            <HStack>
                                                <Heading size="sm" color="blue.700">Functional Limitations</Heading>
                                                <Badge colorScheme="blue">Impact on Daily Life</Badge>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack align="stretch" spacing={4}>
                                                {encounterData.complaints.functional_limitation && (
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="blue.700">Functional Limitation:</Text>
                                                        <Text mt={1}>{encounterData.complaints.functional_limitation}</Text>
                                                    </Box>
                                                )}
                                                
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    {encounterData.complaints.mobility_limitation && (
                                                        <Box>
                                                            <Text fontWeight="bold" fontSize="sm" color="blue.700">Mobility Limitation:</Text>
                                                            <Text mt={1}>{encounterData.complaints.mobility_limitation}</Text>
                                                        </Box>
                                                    )}
                                                    
                                                    {encounterData.complaints.adl_limitation && (
                                                        <Box>
                                                            <Text fontWeight="bold" fontSize="sm" color="blue.700">ADL Limitation:</Text>
                                                            <Text mt={1}>{encounterData.complaints.adl_limitation}</Text>
                                                        </Box>
                                                    )}
                                                </SimpleGrid>
                                                
                                                {encounterData.complaints.range_motion_loss && (
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="blue.700">Range of Motion Loss:</Text>
                                                        <Text mt={1}>{encounterData.complaints.range_motion_loss}</Text>
                                                    </Box>
                                                )}
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                )}
                            </VStack>
                                        ) : (
                                            <Card>
                                                <CardBody>
                                                    <VStack spacing={4} py={8}>
                                                        <InfoIcon boxSize={12} color="gray.400" />
                                                        <Text color="gray.500" fontSize="lg">No complaint data available</Text>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </TabPanel>

                                    {/* TAB 3: Physical Exam */}
                                   {/* TAB 3: Physical Exam */}
                                         <TabPanel>
                            {encounterData.physical_exam ? (
                                <VStack spacing={4} align="stretch">
                                    {/* Inspection & Palpation Card */}
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" py={3}>
                                            <Heading size="sm">Inspection & Palpation</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <VStack align="stretch" spacing={4}>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Inspection:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.inspection || "Normal"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Deformity:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.deformity || "None"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Scars:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.scars || "None"}</Text>
                                                    </Box>
                                                </VStack>
                                                <VStack align="stretch" spacing={4}>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Palpation Tenderness:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.palpation_tenderness || "None"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Warmth on Palpation:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.warmth_on_palpation || "Normal"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">Crepitus:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.crepitus || "None"}</Text>
                                                    </Box>
                                                </VStack>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    {/* Range of Motion Card */}
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" py={3}>
                                            <Heading size="sm">Range of Motion</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Active Flexion:</Text>
                                                    <Badge colorScheme="blue" fontSize="md" p={1} px={3} mt={1}>
                                                        {encounterData.physical_exam.rom_active_flexion || "N/A"}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Passive Flexion:</Text>
                                                    <Badge colorScheme="blue" fontSize="md" p={1} px={3} mt={1}>
                                                        {encounterData.physical_exam.rom_passive_flexion || "N/A"}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Active Extension:</Text>
                                                    <Badge colorScheme="blue" fontSize="md" p={1} px={3} mt={1}>
                                                        {encounterData.physical_exam.rom_active_extension || "N/A"}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Passive Extension:</Text>
                                                    <Badge colorScheme="blue" fontSize="md" p={1} px={3} mt={1}>
                                                        {encounterData.physical_exam.rom_passive_extension || "N/A"}
                                                    </Badge>
                                                </Box>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    {/* Strength Testing Card */}
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" py={3}>
                                            <Heading size="sm">Strength Testing (MRC Scale)</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                <Stat>
                                                    <StatLabel>Quadriceps</StatLabel>
                                                    <StatNumber fontSize="lg">{encounterData.physical_exam.quadriceps_strength || "N/A"}</StatNumber>
                                                    {encounterData.physical_exam.quadriceps_strength && (
                                                        <Progress 
                                                            value={parseInt(encounterData.physical_exam.quadriceps_strength) * 20} 
                                                            size="xs" 
                                                            colorScheme={
                                                                parseInt(encounterData.physical_exam.quadriceps_strength) >= 4 ? "green" :
                                                                parseInt(encounterData.physical_exam.quadriceps_strength) >= 3 ? "yellow" : "red"
                                                            }
                                                            mt={1}
                                                            borderRadius="full"
                                                        />
                                                    )}
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Hamstring</StatLabel>
                                                    <StatNumber fontSize="lg">{encounterData.physical_exam.hamstring_strength || "N/A"}</StatNumber>
                                                    {encounterData.physical_exam.hamstring_strength && (
                                                        <Progress 
                                                            value={parseInt(encounterData.physical_exam.hamstring_strength) * 20} 
                                                            size="xs" 
                                                            colorScheme={
                                                                parseInt(encounterData.physical_exam.hamstring_strength) >= 4 ? "green" :
                                                                parseInt(encounterData.physical_exam.hamstring_strength) >= 3 ? "yellow" : "red"
                                                            }
                                                            mt={1}
                                                            borderRadius="full"
                                                        />
                                                    )}
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Calf</StatLabel>
                                                    <StatNumber fontSize="lg">{encounterData.physical_exam.calf_strength || "N/A"}</StatNumber>
                                                    {encounterData.physical_exam.calf_strength && (
                                                        <Progress 
                                                            value={parseInt(encounterData.physical_exam.calf_strength) * 20} 
                                                            size="xs" 
                                                            colorScheme={
                                                                parseInt(encounterData.physical_exam.calf_strength) >= 4 ? "green" :
                                                                parseInt(encounterData.physical_exam.calf_strength) >= 3 ? "yellow" : "red"
                                                            }
                                                            mt={1}
                                                            borderRadius="full"
                                                        />
                                                    )}
                                                </Stat>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    {/* Neurovascular Status Card - NEW */}
                                    <Card variant="outline" borderColor="purple.200">
                                        <CardHeader bg="purple.50" py={3}>
                                            <HStack>
                                                <Heading size="sm" color="purple.700">Neurovascular Status</Heading>
                                                <Badge colorScheme="purple">Vascular & Neurological</Badge>
                                            </HStack>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <VStack align="stretch" spacing={4}>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="purple.700">Pulses:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.pulses || "Normal"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="purple.700">Sensation:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.sensation || "Intact"}</Text>
                                                    </Box>
                                                </VStack>
                                                <VStack align="stretch" spacing={4}>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="purple.700">Motor Function:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.motor_function || "Normal"}</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="bold" fontSize="sm" color="purple.700">Joint Instability:</Text>
                                                        <Text mt={1}>{encounterData.physical_exam.joint_instability || "None"}</Text>
                                                    </Box>
                                                </VStack>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>

                                    {/* Gait & Special Tests Card */}
                                    <Card variant="outline">
                                        <CardHeader bg="medical.50" py={3}>
                                            <Heading size="sm">Gait & Special Tests</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Gait Assessment:</Text>
                                                    <Text mt={1}>{encounterData.physical_exam.gait || "Normal"}</Text>
                                                </Box>
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="sm">Special Tests:</Text>
                                                    <Text mt={1}>{encounterData.physical_exam.special_tests || "None performed"}</Text>
                                                </Box>
                                            </SimpleGrid>
                                        </CardBody>
                                    </Card>
                                </VStack>
                                            ) : (
                                                <Card>
                                                    <CardBody>
                                                        <VStack spacing={4} py={8}>
                                                            <InfoIcon boxSize={12} color="gray.400" />
                                                            <Text color="gray.500" fontSize="lg">No physical exam data available</Text>
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </TabPanel>
                                    {/* TAB 4: Imaging */}
                                    {/* TAB 4: Imaging & Investigations */}
                                        <TabPanel>
                                            {encounterData.imaging || encounterData.labs ? (
                                                <VStack spacing={4} align="stretch">
                                                    {/* X-Ray Card */}
                                                    {(encounterData.imaging?.xray_done || encounterData.imaging?.xray_findings) && (
                                                        <Card variant="outline">
                                                            <CardHeader bg="medical.50" py={3}>
                                                                <HStack>
                                                                    <Heading size="sm">X-Ray</Heading>
                                                                    <Badge colorScheme={encounterData.imaging?.xray_done === "Yes" ? "green" : "yellow"}>
                                                                        {encounterData.imaging?.xray_done || "Not done"}
                                                                    </Badge>
                                                                </HStack>
                                                            </CardHeader>
                                                            {encounterData.imaging?.xray_findings && (
                                                                <CardBody>
                                                                    <Text fontWeight="bold" fontSize="sm" mb={1}>Findings:</Text>
                                                                    <Text>{encounterData.imaging.xray_findings}</Text>
                                                                </CardBody>
                                                            )}
                                                        </Card>
                                                    )}

                                                    {/* MRI Card */}
                                                    {(encounterData.imaging?.mri_done || encounterData.imaging?.mri_indication) && (
                                                        <Card variant="outline">
                                                            <CardHeader bg="medical.50" py={3}>
                                                                <HStack>
                                                                    <Heading size="sm">MRI</Heading>
                                                                    <Badge colorScheme={encounterData.imaging?.mri_done === "Yes" ? "green" : 
                                                                                        encounterData.imaging?.mri_done === "Pending" ? "yellow" : "gray"}>
                                                                        {encounterData.imaging?.mri_done || "Not done"}
                                                                    </Badge>
                                                                </HStack>
                                                            </CardHeader>
                                                            {encounterData.imaging?.mri_indication && (
                                                                <CardBody>
                                                                    <Text fontWeight="bold" fontSize="sm" mb={1}>Indication:</Text>
                                                                    <Text>{encounterData.imaging.mri_indication}</Text>
                                                                </CardBody>
                                                            )}
                                                        </Card>
                                                    )}

                                                    {/* Other Imaging Studies Card - CT, Ultrasound, DEXA */}
                                                    {(encounterData.imaging?.ct_done === "Yes" || 
                                                    encounterData.imaging?.ultrasound_done === "Yes" || 
                                                    encounterData.imaging?.dexa_done === "Yes") && (
                                                        <Card variant="outline" borderColor="purple.200">
                                                            <CardHeader bg="purple.50" py={3}>
                                                                <HStack>
                                                                    <Heading size="sm" color="purple.700">Other Imaging Studies</Heading>
                                                                    <Badge colorScheme="purple">Additional Studies</Badge>
                                                                </HStack>
                                                            </CardHeader>
                                                            <CardBody>
                                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                                    {encounterData.imaging?.ct_done === "Yes" && (
                                                                        <Box textAlign="center" p={3} bg="purple.50" borderRadius="lg">
                                                                            <Text fontWeight="bold" color="purple.700">CT Scan</Text>
                                                                            <Badge colorScheme="purple" mt={2}>Completed</Badge>
                                                                        </Box>
                                                                    )}
                                                                    {encounterData.imaging?.ultrasound_done === "Yes" && (
                                                                        <Box textAlign="center" p={3} bg="blue.50" borderRadius="lg">
                                                                            <Text fontWeight="bold" color="blue.700">Ultrasound</Text>
                                                                            <Badge colorScheme="blue" mt={2}>Completed</Badge>
                                                                        </Box>
                                                                    )}
                                                                    {encounterData.imaging?.dexa_done === "Yes" && (
                                                                        <Box textAlign="center" p={3} bg="green.50" borderRadius="lg">
                                                                            <Text fontWeight="bold" color="green.700">Bone Density (DEXA)</Text>
                                                                            <Badge colorScheme="green" mt={2}>Completed</Badge>
                                                                        </Box>
                                                                    )}
                                                                </SimpleGrid>
                                                            </CardBody>
                                                        </Card>
                                                    )}

                                                    {/* Laboratory Tests Card */}
                                                    {encounterData.labs && (
                                                        <Card variant="outline" borderColor="teal.200">
                                                            <CardHeader bg="teal.50" py={3}>
                                                                <HStack>
                                                                    <Heading size="sm" color="teal.700">Laboratory Tests</Heading>
                                                                    <Badge colorScheme="teal">Lab Results</Badge>
                                                                </HStack>
                                                            </CardHeader>
                                                            <CardBody>
                                                                <VStack spacing={4} align="stretch">
                                                                    {/* Tests Ordered */}
                                                                    <Box>
                                                                        <Text fontWeight="bold" fontSize="sm" color="teal.700" mb={2}>Tests Ordered:</Text>
                                                                        <Wrap spacing={2}>
                                                                            {encounterData.labs.cbc_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">CBC</Tag>
                                                                            )}
                                                                            {encounterData.labs.esr_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">ESR</Tag>
                                                                            )}
                                                                            {encounterData.labs.crp_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">CRP</Tag>
                                                                            )}
                                                                            {encounterData.labs.rheumatoid_factor_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">Rheumatoid Factor</Tag>
                                                                            )}
                                                                            {encounterData.labs.uric_acid_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">Uric Acid</Tag>
                                                                            )}
                                                                            {encounterData.labs.calcium_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">Calcium</Tag>
                                                                            )}
                                                                            {encounterData.labs.vitamin_d_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">Vitamin D</Tag>
                                                                            )}
                                                                            {encounterData.labs.alp_ordered && (
                                                                                <Tag size="md" colorScheme="teal" variant="subtle">ALP</Tag>
                                                                            )}
                                                                            {(!encounterData.labs.cbc_ordered && !encounterData.labs.esr_ordered && 
                                                                            !encounterData.labs.crp_ordered && !encounterData.labs.rheumatoid_factor_ordered &&
                                                                            !encounterData.labs.uric_acid_ordered && !encounterData.labs.calcium_ordered &&
                                                                            !encounterData.labs.vitamin_d_ordered && !encounterData.labs.alp_ordered) && (
                                                                                <Text color="gray.500">No tests ordered</Text>
                                                                            )}
                                                                        </Wrap>
                                                                    </Box>

                                                                    {/* Lab Results */}
                                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                                        {encounterData.labs.cbc_results && (
                                                                            <Box>
                                                                                <Text fontWeight="bold" fontSize="sm">CBC Results:</Text>
                                                                                <Text>{encounterData.labs.cbc_results}</Text>
                                                                            </Box>
                                                                        )}
                                                                        {encounterData.labs.esr_results && (
                                                                            <Box>
                                                                                <Text fontWeight="bold" fontSize="sm">ESR Results:</Text>
                                                                                <Text>{encounterData.labs.esr_results}</Text>
                                                                            </Box>
                                                                        )}
                                                                        {encounterData.labs.crp_results && (
                                                                            <Box>
                                                                                <Text fontWeight="bold" fontSize="sm">CRP Results:</Text>
                                                                                <Text>{encounterData.labs.crp_results}</Text>
                                                                            </Box>
                                                                        )}
                                                                    </SimpleGrid>

                                                                    {/* Other Lab Results */}
                                                                    {encounterData.labs.other_labs_results && (
                                                                        <Box>
                                                                            <Text fontWeight="bold" fontSize="sm" color="teal.700">Other Lab Results:</Text>
                                                                            <Text mt={1}>{encounterData.labs.other_labs_results}</Text>
                                                                        </Box>
                                                                    )}

                                                                    {/* Other Lab Tests */}
                                                                    {encounterData.labs.other_lab_tests && (
                                                                        <Box>
                                                                            <Text fontWeight="bold" fontSize="sm" color="teal.700">Additional Tests:</Text>
                                                                            <Text mt={1}>{encounterData.labs.other_lab_tests}</Text>
                                                                        </Box>
                                                                    )}
                                                                </VStack>
                                                            </CardBody>
                                                        </Card>
                                                    )}

                                                    {/* No Imaging Data Message */}
                                                    {!encounterData.imaging && !encounterData.labs && (
                                                        <Card>
                                                            <CardBody>
                                                                <VStack spacing={4} py={8}>
                                                                    <InfoIcon boxSize={12} color="gray.400" />
                                                                    <Text color="gray.500" fontSize="lg">No imaging or lab data available</Text>
                                                                </VStack>
                                                            </CardBody>
                                                        </Card>
                                                    )}
                                                </VStack>
                                            ) : (
                                                <Card>
                                                    <CardBody>
                                                        <VStack spacing={4} py={8}>
                                                            <InfoIcon boxSize={12} color="gray.400" />
                                                            <Text color="gray.500" fontSize="lg">No imaging or lab data available</Text>
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </TabPanel>
                                    {/* TAB 5: Diagnoses */}
                                    <TabPanel>
                                        {encounterData.diagnoses && encounterData.diagnoses.length > 0 ? (
                                            <VStack spacing={4} align="stretch">
                                                {/* Primary Diagnosis */}
                                                {encounterData.diagnoses.filter(d => d.diagnosis_type === 'primary').map(dx => (
                                                    <Card key={dx.diagnosis_id} variant="outline" borderColor="red.200">
                                                        <CardHeader bg="red.50" py={3}>
                                                            <HStack justify="space-between">
                                                                <Heading size="sm">Primary Diagnosis</Heading>
                                                                <Badge colorScheme="red">Primary</Badge>
                                                            </HStack>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <VStack align="stretch" spacing={2}>
                                                                <Text fontSize="lg" fontWeight="bold">{dx.diagnosis_name}</Text>
                                                                <SimpleGrid columns={3} spacing={2}>
                                                                    {dx.affected_side && <Badge>Side: {dx.affected_side}</Badge>}
                                                                    {dx.affected_joint && <Badge>Joint: {dx.affected_joint}</Badge>}
                                                                    {dx.severity && <Badge colorScheme="orange">Severity: {dx.severity}</Badge>}
                                                                </SimpleGrid>
                                                                {dx.fracture_type && dx.fracture_type !== "Not applicable" && (
                                                                    <Text><strong>Fracture Type:</strong> {dx.fracture_type}</Text>
                                                                )}
                                                                {dx.ligament_grade && dx.ligament_grade !== "Not applicable" && (
                                                                    <Text><strong>Ligament Grade:</strong> {dx.ligament_grade}</Text>
                                                                )}
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                ))}

                                                {/* Suspected Diagnoses */}
                                                {encounterData.diagnoses.filter(d => d.diagnosis_type === 'suspected').length > 0 && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="yellow.50" py={3}>
                                                            <Heading size="sm">Suspected Diagnoses</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Wrap spacing={2}>
                                                                {encounterData.diagnoses.filter(d => d.diagnosis_type === 'suspected').map(dx => (
                                                                    <WrapItem key={dx.diagnosis_id}>
                                                                        <Tag size="lg" colorScheme="yellow" variant="subtle">
                                                                            <TagLabel>{dx.diagnosis_name}</TagLabel>
                                                                        </Tag>
                                                                    </WrapItem>
                                                                ))}
                                                            </Wrap>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* Differential Diagnoses */}
                                                {encounterData.diagnoses.filter(d => d.diagnosis_type === 'differential').length > 0 && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="blue.50" py={3}>
                                                            <Heading size="sm">Differential Diagnoses</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Wrap spacing={2}>
                                                                {encounterData.diagnoses.filter(d => d.diagnosis_type === 'differential').map(dx => (
                                                                    <WrapItem key={dx.diagnosis_id}>
                                                                        <Tag size="lg" colorScheme="blue" variant="subtle">
                                                                            <TagLabel>{dx.diagnosis_name}</TagLabel>
                                                                        </Tag>
                                                                    </WrapItem>
                                                                ))}
                                                            </Wrap>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Text color="gray.500">No diagnosis data available</Text>
                                        )}
                                    </TabPanel>

                                    {/* TAB 6: Management */}
                                    <TabPanel>
                                        {encounterData.management ? (
                                            <VStack spacing={4} align="stretch">
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Non-Surgical Management</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <VStack align="stretch" spacing={3}>
                                                                <Box>
                                                                    <Text fontWeight="bold">Immobilization:</Text>
                                                                    <Text>{encounterData.management.immobilization_type || "None"}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="bold">Physiotherapy:</Text>
                                                                    <Text>{encounterData.management.physiotherapy || "Not specified"}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="bold">Pain Medications:</Text>
                                                                    <Text>{encounterData.management.pain_medications || "None"}</Text>
                                                                </Box>
                                                                <Box>
                                                                    <Text fontWeight="bold">Activity Modification:</Text>
                                                                    <Text>{encounterData.management.activity_modification || "None"}</Text>
                                                                </Box>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>

                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Surgical Plan</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <VStack align="stretch" spacing={3}>
                                                                <Box>
                                                                    <Text fontWeight="bold">Plan:</Text>
                                                                    <Text>{encounterData.management.surgical_plan || "No surgical plan"}</Text>
                                                                </Box>
                                                                {encounterData.management.arthroscopy && (
                                                                    <Box>
                                                                        <Text fontWeight="bold">Arthroscopy:</Text>
                                                                        <Text>{encounterData.management.arthroscopy}</Text>
                                                                    </Box>
                                                                )}
                                                                {encounterData.management.joint_replacement && (
                                                                    <Box>
                                                                        <Text fontWeight="bold">Joint Replacement:</Text>
                                                                        <Text>{encounterData.management.joint_replacement}</Text>
                                                                    </Box>
                                                                )}
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                </SimpleGrid>

                                                <Card variant="outline">
                                                    <CardHeader bg="medical.50" py={3}>
                                                        <Heading size="sm">Follow-up Plan</Heading>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                            <Box>
                                                                <Text fontWeight="bold">Follow-up Timeline:</Text>
                                                                <Text>{encounterData.management.follow_up_timeline || "Not specified"}</Text>
                                                            </Box>
                                                            <Box>
                                                                <Text fontWeight="bold">Repeat Imaging:</Text>
                                                                <Text>{encounterData.management.repeat_imaging_schedule || "Not specified"}</Text>
                                                            </Box>
                                                            <Box gridColumn="span 2">
                                                                <Text fontWeight="bold">Red Flag Symptoms:</Text>
                                                                <Text>{encounterData.management.red_flag_symptoms || "None specified"}</Text>
                                                            </Box>
                                                        </SimpleGrid>
                                                    </CardBody>
                                                </Card>

                                                {/* Rehab Milestones */}
                                                {encounterData.rehab_milestones && encounterData.rehab_milestones.length > 0 && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Rehabilitation Milestones</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <VStack align="stretch" spacing={2}>
                                                                {encounterData.rehab_milestones.map((milestone, index) => (
                                                                    <HStack key={milestone.milestone_id} p={2} bg="gray.50" borderRadius="md">
                                                                        <Text fontWeight="bold" mr={2}>{index + 1}.</Text>
                                                                        <Text>{milestone.milestone_description}</Text>
                                                                    </HStack>
                                                                ))}
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Text color="gray.500">No management data available</Text>
                                        )}
                                    </TabPanel>

                                    {/* TAB 7: Notes */}
                                   {/* TAB 7: Notes */}
                                    <TabPanel>
                                        {encounterData.notes || encounterData.referrals ? (
                                            <VStack spacing={4} align="stretch">
                                                {/* Referrals Card - NEW */}
                                                {encounterData.referrals && (
                                                    <Card variant="outline" borderColor="green.200">
                                                        <CardHeader bg="green.50" py={3}>
                                                            <HStack>
                                                                <Heading size="sm" color="green.700">Referrals</Heading>
                                                                <Badge colorScheme="green">Specialist Referrals</Badge>
                                                            </HStack>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                                {/* Physical Therapy Referral */}
                                                                <Box 
                                                                    p={4} 
                                                                    bg={encounterData.referrals.pt_referral === "Yes" ? "green.50" : "gray.50"} 
                                                                    borderRadius="lg"
                                                                    borderWidth="1px"
                                                                    borderColor={encounterData.referrals.pt_referral === "Yes" ? "green.200" : "gray.200"}
                                                                >
                                                                    <VStack spacing={2}>
                                                                        <Text fontWeight="bold" color={encounterData.referrals.pt_referral === "Yes" ? "green.700" : "gray.600"}>
                                                                            Physical Therapy
                                                                        </Text>
                                                                        <Badge 
                                                                            colorScheme={encounterData.referrals.pt_referral === "Yes" ? "green" : "gray"}
                                                                            fontSize="sm"
                                                                            p={1}
                                                                            px={3}
                                                                        >
                                                                            {encounterData.referrals.pt_referral || "Not referred"}
                                                                        </Badge>
                                                                        {encounterData.referrals.pt_referral === "Pending" && (
                                                                            <Text fontSize="xs" color="orange.500">Pending</Text>
                                                                        )}
                                                                    </VStack>
                                                                </Box>

                                                                {/* Pain Clinic Referral */}
                                                                <Box 
                                                                    p={4} 
                                                                    bg={encounterData.referrals.pain_clinic === "Yes" ? "green.50" : "gray.50"} 
                                                                    borderRadius="lg"
                                                                    borderWidth="1px"
                                                                    borderColor={encounterData.referrals.pain_clinic === "Yes" ? "green.200" : "gray.200"}
                                                                >
                                                                    <VStack spacing={2}>
                                                                        <Text fontWeight="bold" color={encounterData.referrals.pain_clinic === "Yes" ? "green.700" : "gray.600"}>
                                                                            Pain Clinic
                                                                        </Text>
                                                                        <Badge 
                                                                            colorScheme={encounterData.referrals.pain_clinic === "Yes" ? "green" : "gray"}
                                                                            fontSize="sm"
                                                                            p={1}
                                                                            px={3}
                                                                        >
                                                                            {encounterData.referrals.pain_clinic || "Not referred"}
                                                                        </Badge>
                                                                        {encounterData.referrals.pain_clinic === "Consider" && (
                                                                            <Text fontSize="xs" color="blue.500">Under Consideration</Text>
                                                                        )}
                                                                    </VStack>
                                                                </Box>

                                                                {/* Surgery Referral */}
                                                                <Box 
                                                                    p={4} 
                                                                    bg={encounterData.referrals.surgery_referral === "Yes" ? "green.50" : "gray.50"} 
                                                                    borderRadius="lg"
                                                                    borderWidth="1px"
                                                                    borderColor={encounterData.referrals.surgery_referral === "Yes" ? "green.200" : "gray.200"}
                                                                >
                                                                    <VStack spacing={2}>
                                                                        <Text fontWeight="bold" color={encounterData.referrals.surgery_referral === "Yes" ? "green.700" : "gray.600"}>
                                                                            Surgery Consultation
                                                                        </Text>
                                                                        <Badge 
                                                                            colorScheme={encounterData.referrals.surgery_referral === "Yes" ? "green" : "gray"}
                                                                            fontSize="sm"
                                                                            p={1}
                                                                            px={3}
                                                                        >
                                                                            {encounterData.referrals.surgery_referral || "Not referred"}
                                                                        </Badge>
                                                                        {encounterData.referrals.surgery_referral === "Consider" && (
                                                                            <Text fontSize="xs" color="blue.500">Under Consideration</Text>
                                                                        )}
                                                                    </VStack>
                                                                </Box>
                                                            </SimpleGrid>

                                                            {/* Summary of Referrals */}
                                                            {(encounterData.referrals.pt_referral === "Yes" || 
                                                            encounterData.referrals.pain_clinic === "Yes" || 
                                                            encounterData.referrals.surgery_referral === "Yes") && (
                                                                <Alert status="success" mt={4} borderRadius="md" fontSize="sm">
                                                                    <AlertIcon />
                                                                    <Text>
                                                                        Patient has been referred to: 
                                                                        {[
                                                                            encounterData.referrals.pt_referral === "Yes" ? " Physical Therapy" : "",
                                                                            encounterData.referrals.pain_clinic === "Yes" ? " Pain Clinic" : "",
                                                                            encounterData.referrals.surgery_referral === "Yes" ? " Surgery" : ""
                                                                        ].filter(Boolean).join(',')}
                                                                    </Text>
                                                                </Alert>
                                                            )}
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* Additional Observations Card */}
                                                {encounterData.notes?.additional_observations && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Additional Observations</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Text>{encounterData.notes.additional_observations}</Text>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* Counseling Card */}
                                                {encounterData.notes?.counseling && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Counseling Provided</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Text>{encounterData.notes.counseling}</Text>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* Patient Questions Card */}
                                                {encounterData.notes?.patient_questions && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Patient Questions & Concerns</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Text>{encounterData.notes.patient_questions}</Text>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* Education Provided Card */}
                                                {encounterData.notes?.education_provided && (
                                                    <Card variant="outline">
                                                        <CardHeader bg="medical.50" py={3}>
                                                            <Heading size="sm">Education Provided</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Text>{encounterData.notes.education_provided}</Text>
                                                        </CardBody>
                                                    </Card>
                                                )}

                                                {/* No Notes Message */}
                                                {!encounterData.notes?.additional_observations && 
                                                !encounterData.notes?.counseling && 
                                                !encounterData.notes?.patient_questions && 
                                                !encounterData.notes?.education_provided && 
                                                !encounterData.referrals && (
                                                    <Card>
                                                        <CardBody>
                                                            <VStack spacing={4} py={8}>
                                                                <InfoIcon boxSize={12} color="gray.400" />
                                                                <Text color="gray.500" fontSize="lg">No notes or referrals available</Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                            </VStack>
                                        ) : (
                                            <Card>
                                                <CardBody>
                                                    <VStack spacing={4} py={8}>
                                                        <InfoIcon boxSize={12} color="gray.400" />
                                                        <Text color="gray.500" fontSize="lg">No notes or referrals available</Text>
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

export default OrthopedicsPatientView;
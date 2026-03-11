import React, { useState } from "react";
import {
    Box,
    Container,
    Heading,
    Text,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Checkbox,
    Button,
    VStack,
    HStack,
    SimpleGrid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Alert,
    AlertIcon,
    IconButton,
    useToast,
    RadioGroup,
    Radio,
    Stack,
    NumberInput,
    NumberInputField,
    Badge,
    Wrap,
    WrapItem,
    Tag,
    TagLabel,
    TagCloseButton,
    Progress,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, CalendarIcon, TimeIcon } from "@chakra-ui/icons";

const OrthopedicsForm = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState(0);

    // Static options
    const genderOptions = ["Male", "Female", "Other"];
    const sideOptions = ["Left", "Right", "Bilateral"];
    const jointOptions = [
        "Shoulder", "Elbow", "Wrist", "Hand", "Fingers",
        "Hip", "Knee", "Ankle", "Foot", "Toes",
        "Cervical Spine", "Thoracic Spine", "Lumbar Spine", "Sacrum"
    ];
    const fractureTypes = [
        "Simple/Closed", "Compound/Open", "Comminuted", "Greenstick",
        "Stress", "Pathological", "Avulsion", "Compression"
    ];
    const ligamentGrades = ["Grade I (Mild)", "Grade II (Moderate)", "Grade III (Severe)"];
       // eslint-disable-next-line no-unused-vars
    const arthritisTypes = ["Osteoarthritis", "Rheumatoid", "Psoriatic", "Gout", "Septic"];
    const painTypes = ["Sharp", "Dull", "Aching", "Throbbing", "Burning", "Shooting"];

    const [formData, setFormData] = useState({
        // SECTION 1: Patient Demographics
        patientId: "ORTH-2024-00345",
        mrn: "98765432",
        name: "Robert Wilson",
        dob: "1978-03-22",
        age: "46",
        gender: "Male",
        contactPhone: "+1 (555) 876-5432",
        contactEmail: "robert.wilson@email.com",
        address: "789 Fitness Ave, Apt 5C",

        height: "178",
        weight: "82",
        bmi: "25.9",
        allergies: "Codeine (nausea), Latex",
        pastMedicalHistory: "Hypertension, Hyperlipidemia, Previous right ankle fracture (2018)",
        pastSurgicalHistory: "Appendectomy (2000), Right ankle ORIF (2018)",
        familyHistory: "Mother: Osteoporosis, Father: Osteoarthritis",
        socialHistory: "Construction worker, non-smoker, social alcohol (weekends)",
        occupation: "Construction supervisor",
        physicalActivity: "Moderate - work involves heavy lifting, weekend hiking",
        smokingStatus: "Never",
        alcoholUse: "Social (2-3 drinks/week)",

        // SECTION 2: Presenting Complaint
        chiefComplaint: "Left knee pain and swelling after fall at work",
        onset: "2024-02-12",
        duration: "3 days",
        progression: "Worsening pain, increased swelling",
        painLocation: "Left knee, medial aspect",
        painIntensity: "7",
        painType: "Sharp",
        painRadiation: "To thigh and calf",
        swelling: "Yes",
        swellingSeverity: "Moderate",
        redness: "Yes",
        warmth: "Yes",
        traumaMechanism: "Slipped on wet surface, twisted left knee",
        traumaTime: "72 hours ago",
        functionalLimitation: "Difficulty walking, cannot bear full weight",
        mobilityLimitation: "Limited walking distance, stairs painful",
        adlLimitation: "Difficulty with self-care, dressing",
        rangeMotionLoss: "Limited flexion and extension",
        numbness: "No",
        tingling: "No",
        weakness: "Yes - quadriceps weakness",

        // SECTION 3: Physical Examination
        inspection: "Left knee swollen, ecchymosis medial aspect, no open wounds",
        deformity: "No obvious deformity",
        scars: "No previous scars on left knee",
        palpationTenderness: "Tender over medial joint line, patella",
        // warmth: "Mild warmth over medial aspect",
        crepitus: "Mild crepitus with movement",

        // Range of Motion
        romActiveFlexion: "90°",
        romPassiveFlexion: "100°",
        romActiveExtension: "-10°",
        romPassiveExtension: "0°",

        // Strength Testing
        quadStrength: "4/5",
        hamstringStrength: "4+/5",
        calfStrength: "5/5",

        // Neurovascular
        pulses: "DP and PT pulses 2+ bilaterally",
        sensation: "Intact to light touch throughout",
        motorFunction: "Weak quadriceps (4/5), otherwise normal",

        // Gait
        gait: "Antalgic gait favoring left leg, uses single crutch",

        // Special Tests
        specialTests: "Lachman: Grade II laxity, McMurray: Positive for medial meniscus, Valgus stress: Painful",
        jointInstability: "Mild anterior instability",

        // SECTION 4: Imaging & Investigations
        xrayDone: "Yes",
        xrayFindings: "No fracture, small joint effusion, mild medial joint space narrowing",
        mriDone: "Pending",
        mriIndication: "Suspected ligament/meniscus injury",
        ctDone: "No",
        ultrasoundDone: "No",
        dexaDone: "No",

        // Lab Tests
        labTests: ["CBC", "ESR", "CRP"],
        cbcResults: "Normal",
        esrResults: "25 mm/hr",
        crpResults: "12 mg/L",
        otherLabs: "None",

        // SECTION 5: Provisional Diagnosis
        primaryCondition: "Medial meniscus tear",
        suspectedCondition: "ACL sprain, medial collateral ligament injury",
        affectedSide: "Left",
        affectedJoint: "Knee",
        severity: "Moderate",
        fractureType: "Not applicable",
        ligamentGrade: "Grade II (Moderate)",

        // Differential Diagnoses
        differentials: ["Patellar dislocation", "Tibial plateau fracture", "Osteoarthritis flare", "Septic arthritis"],

        // SECTION 6: Management Plan
        // Non-surgical
        immobilizationType: "Knee brace with hinged support",
        physiotherapy: "Yes - start after acute phase",
        painMedications: "Naproxen 500mg BID, Acetaminophen PRN",
        activityModification: "Weight-bearing as tolerated with crutches, avoid twisting",

        // Surgical
        surgicalPlan: "Consider arthroscopy if no improvement in 4-6 weeks",
        fractureFixation: "Not applicable",
        arthroscopy: "Possible medial meniscectomy/repair",
        jointReplacement: "Not indicated",
        postOpCare: "If surgery: 2 weeks NWB, then PT",

        // Follow-up
        followUpTimeline: "2 weeks for re-evaluation",
        repeatImaging: "Repeat MRI if no improvement",
        rehabMilestones: [
            "Week 1-2: Pain control, ROM exercises",
            "Week 3-4: Weight-bearing as tolerated, strengthening",
            "Week 5-6: Return to work if sedentary",
            "Week 7-8: Sport-specific training if desired"
        ],
        redFlags: "Increased swelling, fever, worsening pain, numbness in foot",

        // SECTION 7: Physician Notes
        additionalObservations: "Patient is motivated for recovery, good support system at home",
        counseling: "Discussed injury mechanism, expected recovery timeline, importance of PT",
        patientQuestions: "When can I return to work? Will I need surgery?",
        referrals: ["Physical Therapy", "Orthopedic Surgery Consult"],
        ptReferral: "Yes",
        painClinic: "Not needed at this time",
        surgeryReferral: "Consider if no improvement",
        education: "Given knee care instructions, RICE protocol, brace use guidance"
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            const arr = formData[name] || [];
            if (checked) {
                setFormData({ ...formData, [name]: [...arr, value] });
            } else {
                setFormData({ ...formData, [name]: arr.filter(item => item !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
         // eslint-disable-next-line no-unused-vars
    const handleArrayChange = (index, field, value, arrayName) => {
        const updatedArray = [...formData[arrayName]];
        if (!updatedArray[index]) updatedArray[index] = {};
        updatedArray[index][field] = value;
        setFormData({ ...formData, [arrayName]: updatedArray });
    };
         // eslint-disable-next-line no-unused-vars
    const addArrayItem = (arrayName, template) => {
        setFormData({ ...formData, [arrayName]: [...formData[arrayName], template] });
    };
         // eslint-disable-next-line no-unused-vars
    const removeArrayItem = (index, arrayName) => {
        const updatedArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData({ ...formData, [arrayName]: updatedArray });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Orthopedics Form Data:", formData);
        toast({
            title: "Form Submitted",
            description: "Orthopedics encounter form has been saved successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };

    const handleNextTab = () => {
        setActiveTab((prev) => Math.min(prev + 1, 6));
    };

    const handlePrevTab = () => {
        setActiveTab((prev) => Math.max(prev - 1, 0));
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                {/* Header */}
                <Box textAlign="left">
                    <Heading color="medical.700" mb={2}>Orthopedics Patient Encounter Form</Heading>
                    <Text color="gray.600">Musculoskeletal assessment and management tool</Text>
                    <HStack justify="center" mt={3} spacing={4}>
                        <Badge colorScheme="blue" fontSize="sm">Patient ID: {formData.patientId}</Badge>
                        <Badge colorScheme="green" fontSize="sm">Age: {formData.age} years</Badge>
                        <Badge colorScheme="purple" fontSize="sm">Affected: {formData.affectedSide} {formData.affectedJoint}</Badge>
                    </HStack>
                </Box>

                <Alert status="info" borderRadius="lg">
                    <AlertIcon />
                    {formData.primaryCondition} | Severity: {formData.severity} | Onset: {formData.duration} ago
                </Alert>

                {/* Tabs Navigation */}
                <Card>
                    <CardBody p={0}>
                        <Tabs index={activeTab} onChange={setActiveTab} isLazy colorScheme="medical">
                            <TabList overflowX="auto" overflowY="hidden" px={4} pt={4}>
                                <Tab>Demographics</Tab>
                                <Tab>Symptoms</Tab>
                                <Tab>Physical Exam</Tab>
                                <Tab>Imaging</Tab>
                                <Tab>Provisional Dx</Tab>
                                <Tab>Management</Tab>
                                <Tab>Notes</Tab>
                            </TabList>

                            <TabPanels>
                                {/* TAB 1: Patient Demographics */}
                                <TabPanel>
                                    <VStack spacing={6} align="stretch">
                                        {/* Patient Identification */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Patient Identification</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Patient ID</FormLabel>
                                                        <Input name="patientId" value={formData.patientId} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>MRN</FormLabel>
                                                        <Input name="mrn" value={formData.mrn} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <Input name="name" value={formData.name} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Date of Birth</FormLabel>
                                                        <Input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Age</FormLabel>
                                                        <NumberInput value={formData.age}>
                                                            <NumberInputField name="age" onChange={handleChange} />
                                                        </NumberInput>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Gender</FormLabel>
                                                        <Select name="gender" value={formData.gender} onChange={handleChange}>
                                                            {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Contact Information */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Contact Information</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Phone</FormLabel>
                                                        <Input name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Email</FormLabel>
                                                        <Input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                                        <FormLabel>Address</FormLabel>
                                                        <Textarea name="address" value={formData.address} onChange={handleChange} rows={2} />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Physical Metrics */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Physical Metrics</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Height (cm)</FormLabel>
                                                        <NumberInput value={formData.height}>
                                                            <NumberInputField name="height" onChange={handleChange} />
                                                        </NumberInput>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Weight (kg)</FormLabel>
                                                        <NumberInput value={formData.weight}>
                                                            <NumberInputField name="weight" onChange={handleChange} />
                                                        </NumberInput>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>BMI</FormLabel>
                                                        <Input name="bmi" value={formData.bmi} onChange={handleChange} />
                                                        <Progress value={(formData.bmi / 40) * 100} size="sm" colorScheme={formData.bmi > 30 ? "red" : formData.bmi > 25 ? "orange" : "green"} mt={2} />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Medical History */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Medical History</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Allergies</FormLabel>
                                                            <Input name="allergies" value={formData.allergies} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Past Medical History</FormLabel>
                                                            <Textarea name="pastMedicalHistory" value={formData.pastMedicalHistory} onChange={handleChange} rows={3} />
                                                        </FormControl>
                                                    </VStack>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Past Surgical History</FormLabel>
                                                            <Textarea name="pastSurgicalHistory" value={formData.pastSurgicalHistory} onChange={handleChange} rows={3} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Family History</FormLabel>
                                                            <Textarea name="familyHistory" value={formData.familyHistory} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                    </VStack>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Social History */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Social & Occupational History</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Occupation</FormLabel>
                                                        <Input name="occupation" value={formData.occupation} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Physical Activity Level</FormLabel>
                                                        <Select name="physicalActivity" value={formData.physicalActivity} onChange={handleChange}>
                                                            <option value="Sedentary">Sedentary</option>
                                                            <option value="Light">Light</option>
                                                            <option value="Moderate">Moderate</option>
                                                            <option value="Heavy">Heavy</option>
                                                            <option value="Athlete">Athlete</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Smoking Status</FormLabel>
                                                        <Select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange}>
                                                            <option value="Never">Never</option>
                                                            <option value="Former">Former</option>
                                                            <option value="Current">Current</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Alcohol Use</FormLabel>
                                                        <Input name="alcoholUse" value={formData.alcoholUse} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                                        <FormLabel>Social History</FormLabel>
                                                        <Textarea name="socialHistory" value={formData.socialHistory} onChange={handleChange} rows={2} />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>
                                    </VStack>
                                </TabPanel>

                                {/* TAB 2: Presenting Complaint */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Presenting Complaint & Symptoms</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                {/* Chief Complaint */}
                                                <FormControl>
                                                    <FormLabel>Chief Complaint</FormLabel>
                                                    <Textarea name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} rows={2} />
                                                </FormControl>

                                                {/* Onset & Duration */}
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Onset Date</FormLabel>
                                                        <Input type="date" name="onset" value={formData.onset} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Duration</FormLabel>
                                                        <Input name="duration" value={formData.duration} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Progression</FormLabel>
                                                        <Select name="progression" value={formData.progression} onChange={handleChange}>
                                                            <option value="Improving">Improving</option>
                                                            <option value="Stable">Stable</option>
                                                            <option value="Worsening">Worsening</option>
                                                            <option value="Fluctuating">Fluctuating</option>
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>

                                                <Divider />

                                                {/* Pain Characteristics */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Pain Characteristics</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Pain Location</FormLabel>
                                                            <Input name="painLocation" value={formData.painLocation} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Pain Intensity (0-10)</FormLabel>
                                                            <HStack>
                                                                <Slider
                                                                    aria-label="pain-intensity"
                                                                    value={parseInt(formData.painIntensity)}
                                                                    min={0}
                                                                    max={10}
                                                                    step={1}
                                                                    onChange={(val) => setFormData({ ...formData, painIntensity: val.toString() })}
                                                                >
                                                                    <SliderTrack>
                                                                        <SliderFilledTrack bg="red.500" />
                                                                    </SliderTrack>
                                                                    <SliderThumb />
                                                                </Slider>
                                                                <Text fontWeight="bold" minW="2rem">{formData.painIntensity}/10</Text>
                                                            </HStack>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Pain Type</FormLabel>
                                                            <Select name="painType" value={formData.painType} onChange={handleChange}>
                                                                {painTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                            </Select>
                                                        </FormControl>
                                                    </SimpleGrid>
                                                    <FormControl mt={4}>
                                                        <FormLabel>Radiation</FormLabel>
                                                        <Input name="painRadiation" value={formData.painRadiation} onChange={handleChange} />
                                                    </FormControl>
                                                </Box>

                                                <Divider />

                                                {/* Swelling & Trauma */}
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Swelling</FormLabel>
                                                            <Select name="swelling" value={formData.swelling} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Mild">Mild</option>
                                                                <option value="Moderate">Moderate</option>
                                                                <option value="Severe">Severe</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Redness</FormLabel>
                                                            <Select name="redness" value={formData.redness} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Warmth</FormLabel>
                                                            <Select name="warmth" value={formData.warmth} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                            </Select>
                                                        </FormControl>
                                                    </VStack>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Trauma Mechanism</FormLabel>
                                                            <Textarea name="traumaMechanism" value={formData.traumaMechanism} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Time Since Injury</FormLabel>
                                                            <Input name="traumaTime" value={formData.traumaTime} onChange={handleChange} />
                                                        </FormControl>
                                                    </VStack>
                                                </SimpleGrid>

                                                <Divider />

                                                {/* Functional Limitations */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Functional Limitations</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Mobility Limitation</FormLabel>
                                                            <Textarea name="mobilityLimitation" value={formData.mobilityLimitation} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>ADL Limitation</FormLabel>
                                                            <Textarea name="adlLimitation" value={formData.adlLimitation} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Range of Motion Loss</FormLabel>
                                                            <Input name="rangeMotionLoss" value={formData.rangeMotionLoss} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Functional Limitation</FormLabel>
                                                            <Textarea name="functionalLimitation" value={formData.functionalLimitation} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Associated Symptoms */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Associated Symptoms</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Numbness</FormLabel>
                                                            <Select name="numbness" value={formData.numbness} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Tingling</FormLabel>
                                                            <Select name="tingling" value={formData.tingling} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Weakness</FormLabel>
                                                            <Select name="weakness" value={formData.weakness} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                            </Select>
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 3: Physical Examination */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Physical Examination</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                {/* Inspection & Palpation */}
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Inspection Findings</FormLabel>
                                                            <Textarea name="inspection" value={formData.inspection} onChange={handleChange} rows={3} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Deformity</FormLabel>
                                                            <Input name="deformity" value={formData.deformity} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Scars</FormLabel>
                                                            <Input name="scars" value={formData.scars} onChange={handleChange} />
                                                        </FormControl>
                                                    </VStack>
                                                    <VStack spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Palpation Tenderness</FormLabel>
                                                            <Textarea name="palpationTenderness" value={formData.palpationTenderness} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Warmth on Palpation</FormLabel>
                                                            <Input name="warmth" value={formData.warmth} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Crepitus</FormLabel>
                                                            <Input name="crepitus" value={formData.crepitus} onChange={handleChange} />
                                                        </FormControl>
                                                    </VStack>
                                                </SimpleGrid>

                                                <Divider />

                                                {/* Range of Motion */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Range of Motion</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Active Flexion</FormLabel>
                                                            <Input name="romActiveFlexion" value={formData.romActiveFlexion} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Passive Flexion</FormLabel>
                                                            <Input name="romPassiveFlexion" value={formData.romPassiveFlexion} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Active Extension</FormLabel>
                                                            <Input name="romActiveExtension" value={formData.romActiveExtension} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Passive Extension</FormLabel>
                                                            <Input name="romPassiveExtension" value={formData.romPassiveExtension} onChange={handleChange} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Strength Testing */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Strength Testing (MRC Scale 0-5)</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Quadriceps Strength</FormLabel>
                                                            <Input name="quadStrength" value={formData.quadStrength} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Hamstring Strength</FormLabel>
                                                            <Input name="hamstringStrength" value={formData.hamstringStrength} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Calf Strength</FormLabel>
                                                            <Input name="calfStrength" value={formData.calfStrength} onChange={handleChange} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Neurovascular Status */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Neurovascular Status</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>Pulses</FormLabel>
                                                            <Input name="pulses" value={formData.pulses} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Sensation</FormLabel>
                                                            <Input name="sensation" value={formData.sensation} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Motor Function</FormLabel>
                                                            <Input name="motorFunction" value={formData.motorFunction} onChange={handleChange} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Gait & Special Tests */}
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <FormControl>
                                                        <FormLabel>Gait Assessment</FormLabel>
                                                        <Textarea name="gait" value={formData.gait} onChange={handleChange} rows={2} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Special Tests</FormLabel>
                                                        <Textarea name="specialTests" value={formData.specialTests} onChange={handleChange} rows={2} />
                                                    </FormControl>
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                                        <FormLabel>Joint Instability</FormLabel>
                                                        <Input name="jointInstability" value={formData.jointInstability} onChange={handleChange} />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 4: Imaging & Investigations */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Imaging & Investigations</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={8} align="stretch">
                                                {/* Imaging Studies */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Imaging Studies</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                        <VStack spacing={4}>
                                                            <FormControl>
                                                                <FormLabel>X-ray Done</FormLabel>
                                                                <Select name="xrayDone" value={formData.xrayDone} onChange={handleChange}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="Pending">Pending</option>
                                                                </Select>
                                                            </FormControl>
                                                            {formData.xrayDone === "Yes" && (
                                                                <FormControl>
                                                                    <FormLabel>X-ray Findings</FormLabel>
                                                                    <Textarea name="xrayFindings" value={formData.xrayFindings} onChange={handleChange} rows={3} />
                                                                </FormControl>
                                                            )}
                                                            <FormControl>
                                                                <FormLabel>MRI Done</FormLabel>
                                                                <Select name="mriDone" value={formData.mriDone} onChange={handleChange}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Planned">Planned</option>
                                                                </Select>
                                                            </FormControl>
                                                            {formData.mriDone !== "No" && (
                                                                <FormControl>
                                                                    <FormLabel>MRI Indication</FormLabel>
                                                                    <Textarea name="mriIndication" value={formData.mriIndication} onChange={handleChange} rows={2} />
                                                                </FormControl>
                                                            )}
                                                        </VStack>
                                                        <VStack spacing={4}>
                                                            <FormControl>
                                                                <FormLabel>CT Scan Done</FormLabel>
                                                                <Select name="ctDone" value={formData.ctDone} onChange={handleChange}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="Consider">Consider if needed</option>
                                                                </Select>
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel>Ultrasound Done</FormLabel>
                                                                <Select name="ultrasoundDone" value={formData.ultrasoundDone} onChange={handleChange}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                </Select>
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel>Bone Density (DEXA)</FormLabel>
                                                                <Select name="dexaDone" value={formData.dexaDone} onChange={handleChange}>
                                                                    <option value="No">No</option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="Consider">Consider if indicated</option>
                                                                </Select>
                                                            </FormControl>
                                                        </VStack>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Laboratory Tests */}
                                                <Box>
                                                    <Heading size="sm" mb={4}>Laboratory Tests</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3} mb={4}>
                                                        {["CBC", "ESR", "CRP", "Rheumatoid Factor", "Uric Acid", "Calcium", "Vitamin D", "ALP"].map(test => (
                                                            <Checkbox
                                                                key={test}
                                                                name="labTests"
                                                                value={test}
                                                                isChecked={formData.labTests.includes(test)}
                                                                onChange={handleChange}
                                                            >
                                                                {test}
                                                            </Checkbox>
                                                        ))}
                                                    </SimpleGrid>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel>CBC Results</FormLabel>
                                                            <Input name="cbcResults" value={formData.cbcResults} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>ESR Results</FormLabel>
                                                            <Input name="esrResults" value={formData.esrResults} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>CRP Results</FormLabel>
                                                            <Input name="crpResults" value={formData.crpResults} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Other Lab Results</FormLabel>
                                                            <Input name="otherLabs" value={formData.otherLabs} onChange={handleChange} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 5: Provisional Diagnosis */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Provisional Diagnosis</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                {/* Primary Condition */}
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <FormControl>
                                                        <FormLabel>Primary Suspected Condition</FormLabel>
                                                        <Input name="primaryCondition" value={formData.primaryCondition} onChange={handleChange} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Other Suspected Conditions</FormLabel>
                                                        <Input name="suspectedCondition" value={formData.suspectedCondition} onChange={handleChange} />
                                                    </FormControl>
                                                </SimpleGrid>

                                                {/* Location & Side */}
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Affected Side</FormLabel>
                                                        <Select name="affectedSide" value={formData.affectedSide} onChange={handleChange}>
                                                            {sideOptions.map(side => <option key={side} value={side}>{side}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Affected Joint/Limb</FormLabel>
                                                        <Select name="affectedJoint" value={formData.affectedJoint} onChange={handleChange}>
                                                            {jointOptions.map(joint => <option key={joint} value={joint}>{joint}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Severity</FormLabel>
                                                        <Select name="severity" value={formData.severity} onChange={handleChange}>
                                                            <option value="Mild">Mild</option>
                                                            <option value="Moderate">Moderate</option>
                                                            <option value="Severe">Severe</option>
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>

                                                {/* Type & Grade */}
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Fracture Type (if applicable)</FormLabel>
                                                        <Select name="fractureType" value={formData.fractureType} onChange={handleChange}>
                                                            <option value="Not applicable">Not applicable</option>
                                                            {fractureTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Ligament Grade (if applicable)</FormLabel>
                                                        <Select name="ligamentGrade" value={formData.ligamentGrade} onChange={handleChange}>
                                                            <option value="Not applicable">Not applicable</option>
                                                            {ligamentGrades.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>

                                                {/* Differential Diagnoses */}
                                                <FormControl>
                                                    <FormLabel>Differential Diagnoses</FormLabel>
                                                    <Wrap spacing={2} mb={2}>
                                                        {formData.differentials.map((dx, index) => (
                                                            <WrapItem key={index}>
                                                                <Tag size="md" variant="subtle" colorScheme="orange">
                                                                    <TagLabel>{dx}</TagLabel>
                                                                    <TagCloseButton onClick={() => {
                                                                        const updated = formData.differentials.filter((_, i) => i !== index);
                                                                        setFormData({ ...formData, differentials: updated });
                                                                    }} />
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                    <HStack>
                                                        <Input
                                                            placeholder="Add differential diagnosis"
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && e.target.value) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        differentials: [...formData.differentials, e.target.value]
                                                                    });
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                        <Button onClick={() => {
                                                            const input = document.querySelector('input[placeholder="Add differential diagnosis"]');
                                                            if (input.value) {
                                                                setFormData({
                                                                    ...formData,
                                                                    differentials: [...formData.differentials, input.value]
                                                                });
                                                                input.value = '';
                                                            }
                                                        }}>Add</Button>
                                                    </HStack>
                                                </FormControl>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 6: Management Plan */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Management Plan</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={8} align="stretch">
                                                {/* Non-surgical Management */}
                                                <Box>
                                                    <Heading size="sm" mb={4} color="medical.600">Non-surgical Management</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                        <FormControl>
                                                            <FormLabel>Immobilization Type</FormLabel>
                                                            <Select name="immobilizationType" value={formData.immobilizationType} onChange={handleChange}>
                                                                <option value="None">None</option>
                                                                <option value="Cast">Cast</option>
                                                                <option value="Splint">Splint</option>
                                                                <option value="Brace">Brace</option>
                                                                <option value="Slings">Slings</option>
                                                                <option value="Crutches">Crutches/Walking Aid</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Physiotherapy</FormLabel>
                                                            <Select name="physiotherapy" value={formData.physiotherapy} onChange={handleChange}>
                                                                <option value="No">No</option>
                                                                <option value="Yes">Yes</option>
                                                                <option value="Deferred">Deferred until healing</option>
                                                            </Select>
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Pain Management</FormLabel>
                                                            <Textarea name="painMedications" value={formData.painMedications} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Activity Modification</FormLabel>
                                                            <Textarea name="activityModification" value={formData.activityModification} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Surgical Management */}
                                                <Box>
                                                    <Heading size="sm" mb={4} color="medical.600">Surgical/Interventional Management</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                        <FormControl>
                                                            <FormLabel>Surgical Plan</FormLabel>
                                                            <Textarea name="surgicalPlan" value={formData.surgicalPlan} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Fracture Fixation</FormLabel>
                                                            <Input name="fractureFixation" value={formData.fractureFixation} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Arthroscopy</FormLabel>
                                                            <Input name="arthroscopy" value={formData.arthroscopy} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Joint Replacement</FormLabel>
                                                            <Input name="jointReplacement" value={formData.jointReplacement} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
                                                            <FormLabel>Post-operative Care Plan</FormLabel>
                                                            <Textarea name="postOpCare" value={formData.postOpCare} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </Box>

                                                <Divider />

                                                {/* Follow-up Plan */}
                                                <Box>
                                                    <Heading size="sm" mb={4} color="medical.600">Follow-up Plan</Heading>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                        <FormControl>
                                                            <FormLabel>Follow-up Timeline</FormLabel>
                                                            <Input name="followUpTimeline" value={formData.followUpTimeline} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Repeat Imaging Schedule</FormLabel>
                                                            <Input name="repeatImaging" value={formData.repeatImaging} onChange={handleChange} />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Red Flag Symptoms</FormLabel>
                                                            <Textarea name="redFlags" value={formData.redFlags} onChange={handleChange} rows={2} />
                                                        </FormControl>
                                                    </SimpleGrid>

                                                    <FormControl mt={4}>
                                                        <FormLabel>Rehabilitation Milestones</FormLabel>
                                                        <VStack align="stretch" spacing={2} mt={2}>
                                                            {formData.rehabMilestones.map((milestone, index) => (
                                                                <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                                                                    <Text flex={1}>{milestone}</Text>
                                                                    <IconButton
                                                                        aria-label="Remove milestone"
                                                                        icon={<DeleteIcon />}
                                                                        size="sm"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            const updated = formData.rehabMilestones.filter((_, i) => i !== index);
                                                                            setFormData({ ...formData, rehabMilestones: updated });
                                                                        }}
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                        <HStack mt={2}>
                                                            <Input
                                                                placeholder="Add rehabilitation milestone"
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter' && e.target.value) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            rehabMilestones: [...formData.rehabMilestones, e.target.value]
                                                                        });
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <Button onClick={() => {
                                                                const input = document.querySelector('input[placeholder="Add rehabilitation milestone"]');
                                                                if (input.value) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        rehabMilestones: [...formData.rehabMilestones, input.value]
                                                                    });
                                                                    input.value = '';
                                                                }
                                                            }}>Add</Button>
                                                        </HStack>
                                                    </FormControl>
                                                </Box>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>

                                {/* TAB 7: Physician Notes */}
                                <TabPanel>
                                    <Card>
                                        <CardHeader bg="medical.50">
                                            <Heading size="md">Physician Notes & Counseling</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <VStack spacing={6}>
                                                <FormControl>
                                                    <FormLabel>Additional Observations</FormLabel>
                                                    <Textarea name="additionalObservations" value={formData.additionalObservations} onChange={handleChange} rows={3} />
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>Counseling & Education Provided</FormLabel>
                                                    <Textarea name="counseling" value={formData.counseling} onChange={handleChange} rows={3} />
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>Patient Questions & Concerns</FormLabel>
                                                    <Textarea name="patientQuestions" value={formData.patientQuestions} onChange={handleChange} rows={2} />
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>Education Provided</FormLabel>
                                                    <Textarea name="education" value={formData.education} onChange={handleChange} rows={2} />
                                                </FormControl>

                                                <Box width="100%">
                                                    <FormLabel mb={3}>Referrals</FormLabel>
                                                    <Wrap spacing={2}>
                                                        {formData.referrals.map((ref, index) => (
                                                            <WrapItem key={index}>
                                                                <Tag size="md" colorScheme="blue">
                                                                    <TagLabel>{ref}</TagLabel>
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                </Box>

                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="100%">
                                                    <FormControl>
                                                        <FormLabel>Physical Therapy Referral</FormLabel>
                                                        <Select name="ptReferral" value={formData.ptReferral} onChange={handleChange}>
                                                            <option value="No">No</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="Pending">Pending</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Pain Clinic Referral</FormLabel>
                                                        <Select name="painClinic" value={formData.painClinic} onChange={handleChange}>
                                                            <option value="No">No</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="Consider">Consider if needed</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Surgery Referral</FormLabel>
                                                        <Select name="surgeryReferral" value={formData.surgeryReferral} onChange={handleChange}>
                                                            <option value="No">No</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="Consider">Consider if no improvement</option>
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CardBody>
                </Card>

                {/* Navigation Buttons */}
                <HStack justify="space-between" pt={4}>
                    <Button
                        onClick={handlePrevTab}
                        isDisabled={activeTab === 0}
                        variant="outline"
                        colorScheme="medical"
                        leftIcon={<TimeIcon />}
                    >
                        Previous
                    </Button>

                    <HStack>
                        <Badge colorScheme="medical" fontSize="sm">
                            Step {activeTab + 1} of 7
                        </Badge>
                    </HStack>

                    {activeTab < 6 ? (
                        <Button onClick={handleNextTab} colorScheme="medical" rightIcon={<CalendarIcon />}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} colorScheme="medical" size="lg">
                            Submit Orthopedics Form
                        </Button>
                    )}
                </HStack>
            </VStack>
        </Container>
    );
};

export default OrthopedicsForm;
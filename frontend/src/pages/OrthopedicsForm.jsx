import React, { useState,useEffect } from "react";
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
import { AddIcon, DeleteIcon, CalendarIcon, TimeIcon ,InfoIcon} from "@chakra-ui/icons";
import { 
    submitCompleteForm, 
    complaintsApi,
    physicalExamApi,
    imagingApi,
    labsApi,
    diagnosesApi,
    managementApi,
    rehabMilestonesApi,
    referralsApi,
    notesApi,
    patientApi,
    encounterApi
} from "../services/orthopedicsApi";

import { useNavigate } from "react-router-dom";
import { useOrthopedics } from "../context/OrthopedicsContext";
import { formatDateForInput,cleanPhoneNumber,calculateAge,generatePatientVisitId } from "../services/orthopedicsHelpers";





const OrthopedicsForm = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { editData, formMode, encounterId, patientId, clearEditMode } = useOrthopedics();
    const [activeTab, setActiveTab] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalData, setOriginalData] = useState(null); // Store original data for change tracking

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
    const painTypes = ["Sharp", "Dull", "Aching", "Throbbing", "Burning", "Shooting"];
    const [patientsList, setPatientsList] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState("");

    // Fetch patients list on component mount
    useEffect(() => {
        fetchPatientsList();
    }, []);

    // Fetch patients list
    const fetchPatientsList = async () => {
        setLoadingPatients(true);
        try {
            const response = await patientApi.getAllPatients(1, 100);
            setPatientsList(response.data || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
            toast({
                title: "Error",
                description: "Failed to load patients list",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoadingPatients(false);
        }
    };

    // Add this helper function at the top of your component


    // Handle patient selection
    const handlePatientSelect = (patientId) => {
        setSelectedPatientId(patientId);
        
        if (!patientId) {
            // If "New Patient" selected, clear form
            setFormData(initialFormState);
            return;
        }

        const selectedPatient = patientsList.find(p => p.patient_id === parseInt(patientId));
        if (selectedPatient) {
              const formattedDob = formatDateForInput(selectedPatient.dob);
            // Auto-fill patient details
            setFormData(prevData => ({
                ...prevData,
                // Patient Information
                name: selectedPatient.patient_name || "",
                dob:formattedDob || "",
                gender: selectedPatient.gender || "",
                bloodGroup: selectedPatient.blood_group || "",
                contactPhone: selectedPatient.contact_number || "",
                contactEmail: selectedPatient.email || "",
                address: selectedPatient.address || "",
                emergencyName: selectedPatient.emergency_name || "",
                emergencyContactNumber: selectedPatient.emergency_contact_number || "",
                

                // Keep other form fields as they are
            }));
            
            toast({
                title: "Patient Loaded",
                description: `${selectedPatient.patient_name}'s details have been auto-filled`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Initial empty form state
    const initialFormState = {
        // SECTION 1: Patient Demographics
        patientId: "",
        name: "",
        dob: "",
        age: "",
        gender: "",
        bloodGroup: "",
        contactPhone: "",
        contactEmail: "",
        address: "",
        emergencyName: "",
        emergencyContactNumber: "",

        height: "",
        weight: "",
        bmi: "",
        allergies: "",
        pastMedicalHistory: "",
        pastSurgicalHistory: "",
        familyHistory: "",
        socialHistory: "",
        occupation: "",
        physicalActivity: "",
        smokingStatus: "",
        alcoholUse: "",

        // SECTION 2: Presenting Complaint
        chiefComplaint: "",
        onset: "",
        duration: "",
        progression: "",
        painLocation: "",
        painIntensity: "",
        painType: "",
        painRadiation: "",
        swelling: "",
        redness: "",
        warmth: "",
        traumaMechanism: "",
        traumaTime: "",
        functionalLimitation: "",
        mobilityLimitation: "",
        adlLimitation: "",
        rangeMotionLoss: "",
        numbness: "",
        tingling: "",
        weakness: "",

        // SECTION 3: Physical Examination
        inspection: "",
        deformity: "",
        scars: "",
        palpationTenderness: "",
        palpationWarmth: "",
        crepitus: "",
        romActiveFlexion: "",
        romPassiveFlexion: "",
        romActiveExtension: "",
        romPassiveExtension: "",
        quadStrength: "",
        hamstringStrength: "",
        calfStrength: "",
        pulses: "",
        sensation: "",
        motorFunction: "",
        gait: "",
        specialTests: "",
        jointInstability: "",

        // SECTION 4: Imaging & Investigations
        xrayDone: "",
        xrayFindings: "",
        mriDone: "",
        mriIndication: "",
        ctDone: "",
        ultrasoundDone: "",
        dexaDone: "",

        // Lab Tests
        labTests: [],
        cbcResults: "",
        esrResults: "",
        crpResults: "",
        otherLabs: "",

        // SECTION 5: Provisional Diagnosis
        primaryCondition: "",
        suspectedCondition: "",
        affectedSide: "",
        affectedJoint: "",
        severity: "",
        fractureType: "Not applicable",
        ligamentGrade: "Not applicable",
        differentials: [],

        // SECTION 6: Management Plan
        immobilizationType: "",
        physiotherapy: "",
        painMedications: "",
        activityModification: "",
        surgicalPlan: "",
        fractureFixation: "",
        arthroscopy: "",
        jointReplacement: "",
        postOpCare: "",
        followUpTimeline: "",
        repeatImaging: "",
        rehabMilestones: [],
        redFlags: "",

        // SECTION 7: Physician Notes
        additionalObservations: "",
        counseling: "",
        patientQuestions: "",
        referrals: [],
        ptReferral: "",
        painClinic: "",
        surgeryReferral: "",
        education: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    // Load edit data when component mounts
    useEffect(() => {
        if (formMode === 'edit' && editData) {
            const formattedDob = formatDateForInput(editData.encounter?.dob);
            
            // Map the API data to form fields
            const mappedData = {
                // Patient Information
                patientId: editData.encounter.patient_id_at_visit || "",
                name: editData.encounter.patient_name || "",
                dob: formattedDob || "",
                age:calculateAge(formattedDob)||"",
                gender: editData.encounter.gender || "",
                bloodGroup: editData.encounter.blood_group || "",
                contactPhone: editData.encounter.contact_number || "",
                contactEmail: editData.encounter.email || "",
                address: editData.encounter.address || "",
                emergencyName: editData.encounter.emergency_name || "",
                emergencyContactNumber: editData.encounter.emergency_contact_number || "",

                // Encounter Information
                height: editData.encounter.height_cm || "",
                weight: editData.encounter.weight_kg || "",
                bmi: editData.encounter.bmi || "",
                allergies: editData.encounter.allergies || "",
                pastMedicalHistory: editData.encounter.past_medical_history || "",
                pastSurgicalHistory: editData.encounter.past_surgical_history || "",
                familyHistory: editData.encounter.family_history || "",
                socialHistory: editData.encounter.social_history || "",
                occupation: editData.encounter.occupation || "",
                physicalActivity: editData.encounter.physical_activity_level || "",
                smokingStatus: editData.encounter.smoking_status || "",
                alcoholUse: editData.encounter.alcohol_use || "",

                // Complaints
                chiefComplaint: editData.complaints?.chief_complaint || "",
                onset: editData.complaints?.onset_date || "",
                duration: editData.complaints?.duration || "",
                progression: editData.complaints?.progression || "",
                painLocation: editData.complaints?.pain_location || "",
                painIntensity: editData.complaints?.pain_intensity || "",
                painType: editData.complaints?.pain_type || "",
                painRadiation: editData.complaints?.pain_radiation || "",
                swelling: editData.complaints?.swelling || "",
                redness: editData.complaints?.redness || "",
                warmth: editData.complaints?.warmth || "",
                traumaMechanism: editData.complaints?.trauma_mechanism || "",
                traumaTime: editData.complaints?.trauma_time || "",
                functionalLimitation: editData.complaints?.functional_limitation || "",
                mobilityLimitation: editData.complaints?.mobility_limitation || "",
                adlLimitation: editData.complaints?.adl_limitation || "",
                rangeMotionLoss: editData.complaints?.range_motion_loss || "",
                numbness: editData.complaints?.numbness || "",
                tingling: editData.complaints?.tingling || "",
                weakness: editData.complaints?.weakness || "",

                // Physical Exam
                inspection: editData.physical_exam?.inspection || "",
                deformity: editData.physical_exam?.deformity || "",
                scars: editData.physical_exam?.scars || "",
                palpationTenderness: editData.physical_exam?.palpation_tenderness || "",
                palpationWarmth: editData.physical_exam?.warmth_on_palpation || "",
                crepitus: editData.physical_exam?.crepitus || "",
                romActiveFlexion: editData.physical_exam?.rom_active_flexion || "",
                romPassiveFlexion: editData.physical_exam?.rom_passive_flexion || "",
                romActiveExtension: editData.physical_exam?.rom_active_extension || "",
                romPassiveExtension: editData.physical_exam?.rom_passive_extension || "",
                quadStrength: editData.physical_exam?.quadriceps_strength || "",
                hamstringStrength: editData.physical_exam?.hamstring_strength || "",
                calfStrength: editData.physical_exam?.calf_strength || "",
                pulses: editData.physical_exam?.pulses || "",
                sensation: editData.physical_exam?.sensation || "",
                motorFunction: editData.physical_exam?.motor_function || "",
                gait: editData.physical_exam?.gait || "",
                specialTests: editData.physical_exam?.special_tests || "",
                jointInstability: editData.physical_exam?.joint_instability || "",

                // Imaging
                xrayDone: editData.imaging?.xray_done || "",
                xrayFindings: editData.imaging?.xray_findings || "",
                mriDone: editData.imaging?.mri_done || "",
                mriIndication: editData.imaging?.mri_indication || "",
                ctDone: editData.imaging?.ct_done || "",
                ultrasoundDone: editData.imaging?.ultrasound_done || "",
                dexaDone: editData.imaging?.dexa_done || "",

                // Labs
                labTests: [
                    ...(editData.labs?.cbc_ordered ? ['CBC'] : []),
                    ...(editData.labs?.esr_ordered ? ['ESR'] : []),
                    ...(editData.labs?.crp_ordered ? ['CRP'] : []),
                    ...(editData.labs?.rheumatoid_factor_ordered ? ['Rheumatoid Factor'] : []),
                    ...(editData.labs?.uric_acid_ordered ? ['Uric Acid'] : []),
                    ...(editData.labs?.calcium_ordered ? ['Calcium'] : []),
                    ...(editData.labs?.vitamin_d_ordered ? ['Vitamin D'] : []),
                    ...(editData.labs?.alp_ordered ? ['ALP'] : [])
                ],
                cbcResults: editData.labs?.cbc_results || "",
                esrResults: editData.labs?.esr_results || "",
                crpResults: editData.labs?.crp_results || "",
                otherLabs: editData.labs?.other_labs_results || "",

                // Diagnoses
                primaryCondition: getDiagnosesByType(editData?.diagnoses, 'primary', 'diagnosis_name'),
                suspectedCondition: getDiagnosesByType(editData?.diagnoses, 'suspected', 'diagnosis_name'),
                affectedSide: getDiagnosesByType(editData?.diagnoses, 'primary', 'affected_side'),
                affectedJoint: getDiagnosesByType(editData?.diagnoses, 'primary', 'affected_joint'),
                severity: getDiagnosesByType(editData?.diagnoses, 'primary', 'severity'),
                fractureType: getDiagnosesByType(editData?.diagnoses, 'primary', 'fracture_type') || "Not applicable",
                ligamentGrade: getDiagnosesByType(editData?.diagnoses, 'primary', 'ligament_grade') || "Not applicable",
                differentials: getDiagnosesByType(editData?.diagnoses, 'differential', 'diagnosis_name'),
                // Management
                immobilizationType: editData.management?.immobilization_type || "",
                physiotherapy: editData.management?.physiotherapy || "",
                painMedications: editData.management?.pain_medications || "",
                activityModification: editData.management?.activity_modification || "",
                surgicalPlan: editData.management?.surgical_plan || "",
                fractureFixation: editData.management?.fracture_fixation || "",
                arthroscopy: editData.management?.arthroscopy || "",
                jointReplacement: editData.management?.joint_replacement || "",
                postOpCare: editData.management?.post_op_care || "",
                followUpTimeline: editData.management?.follow_up_timeline || "",
                repeatImaging: editData.management?.repeat_imaging_schedule || "",
                redFlags: editData.management?.red_flag_symptoms || "",
                // Rehab Milestones
                rehabMilestones: editData.rehab_milestones?.map(m => m.milestone_description) || [],
                // Referrals
                referrals: Array.isArray(editData?.referrals) ? editData.referrals : [],
                ptReferral: editData.referrals?.pt_referral || "",
                painClinic: editData.referrals?.pain_clinic || "",
                surgeryReferral: editData.referrals?.surgery_referral || "",
                // Notes
                additionalObservations: editData.notes?.additional_observations || "",
                counseling: editData.notes?.counseling || "",
                patientQuestions: editData.notes?.patient_questions || "",
                education: editData.notes?.education_provided || ""
            };

            setFormData(mappedData);
            setOriginalData(mappedData); // Store original for change tracking
        }
    }, [formMode, editData]);

    // Helper function to track changed fields
        const getChangedFields = () => {
        if (!originalData) return null;

        const changes = {};

        // Compare each section
        if (JSON.stringify(originalData.patientId) !== JSON.stringify(formData.patientId)) {
            changes.patientId = formData.patientId;
        }
        
        // Patient basic info
       const patientFields = {
            name: 'name',
            email: 'email',  // Add this if you're using 'email' field
            contactEmail: 'contactEmail', // Or this if you're using 'contactEmail'
            gender: 'gender',
            dob: 'dob',
            bloodGroup: 'bloodGroup',
            contactPhone: 'contactPhone',
            address: 'address',
            emergencyName: 'emergencyName',
            emergencyContactNumber: 'emergencyContactNumber'
        };
       const patientChanges = {};
        Object.entries(patientFields).forEach(([frontendField]) => {
            // Use the actual field name from your form data
            if (originalData[frontendField] !== formData[frontendField]) {
                patientChanges[frontendField] = formData[frontendField];
            }
        });

        if (Object.keys(patientChanges).length > 0) {
            changes.patient = patientChanges;
        }
        // Encounter fields
        const encounterFields = ['height', 'weight', 'bmi', 'allergies', 'pastMedicalHistory', 
                                'pastSurgicalHistory', 'familyHistory', 'socialHistory', 'occupation',
                                'physicalActivity', 'smokingStatus', 'alcoholUse'];
        const encounterChanges = {};
        encounterFields.forEach(field => {
            if (originalData[field] !== formData[field]) {
                encounterChanges[field] = formData[field];
            }
        });
        if (Object.keys(encounterChanges).length > 0) changes.encounter = encounterChanges;

        // Complaints
        const complaintsFields = ['chiefComplaint', 'onset', 'duration', 'progression', 'painLocation',
                                 'painIntensity', 'painType', 'painRadiation', 'swelling', 'redness',
                                 'warmth', 'traumaMechanism', 'traumaTime', 'functionalLimitation',
                                 'mobilityLimitation', 'adlLimitation', 'rangeMotionLoss', 'numbness',
                                 'tingling', 'weakness'];
        const complaintsChanges = {};
        complaintsFields.forEach(field => {
            if (originalData[field] !== formData[field]) {
                complaintsChanges[field] = formData[field];
            }
        });
        if (Object.keys(complaintsChanges).length > 0) changes.complaints = complaintsChanges;

        // Physical Exam
        const physicalExamFields = ['inspection', 'deformity', 'scars', 'palpationTenderness',
                                   'palpationWarmth', 'crepitus', 'romActiveFlexion', 'romPassiveFlexion',
                                   'romActiveExtension', 'romPassiveExtension', 'quadStrength',
                                   'hamstringStrength', 'calfStrength', 'pulses', 'sensation',
                                   'motorFunction', 'gait', 'specialTests', 'jointInstability'];
        const physicalExamChanges = {};
        physicalExamFields.forEach(field => {
            if (originalData[field] !== formData[field]) {
                physicalExamChanges[field] = formData[field];
            }
        });
        if (Object.keys(physicalExamChanges).length > 0) changes.physicalExam = physicalExamChanges;

        // Imaging - Using frontend field names as keys
        const imagingFields = {
            xrayDone: 'xray_done',
            xrayFindings: 'xray_findings',
            mriDone: 'mri_done',
            mriIndication: 'mri_indication',
            ctDone: 'ct_done',
            ultrasoundDone: 'ultrasound_done',
            dexaDone: 'dexa_done'
        };

        const imagingChanges = {};
        Object.entries(imagingFields).forEach(([frontendField]) => {
            if (originalData[frontendField] !== formData[frontendField]) {
                // Use frontend field names as keys for the changes object
                imagingChanges[frontendField] = formData[frontendField];
            }
        });

    if (Object.keys(imagingChanges).length > 0) {
        changes.imaging = imagingChanges;
    }




        // Labs - Convert labTests array to individual ordered flags
        if (JSON.stringify(originalData.labTests) !== JSON.stringify(formData.labTests)) {
            const labTests = formData.labTests || [];
            changes.labTests = {
                cbcOrdered: labTests.includes('CBC'),
                esrOrdered: labTests.includes('ESR'),
                crpOrdered: labTests.includes('CRP'),
                rheumatoidFactorOrdered: labTests.includes('Rheumatoid Factor'),
                uricAcidOrdered: labTests.includes('Uric Acid'),
                calciumOrdered: labTests.includes('Calcium'),
                vitaminDOrdered: labTests.includes('Vitamin D'),
                alpOrdered: labTests.includes('ALP')
            };
        }

        // Lab results - keep as is
        const labResultsFields = {
            cbcResults: 'cbc_results',
            esrResults: 'esr_results',
            crpResults: 'crp_results',
            otherLabs: 'other_labs_results'
        };

        const labResultsChanges = {};
        Object.entries(labResultsFields).forEach(([frontendField]) => {
            if (originalData[frontendField] !== formData[frontendField]) {
                // Use frontend field names as keys for the changes object
                labResultsChanges[frontendField] = formData[frontendField];
            }
        });

        if (Object.keys(labResultsChanges).length > 0) {
            changes.labResults = labResultsChanges;
        }

        // Diagnoses
        const diagnosesFields = ['primaryCondition', 'suspectedCondition', 'affectedSide',
                                'affectedJoint', 'severity', 'fractureType', 'ligamentGrade'];
        const diagnosesChanges = {};
        diagnosesFields.forEach(field => {
            if (originalData[field] !== formData[field]) {
                diagnosesChanges[field] = formData[field];
            }
        });
        if (JSON.stringify(originalData.differentials) !== JSON.stringify(formData.differentials)) {
            diagnosesChanges.differentials = formData.differentials;
        }
        if (Object.keys(diagnosesChanges).length > 0) changes.diagnoses = diagnosesChanges;

        // Management
        const managementFields = {
            immobilizationType: 'immobilization_type',
            physiotherapy: 'physiotherapy',
            painMedications: 'pain_medications',
            activityModification: 'activity_modification',
            surgicalPlan: 'surgical_plan',
            fractureFixation: 'fracture_fixation',
            arthroscopy: 'arthroscopy',
            jointReplacement: 'joint_replacement',
            postOpCare: 'post_op_care',
            followUpTimeline: 'follow_up_timeline',
            repeatImaging: 'repeat_imaging_schedule',
            redFlags: 'red_flag_symptoms'
};
        const managementChanges = {};
        Object.entries(managementFields).forEach(([frontendField]) => {
    if (originalData[frontendField] !== formData[frontendField]) {
        // Use frontend field names as keys for the changes object
        managementChanges[frontendField] = formData[frontendField];
    }
});
        if (Object.keys(managementChanges).length > 0) {
            changes.management = managementChanges;
        }
       // Rehab Milestones
        if (JSON.stringify(originalData.rehabMilestones) !== JSON.stringify(formData.rehabMilestones)) {
            // Always send as complete replacement with the right structure
            changes.rehabMilestones = {
                milestones: (formData.rehabMilestones || []).filter(m => m && m.trim() !== '')
            };
        }


        // Referrals
            const referralsFields = {
            ptReferral: 'pt_referral',     
            painClinic: 'pain_clinic',      
            surgeryReferral: 'surgery_referral' 
        };
        const referralsChanges = {};
           Object.entries(referralsFields).forEach(([frontendField]) => {
            if (originalData[frontendField] !== formData[frontendField]) {
                // Use frontend field names as keys for the changes object
                referralsChanges[frontendField] = formData[frontendField];
            }
        });

        if (Object.keys(referralsChanges).length > 0) {
            changes.referrals = referralsChanges;
        }
        // Notes
        const notesFields = ['additionalObservations', 'counseling', 'patientQuestions', 'education'];
        const notesChanges = {};
        notesFields.forEach(field => {
            if (originalData[field] !== formData[field]) {
                notesChanges[field] = formData[field];
            }
        });
        if (Object.keys(notesChanges).length > 0) changes.notes = notesChanges;

        return changes;
    };
    const getDiagnosesByType = (diagnoses, type, field = 'diagnosis_name') => {
    if (!Array.isArray(diagnoses)) return type === 'differential' ? [] : '';
    
    const filtered = diagnoses.filter(d => d && d.diagnosis_type === type);
    
    if (type === 'differential') {
        return filtered.map(d => d?.[field] || '').filter(Boolean);
    }
    
    if (type === 'suspected') {
        return filtered.map(d => d?.[field] || '').filter(Boolean).join(', ');
    }
    
    // For primary (single value)
    const primary = filtered[0];
    return primary?.[field] || '';
};
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
       
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (formMode === 'edit' && encounterId) {
                // Get only changed fields
                const changes = getChangedFields();
                
                if (Object.keys(changes).length === 0) {
                    toast({
                        title: "No Changes",
                        description: "No changes were made to the form.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                    setIsSubmitting(false);
                    return;
                }


                // Update each section that has changes
                const updatePromises = [];

                // Update patient if changed
                if (changes.patient && patientId) {
                    updatePromises.push(patientApi.patchPatient(patientId, changes.patient));
                }

                // Update encounter if changed
                if (changes.encounter) {
                    updatePromises.push(encounterApi.patchEncounter(encounterId, changes.encounter));
                }

                // Update complaints if changed
                if (changes.complaints) {
                    updatePromises.push(complaintsApi.patch(encounterId, changes.complaints));
                }

                // Update physical exam if changed
                if (changes.physicalExam) {
                    updatePromises.push(physicalExamApi.patch(encounterId, changes.physicalExam));
                }

                // Update imaging if changed
                if (changes.imaging) {
                    updatePromises.push(imagingApi.patch(encounterId, changes.imaging));
                }

                // Update labs if changed
                // Update labs if changed
                if (changes.labTests || changes.labResults) {
                    const labUpdates = {};
                    
                    // Add lab test flags if changed
                    if (changes.labTests) {
                        Object.assign(labUpdates, changes.labTests);
                    }
                    
                    // Add lab results if changed
                    if (changes.labResults) {
                        Object.assign(labUpdates, changes.labResults);
                    }
                    
                    updatePromises.push(labsApi.patch(encounterId, labUpdates));
                }

                                // Update diagnoses if changed
                            // In handleSubmit, simpler approach:
          if (changes.diagnoses) {
    
    // Use PATCH, not POST
    updatePromises.push(diagnosesApi.patch(encounterId, {
        primaryCondition: formData.primaryCondition,
        suspectedCondition: formData.suspectedCondition,
        differentials: formData.differentials,
        affectedSide: formData.affectedSide,
        affectedJoint: formData.affectedJoint,
        severity: formData.severity,
        fractureType: formData.fractureType,
        ligamentGrade: formData.ligamentGrade
    }));
}

                // Update management if changed
                if (changes.management) {
                    updatePromises.push(managementApi.patch(encounterId, changes.management));
                }

                // Update rehab milestones if changed
               // Update rehab milestones if changed
                if (changes.rehabMilestones) {
                    
                    // Always use the milestones format for simplicity
                    updatePromises.push(
                        rehabMilestonesApi.patch(encounterId, changes.rehabMilestones)
                            .catch(error => {
                                console.error("Rehab milestones update failed:", error);
                                throw error;
                            })
                    );
                }

                // Update referrals if changed
                if (changes.referrals) {
                    updatePromises.push(referralsApi.patch(encounterId, changes.referrals));
                }

                // Update notes if changed
                if (changes.notes) {
                    updatePromises.push(notesApi.patch(encounterId, changes.notes));
                }

                // Wait for all updates to complete
                await Promise.all(updatePromises);

                toast({
                    title: "Success",
                    description: "Orthopedic encounter updated successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

            } else {
                // Create new encounter (existing submitCompleteForm logic)
                const submissionData = {
        patient_id: selectedPatientId || null,
        name: formData.name || "Unknown Patient", // Fallback if empty
        contactEmail: formData.contactEmail || "unknown@email.com",
        gender: formData.gender || "Other",
        dob: formData.dob || new Date().toISOString().split('T')[0],
        contactPhone: cleanPhoneNumber(formData.contactPhone),
        
        // Optional patient fields
        bloodGroup: formData.bloodGroup || null,
        address: formData.address || null,
        emergencyName: formData.emergencyName || null,
        emergencyContactNumber: cleanPhoneNumber(formData.emergencyContactNumber) || null,

        // Encounter Information
        patientId: formData.patientId || generatePatientVisitId(),
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        bmi: formData.bmi ? parseFloat(formData.bmi) : null,
        allergies: formData.allergies || null,
        pastMedicalHistory: formData.pastMedicalHistory || null,
        pastSurgicalHistory: formData.pastSurgicalHistory || null,
        familyHistory: formData.familyHistory || null,
        socialHistory: formData.socialHistory || null,
        occupation: formData.occupation || null,
        physicalActivity: formData.physicalActivity || null,
        smokingStatus: formData.smokingStatus || null,
        alcoholUse: formData.alcoholUse || null,

        // Complaints
        chiefComplaint: formData.chiefComplaint || null,
        onset: formData.onset || null,
        duration: formData.duration || null,
        progression: formData.progression || null,
        painLocation: formData.painLocation || null,
        painIntensity: formData.painIntensity ? parseInt(formData.painIntensity) : null,
        painType: formData.painType || null,
        painRadiation: formData.painRadiation || null,
        swelling: formData.swelling || null,
        redness: formData.redness || null,
        warmth: formData.warmth || null,
        traumaMechanism: formData.traumaMechanism || null,
        traumaTime: formData.traumaTime || null,
        functionalLimitation: formData.functionalLimitation || null,
        mobilityLimitation: formData.mobilityLimitation || null,
        adlLimitation: formData.adlLimitation || null,
        rangeMotionLoss: formData.rangeMotionLoss || null,
        numbness: formData.numbness || null,
        tingling: formData.tingling || null,
        weakness: formData.weakness || null,

        // Physical Exam
        inspection: formData.inspection || null,
        deformity: formData.deformity || null,
        scars: formData.scars || null,
        palpationTenderness: formData.palpationTenderness || null,
        palpationWarmth: formData.palpationWarmth || null,
        crepitus: formData.crepitus || null,
        romActiveFlexion: formData.romActiveFlexion || null,
        romPassiveFlexion: formData.romPassiveFlexion || null,
        romActiveExtension: formData.romActiveExtension || null,
        romPassiveExtension: formData.romPassiveExtension || null,
        quadStrength: formData.quadStrength || null,
        hamstringStrength: formData.hamstringStrength || null,
        calfStrength: formData.calfStrength || null,
        pulses: formData.pulses || null,
        sensation: formData.sensation || null,
        motorFunction: formData.motorFunction || null,
        gait: formData.gait || null,
        specialTests: formData.specialTests || null,
        jointInstability: formData.jointInstability || null,

        // Imaging
        xrayDone: formData.xrayDone || null,
        xrayFindings: formData.xrayFindings || null,
        mriDone: formData.mriDone || null,
        mriIndication: formData.mriIndication || null,
        ctDone: formData.ctDone || null,
        ultrasoundDone: formData.ultrasoundDone || null,
        dexaDone: formData.dexaDone || null,

        // Labs
        labTests: formData.labTests || [],
        cbcResults: formData.cbcResults || null,
        esrResults: formData.esrResults || null,
        crpResults: formData.crpResults || null,
        otherLabs: formData.otherLabs || null,

        // Diagnoses
        primaryCondition: formData.primaryCondition || null,
        suspectedCondition: formData.suspectedCondition || null,
        affectedSide: formData.affectedSide || null,
        affectedJoint: formData.affectedJoint || null,
        severity: formData.severity || null,
        fractureType: formData.fractureType === "Not applicable" ? null : formData.fractureType,
        ligamentGrade: formData.ligamentGrade === "Not applicable" ? null : formData.ligamentGrade,
        differentials: (formData.differentials || []).filter(d => d && d !== "Not applicable"),

        // Management
        immobilizationType: formData.immobilizationType || null,
        physiotherapy: formData.physiotherapy || null,
        painMedications: formData.painMedications || null,
        activityModification: formData.activityModification || null,
        surgicalPlan: formData.surgicalPlan || null,
        fractureFixation: formData.fractureFixation || null,
        arthroscopy: formData.arthroscopy || null,
        jointReplacement: formData.jointReplacement || null,
        postOpCare: formData.postOpCare || null,
        followUpTimeline: formData.followUpTimeline || null,
        repeatImaging: formData.repeatImaging || null,
        rehabMilestones: formData.rehabMilestones || [],
        redFlags: formData.redFlags || null,

        // Notes
        additionalObservations: formData.additionalObservations || null,
        counseling: formData.counseling || null,
        patientQuestions: formData.patientQuestions || null,
        referrals: formData.referrals || [],
        ptReferral: formData.ptReferral || null,
        painClinic: formData.painClinic || null,
        surgeryReferral: formData.surgeryReferral || null,
        education: formData.education || null
                };

                const response = await submitCompleteForm(submissionData);
                console.log(response.data)
                toast({
                    title: "Success",
                    description: `Orthopedic encounter form saved successfully.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }

            // Clear edit mode and navigate back to view page
            clearEditMode();
            navigate('/orthopedics/view');
            
        } catch (error) {
            console.error("Error submitting form:", error);
            if (error.message && error.message.includes('duplicate key') || 
        (error.error && error.error.includes('violates unique constraint'))) {
        toast({
            title: "Duplicate Patient",
            description: "A patient with this email already exists. Please use the patient selector to select the existing patient or create with new email.",
            status: "warning",
            duration: 7000,
            isClosable: true,
        });
    }
            
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextTab = () => {
        setActiveTab((prev) => Math.min(prev + 1, 6));
    };

    const handlePrevTab = () => {
        setActiveTab((prev) => Math.max(prev - 1, 0));
    };

    const handleCancel = () => {
        if (formMode === 'edit') {
            clearEditMode();
        }
        navigate('/orthopedics/view');
    };

  
    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              {/* Header Section */}
                <Box textAlign="left">
                    <Heading color="medical.700" mb={2}>
                        {formMode === 'edit' ? 'Edit Orthopedic Encounter' : 'Orthopedics Patient Encounter Form'}
                    </Heading>
                    <Text color="gray.600">
                        {formMode === 'edit' 
                            ? `Editing Encounter ID: ${encounterId}` 
                            : 'Musculoskeletal assessment and management tool'}
                    </Text>
                    
                    {/* Patient Summary - Only visible when patient is selected or in edit mode */}
                    {(selectedPatientId || formMode === 'edit') && (
                        <>
                            <HStack justify="center" mt={3} spacing={4}>
                                <Badge colorScheme="blue" fontSize="sm">
                                    Patient Name: {formData.name || 'N/A'}
                                </Badge>
                                <Badge colorScheme="green" fontSize="sm">
                                    Age: {calculateAge(formData.dob)} years
                                </Badge>
                            </HStack>
                            
                            {formData.primaryCondition && (
                                <Alert status="info" borderRadius="lg" mt={3}>
                                    <AlertIcon />
                                    {formData.primaryCondition} | Severity: {formData.severity || 'Not specified'} | 
                                    Onset: {formData.duration || 'Not specified'} ago
                                </Alert>
                            )}
                        </>
                    )}
                </Box>


               
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
                                        {/* Patient Selector Card */}
                                    {formMode !== 'edit' && ( <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
                                            <CardBody>
                                                <VStack align="stretch" spacing={4}>
                                                    <HStack>
                                                        <InfoIcon color="blue.500" />
                                                        <Heading size="sm" color="blue.700">Select Existing Patient or Create New</Heading>
                                                    </HStack>
                                                    
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                        <FormControl>
                                                            <FormLabel fontWeight="bold" color="blue.700">
                                                                Search/Select Patient
                                                            </FormLabel>
                                                            <Select
                                                                placeholder="-- Choose existing patient --"
                                                                value={selectedPatientId}
                                                                onChange={(e) => handlePatientSelect(e.target.value)}
                                                                bg="white"
                                                                size="lg"
                                                                borderColor="blue.300"
                                                                _hover={{ borderColor: "blue.500" }}
                                                                isLoading={loadingPatients}
                                                            >
                                                                <option value="">-- New Patient --</option>
                                                                {patientsList.map((patient) => (
                                                                    <option key={patient.patient_id} value={patient.patient_id}>
                                                                        {patient.patient_name} ({patient.gender}, {calculateAge(patient.dob)} yrs) - {patient.contact_number}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                        
                                                        {selectedPatientId && (
                                                            <FormControl>
                                                                <FormLabel fontWeight="bold" color="green.600">
                                                                    Selected Patient
                                                                </FormLabel>
                                                                <HStack bg="green.50" p={3} borderRadius="md" borderWidth="1px" borderColor="green.200" wrap="wrap">
                                                                    <Badge colorScheme="green" fontSize="md" p={2}>
                                                                        Patient Loaded ✓
                                                                    </Badge>
                                                                </HStack>
                                                            </FormControl>
                                                        )}
                                                    </SimpleGrid>
                                                    
                                                    {!selectedPatientId && (
                                                        <Alert status="info" borderRadius="md" fontSize="sm">
                                                            <AlertIcon />
                                                            You're creating a new patient record. Fill in all details below.
                                                        </Alert>
                                                    )}
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    )}

                                        {/* Patient Identification Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <HStack justify="space-between">
                                                    <Heading size="md">Patient Identification</Heading>
                                                    {selectedPatientId && (
                                                        <Badge colorScheme="green" p={2} borderRadius="md">
                                                            <HStack spacing={1}>
                                                                <InfoIcon boxSize={3} />
                                                                <Text>Auto-filled</Text>
                                                            </HStack>
                                                        </Badge>
                                                    )}
                                                </HStack>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                                                    {/* Full Name - Required */}
                                                    <FormControl isRequired>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <Input 
                                                            name="name" 
                                                            value={formData.name} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Enter patient's full name"
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Date of Birth - Required */}
                                                    <FormControl isRequired>
                                                        <FormLabel>Date of Birth</FormLabel>
                                                        <Input 
                                                            type="date" 
                                                            name="dob" 
                                                            value={formData.dob} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Age - Calculated field */}
                                                    <FormControl>
                                                        <FormLabel>Age</FormLabel>
                                                        <Input 
                                                            name="age" 
                                                            value={calculateAge(formData.dob)} 
                                                            isReadOnly
                                                            bg="gray.50"
                                                            placeholder="Auto-calculated"
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Gender - Required */}
                                                    <FormControl isRequired>
                                                        <FormLabel>Gender</FormLabel>
                                                        <Select 
                                                            name="gender" 
                                                            value={formData.gender} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Select gender"
                                                        >
                                                            {genderOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </Select>
                                                    </FormControl>
                                                    
                                                    {/* Blood Group */}
                                                    <FormControl>
                                                        <FormLabel>Blood Group</FormLabel>
                                                        <Select 
                                                            name="bloodGroup" 
                                                            value={formData.bloodGroup || ""} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Select blood group"
                                                        >
                                                            <option value="A+">A+</option>
                                                            <option value="A-">A-</option>
                                                            <option value="B+">B+</option>
                                                            <option value="B-">B-</option>
                                                            <option value="AB+">AB+</option>
                                                            <option value="AB-">AB-</option>
                                                            <option value="O+">O+</option>
                                                            <option value="O-">O-</option>
                                                            <option value="Unknown">Unknown</option>
                                                        </Select>
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Contact Information Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Contact Information</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                    {/* Phone - Required */}
                                                    <FormControl isRequired>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <Input 
                                                            name="contactPhone" 
                                                            value={formData.contactPhone} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="e.g., +1 (555) 123-4567"
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Email - Required */}
                                                    <FormControl isRequired>
                                                        <FormLabel>Email Address</FormLabel>
                                                        <Input 
                                                            type="email" 
                                                            name="contactEmail" 
                                                            value={formData.contactEmail} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="patient@example.com"
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Address */}
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2", lg: "span 1" }}>
                                                        <FormLabel>Address</FormLabel>
                                                        <Textarea 
                                                            name="address" 
                                                            value={formData.address} 
                                                            onChange={handleChange} 
                                                            rows={2}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Full address"
                                                        />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Emergency Contact Information Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Emergency Contact Information</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                    {/* Emergency Contact Name */}
                                                    <FormControl>
                                                        <FormLabel>Emergency Contact Name</FormLabel>
                                                        <Input 
                                                            name="emergencyName" 
                                                            value={formData.emergencyName || ""} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Full name of emergency contact"
                                                        />
                                                    </FormControl>
                                                    
                                                    {/* Emergency Contact Number */}
                                                    <FormControl>
                                                        <FormLabel>Emergency Contact Number</FormLabel>
                                                        <Input 
                                                            name="emergencyContactNumber" 
                                                            value={formData.emergencyContactNumber || ""} 
                                                            onChange={handleChange}
                                                            bg={selectedPatientId ? "green.50" : "white"}
                                                            borderColor={selectedPatientId ? "green.300" : "gray.200"}
                                                            placeholder="Phone number with country code"
                                                            type="tel"
                                                        />
                                                    </FormControl>
                                                </SimpleGrid>
                                                <Text fontSize="sm" color="gray.500" mt={2}>
                                                    <i>Primary contact in case of emergency</i>
                                                </Text>
                                            </CardBody>
                                        </Card>

                                        {/* Physical Metrics Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Physical Metrics (For Current Visit)</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Height (cm)</FormLabel>
                                                        <NumberInput value={formData.height}>
                                                            <NumberInputField 
                                                                name="height" 
                                                                onChange={handleChange}
                                                                placeholder="e.g., 175"
                                                            />
                                                        </NumberInput>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Weight (kg)</FormLabel>
                                                        <NumberInput value={formData.weight}>
                                                            <NumberInputField 
                                                                name="weight" 
                                                                onChange={handleChange}
                                                                placeholder="e.g., 70"
                                                            />
                                                        </NumberInput>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>BMI</FormLabel>
                                                        <Input 
                                                            name="bmi" 
                                                            value={formData.bmi} 
                                                            onChange={handleChange}
                                                            placeholder="Auto-calculated or enter manually"
                                                        />
                                                        <Progress 
                                                            value={(parseFloat(formData.bmi) || 0) / 40 * 100} 
                                                            size="sm" 
                                                            colorScheme={
                                                                parseFloat(formData.bmi) > 30 ? "red" : 
                                                                parseFloat(formData.bmi) > 25 ? "orange" : "green"
                                                            } 
                                                            mt={2} 
                                                            borderRadius="full"
                                                        />
                                                    </FormControl>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Medical History Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Medical History</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                                    <VStack spacing={4} align="stretch">
                                                        <FormControl>
                                                            <FormLabel>Allergies</FormLabel>
                                                            <Input 
                                                                name="allergies" 
                                                                value={formData.allergies} 
                                                                onChange={handleChange}
                                                                placeholder="List any allergies"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Past Medical History</FormLabel>
                                                            <Textarea 
                                                                name="pastMedicalHistory" 
                                                                value={formData.pastMedicalHistory} 
                                                                onChange={handleChange} 
                                                                rows={3}
                                                                placeholder="Hypertension, Diabetes, etc."
                                                            />
                                                        </FormControl>
                                                    </VStack>
                                                    <VStack spacing={4} align="stretch">
                                                        <FormControl>
                                                            <FormLabel>Past Surgical History</FormLabel>
                                                            <Textarea 
                                                                name="pastSurgicalHistory" 
                                                                value={formData.pastSurgicalHistory} 
                                                                onChange={handleChange} 
                                                                rows={3}
                                                                placeholder="Previous surgeries, dates"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Family History</FormLabel>
                                                            <Textarea 
                                                                name="familyHistory" 
                                                                value={formData.familyHistory} 
                                                                onChange={handleChange} 
                                                                rows={2}
                                                                placeholder="Relevant family medical history"
                                                            />
                                                        </FormControl>
                                                    </VStack>
                                                </SimpleGrid>
                                            </CardBody>
                                        </Card>

                                        {/* Social & Occupational History Card */}
                                        <Card>
                                            <CardHeader bg="medical.50">
                                                <Heading size="md">Social & Occupational History</Heading>
                                            </CardHeader>
                                            <CardBody>
                                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                                                    <FormControl>
                                                        <FormLabel>Occupation</FormLabel>
                                                        <Input 
                                                            name="occupation" 
                                                            value={formData.occupation} 
                                                            onChange={handleChange}
                                                            placeholder="Current occupation"
                                                        />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Physical Activity Level</FormLabel>
                                                        <Select 
                                                            name="physicalActivity" 
                                                            value={formData.physicalActivity} 
                                                            onChange={handleChange}
                                                            placeholder="Select level"
                                                        >
                                                            <option value="Sedentary">Sedentary</option>
                                                            <option value="Light">Light</option>
                                                            <option value="Moderate">Moderate</option>
                                                            <option value="Heavy">Heavy</option>
                                                            <option value="Athlete">Athlete</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Smoking Status</FormLabel>
                                                        <Select 
                                                            name="smokingStatus" 
                                                            value={formData.smokingStatus} 
                                                            onChange={handleChange}
                                                            placeholder="Select status"
                                                        >
                                                            <option value="Never">Never</option>
                                                            <option value="Former">Former</option>
                                                            <option value="Current">Current</option>
                                                        </Select>
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Alcohol Use</FormLabel>
                                                        <Input 
                                                            name="alcoholUse" 
                                                            value={formData.alcoholUse} 
                                                            onChange={handleChange}
                                                            placeholder="e.g., Social, Never, etc."
                                                        />
                                                    </FormControl>
                                                    <FormControl gridColumn={{ base: "span 1", md: "span 2", lg: "span 3" }}>
                                                        <FormLabel>Social History</FormLabel>
                                                        <Textarea 
                                                            name="socialHistory" 
                                                            value={formData.socialHistory} 
                                                            onChange={handleChange} 
                                                            rows={2}
                                                            placeholder="Additional social history notes"
                                                        />
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
                                                            <Input name="palpationWarmth" value={formData.palpationWarmth} onChange={handleChange} />
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
                                                        {(() => {
                                                            // Safe check for referrals
                                                            const referrals = formData.referrals;
                                                            
                                                            if (!referrals) {
                                                                return <Text color="gray.500" fontSize="sm">No referrals data</Text>;
                                                            }
                                                            
                                                            if (typeof referrals === 'string') {
                                                                // If it's a string, split it
                                                                const referralArray = referrals.split(',').map(s => s.trim()).filter(Boolean);
                                                                if (referralArray.length > 0) {
                                                                    return referralArray.map((ref, index) => (
                                                                        <WrapItem key={index}>
                                                                            <Tag size="md" colorScheme="blue">
                                                                                <TagLabel>{ref}</TagLabel>
                                                                            </Tag>
                                                                        </WrapItem>
                                                                    ));
                                                                }
                                                            }
                                                            
                                                            if (Array.isArray(referrals) && referrals.length > 0) {
                                                                return referrals.map((ref, index) => (
                                                                    <WrapItem key={index}>
                                                                        <Tag size="md" colorScheme="blue">
                                                                            <TagLabel>{ref}</TagLabel>
                                                                        </Tag>
                                                                    </WrapItem>
                                                                ));
                                                            }
                                                            
                                                            return <Text color="gray.500" fontSize="sm">No referrals</Text>;
                                                        })()}
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

                        <HStack spacing={4}>
                            <Button
                                onClick={handleCancel}
                                variant="ghost"
                                colorScheme="red"
                            >
                                Cancel
                            </Button>
                            <Badge colorScheme="medical" fontSize="sm">
                                Step {activeTab + 1} of 7
                            </Badge>
                        </HStack>

                    {
                        activeTab < 6 ? (
                            <Button onClick={handleNextTab} colorScheme="medical" color="blue" rightIcon={<CalendarIcon />}>
                                Next
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                colorScheme={formMode === 'edit' ? "blue" : "medical"} 
                                size="lg"
                                color="blue"
                                isLoading={isSubmitting}
                                loadingText={formMode === 'edit' ? "Updating..." : "Submitting"}
                            >
                                {formMode === 'edit' ? 'Update Orthopedics Form' : 'Submit Orthopedics Form'}
                            </Button>
                        )
                    }
                </HStack>
            </VStack>
        </Container>
    );
};

export default OrthopedicsForm;
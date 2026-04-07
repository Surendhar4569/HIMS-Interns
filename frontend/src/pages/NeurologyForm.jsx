import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  CalendarIcon,
  TimeIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import {
  patientApi,
  encounterApi,
  submitCompleteForm,
} from "../services/neurologyApi";
import { useNeurology } from "../context/NeurologyContext.jsx";
import {
  calculateAge,
  cleanPhoneNumber,
  generatePatientVisitId,
  calculateBMI,
} from "../services/neurologyHelpers";

const NeurologyForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { editMode, clearEditMode, setSelectedPatient } = useNeurology();

  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // Static options
  const genderOptions = ["Male", "Female", "Other"];
  const headacheTypes = [
    "Migraine",
    "Tension",
    "Cluster",
    "Thunderclap",
    "Chronic Daily",
  ];
  const seizureTypes = [
    "Focal",
    "Generalized Tonic-Clonic",
    "Absence",
    "Myoclonic",
    "Atonic",
    "Status Epilepticus",
  ];
  const weaknessPatterns = [
    "Hemiparesis",
    "Paraparesis",
    "Quadriparesis",
    "Monoparesis",
    "Proximal",
    "Distal",
  ];

  // Empty form state for new patient
  const emptyFormState = {
    // SECTION 1: Patient Demographics
    visit_id: " ",
    patientId: "",
    mrn: "",
    name: "",
    dob: "",
    age: "",
    gender: "Male",
    contactPhone: "",
    contactEmail: "",
    address: "",
    height: "",
    weight: "",
    bmi: "",
    allergies: "",
    pastMedicalHistory: "",
    pastSurgicalHistory: "",
    familyHistory: "",
    socialHistory: "",
    smokingStatus: "",
    alcoholUse: "",
    occupation: "",
    lifestyle: "",

    // SECTION 2: Presenting Complaint
    chiefComplaint: "",
    onset: "",
    duration: "",
    progression: "",
    headacheType: "",
    headacheLocation: "",
    headacheSeverity: "",
    headacheTriggers: "",
    headacheDuration: "",
    weaknessPresent: "",
    weaknessSide: "",
    weaknessLimb: "",
    weaknessPattern: "",
    numbness: "",
    paresthesia: "",
    tremors: "",
    involuntaryMovements: "",
    seizures: "",
    seizureType: "",
    seizureFrequency: "",
    speechChanges: "",
    languageChanges: "",
    visionChanges: "",
    diplopia: "",
    dizziness: "",
    vertigo: "",
    balanceIssues: "",
    cognitiveChanges: "",
    memoryChanges: "",
    neuropathicPain: "",
    radicularPain: "",
    symptomTriggers: "",
    symptomRelievers: "",
    overallSeverity: "",

    // SECTION 3: Neurological Examination
    mentalStatusOrientation: "",
    memoryRegistration: "",
    memoryRecall: "",
    cognition: "",
    cranialNerveFindings: "",
    motorTone: "",
    motorPower: "",
    muscleBulk: "",
    reflexesBiceps: "",
    reflexesTriceps: "",
    reflexesKnee: "",
    reflexesAnkle: "",
    plantarResponse: "",
    sensoryPain: "",
    sensoryTemperature: "",
    sensoryVibration: "",
    sensoryProprioception: "",
    coordinationFingerNose: "",
    coordinationHeelShin: "",
    gaitNormal: "",
    rombergTest: "",
    tandemWalk: "",
    babinski: "",
    hoffmann: "",
    lhermitte: "",
    adls: "",
    mobility: "",

    // SECTION 4: Investigations Ordered
    labTests: [],
    ctBrain: "",
    mriBrain: "",
    mrAngiography: "",
    mriSpine: "",
    eegOrdered: "",
    ncsOrdered: "",
    emgOrdered: "",
    lumbarPuncture: "",
    geneticTesting: "",
    metabolicPanel: "",

    // SECTION 5: Analysis
    cbcResults: "",
    electrolyteResults: "",
    thyroidResults: "",
    esrCrpResults: "",
    autoimmuneResults: "",
    mriFindings: "",
    mrAngioFindings: "",
    eegResults: "",
    ncsResults: "",
    comparisonPrevious: "",

    // SECTION 6: Diagnosis
    primaryDiagnosis: "",
    secondaryDiagnosis: "",
    icd10Code: "",
    diseaseClassification: "",
    severity: "",
    stage: "",
    comorbidities: "",

    // SECTION 7: Management Plan
    medications: [],
    painManagement: "",
    spasticityManagement: "",
    seizureControl: "",
    lifestyleRecommendations: "",
    rehabilitation: "",
    surgicalPlan: "",
    endovascular: "",
    botulinumToxin: "",
    physiotherapy: "",
    occupationalTherapy: "",
    speechTherapy: "",
    followUpTiming: "",
    repeatImaging: "",
    repeatLabs: "",
    monitoring: "",
    warningSigns: "",

    // SECTION 8: Physician Notes
    clinicalObservations: "",
    patientQuestions: "",
    caregiverQuestions: "",
    educationProvided: "",
    referrals: [],
    multidisciplinaryCare: "",
  };
  const formatDateForInput = (dbDate) => {
    if (!dbDate) return "";
    try {
      // Convert to string and clean it
      let dateStr = String(dbDate).trim();

      // Remove any timezone offset prefix like '+03', '-05', etc. at the beginning
      // This fixes '+032026-01-01' -> '2026-01-01'
      dateStr = dateStr.replace(/^[+-]\d{2}/, "");

      // Extract only YYYY-MM-DD if there's any time component
      const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        return dateMatch[1];
      }

      // If it's a valid date string, try parsing it
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return "";
    } catch (e) {
      console.error("Error formatting date:", dbDate, e);
      return "";
    }
  };

  const [formData, setFormData] = useState(emptyFormState);

  
  useEffect(() => {
  const loadData = async () => {
    if (editMode.isEditing) {
      if (editMode.encounterData) {
        loadEncounterDataForEdit(editMode.encounterData);
      } else if (editMode.encounterId) {
        const res = await encounterApi.getEncounterById(editMode.encounterId);
        loadEncounterDataForEdit(res.data.data);
      }

      if (editMode.patientId) {
        setSelectedPatientId(editMode.patientId.toString());
      }
    } else {
      // --- NEW LOGIC FOR AUTO-GENERATING VISIT ID ---
      // Only generate if we don't already have one (to prevent changing on every render)
      setFormData(prev => ({
        ...prev,
        visit_id: prev.visit_id || generatePatientVisitId()
      }));

      if (location.state?.patientId) {
        setSelectedPatientId(location.state.patientId.toString());
        if (location.state.patientDetails) {
          loadPatientDemographics(location.state.patientDetails);
        }
      }
    }
  };

  loadData();
}, [editMode, location.state]);

  const loadEncounterDataForEdit = (data) => {

    if (!data) return;

    setFormData({
      // SECTION 1: Patient Demographics - neurology_encounters
      visit_id: data.encounter?.visit_id || "",
      patientId: data.encounter?.patient_id?.toString() || "",
      mrn: data.encounter?.mrn || "",
      name: data.encounter?.patient_name || "",
      dob: formatDateForInput(data.encounter?.dob),
      age: data.encounter.age || calculateAge(data.encounter.dob) || "", 
      gender: data.encounter?.gender || "",
      contactPhone: data.encounter?.contact_number || "",
      contactEmail: data.encounter?.email || "",
      address: data.encounter?.address || "",
      height: data.encounter?.height_cm?.toString() || "",
      weight: data.encounter?.weight_kg?.toString() || "",
      bmi: data.encounter?.bmi?.toString() || "",
      allergies: data.encounter?.allergies || "",
      pastMedicalHistory: data.encounter?.past_medical_history || "",
      pastSurgicalHistory: data.encounter?.past_surgical_history || "",
      familyHistory: data.encounter?.family_history || "",
      socialHistory: data.encounter?.social_history || "",
      occupation: data.encounter?.occupation || "",
      smokingStatus: data.encounter?.smoking_status || "",
      alcoholUse: data.encounter?.alcohol_use || "",
      lifestyle: data.encounter?.lifestyle || "",

      // SECTION 2: Presenting Complaint - neurology_complaints
      chiefComplaint: data.complaints?.chief_complaint || "",
      onset: formatDateForInput(data.complaints?.onset_date),
      duration: data.complaints?.duration || "",
      progression: data.complaints?.progression || "",

      // Weakness
      weaknessPresent: data.complaints?.weakness_present || "",
      weaknessSide: data.complaints?.weakness_side || "",
      weaknessLimb: data.complaints?.weakness_limb || "",
      weaknessPattern: data.complaints?.weakness_pattern || "",

      // Sensory
      numbness: data.complaints?.numbness || "",
      paresthesia: data.complaints?.paresthesia || "",
      tremors: data.complaints?.tremors || "",
      involuntaryMovements: data.complaints?.involuntary_movements || "",

      // Speech & Vision
      speechChanges: data.complaints?.speech_changes || "",
      languageChanges: data.complaints?.language_changes || "",
      visionChanges: data.complaints?.vision_changes || "",
      diplopia: data.complaints?.diplopia || "",

      // Balance
      dizziness: data.complaints?.dizziness || "",
      vertigo: data.complaints?.vertigo || "",
      balanceIssues: data.complaints?.balance_issues || "",

      // Cognitive
      cognitiveChanges: data.complaints?.cognitive_changes || "",
      memoryChanges: data.complaints?.memory_changes || "",

      // Pain
      neuropathicPain: data.complaints?.neuropathic_pain || "",
      radicularPain: data.complaints?.radicular_pain || "",

      // General
      symptomTriggers: data.complaints?.symptom_triggers || "",
      symptomRelievers: data.complaints?.symptom_relievers || "",
      overallSeverity: data.complaints?.overall_severity?.toString() || "0",

      // SECTION 3: Headache - neurology_headache
      headacheType: data.headache?.headache_type || "",
      headacheLocation: data.headache?.headache_location || "",
      headacheSeverity: data.headache?.headache_severity?.toString() || "0",
      headacheTriggers: data.headache?.headache_triggers || "",
      headacheDuration: data.headache?.headache_duration || "",

      // SECTION 4: Seizures - neurology_seizures
      seizures: data.seizures?.seizures_present || "No",
      seizureType: data.seizures?.seizure_type || "",
      seizureFrequency: data.seizures?.seizure_frequency || "",

      // SECTION 5: Neurological Examination - neurology_neuro_exam
      mentalStatusOrientation: data.neuroExam?.mental_status_orientation || "",
      memoryRegistration: data.neuroExam?.memory_registration || "",
      memoryRecall: data.neuroExam?.memory_recall || "",
      cognition: data.neuroExam?.cognition || "",
      cranialNerveFindings: data.neuroExam?.cranial_nerve_findings || "",
      motorTone: data.neuroExam?.motor_tone || "",
      motorPower: data.neuroExam?.motor_power || "",
      muscleBulk: data.neuroExam?.muscle_bulk || "",
      reflexesBiceps: data.neuroExam?.reflexes_biceps || "",
      reflexesTriceps: data.neuroExam?.reflexes_triceps || "",
      reflexesKnee: data.neuroExam?.reflexes_knee || "",
      reflexesAnkle: data.neuroExam?.reflexes_ankle || "",
      plantarResponse: data.neuroExam?.plantar_response || "",
      sensoryPain: data.neuroExam?.sensory_pain || "",
      sensoryTemperature: data.neuroExam?.sensory_temperature || "",
      sensoryVibration: data.neuroExam?.sensory_vibration || "",
      sensoryProprioception: data.neuroExam?.sensory_proprioception || "",
      coordinationFingerNose: data.neuroExam?.coordination_finger_nose || "",
      coordinationHeelShin: data.neuroExam?.coordination_heel_shin || "",
      gaitNormal: data.neuroExam?.gait || "",
      rombergTest: data.neuroExam?.romberg_test || "",
      tandemWalk: data.neuroExam?.tandem_walk || "",
      babinski: data.neuroExam?.babinski || "",
      hoffmann: data.neuroExam?.hoffmann || "",
      lhermitte: data.neuroExam?.lhermitte || "",
      adls: data.neuroExam?.adls || "",
      mobility: data.neuroExam?.mobility || "",

      // SECTION 6: Investigations - neurology_imaging
      labTests: data.lab_tests || [],
      ctBrain: data.imaging?.ct_brain || "",
      mriBrain: data.imaging?.mri_brain || "",
      mrAngiography: data.imaging?.mr_angiography || "",
      mriSpine: data.imaging?.mri_spine || "",
      lumbarPuncture: data.imaging?.lumbar_puncture || "",

      // Electrophysiology
      eegOrdered: data.electrophysiology?.eeg_ordered || "",
      ncsOrdered: data.electrophysiology?.ncs_ordered || "",
      emgOrdered: data.electrophysiology?.emg_ordered || "",

      // Other Tests
      geneticTesting: data.genetic_testing || "",
      metabolicPanel: data.metabolic_panel || "",

      // SECTION 7: Analysis - neurology_analysis
      cbcResults: data.labs?.cbc_results || "",
      electrolyteResults: data.labs?.electrolyte_results || "",
      thyroidResults: data.labs?.thyroid_results || "",
      esrCrpResults: data.labs?.esr_crp_results || "",
      autoimmuneResults: data.labs?.autoimmune_results || "",
      mriFindings: data.analysis?.mri_findings || "",
      mrAngioFindings: data.analysis?.mr_angio_findings || "",
      eegResults: data.analysis?.eeg_results || "",
      ncsResults: data.analysis?.ncs_results || "",
      comparisonPrevious: data.analysis?.comparison_previous || "",

      // SECTION 8: Diagnosis - neurology_diagnoses
      primaryDiagnosis:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")
          ?.diagnosis_name || "",
      secondaryDiagnosis:
        data.diagnoses?.find((d) => d.diagnosis_type === "secondary")
          ?.diagnosis_name || "",
      icd10Code:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")
          ?.icd10_code || "",
      diseaseClassification:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")
          ?.disease_classification || "",
      severity:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")?.severity ||
        "",
      stage:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")?.stage ||
        "",
      comorbidities:
        data.diagnoses?.find((d) => d.diagnosis_type === "primary")
          ?.comorbidities || "",

      // SECTION 9: Management Plan - neurology_management
      medications: data.medications || [],
      painManagement: data.management?.pain_management || "",
      spasticityManagement: data.management?.spasticity_management || "",
      seizureControl: data.management?.seizure_control || "",
      lifestyleRecommendations:
        data.management?.lifestyle_recommendations || "",
      rehabilitation: data.management?.rehabilitation || "",
      surgicalPlan: data.management?.surgical_plan || "",
      endovascular: data.management?.endovascular || "",
      botulinumToxin: data.management?.botulinum_toxin || "",
      physiotherapy: data.management?.physiotherapy || "",
      occupationalTherapy: data.management?.occupational_therapy || "",
      speechTherapy: data.management?.speech_therapy || "",
      followUpTiming: data.management?.follow_up_timing || "",
      repeatImaging: data.management?.repeat_imaging || "",
      repeatLabs: data.management?.repeat_labs || "",
      monitoring: data.management?.monitoring || "",
      warningSigns: data.management?.warning_signs || "",

      // SECTION 10: Notes & Referrals
      clinicalObservations: data.notes?.clinical_observations || "",
      patientQuestions: data.notes?.patient_questions || "",
      caregiverQuestions: data.notes?.caregiver_questions || "",
      educationProvided: data.notes?.education_provided || "",
      multidisciplinaryCare: data.notes?.multidisciplinary_care || "",
      referrals: data.referrals?.map((r) => r.referral_name || r) || [],
    });

    
  };

  const loadPatientDemographics = (patient) => {
    setFormData({
      ...emptyFormState,
      patientId: patient.patient_id || "",
      name: patient.patient_name || "",
      dob: patient.dob || "",
      age: calculateAge(patient.dob) || "",
      gender: patient.gender || "",
      contactPhone: patient.contact_number || "",
      contactEmail: patient.email || "",
      address: patient.address || "",
      // mrn: patient.mrn || "",
    });
  };

  // Fetch patients list on component mount
  useEffect(() => {
    fetchPatientsList();
  }, []);

  // Calculate BMI when height/weight changes
  useEffect(() => {
    if (formData.height && formData.weight) {
      const bmi = calculateBMI(formData.height, formData.weight);
      if (bmi) {
        setFormData((prev) => ({ ...prev, bmi }));
      }
    }
  }, [formData.height, formData.weight]);

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

  // Handle patient selection - SINGLE VERSION
  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);

    if (!patientId) {
      // If "Create New Patient" selected, clear all fields
      setFormData(emptyFormState);
      toast({
        title: "New Patient",
        description: "Please fill in the patient details.",
        status: "info",
        duration: 3000,
      });
      return;
    }

    const selectedPatient = patientsList.find(
      (p) => p.patient_id === parseInt(patientId),
    );
    if (selectedPatient) {
      loadPatientDemographics(selectedPatient);
      setSelectedPatient(selectedPatient);
      toast({
        title: "Patient Loaded",
        description: `${selectedPatient.patient_name}'s demographics loaded.`,
        status: "success",
        duration: 3000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const arr = formData[name] || [];
      if (checked) {
        setFormData({ ...formData, [name]: [...arr, value] });
      } else {
        setFormData({
          ...formData,
          [name]: arr.filter((item) => item !== value),
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    const updatedArray = [...formData[arrayName]];
    if (!updatedArray[index]) updatedArray[index] = {};
    updatedArray[index][field] = value;
    setFormData({ ...formData, [arrayName]: updatedArray });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], template],
    });
  };

  const removeArrayItem = (index, arrayName) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: updatedArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let patientId = formData.patientId;

      // Check if this is a NEW patient (no patientId selected AND not in edit mode)
      const isNewPatient =
        !selectedPatientId && !editMode.isEditing && formData.name;

      if (isNewPatient) {
        try {
          // Clean the phone number first
          const cleanedPhone = cleanPhoneNumber(formData.contactPhone);

         
          


          // Validate all required fields are present
          if (!formData.name?.trim()) {
            toast({
              title: "Validation Error",
              description: "Patient name is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          if (!formData.contactEmail?.trim()) {
            toast({
              title: "Validation Error",
              description: "Email address is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          if (!formData.gender?.trim()) {
            toast({
              title: "Validation Error",
              description: "Gender is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          if (!formData.dob) {
            toast({
              title: "Validation Error",
              description: "Date of birth is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          if (!formData.contactPhone?.trim()) {
            toast({
              title: "Validation Error",
              description: "Contact number is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          if (!cleanedPhone) {
            toast({
              title: "Validation Error",
              description: "Valid contact number is required",
              status: "error",
              duration: 3000,
            });
            setActiveTab(0);
            setIsSubmitting(false);
            return;
          }

          const newPatientData = {
            patient_name: formData.name.trim(),
            email: formData.contactEmail.trim(),
            gender: formData.gender.trim(),
            dob: formData.dob,
            contact_number: cleanedPhone,
            address: formData.address?.trim() || "",
            //mrn: formData.mrn?.trim() || `MRN-${Date.now()}`,
          };

          const newPatientResponse =
            await patientApi.createPatient(newPatientData);

          // Get the new patient ID from response
          patientId =
            newPatientResponse.data?.patient_id ||
            newPatientResponse.patient_id;

          toast({
            title: "Patient Created",
            description: "New patient record created successfully.",
            status: "success",
            duration: 3000,
          });
         
        } catch (patientError) {
          console.error("Error creating patient:", patientError);
          console.error("Error response:", patientError.response?.data);

          toast({
            title: "Error",
            description:
              patientError.response?.data?.message ||
              "Failed to create patient record",
            status: "error",
            duration: 5000,
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Use existing patient ID (from selected patient or edit mode)
        patientId = editMode.isEditing ? editMode.patientId : selectedPatientId;
      }

      const submissionData = {
        // Patient Information - use the patientId we have
        patient_id: patientId,
        visit_id: editMode.isEditing ? formData.encounterId : generatePatientVisitId(),
        name: formData.name,
        mrn: formData.mrn,
        dob: formData.dob,
        gender: formData.gender,
        contact_number: cleanPhoneNumber(formData.contactPhone),
        email: formData.contactEmail,
        address: formData.address,

        // Encounter Information
        encounter_id: editMode.isEditing
          ? editMode.encounterId
          : generatePatientVisitId(),
        height_cm: formData.height ? parseFloat(formData.height) : null,
        weight_kg: formData.weight ? parseFloat(formData.weight) : null,
        bmi: formData.bmi ? parseFloat(formData.bmi) : null,
        allergies: formData.allergies,
        past_medical_history: formData.pastMedicalHistory,
        past_surgical_history: formData.pastSurgicalHistory,
        family_history: formData.familyHistory,
        social_history: formData.socialHistory,
        occupation: formData.occupation,
        smoking_status: formData.smokingStatus,
        alcohol_use: formData.alcoholUse,
        lifestyle: formData.lifestyle,

        // Complaints
        chief_complaint: formData.chiefComplaint,
        onset_date: formData.onset,
        duration: formData.duration,
        progression: formData.progression,

        // Headache
        headache_type: formData.headacheType,
        headache_location: formData.headacheLocation,
        headache_severity: formData.headacheSeverity
          ? parseInt(formData.headacheSeverity)
          : null,
        headache_triggers: formData.headacheTriggers,
        headache_duration: formData.headacheDuration,

        // Weakness
        weakness_present: formData.weaknessPresent,
        weakness_side: formData.weaknessSide,
        weakness_pattern: formData.weaknessPattern,

        // Other symptoms
        numbness: formData.numbness,
        paresthesia: formData.paresthesia,
        tremors: formData.tremors,
        involuntary_movements: formData.involuntaryMovements,

        // Seizures
        seizures_present: formData.seizures,
        seizure_type: formData.seizureType,
        seizure_frequency: formData.seizureFrequency,

        // Speech & Vision
        speech_changes: formData.speechChanges,
        language_changes: formData.languageChanges,
        vision_changes: formData.visionChanges,
        diplopia: formData.diplopia,

        // Balance
        dizziness: formData.dizziness,
        vertigo: formData.vertigo,
        balance_issues: formData.balanceIssues,

        // Cognitive
        cognitive_changes: formData.cognitiveChanges,
        memory_changes: formData.memoryChanges,

        // Pain
        neuropathic_pain: formData.neuropathicPain,
        radicular_pain: formData.radicularPain,

        // General
        symptom_triggers: formData.symptomTriggers,
        symptom_relievers: formData.symptomRelievers,
        overall_severity: formData.overallSeverity
          ? parseInt(formData.overallSeverity)
          : null,

        // Mental Status
        mental_status_orientation: formData.mentalStatusOrientation,
        memory_registration: formData.memoryRegistration,
        memory_recall: formData.memoryRecall,
        cognition: formData.cognition,

        // Cranial Nerves
        cranial_nerve_findings: formData.cranialNerveFindings,

        // Motor
        motor_tone: formData.motorTone,
        motor_power: formData.motorPower,
        muscle_bulk: formData.muscleBulk,

        // Reflexes
        reflexes_biceps: formData.reflexesBiceps,
        reflexes_triceps: formData.reflexesTriceps,
        reflexes_knee: formData.reflexesKnee,
        reflexes_ankle: formData.reflexesAnkle,
        plantar_response: formData.plantarResponse,

        // Sensory
        sensory_pain: formData.sensoryPain,
        sensory_temperature: formData.sensoryTemperature,
        sensory_vibration: formData.sensoryVibration,
        sensory_proprioception: formData.sensoryProprioception,

        // Coordination
        coordination_finger_nose: formData.coordinationFingerNose,
        coordination_heel_shin: formData.coordinationHeelShin,

        // Gait
        gait: formData.gaitNormal,
        romberg_test: formData.rombergTest,
        tandem_walk: formData.tandemWalk,

        // Special Tests
        babinski: formData.babinski,
        hoffmann: formData.hoffmann,
        lhermitte: formData.lhermitte,

        // Functional
        adls: formData.adls,
        mobility: formData.mobility,

        // Investigations
        lab_tests: formData.labTests,
        ct_brain: formData.ctBrain,
        mri_brain: formData.mriBrain,
        mr_angiography: formData.mrAngiography,
        mri_spine: formData.mriSpine,
        eeg_ordered: formData.eegOrdered,
        ncs_ordered: formData.ncsOrdered,
        emg_ordered: formData.emgOrdered,
        lumbar_puncture: formData.lumbarPuncture,
        genetic_testing: formData.geneticTesting,
        metabolic_panel: formData.metabolicPanel,

        // Results
        cbc_results: formData.cbcResults,
        electrolyte_results: formData.electrolyteResults,
        thyroid_results: formData.thyroidResults,
        esr_crp_results: formData.esrCrpResults,
        autoimmune_results: formData.autoimmuneResults,
        mri_findings: formData.mriFindings,
        mr_angio_findings: formData.mrAngioFindings,
        eeg_results: formData.eegResults,
        ncs_results: formData.ncsResults,
        comparison_previous: formData.comparisonPrevious,

        // Diagnoses
        primary_diagnosis: formData.primaryDiagnosis,
        secondary_diagnosis: formData.secondaryDiagnosis,
        icd10_code: formData.icd10Code,
        disease_classification: formData.diseaseClassification,
        severity: formData.severity,
        stage: formData.stage,
        comorbidities: formData.comorbidities,

        // Medications
        medications: formData.medications,

        // Management
        pain_management: formData.painManagement,
        spasticity_management: formData.spasticityManagement,
        seizure_control: formData.seizureControl,
        lifestyle_recommendations: formData.lifestyleRecommendations,
        rehabilitation: formData.rehabilitation,
        surgical_plan: formData.surgicalPlan,
        endovascular: formData.endovascular,
        botulinum_toxin: formData.botulinumToxin,
        physiotherapy: formData.physiotherapy,
        occupational_therapy: formData.occupationalTherapy,
        speech_therapy: formData.speechTherapy,
        follow_up_timing: formData.followUpTiming,
        repeat_imaging: formData.repeatImaging,
        repeat_labs: formData.repeatLabs,
        monitoring: formData.monitoring,
        warning_signs: formData.warningSigns,

        // Notes
        clinical_observations: formData.clinicalObservations,
        patient_questions: formData.patientQuestions,
        caregiver_questions: formData.caregiverQuestions,
        education_provided: formData.educationProvided,
        referrals: formData.referrals,
        multidisciplinary_care: formData.multidisciplinaryCare,
      };

      let response;
      if (editMode.isEditing) {
        // Update existing encounter
        response = await encounterApi.patchEncounter(
          editMode.encounterId,
          submissionData,
        );
        clearEditMode();
        toast({
          title: "Success",
          description: "Neurology encounter updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })

      } else {
        // Create new encounter
        response = await submitCompleteForm(submissionData);

        // RESET THE FORM AFTER SUCCESSFUL CREATION
        setFormData(emptyFormState); // Reset all form fields
        setSelectedPatientId(""); // Clear selected patient
        setSelectedPatient(null); // Clear selected patient object

        toast({
          title: "Success",
          description: "Neurology encounter form saved successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }

      navigate("/neurologyRecords", { state: { refresh: true } });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit form",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTab = () => {
    setActiveTab((prev) => Math.min(prev + 1, 7));
  };

  const handlePrevTab = () => {
    setActiveTab((prev) => Math.max(prev - 1, 0));
  };

  const handleCancel = () => {
    if (editMode.isEditing) {
      clearEditMode();
    }
    navigate("/neurologyRecords");
  };

  return (
    <Container maxW="container.xl" py={6} px={{ base: 2, md: 4 }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box
          textAlign="left"
          bg="gray.50"
          p={6}
          borderRadius="lg"
          borderLeft="5px solid"
          borderLeftColor={editMode.isEditing ? "green.500" : "blue.500"}
        >
          <Heading
            color={editMode.isEditing ? "green.700" : "blue.700"}
            mb={2}
            fontSize={{ base: "2xl", md: "3xl" }}
          >
            {editMode.isEditing
              ? "Edit Neurology Encounter"
              : "Neurology Patient Encounter Form"}
          </Heading>
          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
            {editMode.isEditing
              ? "Modify existing neurological assessment"
              : "Comprehensive neurological assessment and management tool"}
          </Text>

          {/* Patient Selector - Only show for new encounters */}
          {!editMode.isEditing && (
            <Box mt={4} p={4} bg="blue.50" borderRadius="md">
              <HStack spacing={4} mb={2}>
                <InfoIcon color="blue.500" />
                <Heading size="sm" color="blue.700">
                  Select Existing Patient
                </Heading>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="bold">Search/Select Patient</FormLabel>
                  <Select
                    placeholder="-- Choose existing patient --"
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    bg="white"
                    isLoading={loadingPatients}
                  >
                    <option value="">-- Create New Patient --</option>
                    {patientsList.map((patient) => (
                      <option
                        key={patient.patient_id}
                        value={patient.patient_id}
                      >
                        {patient.patient_name} ({patient.gender},{" "}
                        {calculateAge(patient.dob)} yrs)
                      </option>
                    ))}
                  </Select>
                </FormControl>
                {selectedPatientId && (
                  <FormControl>
                    <FormLabel fontWeight="bold" color="green.600">
                      Status
                    </FormLabel>
                    <Badge colorScheme="green" fontSize="md" p={2}>
                      Patient Loaded ✓
                    </Badge>
                  </FormControl>
                )}
              </SimpleGrid>
            </Box>
          )}

          {/* Edit mode indicator */}
          {editMode.isEditing && (
            <Box mt={4} p={4} bg="green.50" borderRadius="md">
              <HStack spacing={4}>
                <InfoIcon color="green.500" />
                <Text fontWeight="bold" color="green.700">
                  Editing Encounter: {editMode.encounterId}
                </Text>
              </HStack>
            </Box>
          )}
        </Box>

        {/* Tabs Navigation */}
        <Card borderRadius="lg" boxShadow="sm">
          <CardBody p={0}>
            <Tabs
              index={activeTab}
              onChange={setActiveTab}
              isLazy
              colorScheme="blue"
              variant="enclosed"
            >
              <TabList
                overflowX="auto"
                overflowY="hidden"
                px={{ base: 2, md: 4 }}
                py={2}
                borderBottomWidth="2px"
                borderBottomColor="gray.200"
                gap={{ base: 1, md: 2 }}
                bg="white"
              >
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Demographics
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Symptoms
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Neuro Exam
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Investigations
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Analysis
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Diagnosis
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Management
                </Tab>
                <Tab
                  _selected={{
                    color: "blue.600",
                    borderBottomColor: "blue.600",
                    fontWeight: "600",
                    bg: "blue.50",
                  }}
                >
                  Notes
                </Tab>
              </TabList>

              <TabPanels>
                {/* TAB 1: Patient Demographics */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">Patient Identification</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={4}
                        >
                          <FormControl>
                            <FormLabel>Patient ID</FormLabel>
                            <Input
                              name="patientId"
                              value={formData.patientId}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          {/* <FormControl>
                            <FormLabel>MRN</FormLabel>
                            <Input
                              name="mrn"
                              value={formData.mrn}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl> */}
                          <FormControl>
                            <FormLabel>Full Name</FormLabel>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Date of Birth</FormLabel>
                            <Input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Age</FormLabel>
                            {/* <NumberInput value={formData.age}>
                              <NumberInputField
                                name="age"
                                onChange={handleChange}
                                bg="white"
                              />
                            </NumberInput> */}
                            <NumberInput
                              value={formData.age}
                              onChange={(value) =>
                                setFormData((prev) => ({ ...prev, age: value }))
                              }
                            >
                              <NumberInputField bg="white" />
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              bg="white"
                            >
                              {genderOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">Contact Information</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Phone</FormLabel>
                            <Input
                              name="contactPhone"
                              value={formData.contactPhone}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input
                              type="email"
                              name="contactEmail"
                              value={formData.contactEmail}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl
                            gridColumn={{ base: "span 1", md: "span 2" }}
                          >
                            <FormLabel>Address</FormLabel>
                            <Textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows={2}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">Physical Metrics</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Height (cm)</FormLabel>
                            {/* <NumberInput 
                              value={formData.height}>
                              <NumberInputField
                                name="height"
                                onChange={handleChange}
                                bg="white"
                              />
                            </NumberInput> */}
                            <NumberInput
                              value={formData.height}
                              onChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  height: value,
                                }))
                              }
                            >
                              <NumberInputField bg="white" />
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Weight (kg)</FormLabel>
                            {/* <NumberInput value={formData.weight}>
                              <NumberInputField
                                name="weight"
                                onChange={handleChange}
                                bg="white"
                              />
                            </NumberInput> */}
                            <NumberInput
                              value={formData.weight}
                              onChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  weight: value,
                                }))
                              }
                            >
                              <NumberInputField bg="white" />
                            </NumberInput>
                          </FormControl>
                          <FormControl>
                            <FormLabel>BMI</FormLabel>
                            <Input
                              name="bmi"
                              value={formData.bmi}
                              onChange={handleChange}
                              bg="gray.50"
                              isReadOnly
                            />
                            <Progress
                              value={(formData.bmi / 40) * 100}
                              size="sm"
                              colorScheme={
                                formData.bmi > 30
                                  ? "red"
                                  : formData.bmi > 25
                                    ? "orange"
                                    : "green"
                              }
                              mt={2}
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">Medical History</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4}>
                            <FormControl>
                              <FormLabel>Allergies</FormLabel>
                              <Textarea
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                rows={2}
                                bg="white"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Past Medical History</FormLabel>
                              <Textarea
                                name="pastMedicalHistory"
                                value={formData.pastMedicalHistory}
                                onChange={handleChange}
                                rows={3}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>
                          <VStack spacing={4}>
                            <FormControl>
                              <FormLabel>Past Surgical History</FormLabel>
                              <Textarea
                                name="pastSurgicalHistory"
                                value={formData.pastSurgicalHistory}
                                onChange={handleChange}
                                rows={3}
                                bg="white"
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Family History</FormLabel>
                              <Textarea
                                name="familyHistory"
                                value={formData.familyHistory}
                                onChange={handleChange}
                                rows={3}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">
                          Social & Occupational History
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={4}
                        >
                          <FormControl>
                            <FormLabel>Occupation</FormLabel>
                            <Input
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel>Smoking Status</FormLabel>
                            <Select
                              name="smokingStatus"
                              value={formData.smokingStatus}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option value="Never">Never</option>
                              <option value="Former">Former</option>
                              <option value="Current">Current</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Alcohol Use</FormLabel>
                            <Select
                              name="alcoholUse"
                              value={formData.alcoholUse}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option value="None">None</option>
                              <option value="Occasional">Occasional</option>
                              <option value="Regular">Regular</option>
                              <option value="Heavy">Heavy</option>
                            </Select>
                          </FormControl>
                          <FormControl
                            gridColumn={{ base: "span 1", md: "span 3" }}
                          >
                            <FormLabel>Lifestyle</FormLabel>
                            <Textarea
                              name="lifestyle"
                              value={formData.lifestyle}
                              onChange={handleChange}
                              rows={2}
                              bg="white"
                            />
                          </FormControl>
                          <FormControl
                            gridColumn={{ base: "span 1", md: "span 3" }}
                          >
                            <FormLabel>Social History</FormLabel>
                            <Textarea
                              name="socialHistory"
                              value={formData.socialHistory}
                              onChange={handleChange}
                              rows={2}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 2: Presenting Complaint */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* MAIN */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="md">
                          Presenting Complaint & Symptoms
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={6} align="stretch">
                          <FormControl>
                            <FormLabel>Chief Complaint</FormLabel>
                            <Textarea
                              name="chiefComplaint"
                              value={formData.chiefComplaint}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            <FormControl>
                              <FormLabel>Onset</FormLabel>
                              <Input
                                type="date"
                                name="onset"
                                value={formData.onset}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Duration</FormLabel>
                              <Input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Progression</FormLabel>
                              <Select
                                name="progression"
                                value={formData.progression}
                                onChange={handleChange}
                                bg="white"
                              >
                                <option>Improving</option>
                                <option>Stable</option>
                                <option>Worsening</option>
                                <option>Fluctuating</option>
                              </Select>
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* HEADACHE */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Headache Details</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={4}
                        >
                          <FormControl>
                            <FormLabel>Type</FormLabel>
                            <Select
                              name="headacheType"
                              value={formData.headacheType}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option value="">Select</option>
                              {headacheTypes.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Input
                              name="headacheLocation"
                              value={formData.headacheLocation}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Severity</FormLabel>
                            <HStack>
                              <Slider
                                value={parseInt(formData.headacheSeverity) || 0}
                                min={0}
                                max={10}
                                onChange={(val) =>
                                  setFormData({
                                    ...formData,
                                    headacheSeverity: val.toString(),
                                  })
                                }
                              >
                                <SliderTrack>
                                  <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                              </Slider>
                              <Text>{formData.headacheSeverity}/10</Text>
                            </HStack>
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid
                          columns={{ base: 1, md: 2 }}
                          spacing={4}
                          mt={4}
                        >
                          <FormControl>
                            <FormLabel>Triggers</FormLabel>
                            <Textarea
                              name="headacheTriggers"
                              value={formData.headacheTriggers}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Duration</FormLabel>
                            <Input
                              name="headacheDuration"
                              value={formData.headacheDuration}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* WEAKNESS + SENSORY */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Weakness & Sensory</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Weakness</FormLabel>
                              <Select
                                name="weaknessPresent"
                                value={formData.weaknessPresent}
                                onChange={handleChange}
                              >
                                <option>No</option>
                                <option>Yes</option>
                              </Select>
                            </FormControl>

                            {formData.weaknessPresent === "Yes" && (
                              <>
                                <FormControl>
                                  <FormLabel>Side</FormLabel>
                                  <Select
                                    name="weaknessSide"
                                    value={formData.weaknessSide}
                                    onChange={handleChange}
                                  >
                                    <option>Left</option>
                                    <option>Right</option>
                                    <option>Bilateral</option>
                                  </Select>
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Pattern</FormLabel>
                                  <Select
                                    name="weaknessPattern"
                                    value={formData.weaknessPattern}
                                    onChange={handleChange}
                                  >
                                    {weaknessPatterns.map((p) => (
                                      <option key={p}>{p}</option>
                                    ))}
                                  </Select>
                                </FormControl>
                              </>
                            )}
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Numbness</FormLabel>
                              <Textarea
                                name="numbness"
                                value={formData.numbness}
                                onChange={handleChange}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Paresthesia</FormLabel>
                              <Textarea
                                name="paresthesia"
                                value={formData.paresthesia}
                                onChange={handleChange}
                              />
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* SEIZURE + SPEECH */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Seizures & Speech/Vision</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Seizures</FormLabel>
                              <Select
                                name="seizures"
                                value={formData.seizures}
                                onChange={handleChange}
                              >
                                <option>No</option>
                                <option>Yes</option>
                              </Select>
                            </FormControl>

                            {formData.seizures === "Yes" && (
                              <>
                                <FormControl>
                                  <FormLabel>Type</FormLabel>
                                  <Select
                                    name="seizureType"
                                    value={formData.seizureType}
                                    onChange={handleChange}
                                  >
                                    {seizureTypes.map((t) => (
                                      <option key={t}>{t}</option>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Frequency</FormLabel>
                                  <Input
                                    name="seizureFrequency"
                                    value={formData.seizureFrequency}
                                    onChange={handleChange}
                                  />
                                </FormControl>
                              </>
                            )}
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Speech</FormLabel>
                              <Textarea
                                name="speechChanges"
                                value={formData.speechChanges}
                                onChange={handleChange}
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Vision</FormLabel>
                              <Textarea
                                name="visionChanges"
                                value={formData.visionChanges}
                                onChange={handleChange}
                              />
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* GENERAL (FINAL) */}
                    {(() => {
                      const severity = parseInt(formData.overallSeverity) || 0;
                      const severityColor =
                        severity >= 8
                          ? "red"
                          : severity >= 5
                            ? "orange"
                            : "green";

                      return (
                        <Card>
                          <CardHeader bg="blue.50">
                            <Heading size="sm">General</Heading>
                          </CardHeader>
                          <CardBody>
                            <FormControl>
                              <FormLabel>Overall Severity (0–10)</FormLabel>
                              <HStack w="100%">
                                <Slider
                                  value={severity}
                                  min={0}
                                  max={10}
                                  flex="1"
                                  onChange={(val) =>
                                    setFormData({
                                      ...formData,
                                      overallSeverity: val.toString(),
                                    })
                                  }
                                >
                                  <SliderTrack
                                    h="6px"
                                    bg="gray.200"
                                    borderRadius="full"
                                  >
                                    <SliderFilledTrack
                                      bg={`${severityColor}.500`}
                                      borderRadius="full"
                                    />
                                  </SliderTrack>

                                  <SliderThumb boxSize={5} />
                                </Slider>

                                <Text
                                  fontWeight="bold"
                                  color={`${severityColor}.600`}
                                  minW="40px"
                                >
                                  {severity}/10
                                </Text>
                              </HStack>
                            </FormControl>
                          </CardBody>
                        </Card>
                      );
                    })()}
                  </VStack>
                </TabPanel>

                {/* TAB 3: Neurological Examination */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* MENTAL STATUS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Mental Status Examination</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={4}
                        >
                          <FormControl>
                            <FormLabel>Orientation</FormLabel>
                            <Textarea
                              name="mentalStatusOrientation"
                              value={formData.mentalStatusOrientation}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Memory Registration</FormLabel>
                            <Input
                              name="memoryRegistration"
                              value={formData.memoryRegistration}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Memory Recall</FormLabel>
                            <Input
                              name="memoryRecall"
                              value={formData.memoryRecall}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl gridColumn={{ md: "span 3" }}>
                            <FormLabel>Cognition</FormLabel>
                            <Textarea
                              name="cognition"
                              value={formData.cognition}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* CRANIAL NERVES */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Cranial Nerves (I–XII)</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <FormLabel>Findings</FormLabel>
                          <Textarea
                            name="cranialNerveFindings"
                            value={formData.cranialNerveFindings}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>

                    {/* MOTOR */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Motor Examination</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Muscle Tone</FormLabel>
                              <Textarea
                                name="motorTone"
                                value={formData.motorTone}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Muscle Bulk</FormLabel>
                              <Textarea
                                name="muscleBulk"
                                value={formData.muscleBulk}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>Motor Power</FormLabel>
                              <Textarea
                                name="motorPower"
                                value={formData.motorPower}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* REFLEXES */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Reflexes</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 4 }}
                          spacing={4}
                        >
                          <Input
                            name="reflexesBiceps"
                            placeholder="Biceps"
                            value={formData.reflexesBiceps}
                            onChange={handleChange}
                          />
                          <Input
                            name="reflexesTriceps"
                            placeholder="Triceps"
                            value={formData.reflexesTriceps}
                            onChange={handleChange}
                          />
                          <Input
                            name="reflexesKnee"
                            placeholder="Knee"
                            value={formData.reflexesKnee}
                            onChange={handleChange}
                          />
                          <Input
                            name="reflexesAnkle"
                            placeholder="Ankle"
                            value={formData.reflexesAnkle}
                            onChange={handleChange}
                          />

                          <FormControl gridColumn={{ md: "span 4" }}>
                            <FormLabel>Plantar Response</FormLabel>
                            <Input
                              name="plantarResponse"
                              value={formData.plantarResponse}
                              onChange={handleChange}
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* SENSORY */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Sensory Examination</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 4 }}
                          spacing={4}
                        >
                          <Input
                            name="sensoryPain"
                            placeholder="Pain"
                            value={formData.sensoryPain}
                            onChange={handleChange}
                          />
                          <Input
                            name="sensoryTemperature"
                            placeholder="Temperature"
                            value={formData.sensoryTemperature}
                            onChange={handleChange}
                          />
                          <Input
                            name="sensoryVibration"
                            placeholder="Vibration"
                            value={formData.sensoryVibration}
                            onChange={handleChange}
                          />
                          <Input
                            name="sensoryProprioception"
                            placeholder="Proprioception"
                            value={formData.sensoryProprioception}
                            onChange={handleChange}
                          />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* COORDINATION + GAIT */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Coordination & Gait</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <Textarea
                              name="coordinationFingerNose"
                              placeholder="Finger-Nose"
                              value={formData.coordinationFingerNose}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="coordinationHeelShin"
                              placeholder="Heel-Shin"
                              value={formData.coordinationHeelShin}
                              onChange={handleChange}
                            />
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <Textarea
                              name="gaitNormal"
                              placeholder="Gait"
                              value={formData.gaitNormal}
                              onChange={handleChange}
                            />
                            <Input
                              name="rombergTest"
                              placeholder="Romberg"
                              value={formData.rombergTest}
                              onChange={handleChange}
                            />
                            <Input
                              name="tandemWalk"
                              placeholder="Tandem Walk"
                              value={formData.tandemWalk}
                              onChange={handleChange}
                            />
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* SPECIAL TESTS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Special Tests</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Input
                            name="babinski"
                            placeholder="Babinski"
                            value={formData.babinski}
                            onChange={handleChange}
                          />
                          <Input
                            name="hoffmann"
                            placeholder="Hoffmann"
                            value={formData.hoffmann}
                            onChange={handleChange}
                          />
                          <Input
                            name="lhermitte"
                            placeholder="Lhermitte"
                            value={formData.lhermitte}
                            onChange={handleChange}
                          />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* FUNCTIONAL */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Functional Status</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <Textarea
                            name="adls"
                            placeholder="ADLs"
                            value={formData.adls}
                            onChange={handleChange}
                          />
                          <Textarea
                            name="mobility"
                            placeholder="Mobility"
                            value={formData.mobility}
                            onChange={handleChange}
                          />
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 4: Investigations Ordered */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* LAB TESTS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Laboratory Tests</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 3 }}
                          spacing={3}
                        >
                          {[
                            "CBC",
                            "Electrolytes",
                            "Thyroid Function",
                            "ESR",
                            "CRP",
                            "Autoimmune Panel",
                            "Vitamin B12",
                            "Folate",
                            "Homocysteine",
                            "Lyme Serology",
                            "HIV",
                            "Syphilis",
                          ].map((test) => (
                            <Checkbox
                              key={test}
                              name="labTests"
                              value={test}
                              isChecked={formData.labTests?.includes(test)}
                              onChange={handleChange}
                            >
                              {test}
                            </Checkbox>
                          ))}
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* NEUROIMAGING */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Neuroimaging</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>CT Brain</FormLabel>
                              <Select
                                name="ctBrain"
                                value={formData.ctBrain}
                                onChange={handleChange}
                                bg="white"
                              >
                                <option>Not done</option>
                                <option>Done - normal</option>
                                <option>Done - abnormal</option>
                                <option>Pending</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel>MRI Brain</FormLabel>
                              <Select
                                name="mriBrain"
                                value={formData.mriBrain}
                                onChange={handleChange}
                                bg="white"
                              >
                                <option>Not done</option>
                                <option>Done - normal</option>
                                <option>Done - abnormal</option>
                                <option>Scheduled</option>
                                <option>Pending</option>
                              </Select>
                            </FormControl>
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>MR Angiography</FormLabel>
                              <Select
                                name="mrAngiography"
                                value={formData.mrAngiography}
                                onChange={handleChange}
                                bg="white"
                              >
                                <option>Not done</option>
                                <option>Done</option>
                                <option>Scheduled</option>
                                <option>Consider if indicated</option>
                              </Select>
                            </FormControl>

                            <FormControl>
                              <FormLabel>MRI Spine</FormLabel>
                              <Select
                                name="mriSpine"
                                value={formData.mriSpine}
                                onChange={handleChange}
                                bg="white"
                              >
                                <option>Not indicated</option>
                                <option>Done</option>
                                <option>Scheduled</option>
                                <option>Consider if indicated</option>
                              </Select>
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* ELECTROPHYSIOLOGY */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Electrophysiology</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel>EEG</FormLabel>
                            <Select
                              name="eegOrdered"
                              value={formData.eegOrdered}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option>Not indicated</option>
                              <option>Done</option>
                              <option>Scheduled</option>
                              <option>Consider if atypical features</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Nerve Conduction Study</FormLabel>
                            <Select
                              name="ncsOrdered"
                              value={formData.ncsOrdered}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option>Not indicated</option>
                              <option>Done</option>
                              <option>Scheduled</option>
                              <option>Consider if neuropathy</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>EMG</FormLabel>
                            <Select
                              name="emgOrdered"
                              value={formData.emgOrdered}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option>Not indicated</option>
                              <option>Done</option>
                              <option>Scheduled</option>
                              <option>Consider if myopathy</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* OTHER */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Other Investigations</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Lumbar Puncture</FormLabel>
                            <Select
                              name="lumbarPuncture"
                              value={formData.lumbarPuncture}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option>Not indicated</option>
                              <option>Done</option>
                              <option>Scheduled</option>
                              <option>Consider if MRI negative</option>
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Genetic Testing</FormLabel>
                            <Select
                              name="geneticTesting"
                              value={formData.geneticTesting}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option>Not indicated</option>
                              <option>Done</option>
                              <option>Consider family history</option>
                              <option>Patient declined</option>
                            </Select>
                          </FormControl>

                          <FormControl gridColumn={{ md: "span 2" }}>
                            <FormLabel>Metabolic Panel</FormLabel>
                            <Input
                              name="metabolicPanel"
                              value={formData.metabolicPanel}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 5: Analysis of Investigation Reports */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* LAB RESULTS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Laboratory Results</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>CBC Results</FormLabel>
                              <Textarea
                                name="cbcResults"
                                value={formData.cbcResults}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Electrolytes</FormLabel>
                              <Textarea
                                name="electrolyteResults"
                                value={formData.electrolyteResults}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Thyroid</FormLabel>
                              <Textarea
                                name="thyroidResults"
                                value={formData.thyroidResults}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <FormControl>
                              <FormLabel>ESR / CRP</FormLabel>
                              <Textarea
                                name="esrCrpResults"
                                value={formData.esrCrpResults}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>

                            <FormControl>
                              <FormLabel>Autoimmune</FormLabel>
                              <Textarea
                                name="autoimmuneResults"
                                value={formData.autoimmuneResults}
                                onChange={handleChange}
                                bg="white"
                              />
                            </FormControl>
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* IMAGING */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Imaging Findings</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>MRI Brain</FormLabel>
                            <Textarea
                              name="mriFindings"
                              value={formData.mriFindings}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>MR Angiography</FormLabel>
                            <Textarea
                              name="mrAngioFindings"
                              value={formData.mrAngioFindings}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* ELECTROPHYSIOLOGY */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Electrophysiology Results</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>EEG</FormLabel>
                            <Textarea
                              name="eegResults"
                              value={formData.eegResults}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>NCS / EMG</FormLabel>
                            <Textarea
                              name="ncsResults"
                              value={formData.ncsResults}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* COMPARISON */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Comparison</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <FormLabel>
                            Comparison with Previous Results
                          </FormLabel>
                          <Textarea
                            name="comparisonPrevious"
                            value={formData.comparisonPrevious}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 6: Diagnosis */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* DIAGNOSIS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Diagnosis</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>Primary Diagnosis</FormLabel>
                            <Textarea
                              name="primaryDiagnosis"
                              value={formData.primaryDiagnosis}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Secondary Diagnosis</FormLabel>
                            <Textarea
                              name="secondaryDiagnosis"
                              value={formData.secondaryDiagnosis}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* CODING & SEVERITY */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Coding & Severity</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>ICD-10 Code</FormLabel>
                            <Input
                              name="icd10Code"
                              value={formData.icd10Code}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Severity</FormLabel>
                            <Select
                              name="severity"
                              value={formData.severity}
                              onChange={handleChange}
                              bg="white"
                            >
                              <option value="Mild">Mild</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Severe">Severe</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* CLASSIFICATION */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Classification & Stage</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>Disease Classification</FormLabel>
                            <Textarea
                              name="diseaseClassification"
                              value={formData.diseaseClassification}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Disease Stage</FormLabel>
                            <Input
                              name="stage"
                              value={formData.stage}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* COMORBIDITIES */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Comorbidities</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <FormLabel>Comorbidities</FormLabel>
                          <Textarea
                            name="comorbidities"
                            value={formData.comorbidities}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 7: Management Plan */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* MEDICATIONS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Medical Treatment</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          {formData.medications.map((med, index) => (
                            <Card
                              key={index}
                              variant="outline"
                              bgColor="gray.50"
                            >
                              <CardBody>
                                <HStack justify="space-between" mb={3}>
                                  <Text fontWeight="bold">
                                    Medication #{index + 1}
                                  </Text>
                                  <IconButton
                                    aria-label="Remove"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() =>
                                      removeArrayItem(index, "medications")
                                    }
                                  />
                                </HStack>

                                <SimpleGrid
                                  columns={{ base: 1, md: 2, lg: 5 }}
                                  spacing={3}
                                >
                                  <Input
                                    placeholder="Drug"
                                    value={med.name}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        index,
                                        "name",
                                        e.target.value,
                                        "medications",
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Dose"
                                    value={med.dose}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        index,
                                        "dose",
                                        e.target.value,
                                        "medications",
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Route"
                                    value={med.route}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        index,
                                        "route",
                                        e.target.value,
                                        "medications",
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Frequency"
                                    value={med.frequency}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        index,
                                        "frequency",
                                        e.target.value,
                                        "medications",
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Duration"
                                    value={med.duration}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        index,
                                        "duration",
                                        e.target.value,
                                        "medications",
                                      )
                                    }
                                  />
                                </SimpleGrid>

                                <Input
                                  mt={3}
                                  placeholder="Purpose"
                                  value={med.purpose}
                                  onChange={(e) =>
                                    handleArrayChange(
                                      index,
                                      "purpose",
                                      e.target.value,
                                      "medications",
                                    )
                                  }
                                />
                              </CardBody>
                            </Card>
                          ))}

                          <Button
                            leftIcon={<AddIcon />}
                            onClick={() =>
                              addArrayItem("medications", {
                                name: "",
                                dose: "",
                                route: "",
                                frequency: "",
                                duration: "",
                                purpose: "",
                              })
                            }
                            variant="outline"
                          >
                            Add Medication
                          </Button>

                          {/* Pain + Seizure */}
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Textarea
                              name="painManagement"
                              placeholder="Pain Management"
                              value={formData.painManagement}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="seizureControl"
                              placeholder="Seizure Control"
                              value={formData.seizureControl}
                              onChange={handleChange}
                            />
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>

                    {/* LIFESTYLE */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Lifestyle & Rehabilitation</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Textarea
                            name="lifestyleRecommendations"
                            placeholder="Lifestyle"
                            value={formData.lifestyleRecommendations}
                            onChange={handleChange}
                          />
                          <Textarea
                            name="rehabilitation"
                            placeholder="Rehabilitation"
                            value={formData.rehabilitation}
                            onChange={handleChange}
                          />
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* PROCEDURES */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Procedures & Therapies</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <Textarea
                              name="surgicalPlan"
                              placeholder="Surgical Plan"
                              value={formData.surgicalPlan}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="endovascular"
                              placeholder="Endovascular"
                              value={formData.endovascular}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="botulinumToxin"
                              placeholder="Botulinum / Nerve Blocks"
                              value={formData.botulinumToxin}
                              onChange={handleChange}
                            />
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <Textarea
                              name="physiotherapy"
                              placeholder="Physiotherapy"
                              value={formData.physiotherapy}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="occupationalTherapy"
                              placeholder="Occupational Therapy"
                              value={formData.occupationalTherapy}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="speechTherapy"
                              placeholder="Speech Therapy"
                              value={formData.speechTherapy}
                              onChange={handleChange}
                            />
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* FOLLOW-UP */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Follow-up Plan</Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <VStack spacing={4} align="stretch">
                            <Input
                              name="followUpTiming"
                              placeholder="Follow-up Timing"
                              value={formData.followUpTiming}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="repeatImaging"
                              placeholder="Repeat Imaging"
                              value={formData.repeatImaging}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="repeatLabs"
                              placeholder="Repeat Labs"
                              value={formData.repeatLabs}
                              onChange={handleChange}
                            />
                          </VStack>

                          <VStack spacing={4} align="stretch">
                            <Textarea
                              name="monitoring"
                              placeholder="Monitoring Plan"
                              value={formData.monitoring}
                              onChange={handleChange}
                            />
                            <Textarea
                              name="warningSigns"
                              placeholder="Red Flags"
                              value={formData.warningSigns}
                              onChange={handleChange}
                            />
                          </VStack>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* TAB 8: Physician Notes */}
                <TabPanel py={6} px={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    {/* OBSERVATIONS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Clinical Observations</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <Textarea
                            name="clinicalObservations"
                            value={formData.clinicalObservations}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>

                    {/* QUESTIONS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">
                          Patient & Caregiver Questions
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <FormControl>
                            <FormLabel>Patient Questions</FormLabel>
                            <Textarea
                              name="patientQuestions"
                              value={formData.patientQuestions}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Caregiver Questions</FormLabel>
                            <Textarea
                              name="caregiverQuestions"
                              value={formData.caregiverQuestions}
                              onChange={handleChange}
                              bg="white"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>

                    {/* EDUCATION */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Education Provided</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <Textarea
                            name="educationProvided"
                            value={formData.educationProvided}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>

                    {/* REFERRALS */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Referrals</Heading>
                      </CardHeader>
                      <CardBody>
                        <Wrap spacing={2}>
                          {formData.referrals.map((ref, index) => (
                            <WrapItem key={index}>
                              <Tag colorScheme="blue">
                                <TagLabel>{ref}</TagLabel>
                                <TagCloseButton
                                  onClick={() => {
                                    const updated = formData.referrals.filter(
                                      (_, i) => i !== index,
                                    );
                                    setFormData({
                                      ...formData,
                                      referrals: updated,
                                    });
                                  }}
                                />
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>

                        <HStack mt={3}>
                          <Input
                            id="referralInput"
                            placeholder="Add referral"
                            bg="white"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.target.value.trim()) {
                                setFormData({
                                  ...formData,
                                  referrals: [
                                    ...formData.referrals,
                                    e.target.value.trim(),
                                  ],
                                });
                                e.target.value = "";
                              }
                            }}
                          />

                          <Button
                            colorScheme="blue"
                            onClick={() => {
                              const input =
                                document.getElementById("referralInput");
                              if (input.value.trim()) {
                                setFormData({
                                  ...formData,
                                  referrals: [
                                    ...formData.referrals,
                                    input.value.trim(),
                                  ],
                                });
                                input.value = "";
                              }
                            }}
                          >
                            Add
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>

                    {/* CARE PLAN */}
                    <Card>
                      <CardHeader bg="blue.50">
                        <Heading size="sm">Multidisciplinary Care Plan</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl>
                          <Textarea
                            name="multidisciplinaryCare"
                            value={formData.multidisciplinaryCare}
                            onChange={handleChange}
                            bg="white"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Navigation Buttons */}
        <HStack
          justify="space-between"
          pt={6}
          pb={4}
          px={{ base: 3, md: 6 }}
          gap={{ base: 2, md: 4 }}
          flexWrap={{ base: "wrap", md: "nowrap" }}
        >
          <Button
            onClick={handlePrevTab}
            isDisabled={activeTab === 0}
            variant="outline"
            colorScheme="blue"
            leftIcon={<TimeIcon />}
            minW="120px"
          >
            Previous
          </Button>

          <Button
            onClick={handleCancel}
            variant="ghost"
            colorScheme="red"
            minW="100px"
          >
            Cancel
          </Button>

          <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
            Step {activeTab + 1} of 8
          </Badge>

          {activeTab < 7 ? (
            <Button
              onClick={handleNextTab}
              colorScheme="blue"
              rightIcon={<CalendarIcon />}
              minW="120px"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              colorScheme={editMode.isEditing ? "green" : "blue"}
              size="lg"
              isLoading={isSubmitting}
              loadingText={editMode.isEditing ? "Updating..." : "Submitting..."}
              minW="150px"
            >
              {editMode.isEditing ? "Update Form" : "Submit Form"}
              
            </Button>
          )}
        </HStack>
      </VStack>
    </Container>
  );
};

export default NeurologyForm;

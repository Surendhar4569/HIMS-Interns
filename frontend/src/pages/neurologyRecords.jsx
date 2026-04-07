// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Container,
//   Heading,
//   Text,
//   FormControl,
//   FormLabel,
//   Select,
//   VStack,
//   HStack,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Card,
//   CardBody,
//   CardHeader,
//   SimpleGrid,
//   Badge,
//   Spinner,
//   Alert,
//   AlertIcon,
//   Button,
//   useToast,
//   Divider,
//   Stat,
//   StatLabel,
//   StatNumber,
//   StatHelpText,
//   StatArrow,
//   Progress,
//   Wrap,
//   WrapItem,
//   Tag,
//   Textarea,
//   TagLabel,
//   Grid,
//   GridItem,
// } from "@chakra-ui/react";
// import { CalendarIcon, TimeIcon, EditIcon, InfoIcon } from "@chakra-ui/icons";
// import { useNavigate } from "react-router-dom";
// import { patientApi, encounterApi } from "../services/neurologyApi";
// import { useNeurology } from "../context/NeurologyContext";
// import { calculateAge, formatDate } from "../services/neurologyHelpers";
// import { useLocation } from "react-router-dom";

// const NeurologyRecords = () => {
//   const toast = useToast();
//   const navigate = useNavigate();
//   const { setEditMode } = useNeurology();

//   const [patients, setPatients] = useState([]);
//   const [selectedPatient, setSelectedPatient] = useState("");
//   const [encounters, setEncounters] = useState([]);
//   const [selectedEncounter, setSelectedEncounter] = useState("");
//   const [encounterData, setEncounterData] = useState(null);
//   const [loadingPatients, setLoadingPatients] = useState(true);
//   const [loadingEncounters, setLoadingEncounters] = useState(false);
//   const [loadingEncounterData, setLoadingEncounterData] = useState(false);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

//   const location = useLocation();

//   useEffect(() => {
//     fetchPatients();
//     if (selectedEncounter) {
//       fetchEncounterDetails(selectedEncounter);
//     }
//   }, [location.state?.refresh]);

//   useEffect(() => {
//     if (selectedPatient) {
//       fetchPatientEncounters(selectedPatient);
//     } else {
//       setEncounters([]);
//       setSelectedEncounter("");
//       setEncounterData(null);
//     }
//   }, [selectedPatient]);

//   useEffect(() => {
//     if (selectedEncounter) {
//       fetchEncounterDetails(selectedEncounter);
//     } else {
//       setEncounterData(null);
//     }
//   }, [selectedEncounter]);

//   const handleEditClick = (encounter) => {
//     setEditMode(encounterData, encounter.encounter_id, encounter.patient_id);
//     navigate("/neurologyForm");
//   };

//   const fetchPatients = async () => {
//     setLoadingPatients(true);
//     try {
//       const response = await patientApi.getAllPatients(1, 100);
//       setPatients(response.data || []);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load patients",
//         status: "error",
//       });
//     } finally {
//       setLoadingPatients(false);
//     }
//   };

//   const fetchPatientEncounters = async (patientId) => {
//     setLoadingEncounters(true);
//     try {
//       const response = await encounterApi.getPatientEncounters(patientId);
//       // Sort encounters by date (newest first) for latest medical history
//       const sorted = (response.data || []).sort(
//         (a, b) => new Date(b.encounter_date) - new Date(a.encounter_date),
//       );
//       setEncounters(sorted);
//       if (sorted.length > 0) {
//         setSelectedEncounter(sorted[0].encounter_id);
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load patient encounters",
//         status: "error",
//       });
//     } finally {
//       setLoadingEncounters(false);
//     }
//   };

//   const fetchEncounterDetails = async (encounterId) => {
//     setLoadingEncounterData(true);
//     try {
//       const response = await encounterApi.getFullEncounterDetails(encounterId);
//       setEncounterData(response.data);
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load encounter details",
//         status: "error",
//       });
//     } finally {
//       setLoadingEncounterData(false);
//     }
//   };
//   // ===================== CURRENT ENCOUNTER PDF =====================
//   const generateCurrentEncounterReport = async () => {
//     if (!encounterData) {
//       toast({
//         title: "No Data",
//         description: "No encounter selected",
//         status: "warning",
//       });
//       return;
//     }

//     setIsGeneratingReport(true);

//     try {
//       const reportDiv = document.createElement("div");
//       reportDiv.style.position = "absolute";
//       reportDiv.style.left = "-9999px";
//       reportDiv.style.width = "800px";
//       reportDiv.style.background = "white";
//       reportDiv.style.padding = "20px";

//       reportDiv.innerHTML = `
//       <h1>Neurology Encounter Report</h1>

//       <h2>Patient Info</h2>
//       <p><b>Name:</b> ${encounterData.encounter?.patient_name}</p>
//       <p><b>Age:</b> ${encounterData.encounter?.age}</p>
//       <p><b>Gender:</b> ${encounterData.encounter?.gender}</p>

//       <h2>Encounter Info</h2>
//       <p><b>Date:</b> ${formatDate(encounterData.encounter?.encounter_date)}</p>
//       <p><b>Visit ID:</b> ${encounterData.encounter?.visit_id}</p>

//       <h2>Symptoms</h2>
//       <p>${encounterData.complaints?.chief_complaint || "N/A"}</p>

//       <h2>Diagnosis</h2>
//       <p>${encounterData.diagnoses?.[0]?.diagnosis_name || "N/A"}</p>

//       <h2>Management</h2>
//       <p>${encounterData.management?.seizure_control || "N/A"}</p>
//     `;

//       document.body.appendChild(reportDiv);

//       const canvas = await html2canvas(reportDiv, { scale: 2 });
//       const imgData = canvas.toDataURL("image/png");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const width = pdf.internal.pageSize.getWidth();
//       const height = (canvas.height * width) / canvas.width;

//       pdf.addImage(imgData, "PNG", 0, 0, width, height);
//       pdf.save(`Encounter_${encounterData.encounter?.visit_id}.pdf`);

//       document.body.removeChild(reportDiv);

//       toast({
//         title: "Success",
//         description: "Current encounter report downloaded",
//         status: "success",
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to generate report",
//         status: "error",
//       });
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   };

//   // ===================== MULTI-ENCOUNTER HTML REPORT =====================
//   const fetchAllEncountersFullData = async (patientId, encountersList) => {
//     const encountersWithFullData = [];
//     for (const encounter of encountersList) {
//       try {
//         const response = await encounterApi.getFullEncounterDetails(
//           encounter.encounter_id,
//         );
//         encountersWithFullData.push(response.data);
//       } catch (error) {
//         console.error(
//           `Error fetching encounter ${encounter.encounter_id}:`,
//           error,
//         );
//       }
//     }
//     return encountersWithFullData;
//   };

//   const generateCompleteReport = async () => {
//     if (!selectedPatient) {
//       toast({
//         title: "No Patient Selected",
//         description: "Please select a patient first",
//         status: "warning",
//         duration: 3000,
//       });
//       return;
//     }

//     if (encounters.length === 0) {
//       toast({
//         title: "No Encounters",
//         description: "This patient has no encounters to report",
//         status: "warning",
//         duration: 3000,
//       });
//       return;
//     }

//     setIsGeneratingReport(true);
//     try {
//       toast({
//         title: "Generating Report",
//         description: "Fetching all encounter data...",
//         status: "info",
//         duration: 2000,
//       });

//       const allEncountersFullData = await fetchAllEncountersFullData(
//         selectedPatient,
//         encounters,
//       );
//       const selectedPatientData = patients.find(
//         (p) => p.patient_id === parseInt(selectedPatient),
//       );
//       if (!selectedPatientData) throw new Error("Patient data not found");

//       // Latest encounter (already sorted by date)
//       const latestEncounter = allEncountersFullData[0] || null;

//       const patientReportData = {
//         patient_id: selectedPatientData.patient_id,
//         patient_name: selectedPatientData.patient_name,
//         dob: selectedPatientData.dob,
//         age: calculateAge(selectedPatientData.dob),
//         gender: selectedPatientData.gender,
//         blood_group: selectedPatientData.blood_group,
//         contact_number: selectedPatientData.contact_number,
//         email: selectedPatientData.email,
//         address: selectedPatientData.address,
//         emergency_name: selectedPatientData.emergency_name,
//         emergency_contact_number: selectedPatientData.emergency_contact_number,
//         past_medical_history:
//           latestEncounter?.encounter?.past_medical_history || "N/A",
//         past_surgical_history:
//           latestEncounter?.encounter?.past_surgical_history || "N/A",
//         family_history: latestEncounter?.encounter?.family_history || "N/A",
//         social_history: latestEncounter?.encounter?.social_history || "N/A",
//         allergies: latestEncounter?.encounter?.allergies || "None",
//         occupation: latestEncounter?.encounter?.occupation || "N/A",
//         physical_activity_level:
//           latestEncounter?.encounter?.physical_activity_level || "N/A",
//         smoking_status: latestEncounter?.encounter?.smoking_status || "N/A",
//         alcohol_use: latestEncounter?.encounter?.alcohol_use || "N/A",
//         height_cm: latestEncounter?.encounter?.height_cm,
//         weight_kg: latestEncounter?.encounter?.weight_kg,
//         bmi: latestEncounter?.encounter?.bmi,
//       };

//       generateNeurologyHtmlReport(patientReportData, allEncountersFullData);

//       toast({
//         title: "Report Generated",
//         description: `${encounters.length} encounter(s) included with complete medical history`,
//         status: "success",
//         duration: 3000,
//       });
//     } catch (error) {
//       console.error("Error generating report:", error);
//       toast({
//         title: "Error",
//         description:
//           "Failed to generate complete report: " +
//           (error.message || "Unknown error"),
//         status: "error",
//         duration: 5000,
//       });
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   };

//   const generateNeurologyHtmlReport = (patientData, allEncounters) => {
//     if (!patientData) return;
//     const reportWindow = window.open("", "_blank");

//     const styles = `
//       <style>
//         body {
//           font-family: 'Segoe UI', Arial, sans-serif;
//           line-height: 1.6;
//           color: #333;
//           margin: 0;
//           padding: 20px;
//           background: #f5f5f5;
//         }
//         .report-container {
//           max-width: 1400px;
//           margin: 0 auto;
//           background: white;
//           box-shadow: 0 0 20px rgba(0,0,0,0.1);
//           border-radius: 8px;
//           overflow: hidden;
//         }
//         .header {
//           text-align: center;
//           padding: 30px;
//           background: linear-gradient(135deg, #1e4a6b 0%, #2c7da0 100%);
//           color: white;
//         }
//         .header h1 { margin: 0; font-size: 32px; }
//         .header h3 { margin: 10px 0 5px; font-size: 20px; }
//         .summary-cards {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 20px;
//           padding: 20px;
//           background: #f8f9fa;
//         }
//         .summary-card {
//           background: white;
//           padding: 15px;
//           border-radius: 8px;
//           text-align: center;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//         }
//         .summary-card .number {
//           font-size: 28px;
//           font-weight: bold;
//           color: #2c7da0;
//         }
//         .section {
//           margin-bottom: 30px;
//           padding: 0 20px;
//           page-break-inside: avoid;
//         }
//         .section-title {
//           background: #2c7da0;
//           color: white;
//           padding: 12px 20px;
//           margin: 0 -20px 20px -20px;
//           font-size: 20px;
//         }
//         .subsection-title {
//           background: #e9ecef;
//           color: #2c7da0;
//           padding: 8px 15px;
//           margin: 20px 0 15px 0;
//           font-size: 16px;
//           border-left: 4px solid #2c7da0;
//         }
//         .encounter-card {
//           background: white;
//           border: 1px solid #dee2e6;
//           border-radius: 8px;
//           margin-bottom: 30px;
//           overflow: hidden;
//           page-break-inside: avoid;
//         }
//         .encounter-header {
//           background: #f8f9fa;
//           padding: 15px;
//           border-bottom: 2px solid #2c7da0;
//           cursor: pointer;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }
//         .encounter-header h4 { margin: 0; color: #1e4a6b; }
//         .encounter-date { color: #666; font-size: 14px; }
//         .encounter-body { padding: 20px; display: none; }
//         .encounter-body.show { display: block; }
//         .info-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 15px;
//           margin-bottom: 20px;
//         }
//         .info-item {
//           background: #f8f9fa;
//           padding: 12px;
//           border-radius: 5px;
//           border-left: 3px solid #2c7da0;
//         }
//         .info-label {
//           font-weight: bold;
//           color: #2c7da0;
//           font-size: 12px;
//           text-transform: uppercase;
//           margin-bottom: 8px;
//         }
//         .info-value { font-size: 14px; line-height: 1.5; }
//         .full-width { grid-column: 1 / -1; }
//         .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
//         .three-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
//         .badge {
//           display: inline-block;
//           padding: 3px 8px;
//           border-radius: 3px;
//           font-size: 12px;
//           font-weight: bold;
//         }
//         .badge-green { background: #d4edda; color: #155724; }
//         .badge-red { background: #f8d7da; color: #721c24; }
//         .badge-yellow { background: #fff3cd; color: #856404; }
//         .badge-blue { background: #d1ecf1; color: #0c5460; }
//         .footer {
//           margin-top: 30px;
//           padding: 20px;
//           border-top: 1px solid #dee2e6;
//           text-align: center;
//           font-size: 12px;
//           background: #f8f9fa;
//         }
//         .toggle-button {
//           background: #2c7da0;
//           color: white;
//           border: none;
//           padding: 5px 10px;
//           border-radius: 5px;
//           cursor: pointer;
//           font-size: 12px;
//         }
//         @media print {
//           body { background: white; }
//           .no-print { display: none; }
//           .encounter-body { display: block !important; }
//           .encounter-card { break-inside: avoid; }
//         }
//       </style>
//     `;

//     const formatDateOnly = (dateStr) => {
//       if (!dateStr) return "N/A";
//       return new Date(dateStr).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });
//     };

//     const formatDateTime = (dateStr) => {
//       if (!dateStr) return "N/A";
//       return new Date(dateStr).toLocaleString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     };

//     const renderYesNo = (val) =>
//       val === "Yes"
//         ? '<span class="badge badge-red">Yes</span>'
//         : '<span class="badge badge-green">No</span>';

//     const renderEncounter = (enc) => {
//       const e = enc.encounter;
//       const comp = enc.complaints || {};
//       const headache = enc.headache || {};
//       const neuro = enc.neuroExam || {};
//       const imaging = enc.imaging || {};
//       const ep = enc.electrophysiology || {};
//       const labs = enc.labs || {};
//       const analysis = enc.analysis || {};
//       const diagnoses = enc.diagnoses || [];
//       const meds = enc.medications || [];
//       const mgmt = enc.management || {};
//       const notes = enc.notes || {};
//       const referrals = enc.referrals || [];

//       return `
//         <div class="encounter-card">
//           <div class="encounter-header" onclick="toggleEncounter(this)">
//             <div>
//               <h4>Encounter #${e.visit_id || e.encounter_id}</h4>
//               <div class="encounter-date">📅 ${formatDateTime(e.encounter_date)}</div>
//             </div>
//             <button class="toggle-button no-print">▼ Expand</button>
//           </div>
//           <div class="encounter-body">
//             <!-- Chief Complaint & Symptoms -->
//             <h3 class="subsection-title">Chief Complaint & Symptoms</h3>
//             <div class="info-grid">
//               <div class="info-item full-width"><div class="info-label">Chief Complaint</div><div class="info-value">${comp.chief_complaint || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Onset</div><div class="info-value">${formatDateOnly(comp.onset_date)}</div></div>
//               <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${comp.duration || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Progression</div><div class="info-value">${comp.progression || "N/A"}</div></div>
//             </div>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Headache Type</div><div class="info-value">${headache.headache_type || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Headache Severity</div><div class="info-value">${headache.headache_severity ? headache.headache_severity + "/10" : "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Weakness</div><div class="info-value">${renderYesNo(comp.weakness_present)} ${comp.weakness_side ? `(${comp.weakness_side}, ${comp.weakness_pattern})` : ""}</div></div>
//               <div class="info-item"><div class="info-label">Seizures</div><div class="info-value">${renderYesNo(comp.seizures_present)} ${comp.seizure_type ? `(${comp.seizure_type}, ${comp.seizure_frequency})` : ""}</div></div>
//               <div class="info-item"><div class="info-label">Numbness</div><div class="info-value">${comp.numbness || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Paresthesia</div><div class="info-value">${comp.paresthesia || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Speech/Vision</div><div class="info-value">${comp.speech_changes || "None"} / ${comp.vision_changes || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Cognitive/Balance</div><div class="info-value">${comp.cognitive_changes || "None"} / ${comp.balance_issues || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Overall Severity</div><div class="info-value">${comp.overall_severity || "N/A"}/10</div></div>
//             </div>

//             <!-- Neurological Exam -->
//             <h3 class="subsection-title">Neurological Examination</h3>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Mental Status</div><div class="info-value">Orientation: ${neuro.mental_status_orientation || "Normal"}, Memory: ${neuro.memory_recall || "Normal"}</div></div>
//               <div class="info-item"><div class="info-label">Cranial Nerves</div><div class="info-value">${neuro.cranial_nerve_findings || "Normal"}</div></div>
//               <div class="info-item"><div class="info-label">Motor</div><div class="info-value">Tone: ${neuro.motor_tone || "Normal"}, Power: ${neuro.motor_power || "Normal"}</div></div>
//               <div class="info-item"><div class="info-label">Reflexes</div><div class="info-value">Biceps: ${neuro.reflexes_biceps || "2+"}, Knee: ${neuro.reflexes_knee || "2+"}</div></div>
//               <div class="info-item"><div class="info-label">Sensory</div><div class="info-value">Pain: ${neuro.sensory_pain || "Intact"}, Vibration: ${neuro.sensory_vibration || "Intact"}</div></div>
//               <div class="info-item"><div class="info-label">Gait & Coordination</div><div class="info-value">Gait: ${neuro.gait || "Normal"}, Romberg: ${neuro.romberg_test || "Negative"}</div></div>
//             </div>

//             <!-- Investigations -->
//             <h3 class="subsection-title">Investigations</h3>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Imaging</div><div class="info-value">CT: ${imaging.ct_brain || "Not done"}, MRI: ${imaging.mri_brain || "Not done"}</div></div>
//               <div class="info-item"><div class="info-label">Electrophysiology</div><div class="info-value">EEG: ${ep.eeg_ordered || "Not done"}, NCS: ${ep.ncs_ordered || "Not done"}, EMG: ${ep.emg_ordered || "Not done"}</div></div>
//               <div class="info-item"><div class="info-label">Labs</div><div class="info-value">CBC: ${labs.cbc_results || "Not done"}, Thyroid: ${labs.thyroid_results || "Not done"}</div></div>
//             </div>

//             <!-- Analysis -->
//             <h3 class="subsection-title">Analysis & Findings</h3>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">MRI Findings</div><div class="info-value">${analysis.mri_findings || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">EEG Results</div><div class="info-value">${analysis.eeg_results || "N/A"}</div></div>
//               <div class="info-item full-width"><div class="info-label">Clinical Correlation</div><div class="info-value">${analysis.clinical_correlation || "N/A"}</div></div>
//             </div>

//             <!-- Diagnoses -->
//             <h3 class="subsection-title">Diagnoses</h3>
//             ${
//               diagnoses.length
//                 ? diagnoses
//                     .map(
//                       (dx) => `
//               <div class="info-item" style="margin-bottom:10px">
//                 <div class="info-label">${dx.diagnosis_type?.toUpperCase() || "Diagnosis"}</div>
//                 <div class="info-value"><strong>${dx.diagnosis_name}</strong> ${dx.icd10_code ? `(ICD-10: ${dx.icd10_code})` : ""}<br/>
//                 Severity: ${dx.severity || "N/A"}, Stage: ${dx.stage || "N/A"}<br/>
//                 Comorbidities: ${dx.comorbidities || "None"}</div>
//               </div>
//             `,
//                     )
//                     .join("")
//                 : '<div class="info-item"><div class="info-value">No diagnoses recorded</div></div>'
//             }

//             <!-- Management & Medications -->
//             <h3 class="subsection-title">Management Plan</h3>
//             <div class="info-grid">
//               <div class="info-item full-width"><div class="info-label">Medications</div><div class="info-value">${meds.length ? meds.map((m) => `${m.medication_name || m.name} ${m.dose} - ${m.frequency} (${m.duration})`).join("<br/>") : "None"}</div></div>
//               <div class="info-item"><div class="info-label">Seizure Control</div><div class="info-value">${mgmt.seizure_control || "Not specified"}</div></div>
//               <div class="info-item"><div class="info-label">Surgical Plan</div><div class="info-value">${mgmt.surgical_plan || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Follow-up</div><div class="info-value">${mgmt.follow_up_timing || "Not specified"}</div></div>
//               <div class="info-item full-width"><div class="info-label">Warning Signs</div><div class="info-value">${mgmt.warning_signs || "None specified"}</div></div>
//             </div>

//             <!-- Notes & Referrals -->
//             <h3 class="subsection-title">Notes & Referrals</h3>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Clinical Observations</div><div class="info-value">${notes.clinical_observations || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Education Provided</div><div class="info-value">${notes.education_provided || "None"}</div></div>
//               <div class="info-item full-width"><div class="info-label">Referrals</div><div class="info-value">${referrals.length ? referrals.map((r) => r.referral_name || r.name || r).join(", ") : "None"}</div></div>
//             </div>
//           </div>
//         </div>
//       `;
//     };

//     // Calculate summary stats
//     const totalEncounters = allEncounters.length;
//     const primaryDiagnoses = [];
//     allEncounters.forEach((enc) => {
//       if (enc.diagnoses) {
//         const primary = enc.diagnoses.find(
//           (d) => d.diagnosis_type === "primary",
//         );
//         if (primary) primaryDiagnoses.push(primary.diagnosis_name);
//       }
//     });
//     const mostCommonDx = primaryDiagnoses.length
//       ? Object.entries(
//           primaryDiagnoses.reduce((acc, dx) => {
//             acc[dx] = (acc[dx] || 0) + 1;
//             return acc;
//           }, {}),
//         ).sort((a, b) => b[1] - a[1])[0][0]
//       : "N/A";

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Complete Neurology Report - ${patientData.patient_name}</title>
//         ${styles}
//         <script>
//           function toggleEncounter(element) {
//             const body = element.nextElementSibling;
//             const btn = element.querySelector('.toggle-button');
//             body.classList.toggle('show');
//             btn.textContent = body.classList.contains('show') ? '▲ Collapse' : '▼ Expand';
//           }
//           function expandAll() {
//             document.querySelectorAll('.encounter-body').forEach(b => b.classList.add('show'));
//             document.querySelectorAll('.toggle-button').forEach(b => b.textContent = '▲ Collapse');
//           }
//           function collapseAll() {
//             document.querySelectorAll('.encounter-body').forEach(b => b.classList.remove('show'));
//             document.querySelectorAll('.toggle-button').forEach(b => b.textContent = '▼ Expand');
//           }
//         </script>
//       </head>
//       <body>
//         <div class="report-container">
//           <div class="header">
//             <h1>Complete Neurology Patient Report</h1>
//             <h3>${patientData.patient_name}</h3>
//             <p>Patient ID: ${patientData.patient_id} | DOB: ${formatDateOnly(patientData.dob)} | Age: ${patientData.age} yrs | Gender: ${patientData.gender}</p>
//             <p>Contact: ${patientData.contact_number || "N/A"} | Email: ${patientData.email || "N/A"}</p>
//           </div>

//           <div class="summary-cards">
//             <div class="summary-card"><div class="number">${totalEncounters}</div><div class="label">Total Encounters</div></div>
//             <div class="summary-card"><div class="number">${mostCommonDx !== "N/A" ? "✓" : "N/A"}</div><div class="label">Most Common Diagnosis</div><div style="font-size:12px">${mostCommonDx}</div></div>
//             <div class="summary-card"><div class="number">${allEncounters.filter((e) => e.management?.surgical_plan && e.management.surgical_plan !== "None").length}</div><div class="label">Surgical Interventions</div></div>
//           </div>

//           <!-- Patient Medical History -->
//           <div class="section">
//             <h2 class="section-title">Patient Medical History</h2>
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Blood Group</div><div class="info-value">${patientData.blood_group || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Allergies</div><div class="info-value">${patientData.allergies || "None"}</div></div>
//               <div class="info-item"><div class="info-label">Occupation</div><div class="info-value">${patientData.occupation || "N/A"}</div></div>
//               <div class="info-item"><div class="info-label">Smoking/Alcohol</div><div class="info-value">${patientData.smoking_status || "Never"} / ${patientData.alcohol_use || "None"}</div></div>
//             </div>
//             ${patientData.past_medical_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Past Medical History</div><div class="info-value">${patientData.past_medical_history}</div></div>` : ""}
//             ${patientData.past_surgical_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Past Surgical History</div><div class="info-value">${patientData.past_surgical_history}</div></div>` : ""}
//             ${patientData.family_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Family History</div><div class="info-value">${patientData.family_history}</div></div>` : ""}
//             ${patientData.social_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Social History</div><div class="info-value">${patientData.social_history}</div></div>` : ""}
//             <div class="info-grid">
//               <div class="info-item"><div class="info-label">Emergency Contact</div><div class="info-value">${patientData.emergency_name || "Not provided"} (${patientData.emergency_contact_number || ""})</div></div>
//               <div class="info-item"><div class="info-label">Physical Metrics</div><div class="info-value">Height: ${patientData.height_cm || "N/A"} cm, Weight: ${patientData.weight_kg || "N/A"} kg, BMI: ${patientData.bmi || "N/A"}</div></div>
//             </div>
//           </div>

//           <!-- All Encounters -->
//           <div class="section">
//             <h2 class="section-title">All Medical Encounters (${totalEncounters})</h2>
//             <div class="no-print" style="text-align:right; margin-bottom:15px;">
//               <button onclick="expandAll()" style="padding:8px 16px; margin-right:10px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Expand All</button>
//               <button onclick="collapseAll()" style="padding:8px 16px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">Collapse All</button>
//             </div>
//             ${allEncounters.map((enc) => renderEncounter(enc)).join("")}
//             ${totalEncounters === 0 ? '<div class="info-item"><div class="info-value">No encounters found.</div></div>' : ""}
//           </div>

//           <div class="footer">
//             <p>Report generated on ${new Date().toLocaleString()}</p>
//             <p>This report includes all neurology encounters. Data is for medical purposes only.</p>
//           </div>
//         </div>
//         <div class="no-print" style="text-align:center; margin-top:20px; padding:20px;">
//           <button onclick="window.print()" style="padding:12px 24px; background:#2c7da0; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">🖨️ Print / Save as PDF</button>
//           <button onclick="window.close()" style="padding:12px 24px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">✖ Close</button>
//         </div>
//       </body>
//       </html>
//     `;

//     reportWindow.document.write(html);
//     reportWindow.document.close();
//   };
//   // ================================================================

//   if (loadingPatients) {
//     return (
//       <Container maxW="container.xl" py={10}>
//         <VStack spacing={4} justify="center" minH="60vh">
//           <Spinner size="xl" color="blue.500" thickness="4px" />
//           <Text>Loading neurology database...</Text>
//         </VStack>
//       </Container>
//     );
//   }

//   return (
//     <Container maxW="container.xl" py={8}>
//       <VStack spacing={8} align="stretch">
//         <Box textAlign="left">
//           <Heading color="blue.700" mb={2}>
//             Neurology Patient Records
//           </Heading>
//           <Text color="gray.600">
//             Comprehensive patient history and clinical assessment data
//           </Text>
//         </Box>

//         {/* Selection Card */}
//         <Card variant="outline" boxShadow="sm">
//           <CardBody>
//             <VStack spacing={4} align="stretch">
//               <FormControl>
//                 <FormLabel fontWeight="bold" fontSize="lg">
//                   Select Patient
//                 </FormLabel>
//                 <Select
//                   placeholder="Choose a patient"
//                   value={selectedPatient}
//                   onChange={(e) => setSelectedPatient(e.target.value)}
//                   size="lg"
//                   bg="white"
//                 >
//                   {patients.map((p) => (
//                     <option key={p.patient_id} value={p.patient_id}>
//                       {p.patient_name} - {p.patient_id} ({calculateAge(p.dob)}{" "}
//                       yrs)
//                     </option>
//                   ))}
//                 </Select>
//               </FormControl>

//               {selectedPatient && (
//                 <FormControl>
//                   <FormLabel fontWeight="bold" fontSize="lg">
//                     Select Encounter{" "}
//                     {encounters.length > 0 && `(${encounters.length} found)`}
//                   </FormLabel>
//                   {loadingEncounters ? (
//                     <HStack spacing={2}>
//                       <Spinner size="sm" />
//                       <Text>Loading history...</Text>
//                     </HStack>
//                   ) : (
//                     <Select
//                       placeholder="Choose an encounter date"
//                       value={selectedEncounter}
//                       onChange={(e) => setSelectedEncounter(e.target.value)}
//                       size="lg"
//                       bg="white"
//                     >
//                       {encounters.map((e) => (
//                         <option key={e.encounter_id} value={e.encounter_id}>
//                           {formatDate(e.encounter_date)} - Visit ID:{" "}
//                           {e.visit_id}
//                         </option>
//                       ))}
//                     </Select>
//                   )}
//                 </FormControl>
//               )}
//             </VStack>
//           </CardBody>
//         </Card>

//         {/* Header Info Bar */}
//         {selectedEncounter && encounterData && !loadingEncounterData && (
//           <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
//             <CardBody py={3}>
//               <HStack justify="space-between" wrap="wrap" spacing={4}>
//                 <HStack spacing={10}>
//                   <HStack spacing={3}>
//                     <CalendarIcon mb={1.5} color="blue.500" />
//                     <VStack align="start" spacing={0}>
//                       <Text fontSize="xs" color="blue.600" fontWeight="bold">
//                         ENCOUNTER DATE
//                       </Text>
//                       <Text fontWeight="bold">
//                         {formatDate(encounterData.encounter?.encounter_date)}
//                       </Text>
//                     </VStack>
//                   </HStack>
//                   <HStack spacing={3}>
//                     <TimeIcon mb={1.5} color="blue.500" />
//                     <VStack align="start" spacing={0}>
//                       <Text fontSize="xs" color="blue.600" fontWeight="bold">
//                         VISIT ID
//                       </Text>
//                       <Text fontWeight="bold">
//                         {encounterData.encounter?.visit_id || "N/A"}
//                       </Text>
//                     </VStack>
//                   </HStack>
//                 </HStack>
//                 <HStack spacing={3}>
//                   <Button
//                     leftIcon={<EditIcon />}
//                     colorScheme="blue"
//                     onClick={() => handleEditClick(encounterData.encounter)}
//                   >
//                     Edit This Encounter
//                   </Button>
//                   <Button
//                     leftIcon={<InfoIcon />}
//                     colorScheme="green"
//                     onClick={generateCompleteReport}
//                     isLoading={isGeneratingReport}
//                     loadingText="Generating..."
//                   >
//                     Generate Complete Report
//                   </Button>
//                 </HStack>
//               </HStack>
//             </CardBody>
//           </Card>
//         )}

//         {/* Loading Encounter Data */}
//         {loadingEncounterData && (
//           <Alert status="info" borderRadius="lg">
//             <Spinner size="sm" mr={3} />
//             Loading encounter details...
//           </Alert>
//         )}

//         {/* Main Content Tabs */}
//         {encounterData && !loadingEncounterData && (
//           <Card>
//             <CardBody p={0}>
//               <Tabs isLazy colorScheme="blue" variant="enclosed">
//                 <TabList overflowX="auto" px={4} pt={4} bg="gray.50">
//                   <Tab fontWeight="medium">Patient Info</Tab>
//                   <Tab fontWeight="medium">Symptoms & Complaints</Tab>
//                   <Tab fontWeight="medium">Neurological Exam</Tab>
//                   <Tab fontWeight="medium">Investigations</Tab>
//                   <Tab fontWeight="medium">Analysis</Tab>
//                   <Tab fontWeight="medium">Diagnosis</Tab>
//                   <Tab fontWeight="medium">Management</Tab>
//                   <Tab fontWeight="medium">Notes & Referrals</Tab>
//                 </TabList>

//                 <TabPanels>
//                   {/* TAB 1: Patient Info - Demographics & History */}
//                   <TabPanel py={6}>
//                     <VStack spacing={6} align="stretch">
//                       {/* Patient Demographics */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Patient Demographics</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
//                             <Stat>
//                               <StatLabel>Patient Name</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.patient_name}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Patient ID</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.patient_id}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>MRN</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.mrn || "N/A"}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Date of Birth</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {formatDate(encounterData.encounter?.dob)}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Age</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.age ||
//                                   calculateAge(
//                                     encounterData.encounter?.dob,
//                                   )}{" "}
//                                 yrs
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Gender</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.gender}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Contact</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.contact_number ||
//                                   "N/A"}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Email</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.email || "N/A"}
//                               </StatNumber>
//                             </Stat>
//                           </SimpleGrid>
//                           {encounterData.encounter?.address && (
//                             <Text mt={2} fontSize="sm">
//                               <strong>Address:</strong>{" "}
//                               {encounterData.encounter.address}
//                             </Text>
//                           )}
//                         </CardBody>
//                       </Card>

//                       {/* Physical Metrics */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Physical Metrics</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
//                             <Stat>
//                               <StatLabel>Height</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.height_cm
//                                   ? `${encounterData.encounter.height_cm} cm`
//                                   : "N/A"}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>Weight</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.weight_kg
//                                   ? `${encounterData.encounter.weight_kg} kg`
//                                   : "N/A"}
//                               </StatNumber>
//                             </Stat>
//                             <Stat>
//                               <StatLabel>BMI</StatLabel>
//                               <StatNumber fontSize="md">
//                                 {encounterData.encounter?.bmi || "N/A"}
//                               </StatNumber>
//                               {encounterData.encounter?.bmi && (
//                                 <StatHelpText>
//                                   <StatArrow
//                                     type={
//                                       encounterData.encounter.bmi > 25
//                                         ? "increase"
//                                         : encounterData.encounter.bmi < 18.5
//                                           ? "decrease"
//                                           : "increase"
//                                     }
//                                   />
//                                   {encounterData.encounter.bmi > 30
//                                     ? "Obese"
//                                     : encounterData.encounter.bmi > 25
//                                       ? "Overweight"
//                                       : encounterData.encounter.bmi < 18.5
//                                         ? "Underweight"
//                                         : "Normal"}
//                                 </StatHelpText>
//                               )}
//                             </Stat>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>

//                       {/* Medical History */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Medical History</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">
//                                 Past Medical History:
//                               </Text>
//                               <Text>
//                                 {encounterData.encounter
//                                   ?.past_medical_history || "None"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">
//                                 Past Surgical History:
//                               </Text>
//                               <Text>
//                                 {encounterData.encounter
//                                   ?.past_surgical_history || "None"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Family History:</Text>
//                               <Text>
//                                 {encounterData.encounter?.family_history ||
//                                   "None"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Allergies:</Text>
//                               <Text color="red.600">
//                                 {encounterData.encounter?.allergies || "None"}
//                               </Text>
//                             </Box>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>

//                       {/* Social History - with lifestyle fields */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">
//                             Social History & Lifestyle
//                           </Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">Occupation:</Text>
//                               <Text>
//                                 {encounterData.encounter?.occupation || "N/A"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Smoking Status:</Text>
//                               <Badge
//                                 colorScheme={
//                                   encounterData.encounter?.smoking_status ===
//                                   "Current"
//                                     ? "red"
//                                     : encounterData.encounter
//                                           ?.smoking_status === "Former"
//                                       ? "yellow"
//                                       : "green"
//                                 }
//                               >
//                                 {encounterData.encounter?.smoking_status ||
//                                   "Never"}
//                               </Badge>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Alcohol Use:</Text>
//                               <Text>
//                                 {encounterData.encounter?.alcohol_use || "None"}
//                               </Text>
//                             </Box>
//                             <Box gridColumn="span 2">
//                               <Text fontWeight="bold">Social History:</Text>
//                               <Text>
//                                 {encounterData.encounter?.social_history ||
//                                   "None"}
//                               </Text>
//                             </Box>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>
//                     </VStack>
//                   </TabPanel>

//                   {/* TAB 2: Symptoms & Complaints - with seizures and overall severity */}
//                   <TabPanel py={6}>
//                     {encounterData.complaints ? (
//                       <VStack spacing={4} align="stretch">
//                         {/* Chief Complaint */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Chief Complaint</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <Text fontSize="md" fontWeight="medium">
//                               {encounterData.complaints.chief_complaint}
//                             </Text>
//                             <SimpleGrid columns={3} mt={3} spacing={2}>
//                               <Badge colorScheme="blue" p={2}>
//                                 Onset:{" "}
//                                 {formatDate(
//                                   encounterData.complaints.onset_date,
//                                 ) || "N/A"}
//                               </Badge>
//                               <Badge colorScheme="green" p={2}>
//                                 Duration:{" "}
//                                 {encounterData.complaints.duration || "N/A"}
//                               </Badge>
//                               <Badge colorScheme="purple" p={2}>
//                                 Progression:{" "}
//                                 {encounterData.complaints.progression || "N/A"}
//                               </Badge>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Headache Details */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Headache Details</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 2, md: 3 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Type:</Text>
//                                 <Text>
//                                   {encounterData.headache?.headache_type ||
//                                     "N/A"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Location:</Text>
//                                 <Text>
//                                   {encounterData.headache?.headache_location ||
//                                     "N/A"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Severity:</Text>
//                                 <Text>
//                                   {encounterData.headache?.headache_severity
//                                     ? `${encounterData.headache.headache_severity}/10`
//                                     : "N/A"}
//                                 </Text>
//                                 {encounterData.headache?.headache_severity && (
//                                   <Progress
//                                     value={
//                                       encounterData.headache.headache_severity *
//                                       10
//                                     }
//                                     size="xs"
//                                     mt={1}
//                                     colorScheme={
//                                       encounterData.headache
//                                         .headache_severity <= 3
//                                         ? "green"
//                                         : encounterData.headache
//                                               .headache_severity <= 6
//                                           ? "yellow"
//                                           : "red"
//                                     }
//                                   />
//                                 )}
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Duration:</Text>
//                                 <Text>
//                                   {encounterData.headache?.headache_duration ||
//                                     "N/A"}
//                                 </Text>
//                               </Box>
//                               <Box gridColumn="span 2">
//                                 <Text fontWeight="bold">Triggers:</Text>
//                                 <Text>
//                                   {encounterData.headache?.headache_triggers ||
//                                     "N/A"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Seizure Details - Separate Card */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <HStack>
//                               <Heading size="sm" color="black.700">
//                                 Seizure Details
//                               </Heading>
//                             </HStack>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Seizures Present:</Text>
//                                 <Badge
//                                   colorScheme={
//                                     encounterData.complaints
//                                       .seizures_present === "Yes"
//                                       ? "red"
//                                       : "green"
//                                   }
//                                 >
//                                   {encounterData.complaints.seizures_present ||
//                                     "No"}
//                                 </Badge>
//                               </Box>
//                               {encounterData.complaints.seizures_present ===
//                                 "Yes" && (
//                                 <>
//                                   <Box>
//                                     <Text fontWeight="bold">Seizure Type:</Text>
//                                     <Text>
//                                       {encounterData.complaints.seizure_type ||
//                                         "N/A"}
//                                     </Text>
//                                   </Box>
//                                   <Box>
//                                     <Text fontWeight="bold">
//                                       Seizure Frequency:
//                                     </Text>
//                                     <Text>
//                                       {encounterData.complaints
//                                         .seizure_frequency || "N/A"}
//                                     </Text>
//                                   </Box>
//                                   <Box>
//                                     <Text fontWeight="bold">Last Seizure:</Text>
//                                     <Text>
//                                       {formatDate(
//                                         encounterData.complaints
//                                           .last_seizure_date,
//                                       ) || "N/A"}
//                                     </Text>
//                                   </Box>
//                                 </>
//                               )}
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Weakness Details */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm" color="black.700">
//                               Weakness Details
//                             </Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Weakness Present:</Text>
//                                 <Badge
//                                   colorScheme={
//                                     encounterData.complaints
//                                       .weakness_present === "Yes"
//                                       ? "orange"
//                                       : "green"
//                                   }
//                                 >
//                                   {encounterData.complaints.weakness_present ||
//                                     "No"}
//                                 </Badge>
//                               </Box>
//                               {encounterData.complaints.weakness_present ===
//                                 "Yes" && (
//                                 <>
//                                   <Box>
//                                     <Text fontWeight="bold">
//                                       Weakness Side:
//                                     </Text>
//                                     <Text>
//                                       {encounterData.complaints.weakness_side ||
//                                         "N/A"}
//                                     </Text>
//                                   </Box>
//                                   <Box>
//                                     <Text fontWeight="bold">
//                                       Weakness Pattern:
//                                     </Text>
//                                     <Text>
//                                       {encounterData.complaints
//                                         .weakness_pattern || "N/A"}
//                                     </Text>
//                                   </Box>
//                                 </>
//                               )}
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Sensory Symptoms */}
//                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                           <Card variant="outline">
//                             <CardHeader bg="teal.50" py={3}>
//                               <Heading size="sm">Sensory Symptoms</Heading>
//                             </CardHeader>
//                             <CardBody>
//                               <Text>
//                                 <strong>Numbness:</strong>{" "}
//                                 {encounterData.complaints.numbness || "None"}
//                               </Text>
//                               <Text mt={2}>
//                                 <strong>Paresthesia:</strong>{" "}
//                                 {encounterData.complaints.paresthesia || "None"}
//                               </Text>
//                             </CardBody>
//                           </Card>

//                           <Card variant="outline">
//                             <CardHeader bg="teal.50" py={3}>
//                               <Heading size="sm">Speech & Vision</Heading>
//                             </CardHeader>
//                             <CardBody>
//                               <Text>
//                                 <strong>Speech Changes:</strong>{" "}
//                                 {encounterData.complaints.speech_changes ||
//                                   "None"}
//                               </Text>
//                               <Text mt={2}>
//                                 <strong>Vision Changes:</strong>{" "}
//                                 {encounterData.complaints.vision_changes ||
//                                   "None"}
//                               </Text>
//                             </CardBody>
//                           </Card>
//                         </SimpleGrid>

//                         {/* Cognitive & Balance */}
//                         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                           <Card variant="outline">
//                             <CardHeader bg="gray.50" py={3}>
//                               <Heading size="sm">Cognitive Changes</Heading>
//                             </CardHeader>
//                             <CardBody>
//                               <Text>
//                                 {encounterData.complaints.cognitive_changes ||
//                                   "None"}
//                               </Text>
//                             </CardBody>
//                           </Card>
//                           <Card variant="outline">
//                             <CardHeader bg="gray.50" py={3}>
//                               <Heading size="sm">Balance Issues</Heading>
//                             </CardHeader>
//                             <CardBody>
//                               <Text>
//                                 {encounterData.complaints.balance_issues ||
//                                   "None"}
//                               </Text>
//                               <Text mt={2}>
//                                 <strong>Dizziness:</strong>{" "}
//                                 {encounterData.complaints.dizziness || "None"}
//                               </Text>
//                             </CardBody>
//                           </Card>
//                         </SimpleGrid>

//                         {/* Overall Severity - Extra Card */}
//                         <Card variant="outline" borderColor="red.200">
//                           <CardHeader bg="red.50" py={3}>
//                             <Heading size="sm" color="red.700">
//                               Overall Severity Assessment
//                             </Heading>
//                           </CardHeader>
//                           <CardBody>
//                             {(encounterData.complaints?.overall_severity ??
//                               null) !== null ? (
//                               <VStack align="stretch" spacing={2}>
//                                 <HStack justify="space-between">
//                                   <Text fontWeight="bold">Severity Level:</Text>
//                                   <Text fontSize="lg" fontWeight="bold">
//                                     {encounterData.complaints.overall_severity}
//                                     /10
//                                   </Text>
//                                 </HStack>
//                                 <Progress
//                                   value={
//                                     encounterData.complaints.overall_severity *
//                                     10
//                                   }
//                                   size="lg"
//                                   colorScheme={
//                                     encounterData.complaints.overall_severity <=
//                                     3
//                                       ? "green"
//                                       : encounterData.complaints
//                                             .overall_severity <= 6
//                                         ? "yellow"
//                                         : "red"
//                                   }
//                                   borderRadius="full"
//                                 />
//                                 <Text fontSize="sm" color="gray.600">
//                                   {encounterData.complaints.overall_severity <=
//                                   3
//                                     ? "Mild - Minimal impact on daily activities"
//                                     : encounterData.complaints
//                                           .overall_severity <= 6
//                                       ? "Moderate - Significant impact on daily activities"
//                                       : "Severe - Major impact, requires immediate attention"}
//                                 </Text>
//                               </VStack>
//                             ) : (
//                               <Text color="gray.500">
//                                 No severity assessment recorded
//                               </Text>
//                             )}
//                           </CardBody>
//                         </Card>
//                       </VStack>
//                     ) : (
//                       <Card>
//                         <CardBody>
//                           <Text>No complaint data available</Text>
//                         </CardBody>
//                       </Card>
//                     )}
//                   </TabPanel>

//                   {/* TAB 3: Neurological Exam - ALL Fields */}
//                   <TabPanel py={6}>
//                     {encounterData.neuroExam ? (
//                       <VStack spacing={4} align="stretch">
//                         {/* Mental Status */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Mental Status</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Orientation:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam
//                                     .mental_status_orientation || "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">
//                                   Memory Registration:
//                                 </Text>
//                                 <Text>
//                                   {encounterData.neuroExam
//                                     .memory_registration || "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Memory Recall:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.memory_recall ||
//                                     "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box gridColumn="span 2">
//                                 <Text fontWeight="bold">Cognition:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.cognition ||
//                                     "Normal"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Cranial Nerves */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Cranial Nerves</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <Text>
//                               {encounterData.neuroExam.cranial_nerve_findings ||
//                                 "Normal"}
//                             </Text>
//                           </CardBody>
//                         </Card>

//                         {/* Motor System */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Motor System</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 3 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Muscle Tone:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.motor_tone ||
//                                     "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Motor Power:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.motor_power ||
//                                     "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Muscle Bulk:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.muscle_bulk ||
//                                     "Normal"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Reflexes */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Reflexes</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 2, md: 4 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Biceps:</Text>
//                                 <Badge>
//                                   {encounterData.neuroExam.reflexes_biceps ||
//                                     "2+"}
//                                 </Badge>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Triceps:</Text>
//                                 <Badge>
//                                   {encounterData.neuroExam.reflexes_triceps ||
//                                     "2+"}
//                                 </Badge>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Knee:</Text>
//                                 <Badge>
//                                   {encounterData.neuroExam.reflexes_knee ||
//                                     "2+"}
//                                 </Badge>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Ankle:</Text>
//                                 <Badge>
//                                   {encounterData.neuroExam.reflexes_ankle ||
//                                     "2+"}
//                                 </Badge>
//                               </Box>
//                             </SimpleGrid>
//                             <Text mt={3}>
//                               <strong>Plantar Response:</strong>{" "}
//                               {encounterData.neuroExam.plantar_response ||
//                                 "Normal"}
//                             </Text>
//                           </CardBody>
//                         </Card>

//                         {/* Sensory System */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Sensory System</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Pain:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.sensory_pain ||
//                                     "Intact"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Temperature:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam
//                                     .sensory_temperature || "Intact"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Vibration:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.sensory_vibration ||
//                                     "Intact"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Proprioception:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam
//                                     .sensory_proprioception || "Intact"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>

//                         {/* Coordination & Gait */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Coordination & Gait</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Gait:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.gait || "Normal"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Romberg Test:</Text>
//                                 <Text>
//                                   {encounterData.neuroExam.romberg_test ||
//                                     "Negative"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                           </CardBody>
//                         </Card>
//                       </VStack>
//                     ) : (
//                       <Card>
//                         <CardBody>
//                           <Text>No neurological exam data available</Text>
//                         </CardBody>
//                       </Card>
//                     )}
//                   </TabPanel>

//                   {/* TAB 4: Investigations */}
//                   <TabPanel py={6}>
//                     <VStack spacing={4} align="stretch">
//                       {/* Imaging */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Imaging Studies</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">CT Brain:</Text>
//                               <Text>
//                                 {encounterData.imaging?.ct_brain || "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">MRI Brain:</Text>
//                               <Text>
//                                 {encounterData.imaging?.mri_brain || "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">MR Angiography:</Text>
//                               <Text>
//                                 {encounterData.imaging?.mr_angiography ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">MRI Spine:</Text>
//                               <Text>
//                                 {encounterData.imaging?.mri_spine || "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Lumbar Puncture:</Text>
//                               <Text>
//                                 {encounterData.imaging?.lumbar_puncture ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>

//                       {/* Electrophysiology */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Electrophysiology</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">EEG:</Text>
//                               <Text>
//                                 {encounterData.electrophysiology?.eeg_ordered ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">NCS:</Text>
//                               <Text>
//                                 {encounterData.electrophysiology?.ncs_ordered ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">EMG:</Text>
//                               <Text>
//                                 {encounterData.electrophysiology?.emg_ordered ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>

//                       {/* Laboratory Tests */}
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Laboratory Tests</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">CBC Results:</Text>
//                               <Text>
//                                 {encounterData.labs?.cbc_results || "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Thyroid Results:</Text>
//                               <Text>
//                                 {encounterData.labs?.thyroid_results ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Autoimmune Results:</Text>
//                               <Text>
//                                 {encounterData.labs?.autoimmune_results ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                             <Box>
//                               <Text fontWeight="bold">Metabolic Panel:</Text>
//                               <Text>
//                                 {encounterData.labs?.metabolic_panel ||
//                                   "Not done"}
//                               </Text>
//                             </Box>
//                           </SimpleGrid>
//                         </CardBody>
//                       </Card>
//                     </VStack>
//                   </TabPanel>

//                   {/* TAB 5: Analysis - Separate Tab with all fields */}
//                   <TabPanel py={6}>
//                     <VStack spacing={4} align="stretch">
//                       <Card variant="outline">
//                         <CardHeader bg="blue.50" py={3}>
//                           <Heading size="sm">Analysis & Findings</Heading>
//                         </CardHeader>
//                         <CardBody>
//                           <VStack align="stretch" spacing={4}>
//                             <Box>
//                               <Text fontWeight="bold">MRI Findings:</Text>
//                               <Textarea
//                                 isReadOnly
//                                 value={
//                                   encounterData.analysis?.mri_findings ||
//                                   "No MRI findings recorded"
//                                 }
//                                 bg="gray.50"
//                                 rows={3}
//                               />
//                             </Box>
//                             <Divider />
//                             <Box>
//                               <Text fontWeight="bold">EEG Results:</Text>
//                               <Textarea
//                                 isReadOnly
//                                 value={
//                                   encounterData.analysis?.eeg_results ||
//                                   "No EEG results recorded"
//                                 }
//                                 bg="gray.50"
//                                 rows={3}
//                               />
//                             </Box>
//                             <Divider />
//                             <Box>
//                               <Text fontWeight="bold">
//                                 Clinical Correlation:
//                               </Text>
//                               <Textarea
//                                 isReadOnly
//                                 value={
//                                   encounterData.analysis
//                                     ?.clinical_correlation ||
//                                   "No clinical correlation recorded"
//                                 }
//                                 bg="gray.50"
//                                 rows={3}
//                               />
//                             </Box>
//                           </VStack>
//                         </CardBody>
//                       </Card>
//                     </VStack>
//                   </TabPanel>

//                   {/* TAB 6: Diagnosis */}
//                   <TabPanel py={6}>
//                     {encounterData.diagnoses &&
//                     encounterData.diagnoses.length > 0 ? (
//                       <VStack spacing={4} align="stretch">
//                         {encounterData.diagnoses.map((dx, idx) => (
//                           <Card
//                             key={idx}
//                             variant="outline"
//                             borderLeft="8px solid"
//                             borderLeftColor={
//                               dx.diagnosis_type === "primary"
//                                 ? "red.400"
//                                 : "blue.400"
//                             }
//                           >
//                             <CardHeader
//                               bg={
//                                 dx.diagnosis_type === "primary"
//                                   ? "red.50"
//                                   : "blue.50"
//                               }
//                               py={3}
//                             >
//                               <HStack justify="space-between" wrap="wrap">
//                                 <Heading
//                                   size="sm"
//                                   color={
//                                     dx.diagnosis_type === "primary"
//                                       ? "red.700"
//                                       : "blue.700"
//                                   }
//                                 >
//                                   {dx.diagnosis_type?.toUpperCase() ||
//                                     "DIAGNOSIS"}
//                                 </Heading>
//                                 {dx.icd10_code && (
//                                   <Badge colorScheme="blue">
//                                     ICD-10: {dx.icd10_code}
//                                   </Badge>
//                                 )}
//                               </HStack>
//                             </CardHeader>
//                             <CardBody>
//                               <VStack align="stretch" spacing={3}>
//                                 <Text fontWeight="bold" fontSize="md">
//                                   Diagnosis: {dx.diagnosis_name}
//                                 </Text>
//                                 <HStack spacing={2} wrap="wrap">
//                                   {dx.severity && (
//                                     <Tag colorScheme="red" variant="subtle">
//                                       Severity: {dx.severity}
//                                     </Tag>
//                                   )}
//                                   {dx.stage && (
//                                     <Tag colorScheme="orange" variant="subtle">
//                                       Stage: {dx.stage}
//                                     </Tag>
//                                   )}
//                                 </HStack>
//                                 {dx.disease_classification && (
//                                   <Text fontSize="sm">
//                                     <strong> Disease Classification:</strong>{" "}
//                                     {dx.disease_classification}
//                                   </Text>
//                                 )}
//                                 {dx.comorbidities && (
//                                   <Text fontSize="sm">
//                                     <strong>Comorbidities:</strong>{" "}
//                                     {dx.comorbidities}
//                                   </Text>
//                                 )}
//                                 {dx.notes && (
//                                   <Text fontSize="sm" color="gray.600">
//                                     <strong>Notes:</strong> {dx.notes}
//                                   </Text>
//                                 )}
//                               </VStack>
//                             </CardBody>
//                           </Card>
//                         ))}
//                       </VStack>
//                     ) : (
//                       <Card>
//                         <CardBody>
//                           <VStack spacing={4} py={8}>
//                             <InfoIcon boxSize={12} color="gray.400" />
//                             <Text color="gray.500" fontSize="lg">
//                               No diagnosis data available
//                             </Text>
//                           </VStack>
//                         </CardBody>
//                       </Card>
//                     )}
//                   </TabPanel>

//                   {/* TAB 7: Management */}
//                   <TabPanel py={6}>
//                     {encounterData.management || encounterData.medications ? (
//                       <VStack spacing={4} align="stretch">
//                         {/* Medications */}
//                         {encounterData.medications &&
//                           encounterData.medications.length > 0 && (
//                             <Card variant="outline">
//                               <CardHeader bg="green.50" py={3}>
//                                 <Heading size="sm">Current Medications</Heading>
//                               </CardHeader>
//                               <CardBody>
//                                 <SimpleGrid
//                                   columns={{ base: 1, md: 2 }}
//                                   spacing={4}
//                                 >
//                                   {encounterData.medications.map((med, idx) => (
//                                     <Box
//                                       key={idx}
//                                       p={3}
//                                       bg="gray.50"
//                                       borderRadius="md"
//                                     >
//                                       <Text fontWeight="bold">
//                                         Medicine :{" "}
//                                         {med.medication_name ||
//                                           med.name ||
//                                           "Unknown Medicine"}
//                                       </Text>
//                                       <Text fontSize="sm">
//                                         {med.dose} - {med.frequency}
//                                       </Text>
//                                       <Text fontSize="sm">
//                                         Duration: {med.duration}
//                                       </Text>
//                                       {med.purpose && (
//                                         <Text fontSize="sm" fontStyle="italic">
//                                           {med.purpose}
//                                         </Text>
//                                       )}
//                                     </Box>
//                                   ))}
//                                 </SimpleGrid>
//                               </CardBody>
//                             </Card>
//                           )}

//                         {/* Management Plan */}
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Management Plan</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <SimpleGrid
//                               columns={{ base: 1, md: 2 }}
//                               spacing={4}
//                             >
//                               <Box>
//                                 <Text fontWeight="bold">Seizure Control:</Text>
//                                 <Text>
//                                   {encounterData.management?.seizure_control ||
//                                     "Not specified"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Surgical Plan:</Text>
//                                 <Text>
//                                   {encounterData.management?.surgical_plan ||
//                                     "None"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Physiotherapy:</Text>
//                                 <Text>
//                                   {encounterData.management?.physiotherapy ||
//                                     "Not specified"}
//                                 </Text>
//                               </Box>
//                               <Box>
//                                 <Text fontWeight="bold">Follow-up Timing:</Text>
//                                 <Text>
//                                   {encounterData.management?.follow_up_timing ||
//                                     "Not specified"}
//                                 </Text>
//                               </Box>
//                             </SimpleGrid>
//                             <Box mt={4} p={3} bg="red.50" borderRadius="md">
//                               <Text fontWeight="bold" color="red.700">
//                                 Warning Signs (Red Flags):
//                               </Text>
//                               <Text color="red.700">
//                                 {encounterData.management?.warning_signs ||
//                                   "None specified"}
//                               </Text>
//                             </Box>
//                           </CardBody>
//                         </Card>
//                       </VStack>
//                     ) : (
//                       <Card>
//                         <CardBody>
//                           <Text>No management data available</Text>
//                         </CardBody>
//                       </Card>
//                     )}
//                   </TabPanel>

//                   {/* TAB 8: Notes & Referrals */}
//                   <TabPanel py={6}>
//                     {encounterData.notes ||
//                     (encounterData.referrals &&
//                       encounterData.referrals.length > 0) ? (
//                       <VStack spacing={4} align="stretch">
//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Clinical Observations</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <Text>
//                               {encounterData.notes?.clinical_observations ||
//                                 "None"}
//                             </Text>
//                           </CardBody>
//                         </Card>

//                         <Card variant="outline">
//                           <CardHeader bg="blue.50" py={3}>
//                             <Heading size="sm">Education Provided</Heading>
//                           </CardHeader>
//                           <CardBody>
//                             <Text>
//                               {encounterData.notes?.education_provided ||
//                                 "None"}
//                             </Text>
//                           </CardBody>
//                         </Card>

//                         {/* Multidisciplinary Care */}
//                         {encounterData.notes?.multidisciplinary_care && (
//                           <Card variant="outline">
//                             <CardHeader bg="blue.50" py={3}>
//                               <Heading size="sm" color="black.700">
//                                 Multidisciplinary Care
//                               </Heading>
//                             </CardHeader>
//                             <CardBody>
//                               <Text>
//                                 {encounterData.notes.multidisciplinary_care}
//                               </Text>
//                             </CardBody>
//                           </Card>
//                         )}

//                         {encounterData.referrals &&
//                           encounterData.referrals.length > 0 && (
//                             <Card variant="outline" borderColor="green.200">
//                               <CardHeader bg="green.50" py={3}>
//                                 <Heading size="sm" color="green.700">
//                                   Referrals
//                                 </Heading>
//                               </CardHeader>
//                               <CardBody>
//                                 <Wrap spacing={2}>
//                                   {encounterData.referrals.map((ref, idx) => (
//                                     <WrapItem key={idx}>
//                                       <Tag size="lg" colorScheme="green">
//                                         {ref.referral_name || ref.name || ref}
//                                       </Tag>
//                                     </WrapItem>
//                                   ))}
//                                 </Wrap>
//                               </CardBody>
//                             </Card>
//                           )}
//                       </VStack>
//                     ) : (
//                       <Card>
//                         <CardBody>
//                           <VStack spacing={4} py={8}>
//                             <InfoIcon boxSize={12} color="gray.400" />
//                             <Text color="gray.500" fontSize="lg">
//                               No notes or referrals available
//                             </Text>
//                           </VStack>
//                         </CardBody>
//                       </Card>
//                     )}
//                   </TabPanel>
//                 </TabPanels>
//               </Tabs>
//             </CardBody>
//           </Card>
//         )}
//       </VStack>
//     </Container>
//   );
// };

// export default NeurologyRecords;

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
import {
  CalendarIcon,
  TimeIcon,
  EditIcon,
  InfoIcon,
  DownloadIcon,
} from "@chakra-ui/icons";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingCurrentReport, setIsGeneratingCurrentReport] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    fetchPatients();
  }, [location.state?.refresh]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientEncounters(selectedPatient);
    } else {
      setEncounters([]);
      setSelectedEncounter("");
      setEncounterData(null);
    }
  }, [selectedPatient]);

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
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.encounter_date) - new Date(a.encounter_date),
      );
      setEncounters(sorted);
      if (sorted.length > 0) {
        setSelectedEncounter(sorted[0].encounter_id);
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

  // ===================== CURRENT ENCOUNTER HTML REPORT =====================
  const generateCurrentEncounterReport = () => {
    if (!encounterData) {
      toast({
        title: "No Data",
        description: "No encounter selected",
        status: "warning",
      });
      return;
    }

    setIsGeneratingCurrentReport(true);
    try {
      const reportWindow = window.open("", "_blank");
      const patient = encounterData.encounter;
      const comp = encounterData.complaints || {};
      const headache = encounterData.headache || {};
      const neuro = encounterData.neuroExam || {};
      const imaging = encounterData.imaging || {};
      const ep = encounterData.electrophysiology || {};
      const labs = encounterData.labs || {};
      const analysis = encounterData.analysis || {};
      const diagnoses = encounterData.diagnoses || [];
      const meds = encounterData.medications || [];
      const mgmt = encounterData.management || {};
      const notes = encounterData.notes || {};
      const referrals = encounterData.referrals || [];

      const formatDateOnly = (dateStr) =>
        dateStr
          ? new Date(dateStr).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A";
      const formatDateTime = (dateStr) =>
        dateStr
          ? new Date(dateStr).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";

      const renderYesNoBadge = (val) =>
        val === "Yes"
          ? '<span class="badge badge-red">Yes</span>'
          : '<span class="badge badge-green">No</span>';

      const renderPainBar = (severity) => {
        if (!severity) return "N/A";
        const width = (severity / 10) * 100;
        const color =
          severity <= 3 ? "#28a745" : severity <= 6 ? "#ffc107" : "#dc3545";
        return `
          <div style="background:#e9ecef; border-radius:5px; overflow:hidden; margin-top:5px;">
            <div style="background:${color}; width:${width}%; height:20px; text-align:center; color:white; font-size:12px; line-height:20px;">
              ${severity}/10
            </div>
          </div>
        `;
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Neurology Encounter Report - ${patient.patient_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            .report-container {
              max-width: 1400px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              border-radius: 8px;
              overflow: hidden;
            }
            .header {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #1e4a6b 0%, #2c7da0 100%);
              color: white;
            }
            .header h1 { margin: 0; font-size: 32px; }
            .header h3 { margin: 10px 0 5px; font-size: 20px; }
            .section {
              margin-bottom: 30px;
              padding: 0 20px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #2c7da0;
              color: white;
              padding: 12px 20px;
              margin: 0 -20px 20px -20px;
              font-size: 20px;
            }
            .subsection-title {
              background: #e9ecef;
              color: #2c7da0;
              padding: 8px 15px;
              margin: 20px 0 15px 0;
              font-size: 16px;
              border-left: 4px solid #2c7da0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              background: #f8f9fa;
              padding: 12px;
              border-radius: 5px;
              border-left: 3px solid #2c7da0;
            }
            .info-label {
              font-weight: bold;
              color: #2c7da0;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .info-value { font-size: 14px; line-height: 1.5; }
            .full-width { grid-column: 1 / -1; }
            .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .three-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 3px;
              font-size: 12px;
              font-weight: bold;
            }
            .badge-green { background: #d4edda; color: #155724; }
            .badge-red { background: #f8d7da; color: #721c24; }
            .badge-yellow { background: #fff3cd; color: #856404; }
            .badge-blue { background: #d1ecf1; color: #0c5460; }
            .footer {
              margin-top: 30px;
              padding: 20px;
              border-top: 1px solid #dee2e6;
              text-align: center;
              font-size: 12px;
              background: #f8f9fa;
            }
            @media print {
              body { background: white; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1>Neurology Encounter Report</h1>
              <h3>${patient.patient_name}</h3>
              <p>Patient ID: ${patient.patient_id} | DOB: ${formatDateOnly(patient.dob)} | Age: ${patient.age} yrs | Gender: ${patient.gender}</p>
              <p>Contact: ${patient.contact_number || "N/A"} | Email: ${patient.email || "N/A"}</p>
              <p>Encounter Date: ${formatDateTime(patient.encounter_date)} | Visit ID: ${patient.visit_id || patient.encounter_id}</p>
            </div>

            <!-- Patient Medical History -->
            <div class="section">
              <h2 class="section-title">Patient Medical History</h2>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Blood Group</div><div class="info-value">${patient.blood_group || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Allergies</div><div class="info-value">${patient.allergies || "None"}</div></div>
                <div class="info-item"><div class="info-label">Occupation</div><div class="info-value">${patient.occupation || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Smoking / Alcohol</div><div class="info-value">${patient.smoking_status || "Never"} / ${patient.alcohol_use || "None"}</div></div>
              </div>
              ${patient.past_medical_history ? `<div class="info-item full-width"><div class="info-label">Past Medical History</div><div class="info-value">${patient.past_medical_history}</div></div>` : ""}
              ${patient.past_surgical_history ? `<div class="info-item full-width"><div class="info-label">Past Surgical History</div><div class="info-value">${patient.past_surgical_history}</div></div>` : ""}
              ${patient.family_history ? `<div class="info-item full-width"><div class="info-label">Family History</div><div class="info-value">${patient.family_history}</div></div>` : ""}
              ${patient.social_history ? `<div class="info-item full-width"><div class="info-label">Social History</div><div class="info-value">${patient.social_history}</div></div>` : ""}
            </div>

            <!-- Chief Complaint & Symptoms -->
            <div class="section">
              <h2 class="section-title">Chief Complaint & Symptoms</h2>
              <div class="info-grid">
                <div class="info-item full-width"><div class="info-label">Chief Complaint</div><div class="info-value">${comp.chief_complaint || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Onset</div><div class="info-value">${formatDateOnly(comp.onset_date)}</div></div>
                <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${comp.duration || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Progression</div><div class="info-value">${comp.progression || "N/A"}</div></div>
              </div>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Headache Type</div><div class="info-value">${headache.headache_type || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Headache Severity</div><div class="info-value">${headache.headache_severity ? renderPainBar(headache.headache_severity) : "N/A"}</div></div>
                <div class="info-item"><div class="info-label">Seizures</div><div class="info-value">${renderYesNoBadge(comp.seizures_present)} ${comp.seizure_type ? `(${comp.seizure_type}, ${comp.seizure_frequency})` : ""}</div></div>
                <div class="info-item"><div class="info-label">Weakness</div><div class="info-value">${renderYesNoBadge(comp.weakness_present)} ${comp.weakness_side ? `(${comp.weakness_side}, ${comp.weakness_pattern})` : ""}</div></div>
                <div class="info-item"><div class="info-label">Numbness</div><div class="info-value">${comp.numbness || "None"}</div></div>
                <div class="info-item"><div class="info-label">Paresthesia</div><div class="info-value">${comp.paresthesia || "None"}</div></div>
                <div class="info-item"><div class="info-label">Speech Changes</div><div class="info-value">${comp.speech_changes || "None"}</div></div>
                <div class="info-item"><div class="info-label">Vision Changes</div><div class="info-value">${comp.vision_changes || "None"}</div></div>
                <div class="info-item"><div class="info-label">Cognitive Changes</div><div class="info-value">${comp.cognitive_changes || "None"}</div></div>
                <div class="info-item"><div class="info-label">Balance Issues</div><div class="info-value">${comp.balance_issues || "None"}</div></div>
                <div class="info-item"><div class="info-label">Overall Severity</div><div class="info-value">${comp.overall_severity ? renderPainBar(comp.overall_severity) : "N/A"}</div></div>
              </div>
            </div>

            <!-- Neurological Examination -->
            <div class="section">
              <h2 class="section-title">Neurological Examination</h2>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Mental Status</div><div class="info-value">Orientation: ${neuro.mental_status_orientation || "Normal"}, Memory: ${neuro.memory_recall || "Normal"}</div></div>
                <div class="info-item"><div class="info-label">Cranial Nerves</div><div class="info-value">${neuro.cranial_nerve_findings || "Normal"}</div></div>
                <div class="info-item"><div class="info-label">Motor</div><div class="info-value">Tone: ${neuro.motor_tone || "Normal"}, Power: ${neuro.motor_power || "Normal"}</div></div>
                <div class="info-item"><div class="info-label">Reflexes</div><div class="info-value">Biceps: ${neuro.reflexes_biceps || "2+"}, Knee: ${neuro.reflexes_knee || "2+"}</div></div>
                <div class="info-item"><div class="info-label">Sensory</div><div class="info-value">Pain: ${neuro.sensory_pain || "Intact"}, Vibration: ${neuro.sensory_vibration || "Intact"}</div></div>
                <div class="info-item"><div class="info-label">Gait & Coordination</div><div class="info-value">Gait: ${neuro.gait || "Normal"}, Romberg: ${neuro.romberg_test || "Negative"}</div></div>
              </div>
            </div>

            <!-- Investigations -->
            <div class="section">
              <h2 class="section-title">Investigations</h2>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Imaging</div><div class="info-value">CT: ${imaging.ct_brain || "Not done"}, MRI: ${imaging.mri_brain || "Not done"}</div></div>
                <div class="info-item"><div class="info-label">Electrophysiology</div><div class="info-value">EEG: ${ep.eeg_ordered || "Not done"}, NCS: ${ep.ncs_ordered || "Not done"}, EMG: ${ep.emg_ordered || "Not done"}</div></div>
                <div class="info-item"><div class="info-label">Labs</div><div class="info-value">CBC: ${labs.cbc_results || "Not done"}, Thyroid: ${labs.thyroid_results || "Not done"}</div></div>
              </div>
            </div>

            <!-- Analysis & Findings -->
            <div class="section">
              <h2 class="section-title">Analysis & Findings</h2>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">MRI Findings</div><div class="info-value">${analysis.mri_findings || "N/A"}</div></div>
                <div class="info-item"><div class="info-label">EEG Results</div><div class="info-value">${analysis.eeg_results || "N/A"}</div></div>
                <div class="info-item full-width"><div class="info-label">Clinical Correlation</div><div class="info-value">${analysis.clinical_correlation || "N/A"}</div></div>
              </div>
            </div>

            <!-- Diagnoses -->
            <div class="section">
              <h2 class="section-title">Diagnoses</h2>
              ${
                diagnoses.length
                  ? diagnoses
                      .map(
                        (dx) => `
                <div class="info-item" style="margin-bottom:15px;">
                  <div class="info-label">${dx.diagnosis_type?.toUpperCase() || "Diagnosis"}</div>
                  <div class="info-value"><strong>${dx.diagnosis_name}</strong> ${dx.icd10_code ? `(ICD-10: ${dx.icd10_code})` : ""}<br/>
                  Severity: ${dx.severity || "N/A"}, Stage: ${dx.stage || "N/A"}<br/>
                  Comorbidities: ${dx.comorbidities || "None"}</div>
                </div>
              `,
                      )
                      .join("")
                  : '<div class="info-item"><div class="info-value">No diagnoses recorded</div></div>'
              }
            </div>

            <!-- Management & Medications -->
            <div class="section">
              <h2 class="section-title">Management Plan</h2>
              <div class="info-grid">
                <div class="info-item full-width"><div class="info-label">Medications</div><div class="info-value">${meds.length ? meds.map((m) => `${m.medication_name || m.name} ${m.dose} - ${m.frequency} (${m.duration})`).join("<br/>") : "None"}</div></div>
                <div class="info-item"><div class="info-label">Seizure Control</div><div class="info-value">${mgmt.seizure_control || "Not specified"}</div></div>
                <div class="info-item"><div class="info-label">Surgical Plan</div><div class="info-value">${mgmt.surgical_plan || "None"}</div></div>
                <div class="info-item"><div class="info-label">Follow-up</div><div class="info-value">${mgmt.follow_up_timing || "Not specified"}</div></div>
                <div class="info-item full-width"><div class="info-label">Warning Signs</div><div class="info-value">${mgmt.warning_signs || "None specified"}</div></div>
              </div>
            </div>

            <!-- Notes & Referrals -->
            <div class="section">
              <h2 class="section-title">Notes & Referrals</h2>
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Clinical Observations</div><div class="info-value">${notes.clinical_observations || "None"}</div></div>
                <div class="info-item"><div class="info-label">Education Provided</div><div class="info-value">${notes.education_provided || "None"}</div></div>
                <div class="info-item full-width"><div class="info-label">Referrals</div><div class="info-value">${referrals.length ? referrals.map((r) => r.referral_name || r.name || r).join(", ") : "None"}</div></div>
              </div>
            </div>

            <div class="footer">
              <p>Report generated on ${new Date().toLocaleString()}</p>
              <p>This is a computer-generated document for medical purposes only.</p>
            </div>
          </div>
          <div class="no-print" style="text-align:center; margin-top:20px; padding:20px;">
            <button onclick="window.print()" style="padding:12px 24px; background:#2c7da0; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">🖨️ Print / Save as PDF</button>
            <button onclick="window.close()" style="padding:12px 24px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">✖ Close</button>
          </div>
        </body>
        </html>
      `;

      reportWindow.document.write(html);
      reportWindow.document.close();
      toast({
        title: "Success",
        description: "Current encounter report opened",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate current encounter report",
        status: "error",
      });
    } finally {
      setIsGeneratingCurrentReport(false);
    }
  };

  // ===================== COMPLETE HISTORY HTML REPORT (Enhanced) =====================
  const fetchAllEncountersFullData = async (patientId, encountersList) => {
    const encountersWithFullData = [];
    for (const encounter of encountersList) {
      try {
        const response = await encounterApi.getFullEncounterDetails(
          encounter.encounter_id,
        );
        encountersWithFullData.push(response.data);
      } catch (error) {
        console.error(
          `Error fetching encounter ${encounter.encounter_id}:`,
          error,
        );
      }
    }
    return encountersWithFullData;
  };

  const generateCompleteReport = async () => {
    if (!selectedPatient) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (encounters.length === 0) {
      toast({
        title: "No Encounters",
        description: "This patient has no encounters to report",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsGeneratingReport(true);
    try {
      toast({
        title: "Generating Report",
        description: "Fetching all encounter data...",
        status: "info",
        duration: 2000,
      });

      const allEncountersFullData = await fetchAllEncountersFullData(
        selectedPatient,
        encounters,
      );
      const selectedPatientData = patients.find(
        (p) => p.patient_id === parseInt(selectedPatient),
      );
      if (!selectedPatientData) throw new Error("Patient data not found");

      // Latest encounter for medical history
      const latestEncounter = allEncountersFullData[0] || null;

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
        past_medical_history:
          latestEncounter?.encounter?.past_medical_history || "N/A",
        past_surgical_history:
          latestEncounter?.encounter?.past_surgical_history || "N/A",
        family_history: latestEncounter?.encounter?.family_history || "N/A",
        social_history: latestEncounter?.encounter?.social_history || "N/A",
        allergies: latestEncounter?.encounter?.allergies || "None",
        occupation: latestEncounter?.encounter?.occupation || "N/A",
        physical_activity_level:
          latestEncounter?.encounter?.physical_activity_level || "N/A",
        smoking_status: latestEncounter?.encounter?.smoking_status || "N/A",
        alcohol_use: latestEncounter?.encounter?.alcohol_use || "N/A",
        height_cm: latestEncounter?.encounter?.height_cm,
        weight_kg: latestEncounter?.encounter?.weight_kg,
        bmi: latestEncounter?.encounter?.bmi,
      };

      generateNeurologyFullHtmlReport(patientReportData, allEncountersFullData);

      toast({
        title: "Report Generated",
        description: `${encounters.length} encounter(s) included with complete medical history`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description:
          "Failed to generate complete report: " +
          (error.message || "Unknown error"),
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateNeurologyFullHtmlReport = (patientData, allEncounters) => {
    if (!patientData) return;
    const reportWindow = window.open("", "_blank");

    const styles = `
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        .report-container {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #1e4a6b 0%, #2c7da0 100%);
          color: white;
        }
        .header h1 { margin: 0; font-size: 32px; }
        .header h3 { margin: 10px 0 5px; font-size: 20px; }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 20px;
          background: #f8f9fa;
        }
        .summary-card {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card .number {
          font-size: 28px;
          font-weight: bold;
          color: #2c7da0;
        }
        .section {
          margin-bottom: 30px;
          padding: 0 20px;
          page-break-inside: avoid;
        }
        .section-title {
          background: #2c7da0;
          color: white;
          padding: 12px 20px;
          margin: 0 -20px 20px -20px;
          font-size: 20px;
        }
        .subsection-title {
          background: #e9ecef;
          color: #2c7da0;
          padding: 8px 15px;
          margin: 20px 0 15px 0;
          font-size: 16px;
          border-left: 4px solid #2c7da0;
        }
        .encounter-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 30px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .encounter-header {
          background: #f8f9fa;
          padding: 15px;
          border-bottom: 2px solid #2c7da0;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .encounter-header h4 { margin: 0; color: #1e4a6b; }
        .encounter-date { color: #666; font-size: 14px; }
        .encounter-body { padding: 20px; display: none; }
        .encounter-body.show { display: block; }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 5px;
          border-left: 3px solid #2c7da0;
        }
        .info-label {
          font-weight: bold;
          color: #2c7da0;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .info-value { font-size: 14px; line-height: 1.5; }
        .full-width { grid-column: 1 / -1; }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-green { background: #d4edda; color: #155724; }
        .badge-red { background: #f8d7da; color: #721c24; }
        .badge-yellow { background: #fff3cd; color: #856404; }
        .footer {
          margin-top: 30px;
          padding: 20px;
          border-top: 1px solid #dee2e6;
          text-align: center;
          font-size: 12px;
          background: #f8f9fa;
        }
        .toggle-button {
          background: #2c7da0;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
        }
        @media print {
          body { background: white; }
          .no-print { display: none; }
          .encounter-body { display: block !important; }
          .encounter-card { break-inside: avoid; }
        }
      </style>
    `;

    const formatDateOnly = (dateStr) =>
      dateStr
        ? new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A";
    const formatDateTime = (dateStr) =>
      dateStr
        ? new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

    const renderYesNoBadge = (val) =>
      val === "Yes"
        ? '<span class="badge badge-red">Yes</span>'
        : '<span class="badge badge-green">No</span>';

    const renderSeverityBar = (severity) => {
      if (!severity) return "N/A";
      const width = (severity / 10) * 100;
      const color =
        severity <= 3 ? "#28a745" : severity <= 6 ? "#ffc107" : "#dc3545";
      return `
        <div style="background:#e9ecef; border-radius:5px; overflow:hidden; margin-top:5px;">
          <div style="background:${color}; width:${width}%; height:20px; text-align:center; color:white; font-size:12px; line-height:20px;">
            ${severity}/10
          </div>
        </div>
      `;
    };

    const renderEncounter = (enc) => {
      const e = enc.encounter;
      const comp = enc.complaints || {};
      const headache = enc.headache || {};
      const neuro = enc.neuroExam || {};
      const imaging = enc.imaging || {};
      const ep = enc.electrophysiology || {};
      const labs = enc.labs || {};
      const analysis = enc.analysis || {};
      const diagnoses = enc.diagnoses || [];
      const meds = enc.medications || [];
      const mgmt = enc.management || {};
      const notes = enc.notes || {};
      const referrals = enc.referrals || [];

      return `
        <div class="encounter-card">
          <div class="encounter-header" onclick="toggleEncounter(this)">
            <div>
              <h4>Encounter #${e.visit_id || e.encounter_id}</h4>
              <div class="encounter-date">📅 ${formatDateTime(e.encounter_date)}</div>
            </div>
            <button class="toggle-button no-print">▼ Expand</button>
          </div>
          <div class="encounter-body">
            <h3 class="subsection-title">Chief Complaint & Symptoms</h3>
            <div class="info-grid">
              <div class="info-item full-width"><div class="info-label">Chief Complaint</div><div class="info-value">${comp.chief_complaint || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Onset</div><div class="info-value">${formatDateOnly(comp.onset_date)}</div></div>
              <div class="info-item"><div class="info-label">Duration</div><div class="info-value">${comp.duration || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Progression</div><div class="info-value">${comp.progression || "N/A"}</div></div>
            </div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Headache Type</div><div class="info-value">${headache.headache_type || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Headache Severity</div><div class="info-value">${headache.headache_severity ? renderSeverityBar(headache.headache_severity) : "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Seizures</div><div class="info-value">${renderYesNoBadge(comp.seizures_present)} ${comp.seizure_type ? `(${comp.seizure_type}, ${comp.seizure_frequency})` : ""}</div></div>
              <div class="info-item"><div class="info-label">Weakness</div><div class="info-value">${renderYesNoBadge(comp.weakness_present)} ${comp.weakness_side ? `(${comp.weakness_side}, ${comp.weakness_pattern})` : ""}</div></div>
              <div class="info-item"><div class="info-label">Numbness</div><div class="info-value">${comp.numbness || "None"}</div></div>
              <div class="info-item"><div class="info-label">Paresthesia</div><div class="info-value">${comp.paresthesia || "None"}</div></div>
              <div class="info-item"><div class="info-label">Speech Changes</div><div class="info-value">${comp.speech_changes || "None"}</div></div>
              <div class="info-item"><div class="info-label">Vision Changes</div><div class="info-value">${comp.vision_changes || "None"}</div></div>
              <div class="info-item"><div class="info-label">Cognitive Changes</div><div class="info-value">${comp.cognitive_changes || "None"}</div></div>
              <div class="info-item"><div class="info-label">Balance Issues</div><div class="info-value">${comp.balance_issues || "None"}</div></div>
              <div class="info-item"><div class="info-label">Overall Severity</div><div class="info-value">${comp.overall_severity ? renderSeverityBar(comp.overall_severity) : "N/A"}</div></div>
            </div>

            <h3 class="subsection-title">Neurological Examination</h3>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Mental Status</div><div class="info-value">Orientation: ${neuro.mental_status_orientation || "Normal"}, Memory: ${neuro.memory_recall || "Normal"}</div></div>
              <div class="info-item"><div class="info-label">Cranial Nerves</div><div class="info-value">${neuro.cranial_nerve_findings || "Normal"}</div></div>
              <div class="info-item"><div class="info-label">Motor</div><div class="info-value">Tone: ${neuro.motor_tone || "Normal"}, Power: ${neuro.motor_power || "Normal"}</div></div>
              <div class="info-item"><div class="info-label">Reflexes</div><div class="info-value">Biceps: ${neuro.reflexes_biceps || "2+"}, Knee: ${neuro.reflexes_knee || "2+"}</div></div>
              <div class="info-item"><div class="info-label">Sensory</div><div class="info-value">Pain: ${neuro.sensory_pain || "Intact"}, Vibration: ${neuro.sensory_vibration || "Intact"}</div></div>
              <div class="info-item"><div class="info-label">Gait & Coordination</div><div class="info-value">Gait: ${neuro.gait || "Normal"}, Romberg: ${neuro.romberg_test || "Negative"}</div></div>
            </div>

            <h3 class="subsection-title">Investigations</h3>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Imaging</div><div class="info-value">CT: ${imaging.ct_brain || "Not done"}, MRI: ${imaging.mri_brain || "Not done"}</div></div>
              <div class="info-item"><div class="info-label">Electrophysiology</div><div class="info-value">EEG: ${ep.eeg_ordered || "Not done"}, NCS: ${ep.ncs_ordered || "Not done"}, EMG: ${ep.emg_ordered || "Not done"}</div></div>
              <div class="info-item"><div class="info-label">Labs</div><div class="info-value">CBC: ${labs.cbc_results || "Not done"}, Thyroid: ${labs.thyroid_results || "Not done"}</div></div>
            </div>

            <h3 class="subsection-title">Analysis & Findings</h3>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">MRI Findings</div><div class="info-value">${analysis.mri_findings || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">EEG Results</div><div class="info-value">${analysis.eeg_results || "N/A"}</div></div>
              <div class="info-item full-width"><div class="info-label">Clinical Correlation</div><div class="info-value">${analysis.clinical_correlation || "N/A"}</div></div>
            </div>

            <h3 class="subsection-title">Diagnoses</h3>
            ${
              diagnoses.length
                ? diagnoses
                    .map(
                      (dx) => `
              <div class="info-item" style="margin-bottom:10px">
                <div class="info-label">${dx.diagnosis_type?.toUpperCase() || "Diagnosis"}</div>
                <div class="info-value"><strong>${dx.diagnosis_name}</strong> ${dx.icd10_code ? `(ICD-10: ${dx.icd10_code})` : ""}<br/>
                Severity: ${dx.severity || "N/A"}, Stage: ${dx.stage || "N/A"}<br/>
                Comorbidities: ${dx.comorbidities || "None"}</div>
              </div>
            `,
                    )
                    .join("")
                : '<div class="info-item"><div class="info-value">No diagnoses recorded</div></div>'
            }

            <h3 class="subsection-title">Management Plan</h3>
            <div class="info-grid">
              <div class="info-item full-width"><div class="info-label">Medications</div><div class="info-value">${meds.length ? meds.map((m) => `${m.medication_name || m.name} ${m.dose} - ${m.frequency} (${m.duration})`).join("<br/>") : "None"}</div></div>
              <div class="info-item"><div class="info-label">Seizure Control</div><div class="info-value">${mgmt.seizure_control || "Not specified"}</div></div>
              <div class="info-item"><div class="info-label">Surgical Plan</div><div class="info-value">${mgmt.surgical_plan || "None"}</div></div>
              <div class="info-item"><div class="info-label">Follow-up</div><div class="info-value">${mgmt.follow_up_timing || "Not specified"}</div></div>
              <div class="info-item full-width"><div class="info-label">Warning Signs</div><div class="info-value">${mgmt.warning_signs || "None specified"}</div></div>
            </div>

            <h3 class="subsection-title">Notes & Referrals</h3>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Clinical Observations</div><div class="info-value">${notes.clinical_observations || "None"}</div></div>
              <div class="info-item"><div class="info-label">Education Provided</div><div class="info-value">${notes.education_provided || "None"}</div></div>
              <div class="info-item full-width"><div class="info-label">Referrals</div><div class="info-value">${referrals.length ? referrals.map((r) => r.referral_name || r.name || r).join(", ") : "None"}</div></div>
            </div>
          </div>
        </div>
      `;
    };

    // Summary statistics
    const totalEncounters = allEncounters.length;
    const primaryDiagnoses = [];
    allEncounters.forEach((enc) => {
      if (enc.diagnoses) {
        const primary = enc.diagnoses.find(
          (d) => d.diagnosis_type === "primary",
        );
        if (primary) primaryDiagnoses.push(primary.diagnosis_name);
      }
    });
    const mostCommonDx = primaryDiagnoses.length
      ? Object.entries(
          primaryDiagnoses.reduce((acc, dx) => {
            acc[dx] = (acc[dx] || 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";
    const surgicalCount = allEncounters.filter(
      (e) =>
        e.management?.surgical_plan && e.management.surgical_plan !== "None",
    ).length;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Complete Neurology Report - ${patientData.patient_name}</title>
        ${styles}
        <script>
          function toggleEncounter(element) {
            const body = element.nextElementSibling;
            const btn = element.querySelector('.toggle-button');
            body.classList.toggle('show');
            btn.textContent = body.classList.contains('show') ? '▲ Collapse' : '▼ Expand';
          }
          function expandAll() {
            document.querySelectorAll('.encounter-body').forEach(b => b.classList.add('show'));
            document.querySelectorAll('.toggle-button').forEach(b => b.textContent = '▲ Collapse');
          }
          function collapseAll() {
            document.querySelectorAll('.encounter-body').forEach(b => b.classList.remove('show'));
            document.querySelectorAll('.toggle-button').forEach(b => b.textContent = '▼ Expand');
          }
        </script>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>Complete Neurology Patient Report</h1>
            <h3>${patientData.patient_name}</h3>
            <p>Patient ID: ${patientData.patient_id} | DOB: ${formatDateOnly(patientData.dob)} | Age: ${patientData.age} yrs | Gender: ${patientData.gender}</p>
            <p>Contact: ${patientData.contact_number || "N/A"} | Email: ${patientData.email || "N/A"}</p>
          </div>

          <div class="summary-cards">
            <div class="summary-card"><div class="number">${totalEncounters}</div><div class="label">Total Encounters</div></div>
            <div class="summary-card"><div class="number">${mostCommonDx !== "N/A" ? "✓" : "N/A"}</div><div class="label">Most Common Diagnosis</div><div style="font-size:12px">${mostCommonDx}</div></div>
            <div class="summary-card"><div class="number">${surgicalCount}</div><div class="label">Surgical Interventions</div></div>
          </div>

          <!-- Patient Medical History -->
          <div class="section">
            <h2 class="section-title">Patient Medical History</h2>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Blood Group</div><div class="info-value">${patientData.blood_group || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Allergies</div><div class="info-value">${patientData.allergies || "None"}</div></div>
              <div class="info-item"><div class="info-label">Occupation</div><div class="info-value">${patientData.occupation || "N/A"}</div></div>
              <div class="info-item"><div class="info-label">Smoking/Alcohol</div><div class="info-value">${patientData.smoking_status || "Never"} / ${patientData.alcohol_use || "None"}</div></div>
            </div>
            ${patientData.past_medical_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Past Medical History</div><div class="info-value">${patientData.past_medical_history}</div></div>` : ""}
            ${patientData.past_surgical_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Past Surgical History</div><div class="info-value">${patientData.past_surgical_history}</div></div>` : ""}
            ${patientData.family_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Family History</div><div class="info-value">${patientData.family_history}</div></div>` : ""}
            ${patientData.social_history !== "N/A" ? `<div class="info-item full-width"><div class="info-label">Social History</div><div class="info-value">${patientData.social_history}</div></div>` : ""}
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Emergency Contact</div><div class="info-value">${patientData.emergency_name || "Not provided"} (${patientData.emergency_contact_number || ""})</div></div>
              <div class="info-item"><div class="info-label">Physical Metrics</div><div class="info-value">Height: ${patientData.height_cm || "N/A"} cm, Weight: ${patientData.weight_kg || "N/A"} kg, BMI: ${patientData.bmi || "N/A"}</div></div>
            </div>
          </div>

          <!-- All Encounters -->
          <div class="section">
            <h2 class="section-title">All Medical Encounters (${totalEncounters})</h2>
            <div class="no-print" style="text-align:right; margin-bottom:15px;">
              <button onclick="expandAll()" style="padding:8px 16px; margin-right:10px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">Expand All</button>
              <button onclick="collapseAll()" style="padding:8px 16px; background:#dc3545; color:white; border:none; border-radius:5px; cursor:pointer;">Collapse All</button>
            </div>
            ${allEncounters.map((enc) => renderEncounter(enc)).join("")}
            ${totalEncounters === 0 ? '<div class="info-item"><div class="info-value">No encounters found.</div></div>' : ""}
          </div>

          <div class="footer">
            <p>Report generated on ${new Date().toLocaleString()}</p>
            <p>This report includes all neurology encounters. Data is for medical purposes only.</p>
          </div>
        </div>
        <div class="no-print" style="text-align:center; margin-top:20px; padding:20px;">
          <button onclick="window.print()" style="padding:12px 24px; background:#2c7da0; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">🖨️ Print / Save as PDF</button>
          <button onclick="window.close()" style="padding:12px 24px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer; margin:0 5px;">✖ Close</button>
        </div>
      </body>
      </html>
    `;

    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  // ================================================================

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
                    <CalendarIcon mb={1.5} color="blue.500" />
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
                <HStack spacing={3}>
                  <Button
                    leftIcon={<EditIcon />}
                    colorScheme="blue"
                    onClick={() => handleEditClick(encounterData.encounter)}
                  >
                    Edit This Encounter
                  </Button>
                  {/* <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="green"
                    onClick={generateCurrentEncounterReport}
                    isLoading={isGeneratingCurrentReport}
                    loadingText="Generating..."
                  >
                    Current Report
                  </Button>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="purple"
                    onClick={generateCompleteReport}
                    isLoading={isGeneratingReport}
                    loadingText="Generating..."
                  >
                    Complete Report
                  </Button> */}
                  <Menu>
                    <MenuButton
                      as={Button}
                      leftIcon={<DownloadIcon />}
                      rightIcon={<ChevronDownIcon />}
                      colorScheme="green"
                      isLoading={
                        isGeneratingReport || isGeneratingCurrentReport
                      }
                      loadingText="Generating..."
                    >
                      Generate Report
                    </MenuButton>

                    <MenuList>
                      <MenuItem onClick={generateCurrentEncounterReport}>
                        Current Encounter Only
                      </MenuItem>

                      <MenuItem onClick={generateCompleteReport}>
                        Full Patient Report (All Encounters)
                      </MenuItem>
                    </MenuList>
                  </Menu>
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
                  {/* TAB 1: Patient Info - unchanged from your original */}
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
                                {encounterData.encounter?.age ||
                                  calculateAge(
                                    encounterData.encounter?.dob,
                                  )}{" "}
                                yrs
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

                        {/* Seizure Details */}
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

                        {/* Overall Severity */}
                        <Card variant="outline" borderColor="red.200">
                          <CardHeader bg="red.50" py={3}>
                            <Heading size="sm" color="red.700">
                              Overall Severity Assessment
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            {encounterData.complaints?.overall_severity !=
                            null ? (
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
                                      <Text fontWeight="bold">
                                        Medicine :{" "}
                                        {med.medication_name ||
                                          med.name ||
                                          "Unknown Medicine"}
                                      </Text>
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



// import { useState, useEffect } from "react";
// import {
//   Flex,
//   Box,
//   Heading,
//   Text,
//   Input,
//   Select,
//   Textarea,
//   Button,
//   Grid,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   Divider,
//   Tabs,
//   TabList,
//   TabPanels,
//   Tab,
//   TabPanel,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   useToast,
// } from "@chakra-ui/react";

// function PatientFeedback() {
//   const toast = useToast();

//   const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];

//   const [activeTab, setActiveTab] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [feedbackList, setFeedbackList] = useState([]);
//   const [viewData, setViewData] = useState(null);
//   const [editingId, setEditingId] = useState(null);
//   const [availableModules, setAvailableModules] = useState(ALL_MODULES);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [savedModules, setSavedModules] = useState([]);
//   const [selectedModule, setSelectedModule] = useState("");
//   const [currentModuleData, setCurrentModuleData] = useState({
//     rating: "",
//     comment: "",
//   });

//    useEffect(() => {
//   if (savedModules.length === ALL_MODULES.length) {
//     setErrors((prev) => {
//       const updated = { ...prev };
//       delete updated.modules;
//       return updated;
//     });
//   }
// }, [savedModules]);


//   const [formData, setFormData] = useState({
//     patient_id: "",
//     patient_name: "",
//     admission_id: "",
//     service_type: "",
//     rating: "",
//     consent_flag: "",
//     feedback_comments: "",
//   });
 

//   const [errors, setErrors] = useState({});

//   /* ================= FETCH ALL FEEDBACK ================= */

//   const fetchFeedbacks = async () => {
//     try {
//       const res = await fetch("http://localhost:3000/feedback/getFeedback");
//       const data = await res.json();
//       if (data.success) {
//         setFeedbackList(data.data);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchFeedbacks();
//   }, []);

//   /* ================= FORM HANDLERS ================= */

//   const resetForm = () => {
//     setFormData({
//       patient_id: "",
//       patient_name: "",
//       admission_id: "",
//       service_type: "",
//       rating: "",
//       consent_flag: "",
//       feedback_comments: "",
//     });
//     setSavedModules([]);
//     setSelectedModule("");
//     setEditingId(null);
//     setErrors({});
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleNumberChange = (e) => {
//     if (/^\d*$/.test(e.target.value)) {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };

//   /* ================= MODULE LOGIC ================= */

//   // const availableModules = ALL_MODULES.filter(
//   //   (m) => !savedModules.some((sm) => sm.module_name === m)
//   // );

//    const handleSelectModule = (e) => {
//     setSelectedModule(e.target.value);
//     setCurrentModuleData({ rating: "", comment: "" });
//     setEditingIndex(null);
//   };

//   const handleSaveModule = () => {
//     if (!selectedModule || !currentModuleData.rating ) {
//       toast({
//         title: "Fill rating",
//         status: "error",
//         duration: 2000,
//       });
//       return;
//     }

//     if (editingIndex !== null) {
//       const updated = [...savedModules];
//       updated[editingIndex] = {
//         module_name: selectedModule,
//         ...currentModuleData,
//       };
//       setSavedModules(updated);
//       setEditingIndex(null);
//     } else {
//       setSavedModules([
//         ...savedModules,
//         { module_name: selectedModule, ...currentModuleData },
//       ]);

//       setAvailableModules(
//         availableModules.filter((m) => m !== selectedModule)
//       );
//     }

//     setSelectedModule("");
//     setCurrentModuleData({ rating: "", comment: "" });
//   };

//   const handleEditModule = (index) => {
//     const module = savedModules[index];

//     setSelectedModule(module.module_name);
//     setCurrentModuleData({
//       rating: module.rating,
//       comment: module.comment,
//     });

//     setEditingIndex(index);
//   };

//   const handleDeleteModule = (index) => {
//     const deleted = savedModules[index];

//     setSavedModules(savedModules.filter((_, i) => i !== index));
//     setAvailableModules([...availableModules, deleted.module_name]);
//   };

 
//   /* ================= VALIDATION ================= */

//   const validate = () => {
//     let newErrors = {};

//     if (!formData.patient_id) newErrors.patient_id = "Required";
//     if (!formData.patient_name) newErrors.patient_name = "Required";
//     if (!formData.admission_id) newErrors.admission_id = "Required";
//     if (!formData.service_type) newErrors.service_type = "Required";
//     if (!formData.rating) newErrors.rating = "Required";
//     if (!formData.consent_flag) newErrors.consent_flag = "Required";

//     if (savedModules.length !== ALL_MODULES.length) {
//       newErrors.modules = "All modules must be completed";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /* ================= SUBMIT ================= */

//   const handleSubmit = async (e) => {
    
//     e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);

//     const url = editingId
//       ? `http://localhost:3000/feedback/updateFeedback/${editingId}`
//       : "http://localhost:3000/feedback/postFeedback";

//       console.log("Editing ID:", editingId);

//     const method = editingId ? "PUT" : "POST";
//       console.log("Method:", method);


//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...formData,
//           feedback_mode: "Online",
//           module_ratings: savedModules,
//         }),
//       });

//       const result = await res.json();

//       if (result.success) {
//         toast({
//           title: editingId
//             ? "Feedback Updated"
//             : "Feedback Submitted",
//           status: "success",
//         });

//         resetForm();
//         fetchFeedbacks();
//         setActiveTab(1);
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (err) {
//       toast({ title: err.message, status: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= VIEW / EDIT / DELETE ================= */

//   const handleView = (data) => {
//     setViewData(data);
//   };

//   const handleEdit = (data) => {
//     setEditingId(data.feedback_id);
//     setFormData({
//       patient_id: data.patient_id,
//       patient_name: data.patient_name,
//       admission_id: data.admission_id,
//       service_type: data.service_type,
//       rating: data.overall_rating,
//       consent_flag: data.consent_flag ? "Yes" : "No",
//       feedback_comments: data.feedback_comments,
//     });

//     setSavedModules(data.module_ratings);
//     setActiveTab(0);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this feedback?")) return;

//     const res = await fetch(
//       `http://localhost:3000/feedback/deleteFeedback/${id}`,
//       { method: "DELETE" }
//     );

//     const result = await res.json();

//     if (result.success) {
//       toast({ title: "Deleted successfully", status: "success" });
//       fetchFeedbacks();
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <Flex p={6} bg="gray.100" minH="100vh">
//       <Box ml="250px" w="100%" bg="white" p={8} borderRadius="lg" boxShadow="lg">
//         <Tabs index={activeTab} onChange={setActiveTab}>
//           <TabList>
//             <Tab>Feedback Form</Tab>
//             <Tab>Feedback List</Tab>
//           </TabList>

//           <TabPanels>

//             {/* ================= TAB 1 FORM ================= */}

//             <TabPanel>
//               <Heading mb={6}>
//                 {editingId ? "Edit Feedback" : "Patient Feedback"}
//               </Heading>

//               <form onSubmit={handleSubmit}>
//                 <Grid templateColumns="repeat(2,1fr)" gap={6}>
//                   <FormControl isRequired isInvalid={errors.patient_id}>
//                     <FormLabel>Patient ID</FormLabel>
//                     <Input
//                       name="patient_id"
//                       value={formData.patient_id}
//                       onChange={handleNumberChange}
//                     />
//                     <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
//                   </FormControl>

//                   <FormControl isRequired isInvalid={errors.patient_name}>
//                     <FormLabel>Patient Name</FormLabel>
//                     <Input
//                       name="patient_name"
//                       value={formData.patient_name}
//                       onChange={handleChange}
//                     />
//                     <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
//                   </FormControl>

//                   <FormControl isRequired isInvalid={errors.admission_id}>
//                     <FormLabel>Admission ID</FormLabel>
//                     <Input
//                       name="admission_id"
//                       value={formData.admission_id}
//                       onChange={handleNumberChange}
//                     />
//                   </FormControl>

//                   <FormControl isRequired isInvalid={errors.service_type}>
//                     <FormLabel>Service Type</FormLabel>
//                     <Select
//                       name="service_type"
//                       value={formData.service_type}
//                       onChange={handleChange}
//                       placeholder="Select"
//                     >
//                       <option value="OPD">OPD</option>
//                       <option value="IPD">IPD</option>
//                       <option value="Diagnostic">Diagnostic</option>
//                       <option value="Pharmacy">Pharmacy</option>
//                     </Select>
//                   </FormControl>

//                   <FormControl isRequired isInvalid={errors.rating}>
//                     <FormLabel>Overall Rating</FormLabel>
//                     <Select
//                       name="rating"
//                       value={formData.rating}
//                       onChange={handleChange}
//                       placeholder="Select"
//                     >
//                       {[1,2,3,4,5].map(n=>(
//                         <option key={n} value={n}>{n}</option>
//                       ))}
//                     </Select>
//                   </FormControl>

//                   <FormControl isRequired isInvalid={errors.consent_flag}>
//                     <FormLabel>Consent</FormLabel>
//                     <Select
//                       name="consent_flag"
//                       value={formData.consent_flag}
//                       onChange={handleChange}
//                       placeholder="Select"
//                     >
//                       <option value="Yes">Yes</option>
//                       <option value="No">No</option>
//                     </Select>
//                   </FormControl>
//                   <FormControl gridColumn="span 2">
//                   <FormLabel>Overall Comments</FormLabel>
//                   <Textarea
//                     name="feedback_comments"
//                     value={formData.feedback_comments}
//                     onChange={handleChange}
//                     placeholder="Write your overall feedback..."
//                   />
//                 </FormControl>
//                 </Grid>

//                 <Divider my={6} />

//                 <Heading size="md">Module Feedback</Heading>

//                  <FormControl mb={4}>
//             <FormLabel>Select Module</FormLabel>
//             <Select
//               placeholder="Choose Module"
//               value={selectedModule}
//               onChange={handleSelectModule}
//             >
//               {availableModules.map((module, index) => (
//                 <option key={index} value={module}>
//                   {module}
//                 </option>
//               ))}
//             </Select>
//           </FormControl>

//           {selectedModule && (
//             <Box p={5} borderWidth="1px" borderRadius="md" bg="gray.50" mb={5}>
//               <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                 <FormControl isRequired>
//                   <FormLabel>Rating</FormLabel>
//                   <Select
//                     value={currentModuleData.rating}
//                     onChange={(e) =>
//                       setCurrentModuleData({
//                         ...currentModuleData,
//                         rating: e.target.value,
//                       })
//                     }
//                     placeholder="Select Rating"
//                   >
//                     <option value="1">1 - Poor</option>
//                     <option value="2">2 - Fair</option>
//                     <option value="3">3 - Good</option>
//                     <option value="4">4 - Very Good</option>
//                     <option value="5">5 - Excellent</option>
//                   </Select>
//                 </FormControl>

//                 <FormControl >
//                   <FormLabel>Comment</FormLabel>
//                   <Input
//                     value={currentModuleData.comment}
//                     onChange={(e) =>
//                       setCurrentModuleData({
//                         ...currentModuleData,
//                         comment: e.target.value,
//                       })
//                     }
//                   />
//                 </FormControl>
//               </Grid>

//               <Button mt={4} colorScheme="green" onClick={handleSaveModule}>
//                 ✔ Save Module
//               </Button>
//             </Box>
//           )}

//           {errors.modules && (
//             <Text color="red.500" mb={4}>
//               {errors.modules}
//             </Text>
//           )}

//           {savedModules.map((module, index) => (
//             <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={3}>
//               <Heading size="sm">{module.module_name}</Heading>
//               <Text>Rating: {module.rating}</Text>
//               {module.comment !="" && <Text>Comment: {module.comment}</Text>}

//               <Button
//                 size="sm"
//                 mt={2}
//                 mr={2}
//                 colorScheme="blue"
//                 onClick={() => handleEditModule(index)}
//               >
//                 Edit
//               </Button>

//               <Button
//                 size="sm"
//                 mt={2}
//                 colorScheme="red"
//                 onClick={() => handleDeleteModule(index)}
//               >
//                 Delete
//               </Button>
              
//             </Box>
//           ))}
//           <Text mb={2} fontSize="sm" color="gray.600">
//                 Modules Completed: {savedModules.length} / {ALL_MODULES.length}
//           </Text>

//                 <Button
//                   mt={6}
//                   type="submit"
//                   colorScheme="blue"
//                   isLoading={loading}
//                 >
//                   {editingId ? "Update Feedback" : "Submit Feedback"}
//                 </Button>
//               </form>
//             </TabPanel>

//             {/* ================= TAB 2 LIST ================= */}

//             <TabPanel>
//               <Heading mb={6}>Feedback List</Heading>

//               <Table>
//                 <Thead>
//                   <Tr>
//                     <Th>ID</Th>
//                     <Th>Patient</Th>
//                     <Th>Service</Th>
//                     <Th>Rating</Th>
//                     <Th>Actions</Th>
//                   </Tr>
//                 </Thead>
//                 <Tbody>
//                   {feedbackList.map((item) => (
//                     <Tr key={item.feedback_id}>
//                       <Td>{item.feedback_id}</Td>
//                       <Td>{item.patient_name}</Td>
//                       <Td>{item.service_type}</Td>
//                       <Td>{item.overall_rating}</Td>
//                       <Td>
//                         <Button size="xs" colorScheme="orange" mr={2} onClick={()=>handleView(item)}>
//                           View
//                         </Button>
//                         <Button colorScheme="blue" size="xs" mr={2} onClick={()=>handleEdit(item)}>
//                           Edit
//                         </Button>
//                         <Button
//                           size="xs"
//                           colorScheme="red"
//                           onClick={()=>handleDelete(item.feedback_id)}
//                         >
//                           Delete
//                         </Button>
//                       </Td>
//                     </Tr>
//                   ))}
//                 </Tbody>
//               </Table>

//               {viewData && (
//                 <Box mt={6} p={4} borderWidth="1px">
//                   <Heading size="sm">Feedback Details</Heading>
//                   <Text>Patient: {viewData.patient_name}</Text>
//                   <Text>Overall Rating: {viewData.overall_rating}</Text>
//                   <Text>Comments: {viewData.feedback_comments}</Text>

//                   <Divider my={3} />

//                   {viewData.module_ratings.map((m,i)=>(
//                     <Text key={i}>
//                       {m.module_name} - {m.rating}
//                     </Text>
//                   ))}
//                 </Box>
//               )}
//             </TabPanel>

//           </TabPanels>
//         </Tabs>
//       </Box>
//     </Flex>
//   );
// }

// export default PatientFeedback;



























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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  DrawerFooter,
  Badge
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

function PatientFeedback() {
  const toast = useToast();

  const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [availableModules, setAvailableModules] = useState(ALL_MODULES);
  const [editingIndex, setEditingIndex] = useState(null);
  const [savedModules, setSavedModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [currentModuleData, setCurrentModuleData] = useState({
    rating: "",
    comment: "",
  });

   useEffect(() => {
  if (savedModules.length === ALL_MODULES.length) {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.modules;
      return updated;
    });
  }
}, [savedModules]);


  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",
    service_type: "",
    rating: "",
    consent_flag: "",
    feedback_comments: "",
  });
 

  const [errors, setErrors] = useState({});

  /* ================= FETCH ALL FEEDBACK ================= */

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("http://localhost:3000/feedback/getFeedback");
      const data = await res.json();
      if (data.success) {
        setFeedbackList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /* ================= FORM HANDLERS ================= */

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
    setSavedModules([]);
    setSelectedModule("");
    setEditingId(null);
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  /* ================= MODULE LOGIC ================= */

  

   const handleSelectModule = (e) => {
    setSelectedModule(e.target.value);
    setCurrentModuleData({ rating: "", comment: "" });
    setEditingIndex(null);
  };

  const handleSaveModule = () => {
    if (!selectedModule || !currentModuleData.rating ) {
      toast({
        title: "Fill rating",
        status: "error",
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

      setAvailableModules(
        availableModules.filter((m) => m !== selectedModule)
      );
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

 
  /* ================= VALIDATION ================= */

  const validate = () => {
    let newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = "Required";
    if (!formData.patient_name) newErrors.patient_name = "Required";
    if (!formData.admission_id) newErrors.admission_id = "Required";
    if (!formData.service_type) newErrors.service_type = "Required";
    if (!formData.rating) newErrors.rating = "Required";
    if (!formData.consent_flag) newErrors.consent_flag = "Required";

    if (savedModules.length !== ALL_MODULES.length) {
      newErrors.modules = "All modules must be completed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const url = editingId
      ? `http://localhost:3000/feedback/updateFeedback/${editingId}`
      : "http://localhost:3000/feedback/postFeedback";


    const method = editingId ? "PUT" : "POST";


    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          feedback_mode: "Online",
          module_ratings: savedModules,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast({
          title: editingId
            ? "Feedback Updated"
            : "Feedback Submitted",
          status: "success",
        });

        resetForm();
        fetchFeedbacks();
        setActiveTab(1);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast({ title: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= VIEW / EDIT / DELETE ================= */

  const handleView = (data) => {
    setViewData(data);
  };

  const handleEdit = (data) => {
    setEditingId(data.feedback_id);
    setFormData({
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      admission_id: data.admission_id,
      service_type: data.service_type,
      rating: data.overall_rating,
      consent_flag: data.consent_flag ? "Yes" : "No",
      feedback_comments: data.feedback_comments,
    });

    setSavedModules(data.module_ratings);
    setActiveTab(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;

    const res = await fetch(
      `http://localhost:3000/feedback/deleteFeedback/${id}`,
      { method: "DELETE" }
    );

    const result = await res.json();

    if (result.success) {
      toast({ title: "Deleted successfully", status: "success" });
      fetchFeedbacks();
    }
  };

  /* ================= UI ================= */

return (
  <>
    <Flex p={6} bg="gray.100" minH="100vh">
      <Box ml="250px" w="100%" bg="white" p={8} borderRadius="lg" boxShadow="lg">
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Feedback Form</Tab>
            <Tab>Feedback List</Tab>
          </TabList>

          <TabPanels>

            {/* ================= TAB 1 FORM ================= */}

            <TabPanel>
              <Heading mb={6}>
                {editingId ? "Edit Feedback" : "Patient Feedback"}
              </Heading>

              <form onSubmit={handleSubmit}>
                <Grid templateColumns="repeat(2,1fr)" gap={6}>
                  <FormControl isRequired isInvalid={errors.patient_id}>
                    <FormLabel>Patient ID</FormLabel>
                    <Input
                      name="patient_id"
                      value={formData.patient_id}
                      onChange={handleNumberChange}
                    />
                    <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.patient_name}>
                    <FormLabel>Patient Name</FormLabel>
                    <Input
                      name="patient_name"
                      value={formData.patient_name}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.admission_id}>
                    <FormLabel>Admission ID</FormLabel>
                    <Input
                      name="admission_id"
                      value={formData.admission_id}
                      onChange={handleNumberChange}
                    />
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.service_type}>
                    <FormLabel>Service Type</FormLabel>
                    <Select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      placeholder="Select"
                    >
                      <option value="OPD">OPD</option>
                      <option value="IPD">IPD</option>
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Pharmacy">Pharmacy</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.rating}>
                    <FormLabel>Overall Rating</FormLabel>
                    <Select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      placeholder="Select"
                    >
                      {[1,2,3,4,5].map(n=>(
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired isInvalid={errors.consent_flag}>
                    <FormLabel>Consent</FormLabel>
                    <Select
                      name="consent_flag"
                      value={formData.consent_flag}
                      onChange={handleChange}
                      placeholder="Select"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Select>
                  </FormControl>
                  <FormControl gridColumn="span 2">
                  <FormLabel>Overall Comments</FormLabel>
                  <Textarea
                    name="feedback_comments"
                    value={formData.feedback_comments}
                    onChange={handleChange}
                    placeholder="Write your overall feedback..."
                  />
                </FormControl>
                </Grid>

                <Divider my={6} />

                <Heading size="md">Module Feedback</Heading>

                 <FormControl mb={4}>
            <FormLabel>Select Module</FormLabel>
            <Select
              placeholder="Choose Module"
              value={selectedModule}
              onChange={handleSelectModule}
            >
              {availableModules.map((module, index) => (
                <option key={index} value={module}>
                  {module}
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedModule && (
            <Box p={5} borderWidth="1px" borderRadius="md" bg="gray.50" mb={5}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    value={currentModuleData.rating}
                    onChange={(e) =>
                      setCurrentModuleData({
                        ...currentModuleData,
                        rating: e.target.value,
                      })
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

                <FormControl >
                  <FormLabel>Comment</FormLabel>
                  <Input
                    value={currentModuleData.comment}
                    onChange={(e) =>
                      setCurrentModuleData({
                        ...currentModuleData,
                        comment: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </Grid>

              <Button mt={4} colorScheme="green" onClick={handleSaveModule}>
                ✔ Save Module
              </Button>
            </Box>
          )}

          {errors.modules && (
            <Text color="red.500" mb={4}>
              {errors.modules}
            </Text>
          )}

          {savedModules.map((module, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={3}>
              <Heading size="sm">{module.module_name}</Heading>
              <Text>Rating: {module.rating}</Text>
              {module.comment !="" && <Text>Comment: {module.comment}</Text>}

              <Button
                size="sm"
                mt={2}
                mr={2}
                colorScheme="blue"
                onClick={() => handleEditModule(index)}
              >
                Edit
              </Button>

              <Button
                size="sm"
                mt={2}
                colorScheme="red"
                onClick={() => handleDeleteModule(index)}
              >
                Delete
              </Button>
              
            </Box>
          ))}
          <Text mb={2} fontSize="sm" color="gray.600">
                Modules Completed: {savedModules.length} / {ALL_MODULES.length}
          </Text>

                <Button
                  mt={6}
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                >
                  {editingId ? "Update Feedback" : "Submit Feedback"}
                </Button>
              </form>
            </TabPanel>

            {/* ================= TAB 2 LIST ================= */}

            <TabPanel>
              <Heading mb={6}>Feedback List</Heading>

              <Table>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Patient</Th>
                    <Th>Service</Th>
                    <Th>Rating</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {feedbackList.map((item) => (
                    <Tr key={item.feedback_id}>
                      <Td>{item.feedback_id}</Td>
                      <Td>{item.patient_name}</Td>
                      <Td>{item.service_type}</Td>
                      <Td>{item.overall_rating}</Td>
                      <Td>
                        <Button size="xs" colorScheme="orange" mr={2} onClick={()=>handleView(item)}>
                          View
                        </Button>
                        <Button colorScheme="blue" size="xs" mr={2} onClick={()=>handleEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={()=>handleDelete(item.feedback_id)}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Box>
    </Flex>

    <Drawer
  isOpen={!!viewData}
  placement="right"
  onClose={() => setViewData(null)}
  size="md"
>
  <DrawerOverlay />

  <DrawerContent>
    <DrawerCloseButton />
    <DrawerHeader borderBottomWidth="1px">
      Feedback Summary
    </DrawerHeader>

    <DrawerBody>

      {/* Patient Info */}
      <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
        <Heading size="sm" mb={3}>Patient Information</Heading>

        <Flex justify="space-between" mb={2}>
          <Text fontWeight="bold">Patient ID:</Text>
          <Text>{viewData?.patient_id}</Text>
        </Flex>

        <Flex justify="space-between" mb={2}>
          <Text fontWeight="bold">Patient Name:</Text>
          <Text>{viewData?.patient_name}</Text>
        </Flex>

        <Flex justify="space-between" mb={2}>
          <Text fontWeight="bold">Admission ID:</Text>
          <Text>{viewData?.admission_id}</Text>
        </Flex>

        <Flex justify="space-between">
          <Text fontWeight="bold">Service Type:</Text>
          <Badge colorScheme="blue">
            {viewData?.service_type}
          </Badge>
        </Flex>
      </Box>

      {/* Overall Rating */}
      <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
        <Heading size="sm" mb={3}>Overall Rating</Heading>

        <Flex align="center" gap={2}>
          {[1,2,3,4,5].map((star) => (
            <StarIcon
              key={star}
              color={star <= viewData?.overall_rating ? "yellow.400" : "gray.300"}
            />
          ))}
          <Text fontWeight="bold">
            ({viewData?.rating}/5)
          </Text>
        </Flex>

        <Text mt={3}>
          {viewData?.feedback_comments || "No overall comments provided."}
        </Text>
      </Box>

      {/* Module Ratings */}
      <Box>
        <Heading size="sm" mb={3}>Module Ratings</Heading>

        {viewData?.module_ratings?.length > 0 ? (
          viewData.module_ratings.map((module, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              mb={3}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold">{module.module_name}</Text>
                <Flex>
                  {[1,2,3,4,5].map((star) => (
                    <StarIcon
                      key={star}
                      boxSize={3}
                      color={star <= module.rating ? "yellow.400" : "gray.300"}
                    />
                  ))}
                </Flex>
              </Flex>

              <Text fontSize="sm" color="gray.600">
                {module.comment || "No comment provided."}
              </Text>
            </Box>
          ))
        ) : (
          <Text color="gray.500">
            No module ratings available.
          </Text>
        )}
      </Box>

    </DrawerBody>

    <DrawerFooter borderTopWidth="1px">
      <Button
        variant="outline"
        mr={3}
        onClick={() => setViewData(null)}
      >
        Close
      </Button>
    </DrawerFooter>

  </DrawerContent>
</Drawer>
  </>
);
}

export default PatientFeedback;

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
//   Drawer,
//   DrawerOverlay,
//   DrawerContent,
//   DrawerHeader,
//   DrawerBody,
//   DrawerCloseButton,
//   DrawerFooter,
//   Badge,
//   Checkbox
// } from "@chakra-ui/react";
// import { StarIcon } from "@chakra-ui/icons";

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
//   const [includeModules, setIncludeModules] = useState(false);
//   const [currentModuleData, setCurrentModuleData] = useState({
//     rating: 0,
//     comment: "",
//   });


// useEffect(() => {
//   if (!includeModules) {
//     setErrors((prev) => {
//       const updated = { ...prev };
//       delete updated.modules;
//       return updated;
//     });
//   }
// }, [includeModules]);

//   const [formData, setFormData] = useState({
//     patient_id: "",
//     patient_name: "",
//     admission_id: "",
//     service_type: "",
//     rating: 0,
//     consent_flag: false,
//     feedback_comments: "",
//   });

//   const [errors, setErrors] = useState({});


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

//   const resetForm = () => {
//     setFormData({
//       patient_id: "",
//       patient_name: "",
//       admission_id: "",
//       service_type: "",
//       rating: 0,
//       consent_flag: false,
//       feedback_comments: "",
//     });
//     setSavedModules([]);
//     setSelectedModule("");
//     setEditingId(null);
//     setErrors({});
//     setIncludeModules(false);
//     setAvailableModules(ALL_MODULES);
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleNumberChange = (e) => {
//     if (/^\d*$/.test(e.target.value)) {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };


//   const handleSelectModule = (e) => {
//     setSelectedModule(e.target.value);
//     setCurrentModuleData({ rating: "", comment: "" });
//     setEditingIndex(null);
//   };

//   const handleSaveModule = () => {
//   if (!selectedModule || !currentModuleData.rating) {
//     toast({
//       title: "Fill rating",
//       status: "error",
//       duration: 2000,
//     });
//     return;
//   }

//   let updatedModules;

//   if (editingIndex !== null) {
//     updatedModules = [...savedModules];
//     updatedModules[editingIndex] = {
//       module_name: selectedModule,
//       ...currentModuleData,
//     };
//     setEditingIndex(null);
//   } else {
//     updatedModules = [
//       ...savedModules,
//       { module_name: selectedModule, ...currentModuleData },
//     ];
//     setAvailableModules(
//       availableModules.filter((m) => m !== selectedModule)
//     );
//   }

//   setSavedModules(updatedModules);

//   if (updatedModules.length > 0) {
//     setErrors((prev) => {
//       const updated = { ...prev };
//       delete updated.modules;
//       return updated;
//     });
//   }

//   setSelectedModule("");
//   setCurrentModuleData({ rating: "", comment: "" });
// };

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


//   const validate = () => {
//     let newErrors = {};

//     if (!formData.patient_id) newErrors.patient_id = "Required";
//     if (!formData.patient_name) newErrors.patient_name = "Required";
//     if (!formData.admission_id) newErrors.admission_id = "Required";
//     if (!formData.service_type) newErrors.service_type = "Required";
//     if (!formData.rating) newErrors.rating = "Required";
//     if (!formData.consent_flag) newErrors.consent_flag = "Consent must be given";

//     if (includeModules && savedModules.length === 0) {
//   newErrors.modules = "Add at least one module feedback";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);

//     const url = editingId
//       ? `http://localhost:3000/feedback/updateFeedback/${editingId}`
//       : "http://localhost:3000/feedback/postFeedback";

//     const method = editingId ? "PUT" : "POST";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...formData,
//           feedback_mode: "Online",
//           module_ratings: includeModules ? savedModules : [],
//         }),
//       });

//       const result = await res.json();
//       console.log(result);

//       if (result.success) {
//         toast({
//           title: editingId ? "Feedback Updated" : "Feedback Submitted",
//           status: "success",
//         });

//         if (editingId) {
//           setFeedbackList((prev) =>
//             prev.map((item) =>
//               item.feedback_id === editingId ? result.data : item
//             )
//           );
//         } else {
//           setFeedbackList((prev) => [
//             result.data,
//             ...prev,

//           ]);
//         }

//         resetForm();
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


//   const handleView = (data) => {
//     setViewData(data);
//   };

//     const handleEdit = (data) => {
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

//     // ✅ IMPORTANT
//     setSavedModules(data.module_ratings || []);

//     const usedModules = (data.module_ratings || []).map(
//       (m) => m.module_name
//     );

//     setAvailableModules(
//       ALL_MODULES.filter((m) => !usedModules.includes(m))
//     );

//     setIncludeModules(
//       data.module_ratings && data.module_ratings.length > 0
//     );

//     setActiveTab(0);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this feedback?")) return;

//     const res = await fetch(
//       `http://localhost:3000/feedback/deleteFeedback/${id}`,
//       { method: "DELETE" },
//     );

//     const result = await res.json();

//     if (result.success) {
//       toast({ title: "Deleted successfully", status: "success" });
//       setFeedbackList((prev) => prev.filter((item) => item.feedback_id !== id));
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <>
//       <Flex p={6} bg="gray.100" minH="100vh">
//         <Box
//           ml="250px"
//           w="100%"
//           bg="white"
//           p={8}
//           borderRadius="lg"
//           boxShadow="lg"
//         >
//           <Tabs index={activeTab} onChange={setActiveTab}>
//             <TabList>
//               <Tab>Feedback Form</Tab>
//               <Tab>Feedback List</Tab>
//             </TabList>

//             <TabPanels>
//               {/* ================= TAB 1 FORM ================= */}

//               <TabPanel>
//                 <Heading mb={6}>
//                   {editingId ? "Edit Feedback" : "Patient Feedback"}
//                 </Heading>

//                 <form onSubmit={handleSubmit}>
//                   <Grid templateColumns="repeat(2,1fr)" gap={6}>
//                     <FormControl isRequired isInvalid={errors.patient_id}>
//                       <FormLabel>Patient ID</FormLabel>
//                       <Input
//                         name="patient_id"
//                         value={formData.patient_id}
//                         onChange={handleNumberChange}
//                       />
//                       <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
//                     </FormControl>

//                     <FormControl isRequired isInvalid={errors.patient_name}>
//                       <FormLabel>Patient Name</FormLabel>
//                       <Input
//                         name="patient_name"
//                         value={formData.patient_name}
//                         onChange={handleChange}
//                       />
//                       <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
//                     </FormControl>

//                     <FormControl isRequired isInvalid={errors.admission_id}>
//                       <FormLabel>Admission ID</FormLabel>
//                       <Input
//                         name="admission_id"
//                         value={formData.admission_id}
//                         onChange={handleNumberChange}
//                       />
//                     </FormControl>

//                     <FormControl isRequired isInvalid={errors.service_type}>
//                       <FormLabel>Service Type</FormLabel>
//                       <Select
//                         name="service_type"
//                         value={formData.service_type}
//                         onChange={handleChange}
//                         placeholder="Select"
//                       >
//                         <option value="OPD">OPD</option>
//                         <option value="IPD">IPD</option>
//                         <option value="Diagnostic">Diagnostic</option>
//                         <option value="Pharmacy">Pharmacy</option>
//                       </Select>
//                     </FormControl>

//                     <FormControl isRequired isInvalid={errors.rating}>
//                         <FormLabel mb={3}>Overall Rating</FormLabel>

//                         <Flex
//                           ml={2}              // left margin
//                           gap={3}             // spacing between stars
//                           align="center"
//                         >
//                           {[1, 2, 3, 4, 5].map((star) => (
//                             <StarIcon
//                               key={star}
//                               boxSize={7}      // slightly larger for better UI
//                               cursor="pointer"
//                               color={
//                                 star <= formData.rating
//                                   ? "yellow.400"
//                                   : "gray.300"
//                               }
//                               onClick={() =>
//                                 setFormData({ ...formData, rating: star })
//                               }
//                               _hover={{
//                                 transform: "scale(1.2)",
//                               }}
//                               transition="0.2s"
//                             />
//                           ))}
//                         </Flex>

//                         <FormErrorMessage>{errors.rating}</FormErrorMessage>
//                       </FormControl>
//                       <FormControl
//                         isRequired
//                         isInvalid={errors.consent_flag}
//                         display="flex"
//                         flexDirection="column"
//                         justifyContent="center"
//                       >
//                         <FormLabel mb={2}>Consent</FormLabel>

//                         <Checkbox
//                           size="lg"
//                           isChecked={formData.consent_flag === true}
//                           onChange={(e) =>
//                             setFormData({
//                               ...formData,
//                               consent_flag: e.target.checked,
//                             })
//                           }
//                         >
//                           I agree to provide feedback and allow usage of this data
//                         </Checkbox>

//                         <FormErrorMessage>{errors.consent_flag}</FormErrorMessage>
//                       </FormControl>
//                     <FormControl gridColumn="span 2">
//                       <FormLabel>Overall Comments</FormLabel>
//                       <Textarea
//                         name="feedback_comments"
//                         value={formData.feedback_comments}
//                         onChange={handleChange}
//                         placeholder="Write your overall feedback..."
//                       />
//                       </FormControl>
//                       <FormControl mt={4}>
//                         <FormLabel>Do you want to provide module-wise feedback?</FormLabel>
//                         <Flex gap={8} align="center">
//                         <Flex align="center" gap={2}>
//                           <input
//                             type="radio"
//                             name="includeModules"
//                             checked={includeModules === true}
//                             onChange={() => setIncludeModules(true)}
//                           />
//                           <Text>Yes</Text>
//                         </Flex>

//                         <Flex align="center" gap={2}>
//                           <input
//                             type="radio"
//                             name="includeModules"
//                             checked={includeModules === false}
//                             onChange={() => setIncludeModules(false)}
//                           />
//                           <Text>No</Text>
//                         </Flex>
//                       </Flex>
//                       </FormControl>
                      
                  
//                   </Grid>

//                   <Divider my={6} />
                  
//                   {includeModules && (
//                     <>
//                       <Heading size="md">Module Feedback</Heading>

//                       <FormControl mb={4}>
//                         <FormLabel>Select Module</FormLabel>
//                         <Select
//                           placeholder="Choose Module"
//                           value={selectedModule}
//                           onChange={handleSelectModule}
//                         >
//                           {availableModules.map((module, index) => (
//                             <option key={index} value={module}>
//                               {module}
//                             </option>
//                           ))}
//                         </Select>
//                       </FormControl>

//                       {selectedModule && (
//                         <Box
//                           p={5}
//                           borderWidth="1px"
//                           borderRadius="md"
//                           bg="gray.50"
//                           mb={5}
//                         >
//                           <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//               <FormControl isRequired>
//                 <FormLabel>Rating</FormLabel>

//                 <Flex>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <StarIcon
//                       key={star}
//                       boxSize={5}
//                       cursor="pointer"
//                       mr={1}
//                       color={
//                         star <= currentModuleData.rating
//                           ? "yellow.400"
//                           : "gray.300"
//                       }
//                       onClick={() =>
//                         setCurrentModuleData({
//                           ...currentModuleData,
//                           rating: star,
//                         })
//                       }
//                       _hover={{ transform: "scale(1.2)" }}
//                       transition="0.2s"
//                     />
//                   ))}
//                 </Flex>
//               </FormControl>

//                             <FormControl>
//                               <FormLabel>Comment</FormLabel>
//                               <Input
//                                 value={currentModuleData.comment}
//                                 onChange={(e) =>
//                                   setCurrentModuleData({
//                                     ...currentModuleData,
//                                     comment: e.target.value,
//                                   })
//                                 }
//                               />
//                             </FormControl>
//                           </Grid>

//                           <Button
//                             mt={4}
//                             colorScheme="green"
//                             onClick={handleSaveModule}
//                           >
//                             ✔ Save Module
//                           </Button>
//                         </Box>
//                       )}

//                       {errors.modules && (
//                         <Text color="red.500" mb={4}>
//                           {errors.modules}
//                         </Text>
//                       )}

//                       {savedModules.map((module, index) => (
//                         <Box
//                           key={index}
//                           p={4}
//                           borderWidth="1px"
//                           borderRadius="md"
//                           mb={3}
//                         >
//                           <Heading size="sm">{module.module_name}</Heading>
//                           <Text>Rating: {module.rating}</Text>
//                           {module.comment != "" && (
//                             <Text>Comment: {module.comment}</Text>
//                           )}

//                           <Button
//                             size="sm"
//                             mt={2}
//                             mr={2}
//                             colorScheme="blue"
//                             onClick={() => handleEditModule(index)}
//                           >
//                             Edit
//                           </Button>

//                           <Button
//                             size="sm"
//                             mt={2}
//                             colorScheme="red"
//                             onClick={() => handleDeleteModule(index)}
//                           >
//                             Delete
//                           </Button>
//                         </Box>
//                       ))}
//                       <Text mb={2} fontSize="sm" color="gray.600">
//                         Modules Completed: {savedModules.length} /{" "}
//                         {ALL_MODULES.length}
//                       </Text>
//                     </>
//                   )}
                    

//                   <Button
//                     mt={6}
//                     type="submit"
//                     colorScheme="blue"
//                     isLoading={loading}
//                   >
//                     {editingId ? "Update Feedback" : "Submit Feedback"}
//                   </Button>
//                 </form>
//               </TabPanel>

//               {/* ================= TAB 2 LIST ================= */}

//               <TabPanel>
//                 <Heading mb={6}>Feedback List</Heading>

//                 <Table>
//                   <Thead>
//                     <Tr bg="blue.50">
//                       <Th>ID</Th>
//                       <Th>Patient</Th>
//                       <Th>Service</Th>
//                       <Th>Rating</Th>
//                       <Th>Actions</Th>
//                     </Tr>
//                   </Thead>
//                   <Tbody>
//                     {feedbackList.map((item) => (
//                       <Tr key={item.feedback_id}>
//                         <Td>{item.feedback_id}</Td>
//                         <Td>{item.patient_name}</Td>
//                         <Td>{item.service_type}</Td>
//                         <Td>{item.overall_rating}</Td>
//                         <Td>
//                           <Button
//                             size="xs"
//                             colorScheme="orange"
//                             mr={2}
//                             onClick={() => handleView(item)}
//                           >
//                             View
//                           </Button>
//                           <Button
//                             colorScheme="blue"
//                             size="xs"
//                             mr={2}
//                             onClick={() => handleEdit(item)}
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             size="xs"
//                             colorScheme="red"
//                             onClick={() => handleDelete(item.feedback_id)}
//                           >
//                             Delete
//                           </Button>
//                         </Td>
//                       </Tr>
//                     ))}
//                   </Tbody>
//                 </Table>
//               </TabPanel>
//             </TabPanels>
//           </Tabs>
//         </Box>
//       </Flex>

//       <Drawer
//         isOpen={!!viewData}
//         placement="right"
//         onClose={() => setViewData(null)}
//         size="md"
//       >
//         <DrawerOverlay />

//         <DrawerContent>
//           <DrawerCloseButton />
//           <DrawerHeader borderBottomWidth="1px">Feedback Summary</DrawerHeader>

//           <DrawerBody>
//             {/* Patient Info */}
//             <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
//               <Heading size="sm" mb={3}>
//                 Patient Information
//               </Heading>

//               <Flex justify="space-between" mb={2}>
//                 <Text fontWeight="bold">Patient ID:</Text>
//                 <Text>{viewData?.patient_id}</Text>
//               </Flex>

//               <Flex justify="space-between" mb={2}>
//                 <Text fontWeight="bold">Patient Name:</Text>
//                 <Text>{viewData?.patient_name}</Text>
//               </Flex>

//               <Flex justify="space-between" mb={2}>
//                 <Text fontWeight="bold">Admission ID:</Text>
//                 <Text>{viewData?.admission_id}</Text>
//               </Flex>

//               <Flex justify="space-between">
//                 <Text fontWeight="bold">Service Type:</Text>
//                 <Badge colorScheme="blue">{viewData?.service_type}</Badge>
//               </Flex>
//             </Box>

//             <Box p={5} borderWidth="1px" borderRadius="lg" mb={4}>
//               <Heading size="sm" mb={4}>
//                 Overall Feedback
//               </Heading>

//               {/* Rating */}
//               <Flex align="center" gap={2} mb={5}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <StarIcon
//                     key={star}
//                     boxSize={5}
//                     color={
//                       star <= viewData?.overall_rating
//                         ? "yellow.400"
//                         : "gray.300"
//                     }
//                   />
//                 ))}
//                 <Text fontWeight="bold">({viewData?.overall_rating}/5)</Text>
//               </Flex>

//               {/* Overall Comments Section */}
//               <Box mb={5}>
//                 <Heading size="xs" mb={2} color="gray.600">
//                   Overall Comments
//                 </Heading>

//                 <Box bg="gray.50" p={3} borderRadius="md">
//                   <Text fontSize="sm" color="gray.700">
//                     {viewData?.feedback_comments?.trim()
//                       ? viewData.feedback_comments
//                       : "No overall comments provided."}
//                   </Text>
//                 </Box>
//               </Box>

//               {/* Consent */}
//               <Flex justify="space-between" align="center">
//                 <Text fontWeight="medium">Consent</Text>
//                 <Badge
//                   colorScheme={viewData?.consent_flag ? "green" : "red"}
//                   px={3}
//                   py={1}
//                   borderRadius="full"
//                 >
//                   {viewData?.consent_flag ? "Given" : "Not Given"}
//                 </Badge>
//               </Flex>
//             </Box>
//             {/* Module Ratings */}
//             <Box>
//               <Heading size="sm" mb={3}>
//                 Module Ratings
//               </Heading>

//               {viewData?.module_ratings?.length > 0 ? (
//                 viewData.module_ratings.map((module, index) => (
//                   <Box
//                     key={index}
//                     p={4}
//                     borderWidth="1px"
//                     borderRadius="lg"
//                     mb={3}
//                   >
//                     <Flex justify="space-between" align="center" mb={2}>
//                       <Text fontWeight="bold">{module.module_name}</Text>
//                       <Flex>
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <StarIcon
//                             key={star}
//                             boxSize={3}
//                             color={
//                               star <= module.rating ? "yellow.400" : "gray.300"
//                             }
//                           />
//                         ))}
//                       </Flex>
//                     </Flex>

//                     <Text fontSize="sm" color="gray.600">
//                       {module.comment || "No comment provided."}
//                     </Text>
//                   </Box>
//                 ))
//               ) : (
//                 <Text color="gray.500">No module ratings available.</Text>
//               )}
//             </Box>
//           </DrawerBody>

//           <DrawerFooter borderTopWidth="1px">
//             <Button variant="outline" mr={3} onClick={() => setViewData(null)}>
//               Close
//             </Button>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }

// export default PatientFeedback;




















// FeedbackForm.jsx   //corrected code with UI modifications in sidebar
// import { useState, useEffect } from "react";
// import {
//   Box,
//   Heading,
//   Input,
//   Select,
//   Textarea,
//   Button,
//   Grid,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   Divider,
//   Flex,
//   Text,
//   Checkbox,
//   useToast,
// } from "@chakra-ui/react";
// import { StarIcon } from "@chakra-ui/icons";
// import { useLocation, useNavigate } from "react-router-dom";

// const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];

// function FeedbackForm() {
//   const toast = useToast();

//   const [loading, setLoading] = useState(false);
//   const [includeModules, setIncludeModules] = useState(false);
//   const [savedModules, setSavedModules] = useState([]);
//   const [availableModules, setAvailableModules] = useState(ALL_MODULES);
//   const [selectedModule, setSelectedModule] = useState("");
//   const [editingIndex, setEditingIndex] = useState(null);

//   const [currentModuleData, setCurrentModuleData] = useState({
//     rating: 0,
//     comment: "",
//   });

//   const location = useLocation();
//   const navigate = useNavigate();
//   const editData = location.state?.editData;
//   const [formData, setFormData] = useState({
//     patient_id: "",
//     patient_name: "",
//     admission_id: "",
//     service_type: "",
//     rating: 0,
//     consent_flag: false,
//     feedback_comments: "",
//   });

//   const [errors, setErrors] = useState({});
  
//   /* ================= LOAD EDIT DATA ================= */

//   useEffect(() => {
//     if (!editData) return;

//     setFormData({
//       patient_id: editData.patient_id,
//       patient_name: editData.patient_name,
//       admission_id: editData.admission_id,
//       service_type: editData.service_type,
//       rating: editData.overall_rating,
//       consent_flag: editData.consent_flag,
//       feedback_comments: editData.feedback_comments,
//     },[editData]);

//     setSavedModules(editData.module_ratings || []);

//     const used = (editData.module_ratings || []).map(
//       (m) => m.module_name
//     );

//     setAvailableModules(ALL_MODULES.filter((m) => !used.includes(m)));

//     setIncludeModules(
//       editData.module_ratings && editData.module_ratings.length > 0
//     );
//   }, [editData]);

//   /* ================= HANDLERS ================= */

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleNumberChange = (e) => {
//     if (/^\d*$/.test(e.target.value)) {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };

//   const validate = () => {
//     let newErrors = {};

//     if (!formData.patient_id) newErrors.patient_id = "Required";
//     if (!formData.patient_name) newErrors.patient_name = "Required";
//     if (!formData.admission_id) newErrors.admission_id = "Required";
//     if (!formData.service_type) newErrors.service_type = "Required";
//     if (!formData.rating) newErrors.rating = "Required";
//     if (!formData.consent_flag)
//       newErrors.consent_flag = "Consent required";

//     if (includeModules && savedModules.length === 0)
//       newErrors.modules = "Add at least one module";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSaveModule = () => {
//     if (!selectedModule || !currentModuleData.rating) {
//       toast({ title: "Provide module rating", status: "error" });
//       return;
//     }

//     let updated;

//     if (editingIndex !== null) {
//       updated = [...savedModules];
//       updated[editingIndex] = {
//         module_name: selectedModule,
//         ...currentModuleData,
//       };
//       setEditingIndex(null);
//     } else {
//       updated = [
//         ...savedModules,
//         { module_name: selectedModule, ...currentModuleData },
//       ];
//       setAvailableModules(
//         availableModules.filter((m) => m !== selectedModule)
//       );
//     }

//     setSavedModules(updated);
//     setSelectedModule("");
//     setCurrentModuleData({ rating: 0, comment: "" });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setLoading(true);

//     const url = editData
//       ? `http://localhost:3000/feedback/updateFeedback/${editData.feedback_id}`
//       : "http://localhost:3000/feedback/postFeedback";

//     const method = editData ? "PUT" : "POST";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...formData,
//           feedback_mode: "Online",
//           module_ratings: includeModules ? savedModules : [],
//         }),
//       });

//       const result = await res.json();

//       if (!result.success) throw new Error(result.message);

//       toast({
//         title: editData ? "Updated" : "Submitted",
//         status: "success",
//       });
//       navigate("/feedback-list")
//       setFormData({
//         patient_id: "",
//         patient_name: "",
//         admission_id: "",
//         service_type: "",
//         rating: 0,
//         consent_flag: false,
//         feedback_comments: "",
//       });
//       setSavedModules([]);
//       setIncludeModules(false);
//     } catch (err) {
//       toast({ title: err.message, status: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */

//   const handleSelectModule = (e) => {
//     setSelectedModule(e.target.value);
//     setCurrentModuleData({ rating: 0, comment: "" });
//     setEditingIndex(null);
//   };

//   const handleEditModule = (index) => {
//     const module = savedModules[index];
//     setSelectedModule(module.module_name);
//     setCurrentModuleData({ rating: module.rating, comment: module.comment });
//     setEditingIndex(index);
//   };

//   const handleDeleteModule = (index) => {
//     const deleted = savedModules[index];
//     setSavedModules(savedModules.filter((_, i) => i !== index));
//     setAvailableModules([...availableModules, deleted.module_name]);
//   };

//   return (
//     <Box ml="350px" bg="white" p={8} borderRadius="lg" boxShadow="lg">
//       <Heading mb={6}>
//         {editData ? "Edit Feedback" : "Patient Feedback"}
//       </Heading>

//       <form onSubmit={handleSubmit}>
//         <Grid templateColumns="repeat(2,1fr)" gap={6}>
//           <FormControl isRequired isInvalid={errors.patient_id}>
//             <FormLabel>Patient ID</FormLabel>
//             <Input
//               name="patient_id"
//               value={formData.patient_id}
//               onChange={handleNumberChange} />
//             <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
//           </FormControl>

//           <FormControl isRequired isInvalid={errors.patient_name}>
//             <FormLabel>Patient Name</FormLabel>
//             <Input
//               name="patient_name"
//               value={formData.patient_name}
//               onChange={handleChange} />
//             <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
//           </FormControl>

//           <FormControl isRequired isInvalid={errors.admission_id}>
//             <FormLabel>Admission ID</FormLabel>
//             <Input
//               name="admission_id"
//               value={formData.admission_id}
//               onChange={handleNumberChange} />
//             <FormErrorMessage>{errors.admission_id}</FormErrorMessage>
//           </FormControl>

//           <FormControl isRequired isInvalid={errors.service_type}>
//             <FormLabel>Service Type</FormLabel>
//             <Select
//               name="service_type"
//               value={formData.service_type}
//               onChange={handleChange}
//               placeholder="Select">
//               <option value="OPD">OPD</option>
//               <option value="IPD">IPD</option>
//               <option value="Diagnostic">Diagnostic</option>
//               <option value="Pharmacy">Pharmacy</option>
//             </Select>
//             <FormErrorMessage>{errors.service_type}</FormErrorMessage>
//           </FormControl>

//           <FormControl isRequired isInvalid={errors.rating}>
//             <FormLabel>Overall Rating</FormLabel>
//             <Flex gap={3}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <StarIcon
//                   key={star}
//                   boxSize={6}
//                   cursor="pointer"
//                   color={star <= formData.rating
//                     ? "yellow.400"
//                     : "gray.300"}
//                   onClick={() => setFormData({ ...formData, rating: star })} />
//               ))}
//             </Flex>
//             <FormErrorMessage>{errors.rating}</FormErrorMessage>
//           </FormControl>

//           <FormControl isRequired isInvalid={errors.consent_flag}>
//             <FormLabel>Consent</FormLabel>
//             <Checkbox
//               isChecked={formData.consent_flag}
//               onChange={(e) => setFormData({
//                 ...formData,
//                 consent_flag: e.target.checked,
//               })}
//             >
//               I agree to provide feedback
//             </Checkbox>
//             <FormErrorMessage>{errors.consent_flag}</FormErrorMessage>
//           </FormControl>

//           <FormControl gridColumn="span 2">
//             <FormLabel>Overall Comments</FormLabel>
//             <Textarea
//               name="feedback_comments"
//               value={formData.feedback_comments}
//               onChange={handleChange} />
//           </FormControl>

//           <FormControl gridColumn="span 2" mt={4}>
//             <FormLabel>Do you want to provide module-wise feedback?</FormLabel>
//             <Flex gap={8} align="center">
//               <Flex align="center" gap={2}>
//                 <input
//                   type="radio"
//                   name="includeModules"
//                   checked={includeModules === true}
//                   onChange={() => setIncludeModules(true)} />
//                 <Text>Yes</Text>
//               </Flex>

//               <Flex align="center" gap={2}>
//                 <input
//                   type="radio"
//                   name="includeModules"
//                   checked={includeModules === false}
//                   onChange={() => setIncludeModules(false)} />
//                 <Text>No</Text>
//               </Flex>
//             </Flex>
//           </FormControl>
//         </Grid>

//         <Divider my={6} />

//         {includeModules && (
//           <>
//             <Heading size="md">Module Feedback</Heading>

//             <FormControl mb={4}>
//               <FormLabel>Select Module</FormLabel>
//               <Select
//                 placeholder="Choose Module"
//                 value={selectedModule}
//                 onChange={handleSelectModule}
//               >
//                 {availableModules.map((module, index) => (
//                   <option key={index} value={module}>
//                     {module}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             {selectedModule && (
//               <Box
//                 p={5}
//                 borderWidth="1px"
//                 borderRadius="md"
//                 bg="gray.50"
//                 mb={5}
//               >
//                 <Grid templateColumns="repeat(2, 1fr)" gap={4}>
//                   <FormControl isRequired>
//                     <FormLabel>Rating</FormLabel>

//                     <Flex>
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <StarIcon
//                           key={star}
//                           boxSize={5}
//                           cursor="pointer"
//                           mr={1}
//                           color={
//                             star <= currentModuleData.rating
//                               ? "yellow.400"
//                               : "gray.300"
//                           }
//                           onClick={() =>
//                             setCurrentModuleData({
//                               ...currentModuleData,
//                               rating: star,
//                             })
//                           }
//                           _hover={{ transform: "scale(1.2)" }}
//                           transition="0.2s"
//                         />
//                       ))}
//                     </Flex>
//                   </FormControl>

//                   <FormControl>
//                     <FormLabel>Comment</FormLabel>
//                     <Input
//                       value={currentModuleData.comment}
//                       onChange={(e) =>
//                         setCurrentModuleData({
//                           ...currentModuleData,
//                           comment: e.target.value,
//                         })
//                       }
//                     />
//                   </FormControl>
//                 </Grid>

//                 <Button
//                   mt={4}
//                   colorScheme="green"
//                   onClick={handleSaveModule}
//                 >
//                   ✔ Save Module
//                 </Button>
//               </Box>
//             )}

//             {errors.modules && (
//               <Text color="red.500" mb={4}>
//                 {errors.modules}
//               </Text>
//             )}

//             {savedModules.map((module, index) => (
//               <Box
//                 key={index}
//                 p={4}
//                 borderWidth="1px"
//                 borderRadius="md"
//                 mb={3}
//               >
//                 <Heading size="sm">{module.module_name}</Heading>
//                 <Text>Rating: {module.rating}</Text>
//                 {module.comment !== "" && (
//                   <Text>Comment: {module.comment}</Text>
//                 )}

//                 <Button
//                   size="sm"
//                   mt={2}
//                   mr={2}
//                   colorScheme="blue"
//                   onClick={() => handleEditModule(index)}
//                 >
//                   Edit
//                 </Button>

//                 <Button
//                   size="sm"
//                   mt={2}
//                   colorScheme="red"
//                   onClick={() => handleDeleteModule(index)}
//                 >
//                   Delete
//                 </Button>
//               </Box>
//             ))}
//             <Text mb={2} fontSize="sm" color="gray.600">
//               Modules Completed: {savedModules.length} / {ALL_MODULES.length}
//             </Text>
//           </>
//         )}

//         <Button
//           mt={6}
//           type="submit"
//           colorScheme="blue"
//           isLoading={loading}
//         >
//           {editData ? "Update Feedback" : "Submit Feedback"}
//         </Button>
//         {editData && <Button onClick={() => navigate("/feedback-list")}
//           mt={6}
//           ml="20px"
//           type="submit"
//           colorScheme="red"
//           isLoading={loading}
//           >
//             Cancel
//           </Button>}
//       </form>
//     </Box>

//   );
// }


// export default FeedbackForm;






import { useState, useEffect } from "react";
import {
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Grid, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  FormErrorMessage, 
  Flex, 
  Checkbox, 
  Textarea, 
  RadioGroup, 
  Radio, 
  Divider, 
  Button, 
  IconButton, 
  Progress, 
  Badge,
  useToast
} from "@chakra-ui/react";
import { StarIcon,EditIcon, DeleteIcon,PlusSquareIcon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";

const ALL_MODULES = ["Registration", "Doctor Consultation", "Billing"];

function FeedbackForm() {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [includeModules, setIncludeModules] = useState(false);
  const [savedModules, setSavedModules] = useState([]);
  const [availableModules, setAvailableModules] = useState(ALL_MODULES);
  const [selectedModule, setSelectedModule] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);

  const [currentModuleData, setCurrentModuleData] = useState({
    rating: 0,
    comment: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.editData;
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    admission_id: "",
    service_type: "",
    rating: 0,
    consent_flag: false,
    feedback_comments: "",
  });

  const [errors, setErrors] = useState({});
  
  /* ================= LOAD EDIT DATA ================= */

  useEffect(() => {
    if (!editData) return;

    setFormData({
      patient_id: editData.patient_id||"",
      patient_name: editData.patient_name||"",
      admission_id: editData.admission_id||"",
      service_type: editData.service_type||"",
      rating: editData.overall_rating||0,
      consent_flag: !!editData.consent_flag,
      feedback_comments: editData.feedback_comments||"",
    },[editData]);

    setSavedModules(editData.module_ratings || []);

    const used = (editData.module_ratings || []).map(
      (m) => m.module_name
    );

    setAvailableModules(ALL_MODULES.filter((m) => !used.includes(m)));

    setIncludeModules(
      editData.module_ratings && editData.module_ratings.length > 0
    );
  }, [editData]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNumberChange = (e) => {
    if (/^\d*$/.test(e.target.value)) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.patient_id) newErrors.patient_id = "Required";
    if (!formData.patient_name) newErrors.patient_name = "Required";
    if (!formData.admission_id) newErrors.admission_id = "Required";
    if (!formData.service_type) newErrors.service_type = "Required";
    if (!formData.rating) newErrors.rating = "Required";
    if (!formData.consent_flag)
      newErrors.consent_flag = "Consent required";

    if (includeModules && savedModules.length === 0)
      newErrors.modules = "Add at least one module";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveModule = () => {
    if (!selectedModule || !currentModuleData.rating) {
      toast({ title: "Provide module rating", status: "error" });
      return;
    }

    let updated;

    if (editingIndex !== null) {
      updated = [...savedModules];
      updated[editingIndex] = {
        module_name: selectedModule,
        ...currentModuleData,
      };
      setEditingIndex(null);
    } else {
      updated = [
        ...savedModules,
        { module_name: selectedModule, ...currentModuleData },
      ];
      setAvailableModules(
        availableModules.filter((m) => m !== selectedModule)
      );
    }

    setSavedModules(updated);
    if (updated.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.modules;
        return newErrors;
      });
    }
    setSelectedModule("");
    setCurrentModuleData({ rating: 0, comment: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    const url = editData
      ? `http://localhost:3000/feedback/updateFeedback/${editData.feedback_id}`
      : "http://localhost:3000/feedback/postFeedback";

    const method = editData ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          feedback_mode: "Online",
          module_ratings: includeModules ? savedModules : [],
        }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      toast({
        title: editData ? "Updated" : "Submitted",
        status: "success",
      });
      navigate("/feedback-list")
      setFormData({
        patient_id: "",
        patient_name: "",
        admission_id: "",
        service_type: "",
        rating: 0,
        consent_flag: false,
        feedback_comments: "",
      });
      setSavedModules([]);
      setIncludeModules(false);
    } catch (err) {
      toast({ title: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  const handleSelectModule = (e) => {
    setSelectedModule(e.target.value);
    setCurrentModuleData({ rating: 0, comment: "" });
    setEditingIndex(null);
  };

  const handleEditModule = (index) => {
    const module = savedModules[index];
    setSelectedModule(module.module_name);
    setCurrentModuleData({ rating: module.rating, comment: module.comment });
    setEditingIndex(index);
  };

  const handleDeleteModule = (index) => {
    const deleted = savedModules[index];
    setSavedModules(savedModules.filter((_, i) => i !== index));
    setAvailableModules([...availableModules, deleted.module_name]);
  };

  return (
    <>
    <Box 
  ml="350px" 
  bg="white" 
  p={10} 
  borderRadius="2xl" 
  boxShadow="0 10px 30px rgba(0,0,0,0.08)" 
  border="1px" 
  borderColor="gray.50"
>
  {/* Header Section */}
  <VStack align="start" spacing={1} mb={8}>
    <Heading size="lg" color="blue.700" fontWeight="800" letterSpacing="tight">
      {editData ? "Update Patient Record" : "Patient Experience Feedback"}
    </Heading>
    <Box h="4px" w="60px" bg="teal.400" borderRadius="full" />
    <Text color="gray.500" fontSize="sm" mt={2}>
      Your feedback helps us provide world-class healthcare services.
    </Text>
  </VStack>

  <form onSubmit={handleSubmit}>
    <Grid templateColumns="repeat(2, 1fr)" gap={8}>
      {/* Patient ID */}
      <FormControl isRequired isInvalid={errors.patient_id}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Patient Identifier
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="patient_id"
          value={formData.patient_id}
          onChange={handleNumberChange}
          placeholder="e.g. 100234"
        />
        <FormErrorMessage>{errors.patient_id}</FormErrorMessage>
      </FormControl>

      {/* Patient Name */}
      <FormControl isRequired isInvalid={errors.patient_name}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Full Name
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="patient_name"
          value={formData.patient_name}
          onChange={handleChange}
          placeholder="John Doe"
        />
        <FormErrorMessage>{errors.patient_name}</FormErrorMessage>
      </FormControl>

      {/* Admission ID */}
      <FormControl isRequired isInvalid={errors.admission_id}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Admission ID
        </FormLabel>
        <Input
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="admission_id"
          value={formData.admission_id}
          onChange={handleNumberChange}
        />
        <FormErrorMessage>{errors.admission_id}</FormErrorMessage>
      </FormControl>

      {/* Service Type */}
      <FormControl isRequired isInvalid={errors.service_type}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Department/Service
        </FormLabel>
        <Select
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="service_type"
          value={formData.service_type}
          onChange={handleChange}
          placeholder="Select Service"
        >
          <option value="OPD">Outpatient (OPD)</option>
          <option value="IPD">Inpatient (IPD)</option>
          <option value="Diagnostic">Diagnostic Services</option>
          <option value="Pharmacy">Pharmacy</option>
        </Select>
        <FormErrorMessage>{errors.service_type}</FormErrorMessage>
      </FormControl>

      {/* Rating & Consent */}
      <FormControl isRequired isInvalid={errors.rating}>
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Overall Satisfaction
        </FormLabel>
        <Flex gap={2} p={2} bg="gray.50" borderRadius="md" w="fit-content">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              boxSize={6}
              cursor="pointer"
              color={star <= formData.rating ? "orange.400" : "gray.300"}
              onClick={() => setFormData({ ...formData, rating: star })}
              transition="0.2s"
              _hover={{ transform: "scale(1.2)" }}
            />
          ))}
        </Flex>
      </FormControl>

      <FormControl isRequired isInvalid={errors.consent_flag} alignSelf="end">
        <Checkbox
          colorScheme="teal"
          size="lg"
          isChecked={formData.consent_flag}
          onChange={(e) => setFormData({ ...formData, consent_flag: e.target.checked })}
        >
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Authorized to record this feedback
          </Text>
        </Checkbox>
      </FormControl>

      <FormControl gridColumn="span 2">
        <FormLabel fontSize="xs" textTransform="uppercase" fontWeight="bold" color="gray.600" mb={2}>
          Additional Observations
        </FormLabel>
        <Textarea
          bg="gray.50"
          border="none"
          _focus={{ bg: "white", boxShadow: "0 0 0 2px #3182ce" }}
          name="feedback_comments"
          value={formData.feedback_comments??""}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
    </Grid>

    {/* Toggle Section */}
    <Box mt={10} p={5} borderRadius="xl" bg="teal.50" border="1px dashed" borderColor="teal.200">
      <Flex justify="space-between" align="center">
        <HStack>
          <Box p={2} bg="teal.500" borderRadius="lg" color="white">
            <PlusSquareIcon />
          </Box>
          <Text fontWeight="bold" color="teal.800">Module-wise detailed analysis?</Text>
        </HStack>
        <RadioGroup onChange={(val) => setIncludeModules(val === "true")} value={includeModules.toString()}>
          <HStack spacing={6}>
            <Radio value="true" colorScheme="teal">Yes</Radio>
            <Radio value="false" colorScheme="teal">No</Radio>
          </HStack>
        </RadioGroup>
      </Flex>
    </Box>

    {includeModules && (
      <VStack spacing={6} mt={6} p={6} bg="gray.50" borderRadius="xl">
        <FormControl isInvalid={!!errors.modules}>
          <FormLabel fontSize="sm" fontWeight="bold">Specific Department/Module</FormLabel>
          <Select bg="white" value={selectedModule} onChange={handleSelectModule} placeholder="Select module">
            {availableModules.map((m, i) => <option key={i} value={m}>{m}</option>)}
          </Select>
        </FormControl>

        {selectedModule && (
          <Box w="full" p={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" boxShadow="sm">
             <Grid templateColumns="1fr 2fr" gap={6} alignItems="end">
                <Box>
                  <Text fontSize="xs" fontWeight="bold" mb={2}>Rating</Text>
                  <HStack>
                    {[1,2,3,4,5].map(s => (
                      <StarIcon key={s} cursor="pointer" color={s <= currentModuleData.rating ? "orange.400" : "gray.200"} 
                      onClick={() => setCurrentModuleData({...currentModuleData, rating: s})} />
                    ))}
                  </HStack>
                </Box>
                <Input variant="flushed" placeholder="Specific notes..." value={currentModuleData.comment}
                  onChange={(e) => setCurrentModuleData({...currentModuleData, comment: e.target.value})} />
             </Grid>
             <Button mt={4} colorScheme="teal" size="sm" variant="ghost" onClick={handleSaveModule}>
                + Confirm Module Rating
             </Button>
          </Box>
        )}

        {/* Saved Items List */}
        <VStack w="full" spacing={3}>
          {savedModules.map((m, i) => (
            <Flex key={i} w="full" p={4} bg="white" borderRadius="lg" align="center" justify="space-between" border="1px solid" borderColor="gray.100">
               <HStack spacing={4}>
                  <Badge colorScheme="teal" variant="subtle" px={2}>{m.module_name}</Badge>
                  <Text fontSize="sm" fontWeight="bold">⭐ {m.rating}</Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{m.comment}</Text>
               </HStack>
               <HStack>
                 <IconButton size="xs" icon={<EditIcon />} aria-label="Edit" onClick={() => handleEditModule(i)} />
                 <IconButton size="xs" colorScheme="red" variant="ghost" icon={<DeleteIcon />} aria-label="Delete" onClick={() => handleDeleteModule(i)} />
               </HStack>
            </Flex>
          ))}
        </VStack>

        <Box w="full">
            <Progress value={(savedModules.length / ALL_MODULES.length) * 100} size="xs" borderRadius="full" colorScheme="teal" mb={1} />
            <Text fontSize="10px" textAlign="right" fontWeight="bold" color="gray.400">
                AUDIT PROGRESS: {savedModules.length}/{ALL_MODULES.length}
            </Text>
        </Box>
      </VStack>
    )}

    {/* Footer Actions */}
    <HStack spacing={4} mt={12}>
      <Button
        h="55px"
        px={12}
        colorScheme="blue"
        bg="blue.700"
        _hover={{ bg: "blue.800" }}
        type="submit"
        isLoading={loading}
        borderRadius="xl"
      >
        {editData ? "Confirm Changes" : "Finalize Feedback"}
      </Button>
      {editData && (
        <Button variant="ghost" colorScheme="red" h="55px" px={8} onClick={() => navigate("/feedback-list")}>
          Discard Edits
        </Button>
      )}
    </HStack>
  </form>
</Box>
    </>
  )
}


export default FeedbackForm;

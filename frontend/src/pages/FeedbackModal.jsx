// import { useState, useEffect } from "react";
// import {
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   ModalFooter,
//   Button,
//   VStack,
//   Textarea,
//   Text,
//   Box,
//   HStack,
//   useToast,
//   FormControl,
//   FormLabel,
//   FormErrorMessage,
//   Alert,
//   AlertIcon,
//   Spinner,
//   Flex
// } from "@chakra-ui/react";
// import { StarIcon } from "@chakra-ui/icons";
// import { useNavigate } from "react-router-dom";
// function FeedbackModal({ isOpen, onClose, complaint, onSuccess }) {
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [existingFeedback, setExistingFeedback] = useState(null);
//   const [checkingFeedback, setCheckingFeedback] = useState(true);
//   const toast = useToast();
//   const navigate=useNavigate()
//   const token = localStorage.getItem("token");

//   // Check if feedback already exists when modal opens
//   useEffect(() => {
//     if (isOpen && complaint) {
//       checkExistingFeedback();
//     }
//   }, [isOpen, complaint]);

//   const checkExistingFeedback = async () => {
//     setCheckingFeedback(true);
//     try {
//       const res = await fetch(
//         `http://localhost:3000/complaints/get-feedback/${complaint.complaint_id}`,
//         {
//           headers: {
//             "Authorization": `Bearer ${token}`
//           }
//         }
//       );

//      if (res.status === 401) {
//         // Token expired or invalid - redirect to login
//         localStorage.clear();
//         toast({
//           title: "Session Expired",
//           description: "Please login again to continue",
//           status: "warning",
//           duration: 3000,
//         });
//         navigate("/patient-login");
//         onClose();
//         return;
//       }
//       const data = await res.json();
//       if (data.success && data.data) {
//         setExistingFeedback(data.data);
//         setRating(data.data.satisfaction_rating);
//         setComment(data.data.comment || "");
//       }
//     } catch (error) {
//       console.error("Error checking feedback:", error);
//     } finally {
//       setCheckingFeedback(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (rating === 0) {
//       toast({
//         title: "Rating Required",
//         description: "Please select a satisfaction rating",
//         status: "warning",
//         duration: 3000,
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:3000/complaints/submit-feedback/${complaint.complaint_id}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             satisfaction_rating: rating,
//             comment: comment.trim() || null
//           })
//         }
//       );

//        if (res.status === 401) {
//         // Token expired or invalid
//         localStorage.clear();
//         toast({
//           title: "Session Expired",
//           description: "Please login again to submit feedback",
//           status: "warning",
//           duration: 3000,
//         });
//         navigate("/patient-login");
//         onClose();
//         return;
//       }
//         if (res.status === 403) {
//         toast({
//           title: "Unauthorized",
//           description: "You can only submit feedback for your own complaints",
//           status: "error",
//           duration: 4000,
//         });
//         navigate("/patient-login");
//         onClose();
//         return;
//     }

//       const data = await res.json();

//       if (data.success) {
//         onSuccess && onSuccess(complaint.complaint_id);
//         onClose();
//         toast({
//           title: "Thank You!",
//           description: "Your feedback has been submitted successfully",
//           status: "success",
//           duration: 4000,
//         });
        
//       } else {
//         toast({
//           title: "Error",
//           description: data.message || "Failed to submit feedback",
//           status: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error submitting feedback:", error);
//       toast({
//         title: "Error",
//         description: "Failed to submit feedback",
//         status: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStars = () => {
//     return (
//       <HStack spacing={2}>
//         {[1, 2, 3, 4, 5].map((star) => (
//           <StarIcon
//             key={star}
//             w={8}
//             h={8}
//             cursor="pointer"
//             color={star <= rating ? "yellow.400" : "gray.300"}
//             onClick={() => !existingFeedback && setRating(star)}
//           />
//         ))}
//       </HStack>
//     );
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
//       <ModalOverlay />
//       <ModalContent>
//         <ModalHeader>
//           {existingFeedback ? "Your Feedback" : "Rate Your Experience"}
//         </ModalHeader>
//         <ModalCloseButton />
        
//         <ModalBody>
//           {checkingFeedback ? (
//             <Flex justify="center" py={8}>
//               <Spinner size="lg" />
//             </Flex>
//           ) : existingFeedback ? (
//             <VStack spacing={4} align="stretch">
//               <Alert status="info" borderRadius="md">
//                 <AlertIcon />
//                 You have already submitted feedback for this complaint.
//               </Alert>
              
//               <Box>
//                 <Text fontWeight="bold" mb={2}>Your Rating:</Text>
//                 <HStack spacing={1}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <StarIcon
//                       key={star}
//                       w={6}
//                       h={6}
//                       color={star <= existingFeedback.satisfaction_rating ? "yellow.400" : "gray.300"}
//                     />
//                   ))}
//                 </HStack>
//               </Box>
              
//               {existingFeedback.comment && (
//                 <Box>
//                   <Text fontWeight="bold" mb={2}>Your Comment:</Text>
//                   <Box bg="gray.50" p={3} borderRadius="md">
//                     <Text>{existingFeedback.comment}</Text>
//                   </Box>
//                 </Box>
//               )}
              
//               <Box>
//                 <Text fontSize="xs" color="gray.500">
//                   Submitted on: {new Date(existingFeedback.submitted_at).toLocaleString()}
//                 </Text>
//               </Box>
//             </VStack>
//           ) : (
//             <VStack spacing={6} align="stretch">
//               <Text fontSize="sm" color="gray.600">
//                 Your feedback helps us improve our service. Please rate your experience with this complaint resolution.
//               </Text>
              
//               <FormControl isRequired>
//                 <FormLabel>Satisfaction Rating</FormLabel>
//                 {renderStars()}
//                 {rating === 0 && (
//                   <Text fontSize="xs" color="red.500" mt={1}>
//                     Please select a rating
//                   </Text>
//                 )}
//               </FormControl>
              
//               <FormControl>
//                 <FormLabel>Comments (Optional)</FormLabel>
//                 <Textarea
//                   placeholder="Share your experience or suggestions..."
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   rows={4}
//                 />
//               </FormControl>
              
//               <Box bg="blue.50" p={3} borderRadius="md">
//                 <Text fontSize="xs" color="blue.600">
//                   <strong>Complaint #{complaint?.ticket_number}</strong> - Resolved on:{" "}
//                   {complaint?.closed_date ? new Date(complaint.closed_date).toLocaleDateString() : "Recently"}
//                 </Text>
//               </Box>
//             </VStack>
//           )}
//         </ModalBody>

//         <ModalFooter>
//           <Button variant="ghost" mr={3} onClick={onClose}>
//             Close
//           </Button>
//           {!existingFeedback && !checkingFeedback && (
//             <Button
//               colorScheme="blue"
//               onClick={handleSubmit}
//               isLoading={loading}
//               isDisabled={rating === 0}
//             >
//               Submit Feedback
//             </Button>
//           )}
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }

// export default FeedbackModal;



import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Textarea,
  Text,
  Box,
  HStack,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Spinner,
  Flex
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

function FeedbackModal({ isOpen, onClose, complaint, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [checkingFeedback, setCheckingFeedback] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen && complaint) {
      checkExistingFeedback();
    }
  }, [isOpen, complaint]);

  const checkExistingFeedback = async () => {
    setCheckingFeedback(true);
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/get-feedback/${complaint.complaint_id}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        toast({
          title: "Session Expired",
          description: "Please login again to continue",
          status: "warning",
          duration: 3000,
        });
        navigate("/patient-login");
        onClose();
        return;
      }

      const data = await res.json();
      
      // FIX: Check if feedback actually exists (not just data.data)
      if (data.success && data.data && data.data.feedback) {
        setExistingFeedback(data.data.feedback);
        setRating(data.data.feedback.satisfaction_rating);
        setComment(data.data.feedback.comment || "");
      } else {
        setExistingFeedback(null);
        setRating(0);
        setComment("");
      }
    } catch (error) {
      console.error("Error checking feedback:", error);
      setExistingFeedback(null);
    } finally {
      setCheckingFeedback(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a satisfaction rating",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/submit-feedback/${complaint.complaint_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            satisfaction_rating: rating,
            comment: comment.trim() || null
          })
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        toast({
          title: "Session Expired",
          description: "Please login again to submit feedback",
          status: "warning",
          duration: 3000,
        });
        navigate("/patient-login");
        onClose();
        return;
      }

      if (res.status === 403) {
        toast({
          title: "Unauthorized",
          description: "You can only submit feedback for your own complaints",
          status: "error",
          duration: 4000,
        });
        navigate("/patient-login");
        onClose();
        return;
      }

      const data = await res.json();

      if (data.success) {
        onSuccess && onSuccess(complaint.complaint_id);
        toast({
          title: "Thank You!",
          description: "Your feedback has been submitted successfully",
          status: "success",
          duration: 4000,
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit feedback",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <HStack spacing={2}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            w={8}
            h={8}
            cursor={!existingFeedback ? "pointer" : "default"}
            color={star <= rating ? "yellow.400" : "gray.300"}
            onClick={() => !existingFeedback && setRating(star)}
          />
        ))}
      </HStack>
    );
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Date not available";
    return date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {existingFeedback ? "Your Feedback" : "Rate Your Experience"}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {checkingFeedback ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : existingFeedback ? (
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                You have already submitted feedback for this complaint.
              </Alert>
              
              <Box>
                <Text fontWeight="bold" mb={2}>Your Rating:</Text>
                <HStack spacing={1}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      w={6}
                      h={6}
                      color={star <= existingFeedback.satisfaction_rating ? "yellow.400" : "gray.300"}
                    />
                  ))}
                </HStack>
              </Box>
              
              {existingFeedback.comment && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Your Comment:</Text>
                  <Box bg="gray.50" p={3} borderRadius="md">
                    <Text>{existingFeedback.comment}</Text>
                  </Box>
                </Box>
              )}
              
              <Box>
                <Text fontSize="xs" color="gray.500">
                  Submitted on: {formatDate(existingFeedback.submitted_at)}
                </Text>
              </Box>
            </VStack>
          ) : (
            <VStack spacing={6} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Your feedback helps us improve our service. Please rate your experience with this complaint resolution.
              </Text>
              
              <FormControl isRequired>
                <FormLabel>Satisfaction Rating</FormLabel>
                {renderStars()}
                {rating === 0 && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Please select a rating
                  </Text>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel>Comments (Optional)</FormLabel>
                <Textarea
                  placeholder="Share your experience or suggestions..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </FormControl>
              
              <Box bg="blue.50" p={3} borderRadius="md">
                <Text fontSize="xs" color="blue.600">
                  <strong>Complaint #{complaint?.ticket_number}</strong>
                </Text>
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          {!existingFeedback && !checkingFeedback && (
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              isDisabled={rating === 0}
            >
              Submit Feedback
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default FeedbackModal;
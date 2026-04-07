import React, { useState, useEffect } from "react";
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
  HStack,
  Input,
  Text,
  useToast,
  PinInput,
  PinInputField,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Flex,
  Progress,
} from "@chakra-ui/react";
import { FiSend, FiClock, FiRefreshCw, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const OTPVerificationModal = ({ isOpen, onClose, complaint, onSuccess }) => {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const toast = useToast();

  const token = localStorage.getItem("token");
  const employeeId = localStorage.getItem("employee_id");

  // Auto-generate OTP when modal opens
  useEffect(() => {
    if (isOpen && complaint) {
      // Reset state
      setOtpCode("");
      setOtpData(null);
      setTimeLeft(0);
      // Auto-generate OTP
      generateOTP();
    }
  }, [isOpen, complaint]);

  // Timer for OTP expiry
  useEffect(() => {
    if (otpData?.expires_at && !otpData?.is_verified && otpData?.otp_generated) {
      const interval = setInterval(() => {
        const expiry = new Date(otpData.expires_at);
        const now = new Date();
        const diff = Math.floor((expiry - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
          // Auto-refresh OTP when expired
          toast({
            title: "OTP Expired",
            description: "Generating a new OTP for you...",
            status: "warning",
            duration: 3000,
          });
          generateOTP();
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [otpData]);

  const generateOTP = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/generate-otp/${complaint.complaint_id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("employee_id");
        localStorage.removeItem("employee_name");
        window.location.href = "/login";
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setOtpData({
          ...data.data,
          otp_generated: true,
          is_verified: false
        });
        
        const expiry = new Date(data.data.expires_at);
        const now = new Date();
        setTimeLeft(Math.floor((expiry - now) / 1000));
        
        toast({
          title: "OTP Sent",
          description: `OTP has been sent to ${data.data.mobile_number}`,
          status: "success",
          duration: 4000,
        });
      } else {
        toast({
          title: "Failed to Generate OTP",
          description: data.message,
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast({
        title: "Error",
        description: "Failed to generate OTP",
        status: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/resend-otp/${complaint.complaint_id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      const data = await res.json();
      if (data.success) {
        setOtpData({
          ...data.data,
          otp_generated: true,
          is_verified: false
        });
        
        const expiry = new Date(data.data.expires_at);
        const now = new Date();
        setTimeLeft(Math.floor((expiry - now) / 1000));
        setOtpCode("");
        
        toast({
          title: "New OTP Sent",
          description: `A new OTP has been sent to ${data.data.mobile_number}`,
          status: "success",
          duration: 4000,
        });
        
      } else {
        toast({
          title: "Failed to Resend OTP",
          description: data.message,
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to resend OTP",
        status: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        status: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/complaints/verify-otp/${complaint.complaint_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            otp_code: otpCode,
            changed_by: employeeId,
            remarks: "Closed via OTP verification"
          })
        }
      );
      
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success!",
          description: "Complaint closed successfully",
          status: "success",
          duration: 3000,
        });
        onSuccess && onSuccess();
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: data.message,
          status: "error",
          duration: 4000,
        });
        // Clear OTP input on failure
        setOtpCode("");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setOtpCode("");
    setOtpData(null);
    setTimeLeft(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Verify OTP to Close Complaint</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6}>
            {/* Complaint Info */}
            <Alert status="info" borderRadius="md" variant="subtle">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Complaint #{complaint?.ticket_number}</AlertTitle>
                <AlertDescription fontSize="xs">
                  OTP will be sent to the registered mobile number
                </AlertDescription>
              </Box>
            </Alert>

            {isGenerating ? (
              // Loading state
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="blue.500" />
                <Text color="gray.600">Generating OTP...</Text>
              </VStack>
            ) : otpData?.is_verified ? (
              // Already verified state
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertTitle>Complaint Closed</AlertTitle>
                <AlertDescription>
                  This complaint has already been closed.
                </AlertDescription>
              </Alert>
            ) : otpData?.otp_generated ? (
              // OTP generated - show input
              <VStack spacing={4} w="100%">
                {/* Timer Alert */}
                <Alert 
                  status={timeLeft > 0 ? "warning" : "error"} 
                  borderRadius="md"
                  variant="left-accent"
                >
                  <AlertIcon />
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm">
                      {timeLeft > 0 ? "OTP expires in:" : "OTP Expired - Generating new one..."}
                    </Text>
                    {timeLeft > 0 && (
                      <HStack spacing={1}>
                        <FiClock />
                        <Text fontWeight="bold" fontSize="lg">
                          {formatTime(timeLeft)}
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </Alert>

                {/* Progress bar for visual timer */}
                {timeLeft > 0 && (
                  <Progress 
                    value={(timeLeft / 600) * 100} 
                    size="xs" 
                    colorScheme="blue" 
                    width="100%"
                    borderRadius="full"
                  />
                )}

                {/* OTP Input */}
                <Box w="100%">
                  <Text mb={3} fontSize="sm" fontWeight="medium" textAlign="center">
                    Enter 6-digit OTP sent to your mobile
                  </Text>
                  <HStack justify="center" spacing={2}>
                    <PinInput
                      otp
                      size="lg"
                      value={otpCode}
                      onChange={setOtpCode}
                      isDisabled={isLoading || timeLeft === 0}
                      autoFocus
                    >
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                      <PinInputField />
                    </PinInput>
                  </HStack>
                </Box>

                {/* Resend Button */}
                <Button
                  leftIcon={<FiRefreshCw />}
                  variant="link"
                  size="sm"
                  onClick={resendOTP}
                  isDisabled={isResending || isLoading}
                  colorScheme="blue"
                >
                  {isResending ? <Spinner size="xs" mr={2} /> : null}
                  Didn't receive OTP? Resend
                </Button>

                {/* Help Text */}
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  OTP is valid for 10 minutes. You can request a new OTP if needed.
                </Text>
              </VStack>
            ) : (
              // Fallback - should not happen as we auto-generate
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to generate OTP. Please try again.
                </AlertDescription>
                <Button size="sm" mt={3} onClick={generateOTP}>
                  Retry
                </Button>
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          {otpData?.otp_generated && !otpData.is_verified && timeLeft > 0 && (
            <Button
              colorScheme="green"
              onClick={verifyOTP}
              isLoading={isLoading}
              isDisabled={!otpCode || otpCode.length !== 6}
              leftIcon={<FiCheckCircle />}
            >
              Verify & Close
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OTPVerificationModal;
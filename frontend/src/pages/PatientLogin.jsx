import { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  Text,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Container,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/patient-dashboard";

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }
    
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch("http://localhost:3000/patient-login/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Store token and patient data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("patient_id", data.patient.patient_id);
        localStorage.setItem("patient_name", data.patient.patient_name);
        localStorage.setItem("user_role", "patient");
        
        // Clear any existing employee data
        localStorage.removeItem("employee_id");
        localStorage.removeItem("employee_name");

        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.patient.patient_name}!`,
          status: "success",
          duration: 3000,
        });
        
        navigate(from);
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="md">
        <Box bg="white" p={8} borderRadius="2xl" boxShadow="xl">
          <VStack spacing={6}>
            {/* Icon and Title */}
            <Box textAlign="center">
              <Box
                bg="blue.500"
                w="60px"
                h="60px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                margin="0 auto"
                mb={4}
              >
                <Icon as={FiUser} w={8} h={8} color="white" />
              </Box>
              <Heading size="lg" color="gray.800">
                Patient Login
              </Heading>
              <Text color="gray.500" mt={2}>
                Sign in to view and track your complaints
              </Text>
            </Box>

            {/* Login Form */}
            <VStack spacing={4} w="100%">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiMail} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  focusBorderColor="blue.500"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
              </InputGroup>

              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                  focusBorderColor="blue.500"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
              </InputGroup>

              {errorMsg && (
                <Text color="red.500" fontSize="sm" fontWeight="medium">
                  {errorMsg}
                </Text>
              )}

              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={handleLogin}
                isLoading={loading}
                loadingText="Signing in..."
                mt={2}
              >
                Sign In
              </Button>
            </VStack>

            {/* Help Text */}
            <Text fontSize="xs" color="gray.400" textAlign="center">
              Need help? Contact hospital support
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}

export default PatientLogin;
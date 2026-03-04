import { Box, VStack, Button, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCommentDots,
  FaExclamationCircle,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";

function Sidebar() {
  const menuItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Patient Feedback", path: "/feedback", icon: FaCommentDots },
    { name: "Feedback List", path: "/feedback-list", icon: MdFeedback },
    { name: "Patient Complaints", path: "/complaints", icon: FaExclamationCircle },
    { name: "Complaint List", path: "/complaint_list", icon: FaClipboardList },
    { name: "Request (Employee)", path: "/request", icon: FaFileAlt },
    { name: "Employee Records", path: "/employee-records", icon: FaFileAlt },
    { name: "patient register", path: "/patient-register", icon: FaFileAlt },


  ];

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="260px"
      h="100vh"
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
      p={5}
      boxShadow="md"
      zIndex="1000"
      overflowY="auto"
    >
      <Text
        fontSize="xl"
        fontWeight="bold"
        mb={8}
        color="blue.600"
        textAlign="center"
      >
        Hospital Panel
      </Text>

      <VStack spacing={4} align="stretch">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.name}
              as={NavLink}
              to={item.path}
              leftIcon={<Icon />}
              justifyContent="flex-start"
              variant="ghost"
              colorScheme="blue"
              size="md"
              borderRadius="lg"
              _hover={{
                bg: "blue.500",
                color: "white",
              }}
              _activeLink={{
                bg: "blue.600",
                color: "white",
              }}
            >
              {item.name}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
}

export default Sidebar;
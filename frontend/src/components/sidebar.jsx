import { Box, VStack, Button, Text } from "@chakra-ui/react"
import { Link, useLocation } from "react-router-dom"
import { FaHome, FaCommentDots, FaExclamationCircle } from "react-icons/fa"

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Patient Feedback", path: "/feedback", icon: FaCommentDots },
    { name: "Patient Complaints", path: "/complaints", icon: FaExclamationCircle },
  ]

  return (
    <Box
      w="260px"
      h="100vh"
      bg="gray.50"
      borderRight="1px solid"
      borderColor="gray.200"
      p={5}
      boxShadow="md"
    >
      {/* Title */}
      <Text
        fontSize="xl"
        fontWeight="bold"
        mb={8}
        color="blue.600"
        textAlign="center"
      >
        Hospital Panel
      </Text>

      {/* Menu */}
      <VStack spacing={4} align="stretch">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.name}
              as={Link}
              to={item.path}
              leftIcon={<Icon />}
              justifyContent="flex-start"
              variant={location.pathname === item.path ? "solid" : "ghost"}
              colorScheme="blue"
              size="md"
              borderRadius="lg"
            >
              {item.name}
            </Button>
          )
        })}
      </VStack>
    </Box>
  )
}

export default Sidebar
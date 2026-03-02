import { Box } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar"

function Layout() {
  return (
    <Box>
      <Sidebar />

      <Box
        ml="260px"
        h="100vh"
        overflowY="auto"
        p={6}
        bg="gray.100"
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
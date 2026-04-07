import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { NeurologyProvider } from "./context/NeurologyContext.jsx"; // ✅ ADD THIS

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
    <BrowserRouter>
      <NeurologyProvider> {/* ✅ WRAP HERE */}
        <App />
      </NeurologyProvider>
    </BrowserRouter>
  </ChakraProvider>
);
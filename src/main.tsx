import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/sonner"

import App from "./App.tsx";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID as string;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <Toaster theme="light" position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
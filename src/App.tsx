import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/treatments" element={<ProtectedRoute><div>Treatments</div></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute><div>Doctors</div></ProtectedRoute>} />
            <Route path="/consultations" element={<ProtectedRoute><div>Consultations</div></ProtectedRoute>} />
            <Route path="/tour-packages" element={<ProtectedRoute><div>Tour Packages</div></ProtectedRoute>} />
            <Route path="/stays" element={<ProtectedRoute><div>Accommodation</div></ProtectedRoute>} />
            <Route path="/flights" element={<ProtectedRoute><div>Flights</div></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><div>Profile</div></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

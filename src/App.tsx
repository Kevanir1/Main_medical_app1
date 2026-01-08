import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import DoctorRegistration from "./pages/doctor/DoctorRegistration";
import DoctorRegistrationSummary from "./pages/doctor/DoctorRegistrationSummary";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorVisits from "./pages/doctor/DoctorVisits";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import PatientLayout from "./components/layout/PatientLayout";
import PatientRegistration from "./pages/patient/PatientRegistration";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientVisits from "./pages/patient/PatientVisits";
import PatientBooking from "./pages/patient/PatientBooking";
import PatientProfile from "./pages/patient/PatientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />

           {/* Patient registration */}
          <Route path="/patient/register" element={<PatientRegistration />} />
          
          {/* Patient panel routes */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboard />} />
            <Route path="visits" element={<PatientVisits />} />
            <Route path="book" element={<PatientBooking />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
          
          {/* Doctor registration routes */}
          <Route path="/doctor/register" element={<DoctorRegistration />} />
          <Route path="/doctor/register/summary" element={<DoctorRegistrationSummary />} />
          
          {/* Doctor panel routes */}
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<DoctorPatients />} />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          <Route path="/doctor/visits" element={<DoctorVisits />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

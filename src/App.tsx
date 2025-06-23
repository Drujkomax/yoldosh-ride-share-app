
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import WelcomePage from "./pages/WelcomePage";
import RegistrationPage from "./pages/RegistrationPage";
import DriverDashboard from "./pages/DriverDashboard";
import PassengerDashboard from "./pages/PassengerDashboard";
import CreateRide from "./pages/CreateRide";
import SearchRides from "./pages/SearchRides";
import ProfilePage from "./pages/ProfilePage";
import VerificationPage from "./pages/VerificationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/passenger" element={<PassengerDashboard />} />
            <Route path="/create-ride" element={<CreateRide />} />
            <Route path="/search-rides" element={<SearchRides />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

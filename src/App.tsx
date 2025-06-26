
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import WelcomePage from "./pages/WelcomePage";
import DriverDashboard from "./pages/DriverDashboard";
import DriverHomePage from "./pages/DriverHomePage";
import PassengerDashboard from "./pages/PassengerDashboard";
import CreateRide from "./pages/CreateRide";
import EditRide from "./pages/EditRide";
import CreateRequest from "./pages/CreateRequest";
import SearchRides from "./pages/SearchRides";
import SearchRequests from "./pages/SearchRequests";
import RideDetails from "./pages/RideDetails";
import DriverRideDetails from "./pages/DriverRideDetails";
import RequestDetails from "./pages/RequestDetails";
import BookRide from "./pages/BookRide";
import PassengerProfile from "./pages/PassengerProfile";
import ChatPage from "./pages/ChatPage";
import ChatsListPage from "./pages/ChatsListPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import VerificationPage from "./pages/VerificationPage";
import RideHistoryPage from "./pages/RideHistoryPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import RegistrationPage from "./pages/RegistrationPage";
import MyTripsPage from "./pages/MyTripsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/driver" element={<Navigate to="/driver-home" replace />} />
              <Route path="/driver-home" element={<DriverHomePage />} />
              <Route path="/passenger" element={<PassengerDashboard />} />
              <Route path="/create-ride" element={<DriverDashboard />} />
              <Route path="/edit-ride/:id" element={<EditRide />} />
              <Route path="/create-request" element={<CreateRequest />} />
              <Route path="/search-rides" element={<SearchRides />} />
              <Route path="/search-requests" element={<SearchRequests />} />
              <Route path="/ride-details/:id" element={<RideDetails />} />
              <Route path="/driver-ride-details/:id" element={<DriverRideDetails />} />
              <Route path="/request-details/:id" element={<RequestDetails />} />
              <Route path="/book-ride/:id" element={<BookRide />} />
              <Route path="/passenger-profile/:name" element={<PassengerProfile />} />
              <Route path="/chat/:name" element={<ChatPage />} />
              <Route path="/chats" element={<ChatsListPage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/ride-history" element={<RideHistoryPage />} />
              <Route path="/my-reviews" element={<MyReviewsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

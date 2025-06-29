
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from '@/contexts/UserContext';
import Index from "./pages/Index";
import WelcomePage from "./pages/WelcomePage";
import RegistrationPage from "./pages/RegistrationPage";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverHomePage from "./pages/DriverHomePage";
import CreateRequest from "./pages/CreateRequest";
import CreateDriverRide from "./pages/CreateDriverRide";
import SearchRides from "./pages/SearchRides";
import DriverSearchRides from "./pages/DriverSearchRides";
import CreateRide from "./pages/CreateRide";
import SearchRequests from "./pages/SearchRequests";
import BookRide from "./pages/BookRide";
import RideDetails from "./pages/RideDetails";
import DriverRideDetails from "./pages/DriverRideDetails";
import RequestDetails from "./pages/RequestDetails";
import EditRide from "./pages/EditRide";
import MyTripsPage from "./pages/MyTripsPage";
import RideHistoryPage from "./pages/RideHistoryPage";
import ChatsListPage from "./pages/ChatsListPage";
import DriverChatsPage from "./pages/DriverChatsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import PassengerProfile from "./pages/PassengerProfile";
import SettingsPage from "./pages/SettingsPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import VerificationPage from "./pages/VerificationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/passenger" element={<PassengerDashboard />} />
              <Route path="/driver" element={<DriverDashboard />} />
              <Route path="/driver-home" element={<DriverHomePage />} />
              <Route path="/create-request" element={<CreateRequest />} />
              <Route path="/create-driver-ride" element={<CreateDriverRide />} />
              <Route path="/search-rides" element={<SearchRides />} />
              <Route path="/driver-search-rides" element={<DriverSearchRides />} />
              <Route path="/create-ride" element={<CreateRide />} />
              <Route path="/search-requests" element={<SearchRequests />} />
              <Route path="/book-ride/:rideId" element={<BookRide />} />
              <Route path="/ride/:rideId" element={<RideDetails />} />
              <Route path="/driver-ride/:rideId" element={<DriverRideDetails />} />
              <Route path="/request/:requestId" element={<RequestDetails />} />
              <Route path="/edit-ride/:rideId" element={<EditRide />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/ride-history" element={<RideHistoryPage />} />
              <Route path="/chats" element={<ChatsListPage />} />
              <Route path="/driver-chats" element={<DriverChatsPage />} />
              <Route path="/chat/:chatName" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/passenger-profile" element={<PassengerProfile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/my-reviews" element={<MyReviewsPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

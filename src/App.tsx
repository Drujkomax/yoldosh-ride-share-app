import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import OnboardingPage from "./pages/OnboardingPage";
import PassengerSearchPage from "./pages/PassengerSearchPage";
import FullScreenCalendar from "./pages/FullScreenCalendar";
import PassengerCountPage from "./pages/PassengerCountPage";
import SearchRides from "./pages/SearchRides";
import RideDetails from "./pages/RideDetails";
import RideDetailsPage from "./pages/RideDetailsPage";
import BookRide from "./pages/BookRide";
import CreateDriverRide from "./pages/CreateDriverRide";
import MyTripsPage from "./pages/MyTripsPage";
import ChatsListPage from "./pages/ChatsListPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfile from "./pages/UserProfile";
import ManageCarsPage from "./components/ManageCarsPage";
import NotFound from "./pages/NotFound";
import CreateRideWizard from "./pages/CreateRideWizard";
import RideCreationFlow from "./pages/RideCreationFlow";
import RidePublishedPage from "./pages/RidePublishedPage";
import DriverHomePage from "./pages/DriverHomePage";
import DriverReviewsPage from "./pages/DriverReviewsPage";
import SearchFiltersPage from "./pages/SearchFiltersPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/passenger-search" element={<PassengerSearchPage />} />
                <Route path="/full-screen-calendar" element={<FullScreenCalendar />} />
                <Route path="/passenger-count" element={<PassengerCountPage />} />
                <Route path="/search-rides" element={<SearchRides />} />
                <Route path="/passenger" element={<Navigate to="/passenger-search" replace />} />
                <Route path="/ride/:id" element={<RideDetails />} />
                <Route path="/ride-details/:id" element={<RideDetailsPage />} />
                <Route path="/book-ride/:id" element={<BookRide />} />
                <Route path="/create-driver-ride" element={<CreateDriverRide />} />
                <Route path="/my-trips" element={<MyTripsPage />} />
                <Route path="/chats" element={<ChatsListPage />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/manage-cars" element={<ManageCarsPage />} />
                <Route path="/create-ride-wizard" element={<CreateRideWizard />} />
                <Route path="/ride-creation-flow" element={<RideCreationFlow />} />
                <Route path="/ride-published" element={<RidePublishedPage />} />
                <Route path="/driver-home" element={<DriverHomePage />} />
                <Route path="/driver-reviews/:driverId" element={<DriverReviewsPage />} />
                <Route path="/search-filters" element={<SearchFiltersPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

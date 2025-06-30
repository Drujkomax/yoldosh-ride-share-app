
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import OnboardingPage from "./pages/OnboardingPage";
import PassengerSearchPage from "./pages/PassengerSearchPage";
import SearchRides from "./pages/SearchRides";
import RideDetails from "./pages/RideDetails";
import BookRide from "./pages/BookRide";
import CreateDriverRide from "./pages/CreateDriverRide";
import MyTripsPage from "./pages/MyTripsPage";
import ChatsListPage from "./pages/ChatsListPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

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
                <Route path="/search-rides" element={<SearchRides />} />
                <Route path="/passenger" element={<Navigate to="/passenger-search" replace />} />
                <Route path="/ride/:id" element={<RideDetails />} />
                <Route path="/book-ride/:id" element={<BookRide />} />
                <Route path="/create-driver-ride" element={<CreateDriverRide />} />
                <Route path="/my-trips" element={<MyTripsPage />} />
                <Route path="/chats" element={<ChatsListPage />} />
                <Route path="/chat/:chatId" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import ManagerList from "./pages/Managers";
import ClientsList from "./pages/Clients";
import FleetList from "./pages/Fleets";
import TransactionList from "./pages/Transactions";
import ChallanList from "./pages/Challans";
import ChallanPayments from "./pages/ChallanPayments";
import InvoiceList from "./pages/Invoices";
import InvoicePayments from "./pages/SummaryInvoice";
import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryList from "./pages/Category";
import PartnerList from "./pages/Partner";
import CrewList from "./pages/Crews";
import EventList from "./pages/Events";
import BannerList from "./pages/Banners";
import CrewMembersAssignment from "./pages/CrewMembersAssignmentPage";
import BookingList from "./pages/BookingsList";
import SecurityCheckerList from "./pages/SecurityCheckerList";



const queryClient = new QueryClient();
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/managers"
              element={
                <ProtectedRoute>
                  <ManagerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fleets"
              element={
                <ProtectedRoute>
                  <FleetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challans"
              element={
                <ProtectedRoute>
                  <ChallanList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challan-payments/:id"
              element={
                <ProtectedRoute>
                  <ChallanPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sum-invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice-payments/:client_id/:id"
              element={
                <ProtectedRoute>
                  <InvoicePayments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/category"
              element={
                <ProtectedRoute>
                  <CategoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/partner"
              element={
                <ProtectedRoute>
                  <PartnerList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crew-members/:id"
              element={
                <ProtectedRoute>
                  <CrewList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/crew-assignment/:id"
              element={
                <ProtectedRoute>
                  <CrewMembersAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners"
              element={
                <ProtectedRoute>
                  <BannerList />
                </ProtectedRoute>
              }
            />
              <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SecurityCheckerList"
              element={
                <ProtectedRoute>
                  <SecurityCheckerList />
                </ProtectedRoute>
              }
            />

           
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthGuard from "@/components/AuthGuard";
import RootRedirect from "@/components/RootRedirect";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import PublicBooking from "./pages/PublicBooking";
import PublicSlugValidator from "./components/PublicSlugValidator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root redirect - determines where to send user based on their state */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Authentication routes - redirect if already logged in */}
            <Route 
              path="/login" 
              element={
                <AuthGuard>
                  <Login />
                </AuthGuard>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthGuard>
                  <Signup />
                </AuthGuard>
              } 
            />
            
            {/* Onboarding - requires auth but not subscription */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireOnboarding={false} requireSubscription={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Checkout - requires auth and onboarding but not subscription */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute requireSubscription={false}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            
            {/* Dashboard - requires everything */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Public booking - no auth required */}
            <Route 
              path="/b/:companySlug" 
              element={
                <ProtectedRoute requireAuth={false} requireOnboarding={false} requireSubscription={false}>
                  <PublicBooking />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy routes - redirect to new structure */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/company-setup" element={<Navigate to="/onboarding" replace />} />
            
            {/* Direct company slug access - must be last before 404 */}
            <Route 
              path="/:companySlug" 
              element={
                <ProtectedRoute requireAuth={false} requireOnboarding={false} requireSubscription={false}>
                  <PublicSlugValidator />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

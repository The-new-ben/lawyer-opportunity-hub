import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Commissions from "./pages/Commissions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leads" element={
                <ProtectedRoute>
                  <Layout>
                    <Leads />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/clients" element={
                <ProtectedRoute>
                  <Layout>
                    <Clients />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/cases" element={
                <ProtectedRoute>
                  <Layout>
                    <Cases />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <Calendar />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Layout>
                    <Payments />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/commissions" element={
                <ProtectedRoute>
                  <Layout>
                    <Commissions />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { QueryProvider } from "@/providers/QueryProvider";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import Calendar from "./pages/Calendar";
import Payments from "./pages/Payments";
import Commissions from "./pages/Commissions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Features from "./pages/Features";
import Matching from "./pages/Matching";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import LeadsPortal from "./pages/LeadsPortal";
import MeetingScheduler from "./pages/MeetingScheduler";
import RoleDashboard from "./pages/RoleDashboard";
import SupplierLeads from "./pages/SupplierLeads";
import CourtDashboard from "./pages/court/CourtDashboard";
import CourtSessionDetails from "./pages/court/CourtSessionDetails";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import GlobalCourt from "./pages/GlobalCourt";
import Intake from "./pages/Intake";
import HearingJoin from "./pages/HearingJoin";
import GptOssPortal from "./pages/GptOssPortal";
import ChatPortal from "./features/ai/ChatPortal";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/gpt-oss" element={<GptOssPortal />} />
                <Route path="/ai-portal" element={<ChatPortal />} />
                <Route path="/" element={<GlobalCourt />} />
                
                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/intake" element={<Intake />} />
                          <Route path="/live-intake" element={
                            <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                              {React.createElement(() => {
                                const LiveIntake = React.lazy(() => import('@/components/LiveIntake'));
                                return <LiveIntake />;
                              })}
                            </React.Suspense>
                          } />
                          <Route path="/dashboard" element={<RoleDashboard />} />
                          <Route path="/dashboard/lawyer" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                              <Dashboard />
                            </RoleBasedRoute>
                          } />
                          <Route path="/dashboard/admin" element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                              <Dashboard />
                            </RoleBasedRoute>
                          } />
                          <Route path="/supplier/leads" element={
                            <RoleBasedRoute allowedRoles={['supplier', 'admin']}>
                              <SupplierLeads />
                            </RoleBasedRoute>
                          } />
                          <Route path="/leads" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                              <Leads />
                            </RoleBasedRoute>
                          } />
                          <Route path="/leads-portal" element={
                            <RoleBasedRoute allowedRoles={['supplier', 'admin']}>
                              <LeadsPortal />
                            </RoleBasedRoute>
                          } />
                          <Route path="/clients" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                              <Clients />
                            </RoleBasedRoute>
                          } />
                          <Route path="/cases" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin', 'client', 'customer']}>
                              <Cases />
                            </RoleBasedRoute>
                          } />
                          <Route path="/cases/:id" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin', 'client', 'customer']}>
                              <CaseDetails />
                            </RoleBasedRoute>
                          } />
                          <Route path="/calendar" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin', 'client', 'customer']}>
                              <Calendar />
                            </RoleBasedRoute>
                          } />
                          <Route path="/payments" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin', 'client', 'customer']}>
                              <Payments />
                            </RoleBasedRoute>
                          } />
                          <Route path="/commissions" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                              <Commissions />
                            </RoleBasedRoute>
                          } />
                          <Route path="/reports" element={
                            <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                              <Reports />
                            </RoleBasedRoute>
                          } />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/features" element={
                            <RoleBasedRoute allowedRoles={['admin']}>
                              <Features />
                            </RoleBasedRoute>
                          } />
                            <Route path="/matching" element={
                              <RoleBasedRoute allowedRoles={['lawyer', 'admin']}>
                                <Matching />
                              </RoleBasedRoute>
                            } />
                            <Route path="/court" element={
                              <RoleBasedRoute allowedRoles={['admin']}>
                                <CourtDashboard />
                              </RoleBasedRoute>
                            } />
                            <Route path="/court/session/:id" element={
                              <RoleBasedRoute allowedRoles={['admin']}>
                                <CourtSessionDetails />
                              </RoleBasedRoute>
                            } />
                            <Route path="/meeting-scheduler" element={<MeetingScheduler />} />
                            <Route path="/hearing/join" element={<HearingJoin />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
);

export default App;
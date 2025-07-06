import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy } from 'react';
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LazyWrapper, WorkflowLoader, AdminLoader, PageLoader } from '@/components/LazyWrapper';
import Navigation from "./components/Navigation";
import Courses from "./pages/Courses";
import Purchase from "./pages/Purchase";
import Auth from "./pages/Auth";
import PaymentSuccess from "./pages/PaymentSuccess";
import XRPIntegrationTest from "./pages/XRPIntegrationTest";
import TestingReturnUser from "./pages/TestingReturnUser";
import ProductionTestSuite from "./pages/ProductionTestSuite";
import AdvancedTestSuite from "./pages/AdvancedTestSuite";
import CodeQualityTestSuite from "./pages/CodeQualityTestSuite";
import NotFound from "./pages/NotFound";

// Lazy load heavy components
const Index = lazy(() => import('./pages/Index'));
const Admin = lazy(() => import('./pages/Admin'));
const Automation = lazy(() => import('./pages/Automation'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={
            <LazyWrapper fallback={<PageLoader message="Loading TruthHurtz..." />}>
              <Index />
            </LazyWrapper>
          } />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={
            <ProtectedRoute>
              <LazyWrapper fallback={<PageLoader message="Loading course details..." />}>
                <CourseDetail />
              </LazyWrapper>
            </ProtectedRoute>
          } />
          <Route path="/automation" element={
            <ProtectedRoute>
              <LazyWrapper fallback={<WorkflowLoader />}>
                <Automation />
              </LazyWrapper>
            </ProtectedRoute>
          } />
          <Route path="/purchase" element={
            <ProtectedRoute>
              <Purchase />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <LazyWrapper fallback={<AdminLoader />}>
                <Admin />
              </LazyWrapper>
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/xrp-test" element={
            <ProtectedRoute>
              <XRPIntegrationTest />
            </ProtectedRoute>
          } />
          <Route path="/test-return-user" element={<TestingReturnUser />} />
          <Route path="/production-test-suite" element={<ProductionTestSuite />} />
          <Route path="/advanced-test-suite" element={<AdvancedTestSuite />} />
          <Route path="/code-quality-test-suite" element={<CodeQualityTestSuite />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;

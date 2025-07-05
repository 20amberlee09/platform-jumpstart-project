import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Automation from "./pages/Automation";
import Purchase from "./pages/Purchase";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import TestingReturnUser from "./pages/TestingReturnUser";
import ProductionTestSuite from "./pages/ProductionTestSuite";
import AdvancedTestSuite from "./pages/AdvancedTestSuite";
import CodeQualityTestSuite from "./pages/CodeQualityTestSuite";
import NotFound from "./pages/NotFound";

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
          <Route path="/" element={<Index />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
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

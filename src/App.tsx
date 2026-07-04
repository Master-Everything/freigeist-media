import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NewsListing from "./pages/NewsListing";
import ArticlePage from "./pages/ArticlePage";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import ParentNotifier from "./components/ParentNotifier";
import AnimatedPage from "./components/AnimatedPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminPostForm from "./pages/admin/AdminPostForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDocumentation from "./pages/admin/AdminDocumentation";
import AdminChangelog from "./pages/admin/AdminChangelog";
import AdminProject from "./pages/admin/AdminProject";
import AdminWorkSummary from "./pages/admin/AdminWorkSummary";
import AdminEstimate from "./pages/admin/AdminEstimate";
import AdminOnboarding from "./pages/admin/AdminOnboarding";
import AdminEditorGuide from "./pages/admin/AdminEditorGuide";
import AdminFeedback from "./pages/admin/AdminFeedback";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import SetPassword from "./pages/SetPassword";
import RssFeed from "./pages/RssFeed";

const queryClient = new QueryClient();

// Detects invite/recovery tokens or auth errors in the URL hash and redirects to /set-password
const InviteRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (
      hash.includes("type=invite") ||
      hash.includes("type=recovery") ||
      hash.includes("error=access_denied") ||
      hash.includes("error=")
    ) {
      navigate("/set-password", { replace: true, state: { hash } });
    }
  }, [navigate]);

  return null;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatedPage key={location.pathname}>
      <InviteRedirectHandler />
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/news" element={<NewsListing />} />
        <Route path="/news/:id" element={<ArticlePage />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/rss" element={<RssFeed />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />
        <Route path="/admin/posts/:id" element={<ProtectedRoute><AdminPostForm /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/documentation" element={<ProtectedRoute requiredRole="admin"><AdminDocumentation /></ProtectedRoute>} />
        <Route path="/admin/changelog" element={<ProtectedRoute requiredRole="admin"><AdminChangelog /></ProtectedRoute>} />
        <Route path="/admin/project" element={<ProtectedRoute requiredRole="admin"><AdminProject /></ProtectedRoute>} />
        <Route path="/admin/work-summary" element={<ProtectedRoute requiredRole="admin"><AdminWorkSummary /></ProtectedRoute>} />
        <Route path="/admin/estimate" element={<ProtectedRoute requiredRole="admin"><AdminEstimate /></ProtectedRoute>} />
        <Route path="/admin/onboarding" element={<ProtectedRoute requiredRole="admin"><AdminOnboarding /></ProtectedRoute>} />
        <Route path="/admin/guide" element={<ProtectedRoute><AdminEditorGuide /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatedPage>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <ParentNotifier />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import LocationPage from "./pages/LocationPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import LocationsPage from "./pages/admin/LocationsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SitemapIndexPage from "./pages/sitemap/SitemapIndexPage";
import LocationSitemapPage from "./pages/sitemap/LocationSitemapPage";
import PagesSitemapPage from "./pages/sitemap/PagesSitemapPage";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/:categorySlug/:locationSlug" element={<LocationPage />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="locations" element={<LocationsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
            </Route>
            
            <Route path="/sitemap.xml" element={<SitemapIndexPage />} />
            <Route path="/sitemap-pages.xml" element={<PagesSitemapPage />} />
            <Route path="/sitemap-:categorySlug.xml" element={<LocationSitemapPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

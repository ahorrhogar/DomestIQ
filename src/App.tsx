import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import { AdminAuthProvider } from "@/admin/hooks/useAdminAuth";
import { AdminGuard } from "@/admin/components/AdminGuard";
import { AdminLayout } from "@/admin/components/AdminLayout";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import AssistantPage from "./pages/AssistantPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import AdminDeniedPage from "./pages/admin/AdminDeniedPage.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.tsx";
import AdminOffersPage from "./pages/admin/AdminOffersPage.tsx";
import AdminBrandsPage from "./pages/admin/AdminBrandsPage.tsx";
import AdminMerchantsPage from "./pages/admin/AdminMerchantsPage.tsx";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage.tsx";
import AdminImportsPage from "./pages/admin/AdminImportsPage.tsx";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage.tsx";
import AdminAuditPage from "./pages/admin/AdminAuditPage.tsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/categoria/:slug/:subSlug" element={<CategoryPage />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/asistente" element={<AssistantPage />} />
            <Route path="/acerca-de" element={<AboutPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/denegado" element={<AdminDeniedPage />} />

            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="ofertas" element={<AdminOffersPage />} />
                <Route path="marcas" element={<AdminBrandsPage />} />
                <Route path="tiendas" element={<AdminMerchantsPage />} />
                <Route path="categorias" element={<AdminCategoriesPage />} />
                <Route path="importaciones" element={<AdminImportsPage />} />
                <Route path="analitica" element={<AdminAnalyticsPage />} />
                <Route path="auditoria" element={<AdminAuditPage />} />
                <Route path="configuracion" element={<AdminSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
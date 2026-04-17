import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import CookieBanner from "@/components/layout/CookieBanner";
import { AdminAuthProvider } from "@/admin/hooks/useAdminAuth";
import { AdminGuard } from "@/admin/components/AdminGuard";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductPage from "./pages/ProductPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import AssistantPage from "./pages/AssistantPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import CookiesPolicyPage from "./pages/CookiesPolicyPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage.tsx"));
const AdminDeniedPage = lazy(() => import("./pages/admin/AdminDeniedPage.tsx"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage.tsx"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage.tsx"));
const AdminOffersPage = lazy(() => import("./pages/admin/AdminOffersPage.tsx"));
const AdminBrandsPage = lazy(() => import("./pages/admin/AdminBrandsPage.tsx"));
const AdminMerchantsPage = lazy(() => import("./pages/admin/AdminMerchantsPage.tsx"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage.tsx"));
const AdminImportsPage = lazy(() => import("./pages/admin/AdminImportsPage.tsx"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage.tsx"));
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAuditPage.tsx"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage.tsx"));
const ArticlesHubPage = lazy(() => import("./pages/ArticlesHubPage.tsx"));
const AirFryersUnder100GuidePage = lazy(() => import("./pages/blog/AirFryersUnder100GuidePage.tsx"));
const BestSofasQualityPrice2026Page = lazy(() => import("./pages/blog/BestSofasQualityPrice2026Page.tsx"));
const BestStandingFansSummer2026Page = lazy(() => import("./pages/blog/BestStandingFansSummer2026Page.tsx"));
const BestAmazonFansSummer2026Page = lazy(() => import("./pages/blog/BestAmazonFansSummer2026Page.tsx"));
const EditorialArticlePage = lazy(() => import("./pages/blog/EditorialArticlePage.tsx"));

const queryClient = new QueryClient();

function AppRuntime() {
  const { canUseAnalytics } = useCookieConsent();

  return (
    <>
      <BrowserRouter>
        <AdminAuthProvider>
          <ScrollToTop />
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando modulo...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
              <Route path="/categoria/:slug/:subSlug" element={<CategoryPage />} />
              <Route path="/producto/:slug" element={<ProductPage />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/guias" element={<ArticlesHubPage />} />
              <Route path="/blog" element={<ArticlesHubPage />} />
              <Route path="/asistente" element={<AssistantPage />} />
              <Route path="/acerca-de" element={<AboutPage />} />
              <Route path="/cookies" element={<CookiesPolicyPage />} />
              <Route path="/politica-cookies" element={<CookiesPolicyPage />} />
              <Route
                path="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros"
                element={<AirFryersUnder100GuidePage />}
              />
              <Route
                path="/blog/mejores-sofas-calidad-precio-2026"
                element={<BestSofasQualityPrice2026Page />}
              />
              <Route
                path="/blog/mejores-ventiladores-de-pie-para-este-verano-2026"
                element={<BestStandingFansSummer2026Page />}
              />
              <Route
                path="/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026"
                element={<BestAmazonFansSummer2026Page />}
              />
              <Route path="/blog/:slug" element={<EditorialArticlePage />} />

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
          </Suspense>
        </AdminAuthProvider>
      </BrowserRouter>

      <CookieBanner />

      {canUseAnalytics() ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CookieConsentProvider>
        <AppRuntime />
      </CookieConsentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/CookieBanner";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import CompanyAbout from "./pages/CompanyAbout";
import CompanyPress from "./pages/CompanyPress";
import ArticleDetail from "./pages/ArticleDetail";
import PartnersReferral from "./pages/PartnersReferral";
import PartnersBuilders from "./pages/PartnersBuilders";
import PartnersEngineers from "./pages/PartnersEngineers";
import Calculators from "./pages/Calculators";
import Contacts from "./pages/Contacts";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiesPolicy from "./pages/CookiesPolicy";
import SearchPage from "./pages/SearchPage";
import ThankYou from "./pages/ThankYou";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Products */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          
          {/* Projects */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          
          {/* Company */}
          <Route path="/company/about" element={<CompanyAbout />} />
          <Route path="/company/press" element={<CompanyPress />} />
          <Route path="/company/press/:slug" element={<ArticleDetail />} />
          
          {/* Partners */}
          <Route path="/partners/referral" element={<PartnersReferral />} />
          <Route path="/partners/builders" element={<PartnersBuilders />} />
          <Route path="/partners/engineers" element={<PartnersEngineers />} />
          
          {/* Calculators */}
          <Route path="/calculators" element={<Calculators />} />
          
          {/* Contacts */}
          <Route path="/contacts" element={<Contacts />} />
          
          {/* Legal */}
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/cookies" element={<CookiesPolicy />} />
          
          {/* Search */}
          <Route path="/search" element={<SearchPage />} />
          
          {/* Thank you */}
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* Auth & Admin */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

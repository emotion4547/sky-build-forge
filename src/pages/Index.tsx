import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BuildingTypesSection } from "@/components/BuildingTypesSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { StatsSection } from "@/components/StatsSection";
import { LeadForm } from "@/components/LeadForm";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <BuildingTypesSection />
        <BenefitsSection />
        <StatsSection />
        <LeadForm />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

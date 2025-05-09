
import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { SearchSection } from "@/components/home/SearchSection";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProviders } from "@/components/home/FeaturedProviders";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <SearchSection />
      <CategorySection />
      <FeaturedProviders />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </Layout>
  );
};

export default Index;

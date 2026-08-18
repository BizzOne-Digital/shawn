import { getHomepageData } from "@/lib/queries/business";

export const dynamic = "force-dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { NewsWeatherSection } from "@/components/home/news-weather-section";
import { PopularCategories } from "@/components/home/popular-categories";
import { BusinessSection } from "@/components/home/business-section";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { StatsSection } from "@/components/home/stats-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { AdvertisingPromo } from "@/components/home/advertising-promo";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const { categories, sponsored, featured, recent, stats } =
    await getHomepageData();

  return (
    <>
      <HeroSection />
      <NewsWeatherSection />
      <PopularCategories categories={categories} />
      <BusinessSection
        title="Sponsored Businesses"
        subtitle="Featured partners supporting the Buffalo business community"
        businesses={sponsored}
        showSponsoredLabel
        viewAllHref="/search"
      />
      <BusinessSection
        title="Featured Businesses"
        subtitle="Hand-picked local favorites across Western New York"
        businesses={featured}
        viewAllHref="/directory?featured=true"
      />
      <BusinessSection
        title="Recently Added"
        subtitle="New listings from Buffalo-area businesses"
        businesses={recent}
        viewAllHref="/directory?sort=newest"
      />
      <HowItWorksSection />
      <StatsSection stats={stats} />
      <BenefitsSection />
      <AdvertisingPromo />
      <TestimonialsSection />
      <NewsletterSection />
      <CtaSection />
    </>
  );
}
